import { NextResponse } from "next/server";
import { handlePaymentNotification } from "@/app/api/_services/paymentService";
import { 
    updateSubscriptionStatusByPaymentId,
    getUserSubscription,
    cancelUserSubscription
 } from "@/app/api/_services/subscriptionService";
import { getPlanLimitsByPlanId } from "@/app/api/_services/pricingPlanService";
import { getPaymentByOrderId } from "@/app/api/_services/paymentService";

/**
 * Handle payment notification from PayHere
 * 
 * @param {Request} request - The HTTP request object
 * @returns {NextResponse} - Response with status
 */
export async function POST(request) {
    try {
        const contentType = (request.headers.get('content-type') || '').toLowerCase();
        let data = {};
        if (contentType.includes('application/x-www-form-urlencoded')) {
            const bodyText = await request.text();
            const params = new URLSearchParams(bodyText);
            params.forEach((value, key) => { data[key] = value; });
        } else {
            const notificationData = await request.formData();
            for (const [key, value] of notificationData.entries()) {
                data[key] = value;
            }
        }

        console.log('PayHere notify received', {
            order_id: data.order_id,
            status_code: data.status_code,
            payhere_amount: data.payhere_amount,
            payhere_currency: data.payhere_currency,
            has_custom_1: Boolean(data.custom_1),
        });
        
        // Validate required fields
        const requiredFields = [
            'merchant_id', 'order_id', 'payment_id', 
            'payhere_amount', 'payhere_currency', 
            'status_code', 'md5sig'
        ];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                console.error(`Missing required field: ${field}`);
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }
        
        // Check if the order_id exists in the database
        const existingPayment = await getPaymentByOrderId(data.order_id);
        if (!existingPayment.success) {
            console.error(`Payment not found for order ID: ${data.order_id}`);
            return NextResponse.json(
                { error: "Payment not found" },
                { status: 404 }
            );
        }
        
        // Handle the payment notification
        const result = await handlePaymentNotification(data);
        
        if (!result.success) {
            console.error(`Payment notification handling failed: ${result.error}`);
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }
        
        // If payment was successful, update the subscription status
        const payment = result.data;
        
        // Get the internal payment ID
        // First try to use the payment_id from the custom fields
        let internalPaymentId = null;
        
        if (data.custom_1) {
            console.log("Using payment ID from custom_1:", data.custom_1);
            internalPaymentId = data.custom_1;
        } else if (payment && payment._id) {
            console.log("Using payment ID from database:", payment._id.toString());
            internalPaymentId = payment._id.toString();
        } else {
            console.error("No valid payment ID found in notification");
        }
        
        if (data.status_code === "2" && internalPaymentId) {
            //payment successful 
            //cancelling any existing subscriptions before activating new one
            const existingUserSubscription = await getUserSubscription(payment.userId);
            if (existingUserSubscription && !existingUserSubscription.error) {
                if (existingUserSubscription.data.status === 'active') {
                    const cancelResult = await cancelUserSubscription(existingUserSubscription.data._id);
                    if (cancelResult.error) {
                        throw new Error(cancelResult.error);
                    }
                }
            }

            console.log(`Payment successful (status_code=2). Activating subscription for paymentId: ${internalPaymentId}`);
            // Payment is successful - activate the subscription
            const subscriptionResult = await updateSubscriptionStatusByPaymentId(
                internalPaymentId,
                'active'
            );
            
            if (subscriptionResult.error) {
                console.error(`Failed to update subscription: ${subscriptionResult.error}`);
                // Log error but don't fail the request - PayHere should get success response
            } else {
                console.log("Subscription activated successfully:", subscriptionResult.data);
            }
        } else if (['0', '1'].includes(data.status_code)) {
            // Payment pending (0) or failed (1) - keep subscription paused
            await updateSubscriptionStatusByPaymentId(internalPaymentId, 'paused');
        } else if (data.status_code === '-1') {
            // Payment canceled - cancel the subscription
            await updateSubscriptionStatusByPaymentId(internalPaymentId, 'canceled');
        }
        
        // Return success response
        return NextResponse.json(
            { success: true, message: "Payment notification processed successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing payment notification:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ ok: true, message: 'notify endpoint reachable' }, { status: 200 });
}
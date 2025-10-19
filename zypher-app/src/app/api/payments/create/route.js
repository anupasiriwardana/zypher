import { NextResponse } from "next/server";
import {
    createPayment,
    generateOrderId,
    generatePayhereHash
} from "@/app/api/_services/paymentService";
import { getPlanByPlanId } from "@/app/api/_services/pricingPlanService";
import { checkRoleAccess } from "@/app/api/_services/requestValidationService";
import { createUserSubscription } from "@/app/api/_services/subscriptionService";

/**
 * Create a new payment record and prepare PayHere payment data
 */
export async function POST(request) {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    // Check role access
    const allowedRoles = ['primary-user'];
    const accessError = await checkRoleAccess(allowedRoles, role, userId);
    if (accessError) {
        return NextResponse.json(
            { error: accessError.error },
            { status: accessError.status }
        );
    }

    try {
        const { plan_id, isYearly } = await request.json();

        console.log("Received plan_id:", plan_id);

        // Get plan details
        const planResult = await getPlanByPlanId(plan_id);
        if (planResult.error) {
            console.error("Plan not found for ID:", plan_id);
            return NextResponse.json(
                { error: planResult?.error || "Plan not found" },
                { status: 404 }
            );
        }

        const plan = planResult.data;

        // Calculate amount based on billing period
        const amount = isYearly ? plan.yearly_price : plan.monthly_price;
        const currency = (process.env.PAYHERE_CURRENCY || 'LKR').toUpperCase();

        // Create unique order ID
        const orderId = generateOrderId(userId);

        // Create payment description
        const description = `Zypher ${plan.planName} Plan ${isYearly ? 'Yearly' : 'Monthly'} Subscription`;

        // Create payment record
        const paymentResult = await createPayment({
            userId,
            planId: String(plan.plan_id), // Use plan_id from retrieved plan as string type
            amount,
            currency,
            orderId,
            description,
            isYearly
        });

        if (paymentResult.error) {
            return NextResponse.json(
                { error: paymentResult.error || "Failed to create payment" },
                { status: 500 }
            );
        }

        // Create a paused subscription linked to this payment
        const subscription = await createUserSubscription(
            userId,
            plan.plan_id,
            isYearly,
            plan.scanLimit,
            plan.allowCustomRuleRequests,
            paymentResult.data._id
        );

        if (subscription.error) {
            console.error("Failed to create subscription:", subscription.error);
        }

        // Generate PayHere hash
        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const envValue = (process.env.PAYHERE_ENVIRONMENT || 'sandbox').toLowerCase();
        const isLive = envValue === 'live';
        const checkoutUrl = isLive
            ? 'https://www.payhere.lk/pay/checkout'
            : 'https://sandbox.payhere.lk/pay/checkout';
        const hash = generatePayhereHash({
            merchantId,
            orderId,
            amount,
            currency
        });

        // Return payment data for client side processing
        return NextResponse.json({
            success: true,
            data: {
                // client can post this directly
                checkout_url: checkoutUrl,
                environment: isLive ? 'live' : 'sandbox',
                merchant_id: merchantId,
                return_url: process.env.PAYHERE_RETURN_URL,
                cancel_url: process.env.PAYHERE_CANCEL_URL,
                notify_url: process.env.PAYHERE_NOTIFY_URL,
                order_id: orderId,
                items: description,
                amount: Number(amount).toFixed(2),
                currency,
                hash: hash,
                first_name: "Zypher",
                last_name: "User", // This should be replaced with actual user data if available
                email: "user@zypher.com", // This should be replaced with actual user email
                phone: "0771234567", // This should be replaced with actual user phone
                address: "Zypher Inc.",
                city: "Colombo",
                country: "Sri Lanka",
                delivery_address: "N/A",
                delivery_city: "N/A",
                delivery_country: "N/A",
                // Pass internal references using documented custom fields
                custom_1: paymentResult.data._id.toString(), // internal payment id
                custom_2: JSON.stringify({ userId, billing: isYearly ? 'yearly' : 'monthly' })
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error in payment-create route:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
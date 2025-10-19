import crypto from 'crypto';
import Payment from '@/models/Payment';
import connectDB from '@/utils/db';
import { getPlanByPlanId } from './pricingPlanService';

/**
 * Generate the MD5 hash required for PayHere payment requests
 */
export const generatePayhereHash = (paymentData) => {
    const { merchantId, orderId, amount, currency } = paymentData;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';

    // PayHere expected algorithm:
    // md5( merchant_id + order_id + amount(2dp) + currency + md5(merchant_secret).toUpperCase() ).toUpperCase()
    const amt = Number(amount).toFixed(2);
    const cur = String(currency || 'LKR').toUpperCase();
    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

    const hashString = `${merchantId}${orderId}${amt}${cur}${secretHash}`;
    return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
};

/**
 * Create a new payment record in pending state
 */
export const createPayment = async (paymentData) => {
    try {
        await connectDB();

        const {
            userId,
            planId,
            amount,
            currency,
            orderId,
            description,
            isYearly
        } = paymentData;

        console.log("Creating payment with planId:", planId);

        const payment = new Payment({
            userId: userId,
            planId: planId,
            amount: amount,
            currency: currency,
            payhereOrderId: orderId,
            paymentDescription: description,
            isYearly: isYearly,
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await payment.save();

        return {
            success: true,
            data: payment
        };
    } catch (error) {
        console.error("Error creating payment:", error);
        return {
            success: false,
            error: error.message || "Error creating payment"
        };
    }
};

/**
 * Generate a unique order ID for PayHere
 * 
 * @param {string} userId - User ID
 * @returns {string} - Unique order ID
 */
export const generateOrderId = (userId) => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `ZYP-${userId.substring(0, 5)}-${timestamp}-${random}`;
};

/**
 * Handle payment notification from PayHere
 * 
 * @param {Object} notificationData - Notification data from PayHere
 * @returns {Object} - Updated payment record or error
 */
export const handlePaymentNotification = async (notificationData) => {
    try {
        await connectDB();

        const {
            merchant_id,
            order_id,
            payment_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig
        } = notificationData;

        // Verify MD5 hash according to PayHere docs
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
        const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
        const hashString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`;
        const calculatedHash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

        if (calculatedHash !== md5sig) {
            return {
                success: false,
                error: "Invalid hash signature"
            };
        }

        // Find and update the payment
        const payment = await Payment.findOne({ payhereOrderId: order_id });

        if (!payment) {
            return {
                success: false,
                error: "Payment record not found"
            };
        }

        // Update payment details
        payment.payherePaymentId = payment_id;
        payment.status = status_code === "2" ? "completed" :
            status_code === "0" ? "pending" : "failed";
        payment.paymentDate = new Date();
        payment.updatedAt = new Date();

        await payment.save();

        return {
            success: true,
            data: payment
        };
    } catch (error) {
        console.error("Error processing payment notification:", error);
        return {
            success: false,
            error: error.message || "Error processing payment notification"
        };
    }
};

/**
 * Get payment history for a user
 * 
 * @param {string} userId - User ID
 * @returns {Object} - User's payment history or error
 */
export const getUserPaymentHistory = async (userId) => {
    try {
        await connectDB();

        const payments = await Payment.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        // Enhance payment data with plan information
        const enhancedPayments = await Promise.all(payments.map(async (payment) => {
            // Get plan details
            const planDetails = await getPlanByPlanId(payment.planId);

            return {
                ...payment,
                planName: planDetails?.data?.planName || 'Unknown Plan',
                planDetails: planDetails?.data || null
            };
        }));

        return {
            success: true,
            data: enhancedPayments
        };
    } catch (error) {
        console.error("Error fetching payment history:", error);
        return {
            success: false,
            error: error.message || "Error fetching payment history"
        };
    }
};

/**
 * Get payment details by order ID
 * 
 * @param {string} orderId - PayHere order ID
 * @returns {Object} - Payment details or error
 */
export const getPaymentByOrderId = async (orderId) => {
    try {
        await connectDB();

        const payment = await Payment.findOne({ payhereOrderId: orderId })
            .lean();

        if (!payment) {
            return {
                success: false,
                error: "Payment not found"
            };
        }

        return {
            success: true,
            data: payment
        };
    } catch (error) {
        console.error("Error fetching payment details:", error);
        return {
            success: false,
            error: error.message || "Error fetching payment details"
        };
    }
};
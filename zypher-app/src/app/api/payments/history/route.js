import { NextResponse } from "next/server";
import { getUserPaymentHistory } from "@/app/api/_services/paymentService";
import { checkRoleAccess } from "@/app/api/_services/requestValidationService";

/**
 * Get payment history for a user
 * 
 * @param {Request} request - The HTTP request object
 * @returns {NextResponse} - Response with payment history or error
 */
export async function GET(request) {
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
        // Get payment history
        const result = await getUserPaymentHistory(userId);
        
        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            data: result.data
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching payment history:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
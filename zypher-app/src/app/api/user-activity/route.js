import { NextResponse } from "next/server";

import { checkRoleAccess } from "@/app/api/_services/requestValidationService";

import {
    createOrUpdateUserActivityLog,
    getUserActivityLog,
    checkAndUpdateRemainingScans
} from "@/app/api/_services/userActivityService";

export const POST = async (request) => {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    const allowedRoles = ['primary-user'];
    const accessError = await checkRoleAccess(allowedRoles, role, userId);

    if (accessError) {
        return NextResponse.json(
            { error: accessError.error },
            { status: accessError.status }
        );
    }
    const userActiviyLog =  await createOrUpdateUserActivityLog(userId);
    if(userActiviyLog.error){
        return NextResponse.json(
            { error: userActiviyLog.error },
            { status: 500 }
        );
    }
    return NextResponse.json(
        {
            success: true,
            message: userActiviyLog.message,
            data: userActiviyLog.data
        },
        { status: userActiviyLog.status }
    );
};

export const GET = async (request) => {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    const allowedRoles = ['primary-user'];
    const accessError = await checkRoleAccess(allowedRoles, role, userId);
    if (accessError) {
        return NextResponse.json(
            { error: accessError.error },
            { status: accessError.status }
        );
    }
    const userActivity = await getUserActivityLog(userId);
    if(userActivity.error){
        return NextResponse.json(
            { error: userActivity.error },
            { status: 500 }
        );
    }
    return NextResponse.json(
        {
            success: true,
            message: userActivity.message,
            data: userActivity.data
        },
        { status: userActivity.status }
    );
};

export const PATCH = async (request) => {
    //decrement scans remaining
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    const allowedRoles = ['primary-user'];
    const accessError = await checkRoleAccess(allowedRoles, role, userId);
    if (accessError) {
        return NextResponse.json(
            { error: accessError.error },
            { status: accessError.status }
        );
    }
    const remainingScansStatus = await checkAndUpdateRemainingScans(userId);
    if(remainingScansStatus.error){
        return NextResponse.json(
            { error: remainingScansStatus.error },
            { status: remainingScansStatus.status }
        );
    }
    return NextResponse.json(
        {
            success: true,
            message: remainingScansStatus.message,
            data: remainingScansStatus.data
        },
        { status: remainingScansStatus.status }
    );
};


export const checkRoleAccess = async (allowedRoles, userRole, userId) => {
    if (!userId || !userRole) {
        return {
            error: "Unauthorized",
            status: 401
        };
    }
    if (!allowedRoles.includes(userRole)) {
        return {
            error: "Forbidden",
            status: 403
        };
    }
};

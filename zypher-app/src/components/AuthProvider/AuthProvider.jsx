"use client"

import React, { useEffect } from 'react'
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Component to handle protected routes
const AuthHandler = ({ children, requiredRole }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
      return;
    }
    
    if (requiredRole && session?.user?.role !== requiredRole) {
      router.push('/unauthorized');
    }
  }, [status, session, requiredRole, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (requiredRole && session?.user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking permissions...</p>
      </div>
    );
  }

  return children;
};

const AuthProvider = ({ children }) => {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
};

// Higher-order component for role-based protection
export const withAuth = (Component, requiredRole) => {
  return function WithAuth(props) {
    return (
      <AuthHandler requiredRole={requiredRole}>
        <Component {...props} />
      </AuthHandler>
    );
  };
};

export default AuthProvider;
"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupSuccess() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [isSignUp, setIsSignup] = useState(false);
    const [isLogIn, setIsLogin] = useState(false);

    // hanlde display message upon google sign in and login
    useEffect(() => {
        setIsSignup(false);
        setIsLogin(false);

        const params = new URLSearchParams(window.location.search);
        const loginType = params.get("loginType");
        if (loginType === "signup") {
            setIsSignup(true);
        }else if (loginType === "login") {
            setIsLogin(true);
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            // Redirect based on role after 2 seconds
            setTimeout(() => {
                switch (session.user.role) {
                    case 'admin':
                        router.push("/admin-dashboard");
                        break;
                    case 'primary-user':
                        router.push("/start-a-scan");
                        break;
                    case 'rule-maintainer':
                        router.push("/view-requests");
                        break;
                    case 'rule-developer':
                        router.push("/developer-dashboard");
                        break;
                    case 'rule-tester':
                        router.push("/tester-dashboard");
                        break;
                    default:
                        router.push("/");
                        break;
                }
            }, 2000);
        } else if (status === "unauthenticated") {
            router.push('/login');
        }
    }, [session, status, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <div className="text-center p-8 bg-[var(--card-bg)] rounded-2xl shadow-lg max-w-md w-full">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-4">Sign-in Successful!</h1>
                
                {/* signUp message */}
                {isSignUp && (
                    <p className="mb-6">Welcome to Zypher. You'll be redirected to your dashboard shortly.</p>
                )}
                {/* login message */}
                {isLogIn && (
                    <p className="mb-6">Redirecting to your dashboard...</p>
                )}

                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        </div>
    );
}
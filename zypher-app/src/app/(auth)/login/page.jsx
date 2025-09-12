"use client";

import Link from "next/link";
import { FcGoogle } from 'react-icons/fc';
import { useState, useEffect } from 'react';
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaExclamationCircle } from 'react-icons/fa';

export default function LoginPage() {
  const { data: session, status } = useSession();
  console.log("Session data:", session);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Handle session status changes for already logged-in users
  useEffect(() => {
    setSuccessMsg('');
    if (status === "authenticated" && !loginSuccess) {
      setSuccessMsg("You are already logged in");

      // Redirect based on role for already authenticated users
      redirectBasedOnRole(session.user.role);
    }
  }, [session, status, loginSuccess]);

  // Handle redirection after successful login
  useEffect(() => {
    if (loginSuccess && status === "authenticated") {

      //redirect to login success page
      router.push('/signup-success?loginType=login');
    }
  }, [loginSuccess, session, status]);

  // hanlde error message when google sign in fails
  useEffect(() => {
    setErrorMsg('');
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const success = params.get("success");
    if (error) {
      setErrorMsg(decodeURIComponent(error));
    }
    if (success) {
      setSuccessMsg(decodeURIComponent(success));
    }
    clearMessage(setErrorMsg);
    clearMessage(setSuccessMsg);
  }, []);

  // Function to redirect based on user role
  const redirectBasedOnRole = (role) => {
    switch (role) {
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
        router.push("/assigned-rules");
        break;
      case 'rule-implementer':
        router.push("/rules-to-test");
        break;
      case 'educator':
        router.push("/add-knowledge");
        break;
      case 'manager':
        router.push("/subscription-plans");
        break;
      default:
        router.push("/");
        break;
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear general error message
    if (errorMsg) setErrorMsg('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === 'email' && value && !validateEmail(value)) {
      setErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setLoginSuccess(false);

    let isValid = true;
    const newErrors = { ...errors };

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      // Attempt sign in without redirect
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        if (result.error.includes("User not found")) {
          setErrorMsg("Invalid email or password");
        } else if (result.error.includes("Invalid credentials")) {
          setErrorMsg("Incorrect password");
        } else {
          setErrorMsg("An error occurred. Please try again.");
        }
      } else {
        // Set login success flag - redirection will be handled by useEffect
        setLoginSuccess(true);
        setSuccessMsg("Login successful! Redirecting...");
      }
    } catch (error) {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      clearMessage(setErrorMsg);
      clearMessage(setSuccessMsg);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setErrorMsg('');
    signIn('google', {
      callbackUrl: '/signup-success?loginType=login',
      redirect: true,
    });
  };

  function clearMessage(setter) {
    setTimeout(() => {
      setter('');
    }, 4000);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
      <div className="w-full max-w-md rounded-2xl p-6 sm:p-8 bg-[var(--card-bg)] shadow-lg">
        <h1 className="text-center text-2xl font-bold mb-8">
          Welcome Back!
        </h1>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 p-3 rounded-lg bg-green-100 border border-green-400 text-green-700 flex items-center">
            <FaExclamationCircle className="mr-2 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-100 border border-red-400 text-red-700 flex items-center">
            <FaExclamationCircle className="mr-2 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full border border-[var(--border-button)] bg-[var(--button-bg)] rounded-2xl py-4 mb-6 hover:bg-[#2a2a2a] transition"
          disabled={isGoogleLoading}
        >{isGoogleLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </>
        ) : (
          <>
            <FcGoogle className="text-2xl mr-2" />
            Sign In with Google
          </>
        )}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-[var(--text-secondary)]" />
          <span className="mx-2 text-sm text-[var(--text-secondary)]">or</span>
          <div className="flex-1 h-px bg-[var(--text-secondary)]" />
        </div>

        {/* Form */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm mb-2 block font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter email address"
              className={`w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-[var(--border-input)]'} bg-[var(--input-bg)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FaExclamationCircle className="mr-1 text-xs" /> {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm mb-2 block font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className={`w-full rounded-xl border ${errors.password ? 'border-red-500' : 'border-[var(--border-input)]'} bg-[var(--input-bg)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FaExclamationCircle className="mr-1 text-xs" /> {errors.password}
              </p>
            )}
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-[var(--brand-yellow)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-8 py-4 rounded-2xl font-semibold transition duration-200 text-lg bg-[#FCE803] text-[var(--background)] hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : "Log In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm">
          Don't have an account? {" "}
          <Link href="/signup" className="text-[var(--brand-yellow)] font-medium hover:underline">
            Sign Up
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="hover:underline text-[var(--foreground)]">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:underline text-[var(--foreground)]">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
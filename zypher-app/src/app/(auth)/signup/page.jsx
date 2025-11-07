"use client";

import Link from "next/link";
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FaExclamationCircle } from 'react-icons/fa';

export default function SignUpPage() {
  const router = useRouter(); // For navigation after successful signup

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return re.test(password);
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

    if (name === 'password' && value && !validatePassword(value)) {
      setErrors(prev => ({
        ...prev,
        password: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      }));
    }

    if (name === 'confirmPassword' && value && value !== formData.password) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
    }
  };

  const handleGoogleAuth = () => {
    setIsGoogleLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    signIn('google', {
      callbackUrl: '/signup-success?loginType=signup',
      redirect: true,
    });
  };

  const handleGitHubAuth = () => {
    setIsGitHubLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    signIn('github', {
      callbackUrl: '/signup-success?loginType=signup',
      redirect: true,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    setErrorMsg('');
    setSuccessMsg('');

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
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            role: 'primary-user' // Default role for new users
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          //handle API errors (status code 400-500)
          if (data.error) {
            setErrorMsg(data.error);
          } else {
            setErrorMsg("Registration failed. Please try again later.");
          }
          return;
        }

        //if successful, redirect to login page
        setTimeout(() => {
          router.push('/login?success=Account created successfully');
        }, 2000);

      } catch (error) {
        setErrorMsg(error.message || 'Something went wrong. Please try again later');
      } finally {
        setIsLoading(false);
        clearMessage(setErrorMsg);
        clearMessage(setSuccessMsg);
      }
    }
  };

  function clearMessage(setter) {
    setTimeout(() => {
      setter('');
    }, 3500);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
      <div className="w-full max-w-md rounded-2xl p-6 sm:p-8 bg-[var(--background)]">
        <h1 className="text-center text-2xl font-bold mb-12">
          Create your Zypher account
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

        {/* OAuth Sign Up Buttons */}
        <div className="space-y-3 mb-6">
          {/* Google Sign Up */}
          <button
            onClick={handleGoogleAuth}
            className="flex items-center justify-center w-full border border-[var(--border-button)] bg-[var(--button-bg)] rounded-2xl py-4 hover:bg-[#2a2a2a] transition"
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecting...
              </>
            ) : (
              <>
                <FcGoogle className="text-2xl mr-2" width={20} height={16} />
                Sign Up with Google
              </>
            )}
          </button>

          {/* GitHub Sign Up */}
          <button
            onClick={handleGitHubAuth}
            className="flex items-center justify-center w-full border border-[var(--border-button)] bg-[var(--button-bg)] rounded-2xl py-4 hover:bg-[#2a2a2a] transition"
            disabled={isGitHubLoading}
          >
            {isGitHubLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecting...
              </>
            ) : (
              <>
                <FaGithub className="text-2xl mr-2 text-white" />
                Sign Up with GitHub
              </>
            )}
          </button>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-[var(--text-secondary)]" />
          <span className="mx-2 text-sm text-[var(--text-secondary)]">or</span>
          <div className="flex-1 h-px bg-[var(--text-secondary)]" />
        </div>

        {/* Form */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm mb-2 block" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter email address"
              className={`w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-[var(--border-input)]'} bg-[var(--input-bg)] px-4 py-3 focus:outline-none focus:border-[var(--brand-yellow)]`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm mb-2 block" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter password"
              className={`w-full rounded-xl border ${errors.password ? 'border-red-500' : 'border-[var(--border-input)]'} bg-[var(--input-bg)] px-4 py-3 focus:outline-none focus:border-[var(--brand-yellow)]`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="text-sm mb-2 block" htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Re-enter password"
              className={`w-full rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-[var(--border-input)]'} bg-[var(--input-bg)] px-4 py-3 focus:outline-none focus:border-[var(--brand-yellow)]`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-8 py-4 rounded-2xl font-semibold transition duration-200 text-lg bg-[#FCE803] text-[var(--background)] hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : "Sign Up"}
          </button>
        </form>

        <p className="mt-12 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--brand-yellow)] font-medium hover:underline">
            Log In
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-[var(--text-secondary)]">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="hover:underline text-[var(--foreground)]">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:underline text-[var(--foreground)]">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
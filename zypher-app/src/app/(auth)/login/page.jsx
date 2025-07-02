"use client";

import Link from "next/link";
import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
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
        password: 'Password must be at least 8 characters with uppercase, lowercase, and number'
      }));
    }

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
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
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      // Submit the form
      console.log('Form is valid, submitting:', formData);
      // Add your form submission logic here
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
      <div className="w-full max-w-md rounded-2xl p-6 sm:p-8 bg-[var(--background)]">
        <h1 className="text-center text-2xl font-bold mb-12">
          Welcome Back!
        </h1>

        {/* Google Sign In */}
        <button className="flex items-center justify-center w-full border border-[var(--border-button)] bg-[var(--button-bg)] rounded-2xl py-4 mb-8 hover:bg-[#2a2a2a] transition">
          <FcGoogle className="text-2xl mr-2" width={20} height={16}/>
          Sign In with Google
        </button>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-[var(--text-secondary)]" />
          <span className="mx-2 text-sm text-[var(--text-secondary)]">or</span>
          <div className="flex-1 h-px bg-[var(--text-secondary)]" />
        </div>

        {/* Form */}
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
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

          <button
            type="submit"
            className="w-full px-8 py-4 rounded-2xl font-semibold transition duration-200 text-lg bg-[#FCE803] text-[var(--background)] hover:brightness-110"
          >
            Log In
          </button>
        </form>

        <p className="mt-12 text-center text-sm">
          Don't have an account? {" "}
          <Link href="/signup" className="text-[var(--brand-yellow)] font-medium hover:underline">
            Sign Up
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
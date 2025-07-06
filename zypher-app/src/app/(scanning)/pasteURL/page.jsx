"use client";

import { useState } from "react";
import { Lexend } from 'next/font/google';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function PasteUrlPage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validateUrl = (inputUrl) => {
    if (!inputUrl.includes(".git")) {
      return "The URL must contain '.git'.";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateUrl(url.trim());
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    console.log("Start scanning URL:", url);
  };

  return (
    <main className={`flex flex-col items-center justify-center min-h-[80vh] px-4 ${lexend.className} text-center`}>
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Paste your repository URL
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="url"
            placeholder="https://github.com/your-repo.git"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(""); // Clear error while typing
            }}
            className={`w-full rounded-2xl border px-4 py-4 text-lg focus:outline-none bg-[var(--input-bg)] ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-[var(--border-input)] focus:border-[var(--brand-yellow)]"
            }`}
            required
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="bg-[var(--brand-yellow)] text-[var(--background)] font-semibold px-6 py-4 rounded-2xl hover:brightness-110 transition"
          >
            Start Scanning
          </button>

          <p className="mt-2 text-md text-[var(--text-secondary)]">
          Prefer uploading files?{" "}
          <a
            href="/uploadConfigFiles"
            className="underline text-[var(--brand-yellow)] hover:brightness-110 transition"
          >
            Switch to config file upload
          </a>
          </p>

        </form>
      </div>
    </main>
  );
}

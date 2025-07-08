// src/app/dashboard/(user)/paste-url/page.js
"use client";

import { useState } from 'react';
import { Link2, ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react';


export default function PasteUrlPageContent() { 
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!url.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a URL to scan.' });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Initiating scan for URL:', url);
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (url.includes('bad') || url.includes('error')) {
        throw new Error('Simulated scan failure: Malicious content detected or invalid URL.');
      }

      setFeedback({ type: 'success', message: 'Scan initiated successfully! Results will appear in "Scan Results".' });
      setUrl('');

    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to initiate scan. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center bg-[var(--input-bg)] p-8 md:p-12 rounded-3xl mb-12 shadow-xl border border-[var(--border-input)]"> {/* Removed overall padding, it's handled by parent */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight text-[var(--foreground)]">
        Scan Your Repository by URL
      </h1>
      <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
        Simply paste the URL of your Git repository (e.g., GitHub, GitLab, Bitbucket) below to start a comprehensive security scan.
      </p>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="relative mb-6">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g., https://github.com/your-org/your-repo.git"
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200 text-lg"
            disabled={isLoading}
          />
        </div>

        {feedback && (
          <div className={clsx(
            "p-3 rounded-lg text-sm mb-6 flex items-center justify-center gap-2",
            feedback.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
          )}>
            {feedback.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-3 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-4 rounded-full hover:brightness-110 transition-all duration-300 shadow-lg text-lg transform hover:-translate-y-1 w-full sm:w-auto"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              Start Scan <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
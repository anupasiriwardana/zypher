"use client";
import Head from 'next/head';
import Link from 'next/link'
import { ArrowRight } from 'lucide-react';
import { Lexend } from 'next/font/google';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function StartFreeScan() {
  return (
    <>
      <Head>
        <title>Zypher - Start Free Scan</title>
        <meta name="description" content="One upload away from a cleaner, safer pipeline." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={`min-h-[80vh] flex flex-col items-center justify-center text-center px-4 ${lexend.className}`}>
        <section className="text-center max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[var(--foreground)] max-w-5xl">
            One Upload Away from a Cleaner, Safer Pipeline
          </h1>
          <p className="mt-6 text-[var(--text-secondary)] max-w-2xl text-base sm:text-lg mx-auto">
            Just drag and drop your config files or paste code. Zypher will instantly analyze and show key issues in your pipeline setup.
          </p>
      
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8 mt-10">
            <Link href="/uploadConfigFiles">
              <button className="inline-flex items-center gap-2 border-2 border-[var(--brand-yellow)] text-[var(--brand-yellow)] font-bold px-8 py-4 rounded-full hover:bg-[var(--brand-yellow)] hover:text-[var(--background)] transition">
                Upload config files
                <ArrowRight size={25} />
              </button>
            </Link>

            <span className="text-text-secondary text-lg text-[var(--brand-yellow)]">or</span>

            <Link href="/pasteURL">
              <button className="inline-flex items-center gap-2 border-2 border-[var(--brand-yellow)] text-[var(--brand-yellow)] font-bold px-8 py-4 rounded-full hover:bg-[var(--brand-yellow)] hover:text-[var(--background)] transition">
                Paste URL
                <ArrowRight size={25} />
              </button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
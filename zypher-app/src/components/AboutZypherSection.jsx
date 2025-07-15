"use client";

import { Info } from 'lucide-react';
import { AiFillHeart } from "react-icons/ai";

export default function AboutZypherSection() {
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 ${lexend.className}">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex px-6 py-2 bg-transparent rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-700 items-center gap-5 mb-12 my-12">
          <Info className="w-5 h-5 text-zinc-100" />
          <div className="text-base font-bold leading-6 text-zinc-100">About Zypher</div>
        </div>
        <div className="inline-flex justify-start items-center gap-24 max-w-[924px] w-full mx-auto px-20">
          <div className="w-20 flex-shrink-0 text-left text-3xl font-semibold leading-[48px]">
            <span className="relative inline-flex items-center justify-center rounded-xl">
              {/* Blurred background */}
              <span
                className="absolute inset-0 rounded-xl blur-lg opacity-50"
                style={{ backgroundColor: "var(--brand-yellow)" }}
              ></span>

              {/* Square background with icon */}
              <span className="w-14 h-14 bg-[var(--brand-yellow)] rounded-xl z-10 flex items-center justify-center p-2">
                <AiFillHeart className="w-6 h-6 text-[#101318]" />
              </span>
            </span>
          </div>

          {/* ✅ Fixed text width to allow wrapping and fill remaining space */}
          <div className="flex-1 text-zinc-100 text-3xl font-medium font-['Lexend'] leading-[48px] text-left">
            At Zypher, we’re <br/>rethinking how security<br/> fits into modern software<br/> delivery.
          </div>
        </div>


        
        <div className="w-full text-left max-w-3xl mx-auto mb-12 my-12">
          <p className="text-zinc-300 leading-relaxed text-[18px] font-['Lexend']">
            Zypher was born from a simple frustration: security tools weren’t built for how modern engineers work.
            <br />
            <br />              As developers ourselves, we knew devs didn’t need noisy scanners, false positives, and delayed signals — we needed precision, context, and clarity.
            <br />
            <br />
            So we built Zypher to scan CI/CD pipelines the way modern teams work.
          </p>
        </div>
        
      </div>
    </section>
  );
}

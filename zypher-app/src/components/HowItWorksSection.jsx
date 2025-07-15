"use client";

import {
  Diamond,
  SquareCheck,
  Circle,
  Square,
  ChevronsLeftRight,
  LaptopMinimalCheck,
} from "lucide-react";


import { Lexend } from 'next/font/google';


const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], 
});

export default function HowItWorksSection() {
  const steps = [
    {
      description: "Detect CI/CD security risks, and unsafe configurations",
      icon: Diamond,
    },
    {
      description:
        "Flag anti-patterns and violations of industry best practices",
      icon: SquareCheck,
    },
    {
      description:
        "Link every issue to the exact file + line number, with suggested remediation",
      icon: Circle,
    },
    {
      description: "Export PDF reports or stream results via API",
      icon: Square,
    },
    {
      description:
        "Aggregate historical scan data for trend analysis & compliance audits",
      icon: ChevronsLeftRight,
    },
  ];

  return (
    <section className={`min-h-[80vh] flex flex-col items-center justify-center mb-20 my-20 text-center px-4 ${lexend.className}`}>
      <div className="w-full max-w-[924px] mx-auto flex flex-col items-center gap-16">
        <div className="h-12 px-6 py-4 bg-transparent rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center">
          <div className="inline-flex items-center gap-5">
            <div className="w-6 h-6 relative">
              <LaptopMinimalCheck className="w-5 h-5" />
            </div>
            <div className="text-base font-bold leading-9">How Zypher works</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full flex flex-col lg:flex-row gap-32">
          {/* Left Text Block */}
          <div className="w-full lg:w-1/2 text-left text-3xl font-semibold leading-[48px]">
            <span>Zypher </span>
            <span className="text-[var(--brand-yellow)]">scans</span>
            <span> CI/CD pipelines to </span>
            <span className="text-[var(--brand-yellow)]">detect</span>
            <span> risks, flag misconfigurations, and </span>
            <span className="text-[var(--brand-yellow)]">suggest</span>
            <span> fixes all mapped to exact files.</span>
          </div>

          {/* Right Features */}
          <div className="w-full lg:w-1/2 flex flex-col gap-10">
            {steps.map(({ icon: Icon, description }, index) => (
              <div key={index} className="flex items-start gap-7">
                <div className="w-14 h-14 aspect-square relative rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 bg-transparent shadow-[inset_0px_1px_0px_rgba(255,255,255,0.08)]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white opacity-90" />
                  </div>
                </div>
                <p className="text-base font-medium leading-normal text-zinc-100">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

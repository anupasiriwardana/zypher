"use client";
import { CircleQuestionMark, Star } from "lucide-react";
import { Lexend } from 'next/font/google';
import Link from 'next/link';


const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], 
});

const features = [
  {
    title: "CI/CD Configuration Scanning",
    description:
      "Zypher analyzes your CI/CD config files to detect misconfigurations, secrets leakage, and insecure integrations.",
    link: "/features/ci-cd-scanning",
  },
  {
    title: "Targeted Static Analysis",
    description:
      "Zypher scans only YAML-based configs of the repo, helping you catch vulnerabilities without false alarms.",
    link: "/features/static-analysis",
  },
  {
    title: "Best Practice Enforcement",
    description:
      "Enforce hardened secrets, token access control, commit signature verifications, and third-party scans.",
    link: "/features/best-practices",
  },
  {
    title: "Auto-Linked Knowledge Base",
    description:
      "Every issue links to docs written by security specialists. Use StackOverflow-style explainers for dev teams.",
    link: "/features/knowledge-base",
  },
];

export default function FeaturesSection() {
  return (
    <section className={`min-h-[80vh] flex flex-col items-center justify-center text-center px-4 ${lexend.className}`}>
      <div className="h-12 px-6 py-4 bg-transparent rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center">
        <div className="inline-flex items-center gap-5">
          <div className="w-6 h-6 relative">
            <Star className="w-5 h-5" />            
          </div>
          <div className="text-base font-bold leading-5 text-center text-[16px]">What makes zypher stand out</div>
        </div>
      </div>
      <h4 className="text-[#F0F0F0] text-center text-[32px] font-semibold leading-[48px] tracking-[-0.352px] max-w-4xl mx-auto mb-12 my-12">
        Zypher brings together  
        <span className = "text-[#FCE803] "> speed</span>
        , 
        <span className = "text-[#FCE803] "> precision</span>
        , and pipeline 
        <span className = "text-[#FCE803] "> awareness </span> 
        — here’s how we make it happen.
      </h4>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 text-left">
        {features.map(({ title, description, link }, i) => (
          <div 
            key={i}
            className="relative p-[1.5px] rounded-[42px] w-[444px] h-[388px] group"
          >
          
            <div className="w-full h-full rounded-[42px] bg-[rgba(255,255,255,0.01)] border-[1.5px] border-[rgba(240,240,240,0.15)] p-8 flex flex-col justify-between transition-all duration-300">
              <div>
                <h3
                  className="text-[#F0F0F0] font-[Lexend] text-[32px] font-semibold leading-[130%] tracking-[-0.352px] mb-2"
                  style={{ alignSelf: "stretch", fontStyle: "normal" }}
                >
                  {title}
                </h3>
                <p className="text-[#CCC] font-lexend text-[14px] font-normal leading-[150%] tracking-[-0.154px]">
                  {description}
                </p>
              </div>
              <div className="flex justify-end">
                <Link href={link}>
                  <button className="flex items-center gap-2 font-lexend text-[13px] font-medium leading-[150%] tracking-[-0.154px] rounded-[40px] border border-[rgba(240,240,240,0.12)] bg-[rgba(240,240,240,0.04)] w-[134px] h-[30px] px-4 py-[2px] hover:bg-[rgba(240,240,240,0.08)] transition-colors">
                    Learn More <CircleQuestionMark size={16} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
          
        ))}
      </div>
    </section>
  );
}

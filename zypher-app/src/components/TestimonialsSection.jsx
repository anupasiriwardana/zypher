"use client";

import { MessageSquareMore } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { FaLinkedinIn, FaFacebookF } from 'react-icons/fa';
import { Lexend } from 'next/font/google';
import Image from "next/image";
import Link from "next/link";

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // choose weights you need
});

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Alex, Senior DevOps Engineer",
      quote: "We tried 4 other scanners before Zypher. They either flooded us with false positives or ignored real risks. Zypher finally got the balance right.",
      image: "/images/profile.png"
    },
    {
      name: "Liam, DevSecOps Lead",
      quote: "Zypher helped us shift left without the chaos. Our security reviews now happen in minutes, not days. Total game-changer for our release cycle.",
      image: "/images/profile.png"
    },
    {
      name: "Emma, Security Engineer",
      quote: "Zypher's insights are spot on. It catches issues before they hit production, and the team loves the clear explanations.",
      image: "/images/profile.png"
    },
    {
      name: "Sarah, VP of Engineering",
      quote: "The support? Zypher knows what they're doing. Our team can wait, and we love that.",
      image: "/images/profile.png"
    },
    {
      name: "Jane, Senior DevOps Engineer",
      quote: "I've tried other scanners before Zypher. This either floods the CI with false positives or ignores real risks. Zypher just nails it. Fast. Precise.",
      image: "/images/profile.png"
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50 && currentSlide < testimonials.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (distance < -50 && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <section className="min-h-[80vh] w-full px-4">
      {/* Heading & badge inside max width */}
      <div className="w-full max-w-[574px] mx-auto flex flex-col items-center gap-10 text-center">
        <div className="inline-flex px-6 py-2 bg-transparent rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-700 items-center gap-5 my-12">
          <MessageSquareMore className="w-5 h-5 text-zinc-100" />
          <div className="text-base font-bold leading-6 text-zinc-100">Why they choose Zypher</div>
        </div>
        <div>
          <h2 className="text-[25px] font-medium text-white font-['Lexend'] mb-2">
            Trusted by teams to secure CI/CD workflows,
          </h2>
          <h2 className="text-[25px] font-medium text-white font-['Lexend']">
            here's what real <span className="text-[var(--brand-yellow)]">developers have to say.</span>
          </h2>
        </div>
      </div>

      {/* Carousel (full width) */}
      <div className="w-full flex justify-center mt-16 overflow-hidden">
        <div 
          className="w-full max-w-xl relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
              width: `${testimonials.length * 100}%`
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 px-4"
                style={{ flex: "0 0 100%" }}
              >
                <div className="relative bg-[#0F0F0F] border border-[#333] rounded-3xl w-[682px] h-[230px] flex items-center px-8 py-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:border-[var(--brand-yellow)] ">
                  {/* Left: Avatar */}
                  <div className="w-[100px] h-[100px] rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--brand-yellow)] shadow-md bg-zinc-800">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      width={100}
                      height={100}
                    />
                  </div>

                  {/* Right: Content */}
                  <div className="flex flex-col justify-between h-full py-8 w-full px-8 text-[16px]" >
                    <p className="text-white text-sm leading-relaxed mb-2">
                      “{testimonial.quote}”
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-white text-sm">{testimonial.name}</p>
                      <div className="flex gap-2 text-white">
                        <FaLinkedinIn className="w-4 h-4 hover:text-[var(--brand-yellow)] transition" />
                        <FaFacebookF className="w-4 h-4 hover:text-[var(--brand-yellow)] transition" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8 mb-20">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? "w-4 h-1.5 rounded-full bg-[var(--brand-yellow)]"
                : "w-1.5 h-1.5 rounded-full bg-zinc-600"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "./Button";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-[var(--background)] transition-all ${
        scrolled ? "shadow-md border-b border-[#333]" : ""
      }`}
    >
      <div className="max-w-8xl mx-auto flex justify-between items-center px-6 py-4 text-lg md:px-14 lg:px-16">
        {/* Logo + nav links */}
        <div className="flex items-center gap-12">
          <Link href="/">
            <Image
              src="/Images/ZypherLogo-white.png"
              alt="Zypher logo"
              width={150}
              height={24}
              className="object-contain"
            />
          </Link>
          <ul className="flex gap-8 text-white font-semibold">
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </div>

        {/* Auth buttons */}
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="outline">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="solid">Sign Up</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

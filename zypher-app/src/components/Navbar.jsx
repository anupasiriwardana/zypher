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
      <div className="max-w-8xl mx-auto flex justify-between items-center px-6 py-3 text-base md:px-10 lg:px-14">
        {/* Logo + nav links */}
        <div className="flex items-center gap-8">
          <Link href="/">
            <Image
              src="/Images/ZypherLogo-white.png"
              alt="Zypher logo"
              width={130}
              height={22}
              className="object-contain"
            />
          </Link>
          <ul className="hidden md:flex gap-6 text-white font-medium text-[15px]">
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </div>

        {/* Auth buttons */}
        <div className="flex gap-3">
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

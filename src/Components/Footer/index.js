"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import InstagramIcon from "@/../public/icon-instagram.svg";
import FacebookIcon from "@/../public/icon-Facebook.svg";
import TwitterIcon from "@/../public/icon-Twitter.svg";
import LinkedInIcon from "@/../public/icon-Linkedin.svg";
import { Poppins } from "next/font/google";
import SendIcon from "@/../public/sendIcon.svg";
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 flex  flex-col items-center gap-16">
      <div className="flex gap-20 flex-wrap pl-10">
        <div className="flex flex-col gap-6">
          <h1 className="text-l font-bold">Exclusive</h1>
          <h3 className={`text-[20px] font-medium ${poppins.className}`}>
            Subscribe
          </h3>
          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email"
              className="outline outline-white border-none outline-1 rounded-sm bg-black text-white text-opacity-40 py-3 pl-4"
            />
            <div className="absolute right-0 top-1 bg-black cursor-pointer h-11 w-11 flex justify-center items-center">
              <SendIcon />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h3 className={`text-[20px] font-medium ${poppins.className}`}>
            Support
          </h3>
          <p>exclusive@gmail.com</p>
          <p>+0201099879634</p>
        </div>
        <div className="flex flex-col gap-6">
          <h3 className={`text-[20px] font-medium ${poppins.className}`}>
            Account
          </h3>
          <Link href="./account">My Account</Link>
          <Link href="./cart">Cart</Link>
          <Link href="./wishlist">Wishlist</Link>
          <Link href="/products">Shop</Link>
        </div>
        <div className="flex flex-col gap-6">
          <h3 className={`text-[20px] font-medium ${poppins.className}`}>
            Quick Links
          </h3>
          <Link href="./privacy-policy">Privacy Policy</Link>
          <Link href="./terms-of-use">Terms Of Use</Link>
          <Link href="./faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="flex flex-col gap-6">
          <h3 className={`text-[20px] font-medium ${poppins.className}`}>
            Follow Us
          </h3>
          <div className="flex gap-4 text-primary">
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <FacebookIcon />
            </Link>
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <TwitterIcon />
            </Link>
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <InstagramIcon />
            </Link>
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <LinkedInIcon />
            </Link>
          </div>
        </div>
      </div>
      <div
        className={`${poppins.className} text-primary py-4 opacity-30 w-full text-base flex justify-center items-center border-t border-white border-opacity-50`}
      >
        © {new Date().getFullYear()} Exclusive. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

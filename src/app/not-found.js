import React from "react";
import { Inter, Poppins } from "next/font/google";
import Link from "next/link";
const inter = Inter({ subsets: ["latin"], display: "swap" });
const poppins = Poppins({ subsets: ["latin"], display: "swap", weight: "400" });

const NotFound = () => {
  return (
    <div className=" flex flex-col justify-center items-center gap-8 py-24">
      <p
        className={`${inter.className} font-medium text-xxxl -tracking-tighter`}
      >
        404 Not Found
      </p>
      <p className={`${poppins.className}`}>
        Your visited page was not found. You may go home page.
      </p>
      <Link
        href="/"
        className="bg-primary px-12 py-3 rounded text-white text-l w-fit hover:bg-primary hover:bg-opacity-75 mt-10"
      >
        Go Home{" "}
      </Link>
    </div>
  );
};

export default NotFound;

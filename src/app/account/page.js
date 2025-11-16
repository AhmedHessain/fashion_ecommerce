"use client";
import React, { useState } from "react";
import { Poppins } from "next/font/google";
import AccountForm from "./AccountForm";
import ChangePasswordForm from "./ChangePasswordForm";
import AddressBookTab from "./AddressBookTab";
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  weight: ["400", "500", "600", "700"],
});

const Account = () => {
  const [tap, setTap] = useState("profile");

  return (
    <div className="p-16 w-full">
      <div className="bg-primary w-full bg-opacity-10 flex p-5 pb-2 gap-20 max-md:flex-col max-md:gap-10 max-md:p-3 max-md:items-center">
        <div>
          <h3 className={`${poppins.className} font-semibold`}>
            Manage My Account
          </h3>
          <ul className="flex flex-col gap-3 mt-3 pl-10 text-[#1E0404]">
            <li
              className={`cursor-pointer ${
                tap === "profile" ? "text-primary font-semibold" : ""
              }`}
              onClick={() => setTap("profile")}
            >
              My Profile
            </li>
            <li
              className={`cursor-pointer ${
                tap === "addresses" ? "text-primary font-semibold" : ""
              }`}
              onClick={() => setTap("addresses")}
            >
              Address Book
            </li>

            <li
              className={`cursor-pointer ${
                tap === "password" ? "text-primary font-semibold" : ""
              }`}
              onClick={() => setTap("password")}
            >
              Change Password
            </li>
          </ul>
        </div>

        <div className="flex flex-1 flex-col bg-primary bg-opacity-25 py-10 px-10 rounded-xl shadow-md w-full">
          {tap === "profile" ? (
            <AccountForm />
          ) : tap === "addresses" ? (
            <AddressBookTab />
          ) : (
            <ChangePasswordForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;

"use client";
import React, { useEffect, useState } from "react";
import GoogleIcon from "@/../public/Icon-Google.svg";
import { signIn } from "next-auth/react";

const GoogleProvider = ({ setIsLoading, text, callbackUrl, nextAuthError }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    // Read the error flag from localStorage
    const errorFlag = localStorage.getItem("error");

    if (errorFlag === "true") {
      setError(true);
      // Optionally, clear the error flag after use
      localStorage.removeItem("error");
    }
  }, []);

  return (
    <>
      {/* OR */}
      <div className="border border-black border-opacity-25 w-full relative">
        <p className="absolute left-[50%] translate-x-[-50%] translate-y-[-50%] text-black text-opacity-70 bg-[#FFFFFF]">
          OR
        </p>
      </div>

      {/* Google */}
      <div className="w-full flex flex-col gap-1">
        <button
          className="border border-black rounded bg-white flex gap-4 px-12 h-[50px] w-full justify-center items-center"
          onClick={() => {
            setIsLoading(true);
            signIn("google", { callbackUrl });
          }}
        >
          <GoogleIcon />
          {text}
        </button>
        {error && <p className="text-red-500">Some error occurred</p>}
      </div>
    </>
  );
};

export default GoogleProvider;

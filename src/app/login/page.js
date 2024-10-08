import React from "react";
import Image from "next/image";
import GoogleIcon from "@/../public/Icon-Google.svg";
import LoginForm from "./LoginForm";
const Login = () => {
  return (
    <div className="flex px-20 py-10 flex-1 items-center max-sm:px-10 relative">
      <div className="flex gap-20 justify-center flex-1 max-lg:flex-col-reverse max-lg:gap-7">
        {/* right side - image */}
        <div className=" bg-primary rounded shadow-[inset_0_0_30px_5px_rgba(0,0,0,0.25)] flex justify-center items-end overflow-hidden min-w-[500px]  max-lg:min-w-0">
          <div className="w-[60%] pt-5">
            <Image
              src="/login_image.png"
              alt="login_image"
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="w-full h-full"
              priority
            />
          </div>
        </div>
        {/* left side - form */}
        <div className="flex flex-col items-center gap-9 flex-1 max-w-[400px] max-lg:max-w-full min-w-fit">
          {/* inputs */}
          <LoginForm />
          <div className="border border-black border-opacity-25 w-full relative">
            <p className="absolute left-[50%] translate-x-[-50%] translate-y-[-50%] text-black text-opacity-70 bg-[#FFFFFF]">
              OR
            </p>
          </div>
          <button className="border border-black rounded bg-white flex gap-4 px-12 h-[50px] w-full justify-center items-center">
            <GoogleIcon />
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

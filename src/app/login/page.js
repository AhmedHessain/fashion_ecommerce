import React from "react";
import Image from "next/image";
import LoginForm from "./LoginForm";

const Login = () => {
  return (
    <div className="flex px-20 pb-10 flex-1 items-center max-sm:px-10 relative min-h-screen">
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
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;

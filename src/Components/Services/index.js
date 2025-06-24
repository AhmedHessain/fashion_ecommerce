import React from "react";
import Image from "next/image";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const Services = () => {
  return (
    <div className="flex gap-20 flex-wrap justify-center items-center">
      <Service
        header="FREE AND FAST DELIVERY"
        text="Free delivery for all orders over $140"
        image="/deliveryImage.png"
      />
      <Service
        header="24/7 CUSTOMER SERVICE"
        text="Friendly 24/7 customer support"
        image="/CustomerService.png"
      />
      <Service
        header="MONEY BACK GUARANTEE"
        text="We return money within 30 days"
        image="/Guarantee.png"
      />
    </div>
  );
};

const Service = ({ image, header, text }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-20 h-20">
        <Image
          src={image}
          alt="services_image"
          width={0}
          height={0}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="w-full h-full"
          priority
        />
      </div>
      <h1
        className={`text-[20px] text-[#2C3E50] font-semibold ${poppins.className} mt-6 mb-2`}
      >
        {header}
      </h1>
      <p className={`text-[14px] ${poppins.className}`}>{text}</p>
    </div>
  );
};

export default Services;

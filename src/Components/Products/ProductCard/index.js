import React from "react";
import Image from "next/image";
import { Rating } from "@mui/material";
import { Poppins } from "next/font/google";
import HeartIcon from "@/../public/heart-icon.svg";
import QuickViewIcon from "@/../public/Quick-View-icon.svg";
import cn from "@/utils/cn";
const poppins = Poppins({
  weight: ["400", "700"], // Choose weights you need
  subsets: ["latin"], // Choose subsets you need
});

const ProductCard = () => {
  return (
    <div className="rounded-lg bg-item_background shadow-lg shadow-[#ccc] flex flex-col overflow-hidden group">
      {/* upper div */}
      <div className="px-6 flex pt-5 pb-3 flex-1">
        {/* image */}
        <div className="bg-primary bg-opacity-25 flex justify-center items-center relative shadow-md ">
          <Image src="/Frame 609.png" width={200} height={200} alt="product" />
          <div className="bg-primary text-white px-5 py-1 rounded absolute top-2 left-3">
            New
          </div>
          <div className="flex flex-col gap-3 absolute top-4 right-3 ">
            <div className="flex justify-center items-center rounded-[50%] bg-primary w-10 h-10">
              <HeartIcon className="scale-125" />
            </div>
            <div className="flex justify-center items-center rounded-[50%] bg-primary w-10 h-10">
              <QuickViewIcon className="scale-125" />
            </div>
          </div>
        </div>
      </div>
      {/* Lower div */}
      <div className={cn(`gap-2 flex flex-col p-4`, poppins.className)}>
        <p className=" font-bold ">Gucci duffle bag</p>
        <div className="flex items-center gap-3">
          <p className="text-text  font-bold">$960</p>
          <p className="opacity-50 line-through font-bold">$1160</p>
        </div>
        <div className="flex gap-2">
          <Rating name="read-only" value={5} readOnly />
          <p className="opacity-50">(65)</p>
        </div>
      </div>
      <div className="h-10 flex flex-col justify-end">
        <div className="bg-black flex items-center justify-center text-white cursor-pointer transition-all duration-300 overflow-hidden flex-[0] group-hover:flex-1">
          Add to cart
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

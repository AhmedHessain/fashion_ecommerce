import React from "react";
import { Skeleton } from "@mui/material";
import { Poppins, Inter } from "next/font/google";
import cn from "@/utils/cn";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const ProductDetailSkeleton = () => {
  return (
    <div className="flex flex-1 w-full px-36 pt-16 gap-6 max-xl:flex-col max-:px-10 max-sm:px-3">
      {/* Left: Image Gallery */}
      <div className="flex-1 min-w-[512px] flex gap-2 max-h-[512px] max-sm:min-w-0">
        {/* Thumbnails */}
        <div className="flex-[0.25] flex flex-col gap-2 overflow-y-auto">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={64} height={64} className="mb-2" />
          ))}
        </div>
        {/* Main Image */}
        <div className="flex-[0.75] bg-[#FAFAFA] flex justify-center items-center">
          <Skeleton variant="rectangular" width={400} height={400} />
        </div>
      </div>
      {/* Right: Product Info */}
      <div className="max-w-lg flex-1">
        <Skeleton variant="text" width={300} height={40} className={cn(inter.className)} />
        <div className="flex items-center mt-3 gap-3">
          <Skeleton variant="rectangular" width={120} height={32} />
          <Skeleton variant="text" width={60} height={24} />
          <div className="mx-2">|</div>
          <Skeleton variant="text" width={80} height={24} />
        </div>
        <Skeleton variant="text" width={100} height={32} className={cn(inter.className, "mt-4")} />
        <Skeleton variant="text" width={400} height={60} className="mt-4" />
        <div className="py-5 flex">
          <div className="flex-1 border opacity-50 border-[#000000]" />
        </div>
        {/* Quantity and Buttons */}
        <div className="flex justify-between max-xl:flex-col gap-4">
          <div className="flex items-stretch gap-2">
            <Skeleton variant="rectangular" width={40} height={50} />
            <Skeleton variant="rectangular" width={80} height={50} />
            <Skeleton variant="rectangular" width={40} height={50} />
          </div>
          <div className="flex gap-4">
            <Skeleton variant="rectangular" width={120} height={50} />
            <Skeleton variant="circular" width={50} height={50} />
          </div>
        </div>
        {/* Delivery and Return */}
        <div className="mt-10">
          <div className="flex gap-5 items-center pl-3 py-3 border border-black border-opacity-50 rounded-t">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex flex-col">
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="text" width={180} height={18} />
            </div>
          </div>
          <div className="flex gap-5 items-center pl-3 py-3 border border-t-0 border-black border-opacity-50 rounded-b">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex flex-col">
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="text" width={200} height={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton; 
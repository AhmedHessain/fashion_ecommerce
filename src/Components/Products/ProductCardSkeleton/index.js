import React from "react";
import { Skeleton } from "@mui/material";
import { Poppins } from "next/font/google";
import cn from "@/utils/cn";

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const ProductCardSkeleton = () => {
  return (
    <div className="rounded-lg bg-item_background shadow-lg shadow-[#ccc] flex flex-col overflow-hidden group max-w-fit">
      {/* upper div */}
      <div className="px-6 flex pt-5 pb-3 flex-1">
        {/* image skeleton */}
        <div className="bg-primary bg-opacity-25 flex justify-center items-center relative shadow-md">
          <div className="w-52 h-52 p-8">
            {/* <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              animation="wave"
            /> */}
          </div>
          <div className="flex flex-col gap-3 absolute top-4 right-3">
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              animation="wave"
            />
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              animation="wave"
            />
          </div>
        </div>
      </div>
      {/* Lower div */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        <Skeleton
          variant="text"
          width={224}
          height={24}
          animation="wave"
          className={cn(poppins.className)}
        />
        <div className="flex items-center gap-3">
          <Skeleton variant="text" width={60} height={20} animation="wave" />
          <Skeleton variant="text" width={60} height={20} animation="wave" />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="text" width={120} height={24} animation="wave" />
          <Skeleton variant="text" width={40} height={24} animation="wave" />
        </div>
      </div>
      <div className="h-10 flex flex-col justify-end">
        <Skeleton
          variant="rectangular"
          width="100%"
          height={40}
          animation="wave"
        />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;

import React from "react";
import { Skeleton } from "@mui/material";
import cn from "@/utils/cn";

const NewArrivalsCardSkeleton = ({ setImageToRight }) => {
  return (
    <div
      className={cn(
        "flex-1 bg-primary rounded shadow-[inset_0_0_30px_5px_rgba(0,0,0,0.25)] flex justify-center items-center relative group animate-pulse",
        { "justify-end max-sm:justify-center": setImageToRight }
      )}
    >
      {/* Image Section */}
      <div className="h-52 w-52 flex justify-center items-center p-9 max-sm:h-36 max-sm:w-32">
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </div>

      {/* Bottom Text Overlay */}
      <div className="text-white bg-[#9A9797] px-8 py-2 bg-opacity-25 absolute bottom-0 left-0 w-full flex flex-col gap-4">
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="90%" height={18} />
        <Skeleton variant="text" width="40%" height={20} />
      </div>
    </div>
  );
};

export default NewArrivalsCardSkeleton;

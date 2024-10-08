import React from "react";
import Image from "next/image";
import cn from "@/utils/cn";
const NewArrivalsCard = ({ setImageToRight }) => {
  return (
    <div
      className={cn(
        "flex-1 bg-primary rounded shadow-[inset_0_0_30px_5px_rgba(0,0,0,0.25)] flex justify-center items-center relative group hover:scale-[1.01] cursor-pointer",
        { "justify-end max-sm:justify-center": setImageToRight }
      )}
    >
      <div className="h-52 w-52 flex justify-center items-center p-9 max-sm:h-36 max-sm:w-32">
        <Image
          src="/tiara.png"
          width="0"
          height="0"
          alt="tiara"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div
        className={cn(
          " text-white custom-text-shadow-lg shadow-black/20 bg-[#9A9797] px-8 py-2 bg-opacity-25 absolute bottom-0 left-0 w-full flex flex-col gap-4"
        )}
      >
        <h4 className="h-6">Tiara Ring</h4>
        <p className={"overflow-hidden text-ellipsis line-clamp-2"}>
          A delicate tiara-inspired ring in rose gold, featuring a central ruby
          and diamond accents for a royal touch
        </p>
        <p className="group-hover:underline h-6">Shop Now</p>
      </div>
    </div>
  );
};

export default NewArrivalsCard;

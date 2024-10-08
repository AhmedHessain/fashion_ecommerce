import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

const CircularLoading = () => {
  return (
    <div className="flex justify-center items-center bg-[#F7F1FA]/50 absolute w-full h-full top-0 left-0 z-10">
      <div className="relative">
        {/* Outer white border for cleaner contrast */}
        <div className="absolute w-20 h-20 rounded-full border-4"></div>
        {/* Circular progress using your purple color */}
        <CircularProgress
          size={80}
          thickness={3}
          sx={{
            color: "#D3B7E0", // Primary purple color
            backgroundColor: "transparent",
            animationDuration: "550ms",
          }}
        />
      </div>
    </div>
  );
};

export default CircularLoading;

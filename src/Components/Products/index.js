import React from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import cn from "@/utils/cn";
import LeftArrowIcon from "@/../public/to-left-arrow-icon.svg";
import RightArrowIcon from "@/../public/to-right-arrow-icon.svg";
const Products = ({ name, title, paginate }) => {
  return (
    <section className="w-full flex flex-col gap-5 items-center">
      <div className="p-8 flex self-stretch justify-between items-center flex-wrap">
        <div className="flex flex-col gap-5">
          <div className="flex gap-2 items-center justify-start">
            <div className="w-5 h-10 bg-primary rounded-lg"></div>
            <div className="text-base text-primary font-semibold">{name}</div>
          </div>
          <h1
            className={cn("text-text text-xl tracking-wide font-bold", {
              hidden: !title,
            })}
          >
            {title}
          </h1>
        </div>
        {paginate ? (
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-[50%] bg-primary flex justify-center items-center cursor-pointer">
              <LeftArrowIcon />
            </div>
            <div className="w-10 h-10 rounded-[50%] bg-primary flex justify-center items-center cursor-pointer">
              <RightArrowIcon />
            </div>
          </div>
        ) : (
          <Link
            href={""}
            className="bg-primary text-center w-60 px-4 py-3 rounded-[4px] text-white text-l hover:bg-primary hover:bg-opacity-75 max-h-fit"
          >
            View All
          </Link>
        )}
      </div>
      <div className="flex gap-x-10 gap-y-5 flex-wrap px-12 justify-center max-sm:px-2">
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
      </div>
      {paginate ? (
        <Link
          href={""}
          className="bg-primary text-center w-60 px-4 py-3 rounded-[4px] text-white text-l hover:bg-primary hover:bg-opacity-75 max-h-fit mt-5"
        >
          View All Products
        </Link>
      ) : null}
    </section>
  );
};

export default Products;

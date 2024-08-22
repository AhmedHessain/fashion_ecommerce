import React from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";

const Products = ({ name, title, data }) => {
  return (
    <section className="w-full flex flex-col gap-5">
      <div className="p-8 flex justify-between items-end">
        <div className="flex flex-col gap-5">
          <div className="flex gap-2 items-center justify-start">
            <div className="w-5 h-10 bg-primary rounded-lg"></div>
            <div className="text-base text-primary font-semibold">{name}</div>
          </div>
          <h1 className="text-text text-xl tracking-wide font-bold">{title}</h1>
        </div>
        <Link
          href={""}
          className="bg-primary text-center w-60 px-4 py-3 rounded-[4px] text-white text-l hover:bg-primary hover:bg-opacity-75 max-h-fit"
        >
          View All
        </Link>
      </div>
      <div className="flex gap-10 flex-wrap px-12 justify-center">
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
      </div>
    </section>
  );
};

export default Products;

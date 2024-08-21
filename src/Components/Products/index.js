import React from "react";
import Link from "next/link";
const Products = ({ name, title, data }) => {
  return (
    <section className="w-full h-96">
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
          className="bg-primary px-20 py-3 rounded-[4px] text-white text-l w-fit hover:bg-primary hover:bg-opacity-75"
        >
          View All
        </Link>
      </div>
    </section>
  );
};

export default Products;

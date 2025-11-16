import React from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import cn from "@/utils/cn";
import LeftArrowIcon from "@/../public/to-left-arrow-icon.svg";
import RightArrowIcon from "@/../public/to-right-arrow-icon.svg";
import ProductCardSkeleton from "@/Components/Products/ProductCardSkeleton";

const Products = ({
  name,
  title,
  paginate,
  data,
  setPage,
  page,
  totalPages,
  isloadingPage,
  isFetchingComplete = false,
  fallback,
}) => {
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
            <div
              className={cn(
                `w-10 h-10 rounded-[50%] bg-primary flex justify-center items-center cursor-pointer`,
                { "bg-opacity-50": page && page <= 1 }
              )}
              onClick={() => {
                setPage((prev) => (prev > 1 ? prev - 1 : prev));
              }}
            >
              <LeftArrowIcon />
            </div>
            <div
              className={cn(
                `w-10 h-10 rounded-[50%] bg-primary flex justify-center items-center cursor-pointer`,
                { "bg-opacity-50": totalPages && page >= totalPages }
              )}
              onClick={() => {
                if (isloadingPage) return;
                if (totalPages && page >= totalPages) return;
                setPage((prev) => prev + 1);
              }}
            >
              <RightArrowIcon />
            </div>
          </div>
        ) : (
          <Link
            href="/products"
            className="bg-primary text-center w-60 px-4 py-3 rounded-[4px] text-white text-l hover:bg-primary hover:bg-opacity-75 max-h-fit"
          >
            View All
          </Link>
        )}
      </div>
      <div className="flex gap-x-10 gap-y-5 flex-wrap px-12 justify-center max-sm:px-2">
        {data && data.length > 0 ? (
          data.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))
        ) : isFetchingComplete ? (
          <>{fallback}</>
        ) : (
          Array(8)
            .fill(0)
            .map((_, index) => (
              <ProductCardSkeleton key={`skeleton-${index}`} />
            ))
        )}
      </div>
      {paginate ? (
        <Link
          href={"/products"}
          className="bg-primary text-center w-60 px-4 py-3 rounded-[4px] text-white text-l hover:bg-primary hover:bg-opacity-75 max-h-fit mt-5"
        >
          View All Products
        </Link>
      ) : null}
    </section>
  );
};

export default Products;

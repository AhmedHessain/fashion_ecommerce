"use client";
import BreakLine from "@/Components/BreakLine";
import Products from "@/Components/Products";
import Image from "next/image";
import Link from "next/link";
import NewArrivals from "@/Components/NewArrivals";
import { useEffect, useState } from "react";
import Services from "@/Components/Services";
export default function Home() {
  const [highestTenSoldProducts, setHighestTenSoldProducts] = useState([]);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [products, setProducts] = useState({});
  useEffect(() => {
    const fetchHighestTenSoldProducts = async () => {
      try {
        const data = await getHighestTenSoldProducts();
        setHighestTenSoldProducts(data.products);
      } catch (error) {
        console.error("Error fetching highest ten sold products:", error);
      }
    };
    fetchHighestTenSoldProducts();
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const ITEMS_PER_PAGE = 8;
        const res = await fetch(
          `/api/products?page=${page}&limit=${ITEMS_PER_PAGE}`,
          {
            next: { revalidate: 60 },
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await res.json();
        if (data.data.length !== ITEMS_PER_PAGE) {
          setTotalPages(page);
        }
        setProducts((prev) => ({
          ...prev,
          [page]: data.data,
        }));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoadingPage(false);
      }
    };
    if (products[page]) return; // If products for the current page are already fetched, skip fetching
    setIsLoadingPage(true);

    !isLoadingPage && fetchProducts();
  }, [page, products, isLoadingPage]);
  const getHighestTenSoldProducts = async () => {
    const res = await fetch(`/api/products/highestTenSoldProducts`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    return res.json();
  };
  return (
    <div className="flex flex-col flex-1">
      <section className="flex">
        <div className="basis-3/4 flex flex-col gap-8 px-28 py-14 justify-center max-md:pr-10 max-sm:px-4">
          <h1 className="text-xxxl max-w-[650px] m-0 tracking-tight leading-[70px]">
            Discover Your Style with Our Exclusive Collection
          </h1>
          <h3 className="text-l m-0 italic">
            Shop the Latest Trends and Must-Have Pieces
          </h3>
          <h4 className="text-base m-0 max-w-[758px]">
            Explore our curated collection designed to fit your unique style.
            Enjoy a seamless shopping experience with personalized
            recommendations, free shipping, and hassle-free returns
          </h4>
          <Link
            href="/products"
            className="bg-primary px-12 py-3 rounded text-white text-l w-fit hover:bg-primary hover:bg-opacity-75"
          >
            {" "}
            Shop Now{" "}
          </Link>
        </div>
        <div className="basis-1/4 bg-primary relative max-sm:hidden">
          <div className="absolute right-[49%] top-0 h-full w-full flex justify-center items-end z-0 pt-8 max-md:hidden">
            <Image
              src="/Hero-img-background.png"
              alt="background"
              width={300}
              height={300}
              className="absolute z-[-1] self-center"
            />
            <Image
              src="/Hero-img.png"
              alt="girl in fashion"
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="h-full"
              quality={100}
            />
          </div>
        </div>
      </section>
      <div className="my-12">
        <Services />
      </div>
      <Products
        name={"This Month"}
        title={"Best Selling Products"}
        data={highestTenSoldProducts}
      />
      <BreakLine />
      <Products
        name={"This Month"}
        title={"Explore Our Products"}
        paginate
        data={products[page]}
        setPage={setPage}
        page={page}
        totalPages={totalPages}
        isLoadingPage={isLoadingPage}
      />
      <BreakLine />
      <NewArrivals />
      <BreakLine />
      <section className="flex flex-col items-center gap-8 bg-[url(/bg.png)] bg-no-repeat bg-[length:100%_200px] bg-center">
        <div className="flex flex-col gap-6 items-center">
          <h3 className="font-bold text-text text-xl text-center">
            Join the Fashion Revolution!
          </h3>
          <p className="text-text text-lg max-w-[950px] text-center">
            Discover more of our stunning collections and find your new favorite
            pieces. Click the button below to start shopping and embrace the
            fashion revolution today!
          </p>
        </div>
        <Link
          href="/products"
          className="bg-primary px-12 py-3 rounded text-white text-l w-fit hover:bg-primary hover:bg-opacity-75"
        >
          {" "}
          Shop Now{" "}
        </Link>
      </section>
    </div>
  );
}

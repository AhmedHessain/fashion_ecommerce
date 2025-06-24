import { useEffect, useState } from "react";
import NewArrivalsCard from "./NewArrivalsCard";
import NewArrivalsCardSkeleton from "./NewArrivalsCardSkeleton";
const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?sort=firstCreatedDate&limit=4", {
          next: { revalidate: 60 },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await res.json();
        setProducts(data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);
  console.log("New Arrivals Products:", products);
  return (
    <section className="w-full flex flex-col gap-5">
      <div className="p-8 flex justify-between items-center">
        <div className="flex flex-col gap-5">
          <div className="flex gap-2 items-center justify-start">
            <div className="w-5 h-10 bg-primary rounded-lg"></div>
            <div className="text-base text-primary font-semibold">Featured</div>
          </div>
          <h1 className="text-text text-xl tracking-wide font-bold">
            New Arrivals
          </h1>
        </div>
      </div>
      <div className="grid grid-cols-4 grid-rows-2 gap-5 px-12 max-md:grid-cols-3 max-sm:grid-cols-1 max-sm:px-2">
        <div className="row-span-2 col-span-2 flex max-md:col-span-3 max-sm:col-span-1 max-sm:row-span-0">
          {products.length === 0 ? (
            <NewArrivalsCardSkeleton setImageToRight />
          ) : (
            <NewArrivalsCard product={products[0]} />
          )}
        </div>
        <div className="col-span-2 flex max-md:col-span-1">
          {products.length === 0 ? (
            <NewArrivalsCardSkeleton setImageToRight />
          ) : (
            <NewArrivalsCard product={products[1]} />
          )}
        </div>
        {products.length === 0 ? (
          <>
            <NewArrivalsCardSkeleton />
            <NewArrivalsCardSkeleton />
          </>
        ) : (
          <>
            <NewArrivalsCard product={products[2]} />
            <NewArrivalsCard product={products[3]} />
          </>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;

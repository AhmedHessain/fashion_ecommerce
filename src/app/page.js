import Products from "@/Components/Products";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col flex-1">
      <section className="flex">
        <div className="basis-3/4 flex flex-col gap-10 px-28 py-14 justify-center max-md:pr-10">
          <h1 className="text-xxxl max-w-[700px] m-0 tracking-tight leading-[70px]">
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
            href={"/"}
            className="bg-primary px-12 py-3 rounded text-white text-l w-fit hover:bg-primary hover:bg-opacity-75"
          >
            {" "}
            Shop Now{" "}
          </Link>
        </div>
        <div className="basis-1/4 bg-primary relative">
          <div className="absolute right-[49%] top-0 h-full w-full flex justify-center items-end z-0 max-md:hidden">
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
              width={170}
              height={170}
            />
          </div>
        </div>
      </section>
      <Products name={"This Month"} title={"Best Selling Products"} />
    </main>
  );
}

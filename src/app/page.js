import BreakLine from "@/Components/BreakLine";
import Products from "@/Components/Products";
import Image from "next/image";
import Link from "next/link";
import NewArrivals from "@/Components/NewArrivals";
export default async function Home() {
  return (
    <main className="flex flex-col flex-1">
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
            href={"/"}
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
      <Products name={"This Month"} title={"Best Selling Products"} />
      <BreakLine />
      <Products name={"This Month"} title={"Explore Our Products"} paginate />
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
          href={"/"}
          className="bg-primary px-12 py-3 rounded text-white text-l w-fit hover:bg-primary hover:bg-opacity-75"
        >
          {" "}
          Shop Now{" "}
        </Link>
      </section>
    </main>
  );
}

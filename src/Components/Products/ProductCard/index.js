"use client";
import { useState } from "react";
import Image from "next/image";
import { Rating } from "@mui/material";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { useUser } from "@/context/userContext";
import { updateUserData } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
import cn from "@/utils/cn";

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const ProductCard = ({ product }) => {
  const { user, setUser } = useUser();
  const [isAnimating, setIsAnimating] = useState(false);

  const isInWishlist = user?.wishlist.includes(product._id);
  const isInCart = user?.cart?.some(
    (item) => item.product.toString() === product._id
  );

  return (
    <Link
      href={`/products/${product._id}`}
      className="relative rounded-lg bg-item_background shadow-lg shadow-[#ccc] flex flex-col overflow-hidden group max-w-fit"
    >
      {/* Green Ribbon - Product in Cart */}
      <AnimatePresence>
        {isInCart && (
          <motion.div
            key="cart-ribbon"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute top-7 left-0 z-10"
          >
            <div
              className="text-white text-[11px] font-semibold shadow-md pl-4 pr-5 py-1"
              style={{
                backgroundColor: "#16a34a", // Tailwind's green-600
                clipPath:
                  "polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)",
                width: "130px",
              }}
            >
              Product in cart
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upper Section */}
      <div className="px-6 flex pt-5 pb-3 flex-1">
        <div className="bg-primary bg-opacity-25 flex justify-center items-center relative shadow-md">
          {/* Product Image */}
          <div className="w-52 h-52 p-8">
            <Image
              src={product.mainImage}
              sizes="(max-width: 768px) 100vw, 33vw"
              width={0}
              height={0}
              alt={product.name}
              className="h-full"
              quality={100}
            />
          </div>

          {/* Sale Tag */}
          {product.priceAfterDiscount && (
            <div className="bg-primary text-white px-5 py-1 rounded absolute top-2 left-3">
              Sale
            </div>
          )}

          {/* Wishlist Button */}
          <div className="flex flex-col gap-3 absolute top-4 right-3">
            <motion.div
              className="flex justify-center items-center rounded-full bg-primary w-10 h-10 cursor-pointer"
              whileTap={{ scale: 0.9 }}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!user || isAnimating) return;

                setIsAnimating(true);
                const updatedWishlist = isInWishlist
                  ? user.wishlist.filter((id) => id !== product._id)
                  : [...user.wishlist, product._id];

                setUser({ ...user, wishlist: updatedWishlist });
                await new Promise((res) => setTimeout(res, 100));
                await updateUserData([{ wishlist: updatedWishlist }]);
                setIsAnimating(false);
              }}
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="22"
                height="22"
                className="scale-100"
              >
                <motion.path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                     2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                     C13.09 3.81 14.76 3 16.5 3
                     19.58 3 22 5.42 22 8.5
                     c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill={isInWishlist ? "#ffffff" : "none"}
                  stroke="#ffffff"
                  strokeWidth={1.8}
                  initial={{ pathLength: 0 }}
                  animate={{
                    pathLength: 1,
                    fill: isInWishlist ? "#ffffff" : "none",
                    transition: {
                      duration: 0.4,
                      ease: "easeInOut",
                    },
                  }}
                />
              </motion.svg>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className={cn("gap-2 flex flex-col p-4", poppins.className)}>
        <p className="font-bold whitespace-break-spaces max-w-[224px]">
          {product.name}
        </p>
        <div className="flex items-center gap-3">
          <p className="text-text font-bold">${product.price}</p>
          {product.priceAfterDiscount && (
            <p className="opacity-50 line-through font-bold">
              ${product.priceAfterDiscount}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Rating name="read-only" value={product.ratingsAverage} readOnly />
          <p className="opacity-50">({product.ratingsQuantity})</p>
        </div>
      </div>

      {/* Add/Remove from Cart */}
      <div className="h-10 flex flex-col justify-end">
        <div
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const updatedCart = isInCart
              ? user.cart.filter(
                  (item) => item.product.toString() !== product._id
                )
              : [...user.cart, { product: product._id, quantity: 1 }];

            setUser({ ...user, cart: updatedCart });
            await new Promise((res) => setTimeout(res, 100));
            await updateUserData([{ cart: updatedCart }]);
          }}
          className={`flex items-center justify-center text-white cursor-pointer transition-all duration-300 overflow-hidden flex-[0] group-hover:flex-1 ${
            isInCart ? "bg-red-600" : "bg-black"
          }`}
        >
          {isInCart ? "Remove from cart" : "Add to cart"}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

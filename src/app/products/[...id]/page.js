"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Inter, Poppins } from "next/font/google";
import { Rating } from "@mui/material";
import HeartIcon from "@/../public/heart-icon.svg";
import { updateUserData } from "@/app/actions";
import { motion } from "framer-motion";
import { useUser } from "@/context/userContext";
import DeliveryIcon from "@/../public/icon-delivery.svg";
import LeftArrowIcon from "@/../public/to-left-arrow-icon.svg";
import RightArrowIcon from "@/../public/to-right-arrow-icon.svg";
import Image from "next/image";
import ProductDetailSkeleton from "@/Components/Products/ProductDetailSkeleton";
import JustForYouProducts from "@/Components/Products/JustForYouProducts";
import { AnimatePresence } from "framer-motion";
const inter = Inter({ subsets: ["latin"], display: "swap" });
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const ProductPage = () => {
  const { id } = useParams();
  const { user, setUser } = useUser();
  const [product, setProduct] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageToZoom, setImageToZoom] = useState(-1);
  const [currentImage, setCurrentImage] = useState(-1);
  useEffect(() => {
    // Fetch product details using the id
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        const product = await response.json();
        setProduct({
          allImages: [product.data.mainImage, ...product.data.otherImages],
          ...product.data,
        });
        setCurrentImage(0);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };
    fetchProductDetails();
  }, [id]);
  const isInCart = user?.cart?.some(
    (item) => item.product.toString() === product._id,
  );
  useEffect(() => {
    if (!user || !product._id) return;

    const existingItem = user.cart?.find(
      (item) => item.product.toString() === product._id,
    );

    if (existingItem) {
      setQuantity(existingItem.quantity);
    }
  }, [user, product._id]);

  return (
    <>
      {!(product.allImages && product.allImages.length > 0) ? (
        <ProductDetailSkeleton />
      ) : (
        <div className="flex flex-col gap-10">
          <div className="flex flex-1 w-full px-36 pt-16 gap-6 max-xl:flex-col max-:px-10 max-sm:px-3">
            <div className="flex-1 min-w-[512px] flex gap-2 max-h-[512px] max-sm:min-w-0">
              <div className="flex-[0.25] flex flex-col gap-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {product.allImages &&
                  product.allImages.length > 0 &&
                  product.allImages.map((image, index) => {
                    return (
                      <div
                        key={image}
                        className="bg-[#FAFAFA] flex justify-center items-center cursor-pointer"
                        onMouseOver={() => {
                          setCurrentImage(index);
                        }}
                        onClick={() => {
                          setImageToZoom(index);
                        }}
                      >
                        <Image
                          src={image}
                          sizes="(max-width: 768px) 100vw, 33vw"
                          width={0}
                          height={0}
                          alt={product.name}
                          className="h-full"
                          quality={100}
                        />
                      </div>
                    );
                  })}
              </div>
              <motion.div
                className="relative flex-[0.75] bg-[#FAFAFA] flex justify-center items-center cursor-pointer"
                onClick={() => {
                  setImageToZoom(currentImage);
                }}
              >
                <AnimatePresence>
                  {isInCart && (
                    <motion.div
                      key="cart-ribbon"
                      initial={{ x: 80, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 80, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute top-6 right-0 bg-[#16a34a] text-white text-[14px] font-semibold px-3 py-1 rounded-l-full shadow-md z-10"
                    >
                      You have{" "}
                      {user?.cart?.find((item) => item.product === product._id)
                        ?.quantity ?? 0}{" "}
                      in cart
                    </motion.div>
                  )}
                </AnimatePresence>

                <Image
                  src={currentImage >= 0 && product.allImages[currentImage]}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  width={0}
                  height={0}
                  alt={product.name}
                  className="h-[75%]"
                  quality={100}
                />
              </motion.div>
            </div>
            <div className="max-w-lg flex-1">
              <h1 className={`text-l font-semibold ${inter.className}`}>
                {product.name}
              </h1>
              <div className="flex items-center mt-3">
                <div className="flex items-center">
                  <Rating
                    name="read-only"
                    value={product.ratingsAverage}
                    readOnly
                  />
                  <p className="opacity-50">
                    ({product.ratingsQuantity} Reviews)
                  </p>
                </div>
                <div className="mx-2">|</div>
                <p
                  className={`${poppins.className} text-[14px] text-primary ${
                    product.quantity >= 1 ? "text-primary" : "text-red-500"
                  }`}
                >
                  {product.quantity >= 1 ? "In Stock" : "Out of Stock"}{" "}
                  <span className="text-[10px] align-middle">
                    ({product.quantity})
                  </span>
                </p>
              </div>
              <p className={`text-l mt-4 ${inter.className}`}>
                ${product.price}
              </p>
              <p className="mt-4">Description: {product.description}</p>
              <div className="py-5 flex">
                <div className="flex-1 border opacity-50 border-[#000000]"></div>
              </div>
              {/* here */}
              <div>
                <div className="flex justify-between max-xl:flex-col gap-4">
                  <div className="flex items-stretch">
                    <div
                      className="px-5 border rounded-l flex items-center cursor-pointer"
                      onClick={() =>
                        setQuantity((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      -
                    </div>
                    <input
                      type="number"
                      value={quantity}
                      max={product.quantity}
                      min={1}
                      onChange={(e) => {
                        const val = +e.target.value;
                        if (val >= 1 && val <= product.quantity) {
                          setQuantity(val);
                        } else if (val === 0 || isNaN(val)) {
                          // Optional: allow clearing to 1 if someone deletes the input
                          setQuantity(1);
                        }
                      }}
                      className="w-32 p-2 border text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <div
                      className="px-5 border rounded-r flex items-center cursor-pointer bg-primary text-white"
                      onClick={() =>
                        setQuantity((prev) =>
                          Math.min(prev + 1, product.quantity),
                        )
                      }
                    >
                      +
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <AnimatePresence mode="wait">
                      {isInCart ? (
                        <motion.div
                          key="in-cart"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col overflow-hidden h-[45px] justify-between"
                        >
                          <button
                            className="bg-primary px-10 h-[40px] rounded text-white text-[19px] self-end max-xl:self-center hover:bg-opacity-75"
                            onClick={async () => {
                              const updatedCart = user.cart.map((item) =>
                                item.product.toString() === product._id
                                  ? { ...item, quantity }
                                  : item,
                              );
                              setUser({ ...user, cart: updatedCart });
                              await updateUserData([{ cart: updatedCart }]);
                            }}
                          >
                            Update cart
                          </button>
                          <button
                            className="text-[12px] text-red-500 hover:text-red-600 self-center"
                            onClick={async () => {
                              const updatedCart = user.cart.filter(
                                (item) =>
                                  item.product.toString() !== product._id,
                              );
                              setUser({ ...user, cart: updatedCart });
                              await updateUserData([{ cart: updatedCart }]);
                            }}
                          >
                            Remove from cart
                          </button>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="add-to-cart"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3 }}
                          className="bg-primary text-white px-10 h-[45px] rounded text-[20px] self-end max-xl:self-center flex items-center justify-center"
                          onClick={async () => {
                            const updatedCart = [
                              ...(user.cart || []),
                              {
                                product: product._id,
                                quantity,
                              },
                            ];
                            setUser({ ...user, cart: updatedCart });
                            await updateUserData([{ cart: updatedCart }]);
                          }}
                        >
                          Add to cart
                        </motion.button>
                      )}
                    </AnimatePresence>

                    <motion.div
                      className="border rounded flex justify-center items-center px-4 border-black border-opacity-50 cursor-pointer"
                      whileTap={{ scale: 0.9 }}
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!user || isAnimating) return;

                        setIsAnimating(true);

                        const alreadyWishlisted = user.wishlist.includes(
                          product._id,
                        );
                        const updatedWishlist = alreadyWishlisted
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
                        width="22" // slightly larger than before
                        height="22"
                        className="scale-100"
                      >
                        <motion.path
                          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
       2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
       C13.09 3.81 14.76 3 16.5 3
       19.58 3 22 5.42 22 8.5
       c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                          fill={
                            user?.wishlist.includes(product._id)
                              ? "#000"
                              : "none"
                          }
                          stroke="#000"
                          strokeWidth={1.8}
                          initial={{ pathLength: 0 }}
                          animate={{
                            pathLength: 1,
                            fill: user?.wishlist.includes(product._id)
                              ? "#000"
                              : "none",
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
                <div className="mt-10">
                  <div className="flex gap-5 items-center pl-3 py-3 border border-black border-opacity-50 rounded-t">
                    <DeliveryIcon />
                    <div className="flex flex-col">
                      <h4
                        className={`${poppins.className} font-medium text-base`}
                      >
                        Free Delivery
                      </h4>
                      <p className={`${poppins.className} text-[12px]`}>
                        Enjoy free delivery to anywhere you want
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-5 items-center pl-3 py-3 border border-t-0 border-black border-opacity-50 rounded-b">
                    <Image
                      src="/icon-return.svg"
                      alt="Return Icon"
                      width={20}
                      height={20}
                    />
                    <div className="flex flex-col">
                      <h4
                        className={`${poppins.className} font-medium text-base`}
                      >
                        Return Delivery
                      </h4>
                      <p className={`${poppins.className} text-[12px]`}>
                        Free 30 Days Delivery Returns.{" "}
                        <span className="underline">Details</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <JustForYouProducts id={product._id} />
        </div>
      )}
      {imageToZoom >= 0 && (
        <div
          className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-20 flex justify-between"
          onClick={() => {
            setImageToZoom(-1);
          }}
        >
          <div
            className="w-20 h-full items-center justify-center flex hover:bg-white hover:bg-opacity-10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setImageToZoom((prev) =>
                prev + 1 > product.allImages.length - 1 ? 0 : prev + 1,
              );
            }}
          >
            <div className="w-10 h-10 rounded-[50%] bg-primary flex justify-center items-center cursor-pointer">
              <LeftArrowIcon />
            </div>
          </div>
          <div className="flex justify-center items-center ">
            <div
              className="p-20 max-xl:p-10 max-xl:h-[320px] flex-1 h-[512px] bg-[#FAFAFA] flex justify-center items-center rounded border-8 border-primary shadow-xl border-opacity-25"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Image
                src={imageToZoom >= 0 && product.allImages[imageToZoom]}
                sizes="(max-width: 768px) 100vw, 33vw"
                width={0}
                height={0}
                alt={product.name}
                className="h-[75%]"
                quality={100}
              />
            </div>
          </div>
          <div
            className="w-20 h-full items-center justify-center flex hover:bg-white hover:bg-opacity-10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setImageToZoom((prev) =>
                prev - 1 < 0 ? product.allImages.length - 1 : prev - 1,
              );
            }}
          >
            <div className="w-10 h-10 rounded-[50%] bg-primary flex justify-center items-center cursor-pointer">
              <RightArrowIcon />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductPage;

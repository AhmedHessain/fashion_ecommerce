"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Poppins } from "next/font/google";
import { useUser } from "@/context/userContext";
import Image from "next/image";
import { updateUserData } from "@/app/actions";
import UpArrow from "@/../public/upArrow.svg";
import DownArrow from "@/../public/downArrow.svg";
import TrashIcon from "@/../public/trashIcon.svg";
import DeliveryIcon from "@/../public/icon-delivery.svg";
import Link from "next/link";
import JustForYouProducts from "@/Components/Products/JustForYouProducts";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-poppins",
});

const Cart = () => {
  const { user, setUser } = useUser();
  const [products, setProducts] = useState({});
  const [error, setError] = useState(null);
  const updateTimeout = useRef(null);

  const updateCart = (productId, newQuantity) => {
    const updatedUserCart = user.cart.map((c) =>
      c.product === productId ? { ...c, quantity: newQuantity } : c,
    );
    setUser({ ...user, cart: updatedUserCart });

    if (updateTimeout.current) clearTimeout(updateTimeout.current);

    updateTimeout.current = setTimeout(async () => {
      await updateUserData([{ cart: updatedUserCart }]);
    }, 300);
  };

  const removeFromCart = async (productId) => {
    const updatedUserCart = user.cart.filter((c) => c.product !== productId);
    setUser({ ...user, cart: updatedUserCart });

    await updateUserData([{ cart: updatedUserCart }]);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user || !user.cart?.length) return;

      const params = new URLSearchParams();
      user.cart.forEach((item) => params.append("_id", item.product));

      try {
        const response = await fetch(`/api/products?${params.toString()}`);
        const res = await response.json();

        const productMap = {};
        res.data.forEach((product) => {
          productMap[product._id] = product;
        });

        setProducts(productMap);
        setError(null);
      } catch (err) {
        setError("Failed to fetch cart products");
      }
    };

    fetchProducts();
  }, [user]);

  // 🟢 Calculate subtotal
  const subtotal = useMemo(() => {
    if (!user?.cart?.length) return 0;
    return user.cart.reduce((acc, item) => {
      const product = products[item.product];
      if (!product) return acc;
      return acc + product.price * item.quantity;
    }, 0);
  }, [user, products]);

  return (
    <>
      <div className="mx-20 mt-16 flex-1 bg-primary bg-opacity-10 rounded-sm p-5 flex flex-col gap-20">
        <div>
          {/* Table Header */}
          <div
            className={`flex w-full text-base font-normal text-left ${poppins.className} bg-primary bg-opacity-25 py-6 px-10`}
          >
            <div className="flex w-full">
              <div className="flex-1">
                <h1>Product</h1>
              </div>
              <div className="flex-1">
                <h1>Price</h1>
              </div>
              <div className="flex-1">
                <h1>Quantity</h1>
              </div>
              <div className="flex-1">
                <h1>Subtotal</h1>
              </div>
              <div className="flex-[0.1]"></div>
            </div>
          </div>

          {/* Cart Items */}
          {user?.cart?.length > 0 ? (
            user.cart.map((cartItem) => {
              const product = products[cartItem.product];
              if (!product) return null;

              return (
                <div
                  key={cartItem.product}
                  className="flex w-full py-5 px-5 items-center bg-primary bg-opacity-25 border-t-[#fff] border-t border-t-opacity-30"
                >
                  <div className="flex items-center flex-1">
                    <Image
                      src={product.mainImage}
                      alt={product.name}
                      width={56}
                      height={56}
                      className="w-14 h-14 object-cover"
                    />
                    {product.name}
                  </div>

                  <div className="flex flex-1">{product.price}$</div>

                  {/* Quantity Controls */}
                  <div className="flex-1 flex">
                    <div className="flex items-center relative">
                      <button
                        className="px-2 py-1 absolute right-0 bottom-2"
                        onClick={() =>
                          updateCart(
                            cartItem.product,
                            Math.max(cartItem.quantity - 1, 1),
                          )
                        }
                      >
                        <DownArrow />
                      </button>

                      <input
                        type="number"
                        value={cartItem.quantity}
                        min="1"
                        className="w-20 text-center border border-black border-opacity-40 rounded bg-transparent pr-3 py-2"
                        onChange={(e) =>
                          updateCart(
                            cartItem.product,
                            Math.max(1, Number(e.target.value)),
                          )
                        }
                      />

                      <button
                        className="px-2 py-1 absolute right-0 top-2"
                        onClick={() =>
                          updateCart(
                            cartItem.product,
                            Math.min(cartItem.quantity + 1, product.quantity),
                          )
                        }
                      >
                        <UpArrow />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    {(product.price * cartItem.quantity).toFixed(2)}$
                  </div>

                  <div
                    className="flex-[0.1] cursor-pointer relative group flex items-center justify-center"
                    onClick={() => removeFromCart(cartItem.product)}
                  >
                    <span className="absolute w-10 h-10 rounded-full bg-black transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-5 transition duration-300 ease-out" />

                    <TrashIcon className="w-9 h-9 relative z-10" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full py-10">
              <h2 className="text-lg">Your cart is empty</h2>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <div
            className={`flex flex-col gap-4 p-5 border-black border-2 rounded-s ${poppins.className} max-w-md flex-1`}
          >
            <h1 className="text-[20px]">Cart Total</h1>

            <p className="text-base flex justify-between">
              Subtotal: <span>${subtotal.toFixed(2)}</span>
            </p>

            <div className="border border-black w-full "></div>

            <p className="text-base flex justify-between">
              Shipping: <span>Free</span>
            </p>

            <div className="border border-black w-full "></div>

            {/* 🟢 Total follows subtotal */}
            <p className="text-base flex justify-between ">
              Total: <span>${subtotal.toFixed(2)}</span>
            </p>

            <Link
              href="/checkout"
              className={`bg-primary text-center self-center px-6 py-4 rounded-[4px] text-white text-base hover:bg-primary hover:bg-opacity-75 ${
                user.cart?.length === 0 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Proceed to Checkout
            </Link>
          </div>

          <div
            className={`flex gap-3 flex-col ${poppins.className} flex-1 max-w-lg`}
          >
            <div className="flex gap-4 items-center bg-primary bg-opacity-25 px-6 py-2 rounded">
              <DeliveryIcon />
              <div className="flex flex-col">
                <h3 className="text-l">Free Delivery</h3>
                <p className="text-base">
                  Enjoy Free Shipping on All Orders Today!
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-center bg-primary bg-opacity-25 px-6 py-2 rounded">
              <Image
                src="/icon-return.svg"
                alt="Return Icon"
                width={20}
                height={20}
              />
              <div className="flex flex-col">
                <h3 className="text-l">Return Delivery</h3>
                <p className="text-base">Free 30 Days Delivery Returns.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <JustForYouProducts />;
    </>
  );
};

export default Cart;

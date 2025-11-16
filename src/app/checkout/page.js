// src/app/checkout/page.js
"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CustomInput from "@/Components/CustomInput";
import { addressSchema } from "@/utils/schema";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { updateUserData } from "@/app/actions";
import { useNotification } from "@/context/NotificationContext";

export default function CheckoutPage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const { showNotification } = useNotification();

  // steps: 0 = Billing, 1 = Payment
  const [step, setStep] = useState(0);
  const [useNewAddress, setUseNewAddress] = useState(
    !user?.addresses?.length > 0
  ); // keep original behaviour
  const defaultAddress = user?.addresses?.find((addr) => addr.isDefault)?._id;
  const [selectedAddress, setSelectedAddress] = useState(
    useNewAddress ? null : defaultAddress || user?.addresses?.[0]?._id || null
  );
  console.log("selectedAddress:", selectedAddress);
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  const [productMap, setProductMap] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  // react-hook-form — used for validating the new-address inputs when required
  const {
    control,
    register,
    getValues,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    resolver: zodResolver(addressSchema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      streetAddress: "",
      apartment: "",
      city: "",
      postalCode: "",
      country: "",
      phone: "",
    },
  });

  // fetch product data for the summary (display-only)
  useEffect(() => {
    if (!user?.cart?.length) {
      setProductMap({});
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingProducts(true);
      try {
        const params = new URLSearchParams();
        user.cart.forEach((c) => params.append("_id", c.product));
        const res = await fetch(`/api/products?${params.toString()}`);
        const json = await res.json();
        if (res.ok && !cancelled) {
          const map = {};
          (json.data || []).forEach((p) => (map[p._id] = p));
          setProductMap(map);
        } else if (!cancelled) {
          setProductMap({});
        }
      } catch (err) {
        console.error("Checkout: product fetch failed", err);
        if (!cancelled) setProductMap({});
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => (cancelled = true);
  }, [user?.cart]);

  // subtotal display-only (small font increase for readability)
  const subtotal = useMemo(() => {
    if (!user?.cart?.length) return 0;
    return user.cart.reduce((acc, it) => {
      const p = productMap[it.product];
      const price = p ? p.priceAfterDiscount ?? p.price : 0;
      return acc + price * it.quantity;
    }, 0);
  }, [user?.cart, productMap]);

  // Move from Billing to Payment
  // If using new address -> validate form; if using saved address -> ensure selectedAddress exists
  const goToPayment = async () => {
    setErrorMessage("");
    if (useNewAddress) {
      // validate via react-hook-form
      const ok = await handleSubmit(
        () => setStep(1),
        () => setErrorMessage("Please fix address fields highlighted.")
      )();
      return ok;
    } else {
      if (!selectedAddress) {
        setErrorMessage(
          "Please select a saved address or choose 'Use a new address'."
        );
        return;
      }
      setStep(1);
    }
  };

  // Place order: send addressId OR newAddress + saveNewAddress. Server calculates totals and snapshots items.
  const placeOrder = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setPlacingOrder(true);

    try {
      const payload = {
        paymentMethod,
        saveNewAddress: !!saveNewAddress,
        status: "pending", // ✅ ensure new orders always start from 'pending'
      };

      if (useNewAddress) {
        // grab values and validate (double-check just in case)
        const vals = getValues();
        console.log("New address vals:", vals);
        if (
          !vals.firstName ||
          !vals.lastName ||
          !vals.phone ||
          !vals.streetAddress ||
          !vals.city ||
          !vals.country ||
          !vals.postalCode
        ) {
          setErrorMessage("Please fill in the full address.");
          setPlacingOrder(false);
          return;
        }
        payload.newAddress = {
          firstName: vals.firstName,
          lastName: vals.lastName,
          streetAddress: vals.streetAddress,
          apartment: vals.apartment,
          phone: vals.phone,
          city: vals.city,
          country: vals.country,
          postalCode: vals.postalCode,
        };
        payload.saveNewAddress = !!saveNewAddress;
      } else {
        if (!selectedAddress) {
          setErrorMessage("Please select an address before placing the order.");
          setPlacingOrder(false);
          return;
        }
        payload.addressId = selectedAddress;
      }

      // POST to server. Server will read cookie-accessToken and user cart, validate prices + stock, create order.
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to place order");
      }

      // Server created the order and cleared server-side cart.
      // Update client user state: clear cart + optionally add saved address locally
      const updatedWishlist = user.wishlist.filter(
        (id) => !Object.keys(productMap).includes(id)
      );
      const updatedUser = {
        ...user,
        cart: [],
        wishlist: updatedWishlist,
        notifications: [
          ...(user.notifications || []),
          {
            message: `Your order #${
              json._id || json.id
            } has been placed successfully!`,
            link: `/orders/${json._id || json.id}`,
            read: false,
            createdAt: new Date(),
          },
        ],
      };
      if (useNewAddress && saveNewAddress && payload.newAddress) {
        updatedUser.addresses = [
          ...(updatedUser.addresses || []),
          payload.newAddress,
        ];
      }

      setUser(updatedUser);
      await new Promise((res) => setTimeout(res, 100));
      await updateUserData([
        { wishlist: updatedWishlist },
        { cart: [] },
        {
          notifications: [
            ...user.notifications,
            {
              message: `Your order #${
                json._id || json.id
              } has been placed successfully!`,
              link: `/orders/${json._id || json.id}`,
              read: false,
              createdAt: new Date(),
            },
          ],
        },
      ]);
      await showNotification({
        title: "Order confirmed!",
        message: `Your order #${json._id} has been confirmed.`,
        link: `/orders/${json._id}`,
      });

      setSuccessMessage("Order placed successfully!");
      reset(); // reset form
      setStep(0);

      // redirect to order details. json should be the created order (populated)
      const orderId = json?._id || json?.id;
      if (orderId) {
        router.push(`/orders/${orderId}`);
      } else {
        router.push("/orders");
      }
    } catch (err) {
      console.error("Checkout.placeOrder error:", err);
      setErrorMessage(
        err?.message || "Something went wrong placing the order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // UX guard: if not logged in or cart empty
  if (!user) {
    return (
      <div className="mx-6 md:mx-20 mt-8">
        <div className="rounded p-8 text-center bg-white shadow">
          <h2 className="text-xl font-semibold">Please sign in</h2>
          <p className="text-gray-600 mt-2">
            Sign in to view your cart and continue checkout.
          </p>
        </div>
      </div>
    );
  }

  if (!user.cart || user.cart.length === 0) {
    return (
      <div className="mx-6 md:mx-20 mt-8">
        <div className="rounded p-8 text-center bg-white shadow">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-gray-600 mt-2">
            Add items to your cart and they&#39;ll appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-6 md:mx-20 mt-8 mb-12">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: main forms */}
        <div className="flex-1">
          {/* Step tabs */}
          <div className="flex justify-between mb-6">
            <div
              className={`flex-1 text-center py-2 border-b-2 ${
                step === 0
                  ? "border-primary text-primary font-semibold"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              Billing Details
            </div>
            <div
              className={`flex-1 text-center py-2 border-b-2 ${
                step === 1
                  ? "border-primary text-primary font-semibold"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              Payment
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded p-6 shadow"
              >
                {/* Saved addresses */}
                {user.addresses?.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold">
                      Choose a saved address
                    </h2>
                    {user.addresses.map((addr, index) => (
                      <label
                        key={
                          addr._id ||
                          `${addr.streetAddress}${
                            addr.apartment ? " " + addr.apartment : ""
                          }`.trim() + addr.postalCode
                        }
                        className={`flex items-start gap-3 border p-3 rounded cursor-pointer ${
                          !useNewAddress && selectedAddress === addr._id
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={
                            !useNewAddress && selectedAddress === addr._id
                          }
                          onChange={() => {
                            setUseNewAddress(false);
                            setSelectedAddress(addr._id);
                          }}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium">
                            {addr.firstName} {addr.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {`${addr.streetAddress}${
                              addr.apartment ? " " + addr.apartment : ""
                            }`.trim()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {addr.city}, {addr.country} - {addr.postalCode}
                          </div>
                          <div className="text-sm text-gray-600">
                            📞 {addr.phone}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* "Use a different address" card (styled like saved addresses) */}
                <label
                  className={`flex items-start gap-3 border p-3 rounded cursor-pointer mt-4 ${
                    useNewAddress ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    checked={useNewAddress}
                    onChange={() => {
                      setUseNewAddress(true);
                      setSelectedAddress(null);
                    }}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">Use a different address</div>
                    <div className="text-sm text-gray-600">
                      Enter a new shipping address
                    </div>
                  </div>
                </label>

                {/* Animated new address inputs */}
                <AnimatePresence>
                  {useNewAddress && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28 }}
                      className="overflow-hidden mt-4"
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <CustomInput
                            name="firstName"
                            label="First Name"
                            control={control}
                            errors={errors}
                            showError
                          />
                          <CustomInput
                            name="lastName"
                            label="Last Name"
                            control={control}
                            errors={errors}
                            showError
                          />
                        </div>

                        <CustomInput
                          name="streetAddress"
                          label="Street Address"
                          control={control}
                          errors={errors}
                          showError
                        />
                        <CustomInput
                          name="apartment"
                          label="Apartment, floor, etc. (optional)"
                          control={control}
                          errors={errors}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <CustomInput
                            name="city"
                            label="Town/City"
                            control={control}
                            errors={errors}
                            showError
                          />
                          <CustomInput
                            name="postalCode"
                            label="Postal Code"
                            control={control}
                            errors={errors}
                            showError
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <CustomInput
                            name="country"
                            label="Country"
                            control={control}
                            errors={errors}
                            showError
                          />
                          <CustomInput
                            name="phone"
                            label="Phone Number"
                            control={control}
                            errors={errors}
                            showError
                          />
                        </div>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={saveNewAddress}
                            onChange={() => setSaveNewAddress((s) => !s)}
                          />
                          <span className="text-sm">
                            Save this address to my profile
                          </span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    className="bg-gray-200 px-6 h-[45px] rounded"
                    onClick={() =>
                      router.back ? router.back() : window.history.back()
                    }
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="bg-primary px-6 h-[45px] rounded text-white"
                    onClick={goToPayment}
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.form
                key="payment"
                onSubmit={async (e) => {
                  e.preventDefault();
                  placeOrder();
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded p-6 shadow"
              >
                <h2 className="text-lg font-semibold mb-3">
                  Select Payment Method
                </h2>

                <div className="flex flex-col gap-3 mb-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    Cash on Delivery
                  </label>
                  <label className="flex items-center gap-3 opacity-60">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Stripe"
                      checked={paymentMethod === "Stripe"}
                      disabled
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    Stripe (Coming soon)
                  </label>
                  <label className="flex items-center gap-3 opacity-60">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PayPal"
                      disabled
                      checked={paymentMethod === "PayPal"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    PayPal (Coming soon)
                  </label>
                </div>

                {errorMessage && (
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                )}
                {successMessage && (
                  <p className="text-green-600 text-sm">{successMessage}</p>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    className="bg-gray-200 px-6 h-[45px] rounded w-full"
                    onClick={() => setStep(0)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={placingOrder}
                    className="bg-primary px-6 h-[45px] rounded text-white w-full disabled:opacity-60"
                  >
                    {placingOrder ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: summary */}
        <aside className="w-full lg:w-96">
          <div className="bg-white rounded p-4 shadow sticky top-6">
            <h3 className="text-lg font-semibold mb-3">Order Summary</h3>

            {loadingProducts ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {user.cart.map((c) => {
                    const p = productMap[c.product];
                    const name = p?.name ?? "Product";
                    const price = p ? p.priceAfterDiscount ?? p.price : 0;
                    return (
                      <div
                        key={c.product}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          {p?.mainImage && (
                            <Image
                              src={p.mainImage}
                              width={48}
                              height={48}
                              alt={name}
                              className="object-cover rounded"
                            />
                          )}
                          <div className="text-[13px]">
                            <div className="font-medium">{name}</div>
                            <div className="text-xs text-gray-500">
                              Qty: {c.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="text-[13px] text-gray-900">
                          ${(price * c.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <div className="border-t pt-3 flex justify-between text-base text-gray-700">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex text-gray-700 justify-between text-base mt-1">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>

                  <div className="flex justify-between text-[18px] font-bold">
                    <span>Total</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

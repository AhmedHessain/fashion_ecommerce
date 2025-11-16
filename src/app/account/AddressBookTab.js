"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/userContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import CustomInput from "@/Components/CustomInput";
import { updateUserData } from "@/app/actions";
import { addressSchema } from "@/utils/schema/index.js";

export default function AddressBook() {
  const { user, setUser } = useUser();
  const [activeAddressId, setActiveAddressId] = useState(null); // null = none, "new" = adding

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      streetAddress: "",
      apartment: "",
      city: "",
      postalCode: "",
      country: "",
      phone: "",
    },
  });

  // Reset form when activeAddressId changes
  useEffect(() => {
    if (activeAddressId && activeAddressId !== "new") {
      const addr = user.addresses.find(
        (a) => a._id.toString() === activeAddressId
      );
      if (addr) reset({ ...addr });
    } else if (activeAddressId === "new") {
      reset({
        firstName: "",
        lastName: "",
        companyName: "",
        streetAddress: "",
        apartment: "",
        city: "",
        postalCode: "",
        country: "",
        phone: "",
      });
    }
  }, [activeAddressId, reset, user.addresses]);

  // Save or update address
  const saveAddress = async (data) => {
    let updatedAddresses = [...(user.addresses || [])];

    if (activeAddressId === "new") {
      const newAddress = { ...data }; // ❌ DO NOT assign _id manually
      if (!updatedAddresses.some((a) => a.isDefault))
        newAddress.isDefault = true;
      updatedAddresses.push(newAddress);
    } else if (activeAddressId && activeAddressId !== "new") {
      updatedAddresses = updatedAddresses.map((addr) =>
        addr._id?.toString() === activeAddressId ? { ...addr, ...data } : addr
      );
    }

    // Update user state optimistically
    setUser({ ...user, addresses: updatedAddresses });

    // Persist to server
    await updateUserData([{ addresses: updatedAddresses }]);

    // Reset
    setActiveAddressId(null);
    reset();
  };

  const deleteAddress = async (_id) => {
    const updatedAddresses = (user.addresses || []).filter(
      (addr) => addr._id?.toString() !== _id
    );

    // Ensure one default remains
    if (!updatedAddresses.some((a) => a.isDefault) && updatedAddresses[0]) {
      updatedAddresses[0].isDefault = true;
    }

    setUser({ ...user, addresses: updatedAddresses });
    await updateUserData([{ addresses: updatedAddresses }]);
  };

  const setDefaultAddress = async (_id) => {
    const updatedAddresses = (user.addresses || []).map((addr) => ({
      ...addr,
      isDefault: addr._id?.toString() === _id,
    }));
    setUser({ ...user, addresses: updatedAddresses });
    await updateUserData([{ addresses: updatedAddresses }]);
  };

  const toggleActive = (_id) => {
    setActiveAddressId((prev) => (prev === _id ? null : _id));
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit(saveAddress)}>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
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
          name="companyName"
          label="Company (optional)"
          control={control}
          errors={errors}
        />

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
            label="City"
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

        <button
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded"
        >
          Save Address
        </button>
      </motion.div>
    </form>
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Address Book</h1>

      <div className="space-y-4 flex flex-col">
        {user.addresses?.map((addr) => (
          <div
            key={addr._id?.toString()}
            className={`p-5 rounded-xl shadow-md bg-white cursor-pointer transition-all ${
              activeAddressId === addr._id?.toString()
                ? "ring-2 ring-primary"
                : ""
            }`}
          >
            <div
              className="flex justify-between items-start gap-4"
              onClick={() => toggleActive(addr._id?.toString())}
            >
              <div className="flex flex-col gap-1">
                <div className="text-lg font-medium">
                  {addr.firstName} {addr.lastName}
                </div>
                <div className="text-base text-gray-700">
                  {addr.streetAddress}
                </div>
                <div className="text-base text-gray-700">
                  {addr.city}, {addr.country} - {addr.postalCode}
                </div>
                <div className="text-base text-gray-700">📞 {addr.phone}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {addr.isDefault && (
                  <span className="text-[12px] font-semibold text-primary">
                    Default
                  </span>
                )}
                <div className="flex gap-2">
                  {!addr.isDefault && (
                    <button
                      className="text-[12px] text-blue-600 underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDefaultAddress(addr._id?.toString());
                      }}
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    className="text-[12px] text-red-600 underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAddress(addr._id?.toString());
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {activeAddressId === addr._id?.toString() && renderForm()}
            </AnimatePresence>
          </div>
        ))}

        <div
          className={`p-5 rounded-xl shadow-md bg-white transition-all ${
            activeAddressId === "new"
              ? "ring-2 ring-primary"
              : "hover:shadow-lg"
          }`}
        >
          <div
            className="text-lg font-medium text-gray-800 cursor-pointer"
            onClick={() => toggleActive("new")}
          >
            + Add New Address
          </div>
          <AnimatePresence>
            {activeAddressId === "new" && renderForm()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

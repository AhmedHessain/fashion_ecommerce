"use client";
import React from "react";
import { useUser } from "@/context/userContext";
import JustForYouProducts from "@/Components/Products/JustForYouProducts";
import { useEffect, useState } from "react";
import Products from "@/Components/Products";

const WishList = () => {
  const { user, setUser } = useUser();
  const [products, setProducts] = useState([]);
  const [isFetchingComplete, setIsFetchingComplete] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchProducts = async () => {
      const params = new URLSearchParams();
      if (!user || !user.wishlist || user.wishlist.length === 0) {
        setProducts([]);
        setIsFetchingComplete(true);
        setError("No products in wishlist");
        return;
      }
      user.wishlist.forEach((id) => params.append("_id", id));
      const queryString = params.toString();
      try {
        const data = await fetch(`/api/products?${queryString}`, {
          method: "GET",
        });

        if (!data.ok) {
          throw new Error("Failed to fetch products");
        }

        const result = await data.json();
        setProducts(result.data);
        setError(null);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchProducts();
  }, [user]);
  return (
    <>
      <Products
        name={"Wishlist"}
        data={products}
        isFetchingComplete={isFetchingComplete}
        fallback={"You don't have any wishlisted products yet."}
      />
      ;
      <JustForYouProducts />;
    </>
  );
};

export default WishList;

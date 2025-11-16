import React, { useEffect, useState } from "react";
import Products from "@/Components/Products";
import { useUser } from "@/context/userContext";

const JustForYouProducts = ({ id }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const { user, setUser } = useUser();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await fetch(
          `/api/products/justForYouProducts${id ? `?_id=${id}` : ""}`,
          {
            method: "GET",
          }
        );
        if (!data.ok) {
          throw new Error("Failed to fetch products");
        }

        const result = await data.json();
        setProducts(result.data);
        setError(null);
        // const params = new URLSearchParams();

        // // Support category as string or array
        // if (Array.isArray(category)) {
        //   category.forEach((cat) => params.append("category", cat));
        // } else if (category) {
        //   params.append("category", category);
        // }

        // // Exclude already displayed product(s)
        // const excludedProducts = [
        //   ...new Set([
        //     ...(user?.wishlist ?? []).map(String),
        //     ...(user?.cart ?? []).map((item) => item.product.toString()),
        //     ...(id ? [id] : []),
        //   ]),
        // ];

        // excludedProducts.forEach((id) => params.append("_id[$nin]", `${id}`));

        // // Exclude specific products if needed
        // const data = await fetch(`/api/products?${params.toString()}`, {
        //   method: "GET",
        // });

        // if (!data.ok) {
        //   throw new Error("Failed to fetch products");
        // }

        // const result = await data.json();
        // let filtered = result.data;

        // // Match tags
        // const matchingTagProducts = filtered.filter((p) =>
        //   p.tags?.some((tag) => tags.includes(tag))
        // );

        // if (matchingTagProducts.length >= 4) {
        //   setProducts(matchingTagProducts.slice(0, 4));
        // } else {
        //   const fallback = filtered.filter(
        //     (p) => !matchingTagProducts.includes(p)
        //   );
        //   setProducts([...matchingTagProducts, ...fallback].slice(0, 4));
        // }
        // setError(null);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchProducts();
  }, [id]);

  return <Products name="Just For You" data={products} />;
};

export default JustForYouProducts;

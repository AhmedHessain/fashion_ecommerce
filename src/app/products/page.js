"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProductCard from "@/Components/Products/ProductCard";
import ProductCardSkeleton from "@/Components/Products/ProductCardSkeleton";
import {
  Alert,
  Snackbar,
  Checkbox,
  FormControlLabel,
  TextField,
  Popover,
  List,
  ListItem,
  ListItemText,
  Slider,
} from "@mui/material";
import cn from "@/utils/cn";
import productsData from "@/data/ProductsData.json";

const categories = [
  "Accessories",
  "Bags",
  "Perfumes",
  "Shoes",
  "Trousers",
  "Tops",
  "Dresses",
  "Jackets",
  "Coats",
];

// Extract unique tags from products
const allTags = [
  ...new Set(productsData.products.flatMap((product) => product.tags)),
];

const ITEMS_PER_PAGE = 8;
const INITIAL_TAGS_SHOWN = 5;

// Get min and max prices from products
const prices = productsData.products.map((product) => product.price);
const MIN_PRICE = Math.floor(Math.min(...prices));
const MAX_PRICE = Math.ceil(Math.max(...prices));

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Tag search states
  const [tagSearchAnchor, setTagSearchAnchor] = useState(null);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();

    // Pagination
    params.append("page", page);
    params.append("limit", ITEMS_PER_PAGE);

    // Sorting
    if (sortBy !== "featured") {
      const sortMap = {
        "price-low-high": "price",
        "price-high-low": "-price",
        rating: "-ratingsAverage",
      };
      params.append("sort", sortMap[sortBy]);
    }

    // Category filter
    if (selectedCategories.length > 0) {
      selectedCategories.forEach((category) => {
        params.append("category", category);
      });
    }

    // Tags filter
    if (selectedTags.length > 0) {
      selectedTags.forEach((tag) => {
        params.append("tags", tag);
      });
    }

    // Price range filter
    params.append("price[gte]", priceRange[0]);
    params.append("price[lte]", priceRange[1]);

    // Search query
    if (searchQuery) {
      params.append("name", searchQuery);
    }

    return params.toString();
  }, [page, sortBy, selectedCategories, selectedTags, priceRange, searchQuery]);

  const fetchProducts = useCallback(
    async (isNewSearch = false) => {
      try {
        setLoading(true);
        const queryString = buildQueryString();
        const data = await fetch(`/api/products?${queryString}`, {
          method: "GET",
        });

        if (!data.ok) {
          throw new Error("Failed to fetch products");
        }

        const result = await data.json();

        if (isNewSearch) {
          setProducts(result.data);
        } else {
          setProducts((prev) => [...prev, ...result.data]);
        }

        setTotalProducts(result.total);
        setHasMore(result.data.length === ITEMS_PER_PAGE);
        setError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
        // Fallback to local data if API fails
        const filteredData = productsData.products.slice(
          0,
          page * ITEMS_PER_PAGE
        );
        setProducts(filteredData);
        setHasMore(filteredData.length < productsData.products.length);
      } finally {
        setLoading(false);
      }
    },
    [buildQueryString, page]
  );

  // Handle price range change
  const handlePriceRangeChange = (event, newValue) => {
    setPage(1);
    setPriceRange(newValue);
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    setPage(1);
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  };

  // Handle tag selection
  const handleTagChange = (tag) => {
    setPage(1);
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      return [...prev, tag];
    });
  };

  // Handle search query change
  const handleSearchChange = (e) => {
    setPage(1);
    setSearchQuery(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setPage(1);
    setSortBy(e.target.value);
  };

  // Filter tags based on search query
  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  // Get initial tags to show
  const initialTags = allTags.slice(0, INITIAL_TAGS_SHOWN);

  // Handle tag search
  const handleTagSearch = (event) => {
    setTagSearchQuery(event.target.value);
    setTagSearchAnchor(event.currentTarget);
  };

  const handleTagSearchClose = () => {
    setTagSearchAnchor(null);
    setTagSearchQuery("");
  };

  // Initial fetch and filter changes
  useEffect(() => {
    setPage(1);
    setProducts([]); // Clear existing products when filters change
    fetchProducts(true);
  }, [selectedCategories, selectedTags, priceRange, searchQuery, sortBy]);

  // Load more on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        if (!loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  // Load more products when page changes
  useEffect(() => {
    if (page > 1) {
      fetchProducts();
    }
  }, [page, fetchProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Price Range</h3>
            <div className="px-2">
              <Slider
                value={priceRange}
                onChange={handlePriceRangeChange}
                valueLabelDisplay="auto"
                step={50}
                min={MIN_PRICE}
                max={MAX_PRICE}
                sx={{
                  color: "#B487C9",
                  "& .MuiSlider-thumb": {
                    "&:hover, &.Mui-focusVisible": {
                      boxShadow:
                        "0px 0px 0px 8px rgb(var(--primary-rgb) / 16%)",
                    },
                  },
                }}
              />
              <div className="relative flex justify-between mt-2 text-sm text-black">
                <span className="absolute -left-2">${priceRange[0]}</span>
                <span className="absolute -right-2">${priceRange[1]}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <FormControlLabel
                  key={category}
                  control={
                    <Checkbox
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      sx={{
                        color: "#ccc",
                        "&.Mui-checked": {
                          color: "var(--primary)",
                        },
                        padding: "4px",
                        "& .MuiSvgIcon-root": {
                          fontSize: "1.2rem",
                        },
                      }}
                    />
                  }
                  label={category}
                  className={cn(
                    "cursor-pointer text-sm",
                    selectedCategories.includes(category) &&
                      "text-primary font-semibold"
                  )}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-col gap-2">
              {/* Initial tags */}
              {initialTags.map((tag) => (
                <FormControlLabel
                  key={tag}
                  control={
                    <Checkbox
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagChange(tag)}
                      sx={{
                        color: "#ccc",
                        "&.Mui-checked": {
                          color: "var(--primary)",
                        },
                        padding: "4px",
                        "& .MuiSvgIcon-root": {
                          fontSize: "1.2rem",
                        },
                      }}
                    />
                  }
                  label={tag}
                  className={cn(
                    "cursor-pointer text-sm",
                    selectedTags.includes(tag) && "text-primary font-semibold"
                  )}
                />
              ))}

              {/* Tag search */}
              <TextField
                placeholder="Search more tags..."
                value={tagSearchQuery}
                onChange={handleTagSearch}
                size="small"
                fullWidth
                className="mt-2"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.875rem",
                  },
                }}
              />

              {/* Tag search results */}
              <Popover
                open={Boolean(tagSearchAnchor)}
                anchorEl={tagSearchAnchor}
                onClose={handleTagSearchClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <List
                  sx={{
                    width: "100%",
                    maxWidth: 360,
                    maxHeight: 300,
                    overflow: "auto",
                  }}
                >
                  {filteredTags.map((tag) => (
                    <ListItem
                      key={tag}
                      button
                      onClick={() => {
                        handleTagChange(tag);
                        handleTagSearchClose();
                      }}
                      sx={{ fontSize: "0.875rem" }}
                    >
                      <ListItemText primary={tag} />
                    </ListItem>
                  ))}
                </List>
              </Popover>

              {/* Selected tags count */}
              {selectedTags.length > 0 && (
                <div className="text-base text-gray-500 mt-2">
                  {selectedTags.length} tag
                  {selectedTags.length !== 1 ? "s" : ""} selected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Search and Sort */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <select
              className="px-4 py-2 border rounded-lg"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="featured">Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* Products flex */}
          <div className="flex gap-x-10 gap-y-5 flex-wrap max-sm:px-2">
            {products.map((product) => (
              <ProductCard key={product.name} product={product} />
            ))}
            {loading &&
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <ProductCardSkeleton key={`skeleton-${index}`} />
                ))}
          </div>

          {!loading && products.length === 0 && (
            <div className="text-center py-8 w-full">
              <p className="text-lg text-gray-500">
                No products found matching your criteria.
              </p>
            </div>
          )}

          {!loading && !hasMore && products.length > 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500">No more products to load</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}

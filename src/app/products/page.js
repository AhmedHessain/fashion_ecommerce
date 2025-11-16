"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProductCard from "@/Components/Products/ProductCard";
import ProductCardSkeleton from "@/Components/Products/ProductCardSkeleton";
import {
  Alert,
  Snackbar,
  Checkbox,
  FormControlLabel,
  Slider,
  Chip,
} from "@mui/material";
import cn from "@/utils/cn";
import { useRouter, useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 8;

// Get min and max prices from products
const MIN_PRICE = 0;

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allTags, setAllTags] = useState([]);
  const [MAX_PRICE, setMaxPrice] = useState(undefined);
  const [products, setProducts] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [urlParsed, setUrlParsed] = useState(false);
  const [categories, setCategories] = useState([]);
  // Tag search states
  const [tagInputValue, setTagInputValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Helper to get array from query param
  const getArrayParam = (param) => {
    const value = searchParams.getAll(param);
    if (value.length > 0) return value;
    const single = searchParams.get(param);
    return single ? [single] : [];
  };

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const res = await fetch("/api/products/meta");
        const data = await res.json();
        const meta = data.metadata || {};
        const tags = meta.tags || [];
        const cats = meta.categories || [];

        const max = meta.priceStats?.maxPrice ?? 0;
        setAllTags(tags);
        setCategories(cats);
        setMaxPrice(max);
        setPriceRange([MIN_PRICE, max]);
      } catch (e) {
        console.error("Failed to load metadata:", e);
        setError("Failed to load filters");
      }
    };

    loadMeta();
  }, []);

  // Parse initial state from URL
  useEffect(() => {
    // Categories
    const urlCategories = getArrayParam("category");
    setSelectedCategories(urlCategories);
    // Tags
    const urlTags = getArrayParam("tags");
    setSelectedTags(urlTags);
    // Price
    const min = parseInt(searchParams.get("min") || MIN_PRICE, 10);
    const max = parseInt(searchParams.get("max") || MAX_PRICE, 10);
    setPriceRange([min, max]);
    // Search
    setSearchQuery(searchParams.get("search") || "");
    // Sort
    setSortBy(searchParams.get("sort") || "featured");
    // Mark URL as parsed
    setUrlParsed(true);
    // eslint-disable-next-line
  }, []);

  // Update URL when filters change (but only after initial URL parsing)
  useEffect(() => {
    if (!urlParsed) return; // Don't update URL during initial parsing

    const params = new URLSearchParams();
    // Categories
    selectedCategories.forEach((cat) => params.append("category", cat));
    // Tags
    selectedTags.forEach((tag) => params.append("tags", tag));
    // Price
    if (priceRange[0] !== MIN_PRICE) params.set("min", priceRange[0]);
    if (priceRange[1] !== MAX_PRICE) params.set("max", priceRange[1]);
    // Search
    if (searchQuery) params.set("search", searchQuery);
    // Sort
    if (sortBy && sortBy !== "featured") params.set("sort", sortBy);
    // Do NOT set page in URL
    router.replace(`?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line
  }, [
    selectedCategories,
    selectedTags,
    priceRange,
    searchQuery,
    sortBy,
    urlParsed,
  ]);

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

        setHasMore(result.data.length === ITEMS_PER_PAGE);
        setError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
      } finally {
        setLoading(false);
        setLoadingTimes((prev) => prev + 1);
      }
    },
    [buildQueryString]
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

  // Get sorted categories with selected ones at the top
  const sortedCategories = [...categories].sort((a, b) => {
    const aSelected = selectedCategories.includes(a);
    const bSelected = selectedCategories.includes(b);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const filteredTags = allTags
      .filter(
        (tag) =>
          tag.toLowerCase().includes(tagInputValue.toLowerCase()) &&
          !selectedTags.includes(tag)
      )
      .slice(0, 5 + selectedTags.length);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredTags.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredTags.length) {
        handleTagChange(filteredTags[selectedIndex]);
        setTagInputValue("");
        setSelectedIndex(-1);
      }
    } else if (e.key === "Escape") {
      setTagInputValue("");
      setSelectedIndex(-1);
    }
  };

  // Reset selected index when input changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [tagInputValue]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagInputValue && !event.target.closest(".tag-input-container")) {
        setTagInputValue("");
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tagInputValue]);

  // Initial fetch and filter changes
  useEffect(() => {
    if (!urlParsed) return; // Wait for URL parsing to complete

    setPage(1);
    setProducts([]); // Clear existing products when filters change
    fetchProducts(true);
  }, [
    selectedCategories,
    selectedTags,
    priceRange,
    searchQuery,
    sortBy,
    urlParsed,
  ]); //adding fetchProducts to dependencies will fuck the scrolling

  // Initial fetch after URL parsing
  useEffect(() => {
    if (urlParsed) {
      fetchProducts(true);
    }
  }, [urlParsed]);

  // Load more on scroll
  const handleScroll = () => {
    console.log(loadingTimes);
    if (
      loadingTimes < 4 &&
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 520
    ) {
      if (!loading && hasMore) {
        setPage((prev) => prev + 1);
      }
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, loadingTimes]);
  useEffect(() => {
    if (loadingTimes === 0) {
      handleScroll(true);
    }
  }, [loadingTimes]);
  // Load more products when page changes
  useEffect(() => {
    if (page > 1) {
      fetchProducts();
    }
  }, [page]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Products Grid */}
        <div className="flex-1">
          {/* Search and Sort */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B487C9] focus:border-transparent transition-all duration-200"
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  borderColor: "#B487C9",
                  color: "#333",
                  "&::placeholder": {
                    color: "#999",
                  },
                }}
              />
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B487C9] focus:border-transparent transition-all duration-200 cursor-pointer"
                value={sortBy}
                onChange={handleSortChange}
                style={{
                  borderColor: "#B487C9",
                  color: "#333",
                  backgroundColor: "white",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23B487C9' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="featured">Featured</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Active Filters Chips */}
            {(selectedCategories.length > 0 ||
              selectedTags.length > 0 ||
              priceRange[0] > MIN_PRICE ||
              priceRange[1] < MAX_PRICE) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCategories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    onDelete={() => handleCategoryChange(category)}
                    sx={{
                      border: "1px solid #B487C9",
                      color: "#B487C9",
                      "& .MuiChip-deleteIcon": {
                        color: "#B487C9",
                        "&:hover": {
                          color: "#B487C9",
                          opacity: 0.8,
                        },
                      },
                    }}
                    variant="outlined"
                  />
                ))}
                {selectedTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleTagChange(tag)}
                    sx={{
                      border: "1px solid #B487C9",
                      color: "#B487C9",
                      "& .MuiChip-deleteIcon": {
                        color: "#B487C9",
                        "&:hover": {
                          color: "#B487C9",
                          opacity: 0.8,
                        },
                      },
                    }}
                    variant="outlined"
                  />
                ))}
                {(priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE) && (
                  <Chip
                    label={`$${priceRange[0]} - $${priceRange[1]}`}
                    onDelete={() => setPriceRange([MIN_PRICE, MAX_PRICE])}
                    sx={{
                      border: "1px solid #B487C9",
                      color: "#B487C9",
                      "& .MuiChip-deleteIcon": {
                        color: "#B487C9",
                        "&:hover": {
                          color: "#B487C9",
                          opacity: 0.8,
                        },
                      },
                    }}
                    variant="outlined"
                  />
                )}
              </div>
            )}
          </div>

          {/* Products flex */}
          <div className="flex gap-x-12 gap-y-5 flex-wrap max-sm:px-2">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
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

          {loadingTimes >= 4 && hasMore && (
            <button
              className="bg-primary px-12 h-[50px] rounded text-white text-l w-full hover:bg-primary hover:bg-opacity-75 mt-10"
              onClick={() => {
                setLoadingTimes(0);
              }}
            >
              Load More Items
            </button>
          )}
        </div>

        {/* Filters Sidebar */}
        <div className="w-full md:w-72 space-y-6">
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
                      boxShadow: "0px 0px 0px 8px rgb(var(#B487C9-rgb) / 16%)",
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
              {sortedCategories.map((category) => (
                <FormControlLabel
                  key={category}
                  control={
                    <Checkbox
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      sx={{
                        color: "#ccc",
                        "&.Mui-checked": {
                          color: "#B487C9",
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
                    "cursor-pointer text-sm ml-0",
                    selectedCategories.includes(category) &&
                      "text-primary font-semibold"
                  )}
                  sx={{
                    "&.MuiFormControlLabel-root": {
                      marginLeft: 0,
                      marginRight: 0,
                    },
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-col gap-2">
              {/* Tag input */}
              <div className="relative tag-input-container">
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={tagInputValue}
                  onChange={(e) => setTagInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    // Small delay to allow click events to register
                    setTimeout(() => {
                      setTagInputValue("");
                      setSelectedIndex(-1);
                    }, 200);
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B487C9] focus:border-transparent transition-all duration-200"
                  style={{
                    borderColor: "#B487C9",
                    color: "#333",
                  }}
                />
                {tagInputValue && (
                  <div className="absolute w-full mt-1 bg-white border border-[#B487C9] rounded-lg shadow-lg z-50">
                    <div className="max-h-60 overflow-y-auto">
                      {allTags
                        .filter(
                          (tag) =>
                            tag
                              .toLowerCase()
                              .includes(tagInputValue.toLowerCase()) &&
                            !selectedTags.includes(tag)
                        )
                        .slice(0, 5)
                        .map((tag, index) => (
                          <div
                            key={tag}
                            onClick={() => {
                              handleTagChange(tag);
                              setTagInputValue("");
                              setSelectedIndex(-1);
                            }}
                            className={`px-4 py-2 cursor-pointer hover:bg-[#B487C9]/10 ${
                              index === selectedIndex ? "bg-[#B487C9]/10" : ""
                            }`}
                            style={{
                              color: "#333",
                              fontWeight: 400,
                            }}
                          >
                            {tag}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags list */}
              <div className="flex flex-col gap-2 mt-2">
                {allTags
                  .sort((a, b) => {
                    const aSelected = selectedTags.includes(a);
                    const bSelected = selectedTags.includes(b);
                    if (aSelected && !bSelected) return -1;
                    if (!aSelected && bSelected) return 1;
                    return 0;
                  })
                  .slice(0, 5 + selectedTags.length)
                  .map((tag) => (
                    <FormControlLabel
                      key={tag}
                      control={
                        <Checkbox
                          checked={selectedTags.includes(tag)}
                          onChange={() => handleTagChange(tag)}
                          sx={{
                            color: "#ccc",
                            "&.Mui-checked": {
                              color: "#B487C9",
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
                        selectedTags.includes(tag) &&
                          "text-primary font-semibold"
                      )}
                      sx={{
                        "&.MuiFormControlLabel-root": {
                          marginLeft: 0,
                          marginRight: 0,
                        },
                      }}
                    />
                  ))}
              </div>

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

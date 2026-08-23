"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/userContext";
import {
  Alert,
  CircularProgress,
  Snackbar,
  Slider,
  Checkbox,
  FormControlLabel,
  Avatar,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { validateImage } from "@/utils/utilFunctions";
import { uploadImageFromBuffer } from "@/utils/cloudinary";
import cn from "@/utils/cn";
import UserEditForm from "./UserEditForm";
import ProductEditForm from "./ProductEditForm";
import OrderEditForm from "./OrderEditForm";
import ReviewEditForm from "./ReviewEditForm";

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

const Dashboard = () => {
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview | users | products | orders | reviews

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalTags: 0,
    priceMin: null,
    priceMax: null,
  });
  // Product filter metadata
  const [productCategoriesMeta, setProductCategoriesMeta] = useState([]);
  const [productTagsMeta, setProductTagsMeta] = useState([]);

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [ordersSummary, setOrdersSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [salesRange, setSalesRange] = useState("6m"); // 3m | 6m | 12m | all

  const [editing, setEditing] = useState({
    type: null,
    record: null,
  }); // type: 'user' | 'product' | 'order' | 'review'

  // Grid filters/search
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userMinOrders, setUserMinOrders] = useState(0);
  const [userMaxOrders, setUserMaxOrders] = useState("");
  const [userMinWishlist, setUserMinWishlist] = useState("");
  const [userMaxWishlist, setUserMaxWishlist] = useState("");
  const [userMinCart, setUserMinCart] = useState("");
  const [userMaxCart, setUserMaxCart] = useState("");
  const [userSortKey, setUserSortKey] = useState("name"); // name | orders | wishlist | cart | signedUp
  const [userSortDir, setUserSortDir] = useState("asc"); // asc | desc
  const [productSearch, setProductSearch] = useState("");
  const [productSelectedCategories, setProductSelectedCategories] = useState(
    []
  );
  const [productSelectedTags, setProductSelectedTags] = useState([]);
  const [productPriceRange, setProductPriceRange] = useState([0, 0]);
  const [productTagInputValue, setProductTagInputValue] = useState("");
  const [productTagSelectedIndex, setProductTagSelectedIndex] = useState(-1);
  const [productMinQty, setProductMinQty] = useState("");
  const [productMaxQty, setProductMaxQty] = useState("");
  const [productSortKey, setProductSortKey] = useState("name"); // name | price | quantity | sales
  const [productSortDir, setProductSortDir] = useState("asc"); // asc | desc
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderMinTotal, setOrderMinTotal] = useState("");
  const [orderMaxTotal, setOrderMaxTotal] = useState("");
  const [orderTotalRange, setOrderTotalRange] = useState([0, 0]);
  const [orderSortKey, setOrderSortKey] = useState("createdAt"); // createdAt | total | status | customer
  const [orderSortDir, setOrderSortDir] = useState("desc"); // asc | desc

  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewMinRating, setReviewMinRating] = useState("");
  const [reviewMaxRating, setReviewMaxRating] = useState("");
  const [reviewSortKey, setReviewSortKey] = useState("date"); // date | rating
  const [reviewSortDir, setReviewSortDir] = useState("desc"); // asc | desc

  // For creation forms (extended fields)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [newUserImage, setNewUserImage] = useState(null);
  const [newUserWarning, setNewUserWarning] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "",
    mainImage: "",
    description: "",
    tags: "",
    otherImages: "",
  });
  const [newProductImage, setNewProductImage] = useState(null);
  const [newProductWarning, setNewProductWarning] = useState("");

  const [newReview, setNewReview] = useState({
    productId: "",
    userId: "",
    rating: "",
    review: "",
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metaRes, usersRes, productsRes, ordersRes, reviewsRes] =
          await Promise.all([
            fetch("/api/products/meta"),
            fetch("/api/admin/users"),
            fetch("/api/admin/products?limit=100&page=1"),
            fetch("/api/admin/orders/summary"),
            fetch("/api/admin/reviews?limit=50"),
          ]);

        if (!metaRes.ok || !usersRes.ok || !productsRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const metaJson = await metaRes.json();
        const usersJson = await usersRes.json();
        const productsJson = await productsRes.json();

        const ordersJson = ordersRes.ok ? await ordersRes.json() : null;
        const reviewsJson = reviewsRes.ok ? await reviewsRes.json() : null;

        const metadata = metaJson.metadata || metaJson.data || metaJson;
        const priceStats = metadata?.priceStats || {};
        const categories = metadata?.categories || [];
        const tags = metadata?.tags || [];

        const usersData = Array.isArray(usersJson.data) ? usersJson.data : [];
        const productsData = Array.isArray(productsJson.data)
          ? productsJson.data
          : productsJson.results || [];

        setStats({
          totalUsers: usersData.length,
          totalProducts: Array.isArray(productsData) ? productsData.length : 0,
          totalCategories: Array.isArray(categories) ? categories.length : 0,
          totalTags: Array.isArray(tags) ? tags.length : 0,
          priceMin:
            typeof priceStats.minPrice === "number"
              ? priceStats.minPrice
              : null,
          priceMax:
            typeof priceStats.maxPrice === "number"
              ? priceStats.maxPrice
              : null,
        });
        setProductCategoriesMeta(Array.isArray(categories) ? categories : []);
        setProductTagsMeta(Array.isArray(tags) ? tags : []);

        setUsers(usersData);
        setProducts(Array.isArray(productsData) ? productsData : []);
        if (ordersJson) setOrdersSummary(ordersJson);
        if (reviewsJson && Array.isArray(reviewsJson.data)) {
          setReviews(reviewsJson.data);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(err.message || "Something went wrong while loading dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Derived price range for products tab (like products page)
  const MIN_PRICE = useMemo(
    () => (typeof stats.priceMin === "number" ? stats.priceMin : 0),
    [stats.priceMin]
  );
  const MAX_PRICE = useMemo(
    () => (typeof stats.priceMax === "number" ? stats.priceMax : 0),
    [stats.priceMax]
  );

  useEffect(() => {
    if (
      typeof stats.priceMin === "number" &&
      typeof stats.priceMax === "number"
    ) {
      setProductPriceRange([stats.priceMin, stats.priceMax]);
    }
  }, [stats.priceMin, stats.priceMax]);

  const isAdmin = user && user.role === "admin";

  const monthlySalesForChart = useMemo(() => {
    if (!ordersSummary || !Array.isArray(ordersSummary.monthlySales)) {
      return [];
    }
    return ordersSummary.monthlySales;
  }, [ordersSummary]);

  const filteredSales = useMemo(() => {
    if (!monthlySalesForChart.length) return [];
    let data = monthlySalesForChart;
    const len = data.length;
    if (salesRange === "3m" && len > 3) data = data.slice(len - 3);
    else if (salesRange === "6m" && len > 6) data = data.slice(len - 6);
    else if (salesRange === "12m" && len > 12) data = data.slice(len - 12);
    return data.map((m) => ({
      label: `${m.month}/${String(m.year).slice(-2)}`,
      revenue: m.revenue,
      orders: m.orders,
    }));
  }, [monthlySalesForChart, salesRange]);

  // New users per month (for charts)
  const monthlyNewUsersMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      if (!u.signedUpAt) return;
      const d = new Date(u.signedUpAt);
      if (Number.isNaN(d.getTime())) return;
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const label = `${month}/${String(year).slice(-2)}`;
      map[label] = (map[label] || 0) + 1;
    });
    return map;
  }, [users]);

  const usersOrdersChartData = useMemo(() => {
    if (!filteredSales.length) return [];
    return filteredSales.map((entry) => ({
      label: entry.label,
      newUsers: monthlyNewUsersMap[entry.label] || 0,
      orders: entry.orders,
    }));
  }, [filteredSales, monthlyNewUsersMap]);

  // Orders count per user (for users table)
  const ordersByUserId = useMemo(() => {
    const map = {};
    if (!ordersSummary || !Array.isArray(ordersSummary.recentOrders)) {
      return map;
    }
    ordersSummary.recentOrders.forEach((o) => {
      if (!o.user?._id) return;
      const id = o.user._id;
      map[id] = (map[id] || 0) + 1;
    });
    return map;
  }, [ordersSummary]);

  // Max values to support sliders in filters
  const userWishlistMax = useMemo(() => {
    if (!users.length) return 0;
    return users.reduce((max, u) => {
      const wl = Array.isArray(u.wishlist) ? u.wishlist.length : 0;
      return wl > max ? wl : max;
    }, 0);
  }, [users]);

  const userCartMax = useMemo(() => {
    if (!users.length) return 0;
    return users.reduce((max, u) => {
      const cartItems = Array.isArray(u.cartItems) ? u.cartItems.length : 0;
      return cartItems > max ? cartItems : max;
    }, 0);
  }, [users]);

  const ordersTotalMax = useMemo(() => {
    if (!ordersSummary || !Array.isArray(ordersSummary.recentOrders)) {
      return 0;
    }
    return ordersSummary.recentOrders.reduce((max, o) => {
      const total = Number(o.totalAmount ?? 0);
      return total > max ? total : max;
    }, 0);
  }, [ordersSummary]);

  // Filtered datasets for grids
  const filteredUsers = useMemo(() => {
    const filtered = users.filter((u) => {
      const search = userSearch.trim().toLowerCase();
      if (search) {
        const haystack = `${u.name || ""} ${u.email || ""}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
      if (userMinOrders > 0) {
        const count = ordersByUserId[u._id] || 0;
        if (count < userMinOrders) return false;
      }

      const ordersCount = ordersByUserId[u._id] || 0;
      const wishlistCount = Array.isArray(u.wishlist) ? u.wishlist.length : 0;
      const cartCount = Array.isArray(u.cart) ? u.cart.length : 0;

      if (userMaxOrders !== "" && ordersCount > Number(userMaxOrders))
        return false;
      if (userMinWishlist !== "" && wishlistCount < Number(userMinWishlist))
        return false;
      if (userMaxWishlist !== "" && wishlistCount > Number(userMaxWishlist))
        return false;
      if (userMinCart !== "" && cartCount < Number(userMinCart)) return false;
      if (userMaxCart !== "" && cartCount > Number(userMaxCart)) return false;

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aOrders = ordersByUserId[a._id] || 0;
      const bOrders = ordersByUserId[b._id] || 0;
      const aWishlist = Array.isArray(a.wishlist) ? a.wishlist.length : 0;
      const bWishlist = Array.isArray(b.wishlist) ? b.wishlist.length : 0;
      const aCart = Array.isArray(a.cart) ? a.cart.length : 0;
      const bCart = Array.isArray(b.cart) ? b.cart.length : 0;

      let aVal;
      let bVal;
      switch (userSortKey) {
        case "orders":
          aVal = aOrders;
          bVal = bOrders;
          break;
        case "wishlist":
          aVal = aWishlist;
          bVal = bWishlist;
          break;
        case "cart":
          aVal = aCart;
          bVal = bCart;
          break;
        case "signedUp":
          aVal = a.signedUpAt ? new Date(a.signedUpAt).getTime() : 0;
          bVal = b.signedUpAt ? new Date(b.signedUpAt).getTime() : 0;
          break;
        case "name":
        default:
          aVal = (a.name || "").toLowerCase();
          bVal = (b.name || "").toLowerCase();
      }

      if (aVal < bVal) return userSortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return userSortDir === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [
    users,
    userSearch,
    userRoleFilter,
    userMinOrders,
    userMaxOrders,
    userMinWishlist,
    userMaxWishlist,
    userMinCart,
    userMaxCart,
    userSortKey,
    userSortDir,
    ordersByUserId,
  ]);

  const userOrdersMax = useMemo(() => {
    const values = Object.values(ordersByUserId || {});
    if (!values.length) return 0;
    return Math.max(...values);
  }, [ordersByUserId]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const search = productSearch.trim().toLowerCase();
      if (search) {
        const haystack = `${p.name || ""} ${p.category || ""}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      if (
        Array.isArray(productSelectedCategories) &&
        productSelectedCategories.length > 0 &&
        p.category &&
        !productSelectedCategories.includes(p.category)
      ) {
        return false;
      }

      if (
        Array.isArray(productSelectedTags) &&
        productSelectedTags.length > 0
      ) {
        const productTags = Array.isArray(p.tags) ? p.tags : [];
        const hasAnyTag = productSelectedTags.some((tag) =>
          productTags.includes(tag)
        );
        if (!hasAnyTag) return false;
      }

      const priceVal = Number(p.price ?? 0);
      const qtyVal = Number(p.quantity ?? 0);

      if (productPriceRange && productPriceRange.length === 2) {
        const [minP, maxP] = productPriceRange;
        if (priceVal < Number(minP) || priceVal > Number(maxP)) return false;
      }
      if (productMinQty !== "" && qtyVal < Number(productMinQty)) return false;
      if (productMaxQty !== "" && qtyVal > Number(productMaxQty)) return false;

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      let aVal;
      let bVal;
      switch (productSortKey) {
        case "price":
          aVal = Number(a.price ?? 0);
          bVal = Number(b.price ?? 0);
          break;
        case "quantity":
          aVal = Number(a.quantity ?? 0);
          bVal = Number(b.quantity ?? 0);
          break;
        case "sales":
          aVal = Number(a.NumOfSales ?? a.numOfSales ?? 0);
          bVal = Number(b.NumOfSales ?? b.numOfSales ?? 0);
          break;
        case "name":
        default:
          aVal = (a.name || "").toLowerCase();
          bVal = (b.name || "").toLowerCase();
      }

      if (aVal < bVal) return productSortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return productSortDir === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [
    products,
    productSearch,
    productSelectedCategories,
    productSelectedTags,
    productPriceRange,
    productMinQty,
    productMaxQty,
    productSortKey,
    productSortDir,
  ]);

  const filteredOrders = useMemo(() => {
    if (!ordersSummary) return [];
    const filtered = ordersSummary.recentOrders.filter((o) => {
      if (
        orderStatusFilter !== "all" &&
        o.status &&
        o.status !== orderStatusFilter
      ) {
        return false;
      }
      const total = Number(o.totalAmount ?? 0);
      if (orderMinTotal !== "" && total < Number(orderMinTotal)) return false;
      if (orderMaxTotal !== "" && total > Number(orderMaxTotal)) return false;
      if (orderTotalRange && orderTotalRange.length === 2) {
        const [minT, maxT] = orderTotalRange;
        if (total < Number(minT) || total > Number(maxT)) return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      let aVal;
      let bVal;
      switch (orderSortKey) {
        case "total":
          aVal = Number(a.totalAmount ?? 0);
          bVal = Number(b.totalAmount ?? 0);
          break;
        case "status":
          aVal = (a.status || "").toLowerCase();
          bVal = (b.status || "").toLowerCase();
          break;
        case "customer":
          aVal = (a.user?.name || "").toLowerCase();
          bVal = (b.user?.name || "").toLowerCase();
          break;
        case "createdAt":
        default:
          aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }

      if (aVal < bVal) return orderSortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return orderSortDir === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [
    ordersSummary,
    orderStatusFilter,
    orderMinTotal,
    orderMaxTotal,
    orderTotalRange,
    orderSortKey,
    orderSortDir,
  ]);

  const filteredReviews = useMemo(() => {
    const search = reviewSearch.trim().toLowerCase();
    const filtered = reviews.filter((r) => {
      const haystack = `${r.product?.name || ""} ${r.user?.name || ""} ${
        r.review || ""
      }`.toLowerCase();
      if (search && !haystack.includes(search)) return false;
      const ratingVal = Number(r.rating ?? 0);
      if (reviewMinRating !== "" && ratingVal < Number(reviewMinRating))
        return false;
      if (reviewMaxRating !== "" && ratingVal > Number(reviewMaxRating))
        return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      let aVal;
      let bVal;
      switch (reviewSortKey) {
        case "rating":
          aVal = Number(a.rating ?? 0);
          bVal = Number(b.rating ?? 0);
          break;
        case "date":
        default:
          aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }
      if (aVal < bVal) return reviewSortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return reviewSortDir === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [
    reviews,
    reviewSearch,
    reviewMinRating,
    reviewMaxRating,
    reviewSortKey,
    reviewSortDir,
  ]);

  // --- Admin actions ---
  const handleUserUpdate = async (id, updates) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update user");
      const data = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, ...data.data } : u))
      );
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const target = users.find((u) => u._id === id);
      if (target?.role === "admin") {
        setError("Admin accounts cannot be deleted.");
        return;
      }
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204)
        throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = undefined;
      if (newUserImage && typeof newUserImage !== "string") {
        const formData = new FormData();
        formData.append("image", newUserImage);
        imageUrl = await uploadImageFromBuffer(formData);
      }

      const payload = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        ...(imageUrl ? { imageUrl } : {}),
      };

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create user");
      const data = await res.json();
      setUsers((prev) => [...prev, data.data]);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "user",
      });
      setNewUserImage(null);
      setNewUserWarning("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to delete product");
      }
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleUpdateProduct = async (id, updates) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update product");
      const data = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...data.data } : p))
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      let mainImage = newProduct.mainImage;
      if (newProductImage && typeof newProductImage !== "string") {
        const fd = new FormData();
        fd.append("image", newProductImage);
        mainImage = await uploadImageFromBuffer(fd);
      }

      const payload = {
        name: newProduct.name,
        price: Number(newProduct.price),
        quantity: Number(newProduct.quantity || 0),
        category: newProduct.category,
        mainImage,
        description: newProduct.description,
        tags: newProduct.tags
          ? newProduct.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        otherImages: newProduct.otherImages
          ? newProduct.otherImages
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      };
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create product");
      const data = await res.json();
      setProducts((prev) => [...prev, data.data]);
      setNewProduct({
        name: "",
        price: "",
        quantity: "",
        category: "",
        mainImage: "",
        description: "",
        tags: "",
        otherImages: "",
      });
      setNewProductImage(null);
      setNewProductWarning("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleOrderStatusChange = async (id, currentStatus, nextStatus) => {
    try {
      const currentIndex = ORDER_STATUSES.indexOf(currentStatus);
      const nextIndex = ORDER_STATUSES.indexOf(nextStatus);
      if (currentIndex === -1 || nextIndex === -1 || nextIndex < currentIndex) {
        return;
      }

      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order status");
      const data = await res.json();
      setOrdersSummary((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentOrders: prev.recentOrders.map((o) => (o._id === id ? data : o)),
        };
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to delete review");
      }
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        product: newReview.productId,
        user: newReview.userId,
        rating: Number(newReview.rating),
        review: newReview.review,
      };
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create review");
      const data = await res.json();
      setReviews((prev) => [...prev, data.data]);
      setNewReview({ productId: "", userId: "", rating: "", review: "" });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const isAdminDashboard = isAdmin;

  return (
    <div className="container mx-auto px-4 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 items-center">
          <div className="w-6 h-12 bg-primary rounded-lg" />
          <span className="text-xl text-primary font-semibold">
            {isAdminDashboard ? "Admin" : "Account"} Dashboard
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          {isAdminDashboard
            ? "Store Management & Analytics"
            : "Overview of your store"}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Manage users, products, orders and reviews from a single place with
          high-level metrics and simple admin actions.
        </p>
      </div>

      {!isAdminDashboard && (
        <Alert severity="info" className="max-w-xl">
          This dashboard is optimized for admin users. Some actions may be
          restricted based on your role.
        </Alert>
      )}

      {/* Main layout with vertical tabs */}
      <div className="flex gap-6">
        {/* Vertical Tabs */}
        <aside className="w-60 shrink-0">
          <nav className="flex flex-col gap-1 text-lg">
            {["overview", "users", "products", "orders", "reviews"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {/* Loading / Error */}
          {loading ? (
            <div className="flex items-center gap-3 text-gray-600 py-10">
              <CircularProgress size={28} />
              <span className="text-lg">Loading dashboard data...</span>
            </div>
          ) : error ? (
            <Alert severity="error" className="max-w-xl">
              {error}
            </Alert>
          ) : (
            <div className="flex flex-col gap-6 py-2">
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <>
                  {/* KPI cards */}
                  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="rounded-xl border border-gray-100 bg-white px-6 py-6 shadow-sm flex flex-col gap-2">
                      <span className="text-base font-medium text-gray-500 uppercase tracking-wide">
                        Total Users
                      </span>
                      <span className="text-4xl font-bold text-gray-900">
                        {stats.totalUsers}
                      </span>
                      <span className="text-sm text-gray-400">
                        From `/api/admin/users`
                      </span>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white px-6 py-6 shadow-sm flex flex-col gap-2">
                      <span className="text-base font-medium text-gray-500 uppercase tracking-wide">
                        Total Products
                      </span>
                      <span className="text-4xl font-bold text-gray-900">
                        {stats.totalProducts}
                      </span>
                      <span className="text-sm text-gray-400">
                        From `/api/admin/products`
                      </span>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white px-6 py-6 shadow-sm flex flex-col gap-2">
                      <span className="text-base font-medium text-gray-500 uppercase tracking-wide">
                        Categories
                      </span>
                      <span className="text-4xl font-bold text-gray-900">
                        {stats.totalCategories}
                      </span>
                      <span className="text-sm text-gray-400">
                        From product metadata
                      </span>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white px-6 py-6 shadow-sm flex flex-col gap-2">
                      <span className="text-base font-medium text-gray-500 uppercase tracking-wide">
                        Tags
                      </span>
                      <span className="text-4xl font-bold text-gray-900">
                        {stats.totalTags}
                      </span>
                      <span className="text-sm text-gray-400">
                        Unique product tags
                      </span>
                    </div>
                  </section>

                  {/* Price & sales */}
                  <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="rounded-xl border border-gray-100 bg-white px-7 py-6 shadow-sm flex flex-col gap-4 col-span-1 lg:col-span-2">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Product Price Overview
                        </h2>
                      </div>
                      {stats.priceMin != null && stats.priceMax != null ? (
                        <p className="text-lg text-gray-700">
                          Current price range across your catalogue is{" "}
                          <span className="font-semibold">
                            ${stats.priceMin.toFixed(2)}
                          </span>{" "}
                          to{" "}
                          <span className="font-semibold">
                            ${stats.priceMax.toFixed(2)}
                          </span>
                          . Use filters on the{" "}
                          <Link
                            href="/products"
                            className="text-primary underline underline-offset-2"
                          >
                            products page
                          </Link>{" "}
                          to explore specific segments.
                        </p>
                      ) : (
                        <p className="text-lg text-gray-500">
                          No price statistics available yet. Add some products
                          first.
                        </p>
                      )}
                    </div>

                    {ordersSummary && (
                      <div className="rounded-xl border border-gray-100 bg-white px-7 py-6 shadow-sm flex flex-col gap-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Orders Snapshot
                        </h2>
                        <p className="text-base text-gray-600">
                          Total orders:{" "}
                          <span className="font-semibold">
                            {ordersSummary.totalOrders}
                          </span>
                        </p>
                        <p className="text-base text-gray-600">
                          Total revenue:{" "}
                          <span className="font-semibold">
                            ${ordersSummary.totalRevenue.toFixed(2)}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          {ordersSummary.statusCounts &&
                            Object.entries(ordersSummary.statusCounts).map(
                              ([status, count]) => (
                                <span
                                  key={status}
                                  className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize"
                                >
                                  {status}:{" "}
                                  <span className="font-semibold">{count}</span>
                                </span>
                              )
                            )}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Revenue charts */}
                  {ordersSummary && filteredSales.length > 0 && (
                    <section className="rounded-xl border border-gray-100 bg-white px-7 py-6 shadow-sm flex flex-col gap-5">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-base text-primary font-semibold">
                            Sales
                          </span>
                          <h2 className="text-2xl font-semibold text-gray-900">
                            Revenue & Orders
                          </h2>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="mr-1">Period:</span>
                          {["3m", "6m", "12m", "all"].map((range) => (
                            <button
                              key={range}
                              onClick={() => setSalesRange(range)}
                              className={`px-3 py-1 rounded-full border text-xs font-medium ${
                                salesRange === range
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              {range === "3m"
                                ? "3M"
                                : range === "6m"
                                ? "6M"
                                : range === "12m"
                                ? "12M"
                                : "All"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={filteredSales}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis
                              yAxisId="left"
                              orientation="left"
                              stroke="#4B5563"
                              tickFormatter={(v) => `$${v}`}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              stroke="#9CA3AF"
                            />
                            <Tooltip />
                            <Legend />
                            <Bar
                              yAxisId="left"
                              dataKey="revenue"
                              fill="#B487C9"
                              name="Revenue"
                            />
                            <Bar
                              yAxisId="right"
                              dataKey="orders"
                              fill="#60A5FA"
                              name="Orders"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="w-full h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={filteredSales}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="#B487C9"
                              name="Revenue"
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="orders"
                              stroke="#60A5FA"
                              name="Orders"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </section>
                  )}

                  {/* New users vs orders chart */}
                  {usersOrdersChartData.length > 0 && (
                    <section className="rounded-xl border border-gray-100 bg-white px-7 py-6 shadow-sm flex flex-col gap-5">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-base text-primary font-semibold">
                            Growth
                          </span>
                          <h2 className="text-2xl font-semibold text-gray-900">
                            New Users vs Orders
                          </h2>
                        </div>
                        <p className="text-sm text-gray-500 max-w-md">
                          Track how many new users joined in each period versus
                          how many orders were placed.
                        </p>
                      </div>
                      <div className="w-full h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={usersOrdersChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="newUsers"
                              stroke="#10B981"
                              name="New Users"
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="orders"
                              stroke="#3B82F6"
                              name="Orders"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* USERS TAB */}
              {activeTab === "users" && (
                <section className="flex flex-col gap-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Users Management
                    </h2>
                    <span className="text-base text-gray-500">
                      Total users: {users.length}
                    </span>
                  </div>

                  {/* Filters / Search */}
                  <div className="flex flex-wrap gap-3 items-center justify-between mb-3 text-sm">
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Search name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="border rounded px-3 py-2 text-sm min-w-[220px]"
                      />
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="border rounded px-3 py-2 text-sm"
                      >
                        <option value="all">All roles</option>
                        <option value="user">User</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          Min orders
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={userMinOrders}
                          onChange={(e) =>
                            setUserMinOrders(Number(e.target.value || 0))
                          }
                          className="border rounded px-2 py-1 text-xs w-20"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          Orders ≤
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={userMaxOrders}
                          onChange={(e) => setUserMaxOrders(e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-20"
                        />
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          Wishlist
                        </span>
                        <input
                          type="number"
                          min={0}
                          placeholder="Min"
                          value={userMinWishlist}
                          onChange={(e) => setUserMinWishlist(e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-20"
                        />
                        <input
                          type="number"
                          min={0}
                          placeholder="Max"
                          value={userMaxWishlist}
                          onChange={(e) => setUserMaxWishlist(e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-20"
                        />
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          Cart
                        </span>
                        <input
                          type="number"
                          min={0}
                          placeholder="Min"
                          value={userMinCart}
                          onChange={(e) => setUserMinCart(e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-20"
                        />
                        <input
                          type="number"
                          min={0}
                          placeholder="Max"
                          value={userMaxCart}
                          onChange={(e) => setUserMaxCart(e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-20"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserSearch("");
                        setUserRoleFilter("all");
                        setUserMinOrders(0);
                        setUserMaxOrders("");
                        setUserMinWishlist("");
                        setUserMaxWishlist("");
                        setUserMinCart("");
                        setUserMaxCart("");
                      }}
                      className="text-xs text-gray-600 hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white px-6 py-5 shadow-sm overflow-x-auto">
                    <table className="min-w-full text-left text-base border-separate border-spacing-y-1">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="py-2 pr-4 font-medium">Avatar</th>
                          <th className="py-2 pr-4 font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setUserSortKey("name");
                                setUserSortDir((prev) =>
                                  userSortKey === "name" && prev === "asc"
                                    ? "desc"
                                    : "asc"
                                );
                              }}
                              className="flex items-center gap-1"
                            >
                              Name
                              <span className="text-xs">
                                {userSortKey === "name"
                                  ? userSortDir === "asc"
                                    ? "▲"
                                    : "▼"
                                  : "⇅"}
                              </span>
                            </button>
                          </th>
                          <th className="py-2 pr-4 font-medium">Email</th>
                          <th className="py-2 pr-4 font-medium">Role</th>
                          <th className="py-2 pr-4 font-medium">Signed Up</th>
                          <th className="py-2 pr-4 font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setUserSortKey("wishlist");
                                setUserSortDir((prev) =>
                                  userSortKey === "wishlist" && prev === "asc"
                                    ? "desc"
                                    : "asc"
                                );
                              }}
                              className="flex items-center gap-1"
                            >
                              Wishlist
                              <span className="text-xs">
                                {userSortKey === "wishlist"
                                  ? userSortDir === "asc"
                                    ? "▲"
                                    : "▼"
                                  : "⇅"}
                              </span>
                            </button>
                          </th>
                          <th className="py-2 pr-4 font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setUserSortKey("cart");
                                setUserSortDir((prev) =>
                                  userSortKey === "cart" && prev === "asc"
                                    ? "desc"
                                    : "asc"
                                );
                              }}
                              className="flex items-center gap-1"
                            >
                              Cart
                              <span className="text-xs">
                                {userSortKey === "cart"
                                  ? userSortDir === "asc"
                                    ? "▲"
                                    : "▼"
                                  : "⇅"}
                              </span>
                            </button>
                          </th>
                          <th className="py-2 pr-4 font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setUserSortKey("orders");
                                setUserSortDir((prev) =>
                                  userSortKey === "orders" && prev === "asc"
                                    ? "desc"
                                    : "asc"
                                );
                              }}
                              className="flex items-center gap-1"
                            >
                              Orders
                              <span className="text-xs">
                                {userSortKey === "orders"
                                  ? userSortDir === "asc"
                                    ? "▲"
                                    : "▼"
                                  : "⇅"}
                              </span>
                            </button>
                          </th>
                          <th className="py-2 pr-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr
                            key={u._id}
                            className="bg-white hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              setEditing({ type: "user", record: u })
                            }
                          >
                            <td className="py-3 pr-4">
                              {u.imageUrl ? (
                                <img
                                  src={u.imageUrl}
                                  alt={u.name}
                                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                  N/A
                                </div>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-gray-900">
                              {u.name}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {u.email}
                            </td>
                            <td className="py-3 pr-4 text-gray-600 capitalize">
                              {u.role}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {u.signedUpAt
                                ? new Date(u.signedUpAt).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {Array.isArray(u.wishlist)
                                ? u.wishlist.length
                                : 0}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {Array.isArray(u.cart) ? u.cart.length : 0}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {ordersByUserId[u._id] || 0}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {u.role === "admin" ? (
                                <span className="text-xs text-gray-400">
                                  Protected
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUser(u._id);
                                  }}
                                  className="text-red-600 text-xs hover:underline"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <form
                    onSubmit={handleCreateUser}
                    className="rounded-xl border border-gray-100 bg-white px-6 py-5 shadow-sm flex flex-col gap-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      Add new user
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm items-center">
                      {/* Avatar upload */}
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          id="admin-new-user-img"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (
                              file &&
                              validateImage(file, setNewUserWarning)
                            ) {
                              setNewUserImage(file);
                            }
                          }}
                        />
                        <div className="flex relative">
                          <label
                            className="relative min-w-[50px] overflow-hidden rounded-[50%] group cursor-pointer self-center border"
                            htmlFor="admin-new-user-img"
                          >
                            <Avatar
                              sx={{
                                width: 50,
                                height: 50,
                              }}
                              imgProps={{
                                style: {
                                  objectPosition: "top",
                                },
                              }}
                              src={
                                newUserImage && typeof newUserImage === "object"
                                  ? URL.createObjectURL(newUserImage)
                                  : undefined
                              }
                            />
                            <div className="border-t-0 border-cyan-50 bg-[#BDBDBD] flex justify-center items-center absolute bottom-0 w-full overflow-hidden h-0 group-hover:h-5 group-hover:border-t transition-all">
                              <AddAPhotoIcon
                                sx={{ color: "black", width: 10, height: 10 }}
                              />
                            </div>
                          </label>
                          {newUserImage && (
                            <div
                              className="absolute top-0 left-0 bg-white rounded-[50%] flex"
                              onClick={() => {
                                setNewUserImage(null);
                              }}
                            >
                              <HighlightOffIcon
                                sx={{
                                  cursor: "pointer",
                                  color: "black",
                                  fontSize: 16,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <input
                        required
                        type="text"
                        placeholder="Name"
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser((p) => ({ ...p, name: e.target.value }))
                        }
                        className="border rounded px-3 py-2"
                      />
                      <input
                        required
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser((p) => ({ ...p, email: e.target.value }))
                        }
                        className="border rounded px-3 py-2"
                      />
                      <input
                        required
                        type="password"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser((p) => ({
                            ...p,
                            password: e.target.value,
                          }))
                        }
                        className="border rounded px-3 py-2"
                      />
                      <select
                        value={newUser.role}
                        onChange={(e) =>
                          setNewUser((p) => ({ ...p, role: e.target.value }))
                        }
                        className="border rounded px-3 py-2"
                      >
                        <option value="user">user</option>
                        <option value="editor">editor</option>
                        <option value="admin">admin</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded text-sm w-fit mt-1 hover:bg-primary hover:bg-opacity-80"
                    >
                      Create User
                    </button>
                    {newUserWarning && (
                      <p className="text-xs text-amber-600">{newUserWarning}</p>
                    )}
                  </form>
                </section>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === "products" && (
                <section className="flex flex-col gap-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Products Management
                    </h2>
                    <span className="text-base text-gray-500">
                      Showing {filteredProducts.length} of {products.length}{" "}
                      products
                    </span>
                  </div>

                  {/* Filters / Search */}
                  <div className="flex flex-col gap-4 mb-3 text-sm">
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                      <input
                        type="text"
                        placeholder="Search name or category..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="border rounded px-3 py-2 text-sm min-w-[220px]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProductSearch("");
                          setProductSelectedCategories([]);
                          setProductSelectedTags([]);
                          setProductPriceRange([MIN_PRICE, MAX_PRICE]);
                          setProductMinQty("");
                          setProductMaxQty("");
                        }}
                        className="text-xs text-gray-600 hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>

                    {/* Price range slider (like products page) */}
                    <div className="px-2 max-w-xl">
                      <Slider
                        value={productPriceRange}
                        onChange={(_, newValue) => {
                          setProductPriceRange(newValue);
                        }}
                        valueLabelDisplay="auto"
                        step={50}
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        sx={{
                          color: "#B487C9",
                          "& .MuiSlider-thumb": {
                            "&:hover, &.Mui-focusVisible": {
                              boxShadow:
                                "0px 0px 0px 8px rgb(var(#B487C9-rgb) / 16%)",
                            },
                          },
                        }}
                      />
                      <div className="relative flex justify-between mt-2 text-sm text-black">
                        <span className="absolute -left-2">
                          ${productPriceRange[0]}
                        </span>
                        <span className="absolute -right-2">
                          ${productPriceRange[1]}
                        </span>
                      </div>
                    </div>

                    {/* Categories & Tags (like products page) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-base font-semibold mb-2">
                          Categories
                        </h3>
                        <div className="flex flex-col gap-2">
                          {(
                            (productCategoriesMeta.length
                              ? productCategoriesMeta
                              : Array.from(
                                  new Set(
                                    products
                                      .map((p) => p.category)
                                      .filter(Boolean)
                                  )
                                )) || []
                          )
                            .sort((a, b) => {
                              const aSelected =
                                productSelectedCategories.includes(a);
                              const bSelected =
                                productSelectedCategories.includes(b);
                              if (aSelected && !bSelected) return -1;
                              if (!aSelected && bSelected) return 1;
                              return 0;
                            })
                            .map((category) => (
                              <FormControlLabel
                                key={category}
                                control={
                                  <Checkbox
                                    checked={productSelectedCategories.includes(
                                      category
                                    )}
                                    onChange={() => {
                                      setProductSelectedCategories((prev) =>
                                        prev.includes(category)
                                          ? prev.filter((c) => c !== category)
                                          : [...prev, category]
                                      );
                                    }}
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
                                  productSelectedCategories.includes(
                                    category
                                  ) && "text-primary font-semibold"
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
                        <h3 className="text-base font-semibold mb-2">Tags</h3>
                        <div className="flex flex-col gap-2">
                          {/* Tag input */}
                          <div className="relative tag-input-container">
                            <input
                              type="text"
                              placeholder="Search tags..."
                              value={productTagInputValue}
                              onChange={(e) =>
                                setProductTagInputValue(e.target.value)
                              }
                              onKeyDown={(e) => {
                                const filteredTags = productTagsMeta
                                  .filter(
                                    (tag) =>
                                      tag
                                        .toLowerCase()
                                        .includes(
                                          productTagInputValue.toLowerCase()
                                        ) && !productSelectedTags.includes(tag)
                                  )
                                  .slice(0, 5);

                                if (e.key === "ArrowDown") {
                                  e.preventDefault();
                                  setProductTagSelectedIndex((prev) =>
                                    prev < filteredTags.length - 1
                                      ? prev + 1
                                      : 0
                                  );
                                } else if (e.key === "ArrowUp") {
                                  e.preventDefault();
                                  setProductTagSelectedIndex((prev) =>
                                    prev > 0
                                      ? prev - 1
                                      : filteredTags.length - 1
                                  );
                                } else if (e.key === "Enter") {
                                  e.preventDefault();
                                  const selected =
                                    filteredTags[productTagSelectedIndex];
                                  if (selected) {
                                    setProductSelectedTags((prev) => [
                                      ...prev,
                                      selected,
                                    ]);
                                    setProductTagInputValue("");
                                    setProductTagSelectedIndex(-1);
                                  }
                                }
                              }}
                              onBlur={() => {
                                setTimeout(() => {
                                  setProductTagInputValue("");
                                  setProductTagSelectedIndex(-1);
                                }, 200);
                              }}
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B487C9] focus:border-transparent transition-all duration-200"
                              style={{
                                borderColor: "#B487C9",
                                color: "#333",
                              }}
                            />
                            {productTagInputValue && (
                              <div className="absolute w-full mt-1 bg-white border border-[#B487C9] rounded-lg shadow-lg z-50">
                                <div className="max-h-60 overflow-y-auto">
                                  {productTagsMeta
                                    .filter(
                                      (tag) =>
                                        tag
                                          .toLowerCase()
                                          .includes(
                                            productTagInputValue.toLowerCase()
                                          ) &&
                                        !productSelectedTags.includes(tag)
                                    )
                                    .slice(0, 5)
                                    .map((tag, index) => (
                                      <div
                                        key={tag}
                                        onClick={() => {
                                          setProductSelectedTags((prev) => [
                                            ...prev,
                                            tag,
                                          ]);
                                          setProductTagInputValue("");
                                          setProductTagSelectedIndex(-1);
                                        }}
                                        className={`px-4 py-2 cursor-pointer hover:bg-[#B487C9]/10 ${
                                          index === productTagSelectedIndex
                                            ? "bg-[#B487C9]/10"
                                            : ""
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
                            {productTagsMeta
                              .slice()
                              .sort((a, b) => {
                                const aSelected =
                                  productSelectedTags.includes(a);
                                const bSelected =
                                  productSelectedTags.includes(b);
                                if (aSelected && !bSelected) return -1;
                                if (!aSelected && bSelected) return 1;
                                return 0;
                              })
                              .slice(0, 5 + productSelectedTags.length)
                              .map((tag) => (
                                <FormControlLabel
                                  key={tag}
                                  control={
                                    <Checkbox
                                      checked={productSelectedTags.includes(
                                        tag
                                      )}
                                      onChange={() => {
                                        setProductSelectedTags((prev) =>
                                          prev.includes(tag)
                                            ? prev.filter((t) => t !== tag)
                                            : [...prev, tag]
                                        );
                                      }}
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
                                    productSelectedTags.includes(tag) &&
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
                          {productSelectedTags.length > 0 && (
                            <div className="text-base text-gray-500 mt-2">
                              {productSelectedTags.length} tag
                              {productSelectedTags.length !== 1 ? "s" : ""}{" "}
                              selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity range (still numeric inputs) */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        Qty
                      </span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={productMinQty}
                        onChange={(e) => setProductMinQty(e.target.value)}
                        className="border rounded px-2 py-1 text-xs w-20"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={productMaxQty}
                        onChange={(e) => setProductMaxQty(e.target.value)}
                        className="border rounded px-2 py-1 text-xs w-20"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white px-6 py-5 shadow-sm overflow-x-auto">
                    <table className="min-w-full text-left text-base border-separate border-spacing-y-1">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="py-2 pr-4 font-medium">Image</th>
                          <th className="py-2 pr-4 font-medium">
                            <button
                              type="button"
                              onClick={() =>
                                setProductSortKey((prev) =>
                                  prev === "name" ? "name" : "name"
                                ) ||
                                setProductSortDir((prev) =>
                                  productSortKey === "name" && prev === "asc"
                                    ? "desc"
                                    : "asc"
                                )
                              }
                              className="flex items-center gap-1"
                            >
                              Name
                              <span className="text-xs">
                                {productSortKey === "name"
                                  ? productSortDir === "asc"
                                    ? "▲"
                                    : "▼"
                                  : "⇅"}
                              </span>
                            </button>
                          </th>
                          <th className="py-2 pr-4 font-medium">Category</th>
                          <th className="py-2 pr-4 font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setProductSortKey("price");
                                setProductSortDir((prev) =>
                                  productSortKey === "price" && prev === "asc"
                                    ? "desc"
                                    : "asc"
                                );
                              }}
                              className="flex items-center gap-1"
                            >
                              Price
                              <span className="text-xs">
                                {productSortKey === "price"
                                  ? productSortDir === "asc"
                                    ? "▲"
                                    : "▼"
                                  : "⇅"}
                              </span>
                            </button>
                          </th>
                          <th className="py-2 pr-4 font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setProductSortKey("quantity");
                                setProductSortDir((prev) =>
                                  productSortKey === "quantity" &&
                                  prev === "asc"
                                    ? "desc"
                                    : "asc"
                                );
                              }}
                              className="flex items-center gap-1"
                            >
                              Qty
                              <span className="text-xs">
                                {productSortKey === "quantity"
                                  ? productSortDir === "asc"
                                    ? "▲"
                                    : "▼"
                                  : "⇅"}
                              </span>
                            </button>
                          </th>
                          <th className="py-2 pr-4 font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setProductSortKey("sales");
                                setProductSortDir((prev) =>
                                  productSortKey === "sales" && prev === "asc"
                                    ? "desc"
                                    : "asc"
                                );
                              }}
                              className="flex items-center gap-1"
                            >
                              Sales
                              <span className="text-xs">
                                {productSortKey === "sales"
                                  ? productSortDir === "asc"
                                    ? "▲"
                                    : "▼"
                                  : "⇅"}
                              </span>
                            </button>
                          </th>
                          <th className="py-2 pr-4 font-medium">Rating</th>
                          <th className="py-2 pr-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((p) => (
                          <tr
                            key={p._id}
                            className="bg-white hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              setEditing({ type: "product", record: p })
                            }
                          >
                            <td className="py-3 pr-4">
                              {p.mainImage ? (
                                <img
                                  src={p.mainImage}
                                  alt={p.name}
                                  className="w-12 h-12 rounded-md object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                  N/A
                                </div>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-gray-900">
                              {p.name}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {p.category}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              ${Number(p.price).toFixed(2)}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {p.quantity}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {p.NumOfSales ?? p.numOfSales ?? 0}
                            </td>
                            <td className="py-2 pr-4 text-gray-600">
                              {p.ratingsAverage?.toFixed
                                ? p.ratingsAverage.toFixed(1)
                                : p.ratingsAverage ?? 0}
                            </td>
                            <td className="py-3 pr-4 text-gray-600 space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateProduct(p._id, { quantity: 0 });
                                }}
                                className="text-xs text-amber-600 hover:underline"
                              >
                                Mark out of stock
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProduct(p._id);
                                }}
                                className="text-xs text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <form
                    onSubmit={handleCreateProduct}
                    className="rounded-xl border border-gray-100 bg-white px-6 py-5 shadow-sm flex flex-col gap-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      Add new product (required fields only)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm items-center">
                      {/* Product image upload */}
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          id="admin-new-product-img"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (
                              file &&
                              validateImage(file, setNewProductWarning)
                            ) {
                              setNewProductImage(file);
                            }
                          }}
                        />
                        <div className="flex relative">
                          <label
                            className="relative w-14 h-14 overflow-hidden rounded-md group cursor-pointer self-center border"
                            htmlFor="admin-new-product-img"
                          >
                            {newProductImage ? (
                              <img
                                src={URL.createObjectURL(newProductImage)}
                                alt={newProduct.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                Image
                              </div>
                            )}
                            <div className="border-t-0 border-cyan-50 bg-[#BDBDBD] flex justify-center items-center absolute bottom-0 w-full overflow-hidden h-0 group-hover:h-5 group-hover:border-t transition-all">
                              <AddAPhotoIcon
                                sx={{ color: "black", width: 10, height: 10 }}
                              />
                            </div>
                          </label>
                          {newProductImage && (
                            <div
                              className="absolute -top-1 -right-1 bg-white rounded-full flex"
                              onClick={() => {
                                setNewProductImage(null);
                              }}
                            >
                              <HighlightOffIcon
                                sx={{
                                  cursor: "pointer",
                                  color: "black",
                                  fontSize: 16,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <input
                        required
                        type="text"
                        placeholder="Name"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct((p) => ({ ...p, name: e.target.value }))
                        }
                        className="border rounded px-3 py-2"
                      />
                      <input
                        required
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct((p) => ({
                            ...p,
                            price: e.target.value,
                          }))
                        }
                        className="border rounded px-3 py-2"
                      />
                      <input
                        required
                        type="number"
                        placeholder="Quantity"
                        value={newProduct.quantity}
                        onChange={(e) =>
                          setNewProduct((p) => ({
                            ...p,
                            quantity: e.target.value,
                          }))
                        }
                        className="border rounded px-3 py-2"
                      />
                      <input
                        required
                        type="text"
                        placeholder="Category"
                        value={newProduct.category}
                        onChange={(e) =>
                          setNewProduct((p) => ({
                            ...p,
                            category: e.target.value,
                          }))
                        }
                        className="border rounded px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Main image URL (optional if uploaded)"
                        value={newProduct.mainImage}
                        onChange={(e) =>
                          setNewProduct((p) => ({
                            ...p,
                            mainImage: e.target.value,
                          }))
                        }
                        className="border rounded px-3 py-2"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded text-sm w-fit mt-1 hover:bg-primary hover:bg-opacity-80"
                    >
                      Create Product
                    </button>
                    {newProductWarning && (
                      <p className="text-xs text-amber-600">
                        {newProductWarning}
                      </p>
                    )}
                  </form>
                </section>
              )}

              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <section className="flex flex-col gap-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Orders Management
                    </h2>
                    {ordersSummary && (
                      <span className="text-base text-gray-500">
                        Total orders: {ordersSummary.totalOrders} | Revenue: $
                        {ordersSummary.totalRevenue.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-3 items-center justify-between mb-3 text-sm">
                    <div className="flex flex-wrap gap-2 items-center">
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="border rounded px-3 py-2 text-sm"
                      >
                        <option value="all">All statuses</option>
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          Total
                        </span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={orderMinTotal}
                          onChange={(e) => setOrderMinTotal(e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-24"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={orderMaxTotal}
                          onChange={(e) => setOrderMaxTotal(e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-24"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderStatusFilter("all");
                        setOrderMinTotal("");
                        setOrderMaxTotal("");
                      }}
                      className="text-xs text-gray-600 hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>

                  {ordersSummary ? (
                    <div className="rounded-xl border border-gray-100 bg-white px-6 py-5 shadow-sm overflow-x-auto">
                      <table className="min-w-full text-left text-base border-separate border-spacing-y-1">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="py-2 pr-4 font-medium">
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderSortKey("customer");
                                  setOrderSortDir((prev) =>
                                    orderSortKey === "customer" &&
                                    prev === "asc"
                                      ? "desc"
                                      : "asc"
                                  );
                                }}
                                className="flex items-center gap-1"
                              >
                                Customer
                                <span className="text-xs">
                                  {orderSortKey === "customer"
                                    ? orderSortDir === "asc"
                                      ? "▲"
                                      : "▼"
                                    : "⇅"}
                                </span>
                              </button>
                            </th>
                            <th className="py-2 pr-4 font-medium">
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderSortKey("total");
                                  setOrderSortDir((prev) =>
                                    orderSortKey === "total" && prev === "asc"
                                      ? "desc"
                                      : "asc"
                                  );
                                }}
                                className="flex items-center gap-1"
                              >
                                Total
                                <span className="text-xs">
                                  {orderSortKey === "total"
                                    ? orderSortDir === "asc"
                                      ? "▲"
                                      : "▼"
                                    : "⇅"}
                                </span>
                              </button>
                            </th>
                            <th className="py-2 pr-4 font-medium">
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderSortKey("status");
                                  setOrderSortDir((prev) =>
                                    orderSortKey === "status" && prev === "asc"
                                      ? "desc"
                                      : "asc"
                                  );
                                }}
                                className="flex items-center gap-1"
                              >
                                Status
                                <span className="text-xs">
                                  {orderSortKey === "status"
                                    ? orderSortDir === "asc"
                                      ? "▲"
                                      : "▼"
                                    : "⇅"}
                                </span>
                              </button>
                            </th>
                            <th className="py-2 pr-4 font-medium">Items</th>
                            <th className="py-2 pr-4 font-medium">
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderSortKey("createdAt");
                                  setOrderSortDir((prev) =>
                                    orderSortKey === "createdAt" &&
                                    prev === "asc"
                                      ? "desc"
                                      : "asc"
                                  );
                                }}
                                className="flex items-center gap-1"
                              >
                                Created
                                <span className="text-xs">
                                  {orderSortKey === "createdAt"
                                    ? orderSortDir === "asc"
                                      ? "▲"
                                      : "▼"
                                    : "⇅"}
                                </span>
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((o) => (
                            <tr
                              key={o._id}
                              className="bg-white hover:bg-gray-50 cursor-pointer"
                              onClick={() =>
                                setEditing({ type: "order", record: o })
                              }
                            >
                              <td className="py-3 pr-4 text-gray-900">
                                {o.user?.name || "Unknown"}
                              </td>
                              <td className="py-3 pr-4 text-gray-600">
                                ${o.totalAmount.toFixed(2)}
                              </td>
                              <td className="py-3 pr-4 text-gray-600 capitalize">
                                {o.status}
                              </td>
                              <td className="py-3 pr-4 text-gray-600 max-w-xs">
                                {Array.isArray(o.items) && o.items.length > 0
                                  ? o.items
                                      .map(
                                        (it) =>
                                          `${it.product?.name || "Item"} x${
                                            it.quantity
                                          }`
                                      )
                                      .join(", ")
                                  : "No items"}
                              </td>
                              <td className="py-3 pr-4 text-gray-600">
                                {o.createdAt
                                  ? new Date(o.createdAt).toLocaleDateString()
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-base text-gray-500">
                      No order data available yet.
                    </p>
                  )}
                </section>
              )}

              {/* REVIEWS TAB */}
              {activeTab === "reviews" && (
                <section className="flex flex-col gap-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Reviews Management
                    </h2>
                    <span className="text-base text-gray-500">
                      Total loaded: {filteredReviews.length}
                    </span>
                  </div>

                  {/* Filters / search */}
                  <div className="flex flex-wrap gap-3 items-center justify-between mb-3 text-sm">
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Search product, user or review text..."
                        value={reviewSearch}
                        onChange={(e) => setReviewSearch(e.target.value)}
                        className="border rounded px-3 py-2 text-sm min-w-[260px]"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          Rating
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          step="0.1"
                          placeholder="Min"
                          value={reviewMinRating}
                          onChange={(e) => setReviewMinRating(e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-20"
                        />
                        <input
                          type="number"
                          min={1}
                          max={5}
                          step="0.1"
                          placeholder="Max"
                          value={reviewMaxRating}
                          onChange={(e) => setReviewMaxRating(e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-20"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewSearch("");
                        setReviewMinRating("");
                        setReviewMaxRating("");
                      }}
                      className="text-xs text-gray-600 hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white px-6 py-5 shadow-sm overflow-x-auto">
                    <table className="min-w-full text-left text-base border-separate border-spacing-y-1">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="py-2 pr-4 font-medium">Product</th>
                          <th className="py-2 pr-4 font-medium">User</th>
                          <th className="py-2 pr-4 font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setReviewSortKey("rating");
                                setReviewSortDir((prev) =>
                                  reviewSortKey === "rating" && prev === "asc"
                                    ? "desc"
                                    : "asc"
                                );
                              }}
                              className="flex items-center gap-1"
                            >
                              Rating
                              <span className="text-xs">
                                {reviewSortKey === "rating"
                                  ? reviewSortDir === "asc"
                                    ? "▲"
                                    : "▼"
                                  : "⇅"}
                              </span>
                            </button>
                          </th>
                          <th className="py-2 pr-4 font-medium">Review</th>
                          <th className="py-2 pr-4 font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setReviewSortKey("date");
                                setReviewSortDir((prev) =>
                                  reviewSortKey === "date" && prev === "asc"
                                    ? "desc"
                                    : "asc"
                                );
                              }}
                              className="flex items-center gap-1"
                            >
                              Date
                              <span className="text-xs">
                                {reviewSortKey === "date"
                                  ? reviewSortDir === "asc"
                                    ? "▲"
                                    : "▼"
                                  : "⇅"}
                              </span>
                            </button>
                          </th>
                          <th className="py-2 pr-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReviews.map((r) => (
                          <tr
                            key={r._id}
                            className="bg-white hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              setEditing({ type: "review", record: r })
                            }
                          >
                            <td className="py-3 pr-4 text-gray-900">
                              {r.product?.name || "Unknown product"}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {r.user?.name || "Unknown user"}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {r.rating.toFixed(1)}
                            </td>
                            <td className="py-3 pr-4 text-gray-600 max-w-xs">
                              {r.review.length > 80
                                ? `${r.review.slice(0, 77)}...`
                                : r.review}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {r.createdAt
                                ? new Date(r.createdAt).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="py-2 pr-4 text-gray-600">
                              <button
                                onClick={() => handleDeleteReview(r._id)}
                                className="text-xs text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <form
                    onSubmit={handleCreateReview}
                    className="rounded-xl border border-gray-100 bg-white px-6 py-5 shadow-sm flex flex-col gap-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      Add review (advanced – IDs required)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <input
                        required
                        type="text"
                        placeholder="Product ID"
                        value={newReview.productId}
                        onChange={(e) =>
                          setNewReview((p) => ({
                            ...p,
                            productId: e.target.value,
                          }))
                        }
                        className="border rounded px-3 py-2"
                      />
                      <input
                        required
                        type="text"
                        placeholder="User ID"
                        value={newReview.userId}
                        onChange={(e) =>
                          setNewReview((p) => ({
                            ...p,
                            userId: e.target.value,
                          }))
                        }
                        className="border rounded px-3 py-2"
                      />
                      <input
                        required
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        placeholder="Rating"
                        value={newReview.rating}
                        onChange={(e) =>
                          setNewReview((p) => ({
                            ...p,
                            rating: e.target.value,
                          }))
                        }
                        className="border rounded px-3 py-2"
                      />
                      <input
                        required
                        type="text"
                        placeholder="Review text"
                        value={newReview.review}
                        onChange={(e) =>
                          setNewReview((p) => ({
                            ...p,
                            review: e.target.value,
                          }))
                        }
                        className="border rounded px-3 py-2"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded text-sm w-fit mt-1 hover:bg-primary hover:bg-opacity-80"
                    >
                      Create Review
                    </button>
                  </form>
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editing.type && editing.record && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                Edit {editing.type}
              </h2>
              <button
                onClick={() => setEditing({ type: null, record: null })}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Confirmation note */}
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Changes will only be saved after you confirm the update.
            </p>

            {editing.type === "user" && (
              <UserEditForm
                record={editing.record}
                onCancel={() => setEditing({ type: null, record: null })}
                onSave={async (values) => {
                  if (
                    !window.confirm(
                      "Are you sure you want to update this user?"
                    )
                  )
                    return;
                  await handleUserUpdate(editing.record._id, values);
                  setEditing({ type: null, record: null });
                }}
              />
            )}

            {editing.type === "product" && (
              <ProductEditForm
                record={editing.record}
                onCancel={() => setEditing({ type: null, record: null })}
                onSave={async (values) => {
                  if (
                    !window.confirm(
                      "Are you sure you want to update this product?"
                    )
                  )
                    return;
                  await handleUpdateProduct(editing.record._id, values);
                  setEditing({ type: null, record: null });
                }}
              />
            )}

            {editing.type === "order" && (
              <OrderEditForm
                record={editing.record}
                onCancel={() => setEditing({ type: null, record: null })}
                onSave={async (values) => {
                  if (
                    !window.confirm(
                      "Are you sure you want to update this order status?"
                    )
                  )
                    return;
                  await handleOrderStatusChange(
                    editing.record._id,
                    editing.record.status,
                    values.status
                  );
                  setEditing({ type: null, record: null });
                }}
              />
            )}

            {editing.type === "review" && (
              <ReviewEditForm
                record={editing.record}
                onCancel={() => setEditing({ type: null, record: null })}
                onSave={async (values) => {
                  if (
                    !window.confirm(
                      "Are you sure you want to update this review?"
                    )
                  )
                    return;
                  // PATCH review
                  try {
                    const res = await fetch(
                      `/api/admin/reviews/${editing.record._id}`,
                      {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(values),
                      }
                    );
                    if (!res.ok) throw new Error("Failed to update review");
                    const data = await res.json();
                    setReviews((prev) =>
                      prev.map((r) =>
                        r._id === editing.record._id
                          ? { ...r, ...data.data }
                          : r
                      )
                    );
                  } catch (err) {
                    console.error(err);
                    setError(err.message);
                  }
                  setEditing({ type: null, record: null });
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

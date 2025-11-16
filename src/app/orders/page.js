"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/userContext";

export default function OrdersPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState(0); // 0 = Active, 1 = History
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (!cancelled) {
          if (res.ok) setOrders(json || []);
          else setErr(json?.error || "Failed to load orders");
        }
      } catch (e) {
        if (!cancelled) setErr("Network error while fetching orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, [user]);

  const activeOrders = useMemo(
    () =>
      orders.filter((o) =>
        ["pending", "ordered", "paid", "shipped", "out-for-delivery"].includes(
          o.status?.toLowerCase()
        )
      ),
    [orders]
  );

  const pastOrders = useMemo(
    () =>
      orders.filter((o) =>
        ["delivered", "completed", "cancelled"].includes(
          o.status?.toLowerCase()
        )
      ),
    [orders]
  );

  const searchFilter = (list) => {
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((order) => {
      const idMatch = order._id?.toLowerCase().includes(q);
      const itemMatch = order.items?.some((i) =>
        i.product?.name?.toLowerCase().includes(q)
      );
      return idMatch || itemMatch;
    });
  };

  const filteredActive = useMemo(
    () => searchFilter(activeOrders),
    [activeOrders, query]
  );
  const filteredPast = useMemo(
    () => searchFilter(pastOrders),
    [pastOrders, query]
  );

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">
          Please sign in to view your orders
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-6 md:px-20 py-12">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (err) {
    return <div className="p-8 text-center text-red-600">{err}</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="px-6 md:px-20 py-12 text-center">
        <h2 className="text-2xl font-semibold">No orders yet</h2>
        <p className="text-gray-600 mt-2">
          Start shopping to place your first order.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 bg-primary text-white px-4 py-2 rounded"
        >
          Shop now
        </Link>
      </div>
    );
  }

  const renderOrders = (list) =>
    list.length === 0 ? (
      <div className="p-8 text-center text-gray-500">
        No orders in this section.
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {list.map((order) => (
          <Link
            key={order._id}
            href={`/orders/${order._id}`}
            className="rounded-2xl bg-white shadow-md p-6 flex flex-col gap-4 border border-gray-100 hover:shadow-xl transition"
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-lg">
                Order #{String(order._id).slice(-6)}
              </p>
              <span
                className={`px-3 py-1 text-xs rounded-full capitalize font-medium ${
                  order.status?.toLowerCase() === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : order.status?.toLowerCase() === "paid"
                    ? "bg-blue-100 text-blue-700"
                    : order.status?.toLowerCase() === "completed"
                    ? "bg-green-100 text-green-700"
                    : order.status?.toLowerCase() === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {order.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.product?.mainImage && (
                    <Image
                      src={item.product.mainImage}
                      width={48}
                      height={48}
                      alt={item.product?.name || "Product"}
                      className="rounded object-cover"
                    />
                  )}
                  <p className="text-[13px] font-medium truncate flex-1">
                    {item.product?.name || "Unnamed product"}
                  </p>
                  <p className="text-[13px] text-gray-600">×{item.quantity}</p>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-gray-500 italic text-[13px]">
                  +{order.items.length - 3} more items
                </p>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-gray-200 pt-3">
              <p className="text-gray-500 text-[13px]">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-lg font-bold text-gray-900">
                ${(order.totalAmount ?? 0).toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );

  return (
    <div className="px-6 md:px-20 py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-10">My Orders</h1>

      {/* Search bar */}
      <div className="flex items-center gap-2 mb-8 border border-gray-200 rounded-full px-4 py-2 shadow-sm bg-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-gray-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Order ID or Product name..."
          className="w-full text-[13px] bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs + Counters */}
      <div className="flex justify-between mb-6">
        <div
          onClick={() => setTab(0)}
          className={`flex-1 text-center py-2 border-b-2 cursor-pointer transition relative ${
            tab === 0
              ? "border-primary text-primary font-semibold"
              : "border-gray-300 text-gray-500"
          }`}
        >
          Active Orders
          <span
            className={`ml-2 text-xs px-2 py-[2px] rounded-full ${
              tab === 0
                ? "bg-primary text-white text-opacity-70"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {filteredActive.length}
          </span>
        </div>

        <div
          onClick={() => setTab(1)}
          className={`flex-1 text-center py-2 border-b-2 cursor-pointer transition relative ${
            tab === 1
              ? "border-primary text-primary font-semibold"
              : "border-gray-300 text-gray-500"
          }`}
        >
          Order History
          <span
            className={`ml-2 text-xs px-2 py-[2px] rounded-full ${
              tab === 1
                ? "bg-primary text-white text-opacity-70"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {filteredPast.length}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 0 ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            {renderOrders(filteredActive)}
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {renderOrders(filteredPast)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

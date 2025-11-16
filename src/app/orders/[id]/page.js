// src/app/orders/[id]/page.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useUser } from "@/context/userContext";
import { motion, AnimatePresence } from "framer-motion";

/**

* Production-ready Order Details page (updated)
*
* * Dynamic progress steps:
* * COD: Ordered -> Shipped -> Out for delivery -> Delivered -> Completed
* * Online: Ordered -> Paid -> Shipped -> Out for delivery -> Delivered -> Completed
* * Tolerant status mapping and timestamps support (paidAt, shippedAt, outForDeliveryAt, deliveredAt, completedAt, cancelledAt)
* * Cancel order calls PATCH /api/orders/:id with { status: "cancelled" }
* * Defensive checks for missing fields, fallback to createdAt/updatedAt
* * Uses Tailwind + framer-motion (both available in your deps)
    */

// Helper: normalize a status string to a canonical key
function normalizeStatus(str) {
  if (!str || typeof str !== "string") return "";
  return str.toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");
}

// Helper: choose steps based on payment method
function getStepsByPaymentMethod(paymentMethod) {
  const pm = (paymentMethod || "").toLowerCase();
  if (pm === "cod" || pm === "cashondelivery" || pm === "cash-on-delivery") {
    return [
      { key: "ordered", label: "Ordered", desc: "We received your order." },
      { key: "shipped", label: "Shipped", desc: "Preparing your package." },
      {
        key: "out-for-delivery",
        label: "Out for delivery",
        desc: "Courier is delivering your order.",
      },
      { key: "delivered", label: "Delivered", desc: "Package delivered." },
      {
        key: "completed",
        label: "Completed",
        desc: "Order completed.",
      },
    ];
  }

  // Default / online payments
  return [
    { key: "ordered", label: "Ordered", desc: "We received your order." },
    { key: "paid", label: "Paid", desc: "Payment confirmed." },
    { key: "shipped", label: "Shipped", desc: "Preparing your package." },
    {
      key: "out-for-delivery",
      label: "Out for delivery",
      desc: "Courier is delivering your order.",
    },
    { key: "delivered", label: "Delivered", desc: "Package delivered." },
    { key: "completed", label: "Completed", desc: "Order completed." },
  ];
}

// friendly date formatter
function fmt(ts) {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
}

// Step circle component (visual)
function StepCircle({ idx, done, active, cancelled }) {
  const base =
    "w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0";
  if (cancelled) {
    return (
      <div className={`${base} bg-red-600 border-red-600 text-white`}>
        {" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          {" "}
          <path
            fillRule="evenodd"
            d="M10 9.293l4.146-4.147a1 1 0 011.414 1.414L11.414 10.707l4.146 4.147a1 1 0 01-1.414 1.414L10 12.121l-4.146 4.147a1 1 0 01-1.414-1.414l4.146-4.147-4.146-4.147A1 1 0 115.854 5.146L10 9.293z"
            clipRule="evenodd"
          />{" "}
        </svg>{" "}
      </div>
    );
  }
  if (done) {
    return (
      <div className={`${base} bg-primary border-primary text-white`}>
        {" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          {" "}
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z"
            clipRule="evenodd"
          />{" "}
        </svg>{" "}
      </div>
    );
  }
  if (active) {
    return (
      <div
        className={`${base} bg-white border-primary text-primary font-medium`}
      >
        {idx + 1}{" "}
      </div>
    );
  }
  return (
    <div className={`${base} bg-white border-gray-300 text-gray-500`}>
      {idx + 1}{" "}
    </div>
  );
}

// Progress UI — receives steps array and activeIndex, plus timestamps mapping
function Progress({ steps, activeIndex, stepsTimestamps }) {
  // Determine if the overall order is cancelled by presence of cancelled timestamp
  const isCancelled = Boolean(stepsTimestamps?.cancelled);

  // Map a canonical step key to fixed percent as per product requirements:
  // - pending / ordered / paid => 20%
  // - shipped => 40%
  // - out-for-delivery => 60%
  // - delivered => 80%
  // - completed => 100%
  // - cancelled => 100%
  // Map a canonical step key to fixed percent
  const keyToPercent = (key) => {
    if (!key) return 0;
    const k = key.toLowerCase();
    if (k === "pending") return 0;
    if (k === "ordered") return 20;
    if (k === "paid") return 20;
    if (k === "shipped") return 40;
    if (
      k === "out-for-delivery" ||
      k === "out_for_delivery" ||
      k === "outfordelivery"
    )
      return 60;
    if (k === "delivered") return 80;
    if (k === "completed") return 100;
    if (k === "cancelled") return 100;
    return 0; // any unknown status
  };

  // Determine the key at activeIndex (safe)
  const activeKey = steps?.[activeIndex]?.key ?? null;
  const percent = isCancelled
    ? 100
    : Math.max(0, Math.min(keyToPercent(activeKey), 100));

  return (
    <div>
      {" "}
      <nav aria-label="Order progress">
        {" "}
        <ol className="flex flex-col md:flex-row md:items-center gap-4">
          {steps
            // 🩶 Remove "Completed" from steps when order is cancelled
            .filter((s) => !(isCancelled && s.key === "completed"))
            .map((s, idx) => {
              const cancelledStep = s.key === "cancelled";
              // When cancelled, visually mark all defined steps as done (primary) except we will render an extra cancelled indicator below.
              const done = isCancelled
                ? true
                : activeIndex >= 0 && idx <= activeIndex && !cancelledStep;
              const active =
                !isCancelled && idx === activeIndex && !cancelledStep;
              const cancelledActive =
                cancelledStep && !isCancelled && activeIndex === idx;
              const ts = stepsTimestamps?.[s.key] ?? null;

              return (
                <li
                  key={s.key}
                  className="md:flex-1 flex items-start md:items-center"
                >
                  <div className="flex items-center w-full">
                    <div className="flex items-center w-full">
                      <StepCircle
                        idx={idx}
                        done={done}
                        active={active}
                        cancelled={cancelledActive}
                      />
                      <div className="ml-3 md:ml-6">
                        <div
                          className={`text-base ${
                            active
                              ? "text-primary font-semibold"
                              : done
                              ? "text-gray-900 font-semibold"
                              : "text-gray-700"
                          }`}
                        >
                          {s.label}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          {ts ? fmt(ts) : s.desc}
                        </div>
                      </div>
                    </div>

                    {idx !== steps.length - 1 && (
                      <div
                        className={`hidden md:block h-0.5 flex-1 ${
                          done ? "bg-primary" : "bg-gray-200"
                        } ml-4`}
                      />
                    )}
                  </div>
                </li>
              );
            })}

          {/* When cancelled, show a final cancelled step indicator (red) while keeping all previous steps visually done */}
          {isCancelled && (
            <li className="md:flex-1 flex items-start md:items-center">
              <div className="flex items-center w-full">
                <div className="flex items-center w-full">
                  <StepCircle
                    idx={steps.length}
                    cancelled={true}
                    done={false}
                    active={false}
                  />
                  <div className="ml-3 md:ml-6">
                    <div className="text-base text-red-600 font-semibold">
                      Cancelled
                    </div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      {fmt(stepsTimestamps.cancelled) || "Order was cancelled."}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )}
        </ol>
      </nav>
      <div className="mt-4">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(percent, 100))}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            aria-hidden
          />
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Progress: {Math.max(0, Math.min(percent, 100))}%
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  const { user } = useUser();
  const { id } = useParams();
  console.log(id);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // fetch order
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`/api/orders/${id}`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setOrder(null);
          setErr(json?.error || "Failed to load order");
        } else {
          setOrder(json);
        }
      } catch (e) {
        if (!cancelled) setErr("Network error while fetching order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, [user, id]);

  // build steps based on payment method
  const steps = useMemo(() => {
    if (!order) return getStepsByPaymentMethod("online"); // default
    return getStepsByPaymentMethod(
      order.paymentMethod ?? order.paymentMethod?.toString?.() ?? "online"
    );
  }, [order]);

  // map actual order.status into our step keys (tolerant)
  const orderStatusKey = useMemo(() => {
    if (!order) return "ordered";
    // normalize available DB statuses into our canonical keys
    const s = normalizeStatus(order.status || "");
    // mapping from possible DB statuses to our canonical keys:
    const map = {
      pending: "pending",
      ordered: "ordered",
      paid: "paid",
      payment_received: "paid",
      shipped: "shipped",
      "out-for-delivery": "out-for-delivery",
      out_for_delivery: "out-for-delivery",
      outfordelivery: "out-for-delivery",
      delivering: "out-for-delivery",
      delivered: "delivered",
      completed: "completed",
      cancelled: "cancelled",
    };
    return map[s] || s || "ordered";
  }, [order]);

  // compute activeIndex inside the chosen steps array
  const activeIndex = useMemo(() => {
    if (!steps?.length || !orderStatusKey) return 0;

    // Pending = before the first step
    if (orderStatusKey === "pending") return -1;

    const idx = steps.findIndex((st) => st.key === orderStatusKey);
    if (idx !== -1) return idx;

    const map = {
      payment_received: "paid",
      out_for_delivery: "out-for-delivery",
      outfordelivery: "out-for-delivery",
      delivering: "out-for-delivery",
    };
    const fallbackKey = map[orderStatusKey];
    const fallbackIdx = steps.findIndex((st) => st.key === fallbackKey);
    return fallbackIdx !== -1 ? fallbackIdx : 0;
  }, [steps, orderStatusKey]);

  // timestamps for steps (prefer explicit fields)
  const stepsTimestamps = useMemo(() => {
    if (!order) return {};
    // allow both camelCase and snake_case keys
    const pick = (a, b) => a ?? b ?? null;
    return {
      ordered: order.createdAt ?? order.created_at ?? null,
      paid:
        pick(order.paidAt ?? order.paid_at, order.paymentConfirmedAt ?? null) ??
        (order.status === "paid"
          ? pick(order.updatedAt, order.updated_at)
          : null),
      shipped:
        order.shippedAt ??
        order.shipped_at ??
        (order.status === "shipped"
          ? pick(order.updatedAt, order.updated_at)
          : null),
      "out-for-delivery":
        order.outForDeliveryAt ??
        order.out_for_delivery_at ??
        (["out-for-delivery", "out_for_delivery", "outfordelivery"].includes(
          normalizeStatus(order.status || "")
        )
          ? pick(order.updatedAt, order.updated_at)
          : null),
      delivered:
        order.deliveredAt ??
        order.delivered_at ??
        (order.status === "delivered"
          ? pick(order.updatedAt, order.updated_at)
          : null),
      completed:
        order.completedAt ??
        order.completed_at ??
        (order.status === "completed"
          ? pick(order.updatedAt, order.updated_at)
          : null),
      cancelled:
        order.cancelledAt ??
        order.cancelled_at ??
        (order.status === "cancelled"
          ? pick(order.updatedAt, order.updated_at)
          : null),
    };
  }, [order]);

  // UI guards
  if (!user) {
    return (
      <div className="p-8 text-center">
        {" "}
        <h2 className="text-2xl font-semibold">Please sign in</h2>{" "}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-6 md:px-20 py-12">
        {" "}
        <div className="space-y-6">
          {" "}
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />{" "}
          <div className="bg-white rounded p-6 shadow">
            {" "}
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse mb-4" />{" "}
            <div className="space-y-3">
              {" "}
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />{" "}
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />{" "}
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />{" "}
            </div>{" "}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded p-6 shadow">
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-16 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-16 bg-gray-200 rounded w-full animate-pulse" />
              </div>
            </div>

            <div className="bg-white rounded p-6 shadow">
              <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (err && !order) {
    return (
      <div className="p-8 text-center">
        {" "}
        <p className="text-red-600">{err}</p>{" "}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        {" "}
        <h2 className="text-2xl font-semibold">Order not found</h2>{" "}
      </div>
    );
  }

  // shipping snapshot access
  const ship = order.shippingAddress || order.address || order.shipping || null;
  const placedAt = order.createdAt ? fmt(order.createdAt) : "";

  // cancellable only when still 'ordered' / 'pending'
  const normalizedStatus = normalizeStatus(order.status);
  const isCancellable = ["pending", "ordered"].includes(normalizedStatus);

  // cancel handler: PATCH to set status cancelled; server returns populated order
  async function cancelOrder() {
    if (!isCancellable) return;
    setIsCancelling(true);
    setErr("");
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to cancel order");
      setOrder(json);
      setConfirmCancelOpen(false);
    } catch (e) {
      console.error("Cancel order failed:", e);
      setErr(e?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="px-6 md:px-20 py-12">
      {/* header */}{" "}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-bold">
            Order #{String(order._id)}{" "}
          </h1>{" "}
          <p className="text-base text-gray-700 mt-1">Placed {placedAt}</p>{" "}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-semibold">
              ${(order.totalAmount ?? 0).toFixed(2)}
            </p>
          </div>

          <div>
            <button
              onClick={() => setConfirmCancelOpen(true)}
              disabled={!isCancellable}
              className={`px-4 py-2 rounded ${
                isCancellable
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-100 text-gray-500 cursor-not-allowed"
              }`}
              title={
                isCancellable ? "Cancel order" : "Order cannot be cancelled"
              }
            >
              Cancel order
            </button>
          </div>
        </div>
      </div>
      {/* progress card */}
      <div className="bg-white rounded p-6 shadow mb-6">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Order progress</h2>
            <p className="text-base text-gray-700 mt-1">
              Track your order below.
            </p>
          </div>
          <div className="mt-3 md:mt-0">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium
    ${
      order.status === "cancelled"
        ? "bg-red-100 text-red-700"
        : order.status === "completed"
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <Progress
            steps={steps}
            activeIndex={activeIndex}
            stepsTimestamps={stepsTimestamps}
          />
        </div>
      </div>
      {/* main grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* left: items */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Items</h3>
          <div className="space-y-4">
            {(Array.isArray(order.items) ? order.items : []).map((it, i) => {
              const product = it?.product ?? {};
              const name =
                (product && (product.name || product.title)) || "Product";
              const img =
                product && (product.mainImage || product.image)
                  ? product.mainImage || product.image
                  : null;
              const qty = typeof it.quantity === "number" ? it.quantity : 1;
              const price =
                typeof it.price === "number" ? it.price : product?.price ?? 0;

              return (
                <div
                  key={it._id ?? i}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-4">
                    {img ? (
                      <Image
                        src={img}
                        alt={name}
                        width={64}
                        height={64}
                        className="object-cover rounded border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">
                        No image
                      </div>
                    )}
                    <div>
                      <div className="text-base font-medium">{name}</div>
                      <div className="text-sm text-gray-700 mt-1">
                        Qty: {qty}
                      </div>
                    </div>
                  </div>

                  <div className="text-lg font-semibold">
                    ${(price * qty).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t mt-4 pt-3 flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-700">Subtotal</div>
            </div>
            <div className="text-lg font-bold">
              ${(order.totalAmount ?? 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* right: shipping & details */}
        <div className="bg-white p-6 rounded shadow">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">Shipping</h3>
            <div className="text-sm text-gray-600">Delivery</div>
          </div>

          <div className="mt-3">
            {ship ? (
              <>
                <div className="text-base font-medium">{ship.fullName}</div>
                <div className="text-base text-gray-700 mt-1">
                  {ship.addressLine}
                </div>
                <div className="text-base text-gray-700 mt-1">
                  {ship.city}, {ship.country} - {ship.postalCode}
                </div>
                <div className="text-base text-gray-700 mt-2">
                  📞 {ship.phone}
                </div>
              </>
            ) : (
              <div className="text-base text-gray-700">
                Shipping address not available.
              </div>
            )}
          </div>

          <div className="mt-6 border-t pt-4">
            <h4 className="text-base font-semibold">Order details</h4>
            <div className="mt-2 text-base text-gray-700">
              Order ID:{" "}
              <span className="font-medium break-all">{String(order._id)}</span>
            </div>
            <div className="mt-1 text-base text-gray-700">
              Payment:{" "}
              <span className="font-medium">
                {order.paymentMethod || "COD"}
              </span>
            </div>
            <div className="mt-1 text-base text-gray-700">
              Placed:{" "}
              <span className="font-medium">{fmt(order.createdAt)}</span>
            </div>
            {order.updatedAt && (
              <div className="mt-1 text-base text-gray-700">
                Updated:{" "}
                <span className="font-medium">{fmt(order.updatedAt)}</span>
              </div>
            )}
            {order.cancelledAt && (
              <div className="mt-1 text-base text-red-600">
                Cancelled at:{" "}
                <span className="font-medium">{fmt(order.cancelledAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* cancel confirm modal */}
      <AnimatePresence>
        {confirmCancelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setConfirmCancelOpen(false)}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded shadow-lg max-w-md w-full z-10 p-6"
            >
              <h3 className="text-lg font-semibold">Cancel order</h3>
              <p className="text-base text-gray-700 mt-2">
                Are you sure you want to cancel this order? This action cannot
                be undone and will be rejected if the order has progressed.
              </p>
              {err && <p className="mt-3 text-red-600">{err}</p>}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded bg-gray-100"
                  onClick={() => setConfirmCancelOpen(false)}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white"
                  onClick={cancelOrder}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling..." : "Yes, cancel order"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

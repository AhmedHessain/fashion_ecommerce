"use client";

import React, { useState } from "react";
import { ORDER_STATUSES } from "./page";

const OrderEditForm = ({ record, onCancel, onSave }) => {
  const currentIndex = ORDER_STATUSES.indexOf(record.status);
  const availableStatuses =
    currentIndex === -1 ? ORDER_STATUSES : ORDER_STATUSES.slice(currentIndex);

  const [status, setStatus] = useState(record.status);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ status });
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Customer</label>
          <div className="px-3 py-2 text-sm border rounded bg-gray-50 text-gray-700">
            {record.user?.name || "Unknown"}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Total</label>
          <div className="px-3 py-2 text-sm border rounded bg-gray-50 text-gray-700">
            ${record.totalAmount.toFixed(2)}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Order status
          </label>
          <select
            className="border rounded px-3 py-2 text-sm capitalize"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {availableStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            You can only move an order forward (no going back to earlier
            statuses).
          </p>
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs font-medium text-gray-600">
            Items in this order
          </label>
          <div className="border rounded px-3 py-2 bg-gray-50 max-h-48 overflow-y-auto space-y-2">
            {Array.isArray(record.items) && record.items.length > 0 ? (
              record.items.map((it) => (
                <div
                  key={it._id || `${it.product?._id}-${it.quantity}`}
                  className="flex items-center gap-3"
                >
                  {it.product?.mainImage && (
                    <img
                      src={it.product.mainImage}
                      alt={it.product.name}
                      className="w-10 h-10 rounded-md object-cover border border-gray-200"
                    />
                  )}
                  <div className="flex flex-col text-xs text-gray-700">
                    <span className="font-medium">
                      {it.product?.name || "Product"}
                    </span>
                    <span>
                      Qty: {it.quantity} · Price: ${Number(it.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-500">No items found.</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary/90"
        >
          Save changes
        </button>
      </div>
    </form>
  );
};

export default OrderEditForm;



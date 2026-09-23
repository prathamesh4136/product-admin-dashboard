"use client";

import Link from "next/link";

export default function ProductCard({
  product,
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
        />

        <div className="min-w-0 flex-1">
          <Link
            href={`/products/${product.id}`}
            className="font-semibold text-gray-900 hover:text-blue-600 hover:underline"
          >
            {product.title}
          </Link>

          <p className="mt-1 text-sm capitalize text-gray-500">
            {product.category}
          </p>

          <p className="mt-2 font-semibold text-gray-900">
            ${product.price}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-yellow-500">
            ★
          </span>

          <span className="font-medium text-gray-700">
            {product.rating}
          </span>
        </div>

        <p className="text-sm text-gray-500">
          Stock: {product.stock}
        </p>
      </div>

      <Link
        href={`/products/${product.id}`}
        className="mt-4 block rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700"
      >
        View Details
      </Link>
    </div>
  );
}
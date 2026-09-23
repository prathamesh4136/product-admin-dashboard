"use client";

import Link from "next/link";

export default function ProductTable({
  products,
}) {
  return (
    <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm md:block">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Product
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Category
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Price
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Rating
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Stock
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr
                key={product.id}
                className="transition hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />

                    <Link
                      href={`/products/${product.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                    >
                      {product.title}
                    </Link>
                  </div>
                </td>

                <td className="px-6 py-4 capitalize text-gray-600">
                  {product.category}
                </td>

                <td className="px-6 py-4 font-medium text-gray-900">
                  ${product.price}
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-sm text-gray-700">
                    <span className="text-yellow-500">
                      ★
                    </span>

                    {product.rating}
                  </span>
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {product.stock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
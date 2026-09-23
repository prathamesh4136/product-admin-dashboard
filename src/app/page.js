"use client";

import { useEffect } from "react";
import { getProducts } from "@/services/productService";

export default function Home() {
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts(10, 0);

        console.log(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadProducts();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Product Admin Dashboard
        </h1>

        <p className="mt-3 text-gray-500">
          Please sign in to continue.
        </p>
      </div>
    </main>
  );
}
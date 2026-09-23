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
      <h1 className="text-3xl font-bold">
        Product Admin Dashboard
      </h1>
    </main>
  );
}
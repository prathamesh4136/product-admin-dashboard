"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { isAuthenticated, logout } from "@/utils/auth";
import { getProducts } from "@/services/productService";

import ProductTable from "@/components/ProductTable";
import ProductCard from "@/components/ProductCard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";

export default function ProductsPage() {
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await getProducts(10, 0);

      setProducts(data.products);
    } catch (error) {
      console.error("Failed to load products:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const authenticatedUser = isAuthenticated();

    if (!authenticatedUser) {
      router.replace("/login");
      return;
    }

    setAuthenticated(true);
    setIsCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (authenticated) {
      loadProducts();
    }
  }, [authenticated, loadProducts]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">
          Checking authentication...
        </p>
      </main>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Product Dashboard
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your products
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 sm:w-auto"
          >
            Logout
          </button>
        </div>

        {/* Product Content */}
        {loading && <LoadingState />}

        {!loading && error && (
          <ErrorState onRetry={loadProducts} />
        )}

        {!loading && !error && products.length === 0 && (
          <EmptyState />
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <ProductTable products={products} />

            <div className="space-y-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
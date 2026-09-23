"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { isAuthenticated, logout } from "@/utils/auth";
import { getProducts } from "@/services/productService";

import ProductTable from "@/components/ProductTable";
import ProductCard from "@/components/ProductCard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import Pagination from "@/components/Pagination";

const ALLOWED_PAGE_SIZES = [10, 20, 50];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read pagination values from URL
  const rawPage = Number(searchParams.get("page"));
  const rawLimit = Number(searchParams.get("limit"));

  const currentPage =
    Number.isInteger(rawPage) && rawPage > 0
      ? rawPage
      : 1;

  const pageSize = ALLOWED_PAGE_SIZES.includes(rawLimit)
    ? rawLimit
    : 10;

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Authentication check
  useEffect(() => {
    const authenticatedUser = isAuthenticated();

    if (!authenticatedUser) {
      router.replace("/login");
      return;
    }

    setAuthenticated(true);
    setIsCheckingAuth(false);
  }, [router]);

  // Load products
  const loadProducts = useCallback(async () => {
    if (!authenticated) {
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const skip = (currentPage - 1) * pageSize;

      const data = await getProducts(pageSize, skip);

      setProducts(data.products);
      setTotalProducts(data.total);

      // Handle invalid page numbers such as ?page=999
      const calculatedTotalPages = Math.ceil(
        data.total / pageSize
      );

      if (
        currentPage > calculatedTotalPages &&
        calculatedTotalPages > 0
      ) {
        const params = new URLSearchParams(
          searchParams.toString()
        );

        params.set("page", String(calculatedTotalPages));
        params.set("limit", String(pageSize));

        router.replace(`/products?${params.toString()}`);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [
    authenticated,
    currentPage,
    pageSize,
    router,
    searchParams,
  ]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handlePageChange = (page) => {
    if (page < 1) {
      return;
    }

    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("page", String(page));
    params.set("limit", String(pageSize));

    router.push(`/products?${params.toString()}`);
  };

  const handlePageSizeChange = (newPageSize) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    // Whenever page size changes, go back to page 1
    params.set("page", "1");
    params.set("limit", String(newPageSize));

    router.push(`/products?${params.toString()}`);
  };

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

  const totalPages = Math.ceil(
    totalProducts / pageSize
  );

  const startItem =
    totalProducts === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endItem = Math.min(
    currentPage * pageSize,
    totalProducts
  );

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

        {/* Content */}
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

            {/* Showing information */}
            <div className="mt-6 text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {startItem}
              </span>
              –
              <span className="font-semibold text-gray-900">
                {endItem}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {totalProducts}
              </span>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-500">
            Loading products...
          </p>
        </main>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
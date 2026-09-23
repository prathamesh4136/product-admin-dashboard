"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  isAuthenticated,
  logout,
} from "@/utils/auth";

import {
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
} from "@/services/productService";

import ProductTable from "@/components/ProductTable";
import ProductCard from "@/components/ProductCard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";

const ALLOWED_PAGE_SIZES = [
  10,
  20,
  50,
];

function ProductsContent() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  // -----------------------------
  // Read values from URL
  // -----------------------------

  const rawPage = Number(
    searchParams.get("page")
  );

  const rawLimit = Number(
    searchParams.get("limit")
  );

  const currentPage =
    Number.isInteger(rawPage) &&
    rawPage > 0
      ? rawPage
      : 1;

  const pageSize =
    ALLOWED_PAGE_SIZES.includes(
      rawLimit
    )
      ? rawLimit
      : 10;

  const searchQuery =
    searchParams.get("search") || "";

  const category =
    searchParams.get("category") || "";

  const sort =
    searchParams.get("sort") || "";

  // -----------------------------
  // State
  // -----------------------------

  const [
    isCheckingAuth,
    setIsCheckingAuth,
  ] = useState(true);

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    totalProducts,
    setTotalProducts,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(false);

  const [
    searchInput,
    setSearchInput,
  ] = useState(searchQuery);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const abortControllerRef =
    useRef(null);

  // -----------------------------
  // Authentication
  // -----------------------------

  useEffect(() => {
    const authenticatedUser =
      isAuthenticated();

    if (!authenticatedUser) {
      router.replace("/login");
      return;
    }

    setAuthenticated(true);
    setIsCheckingAuth(false);
  }, [router]);

  // -----------------------------
  // Sync search input with URL
  // -----------------------------

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // -----------------------------
  // Load categories
  // -----------------------------

  useEffect(() => {
    if (!authenticated) return;

    const loadCategories =
      async () => {
        try {
          const data =
            await getCategories();

          if (
            Array.isArray(data)
          ) {
            setCategories(data);
          }
        } catch (error) {
          console.error(
            "Failed to load categories:",
            error
          );
        }
      };

    loadCategories();
  }, [authenticated]);

  // -----------------------------
  // Load products
  // -----------------------------

  const loadProducts =
    useCallback(async () => {
      if (!authenticated) return;

      if (
        abortControllerRef.current
      ) {
        abortControllerRef.current.abort();
      }

      const controller =
        new AbortController();

      abortControllerRef.current =
        controller;

      setLoading(true);
      setError(false);

      try {
        const skip =
          (currentPage - 1) *
          pageSize;

        let data;

        // Category has priority
        // over search.
        if (category) {
          data =
            await getProductsByCategory(
              category,
              pageSize,
              skip,
              controller.signal
            );
        } else if (
          searchQuery.trim()
        ) {
          data =
            await searchProducts(
              searchQuery.trim(),
              pageSize,
              skip,
              controller.signal
            );
        } else {
          data =
            await getProducts(
              pageSize,
              skip,
              controller.signal
            );
        }

        if (
          controller.signal.aborted
        ) {
          return;
        }

        let loadedProducts =
          data.products || [];

        // -----------------------------
        // Sorting
        // -----------------------------

        if (
          sort === "price-asc"
        ) {
          loadedProducts = [
            ...loadedProducts,
          ].sort(
            (a, b) =>
              a.price - b.price
          );
        }

        if (
          sort === "price-desc"
        ) {
          loadedProducts = [
            ...loadedProducts,
          ].sort(
            (a, b) =>
              b.price - a.price
          );
        }

        if (
          sort === "rating-desc"
        ) {
          loadedProducts = [
            ...loadedProducts,
          ].sort(
            (a, b) =>
              b.rating - a.rating
          );
        }

        if (
          sort === "title-asc"
        ) {
          loadedProducts = [
            ...loadedProducts,
          ].sort((a, b) =>
            a.title.localeCompare(
              b.title
            )
          );
        }

        setProducts(
          loadedProducts
        );

        setTotalProducts(
          data.total || 0
        );

        // -----------------------------
        // Invalid/high page
        // -----------------------------

        const calculatedTotalPages =
          Math.ceil(
            (data.total || 0) /
              pageSize
          );

        if (
          currentPage >
            calculatedTotalPages &&
          calculatedTotalPages > 0
        ) {
          const params =
            new URLSearchParams(
              searchParams.toString()
            );

          params.set(
            "page",
            String(
              calculatedTotalPages
            )
          );

          params.set(
            "limit",
            String(pageSize)
          );

          router.replace(
            `/products?${params.toString()}`
          );

          return;
        }
      } catch (error) {
        if (
          error.code ===
            "ERR_CANCELED" ||
          error.name ===
            "CanceledError" ||
          controller.signal.aborted
        ) {
          return;
        }

        console.error(
          "Failed to load products:",
          error
        );

        setError(true);
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }, [
      authenticated,
      currentPage,
      pageSize,
      searchQuery,
      category,
      sort,
      router,
      searchParams,
    ]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // -----------------------------
  // Search debounce
  // -----------------------------

  useEffect(() => {
    const timeoutId =
      setTimeout(() => {
        const trimmedSearch =
          searchInput.trim();

        if (
          trimmedSearch ===
          searchQuery
        ) {
          return;
        }

        const params =
          new URLSearchParams(
            searchParams.toString()
          );

        if (trimmedSearch) {
          params.set(
            "search",
            trimmedSearch
          );

          params.delete(
            "category"
          );
        } else {
          params.delete(
            "search"
          );
        }

        params.set(
          "page",
          "1"
        );

        params.set(
          "limit",
          String(pageSize)
        );

        router.push(
          `/products?${params.toString()}`
        );
      }, 500);

    return () =>
      clearTimeout(timeoutId);
  }, [
    searchInput,
    searchQuery,
    searchParams,
    pageSize,
    router,
  ]);

  // -----------------------------
  // Pagination
  // -----------------------------

  const handlePageChange =
    (page) => {
      if (page < 1) return;

      const params =
        new URLSearchParams(
          searchParams.toString()
        );

      params.set(
        "page",
        String(page)
      );

      params.set(
        "limit",
        String(pageSize)
      );

      router.push(
        `/products?${params.toString()}`
      );
    };

  // -----------------------------
  // Page size
  // -----------------------------

  const handlePageSizeChange =
    (newPageSize) => {
      if (
        !ALLOWED_PAGE_SIZES.includes(
          newPageSize
        )
      ) {
        return;
      }

      const params =
        new URLSearchParams(
          searchParams.toString()
        );

      params.set(
        "page",
        "1"
      );

      params.set(
        "limit",
        String(newPageSize)
      );

      router.push(
        `/products?${params.toString()}`
      );
    };

  // -----------------------------
  // Search
  // -----------------------------

  const handleSearchChange =
    (value) => {
      setSearchInput(value);
    };

  // -----------------------------
  // Category
  // -----------------------------

  const handleCategoryChange =
    (newCategory) => {
      const params =
        new URLSearchParams(
          searchParams.toString()
        );

      if (newCategory) {
        params.set(
          "category",
          newCategory
        );

        params.delete(
          "search"
        );

        setSearchInput("");
      } else {
        params.delete(
          "category"
        );
      }

      params.set(
        "page",
        "1"
      );

      params.set(
        "limit",
        String(pageSize)
      );

      router.push(
        `/products?${params.toString()}`
      );
    };

  // -----------------------------
  // Sorting
  // -----------------------------

  const handleSortChange =
    (newSort) => {
      const params =
        new URLSearchParams(
          searchParams.toString()
        );

      if (newSort) {
        params.set(
          "sort",
          newSort
        );
      } else {
        params.delete(
          "sort"
        );
      }

      params.set(
        "page",
        "1"
      );

      params.set(
        "limit",
        String(pageSize)
      );

      router.push(
        `/products?${params.toString()}`
      );
    };

  // -----------------------------
  // Logout
  // -----------------------------

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // -----------------------------
  // Authentication loading
  // -----------------------------

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

  // -----------------------------
  // Pagination calculations
  // -----------------------------

  const totalPages =
    Math.ceil(
      totalProducts /
        pageSize
    );

  const startItem =
    totalProducts === 0
      ? 0
      : (currentPage - 1) *
          pageSize +
        1;

  const endItem =
    Math.min(
      currentPage *
        pageSize,
      totalProducts
    );

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Product Dashboard
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your products
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() =>
                router.push(
                  "/products/add"
                )
              }
              className="w-full rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 sm:w-auto"
            >
              + Add Product
            </button>

            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 sm:w-auto"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mb-6 space-y-4">

          <div className="w-full md:max-w-xl">
            <SearchBar
              value={
                searchInput
              }
              onChange={
                handleSearchChange
              }
            />
          </div>

          <FilterBar
            category={
              category
            }
            categories={
              categories
            }
            sort={sort}
            onCategoryChange={
              handleCategoryChange
            }
            onSortChange={
              handleSortChange
            }
          />
        </div>

        {/* Loading */}
        {loading && (
          <LoadingState />
        )}

        {/* Error */}
        {!loading &&
          error && (
            <ErrorState
              onRetry={
                loadProducts
              }
            />
          )}

        {/* Empty */}
        {!loading &&
          !error &&
          products.length ===
            0 && (
            <EmptyState />
          )}

        {/* Products */}
        {!loading &&
          !error &&
          products.length >
            0 && (
            <>
              <ProductTable
                products={
                  products
                }
              />

              <div className="space-y-4 md:hidden">
                {products.map(
                  (product) => (
                    <ProductCard
                      key={
                        product.id
                      }
                      product={
                        product
                      }
                    />
                  )
                )}
              </div>

              {/* Result count */}
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
                  {
                    totalProducts
                  }
                </span>
              </div>

              {/* Pagination */}
              {totalPages >
                1 && (
                <Pagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  pageSize={
                    pageSize
                  }
                  onPageChange={
                    handlePageChange
                  }
                  onPageSizeChange={
                    handlePageSizeChange
                  }
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
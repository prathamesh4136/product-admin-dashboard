"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { isAuthenticated, logout } from "@/utils/auth";

import {
  getProducts,
  searchProducts,
} from "@/services/productService";

import ProductTable from "@/components/ProductTable";
import ProductCard from "@/components/ProductCard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";

const ALLOWED_PAGE_SIZES = [10, 20, 50];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /*
   * ============================================================
   * URL PARAMETERS
   * ============================================================
   */

  const rawPage = Number(searchParams.get("page"));
  const rawLimit = Number(searchParams.get("limit"));

  const currentPage =
    Number.isInteger(rawPage) && rawPage > 0
      ? rawPage
      : 1;

  const pageSize = ALLOWED_PAGE_SIZES.includes(rawLimit)
    ? rawLimit
    : 10;

  const searchQuery = searchParams.get("search") || "";

  /*
   * ============================================================
   * AUTHENTICATION STATE
   * ============================================================
   */

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  /*
   * ============================================================
   * PRODUCT STATE
   * ============================================================
   */

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  /*
   * ============================================================
   * SEARCH STATE
   * ============================================================
   */

  // What the user currently sees inside the input
  const [searchInput, setSearchInput] = useState(searchQuery);

  /*
   * ============================================================
   * REQUEST CONTROL
   * ============================================================
   */

  // Stores the current AbortController.
  // Used to cancel an older API request when a new one starts.
  const abortControllerRef = useRef(null);

  /*
   * ============================================================
   * AUTHENTICATION CHECK
   * ============================================================
   */

  useEffect(() => {
    const authenticatedUser = isAuthenticated();

    if (!authenticatedUser) {
      router.replace("/login");
      return;
    }

    setAuthenticated(true);
    setIsCheckingAuth(false);
  }, [router]);

  /*
   * ============================================================
   * KEEP SEARCH INPUT IN SYNC WITH URL
   * ============================================================
   *
   * Example:
   *
   * URL:
   * /products?search=phone
   *
   * Search input:
   * phone
   *
   * If the URL changes externally, the input also changes.
   */

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  /*
   * ============================================================
   * LOAD PRODUCTS
   * ============================================================
   */

  const loadProducts = useCallback(async () => {
    if (!authenticated) {
      return;
    }

    /*
     * Cancel the previous request.
     *
     * Example:
     *
     * Request A → phone
     * Request B → laptop
     *
     * When B starts, A is cancelled.
     */
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();

    abortControllerRef.current = controller;

    setLoading(true);
    setError(false);

    try {
      const skip = (currentPage - 1) * pageSize;

      let data;

      /*
       * If search exists:
       *
       * /products/search?q=phone
       *
       * Otherwise:
       *
       * /products
       */
      if (searchQuery.trim()) {
        data = await searchProducts(
          searchQuery.trim(),
          pageSize,
          skip,
          controller.signal
        );
      } else {
        data = await getProducts(
          pageSize,
          skip,
          controller.signal
        );
      }

      /*
       * If this request was cancelled,
       * don't use its result.
       */
      if (controller.signal.aborted) {
        return;
      }

      setProducts(data.products || []);
      setTotalProducts(data.total || 0);

      /*
       * ========================================================
       * HANDLE INVALID PAGE NUMBERS
       * ========================================================
       *
       * Example:
       *
       * ?page=999&limit=10
       *
       * If only 20 pages exist, go to page 20.
       */

      const calculatedTotalPages = Math.ceil(
        (data.total || 0) / pageSize
      );

      if (
        currentPage > calculatedTotalPages &&
        calculatedTotalPages > 0
      ) {
        const params = new URLSearchParams(
          searchParams.toString()
        );

        params.set(
          "page",
          String(calculatedTotalPages)
        );

        params.set("limit", String(pageSize));

        router.replace(
          `/products?${params.toString()}`
        );

        return;
      }
    } catch (error) {
      /*
       * AbortController cancellation is expected.
       *
       * It should NOT display an error to the user.
       */
      if (
        error.code === "ERR_CANCELED" ||
        error.name === "CanceledError" ||
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
      /*
       * Don't stop the loading state for an
       * already-cancelled request.
       *
       * The latest request controls loading.
       */
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [
    authenticated,
    currentPage,
    pageSize,
    searchQuery,
    router,
    searchParams,
  ]);

  /*
   * ============================================================
   * LOAD DATA WHEN URL / AUTH STATE CHANGES
   * ============================================================
   */

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /*
   * ============================================================
   * DEBOUNCED SEARCH
   * ============================================================
   *
   * Wait 500ms after the user stops typing.
   *
   * Example:
   *
   * p
   * ph
   * pho
   * phon
   * phone
   *
   * We don't immediately update the URL/API
   * for every keystroke.
   */

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedSearch = searchInput.trim();

      /*
       * Nothing changed.
       */
      if (trimmedSearch === searchQuery) {
        return;
      }

      const params = new URLSearchParams(
        searchParams.toString()
      );

      /*
       * Add or remove search parameter.
       */
      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      } else {
        params.delete("search");
      }

      /*
       * Search changes must always go back to page 1.
       */
      params.set("page", "1");

      /*
       * Keep current page size.
       */
      params.set("limit", String(pageSize));

      router.push(
        `/products?${params.toString()}`
      );
    }, 500);

    /*
     * Cancel the timer if the user types again
     * before 500ms.
     */
    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    searchInput,
    searchQuery,
    searchParams,
    pageSize,
    router,
  ]);

  /*
   * ============================================================
   * PAGE CHANGE
   * ============================================================
   */

  const handlePageChange = (page) => {
    if (page < 1) {
      return;
    }

    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("page", String(page));
    params.set("limit", String(pageSize));

    router.push(
      `/products?${params.toString()}`
    );
  };

  /*
   * ============================================================
   * PAGE SIZE CHANGE
   * ============================================================
   *
   * When page size changes,
   * always go back to page 1.
   */

  const handlePageSizeChange = (newPageSize) => {
    if (!ALLOWED_PAGE_SIZES.includes(newPageSize)) {
      return;
    }

    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("page", "1");
    params.set("limit", String(newPageSize));

    router.push(
      `/products?${params.toString()}`
    );
  };

  /*
   * ============================================================
   * SEARCH INPUT CHANGE
   * ============================================================
   */

  const handleSearchChange = (value) => {
    setSearchInput(value);
  };

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  /*
   * ============================================================
   * AUTH LOADING
   * ============================================================
   */

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

  /*
   * ============================================================
   * PAGINATION CALCULATIONS
   * ============================================================
   */

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

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

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

        {/* ================================================== */}
        {/* SEARCH */}
        {/* ================================================== */}

        <div className="mb-6">
          <div className="w-full md:max-w-xl">
            <SearchBar
              value={searchInput}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* ================================================== */}
        {/* LOADING */}
        {/* ================================================== */}

        {loading && <LoadingState />}

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {!loading && error && (
          <ErrorState
            onRetry={loadProducts}
          />
        )}

        {/* ================================================== */}
        {/* EMPTY */}
        {/* ================================================== */}

        {!loading &&
          !error &&
          products.length === 0 && (
            <EmptyState />
          )}

        {/* ================================================== */}
        {/* PRODUCTS */}
        {/* ================================================== */}

        {!loading &&
          !error &&
          products.length > 0 && (
            <>
              {/* Desktop table */}
              <ProductTable
                products={products}
              />

              {/* Mobile cards */}
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>

              {/* ================================================== */}
              {/* SHOWING X-Y OF TOTAL */}
              {/* ================================================== */}

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

              {/* ================================================== */}
              {/* PAGINATION */}
              {/* ================================================== */}

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
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

/*
 * ==============================================================
 * PAGE COMPONENT
 * ==============================================================
 *
 * Suspense is used because ProductsContent uses
 * useSearchParams().
 */

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
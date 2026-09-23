"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  getProductById,
  deleteProduct,
} from "@/services/productService";

import {
  isAuthenticated,
  logout,
} from "@/utils/auth";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id;

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const [authenticated, setAuthenticated] =
    useState(false);

  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

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
  }, [router]);

  // -----------------------------
  // Load product
  // -----------------------------

  useEffect(() => {
    if (
      !authenticated ||
      !productId
    ) {
      return;
    }

    const controller =
      new AbortController();

    const loadProduct = async () => {
      setLoading(true);
      setError(false);

      try {
        const data =
          await getProductById(
            productId,
            controller.signal
          );

        if (
          controller.signal.aborted
        ) {
          return;
        }

        setProduct(data);
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
          "Failed to load product:",
          error
        );

        setError(true);
        setProduct(null);
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      controller.abort();
    };
  }, [
    authenticated,
    productId,
  ]);

  // -----------------------------
  // Logout
  // -----------------------------

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // -----------------------------
  // Open delete dialog
  // -----------------------------

  const handleDeleteClick = () => {
    setDeleteError("");
    setShowDeleteDialog(true);
  };

  // -----------------------------
  // Cancel delete
  // -----------------------------

  const handleCancelDelete = () => {
    if (deleting) return;

    setShowDeleteDialog(false);
    setDeleteError("");
  };

  // -----------------------------
  // Confirm delete
  // -----------------------------

  const handleConfirmDelete =
    async () => {
      // Prevent multiple delete requests.
      if (deleting) return;

      setDeleting(true);
      setDeleteError("");

      try {
        await deleteProduct(
          productId
        );

        // DummyJSON simulates deletion.
        // We remove the product from the
        // current application flow by
        // redirecting after success.
        setShowDeleteDialog(false);

        router.replace(
          "/products?deleted=true"
        );
      } catch (error) {
        console.error(
          "Failed to delete product:",
          error
        );

        setDeleteError(
          "Failed to delete product. Please try again."
        );
      } finally {
        setDeleting(false);
      }
    };

  // -----------------------------
  // Authentication loading
  // -----------------------------

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">
          Checking authentication...
        </p>
      </main>
    );
  }

  // -----------------------------
  // Product loading
  // -----------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <p className="text-sm text-gray-500">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  // -----------------------------
  // Product not found
  // -----------------------------

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              Product Not Found
            </h1>

            <p className="mt-2 text-gray-500">
              We could not find the product
              you are looking for.
            </p>

            <button
              onClick={() =>
                router.push(
                  "/products"
                )
              }
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
            >
              Back to Products
            </button>
          </div>
        </div>
      </main>
    );
  }

  // -----------------------------
  // Product details
  // -----------------------------

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() =>
              router.push(
                "/products"
              )
            }
            className="w-fit rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            ← Back to Products
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() =>
                router.push(
                  `/products/${productId}/edit`
                )
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
            >
              Edit Product
            </button>

            <button
              onClick={
                handleDeleteClick
              }
              disabled={deleting}
              className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete Product
            </button>

            <button
              onClick={
                handleLogout
              }
              className="rounded-lg bg-gray-800 px-5 py-2.5 font-medium text-white transition hover:bg-gray-900"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Product */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">

            {/* Images */}
            <div>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <img
                  src={
                    product.thumbnail
                  }
                  alt={
                    product.title
                  }
                  className="h-80 w-full object-contain p-6 md:h-96"
                />
              </div>

              {product.images &&
                product.images.length >
                  1 && (
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {product.images
                      .slice(
                        0,
                        4
                      )
                      .map(
                        (
                          image,
                          index
                        ) => (
                          <div
                            key={`${image}-${index}`}
                            className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                          >
                            <img
                              src={image}
                              alt={`${product.title} ${index + 1}`}
                              className="h-20 w-full object-contain p-2"
                            />
                          </div>
                        )
                      )}
                  </div>
                )}
            </div>

            {/* Product information */}
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                  {
                    product.category
                  }
                </span>

                {product.brand && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {
                      product.brand
                    }
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900">
                {
                  product.title
                }
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <p className="text-3xl font-bold text-blue-600">
                  $
                  {
                    product.price
                  }
                </p>

                <div className="flex items-center gap-1 rounded-lg bg-yellow-50 px-3 py-1.5">
                  <span className="text-yellow-500">
                    ★
                  </span>

                  <span className="font-semibold text-gray-800">
                    {
                      product.rating
                    }
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Stock
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {
                      product.stock
                    }
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Availability
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {
                      product.availabilityStatus ||
                      "Available"
                    }
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900">
                  Description
                </h2>

                <p className="mt-2 leading-7 text-gray-600">
                  {
                    product.description
                  }
                </p>
              </div>

              {product.discountPercentage && (
                <div className="mt-6 rounded-lg bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-700">
                    {
                      product.discountPercentage
                    }%
                    discount available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="border-t border-gray-200 p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Reviews
              </h2>

              {product.reviews?.length >
                0 && (
                <span className="text-sm text-gray-500">
                  {
                    product.reviews
                      .length
                  }{" "}
                  reviews
                </span>
              )}
            </div>

            {!product.reviews ||
            product.reviews.length ===
              0 ? (
              <p className="mt-4 text-gray-500">
                No reviews available.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {product.reviews.map(
                  (
                    review,
                    index
                  ) => (
                    <div
                      key={`${review.reviewerName}-${index}`}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {
                              review.reviewerName
                            }
                          </p>

                          <p className="text-sm text-gray-500">
                            {
                              review.reviewerEmail
                            }
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">
                            ★
                          </span>

                          <span className="font-medium text-gray-800">
                            {
                              review.rating
                            }
                            /5
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-gray-600">
                        {
                          review.comment
                        }
                      </p>

                      {review.date && (
                        <p className="mt-2 text-xs text-gray-400">
                          {new Date(
                            review.date
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <h2
              id="delete-title"
              className="text-xl font-bold text-gray-900"
            >
              Delete Product?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {product.title}
              </span>
              ? This action cannot be
              undone.
            </p>

            {deleteError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  handleCancelDelete
                }
                disabled={deleting}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleConfirmDelete
                }
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
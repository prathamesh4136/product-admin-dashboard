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
  getCategories,
  updateProduct,
} from "@/services/productService";

import {
  isAuthenticated,
  logout,
} from "@/utils/auth";

const initialForm = {
  title: "",
  description: "",
  price: "",
  stock: "",
  category: "",
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id;

  const [authenticated, setAuthenticated] =
    useState(false);

  const [form, setForm] =
    useState(initialForm);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState({});

  const [success, setSuccess] =
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
  // Load product + categories
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

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          product,
          categoryData,
        ] = await Promise.all([
          getProductById(
            productId,
            controller.signal
          ),
          getCategories(
            controller.signal
          ),
        ]);

        if (
          controller.signal.aborted
        ) {
          return;
        }

        setForm({
          title: product.title || "",
          description:
            product.description || "",
          price:
            product.price !== undefined
              ? String(product.price)
              : "",
          stock:
            product.stock !== undefined
              ? String(product.stock)
              : "",
          category:
            product.category || "",
        });

        if (
          Array.isArray(categoryData)
        ) {
          setCategories(
            categoryData
          );
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
          "Failed to load product:",
          error
        );

        setError(
          "Unable to load product. Please try again."
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      controller.abort();
    };
  }, [
    authenticated,
    productId,
    router,
  ]);

  // -----------------------------
  // Handle input
  // -----------------------------

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previousForm) => ({
        ...previousForm,
        [name]: value,
      })
    );

    setFieldErrors(
      (previousErrors) => ({
        ...previousErrors,
        [name]: "",
      })
    );

    setError("");
    setSuccess("");
  };

  // -----------------------------
  // Validation
  // -----------------------------

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title =
        "Product title is required.";
    } else if (
      form.title.trim().length < 3
    ) {
      newErrors.title =
        "Product title must be at least 3 characters.";
    }

    if (!form.description.trim()) {
      newErrors.description =
        "Product description is required.";
    } else if (
      form.description.trim().length <
      10
    ) {
      newErrors.description =
        "Description must be at least 10 characters.";
    }

    if (form.price === "") {
      newErrors.price =
        "Price is required.";
    } else if (
      Number.isNaN(
        Number(form.price)
      ) ||
      Number(form.price) <= 0
    ) {
      newErrors.price =
        "Price must be greater than 0.";
    }

    if (form.stock === "") {
      newErrors.stock =
        "Stock is required.";
    } else if (
      !Number.isInteger(
        Number(form.stock)
      ) ||
      Number(form.stock) < 0
    ) {
      newErrors.stock =
        "Stock must be a whole number greater than or equal to 0.";
    }

    if (!form.category) {
      newErrors.category =
        "Please select a category.";
    }

    setFieldErrors(
      newErrors
    );

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  // -----------------------------
  // Submit update
  // -----------------------------

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    // Prevent multiple requests.
    if (saving) return;

    setError("");
    setSuccess("");

    const isValid =
      validateForm();

    if (!isValid) {
      return;
    }

    setSaving(true);

    try {
      const productData = {
        title:
          form.title.trim(),

        description:
          form.description.trim(),

        price: Number(
          form.price
        ),

        stock: Number(
          form.stock
        ),

        category:
          form.category,
      };

      const updatedProduct =
        await updateProduct(
          productId,
          productData
        );

      console.log(
        "Updated product:",
        updatedProduct
      );

      setSuccess(
        `Product "${updatedProduct.title}" was updated successfully.`
      );

      setFieldErrors({});

      setTimeout(() => {
        router.push(
          `/products/${productId}`
        );
      }, 1000);
    } catch (error) {
      console.error(
        "Failed to update product:",
        error
      );

      setError(
        "Failed to update product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Logout
  // -----------------------------

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // -----------------------------
  // Authentication
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
  // Loading
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
  // Load error
  // -----------------------------

  if (error && !form.title) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              Unable to Load Product
            </h1>

            <p className="mt-2 text-gray-500">
              {error}
            </p>

            <button
              type="button"
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
  // UI
  // -----------------------------

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Product
            </h1>

            <p className="mt-1 text-gray-500">
              Update product information
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 sm:w-auto"
          >
            Logout
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow-sm md:p-8"
        >
          {/* API Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Title */}
          <div className="mb-5">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Product Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter product title"
              disabled={saving}
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition ${
                fieldErrors.title
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />

            {fieldErrors.title && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-5">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder="Enter product description"
              disabled={saving}
              className={`w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm outline-none transition ${
                fieldErrors.description
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />

            {fieldErrors.description && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.description}
              </p>
            )}
          </div>

          {/* Price + Stock */}
          <div className="grid gap-5 sm:grid-cols-2">

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Price
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="Enter price"
                disabled={saving}
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition ${
                  fieldErrors.price
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />

              {fieldErrors.price && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.price}
                </p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="stock"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Stock
              </label>

              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                placeholder="Enter stock"
                disabled={saving}
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition ${
                  fieldErrors.stock
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />

              {fieldErrors.stock && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.stock}
                </p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="mt-5">
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Category
            </label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={saving}
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition ${
                fieldErrors.category
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            >
              <option value="">
                Select a category
              </option>

              {categories.map(
                (item) => {
                  const categoryValue =
                    typeof item ===
                    "string"
                      ? item
                      : item.slug;

                  const categoryName =
                    typeof item ===
                    "string"
                      ? item
                      : item.name;

                  return (
                    <option
                      key={
                        categoryValue
                      }
                      value={
                        categoryValue
                      }
                    >
                      {categoryName}
                    </option>
                  );
                }
              )}
            </select>

            {fieldErrors.category && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.category}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/products/${productId}`
                )
              }
              disabled={saving}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
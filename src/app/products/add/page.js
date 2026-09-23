"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  addProduct,
  getCategories,
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

export default function AddProductPage() {
  const router = useRouter();

  const [authenticated, setAuthenticated] =
    useState(false);

  const [categories, setCategories] =
    useState([]);

  const [form, setForm] =
    useState(initialForm);

  const [errors, setErrors] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [apiError, setApiError] =
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
  // Load categories
  // -----------------------------

  useEffect(() => {
    if (!authenticated) return;

    const loadCategories = async () => {
      try {
        const data =
          await getCategories();

        if (Array.isArray(data)) {
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
  // Handle input
  // -----------------------------

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    // Remove field error once
    // user starts correcting it.
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setApiError("");
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
      form.description.trim().length < 10
    ) {
      newErrors.description =
        "Description must be at least 10 characters.";
    }

    if (form.price === "") {
      newErrors.price =
        "Price is required.";
    } else if (
      Number.isNaN(Number(form.price)) ||
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

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // -----------------------------
  // Submit
  // -----------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent multiple API requests.
    if (loading) return;

    setSuccess("");
    setApiError("");

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      const productData = {
        title: form.title.trim(),
        description:
          form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
      };

      const createdProduct =
        await addProduct(productData);

      console.log(
        "Created product:",
        createdProduct
      );

      setSuccess(
        `Product "${createdProduct.title}" was added successfully.`
      );

      setForm(initialForm);
      setErrors({});

      // Give the user a moment to see
      // the success message.
      setTimeout(() => {
        router.push("/products");
      }, 1000);
    } catch (error) {
      console.error(
        "Failed to add product:",
        error
      );

      setApiError(
        "Failed to add product. Please try again."
      );
    } finally {
      setLoading(false);
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
  // UI
  // -----------------------------

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Add Product
            </h1>

            <p className="mt-1 text-gray-500">
              Create a new product
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
          {apiError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {apiError}
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
              disabled={loading}
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition ${
                errors.title
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title}
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
              disabled={loading}
              className={`w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm outline-none transition ${
                errors.description
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />

            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description}
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
                disabled={loading}
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition ${
                  errors.price
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />

              {errors.price && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.price}
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
                disabled={loading}
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition ${
                  errors.stock
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />

              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.stock}
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
              disabled={loading}
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition ${
                errors.category
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            >
              <option value="">
                Select a category
              </option>

              {categories.map((item) => {
                const categoryValue =
                  typeof item === "string"
                    ? item
                    : item.slug;

                const categoryName =
                  typeof item === "string"
                    ? item
                    : item.name;

                return (
                  <option
                    key={categoryValue}
                    value={categoryValue}
                  >
                    {categoryName}
                  </option>
                );
              })}
            </select>

            {errors.category && (
              <p className="mt-1 text-sm text-red-600">
                {errors.category}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push("/products")
              }
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
"use client";

export default function FilterBar({
  category,
  categories,
  sort,
  onCategoryChange,
  onSortChange,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="w-full sm:w-64">
        <label
          htmlFor="category"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Category
        </label>

        <select
          id="category"
          value={category}
          onChange={(event) =>
            onCategoryChange(event.target.value)
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">All Categories</option>

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
      </div>

      <div className="w-full sm:w-64">
        <label
          htmlFor="sort"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Sort By
        </label>

        <select
          id="sort"
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value)
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Default</option>
          <option value="price-asc">
            Price: Low to High
          </option>
          <option value="price-desc">
            Price: High to Low
          </option>
          <option value="rating-desc">
            Rating: High to Low
          </option>
          <option value="title-asc">
            Title: A to Z
          </option>
        </select>
      </div>
    </div>
  );
}
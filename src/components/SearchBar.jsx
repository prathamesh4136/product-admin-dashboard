"use client";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search products..."
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
export default function ErrorState({ onRetry }) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow">
        <h3 className="text-lg font-semibold text-gray-900">
          Something went wrong
        </h3>
  
        <p className="mt-2 text-sm text-gray-500">
          We couldn't load the products.
        </p>
  
        <button
          onClick={onRetry}
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }
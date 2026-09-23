export default function LoadingState() {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
  
        <p className="mt-4 text-sm text-gray-500">
          Loading products...
        </p>
      </div>
    );
  }
function ProductCard({ product }) {
    return (
      <div className="rounded-xl bg-white p-4 shadow md:hidden">
        <div className="flex gap-4">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-20 w-20 rounded-lg object-cover"
          />
  
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-gray-900">
              {product.title}
            </h3>
  
            <p className="mt-1 text-sm capitalize text-gray-500">
              {product.category}
            </p>
  
            <p className="mt-2 font-semibold text-gray-900">
              ${product.price}
            </p>
          </div>
        </div>
  
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-sm text-yellow-700">
            ★ {product.rating}
          </span>
  
          <span className="text-sm text-gray-500">
            Stock: {product.stock}
          </span>
        </div>
      </div>
    );
  }
  
  export default ProductCard;
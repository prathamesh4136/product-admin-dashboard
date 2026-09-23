export default function ProductTable({ products }) {
    return (
      <div className="hidden overflow-hidden rounded-xl bg-white shadow md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Product
                </th>
  
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Category
                </th>
  
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Price
                </th>
  
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Rating
                </th>
  
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Stock
                </th>
              </tr>
            </thead>
  
            <tbody className="divide-y">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="transition hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
  
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.title}
                        </p>
  
                        <p className="mt-1 text-xs text-gray-400">
                          ID: {product.id}
                        </p>
                      </div>
                    </div>
                  </td>
  
                  <td className="px-6 py-4 text-sm capitalize text-gray-600">
                    {product.category}
                  </td>
  
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ${product.price}
                  </td>
  
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-yellow-50 px-3 py-1 text-sm text-yellow-700">
                      ★ {product.rating}
                    </span>
                  </td>
  
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
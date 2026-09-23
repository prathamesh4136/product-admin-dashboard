import api from "@/lib/axios";

export const getProducts = async (
  limit = 10,
  skip = 0,
  signal
) => {
  const response = await api.get("/products", {
    params: {
      limit,
      skip,
    },
    signal,
  });

  return response.data;
};

export const searchProducts = async (
  query,
  limit = 10,
  skip = 0,
  signal
) => {
  const response = await api.get(
    "/products/search",
    {
      params: {
        q: query,
        limit,
        skip,
      },
      signal,
    }
  );

  return response.data;
};
import api from "@/lib/axios";

export const getProducts = async (limit = 10, skip = 0) => {
  const response = await api.get("/products", {
    params: {
      limit,
      skip,
    },
  });

  return response.data;
};
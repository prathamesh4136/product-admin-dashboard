export const isAuthenticated = () => {
    if (typeof window === "undefined") {
      return false;
    }
  
    return Boolean(localStorage.getItem("authToken"));
  };
  
  export const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  };
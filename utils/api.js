export const fetchWithAuth = async (url, options = {}) => {
  console.log("fetchWithAuth: Starting fetch for URL:", url);
  const token = localStorage.getItem("token");
  console.log(
    "fetchWithAuth: Token:",
    token ? token.substring(0, 20) + "..." : "No token"
  );
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  console.log("fetchWithAuth: Request headers:", headers);
  console.log("fetchWithAuth: Request options:", { ...options, headers });
  try {
    const res = await fetch(url, { ...options, headers });
    console.log("fetchWithAuth: Response status:", res.status);
    console.log(
      "fetchWithAuth: Response headers:",
      Object.fromEntries(res.headers)
    );
    return res;
  } catch (error) {
    console.error("fetchWithAuth: Fetch error:", error.message, error.stack);
    throw error;
  }
};

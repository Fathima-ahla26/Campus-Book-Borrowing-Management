const API_BASE_URL =
  "https://campus-book-borrowing-management-mobile.onrender.com";

type RequestOptions = {
  method?: string;
  body?: any;
  token?: string | null;
};

export async function apiRequest(
  endpoint: string,
  options: RequestOptions = {}
) {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {};

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body:
      body instanceof FormData
        ? body
        : body
        ? JSON.stringify(body)
        : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export { API_BASE_URL };
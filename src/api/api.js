const BASE_URL = "http://localhost:5000";

export const fetchApi = async (url, options = {}) => {
  // Validate URL before making request
  if (!url) {
    console.error("fetchApi: URL is undefined or empty");
    throw new Error("URL is required");
  }

  const fullUrl = BASE_URL + url;
  console.log(`fetchApi: ${options.method || 'GET'} ${url}`);

  try {
    const res = await fetch(fullUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    // Handle non-200 responses
    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If not valid JSON, use text
        errorMessage = errorText || errorMessage;
      }
      console.error(`fetchApi Error: ${url} - ${errorMessage}`);
      throw new Error(errorMessage);
    }

    const data = await res.json();
    console.log(`fetchApi Success: ${url}`);
    return data;
  } catch (err) {
    console.error(`fetchApi Error: ${url} -`, err.message);
    throw err;
  }
};
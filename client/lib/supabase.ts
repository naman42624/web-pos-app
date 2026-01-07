import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
  );
}

// Custom fetch that routes requests through our Express proxy
const proxyFetch = async (
  url: string | Request,
  options?: RequestInit,
): Promise<Response> => {
  const urlStr = typeof url === "string" ? url : url.url;

  // Only proxy Supabase requests
  if (urlStr.includes(supabaseUrl)) {
    try {
      // Convert Supabase URL to proxy URL
      // https://project.supabase.co/auth/v1/... -> /api/supabase/auth/...
      // https://project.supabase.co/rest/v1/... -> /api/supabase/rest/...
      const path = new URL(urlStr).pathname.replace("/", "");
      const proxyUrl = `/api/supabase/${path}`;

      const response = await fetch(proxyUrl, options);
      return response;
    } catch (error) {
      console.error("Proxy fetch error:", error);
      throw error;
    }
  }

  // For non-Supabase requests, use default fetch
  return fetch(url, options);
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: proxyFetch,
    headers: {
      "Content-Type": "application/json",
    },
  },
});

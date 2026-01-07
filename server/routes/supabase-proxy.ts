import { Router, Request, Response } from "express";

const router = Router();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Missing Supabase environment variables on server. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
  );
}

// Proxy all requests to Supabase through the server
router.all(/.*/, async (req: Request, res: Response) => {
  try {
    const path = req.path.replace(/^\//, "");
    let url = "";

    if (path.startsWith("auth/")) {
      url = `${SUPABASE_URL}/auth/v1/${path.replace(/^auth\//, "")}`;
    } else if (path.startsWith("rest/")) {
      url = `${SUPABASE_URL}/rest/v1/${path.replace(/^rest\//, "")}`;
    } else {
      return res
        .status(400)
        .json({ error: "Invalid proxy path. Use /auth/... or /rest/..." });
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
    };

    if (req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }

    // Build query string
    const queryString =
      Object.keys(req.query).length > 0
        ? "?" + new URLSearchParams(req.query as Record<string, string>).toString()
        : "";

    const fetchUrl = url + queryString;

    const response = await fetch(fetchUrl, {
      method: req.method,
      headers,
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    const contentType = response.headers.get("content-type");
    let data: any;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    res.status(response.status);

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    res.send(data);
  } catch (error) {
    console.error("Supabase proxy error:", error);
    res
      .status(500)
      .json({ error: "Failed to proxy request to Supabase", details: error });
  }
});

export default router;

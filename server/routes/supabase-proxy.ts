import { Router, Request, Response } from "express";

const router = Router();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Note: Supabase proxy is not actively used in current deployment
// The application uses MongoDB for data storage instead

// Proxy all requests to Supabase through the server (wildcard route)
router.all("*", async (req: Request, res: Response) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res
        .status(503)
        .json({ error: "Supabase proxy not configured" });
    }

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

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
    };

    if (req.headers.authorization) {
      headers.authorization = String(req.headers.authorization);
    }

    // Build query string
    const queryString =
      Object.keys(req.query).length > 0
        ? "?" +
          new URLSearchParams(req.query as Record<string, string>).toString()
        : "";

    const fetchUrl = url + queryString;

    console.log(`Proxying ${req.method} ${fetchUrl}`);

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
    let responseText = "";

    try {
      responseText = await response.text();

      if (contentType?.includes("application/json") && responseText.trim()) {
        data = JSON.parse(responseText);
      } else if (responseText.trim()) {
        data = responseText;
      } else {
        data = {};
      }
    } catch (parseError) {
      console.error(
        "Failed to parse response body:",
        parseError,
        "Body:",
        responseText,
      );
      // Return original text if JSON parsing fails
      data = responseText || {};
    }

    res.status(response.status);

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    } else {
      res.setHeader("Content-Type", "application/json");
    }

    // Ensure we always send JSON
    if (typeof data === "string") {
      res.json({ data });
    } else {
      res.json(data);
    }
  } catch (error: any) {
    console.error("Supabase proxy error:", error);

    const errorMessage =
      error?.message || "Failed to proxy request to Supabase";
    const statusCode = error?.code === "ENOTFOUND" ? 503 : 500;

    res.status(statusCode).json({
      error: "Failed to proxy request to Supabase",
      message: errorMessage,
      code: error?.code,
    });
  }
});

export default router;

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
router.all("/auth/:path(*)", async (req: Request, res: Response) => {
  try {
    const authPath = req.params.path;
    const url = `${SUPABASE_URL}/auth/v1/${authPath}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
    };

    if (req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }

    const response = await fetch(url, {
      method: req.method,
      headers,
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Supabase proxy error:", error);
    res
      .status(500)
      .json({ error: "Failed to proxy request to Supabase", details: error });
  }
});

// Proxy database requests
router.all("/rest/:path(*)", async (req: Request, res: Response) => {
  try {
    const restPath = req.params.path;
    const url = `${SUPABASE_URL}/rest/v1/${restPath}`;

    const queryString =
      Object.keys(req.query).length > 0
        ? "?" + new URLSearchParams(req.query as Record<string, string>).toString()
        : "";

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
    };

    if (req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }

    const response = await fetch(url + queryString, {
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
    console.error("Supabase REST proxy error:", error);
    res
      .status(500)
      .json({ error: "Failed to proxy request to Supabase", details: error });
  }
});

export default router;

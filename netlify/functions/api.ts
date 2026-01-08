import serverless from "serverless-http";
import { createServer } from "../../server/index.js";

let handler: any;

export const handler = async (req: any, res: any) => {
  try {
    if (!handler) {
      const app = createServer();
      handler = serverless(app);
    }
    return handler(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    res.statusCode = 500;
    res.body = JSON.stringify({ error: "Internal server error" });
    return res;
  }
};

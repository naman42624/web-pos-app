import serverless from "serverless-http";
import { createServer } from "../../server/index.js";

let handler: any;

export default async (req: any, res: any) => {
  if (!handler) {
    handler = serverless(createServer());
  }
  return handler(req, res);
};

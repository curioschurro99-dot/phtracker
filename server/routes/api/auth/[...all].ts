import { defineEventHandler, readRawBody } from "h3";
import { auth } from "@/lib/auth-server";

export default defineEventHandler(async (event) => {
  const host = event.headers.get("host") ?? "localhost";
  const proto = event.headers.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}${event.path}`;
  const rawBody = event.method !== "GET" && event.method !== "HEAD" ? await readRawBody(event) : undefined;
  const req = new Request(url, {
    method: event.method,
    headers: event.headers,
    body: rawBody,
  });
  return auth.handler(req);
});

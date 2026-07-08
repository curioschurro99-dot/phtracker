import { auth } from "../../../../src/lib/auth-server";

export default defineEventHandler((event) => auth.handler(event));

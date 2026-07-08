import { createServerClient } from "@supabase/ssr";
import { parseCookies, setCookie, deleteCookie } from "h3";
import type { H3Event } from "h3";

export function createSupabaseServerClient(event: H3Event) {
  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookies = parseCookies(event);
          return Object.entries(cookies).map(([name, value]) => ({ name, value }));
        },
        setAll(cookies) {
          for (const { name, value, options } of cookies) {
            if (value) {
              if (options?.maxAge === 0) {
                deleteCookie(event, name);
              } else {
                setCookie(event, name, value, options);
              }
            }
          }
        },
      },
    },
  );
}

# Remove Lovable Wrapper + Cloudflare Preset

**Date:** 2026-07-08

## Goal

Replace the `@lovable.dev/vite-tanstack-config` wrapper with a standalone Vite config, and switch the Nitro preset from `cloudflare-module` to `node-server`. This removes unnecessary Lovable platform plugins and makes the production build runnable via `node .output/server/index.mjs` (required for Docker/VPS deployment).

## Scope

- Files to modify: `vite.config.ts`, `package.json`
- Files to create: none
- Files to delete: none
- Packages to remove: `@lovable.dev/vite-tanstack-config`, `vite-tsconfig-paths` (Vite 8 has native tsconfig paths via `resolve.tsconfigPaths`)

## Licenses

Confirmed open source: all 74 production + dev dependencies are MIT, Apache-2.0, ISC, Unlicense, or MPL-2.0. The lovable wrapper is MIT licensed. No proprietary packages exist in the tree — this is purely about removing platform-specific dead code.

## What the lovable wrapper does

It provides `defineConfig()` which injects, in order:

| Plugin / config                              | Purpose                  | Keep?                                                |
| -------------------------------------------- | ------------------------ | ---------------------------------------------------- |
| `@tailwindcss/vite`                          | Tailwind CSS v4          | ✅ Keep                                              |
| `vite-tsconfig-paths`                        | TS path resolution       | 🔄 Replace with native `resolve.tsconfigPaths: true` |
| `@tanstack/react-start/plugin/vite`          | SSR framework            | ✅ Keep via `tanstackStart()`                        |
| `@vitejs/plugin-react`                       | React JSX compilation    | ✅ Keep                                              |
| `@tanstack/devtools-vite`                    | DevTools (dev only)      | ✅ Keep                                              |
| `nitro/vite` (build-only)                    | Production bundler       | ✅ Keep — but change preset                          |
| `@lovable.dev/vite-plugin-hmr-gate`          | Lovable sandbox HMR      | ❌ Remove                                            |
| `@lovable.dev/vite-plugin-dev-server-bridge` | Lovable sandbox proxy    | ❌ Remove                                            |
| `lovable-tagger`                             | Component tagging        | ❌ Remove                                            |
| `lovableAssetsProxyPlugin`                   | Asset proxy              | ❌ Remove                                            |
| `devSsrErrorLogger`                          | Lovable error telemetry  | ❌ Remove                                            |
| `devServerFnErrorLogger`                     | Lovable error telemetry  | ❌ Remove                                            |
| `lovableBuildErrorDiagnostics`               | Lovable error formatting | ❌ Remove                                            |
| `css.transformer: "lightningcss"`            | CSS processing           | ✅ Keep                                              |
| `resolve.alias: { "@": "./src" }`            | Path alias               | ✅ Keep                                              |
| `resolve.dedupe`                             | React deduplication      | ✅ Keep                                              |
| `optimizeDeps.include`                       | Pre-bundling             | ✅ Keep                                              |
| VITE_ env injection                          | Env vars                 | ✅ Keep                                              |
| `server: { host, port }`                     | Dev server               | ✅ Keep (use `::` and `8080`)                        |
| Nitro `defaultPreset: "cloudflare-module"`   | Build target             | 🔄 Change to `preset: "node-server"`                 |

## Implementation

### Step 1 — Rewrite `vite.config.ts`

Replace the single-line wrapper with a plain Vite config that imports plugins directly:

```ts
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { devtools } from "@tanstack/devtools-vite";
import nitro from "nitro/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    define: envDefine,
    css: { transformer: "lightningcss" },
    resolve: {
      tsconfigPaths: true,
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    server: { host: "::", port: 8080 },
    plugins: [
      tailwindcss(),
      tanstackStart({
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      viteReact(),
      mode === "development" && devtools({ logging: false }),
      nitro({
        preset: "node-server",
        serverDir: "server",
      }),
    ].filter(Boolean),
  };
});
```

### Step 2 — Remove unused packages from `package.json`

- Remove `@lovable.dev/vite-tanstack-config` from devDependencies
- Remove `vite-tsconfig-paths` from dependencies (replaced by `resolve.tsconfigPaths: true` in Vite 8)

### Step 3 — Remove `.lovable/` directory

The `.lovable/` directory contains Lovable platform metadata:

```
.lovable/project.json
```

Delete this file or ignore it.

### Step 4 — Verify build

```sh
npm run build
```

The output should:

- Build client + SSR
- Build Nitro with `node-server` preset
- Produce `.output/server/index.mjs` that auto-listens on port 3000 when run with Node

### Step 5 — Verify `node .output/server/index.mjs` starts a server

```sh
npm run build && node .output/server/index.mjs
```

Should print listening on `http://[::]:3000` or `http://0.0.0.0:3000`.

## What's affected

- **Dev server** — `npm run dev` still works (Vite dev server with HMR). Lovable sandbox-specific features (port forcing, proxy bridge) are gone, but these only apply when running on Lovable's preview host.
- **Production** — Nitro now targets `node-server` instead of `cloudflare-module`. The output auto-starts an HTTP server, which is what Docker needs.
- **Lovable platform** — You can no longer deploy from the Lovable dashboard. Deployment is via `docker compose up --build` on your VPS only.

## Future considerations

- If you later want Cloudflare Workers deployment, change `preset` to `cloudflare-module` and handle migrations separately (no persistent Node process). Not needed for current VPS approach.
- The `vite-tsconfig-paths` deprecation warning will disappear — Vite 8 has native support.
- No changes needed to any source files (`src/`, `server/`). The import paths (`@/lib/...`) stay the same.

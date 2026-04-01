---
title: Hosted markdown stream demos should request a user gateway key
type: solution
date: 2026-04-01
status: completed
category: developer-experience
module: apps/www markdown streaming demo
tags:
  - apps-www
  - demo
  - ai
  - gateway
  - api-key
  - markdown
---

# Problem

The markdown streaming demo relied on server-side `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY`.

That works in local dev, but the hosted demo does not ship with a default secret. Users could click `Generate with AI` and hit a backend error without any guided way to provide a key.

# Symptoms

- Hosted users had no obvious path to test live AI streaming.
- The demo only failed after the request reached `/api/dev/markdown-stream`.
- Local dev did not need any extra setup and should keep the current one-click flow.

# Solution

Gate the live AI action by hostname and only request a key on non-local hosts.

We added a small shared helper in [markdown-streaming-demo-ai.ts](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/lib/markdown-streaming-demo-ai.ts) that:

- treats `localhost`, `127.0.0.1`, `[::1]`, and `.local` hosts as local
- normalizes the optional demo gateway key

Then we applied that rule in two places:

- [markdown-streaming-demo.tsx](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/examples/markdown-streaming-demo.tsx)
  - localhost keeps the old direct `Generate with AI` flow
  - hosted environments show a dialog for an `AI Gateway API key`
  - the key is stored in `sessionStorage` for the current browser tab only
  - clicking `Generate with AI` without a stored key opens the dialog and continues after save
- [route.ts](/Users/felixfeng/Desktop/repos/plate/apps/www/src/app/api/dev/markdown-stream/route.ts)
  - accepts an optional `gatewayApiKey` request field
  - prefers that request key for gateway streaming
  - still falls back to the existing server env keys for local/dev flows

# Why This Works

The real split is not dev versus production build mode. It is whether the page is running on a local hostname with trusted developer setup.

That makes hostname gating a better fit than a raw `NODE_ENV` check:

- localhost keeps the friction-free dev loop
- hosted demos can ask the user for the missing secret before the request fails
- the route stays backward compatible because env fallback still exists

Using `sessionStorage` keeps the UX practical without persisting a user secret beyond the current browser tab.

# Verification

## Tests

```bash
bun test apps/www/src/registry/lib/markdown-streaming-demo-ai.spec.ts
bun test apps/www/src/registry/lib/markdown-streaming-chunks.spec.ts
```

Result: passing

## Workspace checks

```bash
pnpm install
pnpm turbo build --filter=./apps/www
pnpm turbo typecheck --filter=./apps/www
pnpm lint:fix
```

The install, build, and typecheck commands passed.

`pnpm lint:fix` still failed because of existing repository-wide Biome diagnostics in `packages/mdast-util-from-markdown` and `packages/remark-parse`, outside this demo-key change.

## Browser verification

Verified with `dev-browser` against the persistent Chrome session:

- `http://localhost:3002/blocks/markdown-streaming-demo`
  - `Generate with AI` is visible
  - `Set key` / `Change key` are not rendered
  - clicking `Generate with AI` streams directly with no dialog
  - observed `Status: streaming -> done`
- `http://192.168.1.2:3002/blocks/markdown-streaming-demo`
  - `Set key` is rendered
  - clicking `Generate with AI` opens the `Add AI Gateway API key` dialog

# Working Rule

If a hosted demo needs a user secret that local dev usually provides through env vars, gate the action by hostname and accept an optional request-body key instead of forcing the hosted environment to carry shared credentials.

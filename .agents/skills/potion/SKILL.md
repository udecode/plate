---
description: The rules that tie Potion (../potion), Plate's largest real app, to Plate. Use before planning, changing, reviewing or syncing anything in Potion from a Plate session, before editing Potion's src/registry or creating a *-app file, and when a Potion task hits a Plate problem. Nobody runs a session inside Potion, so these rules live here.
name: potion
metadata:
  skiller:
    source: .agents/rules/potion.mdc
---

# Potion

Potion is the largest real app built on Plate. It is moving to Plate v54 (`platejs@54`) to test v54's API on a real product before v2 ships.

Every Potion task runs from a Plate session; nobody runs a session inside Potion, and Potion keeps no agent setup of its own. This skill holds the rules that tie Potion to Plate. [The conventions reference](./references/conventions.md) holds Potion's own code conventions, such as its UI, modals, toasts, stores and tests; read it before changing Potion's own code.

## Paths and delivery

- Potion's main checkout is `potion` beside Plate's main checkout, which is the parent of `git rev-parse --path-format=absolute --git-common-dir`. When that folder does not exist, say so and stop.
- Deliver as Plate `AGENTS.md`'s **Potion delivery** rule says: commit in a Potion worktree of its own cut from `origin/next`, fast-forward Potion's `next` and push it.
- A reply links a pushed Potion commit as any other repository's commit, and names one no remote holds yet by its short sha alone.

## Plate first

A problem the port exposes is Plate's first. Potion never hacks around it and never edits a component, `src/registry` included, to hide it.

- Plate fixes it, and Potion waits, when v54 lacks an API, when v54 behaves wrongly, or when the v54 migration misses data that a v53 first-party plugin left.
- Potion changes only when it relied on a v53 pattern that v54 replaces properly. Fix it the v54 way.
- To tell them apart, check Plate's `main` first. When Potion on v53 already behaves the same way, the problem is Potion's own. When unsure, treat it as Plate's.

## Plate problems

1. File a `udecode/plate-private` issue through `maintainer`'s issue-draft mode, whether Plate has a defect or lacks an API Potion needs.
2. Add a row to Potion's `docs/plate-v54/friction-log.md`. When users can see the problem, also add a row to `docs/plate-v54/regressions.md` that names the issue.
3. Stop the blocked part and report it to the owner with the issue.
4. Once the fix lands on Plate's `next`, sync Potion with the `sync-potion` skill and prove the fix in Potion with `verify`'s Potion proof lane (`.agents/rules/verify/references/potion.md`).

## Backend

Potion v54 runs on Cloudflare Workers, as Potion's `docs/plans/2026-11-24-potion-cloudflare.md` plans (owner's call, 2026-11-24). The target stack:

- TanStack Start on `@cloudflare/vite-plugin`, configured in `wrangler.jsonc`.
- better-auth for sign-in. The workers.dev deploy uses email sign-up until go-live.
- Drizzle on D1 for data. Row locks become conditional writes on a `revision` column, and a multi-row write is one `db.batch`.
- Server functions and server routes for the API, called through TanStack Query.
- Plate's Files SDK on R2 for uploads, through the registry's `upload-r2` recipe.
- Browser Rendering for PDF export, and Upstash for rate limits.
- No collaboration until Plate's native sync runs on Durable Objects.

Steps 2 to 4 of that plan replaced Next.js, Hono, tRPC, Prisma and the Yjs server. Uploads, PDF fonts, secrets and rate limits are its later steps. Build new server code on the target stack.

- A change to `src/server` or the database schema needs its row in the backend table of Potion's `docs/plate-v54/backend-changes.md` first, naming the plan step or blocker it answers.
- TanStack's own skills load from the Potion worktree. `npx @tanstack/intent@latest list` lists them, and `npx @tanstack/intent@latest load <package>#<skill>` prints one. Load each skill a change touches, such as start-core's `server-functions`, before writing it. Skip `intent install`, which writes agent config into Potion.

## Registry

Potion's `src/registry` holds Plate's UI components, synced from Plate, and stays offline: no backend code, with Potion's data coming in through Plate's injection points, such as `CommentsPlugin` for comments and `UploadClient` for uploads. Read [the registry reference](./references/registry.md) in full before a sync, before editing a file under `src/registry`, before new Potion-only editor UI, and before creating or changing a `*-app` file. It holds the sync, restyle and `-app` rules and their tables.

## Routing

| Work | Owner |
| --- | --- |
| Sync Plate's packages and UI into Potion | `sync-potion` |
| Potion's own UI, modals, toasts, stores, validation and tests | [the conventions reference](./references/conventions.md) |
| TanStack Start, Router and Query APIs | TanStack's skills, as the Backend section says |
| `src/registry`, restyles, Potion-only editor UI and `*-app` files | [the registry reference](./references/registry.md) |
| Reproduce a bug reported in Potion, or prove a Plate fix there | `verify`'s [Potion proof lane](../verify/references/potion.md) |
| Run Potion locally, sign in a test user and drive a feature | `verify`'s [Potion stack recipe](../verify/references/potion/stack.md) |

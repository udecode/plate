---
description: The rules that tie Potion (../potion), Plate's largest real app, to Plate. Use before planning, changing, reviewing or syncing anything in Potion from a Plate session, before editing Potion's src/registry or creating a *-app file, and when a Potion task hits a Plate problem. Nobody runs a session inside Potion, so these rules live here.
name: potion
metadata:
  skiller:
    source: .agents/rules/potion.mdc
---

# Potion

Potion is the largest real app built on Plate. It is moving to Plate v54 (`platejs@54`) to test v54's API on a real product before v2 ships.

Every Potion task runs from a Plate session; nobody runs a session inside Potion. This skill holds only the rules that tie Potion to Plate. Potion's rules for its own stack, such as React, Next.js, its stores and its tests, stay in Potion's `.claude/rules/`; read the one that Potion's `AGENTS.md` routes the change to.

## Paths and delivery

- Potion's main checkout is `potion` beside Plate's main checkout, which is the parent of `git rev-parse --path-format=absolute --git-common-dir`. When that folder does not exist, say so and stop.
- Deliver as Plate `AGENTS.md`'s **Potion delivery** rule says: commit in a Potion worktree of its own, merge it into Potion's current branch with `git merge --ff-only`, and never push.

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

Potion reuses its backend unless that architecture clearly blocks the port: better-auth for sign-in, Prisma, Postgres and tRPC for data, and the Yjs server that Hocuspocus runs for collaboration.

- A change to `src/server`, `prisma` or the Yjs server needs its row in the backend table of Potion's `docs/plate-v54/backend-changes.md` first, naming the blocker it answers.
- A blocker with no row is no reason to change the backend.

## Registry

Potion's `src/registry` holds Plate's UI components, synced from Plate, and stays offline: no backend code, with Potion's data coming in through Plate's injection points, such as `CommentsPlugin` for comments and `UploadClient` for uploads. Read [the registry reference](./references/registry.md) in full before a sync, before editing a file under `src/registry`, before new Potion-only editor UI, and before creating or changing a `*-app` file. It holds the sync, restyle and `-app` rules and their tables.

## Routing

| Work | Owner |
| --- | --- |
| Sync Plate's packages and UI into Potion | `sync-potion` |
| `src/registry`, restyles, Potion-only editor UI and `*-app` files | [the registry reference](./references/registry.md) |
| Reproduce a bug reported in Potion, or prove a Plate fix there | `verify`'s [Potion proof lane](../verify/references/potion.md) |
| Run Potion locally, sign in a test user and drive a feature | `verify`'s [Potion stack recipe](../verify/references/potion/stack.md) |

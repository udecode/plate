---
date: 2026-05-30
topic: slate-v2-agent-start
status: active
---

# Slate v2 Agent Start

Use this first. It is the small control plane for Slate v2 work after the long
4k-prompt development run.

## Current Truth

- Live implementation repo: `.tmp/slate-v2`
- Control docs: `docs/slate-v2/**`
- Active release claim:
  [absolute-architecture-release-claim.md](/Users/zbeyens/git/plate-2/docs/slate-v2/absolute-architecture-release-claim.md)
- Active roadmap:
  [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- Gate scoreboard:
  [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)

Current public API examples must match `.tmp/slate-v2` source, not old docs.
For reads, teach `editor.read((state) => ...)`. For writes, teach
`editor.update((tx) => ...)`.

## Current Blockers

- Not release-ready.
- Final same-turn integration/build/type/lint/perf closure remains open.
- Full `bun test:integration-local` is a closure gate, not the default
  iteration gate.
- Native mobile proof remains scoped unless a raw-device lane runs.
- Huge-document superiority remains claim-scoped; do not broaden it from nearby
  green rows.

## Normal Agent Path

1. Read this file.
2. Read `master-roadmap.md` only for current tranche and blocker state.
3. Read `absolute-architecture-release-claim.md` only for accepted public claim.
4. Read live `.tmp/slate-v2` source/tests before making any current-state claim.
5. For bugs, use `slate-patch`.
6. For architecture, use `slate-plan --quick` first unless the user asks for a
   durable plan or release-grade review.

## Commands

From `.tmp/slate-v2`:

```sh
bun check
bun check:full
bun test:integration-local
```

From `plate-2`:

```sh
pnpm docs:slate-v2:audit
pnpm install
pnpm lint:fix
```

## Do Not Read First

These are reference bodies, not entrypoints:

- [ledgers/fork-issue-dossier.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/fork-issue-dossier.md)
- [references/architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [decoration-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/decoration-roadmap.md)
- [decorations-annotations-cluster.md](/Users/zbeyens/git/plate-2/docs/slate-v2/decorations-annotations-cluster.md)
- [references/pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)

Use indexes and summaries first. Open giant ledgers only when exact issue,
proof, or maintainer narrative detail is required.

## Consolidation Rule

- Update: current claim docs and agent entrypoints.
- Merge by reference: long architecture and decoration docs.
- Keep indexed: issue dossiers and coverage matrices.
- Archive only when a doc is stale and no current doc links to it.

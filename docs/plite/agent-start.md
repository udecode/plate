---
date: 2026-05-30
topic: plite-agent-start
status: active
---

# Plite Agent Start

Use this first. It is the small control plane for Plite work after the long
4k-prompt development run.

## Current Truth

- Live implementation source: Plite packages under `packages/**`, docs under
  `content/docs/plite/**`, and examples under
  `apps/www/src/app/(app)/examples/plite/**`.
- Control docs: `docs/plite/**`
- Active private-alpha architecture claim:
  [absolute-architecture-release-claim.md](/Users/zbeyens/git/plate-2/docs/plite/absolute-architecture-release-claim.md)
- Active roadmap:
  [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md)
- Gate scoreboard:
  [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/plite/replacement-gates-scoreboard.md)

Current public API examples must match live Plate repo source, not old docs.
For reads, teach `editor.read((state) => ...)`. For writes, teach
`editor.update((tx) => ...)`.

## Current Blockers

- Continuous private alpha: no release, publish, PR, or changeset readiness
  claim unless a prompt explicitly asks for that lane.
- Current-tree private-alpha integration/build/type/lint/perf closure is green
  from the latest same-turn proof after the `plite-browser/playwright` helper
  and Playwright wrapper-script edits.
- Full `bun test:integration-local` is a closure gate, not the default
  iteration gate.
- Yjs soak proof runners are manual-only diagnostics:
  `scripts/proof/yjs-collaboration-soak.mjs`,
  `scripts/proof/yjs-hocuspocus-persistent-room-soak.mjs`,
  `scripts/proof/persistent-browser-soak.mjs`, and
  `scripts/proof/yjs-hocuspocus-production-soak.mjs`. Do not run them unless the
  user explicitly asks for a soak run. Do not add them to `check`, `test`,
  `test:release-proof`, or any automatic agent gate.
- Native mobile proof remains scoped unless a raw-device lane runs.
- Huge-document superiority remains claim-scoped, not release-scoped. The
  strict product gate is green, and the latest broad direct legacy diagnostic is
  current-green: worst p95 ratio `0.77`, default `auto`
  `middleBlockSelectThenTypeMs` `69.78ms` vs legacy `90.42ms`. Keep tracking
  tiny select-all deltas, repeated vertical Shift+Down, and select-all-delete
  undo residual p95 / bulk-restore cost separately.

## Normal Agent Path

1. Read this file.
2. Read `master-roadmap.md` only for current tranche and blocker state.
3. Read `absolute-architecture-release-claim.md` only for accepted public claim.
4. Read live Plate repo source/tests before making any current-state claim.
5. For bugs, use `patch`.
6. For architecture, use `plite-plan --quick` first unless the user asks for a
   durable plan or release-grade review.

## Commands

From `/Users/zbeyens/git/plate-2`:

```sh
pnpm check:plite:dev
pnpm check:plite
pnpm check:plite:browser-matrix
```

Run `pnpm plite:browser:install` once when Playwright reports a missing local
browser. Proof commands never download browsers implicitly.

`check:plite:dev` uses uncommitted inputs by default. Set
`PLITE_CHECK_BASE=<ref>` when the affected range is already committed.
`check:plite` is the strict all-package plus Chromium handoff gate; the browser
matrix remains closure-only.

The publish path runs `pnpm plite:release:packages` after the release build.
That command validates packed package/install behavior only. It packs every
Plite-family package, consumes every public subpath from the tarballs under
NodeNext and Bundler resolution, checks runtime dependency direction, and
proves unused bare and named imports tree-shake to the empty consumer baseline.
Keep this release-only; it validates built output and does not belong in the
daily Plite loop.

When `PLITE_RELEASE_CLAIM_PROFILE=release-ready`,
`pnpm plite:release:proof` resolves
the run named by `PLITE_RELEASE_PROOF_RUN_ID`, downloads its one unexpired
`plite-release-proof` artifact by ID, verifies GitHub's archive digest, and
checks the bundle against the exact release commit and live run attempt before
publishing. The producer must be a successful manual
`.github/workflows/plite-ci.yml` run from `udecode/plate` at the checkout commit.
The release command rejects caller-local manifests plus tracked or untracked
checkout changes, so direct beta/latest publication has the same boundary as
the workflow. Those repository variables are one-release inputs: preflight the
producer run from a clean checkout, set them only under explicit release
authorization, and clear both after the target run. The `release-lanes` skill
owns that lifecycle.

Plite CI does not currently emit this bundle, so broad release-ready claims stay
blocked. A producer job must assemble it from lane-owned outputs rather than
accepting operator-authored results.

From `plate-2`:

```sh
pnpm docs:plite:audit
pnpm install
pnpm lint:fix
```

## Do Not Read First

These are reference bodies, not entrypoints:

- [ledgers/fork-issue-dossier.md](/Users/zbeyens/git/plate-2/docs/plite/ledgers/fork-issue-dossier.md)
- [references/architecture-contract.md](/Users/zbeyens/git/plate-2/docs/plite/references/architecture-contract.md)
- [decoration-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/decoration-roadmap.md)
- [decorations-annotations-cluster.md](/Users/zbeyens/git/plate-2/docs/plite/decorations-annotations-cluster.md)
- [references/pr-description.md](/Users/zbeyens/git/plate-2/docs/plite/references/pr-description.md)

Use indexes and summaries first. Open giant ledgers only when exact issue,
proof, or maintainer narrative detail is required.

## Consolidation Rule

- Update: current claim docs and agent entrypoints.
- Merge by reference: long architecture and decoration docs.
- Keep indexed: issue dossiers and coverage matrices.
- Archive only when a doc is stale and no current doc links to it.

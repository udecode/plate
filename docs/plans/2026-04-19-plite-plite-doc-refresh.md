---
date: 2026-04-19
topic: plite-slate-doc-refresh
status: completed
---

# Goal

Sync the stale live `plate-2` docs for `packages/plite` after the final
`plite` package closeout reached:

- `bun test ./packages/plite/test`
- `bunx turbo build --filter=./packages/plite`
- `bunx turbo typecheck --filter=./packages/plite`
- `bun run lint:fix`
- `bun run lint`

all green.

# Scope

- update live `docs/plite/**` control docs that still say tranche 3 /
  `slate` transform recovery is pending
- refresh stale `docs/solutions/**` language that still describes
  `splitNodes(...)` as narrow-only
- do not touch support-package / DOM / React tranche docs beyond what the
  `slate` completion forces

# Findings

## Live stale reads

- `master-roadmap.md` still marks tranche 3 pending
- `replacement-gates-scoreboard.md` still marks core claim-width audit pending
- `release-readiness-decision.md` still says merged package corpora do not
  exist yet and targeted package recovery has barely started
- `plite-transforms-api.md` still says broad helper breadth remains explicit
  skip by default
- `2026-04-09-plite-transforms-family-deleted-test-closure.md` still marks
  `mergeNodes/*`, `splitNodes/*`, `insertNodes/*`, `insertText/*`,
  `removeNodes/*` as explicit skip even though the full package suite is green
- `2026-04-07-plite-split-node-should-keep-left-branch-id-and-rebase-inward.md`
  still documents `splitNodes(...)` as a narrow helper only

# Remaining `slate` package read before edits

- package-local code/test/build/typecheck/lint items: none
- remaining migration program items move to tranche 4+:
  - `plite-history`
  - `plite-hyperscript`
  - `plite-dom`
  - `plite-react`
  - examples / benchmark / root proof closure
  - final RC ledger closure

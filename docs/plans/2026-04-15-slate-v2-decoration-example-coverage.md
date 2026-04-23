---
date: 2026-04-15
topic: slate-v2-decoration-example-coverage
status: completed
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
---

# Goal

Give the decoration / annotation / widget stack full example coverage on the
examples site.

# Scope

- public examples under `/Users/zbeyens/git/slate-v2/site/examples/ts`
- example navigation / example docs
- no architecture or runtime changes unless example coverage exposes one

# Loaded Skills

- `major-task`
- `task`
- `planning-with-files`
- `learnings-researcher`
- `react`
- `components`

# Phases

- [x] Audit current example coverage
- [x] Decide the minimal missing example set
- [x] Implement new examples and unlock coverage in navigation/docs
- [x] Run required verification
- [x] Summarize the new example matrix

# Findings

- current visible example coverage already includes:
  - derived decoration:
    - `search-highlighting`
    - `code-highlighting`
  - selection widgets:
    - `hovering-toolbar`
    - `mentions`
  - large-document overlay posture:
    - `huge-document`
- current hidden/low-level example coverage includes:
  - minimal derived decoration:
    - `highlighted-text`
  - bookmark-backed anchors plus annotation-backed widgets:
    - `persistent-annotation-anchors`
- the real missing gap is a public example for externally-owned decoration
  sources
- the other real gap is a public product-like review/comments example; the
  current anchor example is debug-grade, not feature-grade
- the minimal honest set is:
  - one visible `external-decoration-sources` example
  - one visible `review-comments` example
  - docs/navigation updates that make overlay example coverage explicit
- one non-obvious trap surfaced during implementation:
  `useSlateAnnotationStore(...)` input data must keep stable reference identity
  or example UIs can self-refresh into a loop

# Progress

## 2026-04-15

- audited the current examples, example navigation, replacement-candidate docs,
  and hook/docs surfaces
- confirmed the site auto-discovers new example files but still needs explicit
  names in `site/constants/examples.ts`
- added:
  - `/Users/zbeyens/git/slate-v2/site/examples/ts/external-decoration-sources.tsx`
  - `/Users/zbeyens/git/slate-v2/site/examples/ts/review-comments.tsx`
- updated public example/docs surfaces:
  - `/Users/zbeyens/git/slate-v2/site/constants/examples.ts`
  - `/Users/zbeyens/git/slate-v2/site/examples/Readme.md`
  - `/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md`
- verified:
  - `pnpm typecheck:site`
  - `pnpm lint:fix`
  - browser smoke on both new routes through
    `scripts/run-slate-browser-local.sh`
- captured the store-identity trap in:
  `/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-15-annotation-store-inputs-must-keep-stable-data-references.md`

# Errors

- `docs/solutions/patterns/critical-patterns.md` is missing in this repo

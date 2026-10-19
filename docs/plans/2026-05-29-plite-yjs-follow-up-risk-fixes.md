status: complete
owner_skill: .agents/skills/task/SKILL.md
source_repo: /Users/felixfeng/Desktop/repos/plite
completion: .tmp/019e71a2-c1fd-7bf3-83ff-732f806062ee/completion-check.md
changeset_required: yes
browser_proof_required: yes

# Plite Yjs Follow-Up Risk Fixes

## Goal

Close the follow-up risks found after the first `@slate/yjs` package pass:
restore the full demo command matrix, make remaining `replace_fragment` risk
explicit and narrower, isolate split undo stack access behind one adapter,
restore the intended runtime peer floor, and remove the site's package-local Yjs
path alias.

## Scope

- `../plite/packages/plite-yjs`
- `../plite/site/examples/ts/yjs-collaboration.tsx`
- `../plite/playwright/integration/examples/yjs-collaboration.test.ts`
- `../plite/packages/plite-react/package.json`
- `../plite/packages/plite-dom/package.json`
- `../plite/site/tsconfig.json`
- lockfile and changeset metadata as needed

## Phases

- [x] Recover skills and prior task context
- [x] Audit the five reported regressions against live files
- [x] Add contracts for UI controls, split undo adapter isolation, and
      `replace_fragment` identity risk
- [x] Implement package, site, and dependency fixes
- [x] Run focused unit, type, lint, and browser verification
- [x] Close the completion-check state only after fresh evidence

## Findings

- The demo panel currently exposes only the smaller command set: select, mark,
  connectivity, undo/redo, append, replace, split, wrap, insert fragment, insert
  text, and move.
- `replace_fragment` has a single-text identity-preserving path, then a scoped
  delete/reinsert fallback for all broader cases.
- Split undo currently reaches `undoManager.undoStack` and `redoStack` directly
  inside the controller.
- `plite-react` peers `plite-dom` at `>=0.124.1`; the intended floor is
  `>=0.124.2`.
- `site/tsconfig.json` maps `yjs` to
  `../packages/plite-yjs/node_modules/yjs`, which depends on local install
  layout and can select a different Yjs copy than root tools.

## Verification Log

- `/Users/felixfeng/Desktop/repos/plite`: `bun install --lockfile-only`
- `/Users/felixfeng/Desktop/repos/plite`: package-local stale Yjs 13.6.31
  removed after confirming root Yjs is 13.6.30
- `/Users/felixfeng/Desktop/repos/plite`:
  `bun test ./packages/plite-yjs/test` -> 102 pass
- `/Users/felixfeng/Desktop/repos/plite`:
  `bun --filter @slate/yjs typecheck`
- `/Users/felixfeng/Desktop/repos/plite`:
  `bun --filter @slate/yjs build`
- `/Users/felixfeng/Desktop/repos/plite`:
  `bun --filter plite-react test:vitest -- test/surface-contract.test.tsx`
  -> 28 pass
- `/Users/felixfeng/Desktop/repos/plite`:
  `bun --filter plite-react typecheck`
- `/Users/felixfeng/Desktop/repos/plite`:
  `bun --filter plite-dom typecheck`
- `/Users/felixfeng/Desktop/repos/plite`: `bun typecheck:site`
- `/Users/felixfeng/Desktop/repos/plite`: `bun lint:fix`
- `/Users/felixfeng/Desktop/repos/plite`:
  `curl -I --max-time 5 http://localhost:3100/examples/yjs-collaboration`
  -> 200
- `/Users/felixfeng/Desktop/repos/plite`:
  `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun test:integration-local --project=chromium --grep "yjs collaboration example"`
  -> 30 pass
- `/Users/felixfeng/Desktop/repos/plite`:
  screenshot proof at `.tmp/yjs-proof/full-control-matrix.png`
- `/Users/felixfeng/Desktop/repos/plite`: `bun check`
- `/Users/felixfeng/Desktop/repos/plate-copy`:
  `docs/solutions/developer-experience/2026-05-29-slate-yjs-package-local-yjs-aliases-hide-duplicate-installs.md`

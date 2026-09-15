# Suggestions docs coverage

Status: Complete

## Outcome

Expand `/docs/suggestion` using Comments as the nearest sibling and Plate Docs
as the page owner. Preserve the existing insertion/deletion review example.

## Acceptance

- [x] Complete mounted kit setup, correct dependencies and identity requirements.
- [x] Distinct previews for formatting/block changes, accepted/proposed/markup
  views, and an in-memory save/reload round trip.
- [x] Explain decisions, local history, persistence boundaries, comment replies,
  and link advanced authored history/export/conflicts to their existing guide.
- [x] Generate registry output on `next`, record a registry changelog, and pass
  docs parsing/parity and affected source checks.
- [x] Verify the exact route and meaningful demo actions in Chrome, including
  preview/code tabs; retain observations and screenshots.

## Decisions and scope

Comments demonstrates independent tasks rather than a preview per API method.
Use the same density and section shape here. No new package API or docs route.
Accepted/proposed/markup are projections; read-only is a separate view setting.
Persistence demonstrates a local snapshot, not a backend or collaboration.
No commit or publication was requested. The caret-mark repair belongs to the
unreleased Plite runtime, absent on `main` and covered by
`.changeset/plite-canonical-architecture.md`; no separate branch-only package
changeset. Registry demo and review-button changes have a draft registry entry.
Structured Autoreview: not run on `next` under branch policy.

## Evidence

Source: `content/docs/(plugins)/(collaboration)/comment.mdx`, the authored-changes
guide, `apps/www/src/registry/components/editor/suggestion.tsx`, and current
authored public exports. Shape comparison: local shadcn Button page.

Proof receipts live in `artifacts/suggestions-docs-coverage/`:

- `docs-check.log`: API reference, MDX parsing and source parity passed.
- `registry.log`, `registry-source.log`, `changelog-check.log`: generated
  registry and changelog output passed their source checks.
- `projected-marks-owners.log`: 824 passing authored/schema/view owner tests.
- `native-pending-marks-proof.md`: 94 passing native/model/input-router tests,
  React source types and all Plite test types.
- `ui-tests-final.log`: 11 passing discussion/suggestion tests after the final
  input repair; no failures.
- `types-final.log`: current www source TypeScript check passed. Earlier
  diagnostics in `types.log` are superseded.
- `types-authored.log`: authored entrypoint TypeScript check passed.
- `lint-final.log`: affected source lint and format passed.
- `saved-reply-restored.png`: Chrome restored a pending proposal and its reply
  after a decision and snapshot reload.
- `formatting-native.png`: native Bold-on typing, Bold-off typing, paragraph
  insertion, and undo/redo after the input repair.
- `projections.png`: rendered markup, selected control, and read-only UI.
- `browser-proof.md`, `chrome-clean-errors.json`: exact route interaction
  receipts and a fresh page with no console errors or warnings.
- `source.sha1`: final source identity for the docs, examples and repaired owners.

Chrome verified all four preview/code tabs, proposal decisions and their
undo/redo, all three projection contents, read-only input prevention, saved
replies and decisions, native typing, Enter, and input undo/redo. A restored
projection exposed stale discussion keys; the review hook now observes view
projection changes, with a rendered regression. Live Bold exposed additional
view ownership errors: caret-mark writes were not recorded as selection writes,
path-based schema checks used the accepted document, mark reads checked the
source selection, and the native input shortcut ignored the mounted view's
marks. The owner repairs preserve the current API. Selected-range Bold and
native Bold-on/type/Bold-off/type now pass in Chrome.

The final server is PID 7116, cwd `apps/www`, started with
`PLATE_WWW_DEV_SOURCE=1 pnpm --filter www dev`. The exact route returned HTTP 200
at 2026-09-13 09:18 UTC. Old error logs record temporary registry generation and
Fast Refresh failures during development; the fresh final Chrome page has none.

## Next action

None. The expanded Examples section is open in Chrome. The dev server remains
running. No commit, push or publication was performed.

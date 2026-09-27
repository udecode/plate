---
review_scopes:
  - exports
review_basis:
  - 2026-09-24-exports-final-pass
work_kind: implementation
---

# Exports projection menu

Status: Complete

Objective:
Adopt `docs/research/decisions/export-fidelity.md` in the copied export menu:
one explicit clean projection for HTML, Markdown and Word, a separate
review-preserving Word export, no raster PDF/image, and an app-owned HTML
stylesheet without the platejs.org dependency.

Authority: user `go` after `/task design plan exports`, followed by explicit
authorization to repair every defect found in the final pass (2026-09-24).
Local repository changes only; no commit, push, PR or release.

## Decisions

- Every action captures `model.read.value()` once. If the runtime has the
  optional authored capability, `isAuthoredEditor(model)` narrows it and
  `readAuthoredFormatSnapshot` supplies accepted and proposed values. HTML
  and Markdown receive the selected clean value through a neutral
  `BaseEditorKit` serializer editor; Word receives the same projection.
  There is no cast and no fake authored export editor.
- Pending suggestions show **Include suggested changes** (`proposed`) and
  **Exclude suggested changes** (`accepted`). Every menu opening resets the
  default from the mounted authored view. Pending visibility remains reactive
  while the menu is closed.
- **Export as Word** uses the selected clean projection when changes are
  pending. With no pending changes it uses `review`; retained DOCX source
  controls exact fidelity, not semantic policy. **Export as Word with tracked
  changes** always uses `review`.
- Neutral HTML and Markdown serializers remain independent of authored
  changes. Authored adapters still require the capability. DOCX remains the
  only review-preserving format in this menu.
- The authored runtime exposes `isAuthoredEditor` and `read.canPropose()`.
  Suggestion mode rejects entry without a current author, and the mode toolbar
  hides that unavailable mode. Read-only accepted/proposed views do not need a
  writer identity.
- Adjacent authored insertion fragments are coalesced at read and format
  boundaries. Contiguous typing therefore appears as one suggestion and one
  Word insertion revision without changing write-history granularity.
- Each format surfaces converter diagnostics through the menu's toast helper.
  There is no cross-format diagnostics API.
- Export as PDF and Export as Image, `getCanvas`, `html2canvas-pro` and
  `pdf-lib` are deleted. A later print or snapshot action must define its own
  presentation contract.
- HTML inlines same-origin app styles with absolute `url()` references,
  preserves the page's body classes, and retains cross-origin sheets as links.
  It has no platejs.org, Google Fonts or KaTeX CDN dependency.
- The import registry item points to `/docs/docx`. The export trigger owns the
  first gesture after an item closes so the menu reopens with one click.
- `docx-demo` sets `userId: 'alice'`, so its Suggestion mode is a real
  authored write path.

## Acceptance

- [x] Each export captures the model once, selects one clean document snapshot,
      and gives that snapshot to neutral HTML/Markdown serializers and DOCX.
      Optional authored access is typed without a fake export editor or casts.
- [x] The projection control says Include/Exclude, follows the current view on
      every menu opening, and pending-suggestion visibility updates reactively.
- [x] Plain Word export uses review semantics when there are no pending
      suggestions, so retained source affects fidelity rather than policy.
- [x] Suggestion mode cannot be entered without a current author; the toolbar
      reflects that capability, and contiguous typing is grouped as one
      suggestion and one tracked Word insertion.
- [x] The import registry metadata points at a real documentation route and the
      export menu reopens with one click after every action.
- [x] HTML, Markdown and DOCX artifacts were captured and inspected. Chromium
      opened the HTML artifact; Pages opened both DOCX variants and reported
      one tracked change only for the review-preserving file.
- [x] PDF/Image actions and their dependencies are absent from registry source,
      the `www` package and the lockfile.
- [x] English and Chinese docs, registry metadata, changelog, changesets and
      generated registry output describe the final contract.
- [x] Package tests, authored partition, typechecks, docs checks, registry
      tests/freshness and the Chromium DOCX suite pass.
- [x] A superseding immutable execution outcome records the repaired
      implementation and artifact proof; ledger render/check pass.

## Repairs found during execution

- Replaced the first implementation's menu-owned authored editor with a public
  optional-capability guard and neutral serializer inputs.
- Removed authored casts from HTML, Markdown, DOCX, AI, discussion and version
  history consumers. Plate transaction portals accept exact native plugin
  descriptors.
- Kept read-only authored projections legal while enforcing author identity at
  the Suggestion-mode and authored-write boundaries.
- Fixed per-character suggestion presentation, the missing import-docs route,
  the first-click menu reopen regression, a browser `document` shadowing
  crash, and the DOCX source-lane import path.
- Added `jszip` as a direct `www` development dependency because its browser
  contract inspects downloaded DOCX packages.
- Existing Best API doctrine already requires descriptor-owned runtime
  validation and exact descriptor transaction portals, so no doctrine or
  Plate Next version change was warranted.

## Proof

- Authored partition: 416 passed.
- Plate focused static, Markdown, DOCX and suggestion tests: 36 passed.
- Mode toolbar: 3 passed; registry contract: 16 passed.
- Plate typecheck: 88/88 tasks; both `www` TypeScript projects pass.
- Chromium `apps/www/tests/browser/docx.spec.ts`: 3 passed.
- Docs parity, registry source/freshness, changelog freshness and scoped
  Ultracite checks pass.
- Viewer and artifact evidence:
  `docs/plans/artifacts/2026-09-24-exports-review/browser-proof.md` and
  `docs/plans/artifacts/2026-09-24-exports-review/final/`.

## Evidence

- Review: `docs/research/review-records/2026-09-24-exports-final-pass.json`
- Final execution:
  `docs/research/review-records/2026-09-24-exports-final-repair.json`
- Probes, browser proof and artifacts:
  `docs/plans/artifacts/2026-09-24-exports-review/`

## Next action

None.

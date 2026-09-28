---
review_scopes:
  - imports
  - exports
review_basis:
  - 2026-09-27-imports-adversarial-audit-feedback
  - 2026-09-27-exports-adversarial-audit-feedback
work_kind: implementation
---

# Conversion correctness guarantees

Status: Completed

Objective:
Finish the correctness guarantees of the accepted conversion design: Plite
slice admission and content preservation, cross-block range replacement, a
genuinely narrow typed-editor contract, and paste diagnostics with a registry
consumer.

Goal plan:
docs/plans/2026-09-28-conversion-correctness-guarantees.md

Template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- The user's pasted review and decision after
  [the open findings](2026-09-28-document-conversion-open-findings.md): repair
  Plite slice admission and content preservation, fix range replacement,
  strengthen the narrow-editor contract, then wire paste diagnostics. Keep the
  report, give it a registry consumer with one actionable warning per paste when
  content is dropped or insertion fails; package code owns diagnostics, copied
  registry UI owns toasts, and the report reflects actual losses. Yjs is
  collaboration work, streaming Markdown is Benchmark work, Firefox/WebKit stay
  accurately unverified. Native goal tools are unavailable in this Claude Code
  runtime; this plan is the acceptance ledger.

Completion threshold:
- Insertion preserves admitted content or refuses atomically, with a guard;
  cross-block replacement has a defined, tested joining law; a generated exact
  editor type proves editor methods narrower than `Value`; paste loss reaches
  one registry toast in a real browser while sanitized pastes stay quiet; every
  defect exposed on the way is repaired at its owner; package, type, registry,
  doctrine and ledger gates pass.

Verification surface:
- `plitejs` and `platejs` suites and typechecks, `platejs` compiled contracts,
  `www` typecheck with fresh registry, `pnpm entrypoint:turbo:check`,
  `pnpm brl`, Chromium clipboard spec, a real-browser toast proof against a
  normal-mode dev server, Plate Next `validate`, review-ledger `render`/`check`,
  `lint:fix`, `git diff --check`.

Constraints:
- Local checkout on `next`; no commit, push, PR or release authority.

Boundaries:
- Allowed: Plite DataTransfer negotiation and DOM owner state, Plate HTML and
  Markdown transfer adapters, HTML decoder, root `DOMPlugin` export, registry
  editor kit, docs, changesets, registry changelog, doctrine, decision page,
  plan and ledger.
- Excluded: Yjs incoming fitting, Markdown streaming cost, Firefox/WebKit
  proof, an HTML mapping for video.

Blocked condition:
- None.

Task state:
- current_phase: closed
- next: none; findings return to the user

Work Checklist:
- [x] Slice admission and content preservation. Strict grammar admission at the
  slice boundary was prototyped and reverted: it rejected slices the fitter
  repairs losslessly (text pasted into a table cell) and orphaned content roots
  in the lifecycle contract. The fitter already refuses atomically. The prior
  plan's finding that insertion "dropped content while reporting success" was a
  misdiagnosis: the plain-text fallback won silently after the fitter refused.
  Guard: `slice-fit-contract.test.ts` "refuses a closed element holding a child
  its grammar disallows". The silent fallback is now reported (item 4).
- [x] Defect found while probing: in the registry kit, HTML `<li>` created the
  first configured list target, a heading without `level`; decoding threw and
  list paste fell back to plain text. A `createsElement` mapping now creates the
  schema default block when it is a target. Guard: `BaseListPlugin.spec.tsx`
  "decodes bare HTML items into the default block whatever the target order"
  (fails without the fix).
- [x] Range replacement. Plite already joins both boundaries into the start
  block; the trailing empty paragraph came from the kit's `TrailingBlockPlugin`
  after a heading ended the document (proven by removing it from the kit).
  Guard: `slice-fit-contract.test.ts` "joins both boundaries into the start
  block when … replaces a cross-block range" for bare text, a closed paragraph
  and an open paragraph, including the selection.
- [x] Narrow typed editor. The kit-scale contract
  `apps/www/src/__tests__/package-integration/conversion/detached-conversion-types.ts`
  uses the generated `Editor`: its value is not `Value`, `api.html.parse` and
  `api.markdown.parse` return exactly its document, and a standalone document is
  rejected as an exact one. A planted false equality fails the lane.
- [x] Paste diagnostics. Warnings declare `impact`; `DataTransferReport.lossy`
  derives loss; thrown format callbacks are rejected attempts; HTML and Markdown
  adapters classify their warnings; the HTML decoder reports unmapped embedded
  content; `DOMPlugin` is exported from `platejs`; the registry editor kit shows
  one toast per lossy paste.
- [x] Defect found by real-browser proof: mounted views transfer through their
  own editor object, so report sinks and clipboard keys keyed by the activation
  editor were missed. Both resolve through `getEditorRuntimeOwner`; the
  projected-clipboard caller workaround is deleted. Guard:
  `data-transfer-format.test.ts` "views report transfers and read the clipboard
  key of their runtime owner" (each half fails without its fix).
- [x] Docs, changesets, registry changelog, doctrine v246, decision page.
- [x] Final gates pass after the last `lint:fix`, which also caught a
  forbidden `platejs/core` import of `plitejs/dom` (now through the internal
  DOM re-export) and regenerated the entrypoint Turbo config.
- [x] Execution record recorded; decision pages reconciled; ledger
  `render`/`check` pass.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Slice admission | Plite fitter | Keep admission to vocabulary and roots; guard atomic refusal | Grammar validation at admission (rejects lossless repairs) | Plite contract |
| `<li>` target | HTML `createsElement` resolution | Default block when it is a target | Reorder the registry targets (leaves the law broken for other kits) | list spec, kit probe |
| Trailing paragraph | `TrailingBlockPlugin` | No change; configured kit policy | Suppress trailing blocks after paste (fights the kit) | kit probe, Plite contract |
| Loss classification | each format adapter | `impact` on warnings, derived `lossy` | Report-level heuristics in the registry (UI would own diagnostics) | Plite and Plate specs |
| Negotiation noise | Plite report | Same-MIME fallback is not lossy | Any failed attempt is lossy (Markdown text/plain would toast) | Plite spec |
| Sanitization | HTML adapter | Parser recovery and unsafe removal are lossless | Lossy (every Google Docs paste carries `<meta>`) | browser proof |
| View owner state | Plite DOM runtime | Key by runtime owner | Per-caller owner resolution (the existing workaround) | Plite spec, browser proof |
| Toast action | registry kit | Descriptive next step | Undo button (needs the editor in the report callback) | browser proof |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Package behavior | yes | `platejs`/`plitejs` suites | 141/141 and 21/21 tasks |
| Types | yes | package typechecks, contracts, `www` typecheck | `platejs` 90/90 and contracts; `plitejs` 11/12, the failure pre-existing; full `www` chain |
| Browser | yes | Chromium clipboard spec; toast proof in normal mode | 4/4; toast proof 3/3 |
| Registry | yes | build, changelog `--check` | fresh output; check passes |
| Doctrine | yes | v246, mirrors, `validate` | valid |
| Ledger | yes | execution record, render, check | `2026-09-28-conversion-correctness-guarantees` |

Verification evidence:

- After the last `lint:fix`: `pnpm brl`; `plitejs` tests 21/21 tasks;
  `plitejs` typecheck 11/12 tasks, where the only failure is `typecheck:tests`
  in `test/react/authored-fragment-provider.test.tsx` (six errors, upstream
  `7cbec2435f`, unchanged by this work); `platejs` typecheck 90/90, compiled
  contracts, tests 141/141 tasks; `www` typecheck with fresh registry,
  `api-reference`, docs parity and registry source checks;
  `pnpm entrypoint:turbo:check`; registry changelog `--check`; Plate Next v246
  `validate`; Chromium clipboard spec 4/4; `git diff --check`.
- Guards fail without their fixes: list default block, both halves of the view
  owner test, and the narrow editor contract (planted false equality).
- Real-browser toast proof, normal-mode dev server (the Playwright lane runs
  plite mode, which mounts no Toaster): a trusted native paste and a synthetic
  paste of HTML with an unmapped `<video>` each showed exactly one toast;
  Google Docs–style HTML with `<meta>` and an `onclick` showed none. It first
  failed, which exposed the view-owner defect.

Findings for the user:

- The video plugin has no HTML mapping, so pasted `<video>` is dropped; the
  paste now reports it and warns.
- `plitejs` `typecheck:tests` fails in `test/react/authored-fragment-provider.test.tsx`
  (six errors from upstream commit `7cbec2435f`); pre-existing and untouched.
- Firefox and WebKit paste remain unverified; Yjs incoming fitting and
  Markdown streaming cost remain with their owners.

Final handoff:

- Outcome: insertion preserves or refuses atomically (guarded); cross-block
  replacement joins into the start block (guarded); the generated editor type
  proves exact editor documents; paste loss reaches one registry toast in a
  real browser while sanitized pastes stay quiet. Three defects exposed on the
  way are repaired at their owners: `<li>` target order, silent unmapped
  embedded content, and report sinks and clipboard keys missed by mounted views.
- Limits: browser proof is Chromium only, and the toast proof ran once against a
  normal-mode server because the Playwright lane mounts no Toaster.
- Local, uncommitted.

Timeline:

- 2026-09-28 Plan created; items 1–4 implemented and proven; gates, record
  and ledger closed.

Open risks:

- Default `lossPolicy: 'reject'` HTML parses now fail when embedded content has
  no installed mapping; that is the truthful result, and callers that accept
  loss pass `lossPolicy: 'allow'`.

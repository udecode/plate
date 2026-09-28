---
review_scopes:
  - imports
review_basis:
  - 2026-09-28-imports-paste-loss-reporting-review
work_kind: implementation
---

# Paste loss reporting repairs

Status: Completed

Objective:
Repair the three loss-reporting defects found by
[the paste-loss review](../research/review-records/2026-09-28-imports-paste-loss-reporting-review.json)
after [the correctness guarantees](2026-09-28-conversion-correctness-guarantees.md),
and make the `plitejs` typecheck green.

Goal plan:
docs/plans/2026-09-28-paste-loss-reporting-repairs.md

Template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- The user's pasted review and `go complete all remaining items without
  pausing`: keep `impact`, the report, runtime-owner routing and registry
  toasts; repair unsupported-only HTML, fallback text hiding media, and blanket
  lossless safety removal, with focused guards. The review also refuted the
  prior "all gates pass" claim. Native goal tools are unavailable in this Claude
  Code runtime; this plan is the acceptance ledger.

Completion threshold:
- Each of the review's five failing assertions passes and fails again without
  its repair; the Docs control stays quiet; the repaired cases reach the
  registry toast in a real browser; `plitejs` and `platejs` typechecks and
  suites, `www` typecheck, registry, doctrine and ledger gates pass with no
  pre-existing exceptions.

Verification surface:
- Focused `html.spec.ts` and `DOMPlugin.spec.ts` guards; the full package,
  type, registry, doctrine and ledger gates; Chromium clipboard spec; a
  real-browser toast proof against a normal-mode dev server.

Constraints:
- Local checkout on `next`; no commit, push, PR or release authority.

Boundaries:
- Allowed: HTML sanitizer, HTML decoder and transfer adapter, HTML diagnostic
  type, internal Plite selection helper signatures, docs, changeset, doctrine,
  decision page, plan and ledger.
- Excluded: architecture changes, a video mapping, Yjs, Markdown streaming.

Blocked condition:
- None.

Task state:
- current_phase: closed
- next: none

Work Checklist:
- [x] Unsupported-only HTML. Clipboard HTML that decodes to an empty slice now
  declines quietly only when nothing was lost; after a lossy change it returns
  a rejected attempt (`html-no-content` plus the loss diagnostics), so a plain
  fallback or a total refusal reports `lossy`.
- [x] Fallback text hiding media. Embedded media without an installed mapping
  reports `html-unsupported-content` even when fallback children survive
  (`replaced` rather than `dropped`), so a default `reject` parse fails.
  `<picture>` left the list: it is a container, and its `<img>` reports itself.
- [x] Blanket lossless safety removal. `html-unsafe-content` carries `impact`,
  set by the sanitizer: removing metadata, scripts, style sheets, event handlers
  and script URLs is lossless; removing SVG, MathML, embedded objects, blocked
  `data:` media sources, inline frame documents and resource-loading styles is
  lossy. Lossy removal fails a `reject` parse, like other lossy results.
- [x] Guards: `html.spec.ts` "reports unmapped media even when its fallback
  content survives" and "classifies mandatory unsafe removal by the content it
  drops"; `DOMPlugin.spec.ts` "reports … by what the paste dropped" for the
  review's five cases plus the Docs control. Restoring the three old behaviors
  fails seven of them; the control passes both ways.
- [x] `plitejs` `typecheck:tests`: six errors since upstream `7cbec2435f`
  passed an inferred view editor to `syncEditableDOMSelectionToEditor` and
  `applyEditableDOMSelectionChange`, which required the erased
  `ReactRuntimeEditor<Value>`. Both private DOM-scope helpers now take
  `ReactRuntimeEditor<any>`, like their sibling selection helpers, instead of
  widening the test fixture.
- [x] Docs, changeset, decision page and Plate Next v246 updated to the
  source-classified law.
- [x] Final gates after the last `lint:fix`; execution record; ledger.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Empty decode after loss | HTML transfer adapter | Rejected attempt | Insert an empty slice (deletes the selection) | report guards, browser |
| Media fallback | HTML decoder | Report `replaced`, keep fallback | Drop fallback text (loses content twice) | HTML and report guards |
| Safety impact | HTML sanitizer | Classify per removed element or attribute | Keep the code-level exemption (hides SVG and object text) | HTML guards, browser |
| Script URLs | HTML sanitizer | Lossless | Lossy (a script URL is never content) | media-embed spec |
| Test typing | Plite selection helpers | Accept inferred editors | Widen the fixture to `Value` (drops plugin typing) | `plitejs` typecheck |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Package behavior | yes | `platejs`/`plitejs` suites | 141/141 and 21/21 tasks |
| Types | yes | package typechecks, contracts, `www` typecheck | `plitejs` 13/13, `platejs` 90/90 and contracts, full `www` chain |
| Browser | yes | Chromium clipboard spec; toast proof in normal mode | 4/4; toast proof 10/10 |
| Registry | yes | build, changelog `--check` | fresh output; check passes |
| Doctrine | yes | v246, mirrors, `validate` | valid |
| Ledger | yes | execution record, render, check | `2026-09-28-paste-loss-reporting-repairs` |

Verification evidence:

- Real-browser toast proof, normal-mode dev server, trusted native and
  synthetic paste (10/10): unmapped video alone shows "This content could not be
  pasted here."; video fallback, SVG text and object fallback each show one
  "Some pasted content was left out." toast and keep their surviving text;
  Google Docs–style HTML shows none.
- `plitejs` React partition: 88 files, 1315 tests pass, including
  `authored-fragment-provider.test.tsx`.
- After the last `lint:fix`, every gate passes with no exception: `pnpm brl`;
  registry build; `plitejs` typecheck 13/13 and tests 21/21 tasks; `platejs`
  typecheck 90/90, compiled contracts, tests 141/141 tasks; `www` typecheck with
  `api-reference`, registry `--check`, docs parity and registry source checks;
  `pnpm entrypoint:turbo:check`; registry changelog `--check`; Plate Next v246
  `validate`; Chromium clipboard spec 4/4; `git diff --check`.

Final handoff:

- Outcome: the three loss-reporting defects are repaired at their sources and
  proven in package tests and a real browser; the `plitejs` typecheck is green.
- Limits: browser proof is Chromium only, and the toast proof ran against a
  normal-mode server because the Playwright lane mounts no Toaster.
- Local, uncommitted.

Timeline:

- 2026-09-28 Plan created and closed.

Open risks:

- Pasting web content with SVG icons now warns, because those icons are dropped.

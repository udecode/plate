---
review_scopes:
  - imports
  - exports
review_basis:
  - 2026-09-27-imports-adversarial-audit-feedback
  - 2026-09-27-exports-adversarial-audit-feedback
work_kind: implementation
---

# Document conversion open findings

Status: Completed

Objective:
Work the open findings left by
[the closure repairs](2026-09-27-document-conversion-closure-repairs.md) that
have a clear engineering owner, and return the product and architecture choices
to the user in one decision set.

Goal plan:
docs/plans/2026-09-28-document-conversion-open-findings.md

Template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- The user's `go` after the closure-repairs handoff. Native goal tools are
  unavailable in this Claude Code runtime; this plan is the acceptance ledger.

Completion threshold:
- The DOCX import lifetime risk is proven or repaired; clipboard HTML paste is
  proven in a real browser; every defect that proof exposes is repaired at its
  owner with a guarding test; package, type, generation, doctrine and ledger
  gates pass; remaining decisions are listed for the user.

Verification surface:
- Scratch concurrency probe for DOCX import; `pnpm --filter www
  test:www-browser:chromium tests/browser/clipboard.spec.ts`; package suites
  and typechecks for `platejs` and `plitejs`; `www` typecheck; Plate Next
  `validate`; review-ledger `render`/`check`; `git diff --check`.

Constraints:
- Local checkout on `next`; no commit, push, PR or release authority.

Boundaries:
- Allowed: HTML decoder, Plite plain-text transfer fallback, browser clipboard
  spec, decision page, plan and ledger.
- Returned to the user: whether the DataTransfer report earns an application
  consumer or is cut; Yjs incoming fitting (collaboration law); Markdown
  streaming cost (Benchmark); Firefox/WebKit paste proof (the `www` Playwright
  config runs Chromium only).

Blocked condition:
- None.

Task state:
- current_phase: closed
- next: none; the listed decisions return to the user

Work Checklist:
- [x] DOCX import lifetime: the HTML element decoder captures every mapping context before the compilation scope clears plugin stores; decode reads only captured contexts and a detached schema. A scratch probe ran two concurrent imports with different plugin sets and interleaved awaits; each kept its own target, types and diagnostics. The constraint is now documented at the capture site.
- [x] Real-browser paste proof added to `apps/www/tests/browser/clipboard.spec.ts` (native trusted paste and synthetic event). It first failed: pasting HTML over a selection that starts in a heading inserted nothing.
- [x] Defect A: HTML `<p>text <img> text</p>` decoded to a paragraph containing a block image. `parseHtmlSlice` returned it as `ok`, insertion over a paragraph silently dropped the image, and `parseHtml` failed document fitting. The HTML decoder now lifts disallowed block children into siblings. Guard: `HtmlPlugin.spec.ts` "lifts block images out of HTML text blocks without dropping them" (fails without the fix).
- [x] Defect B: when a richer format failed, the Plite plain-text fallback built new lines with the anchor block's type; a heading without `level` threw and the paste did nothing. New lines now use the root default block when the anchor block needs construction properties. Guard: `data-transfer-format.test.ts` "plain-text fallback starts new lines with the default block when the anchor block needs properties" (fails without the fix).
- [x] `import-fidelity.md` records both laws.
- [x] Review repair (user-supplied P2 review of the standalone value-type record): `DocxImportOptions<true>` now requires `retainSource: true`, so a typed retained import can no longer omit it and dereference an absent `source`; the prior record's "conditional typing intact" claim was false.
- [x] Review repair: `packages/platejs/type-tests/standalone-conversion-contracts.ts` proves by exact type equality that editor methods return `ValueOf<typeof editor>` documents and slices, every standalone function (including server `parseHtmlSlice`) returns exactly `Value`, and omitted `retainSource` is rejected. A planted false equality was reported, so the helper is not vacuous.
- [x] Review repair: the uncompiled exact-value assertion in `MarkdownPlugin.spec.ts` (using a deleted type) is removed; its job moved to the compiled contract. A sweep found no other spec using removed or reshaped conversion types. The kit-scale `www` contract now also covers server `parseHtmlSlice`.
- [x] Final gates pass after the last `lint:fix`.
- [x] Execution record recorded; decision pages reconciled; ledger `render`/`check` pass.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| DOCX lifetime | `compileHtmlElementDecoder` | Keep the capture; document the constraint | Async compilation scope (no observed failure to justify it) | concurrency probe |
| Block inside text block | HTML decoder `liftDisallowedBlocks` | Split the text block around the block child | Restore decode-time fitting (it also nested the image); stronger slice admission alone (turns web pastes into failures) | HTML spec, browser spec |
| Plain-text fallback | Plite `createPlainTextFallbackBlocks` | Default block when the anchor type needs properties | Copy anchor properties (duplicates identity) | Plite spec, browser spec |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Package behavior | yes | `platejs`/`plitejs` suites | 141/141 and 21/21 tasks |
| Types | yes | package typechecks, contracts, `www` typecheck | 90/90, 13/13, contracts, full `www` chain |
| Browser | yes | Chromium clipboard spec | 4/4 passed (native and event) |
| Doctrine | no | No reusable public API taste changed | N/A |
| Ledger | yes | execution record, render, check | `2026-09-28-document-conversion-open-findings` |

Verification evidence:

- Scratch DOCX concurrency probe: 1 pass (two interleaved imports kept their
  own targets and diagnostics).
- Chromium clipboard spec: 4/4 passed (native trusted paste and synthetic
  event), served from current source by the dev server Playwright started.
- `plitejs` typecheck 13/13 and tests 21/21 tasks; `platejs` typecheck 90/90,
  contracts, tests 141/141 tasks; `www` typecheck with fresh registry, docs
  parity and registry source checks; Plate Next v245 valid; `lint:fix` and
  `git diff --check` clean after the last edit.
- Both new guards fail without their fix; the equality helper rejects a
  planted false equality.

Findings and remaining work:

- The insertion fitter accepted a schema-invalid closed slice and dropped
  content while reporting success, and slice admission does not check the
  content grammar of closed elements. The HTML producer no longer emits that
  shape, but both Plite laws remain unenforced for other producers.
- Pasting over a range that spans two blocks through the plain-text fallback
  leaves an empty trailing paragraph.
- Decisions for the user: DataTransfer report consumer or cut; Yjs incoming
  fitting; Markdown streaming cost; Firefox/WebKit paste proof.

Final handoff:

- Outcome: the DOCX lifetime concern is a documented, proven snapshot; two
  paste defects exposed by real-browser proof are repaired at their owners;
  the review's retained-source unsoundness and proof gaps are repaired.
- Limits: browser proof is Chromium only; Plite slice admission and insertion
  content conservation remain unenforced for other producers.
- Local, uncommitted.
- Next: the user decisions listed under findings.

Timeline:

- 2026-09-28 Plan created.

Open risks:

- Lifting splits a text block around each block child; its properties are
  copied to every resulting run.

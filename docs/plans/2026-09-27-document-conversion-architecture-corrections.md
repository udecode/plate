---
review_scopes: [imports, exports]
review_basis:
  - 2026-09-27-imports-adversarial-audit-feedback
  - 2026-09-27-exports-adversarial-audit-feedback
work_kind: implementation
---

# Document Conversion Architecture Corrections

Status: Completed.

Objective:
Deliver the corrected document-conversion architecture and verified caller
adoption described below without weakening diagnostics, fidelity or typing.

Completion threshold:
All acceptance rows are resolved in source, public exports, callers, docs,
release metadata and focused package/browser proof, followed by ledger closure.

Verification surface:
Plite DOM and persistence tests/types; Plate HTML, Markdown, AI and DOCX tests;
registry generation; playground, Markdown streaming and DOCX demo interactions.

Constraints:
Hard-cut on `next`; preserve exact native DOCX round-trip as an explicit job,
captured transfer data, open slices, strict schema admission and encoded types.

Boundaries:
Local source, tests, docs and generated registry output only; no publication,
release, Yjs redesign, PDF/image work or unrelated conversion cleanup.

Blocked condition:
Only a missing dependency/tool that prevents both direct verification and a
truthful bounded handoff; no design decision is currently delegated to the user.

Work Checklist:
The source-linked acceptance checklist below is the authoritative work ledger.

## Objective

Close the conversion gaps reopened by the adversarial audit. Unify HTML safety
and model admission, preserve exact slice and observable-loss laws, bind AI
acceptance to finalized output, make DOCX import/export lifecycle truthful,
adopt returned comments and warnings, flatten value persistence without losing
encoded-output inference, and delete only public machinery whose current job is
preserved by an existing owner.

Task source: the user's “ok go” after
[the corrected audit feedback](artifacts/2026-09-27-document-conversion-audit-feedback/feedback.md).

Template: major-task with package-api and browser packs.

Completion threshold: affected source, exported types, callers, copied registry
UI, docs and tests use the target contracts; the three audit repros and focused
package/browser cases pass; generated exports and registry output are current;
release artifacts and review-ledger execution closure are recorded; final
affected lint/type/test gates pass.

## Boundaries

- Allowed: Plite DOM transfer and value-persistence owners; Plate HTML,
  Markdown, AI and DOCX owners; affected registry import UI; exact docs,
  exports, tests, doctrine and generated output required by those changes.
- Retain: format-owned `parse`/`serialize`, DOCX `importDocx`/`exportDocx`,
  canonical schema authority, exact native DOCX round-trip as a distinct job,
  immutable transfer capture, exact open slice boundaries, diagnostic
  information and typed encoded output.
- Reject: nullable-only transfer decoding, another universal conversion result,
  duplicate HTML projection assertion, blanket DOCX native-envelope deletion,
  compatibility aliases, a second persistence wrapper and caller-built editing
  runtimes for detached conversion.
- Defer: Yjs incoming fitting to its collaboration owner; broad PDF/image or
  other format work; external publication and release.
- Delivery is local only. No commit, push, PR, release or deployment is
  authorized.
- Block only on a missing runtime/tool dependency that prevents both direct
  proof and a truthful bounded result. No product choice remains open.

## Hard laws and acceptance

- [x] Clipboard and direct HTML parsing share one parse5 safety/admission path;
      unsafe attributes retain safe descendant text and report recovery.
- [x] Clipboard keeps native exact-slice handling, Word-specific preprocessing,
      Apple converted-space semantics and immutable captured input.
- [x] Transfer mismatch, diagnosed failure, lossy success and accepted commit
      remain distinguishable; Plate can consume the final transfer report.
- [x] Markdown document parsing may fit; slice/inline parsing never routes
      through whole-document fitting or silently discards later blocks.
- [x] AI preview state identifies the source revision/output it represents;
      failed or incomplete final parsing cannot accept a prior preview.
- [x] DOCX import compiles detached schema/format facts without activating an
      editing runtime, reports fitting and mapping recovery under one loss
      policy, and cancellation always rejects asynchronously with the signal
      reason.
- [x] DOCX export checks cancellation after asynchronous comment/render/package
      stages. Native attachment policy is explicit; trusted restoration and
      correspondence remain while the exact round-trip job exists.
- [x] The copied import UI installs returned DOCX comments and shows success
      warnings for HTML, Markdown and DOCX rather than claiming discarded work.
- [x] `EditorValuePersistence<TValue, TEncoded>` directly owns `encode`,
      `decode`, explicit positive `version` and optional `legacyDecoders`;
      strict JSON admission, owned-input handling and encoded inference survive.
- [x] Redundant codec wrappers/helpers, dead diagnostics and public DOM parsing
      helpers are cut only after complete caller/export/docs migration.
- [x] Markdown API generics infer through installed APIs and format mappings;
      `defineFormats` remains unless a smaller compiled replacement proves the
      same contextual and foreign-target inference.
- [x] Package changesets, registry changelog, barrels, docs and durable API
      doctrine reflect the final public break. Templates remain generated-only.
- [x] Final affected `lint:fix` runs after all source and generated changes.

## Decision ledger

| Surface | Current | Target owner and shape | Adoption and proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- |
| HTML ingress | Clipboard uses `DOMParser`; direct parsing uses parse5 AST safety | Plate HTML compiler parses captured HTML once through parse5, applies inert AST safety, then materializes only operation-owned DOM when legacy mapping needs it | Transfer/direct differential tests and browser paste | Whitespace, Word and open-slice behavior | rearchitect |
| DOM parser utility | Public `parseDOMClipboardHtml` owns an identity Trusted Types policy | Remove after Plate/code-block/example consumers use the HTML owner or a private inert materializer | Public export sweep and browser CSP/clipboard proof | Hidden raw Plite consumers | cut |
| Transfer diagnostics | Rich result and final atomic report exist in Plite; Plate hardcodes `dom()` | Keep diagnosed per-format results and one final report; configure the exact Plate DOM descriptor with a report sink rather than adding a conversion-wide API | Plite transfer tests plus one Plate/app consumer | Reentrancy and reporting failed attempts after fallback | rearchitect |
| Markdown fragments | Slice fits a document; inline takes the first parsed block | Decode fragment carriers directly, assert fragment placement, and return diagnosed failure for multi-block inline input rather than truncate | Markdown tests and AI streaming cases | Incomplete-stream recovery | rearchitect |
| AI preview | Streaming parse failure retains prior preview and accept reads it | Preview stores current parsed output identity/status; final flush is strict and invalidates acceptance on failure | Unit plus browser AI preview/accept interaction | Partial stream UX | rearchitect |
| DOCX detached import | `compileDocxImportTarget` constructs a full editor | Reuse Plate detached compilation/schema owner without plugin activation; capture DOM/crypto capabilities lazily by actual job | Import tests including activation sentinel | Mammoth/DOM adapters currently expect editor APIs | rearchitect |
| DOCX native state | Ordinary rebuilt review packages receive an authored envelope | Keep exact trusted single-file round-trip, but make native attachment an explicit export policy; ordinary visible review does not silently add full editor state | Native round-trip and package-part tests | Breaking fidelity/privacy choice | rearchitect |
| DOCX lifecycle | Entry-only abort checks; import requires crypto even without native hashing | Promise-only cancellation with checks around awaits; require crypto only for correspondence work | Abort-before/during/after tests | Non-abortable third-party work | rearchitect |
| Import UI | Returned comments and successful warnings are ignored/misreported | Registry prepares a complete replacement editor through the existing Comments owner, lets the application swap editor ownership, and displays every format warning | Registry/browser import interaction | Comment identity/range ownership | rearchitect |
| Value persistence | Public codec pair nested inside a versioned persistence wrapper | One generic `EditorValuePersistence<TValue, TEncoded>` declaration; ordinary inferred reusable pairs may be spread into it | Compile-time laws, persistence/Yjs tests, docs sweep | Serialized compatibility and inference regression | cut |
| Format inference | Markdown API erases a generic; `defineFormats` owns contextual target binding | Repair generic propagation; retain `defineFormats` until equivalent inference is proved | Type tests and packed consumer | Accidental public widening | rearchitect / keep |

No row adds a repeated runtime layer, cache, store or fan-out. The plan removes
duplicate parsing/runtime construction; no performance architecture choice or
performance claim is made, so the performance pack is not applicable. Existing
operation limits remain mandatory.

## Execution slices

1. **HTML and transfer admission.** Replace the competing DOM parsing route,
   retain native/Word slice policy, expose final Plate report consumption, cut
   obsolete raw parser exports, and lock differential tests.
2. **Markdown fragments and AI finalization.** Remove document fitting from
   fragments, refuse silent inline truncation, make streaming and finalized
   parse states explicit, and bind acceptance to the finalized source.
3. **DOCX lifecycle and application adoption.** Compile detached facts without
   activation; repair loss/cancellation/capability capture; settle explicit
   native attachment; install comments and warnings in copied UI.
4. **Typed persistence and inference subtraction.** Flatten declarations,
   migrate serialized field/effect/Yjs/authored consumers, preserve
   `TEncoded`, repair Markdown generic propagation, and remove dead exports.
5. **Teaching, release and generated surfaces.** Update current docs, minimal
   Vision/Best API doctrine and Plate Next version when reusable public taste
   changed; add package changesets and registry changelog; run barrels and
   registry generation.
6. **Closure proof.** Run focused tests after each slice, then affected package
   source typechecks/tests, exact browser import/paste/AI paths, final lint,
   ledger execution recording and decision reconciliation.

## Failure cases and blast radius

1. Consolidation preserves safe text but changes Word list/table preprocessing
   or open slice edges. Proof must compare native fragment, Word HTML, ordinary
   HTML and text fallback through the final insertion path.
2. Final AI invalidation can erase a useful streaming preview or accept output
   from a different request. State identity and finish ordering must be tested,
   including aborted/replaced streams.
3. DOCX changes can lose exact native state, comments or source reuse, or throw
   cancellation synchronously. Existing native correspondence fixtures remain
   the rollback oracle; there is no compatibility bridge.
4. Persistence flattening can preserve runtime values while widening encoded
   types or changing serialized bytes. Compile-time output assertions and byte
   fixtures must pass before old nouns are removed.

## Package, release and browser plan

- Published boundaries: `plitejs`, `plitejs/dom`, `platejs`, `platejs/markdown`,
  `platejs/ai/react`, `platejs/docx/import`, and `platejs/docx/export` as affected.
- Compatibility: hard cut on `next`; no aliases or dual signatures.
- Release artifacts: load Changeset during slice 5 for published package
  behavior/types. Add registry changelog for copied import UI. No template edits.
- Barrels: run `pnpm brl` if exports/files change.
- Package proof: focused Bun tests plus source-first Plite/Plate/Markdown/AI/DOCX
  typechecks/tests selected through Verify Plate.
- Browser routes: `/blocks/playground` for paste; `/blocks/markdown-streaming-demo`
  for streaming behavior when it exposes acceptance; `/blocks/docx-demo` for
  import/comments/warnings. Use repository browser runners for model/DOM state;
  exact native clipboard/file picker/download uses Chrome automation. Check
  console errors. No paint claim, so pixel controls are N/A.
- This is an uncommitted local candidate. Pushed-ref/clean-checkout certification
  and release proof are N/A; preserve exact source/test/harness fingerprints in
  the execution record instead.

## Verification evidence

- Baseline audit probe:
  `bun test ./docs/plans/artifacts/2026-09-27-document-conversion-audit-feedback/probe.test.ts`
  — 3 pass, 0 fail, reproducing two HTML path discrepancies and silent inline
  Markdown truncation.
- Governing analysis and exact proof limits:
  [feedback.md](artifacts/2026-09-27-document-conversion-audit-feedback/feedback.md).
- Plite source typecheck passed 13/13 partitions. Focused core, DOM and Yjs
  suites passed; Yjs reported 274 pass, 0 fail.
- Plate source typecheck passed 90/90 partitions. Focused HTML (12/12),
  Markdown (214/214), AI React (85/85), Comments (57/57), DOCX import
  (21/21) and DOCX export (107/107) suites passed.
- Chromium browser proof passed clipboard 2/2, AI 18/18 and DOCX 3/3. The
  DOCX matrix covers invalid-file atomicity, imported byte equality and the
  accepted/proposed/tracked-changes export projections.
- The import/export toolbar integration regressions passed 3/3: failed DOCX
  comment preparation leaves the mounted editor untouched; successful import
  returns a fully prepared replacement without mutating the mounted document,
  history or Comments state; and export reads comment targets in canonical
  proposed coordinates even when the mounted view is accepted.
- `pnpm lint:fix`, `pnpm brl`, Plate build, www typecheck, API-reference
  generation, registry generation/check, docs/source parity, Plate Next v243
  validation and `git diff --check` passed. Registry generation fingerprint:
  `4f742c30b40fecf6e89effd7d5c13bd0d9c2c777288174e31165d511f47c9eb2`.
- Final review repaired three escape paths before closure: DOCX import prepares
  a complete candidate and swaps editor ownership instead of attempting a
  lossy live rollback; DOCX export resolves attachment ranges from the
  canonical proposed model before projection; and comment replacement emits
  attachment notifications only after atomic snapshot replacement succeeds.
- The final adversarial rerun found no P1/P2 issue after rejected detached DOCX
  candidates were also made to dispose their unadopted retained source.

## Open risks

- Mammoth and existing HTML mapping helpers consume browser DOM. The new owner
  may still materialize inert DOM privately after parse5 safety; it must not
  reparse source or create a second safety authority.
- The exact Comments API for importing external threads must preserve author,
  range and server ownership. Reuse its existing creation/import operation;
  do not write plugin stores directly.
- Native DOCX attachment is intentionally a public policy decision. The target
  keeps exact round-trip available explicitly while removing hidden attachment
  from ordinary review export.

## Closure

All six execution slices and every acceptance row are complete. The imports and
exports ledger scopes are reconciled by the corresponding verified execution
record. Delivery remains local and uncommitted as required by the boundary.

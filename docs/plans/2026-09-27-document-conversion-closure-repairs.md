---
review_scopes:
  - imports
  - exports
review_basis:
  - 2026-09-27-imports-adversarial-audit-feedback
  - 2026-09-27-exports-adversarial-audit-feedback
work_kind: implementation
---

# Document conversion closure repairs

Status: Completed

Objective:
Close the gaps that remained after
[the corrections plan](2026-09-27-document-conversion-architecture-corrections.md)
was marked complete: restore a green package suite, make the DOCX loss-policy
row true, correct false teaching, delete dead conversion residue, satisfy the
vendored converter's license, and record a correcting execution outcome.

Goal plan:
docs/plans/2026-09-27-document-conversion-closure-repairs.md

Template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- The user's `go` after the harsh verification of the corrections closure in
  this session. The accepted invocation named every row below.
- Native goal tools are unavailable in this Claude Code runtime; this plan is
  the durable acceptance ledger.

Completion threshold:
- Every acceptance row below is resolved in source, docs, generated output and
  doctrine, the full `platejs` and `plitejs` suites and affected typechecks pass,
  and a correcting execution record reconciles the imports/exports decisions.

Verification surface:
- `pnpm --filter platejs test`, `pnpm --filter plitejs test`,
  `pnpm --filter platejs typecheck`, `typecheck:contracts`,
  `pnpm --filter www typecheck`, `build:registry --check`,
  `api-reference:check`, `entrypoint:turbo:check`, Plate Next `validate`,
  review-ledger `render`/`check`, `git diff --check`, plus direct source probes.

Constraints:
- Local checkout on `next`; no commit, push, PR or release authority. Hard cuts
  are allowed without aliases. Copyright conditions must be satisfied.

Boundaries:
- Allowed: HTML, DOCX, Markdown/plain-text mapping owners, plugin resolution,
  root exports, docs, decision pages, doctrine source, generated registry and
  API reference, changesets, package metadata.
- Deferred with reason: the DataTransfer report still has no application
  consumer (retained by the adversarial review; product consumer is a separate
  job); Yjs incoming fitting (collaboration owner); Markdown streaming cost
  (Benchmark owner); DOCX import target lifetime escaping its compilation scope
  (plausible risk, no observed failure).

Blocked condition:
- None.

Task state:
- current_phase: closed
- next: none; open findings route to their owners

Work Checklist:
- [x] Every applicable obligation from the accepted invocation maps to a row below; exclusions have reasons.
- [x] Paste mapping-fallback contract: transfer negotiation isolates each HTML mapping candidate on the shared parse5 path; direct parsing throws. Source: `HtmlPlugin.ts` `decodeMaterializedHtmlWithEditor(..., isolateMappingErrors)`.
- [x] DOCX mapping loss obeys `lossPolicy` (`unsupported-content`), and published documents report schema fitting as `schema-repair`; revision-projection text runs merge before fitting.
- [x] Persist docs use `{ ...valueCodecs.string, version: 1 }` (4 pages).
- [x] Markdown/plain-text `kind` discriminator removed; `formats` accept only `html`, `markdown`, `plainText`; foreign targets bind every format; `markdown.mdx`/`.cn.mdx` example verified to parse and round-trip.
- [x] Server-side example uses `serializeMarkdown(document, { plugins: BaseEditorKit })` (byte-identical output proven). This first failed TS2589: every standalone format function derived an exact `EditorValueFromPlugins<TPlugins>` over the runtime tuple.
- [x] Best API design (user `go`): standalone format functions drop the plugin-tuple generic and type documents as broad `Value`, like `createEditor({ plugins })` (`rawValueStaysBroad`); exact documents come from generated editor types or correlated editor methods. Applied to `parseHtml`, `parseHtmlSlice`, `serializeHtml`, `platejs/html/server`, `parseMarkdown*`, `serializeMarkdown` and `importDocx` (`DocxImportOptions<TRetainSource>`, `DocxImportResult<TRetainSource>`); internal `*FromPlugins` helpers deleted.
- [x] A `www` package-integration type contract proves every standalone function with the real `BaseEditorKit` and adoption into an editor built from it; the DOCX type contract asserts the detached document matches `ValueOf<typeof editor>`.
- [x] Best API rule, Plate Vision and the conversion changeset teach the law; mirrors regenerated; Plate Next v245 recorded.
- [x] `import-fidelity.md` corrected: persistence ownership, materialization document, parse5 graph law, clipboard isolation, DOCX loss reporting.
- [x] Dead residue removed: `parsePlateAuthoredDocument`, `decodeHtmlElement`, HTML `query`/`transformData`/`transformFragment` hooks, `parseMarkdownBlocks` and `marked`, root HTML DOM helpers, and `platejs/static` `getEditorDOMFromHtmlString` (a live-document `innerHTML` sink whose only caller was the stale CI template; the earlier verification wrongly reported it as already removed).
- [x] `THIRD_PARTY_NOTICES.md` ships the html-to-docx MIT notice (verified in `npm pack --dry-run`).
- [x] Plugin-creator doctrine repaired, mirrors regenerated, Plate Next v244 recorded.
- [x] Changesets, API reference manifest, registry output and lockfile updated.
- [x] Final gates pass after the last `lint:fix`.
- [x] Correcting execution record recorded; decision pages reconciled; ledger `render`/`check` pass.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Paste mapping failure | `HtmlPlugin.ts` transfer decode | Thread an isolation flag through the one shared decode path | Second paste decoder; making direct parse lenient | 3 core failures fixed; HTML suite green |
| DOCX recovery | `importDocx.ts`, `HtmlPlugin.ts` decoder | Decoder reports losses; import maps them and fit repairs under `applyLossPolicy` | Keep throwing on loss; report projection `merge-text` artifacts | new DOCX loss-policy test; DOCX suite green |
| Mapping discriminator | `collectPlateNodeMappings.ts`, mapping types | Dispatch by format key; unknown keys throw | Throw when `kind` is missing (keeps a redundant field) | Markdown/lib/internal suites green |
| Root DOM helpers | `core.tsx` | Privatize; internal owners import `htmlDom` directly | Keep public with zero consumers | typecheck; changeset |
| License | package root | Package-level notice listed in `files` | Source-only header (not distributed) | `npm pack --dry-run` |
| Detached value type | HTML/Markdown/DOCX public signatures | Broad `Value`, no plugin-tuple generic | Cheaper exact derivation over the tuple (contradicts Plate's runtime-tuple law); caller-supplied value generic (an unchecked assertion); casts at call sites | kit-scale `www` contract; contracts; package typecheck |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Package behavior | yes | full `platejs`/`plitejs` suites | 141/141 and 21/21 tasks |
| Types | yes | `platejs` typecheck + contracts, `www` typecheck | 90/90, contracts, full `www` chain |
| Generated output | yes | registry check, API reference check, entrypoint turbo check | fresh / pass / current |
| Doctrine | yes | Plate Next `validate` | v245 valid |
| Ledger | yes | execution record, render, check | `2026-09-27-document-conversion-closure-repairs` |
| Browser | no | No browser interaction changed beyond package-tested paste negotiation; the corrections plan's browser receipts are not re-claimed | N/A |

Verification evidence:

- [Gate receipt](artifacts/2026-09-27-document-conversion-closure-repairs/gates.json)
  records every command, result and the failures it resolved.
- The core partition failed 525/3 before the transfer isolation repair; the
  HTML suite then passed 90/90 and the final package suite 141/141 tasks.
- DOCX `lossPolicy` is covered by `importDocx.spec.ts` ("applies the loss
  policy to reported mapping loss"). Repair reporting was observed end to end
  when the authored revision fixture emitted `merge-text` repairs before
  projection coalescing was added; no fixture currently produces a lossy DOCX
  fit repair.
- Before the value-type repair, `parseHtml`, `parseMarkdown` and
  `serializeMarkdown` failed TS2589 with `BaseEditorKit`; afterwards all ten
  standalone calls typecheck with it, the server example adopts
  `serializeMarkdown`, and the final chain passed (receipt
  `standaloneValueTypeRepair`).

Findings and remaining work:

- The DataTransfer report still has no application consumer.
- DOCX import target closures outlive `withPlateFormatCompilation`.
- Yjs incoming fitting and Markdown streaming cost stay with their owners.

Final handoff:

- Outcome and owning fix: every accepted row is repaired at its owner,
  including the server example after the standalone value-type repair.
- Proof and limits: package, type, generation and doctrine gates pass; paste
  parity is package-test-DOM proof, not a browser run; no browser or native
  artifact claim is added.
- Local / integrated / published state: local and uncommitted on top of
  `0c7baaeddd`, which the user committed during this run.
- Next action or completion: completed; route the open findings.

Timeline:

- 2026-09-27T20:41:13.724Z Plan created.
- 2026-09-28 Standalone value-type repair completed the blocked server-example row.

Open risks:

- DOCX import target closures (`decodeHtml`, `fitReportedDocument`) run after
  `withPlateFormatCompilation` returns; they work in tests but rely on compiled
  state outliving that scope.
- Removing root HTML DOM helpers is a breaking change for applications that
  imported them from `platejs`.

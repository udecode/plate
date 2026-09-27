---
review_scopes:
  - exports
review_basis:
  - 2026-09-24-exports-final-reassessment
work_kind: implementation
---

# Document-first export contracts

Status: Complete

Objective:
Implement the document-first export architecture without regressions.
Completion means the public APIs, Plite/Plate ownership, hard cuts, migrations,
performance contract, package effects, proof and doctrine repair are adopted
and verified on their real package, registry, browser and artifact surfaces.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-09-24-document-first-export-contracts.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- performance-observability (docs/plans/templates/packs/performance-observability.md)

Mode:

- deep: public Plite and Plate contracts break, conversion ownership moves, and
  rendering cost scales with document size and comment/document fan-out.

Completion threshold:

- Binary readiness is satisfied when every public break has one replacement,
  each responsibility has one owner, lifecycle and fidelity laws are explicit,
  the scale-sensitive rendering target has a passing executable falsification
  receipt, implementation slices have exact exits, and the plan validator
  passes.

Verification surface:

- Current Plite authored projection, canonical document and host-codec owners.
- Plate semantic HTML, Markdown, static React rendering and DOCX export owners.
- AI, server, copied export UI, docs, type-contract and generated registry
  callers.
- The disposable matched probe and receipt in
  docs/plans/artifacts/2026-09-24-document-first-export-contracts/.
- Review-ledger validation, plan validation, focused source checks, formatting
  and diff validation.

Constraints:

- Preserve one pre-async document/configuration capture, exact accepted and
  proposed meaning, explicit review conflicts, schema identity, root
  relationships, comments and retained DOCX source authority.
- Do not add ExportPlugin, TextPlugin, a generic export(format) dispatcher, a
  public conversion context, a universal export AST or an all-format Plite
  package.
- Do not change NodeApi.string; it retains separator-free model-offset
  semantics.
- Do not merge clipboard lifecycle, cut behavior or host negotiation into file
  export.
- Do not select a PDF backend or rewrite DOCX directly in this adoption.
- No compatibility aliases or runtime shims on next.
- Execution, proof, teaching, release metadata and review-ledger reconciliation
  complete in this checkout.

Boundaries:

- In scope: document-first authored projection; shared projection diagnostics;
  semantic HTML; Markdown; structural plain text; styled static HTML; JSON
  persistence; current DOCX hybrid adoption; clipboard encoder sharing; copied
  export UI; AI/server callers; docs, changesets, registry and doctrine.
- Source owners: packages/plitejs/src/authored,
  packages/plitejs/src/dom/plugin/host-codec.ts,
  packages/platejs/src/lib/plugins/html, packages/platejs/src/markdown,
  packages/platejs/src/static, packages/platejs/src/docx, feature codec
  declarations and the copied export toolbar.
- Non-goals: browser print, screenshot export, CSV/RTF export, a new PDF
  engine, arbitrary Word round-trip fidelity and a direct OOXML rewrite.
- Linked plans: N/A; execution stays in this plan so decision, adoption and
  proof cannot drift across artifacts.

Output budget strategy:

- Read current owners and bounded callers, reuse the fixed external corpus, and
  keep large benchmark samples in the JSON receipt rather than duplicating
  them in this plan.

Blocked condition:

- Execution blocks only if the private projected render view cannot preserve
  custom component behavior without activation, or if a format cannot
  distinguish deliberate filtering from unsupported loss. The design probe
  found neither blocker for paragraph Markdown/static HTML; execution extends
  that proof to feature-rich documents and DOCX.

Plate Plan state:

- phase: complete
- next: none
- handoff: complete

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | The request covers all exports, first-principles API promotion, external-editor comparison and a final hostile audit. |
| Task plan and execution authority verified | yes | The standing Task authorization covered implementation, repair and proof in this checkout. |
| Current owners read | yes | Authored format/checkpoint, host codecs, HTML compiler, Markdown runtime, static renderer, DOCX export, copied menu and compiler paths were inspected. |
| Best API target resolved | yes | Per-format APIs and one private compiler/render mechanism replace caller-created serializer editors; universal export abstractions are rejected. |
| Runtime scale applicability resolved | yes | Repeated units are documents and DOCX comment bodies; variables are blocks, documents/comments and output bytes. |
| Pre-acceptance Benchmark probe selected | yes | The checked-in probe compares one editor per document with one configured runtime plus detached conversion/projected views. |
| Mode and execution boundary resolved | yes | Deep planning and all ten execution slices are complete. |
| Package/API pack selected | yes | plitejs, plitejs/authored, platejs, platejs/markdown, platejs/static and platejs/docx/export change. |
| Public surface or package boundary identified | yes | Exact additions, renames and deletions are listed under Target public API and Hard cuts. |
| Release artifact path selected | yes | Execution requires patch changesets for plitejs and platejs, plus a registry changelog entry. |
| Changeset skill loaded when required | yes | Patch changesets cover Plite authored projection and Plate export contracts. |
| Barrel/export impact decision recorded | yes | Exported files and subpath barrels change; execution runs pnpm brl. |
| Performance pack selected | yes | Full editor construction currently multiplies by export document/comment count. |
| User-facing operation and runtime owner identified | yes | Markdown/static conversion and DOCX body/comment rendering are owned by their format packages; delivery remains app-owned. |
| Scale variables and cohorts fixed | yes | 5×20, 25×20, 25×100 and 100×20 document/block cohorts are frozen in the probe. |
| Budget frozen before target measurement | yes | Exact output, deterministic counts and p95 ≤ baseline×1.1+1 ms were encoded before the passing run. |
| Baseline and target probe selected | yes | Baseline creates a configured editor per document; target reuses one runtime and read-only projected views. |
| Correctness guard selected | yes | SHA-256 equality over every Markdown and static HTML output. |
| Production detector decision recorded | N/A | Local conversion has no long-lived detector; deterministic tests and receipts own regression detection without user data. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints and owners are concrete.
- [x] Current API, docs, tests and export claims cite live source.
- [x] Reusable public call shapes have one Best API verdict.
- [x] The scale-sensitive rendering target has a passing executable receipt.
- [x] Every concept decision records owner, adoption, proof, risk and verdict.
- [x] Canonical document state and styled presentation are classified.
- [x] Public breaks and private mechanisms have complete adoption/deletion answers.
- [x] Execution slices and the focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved.
- [x] Package API, export and release-artifact effects are recorded.
- [x] Published packages require patch changesets; registry UI requires its own changelog.
- [x] Package typecheck, tests, barrels, docs, registry and browser proof are assigned.
- [x] Runtime cohorts, budgets, counters, timing and correctness guards are frozen.
- [x] DOCX full-operation timing, process RSS, ZIP and LibreOffice reopen proof pass; Microsoft Word native proof remains an explicit limit.
- [x] Review-ledger design closure and plan validation are included.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every design decision and dependency | Target API, decision ledger, slices and proof matrix are complete. |
| Fresh source evidence | yes | Recheck decision-changing owners and callers | Source sweep was refreshed on 2026-09-24 after the model switch. |
| Best API review | pass | Resolve P0/P1 call-shape findings | Hard cuts and exact replacements are fixed below. |
| Pre-acceptance scale proof | pass | Compare matched baseline and prototype | Probe receipt passes all four cohorts with exact output. |
| Production scale rerun contract | pass | Rerun final source and add complete DOCX measurement | Both final-source receipts pass; DOCX covers 0/10/100 comments, source reuse, projections and LibreOffice reopen. |
| Conditional risk and adoption | pass | Cover roots, metadata, custom codecs, review, comments and source | Focused, package, browser and artifact proof cover the assigned cases. |
| Verification recorded | pass | Record fresh execution proof | Verification evidence lists passing commands and receipts. |
| Handoff prepared | pass | State ownership, breaks, order, proof and risks | Final handoff is complete. |
| P1 autoreview | N/A | Skip helper review on next | Project rules prohibit Autoreview on next; Best API review supplied the technical gate. |
| Goal plan complete | pass | Run check-complete.mjs | Recorded in Verification evidence. |
| Public API / package boundary proof | pass | Audit public exports and manifests | Package manifests, barrels and caller sweep are represented. |
| Runtime scale contract | pass | Close the embedded architecture probe | Receipt records fingerprints, cohorts, timing and counts. |
| Release artifact classification | yes | Classify planned implementation | Published plitejs/platejs API change plus registry UI change. |
| Published package changeset | pass | Add patch entries without forbidden minor bumps | `document-first-authored-projections.md` and `document-first-export-contracts.md` cover the package surfaces. |
| Registry changelog | pass | Add one current-behavior export entry | `2026-09-24-export-menu-projection` and generated registry output are current. |
| No release artifact | no | Published package and registry changes require release artifacts | Package changesets and the registry changelog are present and verified. |
| Package typecheck/build/test | pass | Run source-first and packed checks | `check:plite:dev`, website typecheck and packed release proof pass. |
| Barrel/export generation | pass | Run pnpm brl | Generated barrels and API/registry manifests are current. |
| Warm latency budget | pass | Meet frozen target budget | Every final-source Markdown and static HTML cohort passes. |
| Large/stress scaling | pass | Exercise frozen cohorts | Large fan-out, stress content and pathological fan-out pass. |
| Cold and failure paths | pass with limit | Preserve cold timing and test format failures | Receipts include cold durations; package suites cover invalid images/files and malformed inputs. |
| Payload and fan-out | pass | Record bytes and construction/view counts | Receipt records bytes, one runtime and one view per static document. |
| Production-path rerun | pass | Run against final private owner | Final source fingerprints are stored in both receipts. |
| Correctness guard | pass | Require byte-equivalent outputs | All target outputs match baseline digests. |
| Before/after receipt | pass | Store comparable result | Both JSON receipts were regenerated after final source changes. |
| Detector and privacy | N/A | Avoid production telemetry | Fixtures contain synthetic text only. |
| Performance regression check | pass | Rerun the bounded receipt | `METRIC export_runtime_probe_pass=1` and `METRIC docx_export_proof_pass=1`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Prior review, current owners and callers reconciled | Decide |
| Decide | complete | Target API, hard cuts and ownership fixed | Prove and hand off |
| Execute | complete | All ten slices adopted across Plite, Plate, DOCX, registry and docs | Verify |
| Verify and close | complete | Source, packed, browser, benchmark, DOCX and ledger proof pass | None |

## Decision brief

- Format encoders consume one captured canonical document and frozen conversion
  configuration. Editor methods and standalone functions delegate to the same
  private compiler without activating editing lifecycles.
- Delete every serializer-only editor construction and parallel authored
  serializer. Projection is an option on the owning format.
- Plite owns the document and authored projection; Plate compiles feature
  codecs; each format owns output and diagnostics; copied UI owns shell,
  CSS/assets, filenames, download and toasts.
- Semantic HTML and styled React HTML stay distinct. Static React receives a
  private read-only projected editor view because existing components
  legitimately consume editor/schema/plugin context.
- No TextPlugin. Schema-aware structural traversal and feature-owned text/plain
  node codecs back the free serializePlainText function and clipboard egress.
- DOCX retains the HTML hybrid, removes per-body editor construction, and moves
  required Word semantics out of the copied kit. Direct OOXML stays deferred.

## Target public API

### Authored projection

    const accepted = projectAuthoredDocument(document, {
      projection: 'accepted',
    });
    const mapped = projectAuthoredRange(accepted, commentRange);
    const review = projectAuthoredReview(document);

- projectAuthoredDocument accepts accepted or proposed and returns the complete
  projected document, canonical diagnostics, unresolved counts and range
  mapping facts.
- projectAuthoredReview returns accepted/proposed documents, markup segments,
  property changes, exact native source, unresolved counts and diagnostics.
- AuthoredFormatDiagnostic becomes AuthoredProjectionDiagnostic; warning policy
  and counts live once in Plite.
- parseAuthoredDocument validates native JSON. JSON export is ordinary
  JSON.stringify over a clean projection or the exact native review document.
- Delete readAuthoredProjection, readAuthoredFormatSnapshot,
  serializeAuthoredJson, deserializeAuthoredJson and AuthoredJsonResult.
  Interactive editor authored reads remain.

### Semantic HTML

    const result = editor.api.html.serialize({
      projection: 'accepted',
    });
    const detached = serializeHtml(document, {
      plugins: EditorKit,
      projection: 'proposed',
    });

- Both return HtmlSerializeResult with data and diagnostics.
- The editor method accepts document?. Omission captures current document and
  configured codec/store state synchronously.
- The standalone call accepts declarations and optional schema as one-shot
  configuration. Private compilation freezes them before conversion.
- Authored metadata requires an explicit projection. Review emits a semantic
  body plus exact native envelope and does not claim visible tracked changes.
- Add editor.api.html.deserializeDocument(data) for complete document/native
  envelope import. Existing deserialize remains the fragment job.

### Markdown

    const result = editor.api.markdown.serialize({
      document,
      projection: 'proposed',
      withBlockId: true,
    });
    const detached = serializeMarkdown(document, {
      plugins: EditorKit,
      projection: 'accepted',
    });

- serialize always returns MarkdownSerializeResult with data and diagnostics.
- Rename SerializeMdOptions.value to document. Delete serializeAuthored,
  SerializeAuthoredMarkdownOptions and AuthoredMarkdownResult.
- Preserve remark options, rules, filters, block IDs, AI fragment/table-cell
  use and clipboard open-slice encoding.
- Deliberate filtering and unsupported loss use different diagnostic codes;
  console warnings are not a result channel.

### Structural plain text

    const live = serializePlainText(editor, { projection: 'accepted' });
    const detached = serializePlainText(document, {
      plugins: EditorKit,
      projection: 'proposed',
    });

- Overloads distinguish Editor from EditorDocumentValue and return
  PlainTextSerializeResult with data and diagnostics.
- Plain text supports accepted or proposed. Review is absent because text
  cannot preserve native review state.
- Plite default traversal concatenates text, keeps inline content inline,
  inserts block separators, follows reachable content roots at their owning
  slots, and diagnoses unsupported void/atom content.
- Plate adds typed text/plain node codecs. Table owns TSV; list owns markers and
  nesting; code owns line boundaries; breaks, links, mentions, media/file,
  math, columns/callouts and other atoms own labels or explicit losses.
- Clipboard egress uses the same encoder for ContentSlice. Ingress, MIME
  negotiation, exact open slices, table grid selection and cut remain separate.

### Styled static HTML

    const result = await renderStaticHtml(editor, {
      component: EditorStatic,
      document,
      projection: 'accepted',
      props: { style: { padding: 0 } },
    });

- Return Promise<StaticHtmlResult> with data and diagnostics.
- Capture document, projection and render configuration before the first await.
- Render through a private immutable read-only projected view over one
  configured runtime. It creates no activation, subscription, normalization,
  history or collaboration state and rejects updates.
- Rename editorComponent to component.
- Delete renderAuthoredHtml, deserializeAuthoredHtml, stripClassNames,
  preserveClassNames, stripDataAttributes and their utilities. Semantic HTML
  owns clean interchange.

### DOCX

    const result = await exportToDocx(editor, {
      comments,
      component: EditorStatic,
      projection: 'review',
      source,
      stylesheet,
    });

- Keep DocxExportResult, explicit projection, cancellation, comments, retained
  source and structured diagnostics.
- Remove editorPlugins; use the current editor's frozen compiled configuration.
- Rename editorStaticComponent to component.
- Render body and comments through projected views over one captured runtime;
  configured-runtime construction is constant in comment count.
- Package-owned Word mappings replace DocxExportKit for code whitespace,
  columns, equations, callouts, heading bookmarks, TOC and review wrappers.
  App stylesheet, fonts and theme remain options.
- Retain HTML-to-DOCX. A direct OOXML candidate is a separate measured decision.

### Standalone compilation law

- serializeHtml, serializeMarkdown and detached serializePlainText privately
  lower plugin/schema declarations into an immutable format runtime.
- Compilation evaluates codec/schema/config factories and initial store state
  only. It does not activate plugins, normalize documents, create selection,
  history, DOM, collaboration, subscriptions or cleanup obligations.
- Editor methods freeze current configured store state at call entry.
- Do not expose CompiledExportContext, ExportSession, a builder or universal
  prepared converter. A future measured repeated job may earn a format-specific
  prepared encoder.

## Complete-document and diagnostics laws

| Input fact | Required behavior |
| --- | --- |
| Reachable schema content root | Serialize at its owning node/slot when the format represents it. |
| Unreachable or unrepresentable named root | Warn and omit visibly; preserve only when a native envelope promises it. |
| Document metadata | Encode mapped fields, warn for omitted keys, retain all keys in exact native review. |
| Authored metadata with no projection | Throw an actionable programmer error before conversion. |
| Accepted/proposed with unresolved changes | Return canonical Plite warnings with projection and counts. |
| Review projection | Preserve exact native data only in formats with envelopes or tracked revisions. |
| Deliberate allow/disallow filter | Emit a filter diagnostic distinct from unsupported content. |
| Unknown non-void container | Apply documented unwrap/fallback and warn with path/type. |
| Unknown void or atom | Omit or label by format policy and warn with path/type. |
| Invalid API/configuration | Throw; expected representational loss stays in diagnostics. |
| Async format | Capture document, comments, source and configuration before the first await. |

Each format exports its own result/diagnostic types. Shared authored projection
diagnostics may appear by identity. There is no universal ExportResult.

## Hard cuts

- Delete caller-created createEditor/createStaticEditor conversion setup in the
  menu, authored HTML and DOCX body/comments.
- Delete serializeAuthored and renderAuthoredHtml API families.
- Delete copied projection warning reconstruction.
- Delete static HTML cleanup flags and utilities.
- Delete editorPlugins and DocxExportKit as correctness configuration.
- Keep NodeApi.string, clipboard lifecycle, JSON persistence, static React
  presentation and DOCX source lease as distinct jobs.
- Ship no aliases for removed APIs on next.

## Decision ledger

| Surface | Current | Target | Owner | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Canonical input | Live editor or block array varies | Complete document captured once | Plite document | Every format entrypoint | roots/meta/capture tests | partial input | pursue |
| Authored clean | Editor capability reads | Pure projection and range mapping | Plite authored | Replace reads/messages | contract + model harness | mapping drift | rearchitect |
| Authored review | Runtime traversal | Detached review projection | Plite authored | DOCX/HTML/Markdown | segment/property/conflict fixtures | custom paths | rearchitect |
| JSON | Authored serializer | Project then stringify; validate parse | Plite persistence | Delete serializer/result | exact round-trip | caller migration | simplify |
| Semantic HTML | Private encode, public decode | Public document encode/parse | Plate HTML | API/menu/server/docs | custom schema/roots | host fallback differs | promote |
| Markdown | String plus authored sibling | One result and standalone call | platejs/markdown | AI/server/menu/docs | package/type tests | broad adoption | consolidate |
| Plain text | NodeApi.string recipe | Structural traversal and codecs | Plite + Plate features | docs/clipboard/examples | table/list/code/void | policy breadth | rearchitect |
| Static HTML | Live editor and cleanup flags | Captured document and projected view | platejs/static | menu/block/DOCX | benchmark/components | source-bound APIs | rearchitect |
| DOCX render | Editor per body/comment | One runtime and package mappings | platejs/docx/export | remove app kit/option | XML/native/comments | review/assets | rearchitect |
| DOCX backend | HTML/CSS hybrid | Retain hybrid | platejs/docx/export | no rewrite | complete rerun | native may later win | retain |
| Clipboard | Exact slice/host formats | Same lifecycle, shared encoder | Plite DOM + transfer | internal delegation | browser slice cases | overwrite order | retain |
| Delivery | Menu builds everything | Menu owns shell/assets/download/toast | registry UI | remove conversion setup | Chromium route | offline policy | simplify |
| Public compiler | None | None | private format compilers | hidden one-shot compile | lifecycle counters | future reuse job | stop |
| Universal export API | None | None | per-format owners | none | API audit | symmetry pressure | stop |
| PDF/image | Removed | Remain absent | future jobs | none | source/docs audit | later print request | defer |

## Execution slices

| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Authored projection | Plite authored | Pure clean/review projection, diagnostics, range mapping, parser rename and JSON hard cuts | Current contract green | Detached/live results match for clean, pending, conflict, roots, properties and ranges | authored contract, mapping harness, typecheck |
| 2. Private compiler | Plate model/compiler | Freeze editor state or one-shot declarations without activation | Slice 1 green | HTML/Markdown/text consume immutable document/config; lifecycle counters zero | lifecycle and inference tests |
| 3. Plain text | Plite traversal + Plate features | Neutral traversal, typed node codecs and clipboard egress reuse | Slice 2 green | Structural boundaries preserved; no TextPlugin; NodeApi.string unchanged | table/list/code/root/void + browser |
| 4. Semantic HTML | Plate HTML | Document serialize/parse, diagnostics and roots | Slices 1–2 green | Editor/standalone agree; review round-trips; losses explicit | HTML suite and type tests |
| 5. Markdown | platejs/markdown | Merge result, rename value, standalone call, diagnostics | Slices 1–2 green | One API covers editor/server/AI/review | Markdown, AI and type tests |
| 6. Static renderer | platejs/static | Document/projection/result, projected view, sync capture, cleanup deletion | Slices 1–2 green | No serializer editor/lifecycle; components/root slots exact | static suite + probe |
| 7. DOCX | platejs/docx/export | Reuse runtime, promote mappings, remove editorPlugins/kit | Slices 1 and 6 green | Constant runtime; review/comments/source retained | DOCX suite, ZIP, LibreOffice, benchmark |
| 8. Product callers | AI + registry | Adopt data/diagnostics, standalone server and menu APIs | Slices 3–7 green | No conversion editors or warning reconstruction | caller sweep, www, Chromium |
| 9. Teaching/release | Docs + doctrine | Current docs, codec/render rules, Plate Next record, changesets/changelog, barrels/registry | Slice 8 green | Teaching and artifacts match target | docs, brl, registry, changesets |
| 10. Closure | Task + Verify Plate | Package/browser/packed/benchmark/native gates and review execution | Slices 1–9 green | Every acceptance row passes or records exact limit | commands below + ledger |

## Proof matrix

| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| No full editor per document | Passing view probe | Final deterministic counters | verified |
| No standalone editing lifecycle | Compiler paths inspected | activation/subscription/normalization/history spies | verified |
| One revision before async | Existing closure retained | delayed mutation for static/DOCX/comments/envelope | verified |
| Projection policy centralized | Plite target fixed | all-format projection/conflict results | verified |
| Roots/meta truthful | Complete-document law fixed | reachable slot/orphan/meta fixtures | verified |
| HTML schema-aware | Existing compiler located | parity, unknowns, unsafe URL, review import | verified |
| Markdown breadth retained | Options/callers audited | remark/filter/ID/AI/fragment/table | verified |
| Plain text structural | Host/table paths audited | paragraph/list/table/code/break/atom/root goldens | verified |
| Clipboard exact | Transfer decision retained | open slice/cut/table/precedence browser | verified |
| Static compatibility | Prototype matches | rich components/plugin reads/root slots/update rejection | verified |
| DOCX mappings package-owned | Copied kit inventoried | columns/code/math/callout/heading/TOC/review | verified |
| DOCX source authority retained | Adopted decision retained | exact fast path and invalidation | verified |
| Menu projection consistent | Prior closure retained | Apply/Omit/review on docx-demo | verified |
| Inference survives | Type law applied | no explicit callback annotations | verified |
| Public imports valid | Manifest audit planned | packed import/type/DCE smoke | verified |

## Scale contract

- Operations: Markdown serialization, styled static HTML rendering and DOCX
  body/comment rendering.
- Variables: blocks, documents/comments, output bytes and final DOCX
  images/revisions/ZIP bytes.
- Cohorts: normal 5×20; large fan-out 25×20; stress content 25×100;
  pathological fan-out 100×20. Final DOCX adds 0/10/100 comments plus image
  failure and retained-source cases.
- Budget: exact output digest; one configured target runtime; one read-only view
  per document; target warm p95 no slower than baseline×1.1+1 ms.
- Command: bun --preload ./config/plite-source-aliases.ts
  docs/plans/artifacts/2026-09-24-document-first-export-contracts/export-runtime-probe.tsx
- Receipt:
  docs/plans/artifacts/2026-09-24-document-first-export-contracts/export-runtime-probe.json
- Identity: working source over commit
  6a6e8f660f10ede916b90e90b2849e02d95e7d84, Bun 1.3.12 on Darwin,
  two warmups, nine interleaved samples and exact source fingerprints in the
  receipt.
- Result: pass. Markdown p95 baseline 21.12/84.16/209.70/266.71 ms versus
  target 1.61/11.97/25.73/22.01 ms. Static HTML baseline
  35.85/117.02/241.06/324.58 ms versus target
  8.18/32.83/90.22/76.08 ms.
- Construction: baseline 60/300/300/1200 configured editors; target one runtime
  plus one projected view per document/run.
- Correctness: every target output matched the baseline SHA-256 digest.
- DOCX result: pass. Comment cohorts 0/10/100 have p95
  104.47/182.49/218.39 ms and 38,099/47,835/122,445 output bytes. The
  process-level peak RSS samples are 612,810,752/1,011,400,704/1,014,923,264
  bytes. Accepted, proposed and review files reopen and resave through
  LibreOffice with the expected draft visibility; retained source bytes are
  exact.
- Limit: the DOCX RSS measurement covers the whole process and LibreOffice is
  the available native-office proxy. Microsoft Word was not available for a
  native open/save pass.

## Focused execution commands

    bun test --preload ./config/plite-source-test-setup.ts \
      ./packages/plitejs/test/authored-format-contract.test.ts

    pnpm --filter platejs test -- \
      src/lib/plugins/html/HtmlPlugin.spec.ts \
      src/lib/plugins/html/HtmlPlugin.codec.spec.ts \
      src/markdown/lib/MarkdownPlugin.spec.ts \
      src/static/renderStaticHtml.escaping.spec.ts \
      src/static/renderStaticHtml.node-props.spec.ts \
      src/docx/export/lib/exportToDocx.spec.ts \
      src/docx/export/lib/authoredDocx.spec.ts \
      src/docx/export/lib/sourcePreservation.spec.ts

    pnpm --filter plitejs typecheck
    pnpm --filter platejs typecheck
    pnpm --filter www typecheck
    bun test ./apps/www/src/registry/registry.test.ts
    pnpm --filter www check:docs
    pnpm --filter www build:registry
    pnpm --filter www build:registry --check
    pnpm brl
    bun --preload ./config/plite-source-aliases.ts \
      docs/plans/artifacts/2026-09-24-document-first-export-contracts/export-runtime-probe.tsx
    pnpm check:plite:dev
    pnpm plite:release:packages
    pnpm lint:fix
    node tooling/scripts/review-ledger.mjs render
    node tooling/scripts/review-ledger.mjs check
    git diff --check

- Add a managed Chromium case for /blocks/docx-demo and serialize managed
  browser commands with serving-source freshness.
- Reuse the established headless LibreOffice open/re-save flow for accepted,
  proposed and review DOCX. It proves package readability, not Word parity.
- Register the final export benchmark as a durable target only if it becomes a
  CI budget; otherwise retain the deterministic package test and receipt.

## Conditional evidence

- High-risk scenarios: root reachability, authored range mapping, configured
  store capture, custom component reads, concurrent exports, unsupported voids,
  comment fan-out, source invalidation and remote-image failure all have proof.
- External research: reused from the fixed seven-repository, six-family corpus
  in docs/plite/research/2026-09-24-export-architecture/. No code was copied.
- Issue/PR provenance: N/A; this work is review-led.
- Plate Docs owns API pages; registry owns delivery; Verify Plate owns
  browser/native proof; changeset and registry-changelog own release artifacts.
- No new editor behavior-law file is needed; conversion contracts live in
  package tests and format docs.
- The private-view decision and complete DOCX operation have passing receipts.
  Microsoft Word remains unavailable; LibreOffice reopen/resave is the recorded
  native-office limit.

## Findings

- Markdown already accepts a detached value, proving full editor reconstruction
  unnecessary. Its result and authored split are the API debt.
- Semantic HTML encoding already exists in the compiled HTML owner. File calls
  need explicit diagnostics and complete-document root policy.
- withEditorDocumentProjection alone cannot drive static rendering because
  ordinary reads clear the outer projection. A private projected view is needed.
- A mutable one-runtime stand-in failed static stress/pathological timing because
  document replacement pays update/index work. Immutable views pass.
- Static components legitimately consume editor/schema/plugin context.
  Removing every editor-shaped object would rebuild the context dishonestly.
- Current plain text joins top-level NodeApi.string values while table selection
  owns TSV separately. Structural text needs traversal and feature codecs.
- DOCX creates one editor for body and every comment and depends on a copied kit
  for required semantics. Both are ownership defects; the backend is not disproven.
- Complete documents contain reachable content roots, unrelated roots and
  metadata. Formats must traverse reachable roots before diagnosing the rest.

## Decisions and tradeoffs

- Standalone functions accept plugin/schema declarations to describe custom
  schemas. Private compilation immediately lowers and freezes them.
- No public prepared converter: reuse inside one operation is proven, but no
  durable cross-operation cache job is.
- Static components receive a read-only projected Editor, preserving
  presentation power while rejecting mutation.
- Per-format result types intentionally repeat data plus diagnostics. A shared
  generic result would add coupling without shared artifact semantics.
- DOCX keeps its ok union because binary generation can fail after conversion.
- HTML/Markdown review preserves native Plate data without claiming visible
  tracked edits; DOCX retains the stronger revision promise.

## Review fixes

- Rejected a TextPlugin after reconciling the accepted review.
- Rejected outer document projection after it rendered the source document.
- Rejected mutable replacement after its stress/pathological timing failed.
- Added view counts, source fingerprints, cold timing, bytes and DOCX limits.
- Kept an editor-shaped object only for static React component compatibility.
- Removed the Markdown-named node type from plain-text codecs; both format
  contracts use the shared `PluginCodecNode` schema type.
- Canonicalized callout defaults, image height and MDX JSON-literal attributes
  after the full package suite exposed schema-invalid round trips.
- Removed stale Plate and static-component registry dependencies from the
  copied DOCX stylesheet preset. Package-owned DOCX renderers now have direct
  public-boundary coverage for headings, TOC, equations, callouts and columns.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Probe internal import path was one directory too high | 1 | Recalculate from artifact directory | Corrected to four parent segments. |
| Fixture used HTML tag p instead of schema type paragraph | 1 | Read BaseParagraphPlugin identity | Fixture corrected. |
| Outer projection rendered original static document | 1 | Trace readEditor and view ownership | Designed private projected view. |
| First fan-out cohort exceeded disposable probe time | 1 | Reduce counts while preserving four shapes | Final cohorts are bounded. |
| Mutable static stand-in failed stress/pathological p95 | 1 | Prototype immutable projected views | Final target passes. |
| `react-dom/server.browser` retained a MessagePort in packed SSR proof | 1 | Use the DOM-free edge renderer | Packed SSR exits cleanly. |
| Broad Plate entrypoints pulled raw authored internals and grew by 143 KB | 1 | Compile only the authored parse/project capability | Final broad entrypoints grow by 2.3–3.1% for the accepted shared format capability. |
| Complete-document validation exposed invalid Markdown media/callout fixtures | 1 | Repair canonical feature codecs and fixtures | Full Markdown partition passes 206/206. |
| Plain-text named-root cycles could recurse forever | 1 | Track active roots and diagnose the repeated slot | Cycle proof passes without recursion. |
| Packed size proof reported the final 488–644 byte codec repair cost | 1 | Review and refresh the measured baseline | Packed package proof passes with no new dependency edge. |
| DOCX stylesheet registry metadata still installed package-owned static components | 1 | Recheck the copied preset and package renderer boundary | The preset has no dependencies; the DOCX export partition passes 104/104 with all required renderer families covered. |

Verification evidence:

- `pnpm check:plite:dev` passes 98 typecheck partitions, the Plite app
  typecheck, 159 package-test partitions, 256 tooling contracts, 25 benchmark
  tests, 55 benchmark targets, package builds, a production Next build and
  Chromium smoke.
- Packed proof passes for four packages, 91 public subpaths, NodeNext and
  Bundler declarations, 86 runtime imports, 46 React-free headless imports,
  one DOM-free SSR render, 44 exact optional-peer closures, DCE and the reviewed
  size baseline.
- Website typecheck, API-reference generation, registry generation/check,
  documentation parity, registry tests and changelog checks pass.
- Managed Chromium passes the invalid Word no-mutation case, toolbar
  import/export and one projection across HTML, Markdown and Word.
- `METRIC export_runtime_probe_pass=1` and
  `METRIC docx_export_proof_pass=1`; both receipts contain final source
  fingerprints.
- LibreOffice reopens and resaves accepted, proposed and review DOCX artifacts
  with expected content; retained source reuse is byte exact.
- The DOCX export partition passes 104/104, including direct package-owned
  renderer coverage for code, columns, equations, callouts, headings and TOC.
- Barrels, Plate Next doctrine validation, review-ledger render/check,
  `check-complete.mjs`, final lint and `git diff --check` pass.

Open risks:

None. The native-viewer and process-level memory limits below bound the proof
but do not leave implementation work open.

## Final outcome

- Ownership: Plite document/authored and neutral traversal; Plate format and
  feature codecs; static presentation; DOCX Word encoding; copied UI delivery.
- Public breaks: authored helper hard cuts, Markdown result/option change, HTML
  additions, plain-text function, static cleanup and DOCX option cleanup.
- Private mechanism: one-shot frozen format compiler and read-only projected
  views; neither becomes a public universal context.
- Scale: final-source Markdown, static HTML and DOCX receipts pass.
- Adoption: authored → compiler → plain text → HTML → Markdown → static →
  DOCX → callers → docs/release/doctrine → closure is complete.
- Limits: Microsoft Word native proof was unavailable; DOCX memory is sampled
  at process scope.

Timeline:

- 2026-09-24T21:05:15.473Z: plan created and bound to final reassessment.
- 2026-09-24: current owners, callers and compiler constraints inspected.
- 2026-09-24: projection and mutable-runtime targets rejected.
- 2026-09-24: projected-view probe passed all four cohorts.
- 2026-09-24: APIs, cuts, slices, proof and release/doctrine gates finalized.
- 2026-09-25: all ten implementation slices, caller migrations, generated
  artifacts and regression repairs completed.
- 2026-09-25: source, packed, managed Chromium, benchmark, DOCX and ledger
  closure proof passed.
- 2026-09-25: removed stale DOCX stylesheet registry dependencies and added
  direct package-owned renderer regression coverage.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Implementation and proof complete. |
| Where am I going? | No remaining plan step. |
| What is the goal? | Adopt document-first per-format conversion without serializer-only editor lifecycles. |
| What have I learned? | Static React needs a private projected editor view; semantic formats do not. |
| What have I done? | Adopted the document-first APIs, migrated callers, removed superseded paths and passed source, package, browser and artifact proof. |

Known limits:

- Microsoft Word was unavailable; LibreOffice open/resave proves office-package
  readability but not exact Word layout parity.
- DOCX peak RSS is sampled for the whole Bun process, so it is a conservative
  operation-level signal rather than an isolated allocator measurement.
- Formats intentionally report unsupported atoms, unreachable roots and
  metadata through diagnostics rather than inventing lossy output.

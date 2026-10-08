---
review_scopes: [documents]
review_basis: [2026-10-04-documents-audit]
verdict: pursue
work_kind: implementation
review_commit: da4898bb61da71aaf82226709ee29f761ac73835
review_inputs: [docs/vision/plate.md, docs/vision/common.md, VISION.md, content/docs/(guides)/serializing.mdx, content/docs/(guides)/authored-changes.mdx, .changeset/docx-package-topology.md, packages/plitejs/src/authored/format.ts, docs/research/review-records/2026-09-27-exports-adversarial-audit-feedback.json, docs/plans/2026-09-27-document-conversion-architecture-corrections.md, docs/research/sources/docx-interoperability-oss.md]
review_upstreams: ['../docx-editor@cabf6fae68167efa98eeec13ec11bdb0461fb674', '../eigenpal-docx-editor@84c46227d4ce4c4098a04dbccc4516578f2ab72d', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../Open-XML-SDK@431ab05cf160248cc3885a4a766026d4f8243792', '../docx@fda088d1da3772474bec9c40feb210cebb304f97', '../docxjs@191d3e0db009da578fbe4da70d55305cd8d50226', '../python-docx@e45454602b53e8e572b179ccf1c91093ec9f4ed7', '../docx-redline-js@616b7f515c44a417f3700b84847ad6be21aeea74', '../windoc@e6576c12659ad0c832a3fee6052edd123b3beda9', '../opendoc@7a408cf034f3efdc1ed2101c640ce296a6ba4d5b', '../pandoc@bde8c297ee68c07a037f06971aa0f1cce8a876cb']
---

# Documents: hard-cut the hidden Plate copy inside DOCX

Status: executed: the DOCX source landed in your commit dc927288b2
Playbook: plan

Pursue, reaffirming `2026-10-04-documents-audit`. Delete the hidden Plate envelope that `exportDocx(editor, { nativeState: 'attach' })` writes as `editor/authored.json` and `importDocx(file, { authoredTrust })` reads back. The strongest reason is new since that audit. The envelope is a second authority for exact document state, and it already leaks. An edited export from a retained source copies the old envelope forward, so a file whose visible body says "Public text" still hides the deleted "Secret draft clause" (probe below). The job it claims, an exact Plate-to-Plate round trip in one file, is owned by canonical authored JSON (`projectAuthoredReview` and `parseAuthoredDocument`). Vision names no job for hidden Plate state in a DOCX file, no published `platejs` release ever wrote the envelope, and no production or registry code sets either option. `next` returned `react` first. Its plan, `docs/plans/2026-10-06-react-review.md`, waits on your Hold or Build now answer, so this review took the next open unit. `documents` depends on `model`, which is closed with a Stop.

The plan builds the cut in two phases under the Build playbook, `.agents/playbooks/build.md`. Phase 1 deletes the envelope in one wave. Phase 2 replaces the overlay's copy-everything rule with one table in `internal/sourceEligibility.ts` that says what an edit does to each admitted root part, so the package's stale preview thumbnail no longer survives an edit through its root relationship. The design came from a three-runner `architect` arena with an Opus cross-judge; the plan panel cut its third phase, a private type for admitted bytes, because that type could not stop an unchecked return. The Evidence section holds the synthesis and the panel round.

## Brief

### What will change?

Plate no longer hides a copy of the editor document inside Word files. An edited Word export keeps only custom properties and simple headers and footers from the source, and reports what it leaves out.

### What could go wrong?

Edited Word exports now warn that the source author, title and company were left out. Custom properties linked to deleted text still keep that text. Two small review fixes wait for your review.

## Public API

A review export writes Word revisions and comments only; the hidden part and its option go away.

```ts before
// packages/platejs/src/docx/export/lib/authoredDocx.spec.ts
const result = await exportDocx(editor, {
  nativeState: 'attach',
  projection: 'review',
});
```

```ts after
// packages/platejs/src/docx/export/lib/authoredDocx.spec.ts
const result = await exportDocx(editor, {
  projection: 'review',
});
```

Import always derives the document from the Word-visible package; the trust option and its `DocxAuthoredTrust` type go away.

```ts before
// packages/platejs/src/docx/export/lib/authoredDocx.spec.ts
const imported = await importDocx(await result.blob.arrayBuffer(), {
  authoredTrust: { kind: 'same-application' },
  plugins,
});
```

```ts after
// packages/platejs/src/docx/export/lib/authoredDocx.spec.ts
const reimported = await importDocx(await result.blob.arrayBuffer(), {
  plugins,
});
```

Exact review state keeps its one canonical path, unchanged by this cut: `projectAuthoredReview(editor.read.value()).review` serialized as JSON and read back with `parseAuthoredDocument` (`content/docs/(guides)/serializing.mdx:43-47`).

## What other editors do

A 2026-10-06 research shard read 15 local clones at their checked-out revisions, built and ran none of them, and asked whether any carries its own editor state inside a .docx (`docs/plite/research/2026-10-06-docx-native-state/`). None writes whole-document editor state into the package, and none binds stored data to package bytes the way Plate's digests do. The closest tools store per-record caller data in Word's customXml parts and let a visible content control decide whether each record still applies; SuperDoc carries exact application data beside the .docx, not inside it. ProseMirror, Lexical, Slate and Tiptap ship no DOCX code in their public trees.

| Delta | Library | What it does with DOCX | Limit the comparison recorded |
| --- | --- | --- | --- |
| changed | SuperDoc `3bad86724392` | Stores per-record caller data in customXml parts tied to hidden content controls, and returns exact application data beside the .docx in an outer archive | Its DOCX engine is closed; this pass read `cabf6fae6816`, which is older than the 2026-09-14 revision |
| changed | Pandoc `bde8c297ee68` | Reads with accept, reject or all, regenerates parts from its AST, and writes its metadata to custom properties that its reader never reads back | Moves become insert and delete, and IDs can change |
| added | eigenpal docx-editor `84c46227d4ce` | Edits the OOXML tree itself, and stores a caller's JSON per inline node in a customXml part bound to a visible content control | A payload whose control is gone is swept on open; it stores no whole-document state |
| added | BlockNote `1e26f1c5e1cd` | Exports Word content | No DOCX import, and no BlockNote JSON in the file |
| added | opendoc `7a408cf034f3` | Carries the parts it does not model through unchanged | Drops digital signatures when the document is edited, for the same reason a digest-bound part goes stale |

Word keeps customXml data parts, per Microsoft's add-in documentation. ISO 29500 lets a conforming producer drop a part reached through an unknown relationship, which is how Plate links `editor/authored.json`. What Word and LibreOffice Writer do to such a part on save is an evidence gap.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Exact review state persists only as canonical authored JSON | Plite owner, Plate facade | `platejs/authored` (`packages/plitejs/src/authored/format.ts`) | Already the documented path (`content/docs/(guides)/serializing.mdx:43-47`); the envelope's `document` is that JSON |
| The envelope writer, reader, digests and trust options are deleted | Plate | `platejs/docx/export`, `platejs/docx/import` and the private `docx-internal` partition | No job, a forgeable trust check and a confirmed leak |
| One root-part table owns admission and the edit disposition | Plate | private `docx-internal` (`internal/sourceEligibility.ts`), read by `export/lib/sourcePreservation.ts` | `sourcePreservation.ts` and `outputSafety.ts` already import it, so no new edge in `tooling/entrypoints/entrypoint-dag.mjs` |

## Hard cuts and app migration

Deleted from `platejs/docx/export` and `platejs/docx/import` in Phase 1, with no alias, stripper or fallback reader:

| Name | Where it lives | Callers that break |
| --- | --- | --- |
| `DocxExportOptions.nativeState` | `exportDocx.tsx:74-75` | `authoredDocx.spec.ts` and `sourcePreservation.spec.ts` only |
| `DocxImportOptions.authoredTrust` and the `DocxAuthoredTrust` type | `importDocx.ts:88-102` | `authoredDocx.spec.ts`, `sourcePreservation.spec.ts` and `importDocx.spec.ts` only |
| The `native-data-ignored` member of `DocxDiagnostic` | `internal/types.ts:66-78` | none outside the specs |
| The `editor/authored.json` part, its content type and relationship | `internal/correspondence.ts`, `export/lib/packageArtifacts.ts` | none |

No production, registry, template, type-test, benchmark or browser-test code sets either option (census in Evidence), and no published `platejs` release ever wrote the part. An app that set `nativeState` drops the option and saves canonical JSON beside the file:

```ts
// content/docs/(guides)/serializing.mdx
import { parseAuthoredDocument, projectAuthoredReview } from 'platejs/authored';

const snapshot = projectAuthoredReview(editor.read.value());
const json = JSON.stringify(snapshot.review);
const document = parseAuthoredDocument(json);
```

A Word file an older development build wrote with the part still imports from its visible content. With `retainSource: true` it gets `source: null` and one `source-unavailable` warning with reason `ineligible` on `_rels/.rels`, the path an unknown relationship already takes (`probes/unknown-private-part-import.log`). Copied registry components change nothing: the import and export toolbars never set either option.

## Main changes

- The exact-reuse branch in `exportDocx.tsx` returns the retained bytes unchanged. Its attach and strip branches and their JSZip load are gone. One resolver acquires the source and returns a discriminated `SourceExportResolution` (`{ kind: 'exact'; lease } | { kind: 'render'; lease?; diagnostics }`), so the exact arm is the only place a lease reaches the return without rendering, and the repeated `sourceAcquisition?.ok` guards at `exportDocx.tsx:472-496` and `:543-547` go away.
- `importDocx` no longer captures a Web Crypto adapter or the authored parse and projection callbacks; ordinary import keeps its schema assertion, revision reconstruction and `dequal` uses.
- `nativeOnlyDiagnostics(document)` takes one argument and always reports named roots and document metadata as omitted from Word output, as `lossy-content` warnings under both loss policies.
- `ROOT_PARTS` in `internal/sourceEligibility.ts` is the one list of root relationships a retained source may hold, and each row names what an edit does to it: `regenerate` (main document), `carry` (custom properties) or `drop` (thumbnail, core and extended properties), and the final sweep reports every source part the output does not carry, except a dropped root part stored under a filename-exempt path such as `word/theme/`, whose fix waits in the diff panel's unreviewed patch; a dropped thumbnail that a kept header carries stays as that header's content. The approved text said `regenerate` for core and extended properties; the build reversed both, because the writer writes no `docProps/app.xml` and its own core properties replace the source author, title and dates, so `regenerate` hid a silent drop and a silent replacement (deviation rows in the decision log). `PACKAGE_VOCABULARY` derives from it; the overlay's skip regex at `sourcePreservation.ts:393-397` and the root names in `sourceOwnedPart` go away, and the overlay copies only `carry` parts.
- `drop` applies to the root relationship. A non-root graph that also targets the thumbnail part, such as a header with a relationship to it, still copies it as at base; that case is open under Panel gate with its unreviewed patch.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Exact review persistence | Canonical JSON plus the optional envelope | Canonical JSON only | `platejs/authored` | `docs/vision/plate.md:1143-1145` | Docs point to `serializing.mdx:43-47` | `packages/plitejs/test/authored-format-contract.test.ts:236` | none | keep |
| `nativeState`, `authoredTrust`, `DocxAuthoredTrust`, `native-data-ignored` | Public options, type and diagnostic member | Deleted | none | No Vision job, forgeable trust, confirmed leak | Specs, docs and their Chinese twins, changeset | Partition typechecks and tests; live-file grep | An app on an unreleased `next` build gets a type error | cut |
| Envelope writer, digests and read path | `packageArtifacts.ts`, `correspondence.ts`, `importDocx.ts:1351-1481` and plumbing | Deleted | none | Guard only the deleted authority | none | `probes/stale-envelope-injected.ts` before and after | none | cut |
| Envelope eligibility entries | `sourceEligibility.ts:4-7`, `:212`, `:517-518`; `sourcePreservation.ts:246` | Deleted | none | Ineligibility closes the leak for old files | none | Same probe; the 'a macro project' hostile variant at `sourcePreservation.spec.ts:100-109` covers the generic path | Old development files lose retained source | cut |
| Exact-reuse branch | Attach or strip, both returning before `checkDocxOutput`; the strip always loads the package and regenerates it when an envelope exists | Return the admitted lease bytes | `exportDocx.tsx` | Same predicate already ran on the same immutable bytes (`source.ts:77-91`, `outputSafety.ts:181-205`) | none | `sourcePreservation.spec.ts:196-213` byte identity; `probes/retained-source-passes-output-check.log`; step 1.10 receipt | A later post-check transform | keep, accepting that no type guards a later post-check transform after the Phase 3 cut |
| Root-part policy | Allowlist, overlay skip regex and part names in three places | One `ROOT_PARTS` table | `internal/sourceEligibility.ts` | Closes the census-proved members (envelope, thumbnail) at their producer; `docs/vision/plate.md:95-96` | Benchmark fixture move; docs overlay text | New Phase 2 test; step 2.3 receipt | Over-dropping custom properties | gate |
| Thumbnail on edit | Copied stale | Dropped with `source-part-omitted`, reason `invalidated`; exact reuse keeps it | `ROOT_PARTS` row | A picture of deleted content | `docx.mdx` fidelity text | New Phase 2 test | The edited file shows no preview icon | rearchitect |
| Retained-source benchmark overlay probe | 8 to 900 thumbnail relationships (`plate-docx-retained-source-benchmark.test.ts:26-27`, `:207-233`, `:518-529`) | Header images in one passive header graph | `benchmark` | The old probe asserts the copy Phase 2 removes | `benchmark` skill | Correctness run plus a measured base and candidate run, budgets unchanged | Baseline break | move |
| Linked custom properties on edit | Carried with a cached copy of the bookmarked body text | A Bug fix beside this plan | `internal/sourceEligibility.ts` and the overlay | A panel member of the class the census did not prove; narrowed out of this plan's claim | Open work | `probes/linked-custom-property-overlay.log` | Deleted text in `docProps/custom.xml` until that fix lands | defer |
| `DocxSource` | Live | Unchanged | `internal/source.ts` | First-party toolbars use it | none | Existing specs | none | keep |
| Docs, changeset, decision pages, Vision | Teach the envelope | Current state only | `plate-docs`, `changeset`, `research`, `best-api repair` | A hard cut reaches every teacher | Step 1.4 to 1.7 | Live-file grep exits 1 | A stale Chinese twin | rearchitect |

## Steps

Execution authority: the owner's "go" picked the review, and the Pursue continued into this plan; under `AGENTS.md`'s Panel review and Autopilot rules a panel-reviewed plan goes on to its build as a `look` default whose word is "hold" (Defaults). The build runs at `cd19701029`, whose DOCX source is identical to the review base `da4898bb61`, and builds the reviewed text without the unreviewed patch. Commits stay with the owner.

### Completion Gates

| Gate | Applies | Artifact |
| --- | --- | --- |
| `pstack:blast-radius` before code moves | yes | `docs/plans/artifacts/2026-10-06-documents-review/build/blast-radius.md` |
| `verify` loaded before the first proof gate | yes | `verify` invoked again in this build after the context compaction, before the step 2.3 and close proofs; Phase 1 and steps 2.1 and 2.2 ran under the load from before it; logs under `docs/plans/artifacts/2026-10-06-documents-review/build/` |
| `best-api repair` for the removed public API | yes | `docs/vision/plate.md:1141-1145`; forward test `docs/plans/artifacts/2026-10-06-documents-review/build/forward-test.txt` |
| `plate-docs` on every changed docs page, with its example coverage audit | yes | `plate-docs` invoked for steps 1.4 and 2.4; the coverage audit linked the review-state paragraph to the Serializing guide; MDX build and parity `docs/plans/artifacts/2026-10-06-documents-review/build/docs-build-source.attempt-3.log` and `docs-parity.attempt-3.log` |
| `pstack:thermo-nuclear-code-quality-review` per slice touching shared DOCX code | yes | one fresh-context Opus review of both slices at frozen commit `325bfa1780`, run after Phase 2 instead of between the slices; reply `docs/plans/artifacts/2026-10-06-documents-review/review/thermo/reply.txt`, findings logged as build, deviation and trail rows |
| `changeset` for the published package edit | yes | `.changeset/docx-package-topology.md:15` |
| `pnpm brl` and `pnpm --filter www build:registry` | yes | `pnpm brl` changed nothing (`docs/plans/artifacts/2026-10-06-documents-review/acceptance/brl.attempt-1.log`); registry rebuilt (`docs/plans/artifacts/2026-10-06-documents-review/build/build-registry.attempt-4.log`) and `build:registry --check` passes (`docs/plans/artifacts/2026-10-06-documents-review/acceptance/www-later-links.attempt-2.log`) |
| Writing passes: `deslop` and `no-comments` on code, `unslop` on docs and plan | yes | `deslop` and `no-comments` on the code, writing rows 18:14:29Z, 18:21:27Z and 18:47:02Z; `unslop` on the docs, changeset and decision pages, row 18:14:29Z, and on this plan's Close and the subject draft, row 20:01:38Z |
| `pnpm exec oxlint --type-aware` on the task's files before the diff panel freeze | yes | `docs/plans/artifacts/2026-10-06-documents-review/build/oxlint-type-aware.attempt-4.log` before round 2 and `docs/plans/artifacts/2026-10-06-documents-review/acceptance/oxlint-type-aware.attempt-1.log` on the final bytes, both exit 0 |
| Panel on the diff (reviews: api-build) | yes | two rounds, `docs/plans/artifacts/2026-10-06-documents-review/panel/diff-round-1/` and `diff-round-2/`, logged as panel rows; two fixes wait in `diff-round-2/unreviewed.patch` |
| Task-scoped `ultracite fix` and `check` as the last code edit | yes | `docs/plans/artifacts/2026-10-06-documents-review/build/ultracite-fix.attempt-1.log` and `ultracite-check.attempt-1.log`, exit 0 on 10 files |
| `pnpm check` once on the settled change | yes | `docs/plans/artifacts/2026-10-06-documents-review/acceptance/pnpm-check.attempt-1.log`: 20 of 25 steps pass; the other five fail the same way at HEAD or on another session's uncommitted file (verify row) |
| Decision-trail review (`codex:gpt-6.1-sol @xhigh`) | yes | `docs/plans/artifacts/2026-10-06-documents-review/trail/seat-sol.txt`; its findings are the trail and superseded rows from 19:32:06Z to 19:57:03Z, and its Attention section is in the Close |
| `/pstack:reflect` after the trail review | yes | reflect rows 20:01:38Z; replies in `docs/plans/artifacts/2026-10-06-documents-review/reflect/`; the Close's Reflect section lists the Accepted, Rejected and Backlog items |
| Fold into `docs/plans/topics/documents.md`, `review-ledger.mjs check` and `next` | yes | `docs/plans/topics/documents.md`; `docs/plans/artifacts/2026-10-06-documents-review/close/ledger-check.attempt-2.log` exit 0 and `ledger-next.attempt-1.log`, which names `pagination` |

Each phase ends with a keep, revert or quarantine decision. A revert of Phase 1 is the owner's call, because it restores the confirmed leak.

### Phase 1: delete the envelope in one wave

- [x] 1.1 Run `pstack:blast-radius` on the removed surface, per the architecture reference's Hard cut, and add any consumer it finds that the census missed. Proof: its reply saved in the run directory. Done: `docs/plans/artifacts/2026-10-06-documents-review/build/blast-radius.md`, which found no consumer outside the census.
- [x] 1.2 Delete `internal/correspondence.ts` and `export/lib/packageArtifacts.ts`. Remove the envelope code from `exportDocx.tsx` (`:34-37`, `:74-75`, `:430-437`, `:496-534`, `:591-594`, the `nativeState` parameter of `nativeOnlyDiagnostics`), `importDocx.ts` (`:9`, `:38-47`, `:88-102`, the realm adapter at `:154`, `:222`, `:252-260`, `:264`, `parseAuthored` and `projectAuthored` at `:181-185`, `:296`, `:300-311`, `:335-336`, and `:1351-1481`, `:1548`, `:1696-1708`, `:1741-1753`, `:1759`, `:1780`, `:1846`, `:1857`), `internal/types.ts:66-78`, `internal/sourceEligibility.ts:4-7`, `:212` and the envelope clause at `:518`, and `sourcePreservation.ts:246`. Make `SourceExportResolution` discriminated and let one resolver own source acquisition, including its `disposed`, `invalid` and `schema-mismatch` render arms. Proof: `pnpm --filter platejs typecheck:partition:docx-internal`, `typecheck:partition:docx-export` and `typecheck:partition:docx-import` exit 0, run in that order because `tsc --build` hides a dependent's errors behind a failed reference. Done: `docs/plans/artifacts/2026-10-06-documents-review/build/phase1-typecheck-partition-docx-{internal,export,import}.attempt-1.log`, all exit 0.
- [x] 1.3 Delete the envelope-only tests (`sourcePreservation.spec.ts` tests at `:215`, `:248` and `:440` with their now-unused imports, `importDocx.spec.ts:150-193`, the removed-part assertion at `authoredDocx.spec.ts:49`). In `authoredDocx.spec.ts:52-211`, delete the envelope read at `:91`, the envelope blocks at `:99-152` and the `zip.remove` at `:153`; `:153-190` already reimport the visible package. Keep `:213-253` on Word output, and keep `:462-512` with a Word XML assertion that only the configured serializer produces. Keep `importDocx.spec.ts:120-148`. Delete the no-op `zip.remove` at `plate-docx-revision-import-benchmark.test.ts:328` and pass the exported blob to import directly. Proof: `pnpm --filter platejs test:partition:docx-export` passes 125 tests (base 128, less the three deleted tests) and `test:partition:docx-import` passes 34 and 12 (base 34 and 13, less `importDocx.spec.ts:150-193`). Done: `docs/plans/artifacts/2026-10-06-documents-review/build/phase1-test-partition-docx-{export,import}.attempt-1.log`, 125 pass, then 34 and 12.
- [x] 1.4 Through `plate-docs`: `content/docs/(plugins)/(serializing)/docx.mdx` `:197-210`, `:237` (an unchanged export returns the bytes that passed this check at import), `:287`, `:309`, `:362` and its Chinese twin, including `docx.cn.mdx:233`; `serializing.mdx:50`, `:123-128` and `serializing.cn.mdx:48`, `:120`; `authored-changes.mdx:333-338` and its twin at `:283-287`. Each teaches Word revisions and comments in the file and canonical JSON for exact state. Then `pnpm --filter www build:registry` regenerates `apps/www/public/r/{docx-docs,serializing-docs,authored-changes-docs,registry-docs,registry}.json`. Proof: the `plate-docs` checks and rendered English and Chinese routes. Done with the narrower proof the Defaults table records: `docs/plans/artifacts/2026-10-06-documents-review/build/docs-build-source.attempt-2.log` and `docs/plans/artifacts/2026-10-06-documents-review/build/docs-parity.attempt-2.log` exit 0, registry `docs/plans/artifacts/2026-10-06-documents-review/build/build-registry.attempt-2.log`; `check:docs` stops earlier at `api-reference:check` on `HistoryApi`, which fails the same way at HEAD (`docs/plans/artifacts/2026-10-06-documents-review/base/api-reference-check.head.attempt-1.log`).
- [x] 1.5 Through `changeset`: rewrite `.changeset/docx-package-topology.md:15`, which is still pending, so it promises Word revisions plus canonical JSON. Proof: the `changeset` skill's checks. Done: `.changeset/docx-package-topology.md:15`; `.changeset/pre.json` has not consumed it, so the line carries no removal prose.
- [x] 1.6 Through `research` maintain: bring `docs/research/decisions/documents-conversion-fidelity.md`, `import-fidelity.md` (`:31-32`, `:212-214`) and `export-fidelity.md` (`:29-34`, `:93-94`, `:140-142`) to the current state. Drop `internal/correspondence.ts` and `export/lib/packageArtifacts.ts` from `docs/research/review-scopes/documents.json`, which `check` does not verify. Proof: `node tooling/scripts/review-ledger.mjs check` and `git grep -n -E "correspondence|packageArtifacts" -- docs/research/review-scopes/documents.json` exiting 1. Done: the three decision pages, with pre-edit copies in `docs/plans/artifacts/2026-10-06-documents-review/pre-edit/`; the scope grep exits 1.
- [x] 1.7 Run `best-api repair`: `docs/vision/plate.md:1143` names Word files among semantic interchange formats. Proof: the repair's search over skills and docs finds no rejected shape. Done: `docs/vision/plate.md:1141-1145`, forward test `docs/plans/artifacts/2026-10-06-documents-review/build/forward-test.txt`.
- [x] 1.8 Run `EXPECT=refuse` `probes/stale-envelope-injected.ts` on the build. Proof: it exits 0, which asserts the visible body imports, the old envelope file gets `source: null` with exactly `source-unavailable/ineligible`, and the edited export carries no `editor/authored.json`; at base the same mode exits 1 with those three assertion messages (`probes/stale-envelope-injected.base-refuse.log`) and `EXPECT=leak` exits 0 (`probes/stale-envelope-injected.base-leak.log`). Done: `docs/plans/artifacts/2026-10-06-documents-review/probes/stale-envelope-injected.build-refuse.attempt-1.log`, exit 0.
- [x] 1.9 Grep the live teachers for the removed names and their paraphrases. Proof: `git grep -n -i -E 'nativeState|authoredTrust|DocxAuthoredTrust|native-data-ignored|authored\.json|correspondence\.ts|packageArtifacts|authored package part|authored trust|native state|native-review|exact round.?trip' -- packages apps/www/src content .agents docs/vision docs/research/decisions docs/research/review-scopes .changeset` exits 1. Excluded by path and named here: this plan and its decision log, `docs/plans/topics/documents.md` until the fold, other dated plans, `docs/research/review-records/` and `docs/plite/research/`, which are history. Done with the narrower grep the Defaults table records: `docs/plans/artifacts/2026-10-06-documents-review/build/grep-names.attempt-2.log` and `docs/plans/artifacts/2026-10-06-documents-review/build/grep-path.attempt-1.log`, both exit 1.
- [x] 1.10 Through `benchmark`: run the retained-source benchmark measured (`BENCH_MEASURE=1 bun tooling/scripts/test-suite.mjs fast benchmarks/editor/benchmarks/plate-docx-retained-source-benchmark.test.ts`) at base and on the Phase 1 build, alternating base and build, five runs a side, with `uptime` logged per run. The gate, frozen now, is the exact-export line `:620` in all four cohorts plus the exact-byte guard at `:551`; every other frozen line is reported as base and build parity, not as this step's gate. Proof: the build passes `:620` in all four cohorts in every run, and exact export p95 per cohort is reported as median and range per side. A run that fails an absolute line on this shared host while its paired base fails the same way is inconclusive, never green; the step stays open with its log row `partial`. A build slower than its paired base on `:620` quarantines Phase 1's exact-path change and opens the Perf issue playbook. Done with the narrower proof the Defaults table records (word: rerun the timing gate): `docs/plans/artifacts/2026-10-06-documents-review/probes/exact-export-work-count.build.log` shows no package load and byte-identical output, where `exact-export-work-count.base.log` shows one load; the paired timing runs stay inconclusive on this shared host.

Keep when 1.2 to 1.10 pass. Revert, as the owner's call, when a surviving test or caller needs envelope state. A 1.10 quarantine keeps the cut and reopens only the exact path's timing.

### Phase 2: one root-part table

- [x] 2.1 Write the new test first in `sourcePreservation.spec.ts`: a retained source with `docProps/thumbnail.png` and unlinked custom properties at a non-standard part name, an unchanged review export that stays byte-identical, and an edited review export that omits the thumbnail with one `source-part-omitted` diagnostic of reason `invalidated` and keeps the custom properties. Proof: it fails at base in a detached worktree on the thumbnail assertion, matching `probes/stale-thumbnail-overlay.log`. Done: `docs/plans/artifacts/2026-10-06-documents-review/build/phase2-thumbnail-test.base.log` and `phase2-thumbnail-test.phase1.log`, exit 1 on the thumbnail assertion. The code quality review then cut the unchanged-export block as a duplicate of the exact-bytes test and the admission spec, switched the fixture to `importEligible` and added `docProps/app.xml` (deviation rows).
- [x] 2.2 Add `ROOT_PARTS` and `docxRootPartOnEdit` to `internal/sourceEligibility.ts`, derive `PACKAGE_VOCABULARY`, rewrite the overlay's root walk to copy only `carry` parts and track handled targets, drop the root names from `sourceOwnedPart`, and leave `import/lib/sourceEligibility.spec.ts` unchanged, because its admission test is the guard that deriving the vocabulary changes nothing. Proof: 2.1 passes, and `test:partition:docx-export` and `test:partition:docx-import` exit 0. Done: `docs/plans/artifacts/2026-10-06-documents-review/build/phase2-thumbnail-test.build.log` and `docs/plans/artifacts/2026-10-06-documents-review/build/phase2-test-partition-docx-{export,import}.attempt-1.log`, all exit 0.
- [x] 2.3 Through `benchmark`: move the retained-source benchmark's overlay probe from thumbnail relationships to header images in one passive header graph. Its three imports take `lossPolicy: 'allow'` and assert the one expected `unsupported-content` diagnostic for the header, so the policy cannot hide other loss, and its `zipLoads` values stay literals, not measurements (Open work). Proof: a correctness run with `bun tooling/scripts/test-suite.mjs fast benchmarks/editor/benchmarks/plate-docx-retained-source-benchmark.test.ts` (no `BENCH_MEASURE`), then paired measured runs of the revised fixture on the Phase 1 build and on the Phase 2 build, as in 1.10, with no budget change. Done with the narrower proof the Defaults table records (word: rerun the step 2.3 timing pairs): correctness `docs/plans/artifacts/2026-10-06-documents-review/acceptance/bench-retained-correctness.attempt-1.log`, the failing controls `docs/plans/artifacts/2026-10-06-documents-review/bench/phase2-pair/known-bad.attempt-2.log` and `docs/plans/artifacts/2026-10-06-documents-review/panel/diff-round-1/repro-benchmark-orphan-header.mutant.attempt-1.log`, the five pairs in `docs/plans/artifacts/2026-10-06-documents-review/bench/phase2-pair/`, and one measured run on the final bytes that passed every frozen line (`docs/plans/artifacts/2026-10-06-documents-review/acceptance/bench-retained-measured.attempt-1.log`).
- [x] 2.4 Through `plate-docs`: narrow `docx.mdx:243-248` and its twin to custom properties and safe header graphs, say an edited export omits the source thumbnail, and say a custom property linked to body text keeps its cached value until the linked-property fix lands. Proof: the `plate-docs` checks. Done: `docx.mdx` and its twin name custom properties and one-section headers and footers as kept, and the extended properties and thumbnail as omitted; same proof as 1.4; the linked-property claim reran on the build (`docs/plans/artifacts/2026-10-06-documents-review/probes/linked-custom-property-overlay.build.attempt-1.log`).

Keep when 2.1 to 2.4 pass. Revert when another root type turns out to need `carry`. A harness that cannot measure overlay copying is repaired through `benchmark`, never a reason to revert the fix.

### Close

- [x] Writing passes: `deslop`, then `no-comments` on product code; one `unslop` pass on docs, plans and the changeset. Done: writing rows 18:14:29Z, 18:21:27Z, 18:47:02Z and 20:01:38Z.
- [x] Panel on the diff (reviews: api-build). Done: two rounds, `docs/plans/artifacts/2026-10-06-documents-review/panel/diff-round-1/` and `diff-round-2/`.
- [x] `pnpm exec ultracite fix` and `check` on the task's files, and `pnpm exec oxlint --type-aware` on its lintable files. Done: `docs/plans/artifacts/2026-10-06-documents-review/build/ultracite-check.attempt-1.log` and `docs/plans/artifacts/2026-10-06-documents-review/acceptance/oxlint-type-aware.attempt-1.log`.
- [x] `pnpm brl`, then `pnpm check` once on the settled change. Done: `docs/plans/artifacts/2026-10-06-documents-review/acceptance/brl.attempt-1.log` and `pnpm-check.attempt-1.log`, attributed in the verify row.
- [x] Fold this plan's delta into `docs/plans/topics/documents.md` through `plan-page`, then the decision-trail review and `/pstack:reflect`. Done: `docs/plans/topics/documents.md`, trail `docs/plans/artifacts/2026-10-06-documents-review/trail/seat-sol.txt`, reflect `docs/plans/artifacts/2026-10-06-documents-review/reflect/`.


## Close

Reversals and deviations come first. Each has a row in the decision log.

- Core and extended document properties are `drop`, not `regenerate` as Main changes approved. The writer writes no `docProps/app.xml`, and its own core properties replace the source author, title and dates, so `regenerate` hid a silent drop and a silent replacement. Every edited export of a Word source now warns about both parts. The word "carry the document properties" reverses it.
- Step 2.1's approved test lost its unchanged-export block as a duplicate of the exact-bytes test and the admission spec, and requires an eligible fixture.
- Four steps closed on a narrower proof that a Defaults row accepts: step 1.4's docs proof without rendered routes, step 1.9's whole-word grep, step 1.10's package-load count instead of timing, and step 2.3's inconclusive timing pairs. Each row names the word that reopens it.
- The per-slice code quality review ran once, after Phase 2, instead of between the slices. Its findings were fixed before the writing passes.
- The owner committed part of this run mid-build as `7ad817c352`. That commit holds the specs, the benchmark, the docs and the plan; the DOCX source edits stay uncommitted. Every review diff ran from build base `cd19701029`.

What landed:

- Phase 1 deletes the hidden Plate envelope: `nativeState`, `authoredTrust`, `DocxAuthoredTrust`, the `native-data-ignored` diagnostic, `editor/authored.json`, `internal/correspondence.ts` and `export/lib/packageArtifacts.ts`. An unchanged source-aware export returns the admitted lease bytes through a discriminated `SourceExportResolution` and now also reports Plate metadata it cannot write. Docs, Chinese twins, the pending changeset, three decision pages, the scope manifest and `docs/vision/plate.md:1141-1145` teach Word revisions and comments in the file and authored JSON for exact state.
- Phase 2 adds `ROOT_PARTS` in `internal/sourceEligibility.ts`. `PACKAGE_VOCABULARY` derives from it, the overlay copies only `carry` parts, and the final sweep reports every source part the output does not carry, except a dropped root part stored under a filename-exempt path such as `word/theme/`, which only a hand-built package produces; its fix waits in the unreviewed patch. The retained-source benchmark's overlay probe uses 8 to 900 images in one header graph and checks that the body references that header.

Proof and its limits:

- Acceptance ran in a detached worktree at `7ad817c352` plus this task's DOCX and benchmark hunks: the three DOCX partitions typecheck, `test:partition:docx-export` passes 129 and `docx-import` 34 and 12, benchmark correctness passes 640 assertions, the asserting envelope probe passes in refuse mode, and one measured run passed every frozen line with 664 assertions (`docs/plans/artifacts/2026-10-06-documents-review/acceptance/`). Type-aware lint, `ultracite check`, `pnpm brl` and the bench report check pass.
- `pnpm check` passed 20 of 25 steps. The other five fail the same way at a pristine HEAD worktree with its own build (`docs/plans/artifacts/2026-10-06-documents-review/acceptance/pristine/`), or, for the knowledge step, on another session's uncommitted files, because the knowledge check passes at HEAD with only this task's files added. The registry output this task left stale was rebuilt, and every later link of the www step then passed, `build:www:ci` included.
- Two diff panel rounds ran, the cap. Round 1 applied two critical findings; round 2 applied none and dismissed one rare reporting gap. Two additive fixes wait unreviewed in `docs/plans/artifacts/2026-10-06-documents-review/panel/diff-round-2/unreviewed.patch`, and the code ships without them (word: ship all).
- Limits: no Microsoft Word or LibreOffice run; a same-process round trip reports `docProps/core.xml` omitted although the generator wrote the same bytes; the docs routes were not rendered; the timing pairs stayed inconclusive on this shared host; exact export p95 sits far above the 2026-09-15 receipt for a reason this run did not measure; a custom property linked to body text still keeps deleted text; a header whose relationship targets the thumbnail keeps that image as its own content.

Predicted benefits:

- About 740 source lines leave `platejs/docx`: held, with 875 deleted and 183 added, net 692 (`git diff --shortstat cd19701029 -- packages/platejs/src/docx` without specs).
- Two options, one exported type and one diagnostic member leave the import and export entrypoints: held.
- The stale-envelope probe's case output carries no hidden part: held.
- Every ZIP entry of every returned package passed the passive vocabulary: held by construction for the admitted lease and the output check, not reproved beyond `probes/retained-source-passes-output-check.log`.
- An edited source-aware export carries no package thumbnail: held for the thumbnail relationship; a header that uses the thumbnail image keeps it as header content.
- Exact export p95 at the pathological cohort meets 50 ms: held in one measured run at 30.93 ms.

Counts: the plan holds 14 steps. 10 are done and 4 are partial, closed on narrower proofs the Defaults table accepts; none is skipped, blocked or open.

The decision-trail review's findings are logged as trail and superseded rows, and its Attention section follows as written. Since that review, pristine-HEAD controls confirmed the five failing-step attributions, superseded rows narrowed the claims about reporting every part and passing every planned check, the linked-property row records its worst outcome, and `research` maintain ran for step 1.6.

### Attention

reviewed by gpt-6.1-sol

- Linked custom properties still retain deleted text. The dismissal needs a worst-outcome assessment.
- Missing and false omission warnings limit the “every part” claims. The Ada fixture change was removed, but earlier proof rows need superseding.
- Focused checks passed. Timing and rendered-route proofs remain narrower substitutions; the benchmark receipt represents one shared-host run.
- The five failing check steps appear outside this task, but pristine-HEAD attribution remains incomplete.
- Prerequisite skill loads were missed, and slice review ran late. Final closure gates remain pending.

Review inputs at close, checked with `git diff --stat cd19701029` on each:

- Changed by this run: `content/docs/(guides)/serializing.mdx` and `content/docs/(guides)/authored-changes.mdx` with their Chinese twins (step 1.4), `.changeset/docx-package-topology.md` (step 1.5) and `docs/vision/plate.md` (step 1.7).
- Unchanged: `VISION.md` and `docs/vision/common.md`, the method the review applied; `packages/plitejs/src/authored/format.ts`, which owns the canonical authored JSON that replaces the envelope; `docs/research/sources/docx-interoperability-oss.md`, the source comparison the subject cites; and the history records `docs/research/review-records/2026-09-27-exports-adversarial-audit-feedback.json` and `docs/plans/2026-09-27-document-conversion-architecture-corrections.md`.

Open work moves to `docs/plans/topics/documents.md` with each item's owner and stop, except the queued reflect lessons, which go to `docs/plans/topics/pstack.md`. The ledger in-flight item from the 2026-10-06 react review closes, because `review-ledger.mjs next` now skips scopes an open plan is working through.

### Reflect

`/pstack:reflect` ran after the trail review, with three Opus reviewers and an Opus synthesizer. It accepted 18 lessons, rejected 8 and put 13 in backlog. This run applied five accepted lessons in full and two in one of their two files. Eleven wait in Open work, because another session's open reflect-lessons plan holds staged edits in their files, or because they change the shared pstack source (Defaults: run lesson mode now).

Applied:

- `.agents/rules/plate-docs.mdc`: an edit to an English `content/docs` page or the root `meta.json`, where the branch's registry-generation rule allows a local build, runs `pnpm --filter www build:registry` once after the final prose pass, then `build:registry --check`, and runs each later link of a chain on its own when an earlier link is red at `HEAD`.
- `.agents/rules/benchmark/references/methodology.md`: every timing line on a loaded shared host is inconclusive whether it passes or misses, so it never rewrites a tracked receipt or accepts a target. Each measured run records the load average beside the core count, and a speed claim narrows to what a work count proves. The lesson also routed to `.agents/playbooks/perf-issue.md`, but the knowledge-reorg session rewrote that line during the panel, and this run leaves the file to it.
- `.agents/rules/benchmark.mdc`: the probe writes every cohort's measurements to an attempt-indexed log in the run directory before it asserts any line, and only a measured run that passes every line outside the loaded-host case rewrites a tracked receipt.
- `.agents/playbooks/build.md`: a step box that names a skill closes only with this build's invocation of that skill, made before the step's first edit; a step that never ran closes with `skip: <reason>`.
- `.agents/playbooks/build.md`: each slice ends, after its review fixes, by freezing its tree with `freeze.mjs` against the previous slice's commit, passing every task path that still exists in the working tree or in `HEAD`, and later paired runs start from that commit; a slice whose code quality review runs also freezes before it.
- `.agents/playbooks/build.md`: the pre-freeze lint runs `oxlint --type-aware --format=default` and compares its file count with the paths passed. The same lesson's `AGENTS.md` lint bullet is queued.
- `~/.claude/CLAUDE.md`: text edits go through the Edit tool, or a script written with the Write tool or a quoted heredoc and run from its file, never as an inline script (`-e`, `-c`, `--eval`).

Queued:

- `.agents/playbooks/plan.md`: count arena and judge consensus as one reading, and run a delegating policy label or a new type-level guarantee as a premise before the first panel.
- `.agents/playbooks/plan.md`: run the base-control dry run before the first panel freeze and again after a fix rewrites a proof command, and read every hit a zero-hit gate returns at base.
- `.agents/rules/verify/references/commands.md`: a base worktree links only `node_modules` and builds what its checks read, or its control is `partial`.
- `.agents/rules/verify/references/commands.md`: a platejs spec change runs `tsc -p packages/platejs/tsconfig.test.json` and compares its sorted errors with a base worktree.
- `.agents/rules/verify/references/commands.md`: partition typechecks run in dependency order, because a partition's result covers its own files only after every partition it references passes.
- `.agents/rules/verify/references/testing.md`: a changed test input or expectation is a change to the claim, gets its own decision row and keeps a case on the original input.
- `AGENTS.md` lint bullet: `--format=default` and the file-count comparison.
- Shared source, Panel review: a known exception narrows every universal claim it contradicts in the plan, the log and the panel intent.
- Shared source, Panel review and `decisions-check.mjs`: a dismissed critical row names its `reach:` and `worst:`, and `append` refuses a row without them.
- Shared source, `decisions-check.mjs`: `append` refuses a phase starting with `review` unless a reviewer flag is passed.
- Shared source, Plan pages and the `plan-page` description: a forced stop, such as a usage limit, publishes the page with the plan's first open gate as its next action.
- Shared source, Review: the must-still-accept case is the refused input itself with its trigger present but harmless.

Rejected, with the synthesizer's reason: scope folded in after a verdict goes back through research (already covered); public docs wait for the reviews that can change their behavior (convergence); evidence for a public removal is committed under `docs/research/probes/` (convergence); zsh's read-only `status` parameter (too specific); a shared-host rule supersedes an earlier quiet-machine row (already covered); grep the plan for quotes of a changed rule (convergence); per-process core-property timestamps (duplicate of Open work); copy verify's `commands.md` before editing it (already covered).

Backlog, each with the mechanism the synthesizer named:

- More evidence for the open reflect-lessons helpers: path refusal, batched appends, phase refusals, `reply.mjs`, `mutate.mjs`, `reread.mjs` and `proof-worktree.mjs`.
- `HEAD` moved under a proof when the owner committed mid-run: `freeze.mjs` or a proof helper warns when `HEAD` differs from the intake base.
- zsh `=word` expansion: `setopt no_equals` for Claude Code shells, or a PreToolUse hook.
- platejs spec files are never typechecked: a platejs tests partition in `pnpm check` with a shrink-only baseline.
- A red first link hides the rest of the www chains: fix the `HistoryApi` entry, and run every link and report each failure.
- Probe preload and DOM globals: split the DOM globals out of `bunTestSetup.ts` into a preload probes can load.
- The ledger link parser cuts route-group paths at the first `)`: parse balanced parentheses, with a test.
- Ticking plan boxes by hand: `plan-page.mjs --tick`, which checks the artifact exists.
- Building panel prompts by hand: `.agents/pstack/panel-prompt.mjs`.
- Skill-named step boxes: `plan-open.mjs` refuses a newly closed box that names a skill without citing its invocation.
- Proof worktrees in session scratch: `proof-worktree.mjs` defaults to the run directory and records each worktree for removal.
- Unexplained exact-export cost: a benchmark-plan row compares the final distribution with every receipt the plan cites (also in Open work).
- The oxlint `MODULE_TYPELESS_PACKAGE_JSON` warning on every run: an ESM config filename that oxlint accepts, or a filter in the lint wrapper.

The applied lessons that change a gate got one panel, Opus, Codex `gpt-6-astra` at xhigh and Codex `gpt-6.1-sol` at xhigh. Round 1, on frozen commit `c06ae093e1a287ab8f2c8ac6ebd9d277791a4aec`, applied one critical finding: the probe step wrote cohorts into its receipt before asserting, so a failing measured run would have rewritten the tracked results file. It also narrowed the docs registry row to the branch rule, moved the loaded-host verdict into the methodology, let a step that never ran close with `skip:`, and gave the slice freeze its own bullet. Round 2, on `0b7ead5b8a9785811cf75aa44e9d459b0a329008`, found no critical, so the panel stopped there, and only its narrowing fixes landed. One additive line, which copies a tracked receipt before a measured run and restores it on a loaded host, waits unreviewed in `docs/plans/artifacts/2026-10-06-documents-review/reflect/panel/round-2/unreviewed.patch`. The deferred findings are in `docs/plans/topics/pstack.md`'s Open work: a load threshold, a harness that records load, and the panel's other leftovers.

## Proof

Base controls ran in a detached worktree at `da4898bb61`:

- `test:partition:docx-export` 128 pass, `test:partition:docx-import` 34 pass in its first run and 13 in its second, and the `docx-export`, `docx-import` and `docx-internal` partition typechecks exit 0 (`docs/plans/artifacts/2026-10-06-documents-review/base/`).
- `probes/stale-envelope-injected.base-leak.log` and `.base-refuse.log`: the probe now asserts. At base, `EXPECT=leak` exits 0 because a hand-built old envelope is retained and survives an edited export with its secret, and `EXPECT=refuse` exits 1 with three assertion messages. Step 1.8 runs `EXPECT=refuse` on the build.
- `probes/stale-thumbnail-overlay.log`: an edited export keeps a source thumbnail with only `source-rewritten`. Step 2.1's test must fail the same way at base.
- `probes/retained-source-passes-output-check.log`: all 17 of the 23 tracked fixtures that `importDocx` retains pass `checkDocxOutput` on the same bytes, the premise behind returning exact bytes without a second check.
- A delete-and-typecheck spike confirmed the import sites in `docx-internal` and `docx-export`; `tsc --build` hid the `importDocx.ts` site behind the failed reference, so the explorer's cone, not the spike, lists that file's lines.

- `probes/linked-custom-property-overlay.log`: a custom property linked by `linkTarget` to a bookmark around deleted text keeps that text in the edited export's `docProps/custom.xml`, with only `source-rewritten`. It is the evidence for the Bug fix in Open work.

The benchmark pre-acceptance probe is inconclusive. In the base worktree the retained-source benchmark's measured run failed the frozen exact-export line (`:620`) in the pathological cohort at 69.1 ms against 50 ms (`docs/plans/artifacts/2026-10-06-documents-review/bench/retained-base.log`); the tracked receipt from `3e0ab4dd7d`, the commit that added the strip, shows 35.7 ms, and the 2026-09-15 receipt at `e0c1500b95` shows 0.47 to 1.87 ms before the strip existed. A target prototype that returns the lease bytes and a second base run both passed `:620` in the normal and large cohorts, then failed the overlay line `:623` in the large cohort (297 assertions against 504 in a full run), under a load average of 7.5 to 13.2 on 18 cores, so neither reached the stress or pathological cohort. A known-bad variant with a 60 ms delay failed `:620`, so the line can fail. Step 1.10 carries the decisive receipt.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Where exact review state lives | The Plate JSON file the app already saves, with no new Word export option | A Word export result that also returns the Plate JSON | add the JSON export result |
| Old Word files that still carry the hidden copy | Import reads the visible Word content, and the source keeper refuses the unknown part | A special rule that removes the hidden part so the source keeper accepts the file | keep old hidden-copy files retainable |
| The stale preview picture an edited export keeps | Fix it in this plan with one table that says what an edit does to each kept part | A separate bug fix plan | split the preview fix out |
| A second safety check on unchanged exports | No second check; the bytes passed the same check at import and cannot change after it | Check the unchanged file again at export | check exact exports again |
| A private type for checked bytes | No such type; the panel showed it cannot stop an unchecked return | A private result type that only checked bytes satisfy | add the checked bytes type |
| The timing proof for unchanged exports | Build, and prove timing with paired runs after the cut | Hold the build until a passing timing run exists | hold for the benchmark |
| Linked custom properties that keep deleted text | A separate bug fix after this plan | Fix them in this plan | fold the linked property fix in |
| Start the build after the panel | Build the reviewed plan now, without the unreviewed panel fixes | Wait for you before any code changes | hold |
| The header that points at the preview picture | Build without the header fix; it waits as an unreviewed change | Add the unreviewed header fix to the build | apply the header fix |
| A new test for the cut | No new test; a before and after probe and an existing hostile file test prove it | A new test with an old format file | add an old file test |
| Order of the work | Delete the hidden copy first, then add the table | Add the table first | table first |
| The search that proves no docs still teach the cut (step 1.9) | Whole-word searches for the four removed names and an exact search for the hidden part's path, because the reviewed search also matches unrelated names and paths elsewhere in the repository and cannot come back empty | The reviewed search with every paraphrase | use the reviewed grep |
| The timing proof for unchanged exports (step 1.10) | A deterministic count: an unchanged export now loads no package, where the base loaded one, with byte-identical output on both sides | Five paired timing runs a side that pass the 50 ms line, which this shared machine left inconclusive because the harness stops at its first missed budget | rerun the timing gate |
| The docs proof for steps 1.4 and 2.4 | The MDX source build, the docs parity script, a link check and the regenerated registry, because the edits are prose and one existing snippet | Rendering the English and Chinese routes in a www dev server | render the docs routes |
| What an edited export does with the source document properties | Leave them out and report each one, because the writer makes its own core properties and no extended properties | Copy the independent fields, such as the author and the company name, into the new file | carry the document properties |
| The timing proof for the root-part table (step 2.3) | The correctness run, the failing control and the work identity, because the timing pairs ran before the review fixes on two builds whose unchanged export code was the same, so its two missed budgets on this shared machine are noise; the review later added only a metadata check to that path | Five of five passing timing runs for the second build | rerun the step 2.3 timing pairs |
| The code that ships after the last review round | The reviewed code, with the two fixes found in the last round kept as a saved patch | Apply the saved patch without another review round | ship all |
| Reflect lessons whose files another session is editing, or that change the shared pstack source | Queue them in Open work for a sync-pstack Lesson mode run, and apply now only the lessons in files nobody else holds | Edit the other session's staged files and the shared source from this run | run lesson mode now |

## Panel gate

Plan panel. Two rounds ran, the cap. Round 1, on frozen commit `7d2f7c2d9a5c8fed141e892284905b44dbd0d52f`, ran Opus, Codex `gpt-6-astra` at xhigh and Codex `gpt-6.1-sol` at xhigh, and applied three critical findings: the admitted-bytes type could not stop an unchecked return, so Phase 3 is cut; a header path could copy the dropped thumbnail back; and linked custom properties carry deleted text, so the plan's claim narrows to the census-proved members and that member goes to a Bug fix. Round 2, on `f47d7b34f8f4bc245fe808d5a0d335f4487c1849`, found that round 1's header refusal deletes legitimate header content, so that fix is reverted and the header-path finding stays open. After the cap the plan took only subtractive changes. These additive fixes wait unreviewed in `docs/plans/artifacts/2026-10-06-documents-review/panel/round-2/unreviewed.patch`: a header-path rule that keeps the header and removes its unused relationship to the thumbnail, a grep for step 1.9 that can pass, and a benchmark harness that collects every cohort and counts package loads. The build builds the reviewed text without them, and any it needs comes in as a `look` deviation.

Diff panel (reviews: api-build). Two rounds ran, the cap. Round 1, on frozen commit `ccdde583681ef6dd10bf7b2bdd5656037bae425b` from build base `cd19701029`, seated Opus, Codex `gpt-6-astra` at xhigh and Codex `gpt-6.1-sol` at xhigh. It applied two critical findings: an omission report for a thumbnail a kept header still carried, and core properties that `regenerate` replaced without a report. It also applied the metadata warning on unchanged exports, the benchmark header check and the docs fixes, and dismissed the linked custom property leak as scoped out. Round 2, on `cbb7c0e233f3f813b06ddb48ba3f6bd48b3960d7`, found no applied critical: it dismissed a missing report for a dropped root part stored under a filename-exempt path such as `word/theme/`, which only a hand-built package produces, and narrowed a test that an unlogged fixture edit had bent. Two additive fixes wait unreviewed in `docs/plans/artifacts/2026-10-06-documents-review/panel/diff-round-2/unreviewed.patch`: the sweep reports explicit drops before filename exemptions, and the benchmark looks for the header reference inside the section.

## Evidence

Model: Claude Opus 5.5 (`claude-opus-5-5`) ran this review. Two Opus `how` explorers traced the mechanics and the consumers, and one Opus research shard read the local DOCX editors and libraries; their replies are saved under `docs/plans/artifacts/2026-10-06-documents-review/how/` and `docs/plite/research/2026-10-06-docx-native-state/`.

### Requirements

- Import a bounded, untrusted DOCX into one schema-valid document or an explicit failure, with a structured diagnostic for every loss.
- Export one captured editor revision under an explicit accepted, proposed or review projection, with Word revisions and comments as format-native output.
- Opt-in retained source returns original bytes only for an eligible unchanged export and never bypasses output safety.
- Word clipboard paste stays a separate plugin with its own entrypoint.
- Hard law, [docs/vision/plate.md](../vision/plate.md) lines 1143-1145: "A semantic interchange format carries hidden native state only for a proven current job with one unambiguous authority; exact state otherwise uses canonical persistence."
- Hard law, [docs/vision/common.md](../vision/common.md) lines 39-41: a cut justified only by "no production caller" first checks whether Vision names a job for the API. Lines 38-39: a cut that removes a safeguard shows that the step catches nothing, or names the check that covers the same failure.
- Hard law, [VISION.md](../../VISION.md) invariant 1: hard cuts over compatibility; no alias, shim or deprecated second name.
- Comment storage and Word author identity stay application-owned.
- The owner's answer for this run: "go" picked "I review DOCX again, then write a plan if removal still wins." The repository's Pursue and Autopilot rules then carry a Pursue into its plan and a panel-reviewed plan into its build; neither grants commit authority, and the owner's later "c" resumed the build.

### Lanes

- **Keep the opt-in envelope (incumbent).** Loses. Vision names no job for it (census below). The trust check is a checksum, not authentication: [sourcePreservation.spec.ts](../../packages/platejs/src/docx/export/lib/sourcePreservation.spec.ts) lines 440-480 wrap a macro package in a self-made envelope that verifies, so any producer can make hidden roots and metadata win, bounded only by schema validation. The `signature` trust kind has no producer anywhere. Both exact-reuse branches return before `checkDocxOutput` at [exportDocx.tsx](../../packages/platejs/src/docx/export/lib/exportDocx.tsx) line 595: the attach branch at lines 498-509 returns bytes it rewrote after admission, and the strip branch at lines 511-533 returns bytes JSZip repackaged, against the retained-source requirement. And the overlay path leaks edited-out text (probe below).
- **Keep and repair it.** Strip the envelope on overlay, run the output check on every path, add real signing. Loses. It fixes the leak and the bypass but keeps a second exact-state authority, a public trust API and digest machinery for a job canonical JSON already owns; each repair adds code to a path no caller uses.
- **Make the envelope survive Word saves through semantic correspondence.** Loses, as the 2026-10-04 audit found. A second matcher over Word-rewritten XML would decide which authority wins, which is more machinery for a job with no caller.
- **Return the canonical JSON beside the blob from `exportDocx`.** Loses. It is `JSON.stringify(projectAuthoredReview(editor.read.value()).review)` under a second name, a parallel path that [docs/vision/common.md](../vision/common.md) Taste forbids.
- **Hard-cut the envelope (selected, the strongest deletion).** Deletes `nativeState`, `authoredTrust`, `DocxAuthoredTrust`, the `native-data-ignored` diagnostic member, [correspondence.ts](../../packages/platejs/src/docx/internal/correspondence.ts) (248 lines) and [packageArtifacts.ts](../../packages/platejs/src/docx/export/lib/packageArtifacts.ts) (201 lines), the envelope read path in [importDocx.ts](../../packages/platejs/src/docx/import/lib/importDocx.ts) (about 216 lines), the attach and strip branches in `exportDocx.tsx` (about 60 lines), and the envelope entries in [sourceEligibility.ts](../../packages/platejs/src/docx/internal/sourceEligibility.ts) lines 4-7, 212 and 517-518 and `sourcePreservation.ts` line 246; about 740 source lines in all. The digests guard only the envelope, so removing them removes no safeguard for anything that stays. Without the vocabulary entry, a retained source that carries an envelope becomes ineligible, which closes the leak.
- **Also cut `DocxSource` retained source (largest cone).** Loses, as before. The conversion-boundary D1 gate measured 87 percent of repository fixtures eligible and byte-identical, and the first-party import and export toolbars use it. It shares no code with the envelope: exact reuse compares documents with `DocumentChange.between`, not digests (`exportDocx.tsx` lines 301-357, [source.ts](../../packages/platejs/src/docx/internal/source.ts) lines 110-119).

Proof limits: no Word or LibreOffice run (neither is installed here), so the claim that a Word save invalidates the envelope stays inferred from per-part digests; the repository holds no receipt of what LibreOffice did to the part. The consumer search covered this repository only.

### Probes

- `docs/plans/artifacts/2026-10-06-documents-review/probes/stale-envelope-overlay.ts`, run with Bun from `packages/platejs` at `da4898bb61`, with the happy-dom globals that `tooling/config/bunTestSetup.ts` installs. It exports "Secret draft clause" with `nativeState: 'attach'`, imports it with `retainSource: true` and no trust, edits the body to "Public text" and exports a review with `source`. Result: the body holds only "Public text", yet `editor/authored.json` is present and holds "Secret draft clause", and the only diagnostic is `source-rewritten`. The control, the same flow without `'attach'`, writes no hidden part. Log: `probes/stale-envelope-overlay.log`, exit 0. Cause: the root-relationship loop at [sourcePreservation.ts](../../packages/platejs/src/docx/export/lib/sourcePreservation.ts) lines 393-397 skips only the officeDocument, core and extended relationships, and the eligibility vocabulary admits the envelope.
- Pokayoke audit of the same class, parts the overlay keeps that are copies of the body. The overlay keeps every root relationship in `PACKAGE_VOCABULARY` ([sourceEligibility.ts](../../packages/platejs/src/docx/internal/sourceEligibility.ts) lines 197-213) except the three it skips: custom properties, the thumbnail and the envelope. Unlinked custom properties are application metadata, but a property linked by `linkTarget` caches bookmarked body text; the panel found that member and `probes/linked-custom-property-overlay.log` reproduces it, so it goes to a Bug fix (Open work). `probes/stale-thumbnail-overlay.ts` shows an edited export keeps `docProps/thumbnail.png` with only `source-rewritten`; the probe used a 9-byte synthetic PNG, so the stale picture a real Word thumbnail would show is inferred. Phase 2 drops that member.

### Consumers and ingress

- No production, registry, template, type-test, benchmark or browser-test path sets `nativeState` or `authoredTrust`. Only [authoredDocx.spec.ts](../../packages/platejs/src/docx/export/lib/authoredDocx.spec.ts), `sourcePreservation.spec.ts` and [importDocx.spec.ts](../../packages/platejs/src/docx/import/lib/importDocx.spec.ts) do. Docs teach them in `content/docs/(plugins)/(serializing)/docx.mdx` lines 199-210, 287, 309 and 362, its Chinese twin, `serializing.mdx` lines 123-125 and `content/docs/(guides)/authored-changes.mdx` lines 333-338, and the pending changeset `.changeset/docx-package-topology.md` line 15.
- Ingress: the registry import toolbar hands `importDocx` a raw `ArrayBuffer` from the picked file with `{ plugins, retainSource }`; the export toolbar hands `exportDocx` the model editor with `{ comments, component, lossPolicy: 'allow', projection, source, stylesheet }`. Package-integration tests and benchmarks hand raw bytes or Blobs. None depends on the envelope.
- Release history: `.changeset/pre.json` has consumed 7 changesets and not `docx-package-topology`; npm lists `platejs` 54.0.0-beta.0 and beta.1, both from June 2026; the envelope landed on 2026-09-15 (`e0c1500b95`) and became opt-in on 2026-09-27 (`3e0ab4dd7d`). No published file can carry it.
- History: the 2026-09-25 plan kept the DOCX part as "a proven format job", the 2026-09-26 cut removed the HTML and Markdown envelopes as a duplicate channel with no caller, and [the 2026-09-27 exports review](../research/review-records/2026-09-27-exports-adversarial-audit-feedback.json) deferred the DOCX cut "pending explicit disposition of the existing single-file exact-round-trip job". That job appears only in plans, records, docs and the changeset; [VISION.md](../../VISION.md) and `docs/vision/**` never name it. Nobody called the envelope a workaround, so no `why` pass was needed before the cut.

### Predicted benefits

The build's Close marks each one held or falsified.

- About 740 source lines leave `platejs/docx`, measured by the build's diff stat over `packages/platejs/src/docx`.
- Two options, one exported type and one diagnostic member leave `platejs/docx/import` and `platejs/docx/export`.
- The stale-envelope probe's case output carries no hidden part after the cut.
- Every ZIP entry of every returned package passed the passive vocabulary, at import for exact reuse and at export otherwise. This narrows the review's first wording, "no export path returns before `checkDocxOutput`" (decision log, deviation row); bytes outside the ZIP entries, such as an archive comment, are not covered (Open work).
- An edited source-aware export carries no source thumbnail.
- Exact export p95 at the pathological cohort meets the frozen 50 ms line again once the strip is gone; step 1.10 measures it.

### Performance

- applicability: applied, narrowed to the one-shot DOCX export path; no editor interaction, rendering or native-behavior surface changes.
- Vercel rules used: none; no React or Next code changes.
- questions answered: cohorts, repeated unit, interaction latency (as export latency), memory; style and layout, rare state, readiness, native behavior and page load do not apply because only package bytes change.
- repeated unit: a root part and its closed graph in a retained package (the benchmark builds 8 to 900).
- cohorts: the retained-source benchmark's normal, large, stress and pathological cohorts (`plate-docx-retained-source-benchmark.test.ts:58`).
- budgets: the frozen lines unchanged, including exact export p95 at most min(50 ms, 50 percent of the matched semantic export p95) (`:601-604`).
- React/runtime primitives: none.
- interaction metrics: import, exact export and edited overlay p95 by cohort, from the benchmark.
- trace/CWV proof: not applicable; no page-load or browser claim.
- memory tags: the benchmark's RSS delta lines stay as they are.
- degradation contract: none; no degraded mode.
- dashboard/RUM gap: lab-only claim.
- plan delta: steps 1.10 and 2.3 carry measured base and candidate receipts; the pre-acceptance probe above is inconclusive under machine load.

### Arena synthesis

Three runners answered `docs/plans/artifacts/2026-10-06-documents-review/arena/prompt.md` read-only through `.agents/pstack/cross.mjs`: Opus, Codex `gpt-6-astra` at xhigh and Codex `gpt-6.1-sol` at xhigh. All three converged on the cut plus one root-part rewrite table with the thumbnail dropped on edit. An Opus cross-judge scored Opus 17, Astra 14 and Sol 14 (`arena/judge.txt`), and the lead's own reading agreed on the base.

- Base: Opus. Cut first, no second check on the exact path, a private admitted-bytes brand, and a runtime probe instead of a committed test for the cut.
- Grafts from Astra: the discriminated `SourceExportResolution`; the non-standard custom-properties name and the unchanged-export byte identity in the Phase 2 test; the `docx.mdx:243-248` overlay edit.
- Grafts from Sol: `serializing.mdx:50` and its twin name DOCX; both exact branches bypass the check today; the benchmark's `zipLoads: 0` at `:675` is false at base; delete the revision benchmark's `:328` no-op outright.
- Rejected: Astra's and Sol's second check on the exact path (`retainDocxSource` already ran the same predicate on the same immutable bytes, and a second read lands on the path with the tightest budget); their committed regression for the cut (it fails at base only when it names the removed relationship type); their helper renames.
- Losing cases handled: Sol's forwarding probe of `checkDocxOutput` calls has no job without a second check; Astra's and Sol's point that a table-first order survives a revert of the cut is answered by making that revert the owner's call.
- Challenge delta: improved. The review's target gained a second deleted member of the stale-copy class (the thumbnail) and one root-part list in place of three. The arena's third phase, a private type for checked bytes, was cut in panel round 1.
- Deviations: the verdict's third Defaults row moved from a separate plan to folding the thumbnail fix in, and the checkDocxOutput benefit was narrowed; both have decision-log rows.

### Reconciliation

- `2026-10-04-documents-audit` (head): retains. Its target stands, and this review adds the confirmed leak, the forgeable trust check and the output-check bypass as evidence.
- `2026-09-15-documents-retained-source-implementation`, `2026-09-15-documents-retained-source-reassessment`, `2026-09-15-documents-retained-source-final-reassessment` and `2026-09-15-documents-canonical-conversion-implementation`: retains. Their retained-source and canonical-conversion targets are live, and this cut leaves `DocxSource` intact.
- `2026-09-14-documents-oss-fidelity-review` and `2026-09-14-documents-final-reassessment`: retains. Their one-import, one-export and diagnostics targets are live in source.
- Executions `2026-09-18-recovered-2026-09-15-docx-retained-source-preservation`, `2026-09-18-recovered-2026-09-14-docx-canonical-conversion-contract`, `2026-09-18-recovered-2026-09-14-documents-api-research-review` and `2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit`: retains. The work they record is in source and nothing here reverts it.
- Plans [2026-09-15-docx-retained-source-preservation.md](2026-09-15-docx-retained-source-preservation.md), [2026-09-14-docx-canonical-conversion-contract.md](2026-09-14-docx-canonical-conversion-contract.md), [2026-09-14-documents-api-research-review.md](2026-09-14-documents-api-research-review.md) and [2026-09-07-full-plate-ui-extraction-audit.md](2026-09-07-full-plate-ui-extraction-audit.md): retains, as landed history. [2026-09-04-move-docx-export-presentation-to-registry.md](2026-09-04-move-docx-export-presentation-to-registry.md) (`ready_for_completion`) and [2026-07-11-plate-next-docx-docx-io-emoji-package-reviews.md](2026-07-11-plate-next-docx-docx-io-emoji-package-reviews.md): retains as historical; neither touches the envelope.
- [2026-09-27-document-conversion-architecture-corrections.md](2026-09-27-document-conversion-architecture-corrections.md), which kept the envelope "while the exact round-trip job exists": superseded on that point, because no such job exists in Vision, source or any caller.

### Ledger counts

From `node tooling/scripts/review-ledger.mjs status` on 2026-10-06 at `da4898bb61`: 67 scopes, 0 unreviewed, 0 fork, 32 pursue-not-adopted, 1 deferred (`search`), 34 closed and 0 unowned. Queue order puts `plite-view` (with `react`) at 7 and `documents` at 11; units 8 to 10 have no open scope.

### Freshness

The 2026-10-04 audit pins 86 inputs; hashed against the live tree, 16 changed and 2 are missing. The scope changes since then are seven removed casts and one lint comment in `importDocx.ts`, type changes in `packages/plitejs/src/interfaces/editor.ts`, a TOC test that now checks exported DOCX XML, and two benchmark edits; none changes what `nativeState` or `authoredTrust` do. The hidden-native-state sentence reads the same at `docs/vision/plate.md:1143-1145` and at `fe0e9599a6:docs/vision/plate.md:871-873`.

## Open work

- `packages/platejs/src/static/authoredHtml.spec.tsx:37` asserts a removed name, and `benchmarks/editor/benchmarks/plate-docx-revision-import-benchmark.test.ts:428-436` asserts on source text; both are `test-audit` candidates. owner: zbeyens, tracked here. stop: `test-audit` runs on them, or the owner drops them.
- An edited export drops the source core and extended properties, which loses the source file's author, title, created date, company and manager; both omissions are reported (`sourcePreservation.ts:594`). owner: zbeyens, tracked here. stop: a `documents` review decides whether either part needs a carry rule or a writer, or the owner drops it.
- Linked custom properties keep deleted body text in an edited export (`probes/linked-custom-property-overlay.log`). Route: the Bug fix playbook, test first, fixing the overlay's custom-properties rule so a property with `linkTarget` is dropped or regenerated while unlinked properties stay. owner: zbeyens, tracked here. stop: the fix lands with a regression test that fails at base on that probe's case, or the owner drops it.
- `readBoundedDocxPackage` keeps bytes the vocabulary never inspects, such as an archive comment and per-entry comments and extra fields, and exact reuse returns them (panel rounds 1 and 2, Opus seat; the per-entry part is inferred from zip.js source). owner: zbeyens, tracked here. stop: the reader rejects those bytes, or a review accepts the gap.
- The eligibility vocabulary admits any number of custom-properties and thumbnail root relationships, while OPC allows one of each per package. owner: zbeyens, tracked here. stop: `ROOT_PARTS` carries a cardinality, or a review accepts the gap.
- The `zipLoads` values in the retained-source benchmark's receipt are hand-written literals; `zipLoads: 0` for exact export was false while the strip existed. The overlay work row's four package load counts are constants written the same way. owner: zbeyens, tracked here. stop: the harness counts package loads, as the unreviewed patch proposes, or a review accepts literals.
- The `source-part-omitted` reason `invalidated` covers a dropped root part, including core properties that the generator replaces, and source comments omitted because `options.comments` was absent, so code that switches on `reason` cannot tell them apart, and its name fits core properties poorly. owner: zbeyens, tracked here. stop: a caller needs to tell them apart, or the owner drops it.
- The DOCX writer stamps its core-property creation and modification dates once per process (`export/lib/internal/constants.ts:124`, `:144`), so every export after the first carries stale dates, and a same-process round trip reports `docProps/core.xml` omitted although the generator wrote the same bytes. owner: zbeyens, tracked here. stop: the writer stamps a fresh date per export, or the owner drops it.
- A kept header whose relationship targets the thumbnail part keeps that image as its own content, although the package thumbnail relationship is dropped; the plan panel's header-path fix waits unreviewed, as `docs/plans/2026-10-06-documents-review.md`'s Panel gate records. owner: zbeyens, tracked here. stop: a reviewed fix removes the unused relationship while keeping legitimate header content, or the owner drops it.
- Exact reuse compares only the main and named roots, not `meta`, so an authored change that touches only `meta.authored` could reuse stale revisions; no such operation was found, so the risk is unverified. owner: zbeyens, tracked here. stop: a `documents` review shows no authored operation changes `meta` alone, or the exact check compares it.
- The overlay's final sweep still uses `sourceOwnedPart` as a second hand-kept list beside `ROOT_PARTS`, so admitted main-document parts such as `word/people.xml` report as unreachable instead of regenerated or dropped. owner: zbeyens, tracked here. stop: main-document parts get disposition rows, or a review accepts the list.
- The diff panel's two unreviewed fixes, in `docs/plans/artifacts/2026-10-06-documents-review/panel/diff-round-2/unreviewed.patch`, wait for review. owner: zbeyens, tracked here. stop: the owner applies them after another round, or drops them.
- Exact export p95 reads 1.83 to 30.93 ms in the final measured run against 0.47 to 1.77 ms in the 2026-09-15 receipt, while overlay export matches its old receipt, so host noise does not explain the gap; the work that still runs before the exact branch returns, such as the export capture and the document comparison, is the likely cost but is not measured. owner: zbeyens, tracked here. stop: a perf-issue run explains the gap and keeps or removes it, or the owner drops it.
- Eleven accepted reflect lessons, and the `AGENTS.md` half of a twelfth, wait unapplied; the Close's Reflect section lists each with its target file. owner: zbeyens, tracked in `docs/plans/topics/pstack.md`'s `## Open work`. stop: the open reflect-lessons Lesson mode run (`docs/plans/2026-10-06-reflect-lessons.md`) or a new sync-pstack Lesson mode run lands them, or the owner drops them.

Every item above except the last moves to `docs/plans/topics/documents.md`'s `## Open work` when this plan folds; the last is a workflow item and lives in `docs/plans/topics/pstack.md`.


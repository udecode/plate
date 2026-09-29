# Lane D1: DOCX loss policy, retained-source eligibility and output checks

Status: phases one and two complete; accepted by the lead on 2026-09-29.

- **Gate decision: keep exact-source retention.** 20 of 23 repository DOCX fixtures (87%) are positively eligible, and all 20 export byte-identical through exact reuse.
- **Phase two:** DOCX static output passes the shared URL decision before the writer reads it, and the written package passes the passive vocabulary before export returns it.

Plan: [conversion boundary adoption](../../../../../plans/2026-09-28-conversion-boundary-adoption.md), sections A2, A6, "Exposure, defaults and loss", "Safety at existing boundaries", "Retained DOCX source", D5 and D6. Source identity: `HEAD` `a7750ad388` plus this lane's working-tree changes on `next`, 2026-09-29.

## Public behavior

- `exportDocx` takes `lossPolicy?: 'allow' | 'reject'` (default `'reject'`). The success/failure result is unchanged; an invalid value throws `TypeError`.
- `importDocx` with `retainSource: true` returns `source: DocxSource | null`. A null source comes with a `source-unavailable` warning (`reason: 'ineligible'`) whose `part` names the first part exact reuse cannot admit. `exportDocx` accepts `source: DocxSource | null`.
- Export removes unsafe and relative link destinations and keeps their text (warning), omits images DOCX cannot embed and keeps their alt text (content loss), and withholds written output outside the passive vocabulary (`invalid-package` error).

## Phase one decisions

1. **Loss classification (A2).** One post-projection classifier in `exportDocx.tsx` promotes content loss to errors under `reject`: `resource-omitted`, `unsupported-content` with `action: 'dropped'`, and `lossy-content` except `named-root` and `document-metadata`. Omitted named roots and metadata stay warnings under every policy, matching HTML (`html-unsupported-root`/`-metadata`) and Markdown (`markdown-unsupported-root`/`-metadata`). The classifier is a negative list, so a future content-loss emitter fails closed. Revision-wrapper `replaced` diagnostics and source diagnostics stay warnings.
2. **Intended projection exclusion.** An `accepted` export drops a comment when `projectAuthoredRange` finds none of its annotated content in that projection, as Word does when a suggestion is rejected. It reports an `authored-lossy-projection` warning, not loss. Unanchored, invalid or unrendered comment ranges remain content loss.
3. **Registry export passes `lossPolicy: 'allow'`.** The menu always completes the download and reports problems as toasts ("Exported with N warnings" and its own count of unattached comment threads). `reject` would turn a dropped comment, or an omitted remote image, into a refused download. `allowRemoteImages` stays off in the registry, so export adds no network permission. Package callers keep the fail-closed default.
4. **Closed eligibility vocabulary (`docx/internal/sourceEligibility.ts`).**
   - Markup is inspected in the existing single SAX pass of `readBoundedDocxPackage` (new `xmlVocabulary`). Relationship and content-type helpers moved from `sourcePreservation.ts` to `docx/internal/packageParts.ts` and are shared.
   - Parts: every part must be reached from `_rels/.rels` through admitted relationships, so unreferenced parts are refused. Each needs an admitted content type; XML content types must sit on inspected XML part names; raster parts must match their byte signature (AVIF, BMP, GIF, JPEG, PNG, WebP).
   - Package root relationships: the main document (it must be `word/document.xml` and the only one, because import decodes that part), core, extended and custom properties, a raster thumbnail, and the Plate envelope.
   - Main document relationships: styles, stylesWithEffects, settings, webSettings, fontTable, numbering, theme, header, footer, footnotes, endnotes, comments, commentsExtended, commentsIds (the writer's URI and Word's `2016/09` URI), commentsExtensible, people, internal raster images, and hyperlinks (phase two). Headers, footers, notes and comments admit internal raster images and hyperlinks.
   - Markup: closed element namespaces (W, W14, W15, W16cid, W16cex, DrawingML main/picture/wordprocessingDrawing, wps, mc, OMML, VML/Office/w10, thm15, and the OPC and property namespaces). Refused elements: `w:altChunk`, `w:object`, `w:control`, `o:OLEObject`, `w:subDoc`, `w:attachedTemplate`, `w:attachedSchema`, `w:mailMerge`, `w:saveThroughXslt`, `w:frameset`. VML `href`/`src`/`althref` attributes and every XML processing instruction are refused.
   - Fields: `w:fldSimple@w:instr`, and complex-field `instrText`/`delInstrText` including nesting, must equal `PAGE` after trimming. Unbalanced fields are refused. `PAGE \* MERGEFORMAT` is refused, per the plan's "exact PAGE".
   - A DOM parse failure of a SAX-admitted part counts as unverified, not an import error.
5. **Admission basis.** Each admitted item is passive by specification: no execution, no fetch, and external reach only through a relationship that is closed separately. Each is evidenced by the writer, the preservation tests, the licensed corpus, or (for Word's comment family) Word's spelling of the writer's own comment parts. `sourceEligibility.spec.ts` backs each family.
6. **Construction invariant.** `DocxSource` is constructible only through `retainDocxSource`, which runs the check, so exact reuse and the source overlay only ever see checked bytes. The plan's interim "regenerate until proven" state is structural.
7. **Native envelope idempotency.** Exact reuse with `nativeState: 'attach'`, on a source that already carried an envelope, wrote two `[Content_Types].xml` overrides and two authored relationships (reproduced; OPC allows one override per part). `addAuthoredDocxEnvelope` now replaces the old declarations. A real test asserts one of each, an eligible output and a trusted re-import.

## Phase two decisions

8. **Output preparation (`prepareDocxOutput`, new `docx/export/lib/outputSafety.ts`).** It runs on the final static HTML, after review projection and comment preparation, before the writer.
   - Anchors: a destination is written only if `decideUrl('navigation', href)` passes and the target is absolute (`isDocxHyperlinkTarget`), because Word has no document base. `#bookmark` links stay Word anchors. An unsafe or relative `href` becomes a span that keeps its label, formatting and any heading-bookmark id, reported as `unsupported-content` `unwrapped` (a warning under both policies). An anchor without a destination becomes a span without a diagnostic; this also stops the writer's empty-`Target` relationships.
   - Images: `decideUrl('image', src)` plus the DOCX loader policy. `data:` bytes must sniff as PNG, JPEG, GIF or BMP and are relabeled by their signature. `http(s)` is fetched only with `allowRemoteImages`; this pass is now the only fetcher, and `exportHtmlToDocx` no longer forwards the option to the writer. Relative, blob, unsafe and unfetchable sources, and WebP, AVIF, SVG or other formats, are omitted. Each leaves its alt text and reports `resource-omitted` (content loss).
   - It returns the original HTML untouched when nothing changes.
9. **Written-output check (`checkDocxOutput`).** The final package, after comments, overlay and native envelope, must pass `findDocxSourceViolations`. Otherwise export returns `ok: false` with an `invalid-package` error naming the part. Malformed written XML is reported the same way. Output limits are unbounded because the package is our own.
   - Evidence: the writer's raw `data-equation-omml` sink writes a live `DDEAUTO` field into `document.xml` when the writer is called directly. Through `exportDocx`, static rendering currently drops that markup, so the check is defense in depth, proven directly in `outputSafety.spec.ts`.
10. **Retained hyperlinks.** Eligibility admits external hyperlink relationships whose target passes `isDocxHyperlinkTarget`; internal hyperlink relationships and every other external relationship stay refused. The header/footer overlay keeps such hyperlinks. `javascript:`, relative and other unsafe targets still leave `source` null.
11. **Writer defects fixed.** A link kept only its first child, so " bold" and any later text were silently dropped; every child is now kept. GIF and BMP media were written without a content type, which makes an invalid package; the content-types template now declares `bmp` and `gif`.
12. **Import.** No `docx/**` change. `importDocx` calls only `compileHtmlElementDecoder`, which runs `prepareHtmlDocument`, so html-safety's whole-tree pass reaches DOCX import there. DOCX import maps each `HtmlMappingLoss` to `unsupported-content` with the same `action`, and under `reject` it rejects every action except `unwrapped`. So an href removal that keeps its label must be reported as `unwrapped`, or `importDocx` adapts once the loss carries an impact field.

## Deletion gate

Corpus: every tracked `.docx` in the repository (23 files in `apps/www/src/__tests__/package-integration/docx/`). No external corpus was downloaded.

Legal basis:

- 15 are byte-identical to pandoc's `test/docx` fixtures (GPL-2.0-or-later), compared by SHA-256 against the local `../pandoc` clone.
- 3 share pandoc fixture names with different bytes, probably older pandoc revisions; the clone is shallow, so this is unverified.
- 5 were added by the repository owner in 2021-2022 with no recorded origin.

Local measurement of lawfully held files is permitted for all 23.

| Tier | Eligible | Share |
| --- | ---: | ---: |
| Pandoc byte-identical (verified license) | 13 / 15 | 87% |
| + pandoc-named | 16 / 18 | 89% |
| All repository fixtures | 20 / 23 | 87% |

Ineligible:

- `alternate_document_path`: main document at `word/document2.xml`; import also fails.
- `legal`: field `FILENAME`, also `NUMCHARS`.
- `links`: a `customXml` bibliography store. Its two external hyperlinks pass since phase two.

All 20 eligible fixtures import with a list, table and link plugin set, retain a source, and export byte-identical (`summary.exactReuse` 20/20).

Decision: eligible files are well above half of realistic third-party (Word-authored) fixtures at every tier, so retention stays and the changeset is `patch`.

**Interpretation fork.** A vocabulary limited to parts the current writer emits admits 0 of 23 fixtures: every Word fixture carries `docProps/app.xml` vectors and VML shape defaults in `settings.xml`. That reading would trigger deletion. The plan requires inspecting headers, notes and comments, which only makes sense if passive notes and comments can be admitted, and it keeps exact reuse as a real fidelity job for Word files. So the vocabulary admits specification-passive items with fixture evidence.

**Supplementary, not the gate basis.** The same check over nine already-cloned sibling repositories, with nothing downloaded: `../pandoc`, `../mammoth.js`, `../docx`, `../docxjs`, `../python-docx`, `../docx-editor`, `../eigenpal-docx-editor`, `../docx-redline-js`, `../docx-cli`.

- 314 of 464 files (68%) are eligible; 184 of 285 Word-authored files (65%).
- Top first blockers:
  - `customXml` data stores (47);
  - Happy DOM parse refusals (18), including 15 python-docx files with single-quoted XML declarations that browsers accept, so this share is a lower bound;
  - `TOC` fields (9);
  - `a14` drawing extensions (7);
  - orphaned styles parts (6);
  - nonstandard property relationship URIs;
  - web-extension task panes (4);
  - `SEQ` fields (3);
  - EMF images (3).
- The repository corpus is small 2008-2016 feature fixtures and overstates modern eligibility. The supplementary share is the better estimate of ordinary third-party impact, and it is still above half.

## Commands and results

Run from the repository root unless noted; all results are from the final code.

| Command | Result |
| --- | --- |
| `pnpm --filter platejs test:partition:docx-export` | 128 pass, 0 fail (baseline 107) |
| `pnpm --filter platejs test:partition:docx-import` | 34 + 13 pass, 0 fail (baseline 10 + 12) |
| `pnpm --filter platejs test:partition:docx-paste` | 15 pass, 0 fail |
| `pnpm --filter platejs test:partition:docx-html` | 9 pass, 0 fail |
| `pnpm --filter platejs typecheck:partition:{docx-internal,docx-import,docx-export,docx-paste,docx-html}` | all exit 0 |
| `pnpm --filter platejs typecheck:contracts` | exit 2 only on the formats lane's `parseHtmlSlice` `@ts-expect-error` lines; D1 contracts clean |
| `tsc --noEmit -p tsconfig.json` and `-p tsconfig.package-integration.json` (in `apps/www`) | no D1 errors; remaining errors in `markdownConversion.ts`, `markdownSafety.ts` and `HtmlPlugin.ts` (other lanes, mid-edit) |
| `bun --config=bunfig.toml test` on the export and import toolbar specs and `docx-source.spec.tsx` | 1, 2 and 1 pass |
| `bun --config=bunfig.toml test packages/platejs/src/docx/import/lib/importDocx.slow.tsx` | 5 pass (real Mammoth) |
| `bun --config=bunfig.toml test apps/www/src/__tests__/package-integration/docx.roundtrip.slow.tsx` | 5 pass; the TOC `renderStaticHtml` test fails outside DOCX |
| `bun test ./docs/research/probes/2026-09-28-conversion-boundary/lanes/d1/eligibility-measurement.test.ts` | 2 pass; writes `results.json` (sha256 `bb2d8306…`) and `supplementary.json` (`fb469d43…`) |
| `npx oxfmt` / `npx oxlint` on D1 files | formatted; lint exit 0 |

Real, unmocked proof:

- `sourcePreservation.spec.ts` (export partition, 15 tests):
  - byte-exact passive source;
  - envelope strip and envelope replace;
  - overlay keeps the passive header and image;
  - safe hyperlinks survive exact reuse and the header overlay;
  - six hostile variants return `source: null` and regenerate: macro, signature, external relationship, `javascript:` hyperlink, unreferenced part, `INCLUDEPICTURE`;
  - trusted native state cannot resurrect an ineligible source;
  - multi-section omission, disposal, fallbacks.
- `sourceEligibility.spec.ts` (import partition, 24 tests): the vocabulary, including safe, script and relative hyperlinks.
- `exportDocx.spec.ts`:
  - loss policy: dropped comment, metadata warning, null source, invalid policy;
  - output safety: links, images, remote fetch.
- `outputSafety.spec.ts` (4 tests): writer output accepted; injected DDE field, written script hyperlink and malformed XML withheld.
- The mocked `importDocx.spec.ts` covers only option handling and the null-source diagnostic.

## Outside D1 (not fixed)

- Safety probe (`safety/probe.test.ts`):
  - `retained-exact-js-link` and `custom-component-data-href` are now closed, so their expectations fail by design.
  - `export-default-js-link` throws because the Link schema rejects the stored URL.
  - Import cases still show a dropped label and a captured `javascript:` until html-safety's pass reaches `compileHtmlElementDecoder`.
  - Its `results.json` was restored after each run.
- `docx.roundtrip.slow.tsx`, "pairs TOC links…": `renderStaticHtml` renders no `<a>`; no DOCX code involved.
- `pnpm --filter www typecheck` stops at the stale-registry `build:registry --check`; nothing tracked was written.

## Open gaps

- **Unreachable writer fetch paths.** The writer's own image-fetch code in `xml-builder.ts` can no longer run from `exportDocx`; delete it.
- **Default link rendering.** Package-default static link rendering emits `<div href>`, not `<a>`. Exports without an app link component lose destinations without a diagnostic; that belongs to static rendering.
- **Comment-body links.** Hyperlinks inside comment bodies leave dangling relationship ids in `comments.xml` (pre-existing).
- **Vocabulary candidates**, each needing fixtures: `PAGE`/`NUMPAGES` with formatting switches, `TOC` fields, `a14`/`wp14`/`w16se`, `customXml` bibliography stores, glossary documents.
- **Writer comment URIs.** The writer's `commentsIds` relationship URI omits Word's `/2016/09/`, and its comment content types use `application/vnd.ms-word.*`. Word may ignore Plate's durable comment IDs; this needs Word verification.
- **Unreachable preservation denylist.** `activePart`/`activeClaim` in `sourcePreservation.ts` can no longer fire for an eligible source.
- **Import-side policy.** Import still rejects lossy property repairs; A2 scoped only export. Import safety depends on html-safety's pass and the `unwrapped` contract.
- **Missing GPL notice.** The 18 pandoc-derived fixtures carry no GPL-2.0-or-later notice in the repository.
- **Test-environment strictness.** Happy DOM rejects single-quoted XML declarations that browsers accept, so eligibility in tests can be stricter than in browsers. This errs toward `null`.

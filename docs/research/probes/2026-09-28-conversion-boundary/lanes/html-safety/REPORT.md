# Lane html-safety: S2 HTML safety and S3 HTML transfer

Date 2026-09-29, branch `next`. Scope: `packages/platejs/src/lib/plugins/html/**` and `docs/research/probes/2026-09-28-conversion-boundary/lanes/html-safety/**`. No commits and no staging by me; the autostage hook staged some lane files. No edits outside this scope.

## Status: editing stopped

My last edits were at 01:23:52 (`HtmlPlugin.ts`), 01:24:01 (`htmlConversion.ts`) and 01:24:24 (`htmlTransfer.spec.ts`). I am not editing any file now. Final SHA-1 of each file:

| File | SHA-1 |
| --- | --- |
| `HtmlPlugin.ts` | 93348e2e |
| `htmlAst.ts` | a3339c3d |
| `htmlSafety.ts` | 84d36531 |
| `htmlConversion.ts` | 08dee927 |
| `htmlSafety.spec.ts` | 975f7a93 |
| `htmlTransfer.spec.ts` | cd467940 |
| `HtmlPlugin.mapping.spec.ts` | 3d69b0a9 |

I will not touch the items you took: Markdown script-media parity, the Link and MediaEmbed decoders' unreported drops, and `html.mdx`/`.cn.mdx`.

## 1. One decision by sink role

The new internal `htmlSafety.ts` makes every decision through the shared `decideUrl`:

| Sink | Role / action |
| --- | --- |
| `href`, `xlink:href` | navigation floor |
| `img src`, any `poster` | image |
| `iframe`/`frame` `src` | embed |
| every other `src` (`video`, `audio`, `source`, `track`, `input`) | media |
| `action`, `formaction`, `srcset` | removed |
| `on*`, `srcdoc` | removed |
| `style` loading a resource | removed |
| `base`, `embed`, `link`, `meta`, `object`, `script`, `style`, non-HTML namespaces | element and subtree removed |

- A style loads a resource when it uses `url(`, `image-set(`, `src(` or `@import`, including CSS-escaped spellings such as `u\72 l(`. Escaped CJK font names stay.
- Surrounding HTML whitespace (tab/LF/FF/CR/space) is stripped from URL attributes, and the attribute keeps the cleaned value. Mappings therefore read the value the schema validators accept. Empty values stay inert.
- Deleted duplicates:
  - `htmlAst.ts`: `isSafeUrl`, `UNSAFE_URL`, `SAFE_IMAGE_DATA_URL`, `URL_ATTRIBUTES`, `CSS_RESOURCE`, `CONTENT_URL_ATTRIBUTES`.
  - `HtmlPlugin.ts`: `isSafeHtmlUrl`, `HTML_URL_ATTRIBUTES`, `HTML_UNSAFE_URL_RE`, `HTML_SAFE_IMAGE_DATA_URL_RE`, `isSafeDecodedElement`, `assertSafeStyleValue`.
- A small control-character loop remains only for CSS values, because the lint rule `no-control-regex` forbids a regex.

## 2. Full source before any mapping

- `parse`/`parseSlice`, HTML paste and Word paste: the parse5 source pass runs before materialization. When any `prepareDocument` rule is installed, a DOM pass runs again after preparation and before decoding.
- `compileHtmlElementDecoder` (DOCX import): a DOM pass runs before preparation, and again after it when preparation rules exist.
- `isSafeDecodedElement` and its silent `return []` are deleted.
- The DOM pass walks `childNodes` like the decoder, so a form control named `children` cannot hide a subtree from the pass but not from the decoder.

## 3. Removal is always reported

- Every removal reports `html-unsafe-content` with `impact`, and lossy follows `lossPolicy`.
  - A navigation removal keeps its label and is lossless.
  - A resource removal is lossless only for a script URL (`javascript:`/`vbscript:` after the browser's tab/newline stripping, so `java&#9;script:` counts).
  - Any other rejected resource is lossy: `data:video`, an SVG data image, a relative or `about:` iframe, a protocol-relative image.
- An `img` whose `src` is removed becomes its alt text, as a browser shows it; this matches the Markdown fallback.
- DOCX (D1 contract): the compiled decoder reports through the existing `HtmlMappingLoss`. Lossless removals use `action: 'unwrapped'` and lossy ones use `'dropped'`.
  - importDocx therefore keeps a label-preserving href removal as a warning and rejects lost media under reject.
  - No `impact` field is needed on `HtmlMappingLoss`.
  - A lossless element removal (`script`, `meta`) also arrives as `unwrapped`, which is policy-correct.

## 4. Output check

- When a semantic export emits a value that fails its sink, the attribute or CSS declaration is removed and reported as `html-unsafe-content` with a `model` location. It no longer throws `Plate HTML node spec has unsafe URL attribute`.
- Unsafe names (`on*`, `srcdoc`, invalid attribute or style names, unsafe tags) still throw as mapping bugs.
- Style-channel `url()` values use the image role.
- Clipboard HTML is not written when anything was removed.

## 5. S3: HTML transfer reports

- `decodeHtmlDataTransfer` and the registered `text/html` format share `decodeHtmlTransferWithArtifact`. When they return a slice, they call `context.report` once per diagnostic of that `allow` parse.
  - Impact comes from the diagnostic's own `impact` when present.
  - Otherwise it is lossless for `html-parser-recovery` and lossy for everything else, such as `html-unsupported-content` (dropped/replaced/unwrapped).
- Null delegation stays quiet: parse failure, HTML that only repeats `text/plain`, or nothing insertable.
- Word paste spreads its own context, so its reports belong to the Word attempt.
- `decodeHtmlDataTransfer` is now public through `platejs/html` (your entrypoint). Its JSDoc no longer says `@internal` and states the slice-and-report or quiet-null contract.

## 6. S3: detached slice cut

- `parseHtmlSlice` and `parseHtmlSliceWithDocument` are deleted from `htmlConversion.ts`, along with their unused imports.
- `parseHtml`, `parseHtmlWithDocument`, `serializeHtml` and `parseHtmlSliceWithEditor` (backing `editor.api.html.parseSlice`) remain.
- `src/html/html.spec.ts` needed no expectation changes.

## 7. Scale fixes found during proof

- Tree locations were computed eagerly for every decoded element (`Array.prototype.indexOf` over the parent's children), which is quadratic in sibling count. They are now computed only when a diagnostic needs one. A 392 KB `parseSlice` dropped from 4,174 ms to 542 ms.
- The parse5 source pass rebuilds each child list once instead of calling `splice`/`unshift` per removal.

## Files

Source and specs, in `packages/platejs/src/lib/plugins/html/`:
- `htmlSafety.ts` (new, internal): `decideHtmlElement`, `decideHtmlAttribute`, script-URL impact, CSS resource detection with escape decoding, and the `sanitizeHtmlDom` DOM pass.
- `htmlAst.ts`: source pass on the shared decisions, alt fallback, linear child rebuild.
- `HtmlPlugin.ts`: DOM passes around preparation; compiled-decoder sanitization; output remove-and-report (`onUnsafe` threaded through `compileWrites`, `compileNodeSpec`, `applyPatch` and `compileWrapperSpec`); transfer `report()`; lazy tree locations.
- `htmlConversion.ts`: detached slice functions deleted.
- `htmlSafety.spec.ts` (new, 10 cases):
  - obfuscated href removed in the source pass, label kept
  - the real `BaseVideoPlugin` figure no longer reads an unsafe child `src`; lossy `data:` media is rejected under reject and warns under allow
  - image alt fallback
  - URL whitespace normalization with `BaseLinkPlugin`
  - CSS escape and `image-set` removal, with an escaped CJK font kept
  - re-sanitizing after `prepareDocument` writes an unsafe href and a `<script>`
  - compiled decoder: parent mapping sees `ABSENT`, loss is `unwrapped`
  - compiled decoder: SVG loss is `dropped`
  - output remove-and-report for href, `action`/`formaction`/`srcset` and raw `style`
  - output loss policy for a lossy `src`
- `htmlTransfer.spec.ts` (new, 3 cases): unsafe-href paste reports one lossless diagnostic and keeps the label; dropped-image paste reports one lossy; delegation (nothing insertable, or plain-text-equal HTML) reports nothing.
- `HtmlPlugin.mapping.spec.ts`: the CSS case expects 2 lifecycle reports (unsafe names) instead of 7, plus value removals reported through `api.html.serialize`. The frame case expects a parsed `safeFrame` without `src` and a lossless diagnostic instead of the old silent `[]`. Its fixture decoder omits absent attributes, and it expects 3 lifecycle reports instead of 6.

Lane folder, `docs/research/probes/2026-09-28-conversion-boundary/lanes/html-safety/`:
- `probe.test.ts`: copy of the safety probe with adjusted paths, a `PROBE_OUTPUT` override and lane assertions.
- `results-before.json`: before my change, with your validators already in.
- `results.json` and `probe.log`: after.
- `paste-result.test.tsx`/`.json`: mounted `EditorContent onPasteResult`, end to end.
- `traversal-cost.test.ts`/`.json`, `hostile-removals.test.ts`/`.json`, `hostile-removals-vs-head.json`.

## Commands and exact results (repository root)

| Command | Result |
| --- | --- |
| `bun test ./packages/platejs/src/lib/plugins/html ./packages/platejs/src/html` | 121 pass, 0 fail, 414 expects, 8 files |
| `bun test` over the 37 platejs spec files that exercise HTML, paste or DOCX (DOCX import/paste/export, link, media, list, table, static clipboard, `markdownPasteResult`, `PlateContent-paste-result`) | 617 pass, 0 fail, 2,047 expects |
| `PROBE_OUTPUT=results.json bun test ./docs/research/probes/2026-09-28-conversion-boundary/lanes/html-safety/probe.test.ts` | 56 observations, 1 pass, 27 expects |
| `bun test ./docs/research/probes/.../lanes/html-safety/paste-result.test.tsx` | 1 pass, 2 expects |
| `bun test .../traversal-cost.test.ts .../hostile-removals.test.ts` | 2 pass |
| www `core-html/HtmlPlugin.slow.tsx` + 5 `core-static-html/*.slow.ts(x)` | 12 pass, 17 fail; the failing set is identical to my pre-change baseline |
| `bun test ./packages/platejs/src/lib/plugins/html/HtmlPlugin.mapping.slow.ts` | 1 pass, 3 fail; identical to baseline |
| `npx tsc -p packages/platejs/tsconfig.json --noEmit` | 0 non-spec errors; 206 spec errors package-wide, 4 in this folder, all pre-existing in files I didn't touch (`HtmlPlugin.spec.ts` `.data`, `HtmlPlugin.mapping.slow.ts` `timeout`) |
| `npx tsc -p packages/platejs/tsconfig.type-tests.json --noEmit` | 0 errors |
| apps/www `tsc --noEmit -p tsconfig.package-integration.json` | 0 errors |
| apps/www `tsc --noEmit -p tsconfig.json` | 1 error, `markdown/lib/internal/markdownSafety.ts:76` (yours); none in HTML files. No reference to `HTML_UNSAFE_URL_RE` or `HTML_URL_ATTRIBUTES` remains, so D1's errors were a mid-edit state. |
| `npx oxfmt --check` and `npx oxlint` on the 7 changed files | clean |

## Receipts

`paste-result.json` (mounted paste through `onPasteResult`):
- `unsafeHref` inserts text `Before LABEL After` and reports `[{inserted:true, diagnostics:[{impact:'lossless', message:'Removed unsafe HTML attribute "href" from <a>.'}]}]`.
- `droppedImage` inserts text `Keep` and reports `[{inserted:true, diagnostics:[{impact:'lossy', message:'Plate HTML decode has no mapping for <img>.'}]}]`.
- Unobserved check: `<meta charset='utf-8'><p>Hello</p>` reports `[{impact:'lossless', message:'Removed unsafe HTML element <meta>.'}]`.

`traversal-cost.json`: happy-dom; each row is `<p style>` with a link and an image, plus a list item with an obfuscated href; the whole parse runs once, the passes are medians of five. EditorKit subset: Image, Link, List.

| Blocks | Bytes | DOM pass | parse5 + source pass | Whole `parseSlice` |
| --- | --- | --- | --- | --- |
| 250 | 48,060 | 6.9 ms | 5.1 ms | 120.6 ms |
| 1,000 | 193,560 | 8.8 ms | 12.2 ms | 302.2 ms |
| 2,000 | 391,560 | 9.3 ms | 22.1 ms | 542.4 ms |

Before the lazy-location fix, the whole parse measured 226.6 ms at 250 blocks, 1,109.7 ms at 1,000 and 4,173.6 ms at 2,000. A 4,000-block run (788 KB) took 17,346 ms. Plain paragraphs with no plugins took 37, 88 and 313 ms at 500, 1,000 and 2,000 siblings; a standalone `indexOf` path loop cost 67, 269 and 1,206 ms at 1,000, 2,000 and 4,000 siblings.

`hostile-removals.json`: alternating `<p onclick>` and `<script>` siblings, `parseHtmlAst` only; each pair gives 2 diagnostics.

| Pairs | Bytes | Time |
| --- | --- | --- |
| 5,000 | 195,000 | 22 ms |
| 10,000 | 390,000 | 35 ms |
| 20,000 | 780,000 | 82 ms |
| 33,000 | 1,287,000 | 195 ms |

`hostile-removals-vs-head.json`: same input in one process against the HEAD source pass, after vs before.

| Pairs | After | Before |
| --- | --- | --- |
| 5,000 | 22 ms | 26 ms |
| 10,000 | 47 ms | 55 ms |
| 20,000 | 146 ms | 184 ms |
| 33,000 | 353 ms | 438 ms |

Before is `results-before.json`, taken from HEAD plus your validators before my change. After is `results.json`.

Legend:
- Codes drop the `html-` and `markdown-` prefixes; `W` means warning and `E` means error.
- `threw` means the case threw an exception.
- Rows 1–5 and 51 are Markdown, rows 28–39 and 50 fail schema admission, and rows 52–55 cover clipboard and DOCX export. Those rows are other lanes' behavior and appear only for completeness.

| # | Observation | Before | After |
| --- | --- | --- | --- |
| 1 | `markdown/link-js` | ok "LABEL" [unsafe-content:W:lossless] | ok "LABEL" [unsafe-content:W:lossless] |
| 2 | `markdown/image-js` | fail [unsafe-content:E:lossy] | fail [unsafe-content:E:lossy] |
| 3 | `markdown/video-js` | fail [unsupported-node:E:unwrapped] | fail [unsupported-node:E:unwrapped] |
| 4 | `markdown/script` | fail [unsupported-node:E:replaced] | fail [unsupported-node:E:replaced] |
| 5 | `markdown/image-png` | ok image(data:image/png;base64,iVBOR…):"" [none] | ok image(data:image/png;base64,iVBOR…):"" [none] |
| 6 | `html/link-js/reject` | ok "Before LABEL After" [unsafe-content:W:lossless] | ok "Before LABEL After" [unsafe-content:W:lossless] |
| 7 | `html/link-js/allow` | ok "Before LABEL After" [unsafe-content:W:lossless] | ok "Before LABEL After" [unsafe-content:W:lossless] |
| 8 | `html/link-control/reject` | ok "Before  After" [none] | ok "Before LABEL After" [unsafe-content:W:lossless] |
| 9 | `html/link-control/allow` | ok "Before  After" [none] | ok "Before LABEL After" [unsafe-content:W:lossless] |
| 10 | `html/script-event/reject` | ok "SAFE" [unsafe-content:W:lossless, unsafe-content:W:lossless] | ok "SAFE" [unsafe-content:W:lossless, unsafe-content:W:lossless] |
| 11 | `html/script-event/allow` | ok "SAFE" [unsafe-content:W:lossless, unsafe-content:W:lossless] | ok "SAFE" [unsafe-content:W:lossless, unsafe-content:W:lossless] |
| 12 | `html/svg-content/reject` | fail [unsafe-content:E:lossy] | fail [unsafe-content:E:lossy] |
| 13 | `html/svg-content/allow` | ok "SAFE" [unsafe-content:W:lossy] | ok "SAFE" [unsafe-content:W:lossy] |
| 14 | `html/image-svg/reject` | fail [unsafe-content:E:lossy, schema-repair:W:lossless] | fail [unsafe-content:E:lossy, schema-repair:W:lossless] |
| 15 | `html/image-svg/allow` | ok "" [unsafe-content:W:lossy, schema-repair:W:lossless] | ok "" [unsafe-content:W:lossy, schema-repair:W:lossless] |
| 16 | `html/image-png/reject` | ok image(data:image/png;base64,iVBOR…):"" [none] | ok image(data:image/png;base64,iVBOR…):"" [none] |
| 17 | `html/image-png/allow` | ok image(data:image/png;base64,iVBOR…):"" [none] | ok image(data:image/png;base64,iVBOR…):"" [none] |
| 18 | `html/image-blob/reject` | ok image(blob:https://example.test/id):"" [none] | ok image(blob:https://example.test/id):"" [none] |
| 19 | `html/image-blob/allow` | ok image(blob:https://example.test/id):"" [none] | ok image(blob:https://example.test/id):"" [none] |
| 20 | `html/href-blob/reject` | ok "LABEL" [none] | ok "LABEL" [unsafe-content:W:lossless] |
| 21 | `html/href-blob/allow` | ok "LABEL" [none] | ok "LABEL" [unsafe-content:W:lossless] |
| 22 | `html/video-data/reject` | fail [unsafe-content:E:lossy, schema-repair:W:lossless] | fail [unsafe-content:E:lossy, schema-repair:W:lossless] |
| 23 | `html/video-data/allow` | ok "" [unsafe-content:W:lossy, schema-repair:W:lossless] | ok "" [unsafe-content:W:lossy, schema-repair:W:lossless] |
| 24 | `html/video-blob/reject` | ok video(blob:https://example.test/id):"" [none] | ok video(blob:https://example.test/id):"" [none] |
| 25 | `html/video-blob/allow` | ok video(blob:https://example.test/id):"" [none] | ok video(blob:https://example.test/id):"" [none] |
| 26 | `html/video-control/reject` | threw: Plate HTML mapping "video" returned invalid property "url". | ok "CAPTION" [unsafe-content:W:lossless] |
| 27 | `html/video-control/allow` | threw: Plate HTML mapping "video" returned invalid property "url". | ok "CAPTION" [unsafe-content:W:lossless] |
| 28 | `html-egress/link-js/reject` | threw: Editor element property "url" fails custom property validation. | threw: Editor element property "url" fails custom property validation. |
| 29 | `html-egress/link-js/allow` | threw: Editor element property "url" fails custom property validation. | threw: Editor element property "url" fails custom property validation. |
| 30 | `html-egress/image-js/reject` | threw: Editor element property "url" fails custom property validation. | threw: Editor element property "url" fails custom property validation. |
| 31 | `html-egress/image-js/allow` | threw: Editor element property "url" fails custom property validation. | threw: Editor element property "url" fails custom property validation. |
| 32 | `html-egress/video-js/reject` | threw: Editor element property "url" fails custom property validation. | threw: Editor element property "url" fails custom property validation. |
| 33 | `html-egress/video-js/allow` | threw: Editor element property "url" fails custom property validation. | threw: Editor element property "url" fails custom property validation. |
| 34 | `html-egress/image-png/reject` | ok "<figure class=\"editor-image\"><img src=\"data:image/png;base6…" [none] | ok "<figure class=\"editor-image\"><img src=\"data:image/png;base6…" [none] |
| 35 | `html-egress/image-png/allow` | ok "<figure class=\"editor-image\"><img src=\"data:image/png;base6…" [none] | ok "<figure class=\"editor-image\"><img src=\"data:image/png;base6…" [none] |
| 36 | `html-egress/image-blob/reject` | ok "<figure class=\"editor-image\"><img src=\"blob:https://example…" [none] | ok "<figure class=\"editor-image\"><img src=\"blob:https://example…" [none] |
| 37 | `html-egress/image-blob/allow` | ok "<figure class=\"editor-image\"><img src=\"blob:https://example…" [none] | ok "<figure class=\"editor-image\"><img src=\"blob:https://example…" [none] |
| 38 | `html-egress/video-data/reject` | threw: Editor element property "url" fails custom property validation. | threw: Editor element property "url" fails custom property validation. |
| 39 | `html-egress/video-data/allow` | threw: Editor element property "url" fails custom property validation. | threw: Editor element property "url" fails custom property validation. |
| 40 | `link-render-vs-data` | render attrs={} | render attrs={} |
| 41 | `paste/html` | inserted=true "Before LABEL After" | inserted=true "Before LABEL After" |
| 42 | `paste/markdown` | inserted=true "LABEL" | inserted=true "LABEL" |
| 43 | `paste/word` | inserted=true "Before LABEL After" | inserted=true "Before LABEL After" |
| 44 | `docx/default/reject` | ok "Before  After" [none] | ok "Before LABEL After" [unsupported-content:W:unwrapped] |
| 45 | `docx/custom/reject` | ok captureParagraph{captured:javascript:alert(1)}:"Before  After" [none] | ok captureParagraph{captured:ABSENT}:"Before LABEL After" [unsupported-content:W:unwrapped] |
| 46 | `docx/default/allow` | ok "Before  After" [none] | ok "Before LABEL After" [unsupported-content:W:unwrapped] |
| 47 | `docx/custom/allow` | ok captureParagraph{captured:javascript:alert(1)}:"Before  After" [none] | ok captureParagraph{captured:ABSENT}:"Before LABEL After" [unsupported-content:W:unwrapped] |
| 48 | `html/custom-comparator` | ok captureParagraph{captured:ABSENT}:"Before LABEL After" [unsafe-content:W:lossless] | ok captureParagraph{captured:ABSENT}:"Before LABEL After" [unsafe-content:W:lossless] |
| 49 | `docx/safe-control` | ok, link `https://example.test/` kept, "Before LABEL After" [none] | same |
| 50 | `docx/export-default-js-link` | threw: Editor element property "url" fails custom property validation. | threw: Editor element property "url" fails custom property validation. |
| 51 | `markdown/script-allow` | ok "<script>alert(1)</script>" [unsupported-node:W:replaced] | ok "<script>alert(1)</script>" [unsupported-node:W:replaced] |
| 52 | `clipboard-egress/link-js` | written=text/html+text/plain html="<p><span>LABEL</span></p>" | written=text/html+text/plain html="<p><span>LABEL</span></p>" |
| 53 | `clipboard-egress/image-js` | written=text/plain html="" | written=text/plain html="" |
| 54 | `docx/retained-exact-js-link` | import "Before  After" [source-unavailable:W]; export rels no script target | import "Before LABEL After" [unsupported-content:W:unwrapped, source-unavailable:W]; export rels no script target |
| 55 | `docx/custom-component-data-href` | ok [none] rels has unsafe target | ok [unsupported-content:W:unwrapped] rels no unsafe target (D1's export check, not this lane) |
| 56 | `html/custom-component-data-href-comparator` | threw: Plate HTML node spec has unsafe URL attribute "href". | ok "<a>CUSTOM</a>" [unsafe-content:W:lossless] |

## Probe outcome in this lane's scope

- Fixed:
  - `html/link-control` and `html/href-blob` keep the label and report it.
  - `html/video-control` no longer throws; it keeps the caption.
  - `docx/default` keeps the label; `docx/custom` sees `ABSENT` and keeps the label.
  - The custom data-href export returns `<a>CUSTOM</a>` with a diagnostic.
- Unchanged: `svg-content`, `image-svg` and `video-data` still fail under reject and warn under allow; the `png` and `blob` resources still pass; `paste/html` and `paste/word` still keep the label.
- The 27 lane assertions encode these outcomes.

## Behavior changes to review

- An unsafe style-channel value is removed and reported as lossy instead of throwing. This covers `;`, braces, comments, escapes, controls, `image-set(`/`src(` and unsafe `url()`. In the clipboard encoder these values no longer reach the lifecycle error sink, and the HTML MIME is still skipped.
- A custom encoder that emits `srcset`, `action`, `formaction` or a resource-loading raw `style` now has it removed and reported. The old output check skipped them.
- Source-pass diagnostics are in document pre-order. Before, a descendant's removal was listed ahead of its ancestor's attribute removal.
- New: the image alt-text fallback, and normalization of surrounding URL whitespace.
- Paste reports include lossless removals. Browser and Google Docs clipboard HTML usually starts with `<meta charset>`, so most rich pastes now carry one lossless "Removed unsafe HTML element <meta>." Either confirm the paste toast ignores lossless reports, or skip lossless reports for non-rendering metadata in transfer.

## Open gaps (not in this lane's scope)

1. You took three items: Markdown parity with HTML for script media sources, the Link and MediaEmbed decoders' unreported drops, and the `html.mdx`/`.cn.mdx` safety text. For the docs: an image keeps its alt text, a removed destination keeps its label, export reports `html-unsafe-content` instead of throwing, and paste reports reach `onPasteResult`.
2. HTML does not apply A2 yet: unsafe style removal is lossy, so it fails under `reject`.
3. D1:
   - DOCX comment decoding passes a detached wrapper, so `prepareDocument` runs on the Mammoth document rather than the comment. This is pre-existing.
   - A dedicated DOCX code or an `impact` field for unsafe removals is optional; the current actions already give the right policy.
4. Unchanged here:
   - Clipboard `text/plain` carries raw URLs from unvalidated slices (row 52).
   - Serializing a document that holds an unsafe URL throws `EditorSchemaValidationError` at admission (rows 28–39, 50).
   - `test/public-package-import-smoke.slow.ts:142,145` still expects `parseHtmlSlice` from `platejs/html` and `platejs/html/server` (yours).
5. Pre-existing, not chased:
   - `HtmlPlugin.mapping.slow.ts`: 3 failures, because its benchmark figure mapping does not claim the `<img>` child ("no mapping for `<img>`").
   - www:
     - `core-html` link `target` (A2)
     - static-renderer markup (marks, attributes, render hooks)
     - `serialize-html.roundtrip`
   - `docx.roundtrip.slow.tsx` TOC href (static renderer).
   - Spec type errors in `HtmlPlugin.spec.ts` and `HtmlPlugin.mapping.slow.ts`.
   - Running every platejs spec in one bun process gives 144 React/AI failures. A sample of four of those files (`PlateContent`, `PlateContent-paste-result`, `NodeSelection`, `useAIChat`) passes 50/50 when run alone.

I've stopped editing. The seven lane files are yours now, with the hashes listed in Part 1/4.

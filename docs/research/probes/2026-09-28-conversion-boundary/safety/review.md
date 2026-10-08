# Conversion-boundary safety review

Date: 2026-09-28. Status: Complete. Method: Best API Review / Redesign from First Principles. Model: GPT-6. Scope: bounded source review and package probes, not a browser exploit audit. Branch checked before writing: `next`. All writes are inside this artifact directory. No product, tests-tree, documentation-owner, review-ledger, Git index, commit, or task-message changes.

**Pursue one private, role-aware safety policy owned by Plate.** Current conversion acceptance does not imply safe persisted URLs, and DOCX does not always inherit the public HTML parser's checks. Keep the format-specific APIs and diagnostics. A universal URL ban, a public SafetyPlugin, or URL rules in neutral Plite persistence would be the wrong target.

The user job is to import, paste and export supported content with truthful acceptance/loss results, preserving legitimate links and media while preventing unsafe active output. Required distinctions are format versus rendering, model versus emitted artifact, navigation versus media resource, and safety removal versus visible loss. The existing requirement to preserve a DOCX source exactly is also distinct from returning a sanitized package.

## Decisive results

The exact source inputs and commands are in `probe.test.ts`; all 56 named observations, including documents, diagnostics, strings and exceptions, are in `results.json`.

| Boundary | Observed result | Meaning |
| --- | --- | --- |
| Markdown link, image and registered video ingress/egress | `ok:true`; stored `javascript:` URL survives serialization. Link parsing only reports lossless inline-spacer repairs; image/video have no diagnostics. | Markdown grammar/schema admission is not URL safety admission. |
| Markdown unmapped script | Default rejects; `lossPolicy:'allow'` returns the literal `<script>…</script>` as text with a warning. | Unsupported raw HTML handling differs from registered tags and mapped URL fields; accepting this text is not executing HTML. |
| HTML ordinary script href | Both loss policies accept; remove href, retain `Before LABEL After`, warn `html-unsafe-content`, `impact:'lossless'`. | Sanitization can be a successful conversion. |
| HTML tab-obfuscated href | `java&#9;script:alert(1)` produces `Before  After`, `ok:true`, `diagnostics:[]` under both policies. | The later element guard silently drops visible label text. |
| HTML registered video figure | A child video with the same tab-obfuscated scheme persists as `url:'java\tscript:alert(1)'`; `ok:true`, no diagnostics. | A real parent media mapping reads the child before its guard; this is not just a hypothetical custom plugin. |
| HTML visible SVG / SVG image data / video data | Default rejects; `allow` accepts the reduced document with lossy warnings. | Loss policy changes acceptance of omissions, not the safety of the forbidden source. |
| HTML raster PNG data image / blob image / blob video | Accepted with no diagnostics. Blob href under default Link mapping is unwrapped to label text. | URL roles intentionally have different policies. A PNG MIME/base64 syntax match does not prove image bytes, and a blob URL is not portable persistence. |
| HTML export of script link | `<p></p>`, `ok:true`, no diagnostics, under both policies. | Link encoder returns null; label loss is not reported. |
| HTML export of script image/video or video data | Throws `Plate HTML node spec has unsafe URL attribute "src".` under both policies. | These are exceptions, not `ok:false` loss-policy results. |
| DOCX ordinary script hyperlink | Real generated DOCX + real Mammoth: `ok:true`, no diagnostics, `Before  After`. | Partial HTML element checks apply, but the public parser's attribute removal and text preservation do not. |
| DOCX custom parent mapping | Persists `captured:'javascript:alert(1)'` under both policies with no diagnostics. Same mapping via public HTML sees `captured:'ABSENT'` and retains LABEL. | Custom DOCX mappings can see unsanitized descendant attributes. No mocked converter or product edit is involved. |
| DOCX regenerated with default package rendering | No script hyperlink relationship in output; LABEL remains. | This narrow rendering result is not evidence that imported/stored data was sanitized. |
| DOCX retained exact export | Import document has no LABEL/URL, but unchanged review export returns original `Target="javascript:alert(1)"`, with no import/export diagnostics. | Retained-source output bypasses regenerated rendering. Source fidelity is not package sanitation. |
| DOCX caller rendering | Caller component emits `data:text/html;base64,SGVsbG8=` href; DOCX relationship retains it, no diagnostics. Equivalent semantic HTML mapping throws on href. | Export DOCX uses static rendering and the DOCX writer, not semantic HTML encoding. Trusted application components are not an untrusted-code sandbox. |
| HTML / Word paste | Synthetic DataTransfer insertion succeeds and retains `Before LABEL After` without the unsafe link. | Word paste routes through the HTML transfer parser, unlike DOCX file import. |
| Markdown paste | Insertion succeeds and persists the unsafe link URL. | Paste behavior depends on negotiated format. |
| Clipboard external-format output | Unsafe link: Markdown retains URL, HTML is `<p></p>`, plain text includes URL. Unsafe image: HTML MIME is absent, Markdown/plain remain. | A safe/absent HTML MIME does not certify other clipboard formats. Plain text containing a URL is not active content. |

## Source trace (repository-relative paths and exact lines)

### HTML

- `packages/platejs/src/lib/plugins/html/htmlAst.ts:26` defines blocked elements; `:35` lists URL attributes; `:54` blocks literal javascript/vbscript schemes; `:56` allows only base64 avif/bmp/gif/jpeg/png/webp on image src. `:299` trims but does not reject embedded controls. `:348` recursively removes unsafe nodes/attributes; `:390` also removes handlers, srcdoc, srcset and resource-bearing styles; `:405` assigns loss impact; `:505` runs this pass before materialization.
- `packages/platejs/src/lib/plugins/html/HtmlPlugin.ts:415` separately rejects controls; `:428` repeats the URL policy; `:442` only checks the current element's attributes. `:1909` returns `[]` for an unsafe element without calling the loss reporter. `:1932` invokes a structural decoder before descendant decoding, so a parent mapping can inspect an unchecked child. These duplicate policies already disagree.
- `HtmlPlugin.ts:3436` is public parse → AST safety → materialization → mapping. `:3360` promotes lossy unsafe-content warnings to errors under reject; lossless removals remain accepted. `:2215` checks outgoing attributes and `:2235` throws for unsafe URLs; `:2868`/`:2878` treats null encode as empty output. `:3512` returns semantic HTML results, with `reportMappingErrors:false` at `:3535`; thrown safety errors therefore escape.

### Real link/image/video mappings and rendering

- `packages/platejs/src/features/link/lib/BaseLinkPlugin.ts:153` defaults to http/https/mailto/tel. `:235` declares URL as a required string, not a safety-refined property. `:249` validates HTML href; `:261` sanitizes HTML output, returning null at `:268`; `:281` copies Markdown URL into the model and `:305` exports it. `:319` computes safe render attributes without mutating the element. `a7750ad388b2d4626c0a4eef2d3e0e23454010f4:packages/platejs/src/lib/utils/sanitizeUrl.ts:6` uses URL parsing and supplied schemes, while allowing internal `/`/`#` forms. Link options also deliberately expose an unsafe-sanitization escape hatch; default behavior is the scope of the main probes.
- `packages/platejs/src/features/media/lib/image/BaseImagePlugin.ts:122` reads the child image in a figure; `:138` emits its URL as src; `:194` reads Markdown image URLs unchanged; `:208` reads the registered img tag's src; `:231` owns its Markdown encoding.
- `packages/platejs/src/features/media/lib/BaseMediaPlugin.ts:26` declares media URL as a string; `:36` reads src or a first source child. Real video mappings are `:625` (figure decoder), `:636` (HTML encoder), `:664` (bare video decoder), and `:690` (Markdown decode/encode). The persisted-control-URL probe uses these mappings unchanged.
- `packages/platejs/src/features/media/lib/media-embed/BaseMediaEmbedPlugin.ts:25` adds http/https URL filtering for HTML embeds, while its Markdown mapping at `:155` copies src. This is source inspection, not an additional embed probe.
- Copied UI: `apps/www/src/registry/components/editor/link-static.tsx:15` calls link getAttributes, as does live `link.tsx:49`; `media-image.tsx:85`, `media-image-static.tsx:27`, and `media-video-static.tsx:24` pass the stored media URL into a rendered resource. React/browser processing of those values does not rewrite canonical documents. No claim of executed JavaScript or native browser behavior is made here.

### Markdown

- `packages/platejs/src/markdown/lib/internal/markdownConversion.ts:538` parses/maps, fits and asserts a document; `:655` asserts and serializes. The demonstrated URL properties satisfy the string schemas. Actual behavior comes from the installed feature mappings, not a generic rule that every Markdown HTML-like construct is executable or safe.
- `packages/platejs/src/markdown/lib/MarkdownPlugin.ts:213` converts a parse result to slice/null; `:223` registers Markdown transfer decode/encode, and `:250` registers the text/plain interpretation. The probe uses the real MarkdownPlugin with real Link/Image/Video plugins.

### DOCX

- `packages/platejs/src/docx/import/lib/importDocx.ts:220` uses DOMParser; `:288` captures `compileHtmlElementDecoder`, `:304` calls it. `:1202` calls real Mammoth, `:1273` omits images with a resource diagnostic, `:1282` performs Word cleanup, and `:1288` directly decodes that DOM. It does not call public parseHtml/parseHtmlAst.
- `HtmlPlugin.ts:3160` captures DOCX's decoder; `:3186` prepares the document and `:3197` calls the compiled mapper. It inherits the per-element guard, not the whole-tree AST cleanup. Both the default silent loss and the custom parent observation follow from this exact distinction.
- `importDocx.ts:1491` promotes visible-loss diagnostics under reject; `:1700` checks schema and `:1705` applies loss policy. A silent drop or unreported copied string cannot be rejected by this policy. The optional trusted native-state path at `:1686` can select a corresponding native document before schema assertion; it is a separate trust path, not an HTML sanitization guarantee (not probed).
- `packages/platejs/src/docx/export/lib/exportDocx.tsx:224` uses `renderStaticHtmlWithOverrides`; `packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx:41` renders React markup. `packages/platejs/src/docx/export/lib/exportHtmlToDocx.internal.ts:28` owns wrapping/inlining this markup and `:48` invokes the DOCX writer, not serializeHtml.
- `packages/platejs/src/docx/export/lib/internal/xml-builder.ts:1607` reads a rendered anchor href and `:1628` puts it into an external relationship without the semantic HTML URL gate. Image fetching has a separate http/https check at `:234`, and data image handling at `:401`; those are resource-specific checks, not a hyperlink sanitizer. No network-fetch behavior was tested.
- `exportDocx.tsx:266` checks source/schema/document/projection/options correspondence; `:439` takes the exact-source branch. `:454` removes only the authored envelope before returning the source blob. The variable named `sanitized` does not signify URL sanitization. Rewritten-source preservation has separate external-relationship exclusions (`sourcePreservation.ts:250`, `:508`); that does not sanitize the exact-source branch. Existing exact-fidelity behavior is retained as a distinct contract, not silently declared universally safe.

### Clipboard/paste

- `packages/platejs/src/docx/paste/lib/WordPastePlugin.ts:384` prepares Word HTML and `:389` calls `decodeHtmlDataTransfer`. `HtmlPlugin.ts:3023` performs AST safety; `:3038` uses allow for paste and `:3044` returns slice/null, discarding the richer result. Generic HTML paste uses the same route.
- `HtmlPlugin.ts:3125` registers clipboard HTML. Encoding collects mapping losses, returns null on loss at `:3147`, and handles ReportedHtmlEncodeError at `:3149`. `packages/plitejs/src/dom/plugin/data-transfer-format.ts:747` negotiates decode candidates; `:778` consumes slice/null; failures continue; `:798` skips uninsertable content. `:828` encodes each MIME, catches errors at `:866`, and returns written MIME names. This current source has no rich accepted/rejected loss report at that boundary; historical report claims are not current proof.
- The exact internal clipboard channel is separate: `packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts:735` reads an envelope to slice/invalid/absent; `:761` writes exact slices and caller formats. This is model transport, not the HTML parser. Static copying at `packages/platejs/src/static/internal/writeStaticSelectionClipboardData.ts:381` supplies rendered HTML/plain text and the exact model slice. These last paths were traced, not driven through an OS clipboard/native selection.

## Design judgment

Strongest target, proposed ownership flow:

`format input → format syntax admission → shared Plate safety decisions by semantic role → feature mapping → schema/fitting + format diagnostics`

`document or retained source → format-specific output projection → shared Plate safety decisions at active output sinks → encoded artifact + truthful loss/result`

One private Plate owner should consolidate control/scheme normalization and baseline role decisions used by HTML ingress/egress and built-in Markdown/link/media/DOCX adapters. Navigation href, raster image src, video/audio source, and provider embed are different roles. Preserve intended internal links, feature-approved schemes, raster data and blob resources where the destination supports them. Keep HTML node/attribute/CSS traversal and DOCX package/relationship traversal in their format adapters; do not force Markdown or DOCX through an HTML round trip. Resource lifetime and fetch permission remain separate concerns.

Apply a complete input pass before a mapping can inspect descendants, and recheck emitted active fields after callbacks where the format promises safe output. Feature mappings select the semantic role; do not recursively ban arbitrary model strings named `url`. Trusted custom mappings can manufacture arbitrary model data, so a helper alone cannot promise every custom field is sanitized. Rendering guards remain necessary for directly loaded documents and trusted extension output.

Make removal explicit in each format's existing diagnostics. Preserve label/fallback content when possible; report actual loss and honor reject. Consolidating URL predicates alone does not fix silent `return []`, null encoders, slice/null report erasure, or retained-source trust semantics. Exact DOCX preservation must remain explicitly distinct from a sanitized-export guarantee; decide that contract rather than silently changing source bytes.

| Alternative | Verdict |
| --- | --- |
| Keep/configure existing guards | Reject: reproduced control-normalization disagreement, pre-mapping gap, silent losses and cross-MIME persistence remain. |
| Shared private Plate policy, format-owned adapters and feature roles | Pursue: removes duplicated safety decisions at demonstrated production boundaries without a public abstraction. |
| One blanket URL allowlist / prohibit all data and blob | Reject: contradicts working image/video roles and configured navigation semantics. |
| Enforce all URL rules in Plite schema/persistence | Reject: neutral substrate cannot infer semantic roles or output contexts from arbitrary strings. Retain structural admission there. |
| Route every format through HTML or add a conversion/SafetyPlugin framework | Reject: adds lossy intermediate representation/public machinery, does not solve exact-source output or trusted mappings. |
| Rendering-only sanitization | Reject as a conversion guarantee: stored data and Markdown/DOCX/clipboard artifacts survive it. Keep it as output defense. |

Next owner, recommendation only: `$task design plan conversion-boundary`. First resolve the shared role policy and the guarantees of retained/custom output and loss outcomes together. No downstream implementation was authorized by this review.

## Prior work and limits

`node tooling/scripts/review-ledger.mjs lookup conversion-boundary` returned `[]`. Related exports lookup points to `2026-09-27-exports-adversarial-audit-feedback` and later execution records including `2026-09-28-conversion-correctness-guarantees` and `2026-09-28-paste-proof-and-media-html`; lookup marks proof stale. Retain format-owned APIs, visible-loss distinctions, and the need to consolidate ingress. Reopen only blanket safety/loss closure: the current source and probes contradict it. The old completion receipts still describe their original tested trees. No history or ledger was edited, per the explicit artifact-only scope.

The user's final steering supplies a companion property-probe finding: both formats miss own-label loss (HTML coverage accounting; Markdown merely reading a property suppresses diagnostics). This review independently reproduces HTML label loss, but did not run or inspect that companion Markdown property probe. Treat the companion finding as supplied evidence, not an additional result in the 56-case safety run. It reinforces that shared safety predicates alone cannot repair conversion loss accounting.

All four requested units reviewed; none excluded or left without a direction. This is a bounded counterexample review, not exhaustive protocol fuzzing, an execution exploit claim, a full DOCX resource audit, a custom-plugin sandbox, or proof of Safari/Word/OS clipboard behavior. Package probes use Bun with the repository's Happy DOM preload. Default DOCX export was tested with package plugins, not the complete copied EditorKit. Static UI and internal slice transport are source traces. No native/browser app, benchmark, Autoreview helper, independent worker or other task was used. Structured Autoreview was not run on next under branch policy.

## Reproduction and receipts

From the repository root:

```sh
git branch --show-current
# next (run before artifact writes)

bun test ./docs/research/probes/2026-09-28-conversion-boundary/safety/probe.test.ts > docs/research/probes/2026-09-28-conversion-boundary/safety/probe.log 2>&1
```

Final output:

```text
bun test v1.3.12 (700fc117)
Wrote 56 observations to docs/research/probes/2026-09-28-conversion-boundary/safety/results.json
 1 pass
 0 fail
 10 expect() calls
Ran 1 test across 1 file. [1203.00ms]
```

The pass means the defect observations were reproduced, not that safety passed. Seven expected semantic HTML throws are captured in JSON. Clipboard image encoding also logs its expected lifecycle error in `probe.log` and continues other formats.

`bunfig.toml` loads `config/plite-source-aliases.ts`, then `tooling/config/bunTestSetup.ts`, with `tooling/config/tsconfig.test.json`. The probe uses those existing recipes. JSZip is resolved from platejs's package owner with createRequire because an artifact under docs cannot resolve that package-local dependency by bare import. The Link implementation is imported through its inspected source owner; Media and conversion APIs resolve through the source preload.

Setup receipts remain in the original ignored artifact directory: `attempt-1-resolution.log` (JSZip location), `attempt-2-import.log` and `attempt-3-import.log` (incorrect initial feature imports), `initial-50.log` (first runnable observations), `attempt-4-comparator.log` (first 56 observations before correcting the custom comparator's required mapping match). The final rerun fixes only the probe and proves the comparator throws for unsafe href, not invalid mapping configuration. No reinstall or product repair occurred.

`source-identity.json` fingerprints the decisive owners, runner inputs and probe after the final run. It is a bounded source snapshot, not a claim that the entire transitive dependency graph was fingerprinted. `results.json` and `probe.log` are the canonical execution evidence. Stop condition reached: direct public-path counterexamples settle both the false universal-safety claim and the role-aware ownership direction.

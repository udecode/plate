# Wordgard: clipboard and paste

## Serializing slices to HTML

- **HTML slices.** `test/webtest-serialize.ts` lines 31-263 at b5ad0d0 pin that documents and open slices serialize to HTML and parse back with nested structure, marks, parameters, whitespace, rule precedence, context and several unmatched block elements, without leaking transport metadata. Plate's `packages/platejs/src/lib/plugins/html/HtmlPlugin.mapping.spec.ts` proves direct inline wrapping, fitting of unmatched blocks and root properties. Plite's `packages/plitejs/test/dom/clipboard-boundary.ts` proves open-slice transport, such as caption text written as an open slice and v1 payloads that keep their openness (report.md:114). The report's `plite-dom` package no longer exists; its DOM tests now live under `packages/plitejs/test/dom/`.

## Slice fitting

- **Slice fitting.** Wordgard `test/test-change.ts` lines 138-258 at b5ad0d0 hold 18 cases on fitting, deletion and context. Plite maps 17 directly. `packages/plitejs/test/slice-fit-contract.test.ts` covers block movement, deep open spines, canonical boundary construction, surviving-block deletion, required defaults, root grammar, context-barrier extraction and round trip, the covered-node policy matrix, asymmetric deletion and nested retained context. `content-slice.test.ts` checks that prepared identity is published once across commits. Plite rejects the case 'discards extra close tokens' because it validates the open depths of a JSON `ContentSlice` and takes no raw token stream (report.md:192).

## Open slices

- **Openness travels as JSON.** Wordgard `test/webtest-serialize.ts` lines 95-117 and 230-256 at b5ad0d0 hold 11 open-slice cases. Plite maps 9 to `packages/plitejs/test/content-slice-laws.test.ts` (detached JSON round trip, valid openness, invalid edges, canonical encoding) and `test/dom/clipboard-boundary.ts` (exact payload of the selected slice). Plite rejects HTML `open` attributes and a DOM `isOpen` callback. A versioned JSON clipboard envelope carries exact openness instead: `packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts` checks its version and parses a `ContentSlice`. HTML stays a fallback for interoperability. The third owner the report cited, `test/dom/host-codec.test.ts`, was deleted in 3e0ab4dd7d (2026-09-27) (report.md:193).

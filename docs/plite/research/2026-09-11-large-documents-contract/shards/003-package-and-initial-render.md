# Package reachability and first render

Scope: honest dependencies, server output and the cost of complete DOM.

The runtime probe used Plite's real tsdown configuration with only a scratch
output directory, declarations disabled, source maps disabled and final artifact
assertions omitted. `deps.neverBundle=true` stayed intact. All 475 captured
inputs matched before/after the build. This is a runtime artifact inspection,
not a packed declaration or clean-install test.

| Entry | Static external imports relevant here | Reachable unminified bytes |
| --- | --- | --- |
| Root | None | 1,352,547 |
| React | React, React DOM, TanStack Virtual, lodash and scrolling utility | 2,693,503 |
| Pagination React | The React graph plus Pretext | 2,773,781 |

These byte counts include shared implementation reachable from each whole
entrypoint. They are not application bundle sizes, gzip sizes, parse times or
incremental virtualization overhead. A resolver probe deliberately withholding
TanStack imported the root successfully and failed on the React entry. The
optional peer is a real React import requirement in the current artifact.

The manifest also makes Pretext optional. Its reachability in pagination is an
adjacent dependency fact, not authority to redesign measurement engines in
this rendering task. Include its presence/absence in the pagination package
gate; do not make ordinary Plite/Plate editor setup install it accidentally.

## Server output

Node rendered the built runtime without `window` or `document`. The fixture was
a unique short paragraph per block, with no custom renderer or layout engine.

| Blocks | Full strings / bytes | Auto strings / bytes | Virtual request strings / bytes |
| --- | --- | --- | --- |
| 100 | 100 / 31,423 | 100 / 31,423 | 100 / 31,423 |
| 1,001 | 1,001 / 315,342 | 32 / 30,702 | 16 / 5,727 |
| 10,000 | 10,000 / 3,196,023 | 32 / 217,645 | 16 / 5,729 |

Only full includes the final unique string at 1,001 and 10,000 blocks. The
virtual request uses the staged fallback because no scroll root exists yet.
Auto's placeholder markup still grows with the document. This receipt does not
measure hydration, readiness or browser input latency.

## Implications

Default complete DOM is a coverage decision with an explicit cold cost. Do not
hide the cost behind an auto threshold. DOM-present paint optimizations may be
measured independently; Slate's chunked reconciliation is not equivalent to
Plite's auto omission. The pinned Slate documentation says chunking itself has
no DOM effect until a renderer adds wrappers. Its browser-performance claims
are historical source claims, not current comparison timings.

For the preferred single Editable API, make TanStack an ordinary private
implementation dependency if it remains statically imported. Test a separate
virtual entrypoint as the material alternative if import footprint or the
required installation set proves costly. Do not select an async backend loader
merely to preserve an optional-peer label; that introduces loading, error and
first-input state that must earn its cost.

The earlier empty-server-shell and permanent error-on-unbounded-container
choices were not established by user jobs. The next prototype must compare a
bounded deterministic initial window with full first rendering. Complete DOM
is valid when no omission is requested; transient zero-size/detached hosts are
view lifecycle states. Invalid numeric configuration is a separate input error.
No new public SSR, hydration or fallback mode is justified.

For full-content publication/export, reuse the existing static renderer owner
where it applies. A virtual editor's mounted `innerHTML` is not a document
export. Browser print and browser Find need separate product decisions and
proof; the API cannot infer support from a full model slice.

Evidence: [runtime build](../../../../plans/artifacts/large-documents-deep/bundle-result.json),
[missing peer](../../../../plans/artifacts/large-documents-deep/missing-peer-result.json),
[server output](../../../../plans/artifacts/large-documents-deep/ssr-result.json).
Two resolver mistakes and the first lexical import scanner are retained in raw
logs and excluded from conclusions; the final scanner parses static imports.
No package manifest, product implementation or public teaching was changed.

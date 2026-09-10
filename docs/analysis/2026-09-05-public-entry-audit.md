# Public entry audit

All 80 export-map entries and the CLI executable have an explicit disposition. Priority is the highest confirmed finding associated with the entry during this audit; remaining priority records unresolved findings. A dash means no confirmed defect, not a claim of complete behavioral correctness.

| Package | Entry | Audit priority | Remaining | Disposition and evidence |
| --- | --- | --- | --- | --- |
| `@platejs/cli` | `./package.json` | — | — | retain boundary; no confirmed defect. Package metadata discovery; no runtime owner or extra implementation. No confirmed finding. |
| `platejs` | `./compiler` | P2 | P2 | retain boundary; API-01 partly repaired, remainder open. Optional compilation and generated type-provider integration; compiler carrier exposure remains API-01. API-01. |
| `platejs` | `.` | P1 | P2 | retain boundary; API-01 partly repaired, remainder open. Plate plugin authoring and document semantics over the canonical Plite core; ordinary app imports do not require a second editor package. API-01, TEST-03, PROXY-01, UI-03. |
| `platejs` | `./ai` | — | — | retain boundary; no confirmed defect. Independent ai document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./ai/react` | — | — | retain boundary; no confirmed defect. Live ai descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./callout` | — | — | retain boundary; no confirmed defect. Independent callout document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./callout/react` | — | — | retain boundary; no confirmed defect. Live callout descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./code-drawing` | — | — | retain boundary; no confirmed defect. Code-drawing semantics and lazy renderer integration; optional renderer dependencies remain isolated. No confirmed finding. |
| `platejs` | `./code-drawing/react` | — | — | retain boundary; no confirmed defect. Live code-drawing descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./combobox` | — | — | retain boundary; no confirmed defect. Headless trigger matching and combobox document commands. No confirmed finding. |
| `platejs` | `./comments/react` | — | — | retain boundary; no confirmed defect. Application-owned comments source adapted into editor anchors and local interaction state. No confirmed finding. |
| `platejs` | `./csv` | — | — | retain boundary; no confirmed defect. CSV codec integration isolated from the ordinary editor import. No confirmed finding. |
| `platejs` | `./date` | — | — | retain boundary; no confirmed defect. Independent date document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./date/react` | — | — | retain boundary; no confirmed defect. Live date descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./diff` | P2 | — | retain boundary; associated findings repaired. Identity facade for canonical diff owner in Plite; Plate applications must not install a second editor package. Packed facade/type proof owns identity. RUNTIME-02. |
| `platejs` | `./dnd/react` | — | — | retain boundary; no confirmed defect. Cross-editor drag/drop and mounted DOM lifecycle reused by independent copied families. No confirmed finding. |
| `platejs` | `./docx` | — | — | retain boundary; no confirmed defect. DOCX import/export and file operations with isolated optional codec peers. No confirmed finding. |
| `platejs` | `./dom` | — | — | retain boundary; no confirmed defect. Identity facade for canonical dom owner in Plite; Plate applications must not install a second editor package. Packed facade/type proof owns identity. No confirmed finding. |
| `platejs` | `./emoji` | — | — | retain boundary; no confirmed defect. Emoji schema and search/library/grid semantics with actual picker inheritance consumers. No confirmed finding. |
| `platejs` | `./emoji/react` | — | — | retain boundary; no confirmed defect. Live emoji descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./excalidraw` | — | — | retain boundary; no confirmed defect. Independent excalidraw document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./excalidraw/react` | — | — | retain boundary; no confirmed defect. Live excalidraw descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./footnote` | — | — | retain boundary; no confirmed defect. Independent footnote document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./footnote/react` | — | — | retain boundary; no confirmed defect. Live footnote descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./history` | — | — | retain boundary; no confirmed defect. Identity facade for canonical history owner in Plite; Plate applications must not install a second editor package. Packed facade/type proof owns identity. No confirmed finding. |
| `platejs` | `./hyperscript` | — | — | retain boundary; no confirmed defect. Identity facade for canonical hyperscript owner in Plite; Plate applications must not install a second editor package. Packed facade/type proof owns identity. No confirmed finding. |
| `platejs` | `./juice` | — | — | retain boundary; no confirmed defect. HTML CSS inlining codec with an isolated optional peer. No confirmed finding. |
| `platejs` | `./layout` | — | — | retain boundary; no confirmed defect. Independent layout document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./layout/react` | — | — | retain boundary; no confirmed defect. Live layout descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./markdown` | — | — | retain boundary; no confirmed defect. Markdown/MDAST codecs, streaming parsing and extension points with independent standalone consumers. No confirmed finding. |
| `platejs` | `./media` | — | — | retain boundary; no confirmed defect. Independent media document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./media/react` | — | — | retain boundary; no confirmed defect. Live media descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./mention` | — | — | retain boundary; no confirmed defect. Independent mention document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./mention/react` | — | — | retain boundary; no confirmed defect. Live mention descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./math` | — | — | retain boundary; no confirmed defect. Independent math document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./math/react` | — | — | retain boundary; no confirmed defect. Live math descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./migrations` | — | — | retain boundary; no confirmed defect. Explicit persisted-document migration. Historical data compatibility is a hard law distinct from retaining obsolete live APIs. No confirmed finding. |
| `platejs` | `./pagination` | P2 | — | retain boundary; associated findings repaired. Identity facade for canonical pagination owner in Plite; Plate applications must not install a second editor package. Packed facade/type proof owns identity. API-02. |
| `platejs` | `./pagination/react` | P1 | — | retain boundary; associated findings repaired. Identity facade for canonical pagination/react owner in Plite; Plate applications must not install a second editor package. Packed facade/type proof owns identity. API-02, BROWSER-01. |
| `platejs` | `./react` | P1 | P2 | retain boundary; API-01 partly repaired, remainder open. Live Plate plugin integration and React consumers; redundant runtime and raw shell-store exposure are ranked separately. API-01, API-03, API-04, HOOK-01, REF-01, PROXY-01, UI-03. |
| `platejs` | `./resizable/react` | — | — | retain boundary; no confirmed defect. Reusable pointer/keyboard/RTL resizing and accessibility; styling and persistence remain copied UI. No confirmed finding. |
| `platejs` | `./slash-command` | — | — | retain boundary; no confirmed defect. Independent slash-command document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./slash-command/react` | — | — | retain boundary; no confirmed defect. Live slash-command descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./static` | — | — | retain boundary; no confirmed defect. DOM-free static rendering and clipboard HTML output. Live React editor imports must remain excluded. No confirmed finding. |
| `platejs` | `./suggestion` | — | — | retain boundary; no confirmed defect. Independent suggestion document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./suggestion/react` | — | — | retain boundary; no confirmed defect. Live suggestion descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./table` | — | — | retain boundary; no confirmed defect. Table schema, structural selection, grid compilation and commands. No confirmed finding. |
| `platejs` | `./table/react` | — | — | retain boundary; no confirmed defect. Live table binding and structural selection DOM synchronization. No confirmed finding. |
| `platejs` | `./tabbable` | — | — | retain boundary; no confirmed defect. Tab-navigation domain contracts. No confirmed finding. |
| `platejs` | `./tabbable/react` | — | — | retain boundary; no confirmed defect. Mounted keyboard tab-navigation integration. No confirmed finding. |
| `platejs` | `./testing` | — | — | retain boundary; no confirmed defect. Identity facade for canonical testing owner in Plite; Plate applications must not install a second editor package. Packed facade/type proof owns identity. No confirmed finding. |
| `platejs` | `./tag` | — | — | retain boundary; no confirmed defect. Independent tag document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./tag/react` | — | — | retain boundary; no confirmed defect. Live tag descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./toc` | — | — | retain boundary; no confirmed defect. Independent toc document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./toc/react` | — | — | retain boundary; no confirmed defect. Live toc descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./details` | — | — | retain boundary; no confirmed defect. Independent details document schema, commands or codec job consumed by live and/or static integration. The named feature and optional-dependency boundary are retained. No confirmed finding. |
| `platejs` | `./details/react` | — | — | retain boundary; no confirmed defect. Live details descriptor/integration. This module boundary keeps React out of the semantic/static entry; copied renderers retain their own product UI. No confirmed finding. |
| `platejs` | `./yjs` | — | — | retain boundary; no confirmed defect. Plate collaboration descriptor over the canonical Yjs owner. No confirmed finding. |
| `platejs` | `./yjs/react` | — | — | retain boundary; no confirmed defect. Live collaboration over canonical Yjs data and geometry. No confirmed finding. |
| `platejs` | `./math/katex.css` | — | — | retain boundary; no confirmed defect. Explicit KaTeX stylesheet opt-in. No confirmed finding. |
| `platejs` | `./package.json` | — | — | retain boundary; no confirmed defect. Package metadata discovery; no runtime owner or extra implementation. No confirmed finding. |
| `plitejs` | `.` | P1 | P2 | retain boundary; API-01 partly repaired, remainder open. Canonical editor core and extension/transaction/schema laws; public compiler/runtime bridge debt is ranked separately. API-01, TEST-03, PROXY-01. |
| `plitejs` | `./dom` | — | — | retain boundary; no confirmed defect. DOM/native-event and clipboard integration isolated from the headless entry. No confirmed finding. |
| `plitejs` | `./history` | — | — | retain boundary; no confirmed defect. History persistence and commands with independent headless and React consumers. No confirmed finding. |
| `plitejs` | `./hyperscript` | — | — | retain boundary; no confirmed defect. Hyperscript fixture construction without a React dependency. No confirmed finding. |
| `plitejs` | `./pagination` | P2 | — | retain boundary; associated findings repaired. Headless derived pagination geometry with optional engine and one runtime lifetime. API-02. |
| `plitejs` | `./pagination/react` | P1 | — | retain boundary; associated findings repaired. React pagination projection over the same headless geometry and configuration owner. API-02, BROWSER-01. |
| `plitejs` | `./react` | P1 | P1 | retain boundary; cold mount budget and API-01 remain open. React editor creation, mounted view ownership and narrow subscriptions; duplicate provider ownership remains API-03. API-01, API-03, BROWSER-01, RUNTIME-03. |
| `plitejs` | `./annotations` | — | — | retain boundary; no confirmed defect. Headless annotation resolution and keyed source subscriptions; React is an optional consumer. No confirmed finding. |
| `plitejs` | `./diff` | P2 | — | retain boundary; associated findings repaired. Document diff semantics; conversion complexity remains RUNTIME-02. RUNTIME-02. |
| `plitejs` | `./testing` | — | — | retain boundary; no confirmed defect. Plite source fixture/test integration independent of Plate feature contracts. No confirmed finding. |
| `plitejs` | `./package.json` | — | — | retain boundary; no confirmed defect. Package metadata discovery; no runtime owner or extra implementation. No confirmed finding. |
| `plitejs` | `./yjs` | — | — | retain boundary; no confirmed defect. Headless Yjs collaboration and relative selection semantics. No confirmed finding. |
| `plitejs` | `./yjs/react` | — | — | retain boundary; no confirmed defect. Provider/cursor keyed subscriptions and exact-mounted-view geometry without copied styling. No confirmed finding. |
| `@platejs/test` | `.` | — | — | retain boundary; no confirmed defect. Plate fixture construction reuses Plite test semantics. No confirmed finding. |
| `@platejs/test` | `./browser` | — | — | retain boundary; no confirmed defect. Browser DOM/selection inspection without loading Playwright into the browser. No confirmed finding. |
| `@platejs/test` | `./playwright` | — | — | retain boundary; no confirmed defect. Owned Playwright transport, native interaction and evidence harness. No confirmed finding. |
| `@platejs/test` | `./proof` | — | — | retain boundary; no confirmed defect. Proof classification and raw-device receipt validation separate from browser transport. No confirmed finding. |
| `@platejs/test` | `./react` | — | — | retain boundary; no confirmed defect. React editor test harness with an isolated testing-library peer. No confirmed finding. |
| `@platejs/test` | `./package.json` | — | — | retain boundary; no confirmed defect. Package metadata discovery; no runtime owner or extra implementation. No confirmed finding. |
| `@platejs/cli` | `bin:plate` | — | — | retain boundary; no confirmed defect. CLI installation/generation/migration; 86 baseline tests and primary-CI repair under CI-01. No confirmed finding. |

The companion JSON includes source hashes, resolved export graphs, public names and static consumer candidates. Import counts are navigation evidence; dynamic consumption and runtime behavior are governed by the corresponding tests and decision packets.

## Evidence boundaries

- Public boundary review does not claim a semantic line review of every file reachable from a barrel.
- Package facades retain the explicit single-package installation job; identical re-exports are not a second runtime owner.
- The external-text budget was measured through `plitejs/react`. Its source-bound checkpoint and later drift are preserved separately.
- Three compiler helpers are deleted; API-01 remains open for the surviving type/runtime adapter dependencies.

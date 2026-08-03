# Wordgard public forum coverage

Frozen at `2026-08-01T15:42:20.070Z` from the official [Wordgard forum](https://discuss.wordgard.net).

> Forum content is intent and requirements evidence only. Marijn posts establish maintainer intent, boundaries, explanations, and claimed status. Community posts establish demand, proposals, observations, or bug reports. Neither is implementation or runtime proof.

## Completeness boundary

| Measure | Count |
| --- | --- |
| Discourse categories | 3 |
| Regular public topics | 12 |
| Category-description topics omitted by latest | 2 |
| All anonymously retrievable topics | 14 |
| All anonymously retrievable posts | 48 |
| Marijn posts | 20 |
| Community posts | 25 |
| System posts | 3 |
| Visible post-number gaps | 1 |
| Instance topic count from about.json | 17 |
| Instance post count from about.json | 71 |
| Instance records not anonymously retrievable | 3 topics / 23 posts |
| Unexplained records inside the visible corpus | 0 topics / 0 posts |

The anonymous corpus is the union of paginated `/latest.json`, every category index, category-description `topic_url` records, and paginated `/posts.json`, followed by each complete topic post stream. Every record inside that visible corpus is explained. Separately, the 17/71 instance totals leave an anonymous-inaccessible gap that may contain private, deleted, or internal records; this audit does not guess their content.

## Topics

| ID | Topic | Posts | Marijn | Community | Missing public numbers | Claims |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [About the Site Feedback category](https://discuss.wordgard.net/t/about-the-site-feedback-category/1) | 1 | 0 | 0 | — | — |
| 3 | [About the General category](https://discuss.wordgard.net/t/about-the-general-category/3) | 1 | 0 | 0 | — | — |
| 5 | [Welcome to the Wordgard forum](https://discuss.wordgard.net/t/welcome-to-the-wordgard-forum/5) | 3 | 0 | 2 | — | — |
| 8 | [Any plan to render Angular components inside the editor?](https://discuss.wordgard.net/t/any-plan-to-render-angular-components-inside-the-editor/8) | 4 | 2 | 2 | — | WGF-036, WGF-037 |
| 16 | [wordgard-markdown ? ](https://discuss.wordgard.net/t/wordgard-markdown/16) | 2 | 1 | 1 | — | WGF-034, WGF-035 |
| 17 | [API design: TS Namespace vs ESM `export * as ns`](https://discuss.wordgard.net/t/api-design-ts-namespace-vs-esm-export-as-ns/17) | 5 | 3 | 2 | — | WGF-027, WGF-028, WGF-029, WGF-030, WGF-031 |
| 18 | [Porting to other languages / environments?](https://discuss.wordgard.net/t/porting-to-other-languages-environments/18) | 2 | 1 | 1 | — | WGF-032, WGF-033 |
| 19 | [Strongly referencing document positions](https://discuss.wordgard.net/t/strongly-referencing-document-positions/19) | 3 | 1 | 2 | — | WGF-017, WGF-018, WGF-019, WGF-020, WGF-021 |
| 20 | [How does this compare to the Lexical editor by Meta?](https://discuss.wordgard.net/t/how-does-this-compare-to-the-lexical-editor-by-meta/20) | 2 | 1 | 1 | — | WGF-023 |
| 24 | [Attitude towards AI?](https://discuss.wordgard.net/t/attitude-towards-ai/24) | 8 | 3 | 5 | 8 | WGF-022 |
| 27 | [Any plans for vertical writing mode support?](https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27) | 5 | 2 | 3 | — | WGF-001, WGF-002, WGF-003, WGF-004 |
| 29 | [Virtualization (windowing, occlusion culling) support](https://discuss.wordgard.net/t/virtualization-windowing-occlusion-culling-support/29) | 2 | 1 | 1 | — | WGF-024, WGF-025, WGF-026 |
| 30 | [New footnote example](https://discuss.wordgard.net/t/new-footnote-example/30) | 7 | 4 | 3 | — | WGF-009, WGF-010, WGF-011, WGF-012, WGF-013, WGF-014, WGF-015, WGF-016 |
| 31 | [Offline collaborative editing](https://discuss.wordgard.net/t/offline-collaborative-editing/31) | 3 | 1 | 2 | — | WGF-005, WGF-006, WGF-007, WGF-008 |

## Material claims

| Claim | Post | Speaker | Kind | Paraphrased statement | Matrix mapping |
| --- | --- | --- | --- | --- | --- |
| WGF-001 | [27#1](https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/1) | karintou8710 (community) | community-requirement | A production editor for Japanese and other CJK content needs vertical writing, including editor-owned caret behavior where contenteditable is unreliable. | WG-STATE-013, WG-STATE-011B, WG-VIEW-006B, WG-VIEW-010A, LOCAL-VERTICAL-WRITING-LAYOUT, LOCAL-VERTICAL-WRITING-INPUT |
| WGF-002 | [27#2](https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/2) | marijn (maintainer) | maintainer-intent | Vertical writing had not received serious design work because the maintainer did not know there was concrete demand. | WG-STATE-013, WG-VIEW-006B, LOCAL-VERTICAL-WRITING-LAYOUT, LOCAL-VERTICAL-WRITING-INPUT |
| WGF-003 | [27#3](https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/3) | karintou8710 (community) | community-requirement | Modern Japanese vertical writing requires mixed-orientation text, ruby, tate-chu-yoko, reliable IME, and browser-independent caret behavior. | WG-STATE-013, WG-STATE-011B, WG-VIEW-006B, WG-VIEW-010A, LOCAL-VERTICAL-WRITING-LAYOUT, LOCAL-VERTICAL-WRITING-INPUT |
| WGF-004 | [27#4](https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/4) | marijn (maintainer) | maintainer-non-goal | Vertical writing is outside the maintained core; a custom editor component or fork may reuse Wordgard data structures. | WG-VIEW-001A, WG-STATE-013, WG-VIEW-006B, LOCAL-VERTICAL-WRITING-LAYOUT, LOCAL-VERTICAL-WRITING-INPUT, LOCAL-HOST-EDITOR-CAPABILITY |
| WGF-005 | [31#1](https://discuss.wordgard.net/t/offline-collaborative-editing/31/1) | thesmartwon (community) | community-requirement | Offline collaborative editing needs durable reconciliation beyond Wordgard's real-time central-authority transform loop. | WG-COLLAB-001, WG-COLLAB-002A, LOCAL-YJS, LOCAL-ANCHORS, LOCAL-OFFLINE-MERGE-REVIEW |
| WGF-006 | [31#2](https://discuss.wordgard.net/t/offline-collaborative-editing/31/2) | marijn (maintainer) | maintainer-design-position | Offline automatic merging is primarily a change-review and adjustment UI problem, not just a merge-algorithm problem. | WG-APPLICATION-BLAME-001, WG-APPLICATION-BLAME-002, LOCAL-OFFLINE-MERGE-REVIEW |
| WGF-007 | [31#2](https://discuss.wordgard.net/t/offline-collaborative-editing/31/2) | marijn (maintainer) | maintainer-design-position | Fractional indices do not provide stable document addressing by themselves; durable addressing requires element IDs and tombstones, which often cost more than they return. | LOCAL-ANCHORS, LOCAL-YJS, WG-DOC-007, WG-DOC-011 |
| WGF-008 | [31#3](https://discuss.wordgard.net/t/offline-collaborative-editing/31/3) | thesmartwon (community) | community-proposal | Candidate offline designs include a causal transaction oplog with snapshots or SQL tables using ordered IDs and fractional insertion positions. | WG-COLLAB-001, WG-COLLAB-002A, LOCAL-YJS, LOCAL-OFFLINE-MERGE-REVIEW, LOCAL-EXTERNAL-MODEL-SYNC |
| WGF-009 | [30#1](https://discuss.wordgard.net/t/new-footnote-example/30/1) | marijn (maintainer) | maintainer-status | Building the footnote example exposed and triggered fixes for block nodes that behave as atoms. | WG-DOC-002D, WG-INTEGRATION-NESTED-001, WG-PROOF-005A2 |
| WGF-010 | [30#1](https://discuss.wordgard.net/t/new-footnote-example/30/1) | marijn (maintainer) | maintainer-status | A collaborative-editing example and accompanying explanation were published. | WG-COLLAB-001, WG-COLLAB-002A, WG-PROOF-005A2 |
| WGF-011 | [30#2](https://discuss.wordgard.net/t/new-footnote-example/30/2) | mhmttosun (community) | community-bug-report | Switching between footnotes in Firefox could display stale nested content unless selection state changed. | WG-INTEGRATION-NESTED-001, WG-VIEW-007B2, WG-PROOF-005A2 |
| WGF-012 | [30#3](https://discuss.wordgard.net/t/new-footnote-example/30/3) | marijn (maintainer) | maintainer-status | The maintainer reported pushing a patch for the stale-footnote-content report. | WG-PROOF-005A2 |
| WGF-013 | [30#4](https://discuss.wordgard.net/t/new-footnote-example/30/4) | mhmttosun (community) | community-bug-report | The first footnote patch introduced a runtime crash because contentEq was unavailable. | WG-DOC-005B, WG-VIEW-016A, WG-PROOF-005A2 |
| WGF-014 | [30#5](https://discuss.wordgard.net/t/new-footnote-example/30/5) | marijn (maintainer) | maintainer-cause-claim | The crash came from example code using an unpublished method absent from the website's installed library version. | WG-PROOF-005A1A, WG-PROOF-005A2, WG-PROOF-005B1 |
| WGF-015 | [30#6](https://discuss.wordgard.net/t/new-footnote-example/30/6) | mhmttosun (community) | community-status-report | A user reported that the corrected footnote example worked. | WG-PROOF-005A2 |
| WGF-016 | [30#7](https://discuss.wordgard.net/t/new-footnote-example/30/7) | marijn (maintainer) | maintainer-intent | Porting realistic ProseMirror examples is intentionally used to discover missing Wordgard behavior, with more examples planned. | WG-META-004B, WG-PROOF-005A2 |
| WGF-017 | [19#1](https://discuss.wordgard.net/t/strongly-referencing-document-positions/19/1) | thesmartwon (community) | community-requirement | An external SQL model may need bidirectional conversion between editor transactions and database transactions. | WG-STATE-006A, LOCAL-COMMIT-IMPACT-METADATA, LOCAL-COMMIT-IMPACT-SUBSCRIPTIONS, LOCAL-EXTERNAL-MODEL-SYNC |
| WGF-018 | [19#1](https://discuss.wordgard.net/t/strongly-referencing-document-positions/19/1) | thesmartwon (community) | community-requirement | Stable per-word identity and large-document performance create tension between node-per-word DOM rendering and compact text projection. | LOCAL-ANCHORS, WG-VIEW-004A3, WG-VIEW-004A1 |
| WGF-019 | [19#2](https://discuss.wordgard.net/t/strongly-referencing-document-positions/19/2) | marijn (maintainer) | maintainer-capability-claim | An update listener can observe editor activity for outbound synchronization, while external changes can be pushed into the editor. | WG-STATE-006A, LOCAL-COMMIT-IMPACT-METADATA, LOCAL-COMMIT-IMPACT-SUBSCRIPTIONS, LOCAL-EXTERNAL-MODEL-SYNC |
| WGF-020 | [19#2](https://discuss.wordgard.net/t/strongly-referencing-document-positions/19/2) | marijn (maintainer) | maintainer-design-option | Mapped range metadata can keep information about document spans outside the document, while schema nodes may be simpler when identity is structural. | WG-VIEW-005B2, WG-DOC-011, LOCAL-ANCHORS |
| WGF-021 | [19#3](https://discuss.wordgard.net/t/strongly-referencing-document-positions/19/3) | thesmartwon (community) | community-requirement | Database transaction mapping and virtualization remain linked requirements for large documents with stable external identities. | WG-VIEW-004A3, LOCAL-ANCHORS, LOCAL-EXTERNAL-MODEL-SYNC |
| WGF-022 | [24#4](https://discuss.wordgard.net/t/attitude-towards-ai/24/4) | marijn (maintainer) | maintainer-design-position | Wordgard exists to revisit and improve unresolved design problems in ProseMirror rather than preserve that architecture unchanged. | WG-META-004D |
| WGF-023 | [20#2](https://discuss.wordgard.net/t/how-does-this-compare-to-the-lexical-editor-by-meta/20/2) | marijn (maintainer) | maintainer-design-position | Wordgard deliberately prefers functional algebraic state design and facets over Lexical-style imperative composition. | WG-STATE-001A, WG-STATE-003A, WG-STATE-003B, WG-STATE-004A |
| WGF-024 | [29#1](https://discuss.wordgard.net/t/virtualization-windowing-occlusion-culling-support/29/1) | strogonoff (community) | community-requirement | Large documents and expensive node views motivate bounded DOM mounting, but nested variable-height content makes naïve list windowing insufficient. | WG-VIEW-004A3, LOCAL-REACT-HOST, LOCAL-LAYOUT-PLAN, LOCAL-LAYOUT-GEOMETRY |
| WGF-025 | [29#2](https://discuss.wordgard.net/t/virtualization-windowing-occlusion-culling-support/29/2) | marijn (maintainer) | maintainer-non-goal | Core virtualization is intentionally excluded because its code and API complexity impose a tax on most users. | WG-VIEW-004A3 |
| WGF-026 | [29#2](https://discuss.wordgard.net/t/virtualization-windowing-occlusion-culling-support/29/2) | marijn (maintainer) | maintainer-intent | Wordgard data structures are intended for reuse by canvas, native, React, or virtualizing editor components, but the host abstractions still need real adopters and refinement. | WG-META-001, WG-VIEW-001A, LOCAL-REACT-HOST, LOCAL-LAYOUT-PLAN, LOCAL-LAYOUT-GEOMETRY, LOCAL-HOST-EDITOR-CAPABILITY |
| WGF-027 | [17#1](https://discuss.wordgard.net/t/api-design-ts-namespace-vs-esm-export-as-ns/17/1) | ocavue (community) | community-api-analysis | Native ESM namespaces could avoid TypeScript namespace declaration problems and improve tree shaking, but lose callable-class-plus-namespace ergonomics. | WG-META-002B, LOCAL-RUNTIME-API-TREESHAKING |
| WGF-028 | [17#2](https://discuss.wordgard.net/t/api-design-ts-namespace-vs-esm-export-as-ns/17/2) | marijn (maintainer) | maintainer-design-position | TypeScript namespaces were selected to support nested classes; an ESM alternative was considered. | WG-META-002B, LOCAL-RUNTIME-API-TREESHAKING |
| WGF-029 | [17#3](https://discuss.wordgard.net/t/api-design-ts-namespace-vs-esm-export-as-ns/17/3) | marijn (maintainer) | maintainer-design-position | Splitting every nested API into ESM modules creates awkward ownership and cycles, so Wordgard keeps namespaces and rewrites build output for tree shaking. | WG-META-002B, LOCAL-RUNTIME-API-TREESHAKING |
| WGF-030 | [17#4](https://discuss.wordgard.net/t/api-design-ts-namespace-vs-esm-export-as-ns/17/4) | keais (community) | community-bug-report | A Vite consumer observed the link namespace missing at runtime. | WG-META-002B |
| WGF-031 | [17#5](https://discuss.wordgard.net/t/api-design-ts-namespace-vs-esm-export-as-ns/17/5) | marijn (maintainer) | maintainer-cause-claim | The missing link API was attributed to a namespace-mangling build bug that let dead-code elimination drop a live namespace. | WG-META-002B, WG-META-005A |
| WGF-032 | [18#1](https://discuss.wordgard.net/t/porting-to-other-languages-environments/18/1) | nicoburns (community) | community-requirement | A non-browser Rust port needs the document and command substrate to be separable from DOM layout and selection. | WG-META-001, WG-VIEW-001A, LOCAL-HOST-EDITOR-CAPABILITY |
| WGF-033 | [18#2](https://discuss.wordgard.net/t/porting-to-other-languages-environments/18/2) | marijn (maintainer) | maintainer-intent | Host independence was a deliberate design goal, but it remains unproven until another host drives a generic subset of the editor interface. | WG-META-001, WG-VIEW-001A, LOCAL-HOST-EDITOR-CAPABILITY |
| WGF-034 | [16#1](https://discuss.wordgard.net/t/wordgard-markdown/16/1) | kepta (community) | community-requirement | Users want a Wordgard Markdown parser and serializer equivalent to the ProseMirror module. | WG-META-001, WG-DOC-016, LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY |
| WGF-035 | [16#2](https://discuss.wordgard.net/t/wordgard-markdown/16/2) | marijn (maintainer) | maintainer-intent | Markdown serialization is not a core priority and is expected to live in a separate module. | WG-META-001, WG-DOC-016, LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY |
| WGF-036 | [8#1](https://discuss.wordgard.net/t/any-plan-to-render-angular-components-inside-the-editor/8/1) | mariojsnunes (community) | community-requirement | Framework users need to render Angular-owned components inside editor content. | WG-VIEW-005A2, LOCAL-HOST-EDITOR-CAPABILITY |
| WGF-037 | [8#2](https://discuss.wordgard.net/t/any-plan-to-render-angular-components-inside-the-editor/8/2) | marijn (maintainer) | maintainer-boundary | Core widgets may host custom DOM, while Angular and other framework adapters stay outside the core library. | WG-VIEW-005A2, WG-META-001, LOCAL-HOST-EDITOR-CAPABILITY |

## Genuinely new atomic rows proposed

| Proposed row | Title | Why distinct | Claims |
| --- | --- | --- | --- |
| LOCAL-VERTICAL-WRITING-LAYOUT | CSS vertical-rl/lr layout, ruby, mixed orientation, geometry, and navigation | CSS vertical layout, ruby, tate-chu-yoko, and horizontal runs inside vertical lines are not the same concept as bidi text direction or ordinary geometry mapping. | WGF-001, WGF-002, WGF-003, WGF-004 |
| LOCAL-VERTICAL-WRITING-INPUT | Vertical-mode caret, selection, key routing, composition, and IME reconciliation | Caret motion and composition in vertical writing have independent browser failure modes and proof obligations from layout projection. | WGF-001, WGF-002, WGF-003, WGF-004 |
| LOCAL-OFFLINE-MERGE-REVIEW | User-visible offline change attribution, review, and adjustment atop convergence | Offline reconciliation is a user-visible review workflow, not merely the existing real-time OT or Yjs transport loop. | WGF-005, WGF-006, WGF-008 |
| LOCAL-HOST-EDITOR-CAPABILITY | Typed headless editor capability across DOM, React, virtualized, native, and canvas hosts | A command-capable editor interface shared by DOM, native, canvas, React, and virtualized views is more specific than package entrypoints or one imperative DOM view lifecycle. | WGF-004, WGF-026, WGF-032, WGF-033, WGF-036, WGF-037 |
| LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY | Separately owned Markdown parse/serialize module integrated through host codecs | Markdown parsing and serialization ownership is absent from the current matrix and is independent from the DOM/HTML codec. | WGF-034, WGF-035 |
| LOCAL-EXTERNAL-MODEL-SYNC | Bidirectional external-model synchronization over committed editor transactions | Observing editor transactions and applying external database changes is a distinct integration contract from state fields, commit impact queries, or collaboration transport. | WGF-008, WGF-017, WGF-019, WGF-021 |

| Proposed row | Mechanism | W/P/P status | Six dimension winners | Overall / preferred | Disposition |
| --- | --- | --- | --- | --- | --- |
| LOCAL-VERTICAL-WRITING-LAYOUT | Project vertical-rl/vertical-lr lines, ruby, tate-chu-yoko, and mixed-orientation runs into visual geometry and navigation. | absent/absent/absent | api: insufficient evidence<br>correctness: insufficient evidence<br>data: insufficient evidence<br>ownership: insufficient evidence<br>proof: insufficient evidence<br>runtime: insufficient evidence | insufficient evidence / insufficient evidence | defer; reference defer; proof defer; debt insufficient evidence; priority — |
| LOCAL-VERTICAL-WRITING-INPUT | Route vertical-writing caret motion, selection, keyboard intent, composition, and IME reconciliation independently from horizontal bidi input. | absent/absent/absent | api: insufficient evidence<br>correctness: insufficient evidence<br>data: insufficient evidence<br>ownership: insufficient evidence<br>proof: insufficient evidence<br>runtime: insufficient evidence | insufficient evidence / insufficient evidence | defer; reference defer; proof defer; debt insufficient evidence; priority — |
| LOCAL-OFFLINE-MERGE-REVIEW | Expose offline divergence as attributed changes that a user can review, accept, reject, and adjust after convergence. | absent/partial/partial | api: Plate stronger<br>correctness: Plate stronger<br>data: Plate stronger<br>ownership: Plate stronger<br>proof: Plate stronger<br>runtime: insufficient evidence | Plate stronger / Plate | defer; reference not-applicable; proof defer; debt insufficient evidence; priority — |
| LOCAL-HOST-EDITOR-CAPABILITY | Define a typed headless editor capability that DOM, React, virtualized, native, and canvas hosts can consume without depending on a specific view class. | partial/partial/partial | api: Plite/Plate stack stronger<br>correctness: insufficient evidence<br>data: Plite/Plate stack stronger<br>ownership: Plite/Plate stack stronger<br>proof: Plite/Plate stack stronger<br>runtime: insufficient evidence | Plite/Plate stack stronger / Plite/Plate stack | keep; reference keep-local; proof keep-local; debt none; priority — |
| LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY | Own Markdown parsing and serialization in a separate package that integrates with the editor through host codecs. | absent/partial/exact | api: Plate stronger<br>correctness: Plate stronger<br>data: Plate stronger<br>ownership: Plate stronger<br>proof: Plate stronger<br>runtime: insufficient evidence | Plate stronger / Plate | keep; reference not-applicable; proof keep-local; debt none; priority — |
| LOCAL-EXTERNAL-MODEL-SYNC | Observe committed editor transactions and snapshots for outbound synchronization and apply inbound external-model transactions through the editor update boundary. | partial/partial/partial | api: Plite/Plate stack stronger<br>correctness: insufficient evidence<br>data: Plite/Plate stack stronger<br>ownership: Plite/Plate stack stronger<br>proof: Plite/Plate stack stronger<br>runtime: insufficient evidence | Plite/Plate stack stronger / Plite/Plate stack | keep; reference keep-local; proof keep-local; debt none; priority — |

| Proposed row | Evidence role | Locators |
| --- | --- | --- |
| LOCAL-VERTICAL-WRITING-LAYOUT | forum intent/coverage only | https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/1<br>https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/2<br>https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/3<br>https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/4 |
| LOCAL-VERTICAL-WRITING-LAYOUT | Wordgard current source | ../wordgard/src/state/textblock.ts:29-48<br>../wordgard/src/state/textblock.ts:141-175 |
| LOCAL-VERTICAL-WRITING-LAYOUT | Plite current source | packages/plite-dom/src/plugin/dom-geometry.ts:65-105<br>packages/plite-dom/src/plugin/dom-geometry.ts:1041-1085<br>packages/plite-dom/src/plugin/dom-geometry.ts:1185-1217<br>docs/plite/selection-navigation-coverage.md:198-201 |
| LOCAL-VERTICAL-WRITING-LAYOUT | Plate current source | docs/plite/selection-navigation-coverage.md:198-201 |
| LOCAL-VERTICAL-WRITING-INPUT | forum intent/coverage only | https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/1<br>https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/2<br>https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/3<br>https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/4 |
| LOCAL-VERTICAL-WRITING-INPUT | Wordgard current source | ../wordgard/src/state/textblock.ts:29-48<br>../wordgard/src/state/textblock.ts:141-175 |
| LOCAL-VERTICAL-WRITING-INPUT | Plite current source | packages/plite-react/src/editable/keyboard-input-strategy.ts:90-158<br>packages/plite-react/src/editable/keyboard-input-strategy.ts:625-648<br>packages/plite-react/src/editable/keyboard-input-strategy.ts:882-896<br>docs/plite/selection-navigation-coverage.md:198-201 |
| LOCAL-VERTICAL-WRITING-INPUT | Plate current source | docs/plite/selection-navigation-coverage.md:198-201 |
| LOCAL-OFFLINE-MERGE-REVIEW | forum intent/coverage only | https://discuss.wordgard.net/t/offline-collaborative-editing/31/1<br>https://discuss.wordgard.net/t/offline-collaborative-editing/31/2<br>https://discuss.wordgard.net/t/offline-collaborative-editing/31/3 |
| LOCAL-OFFLINE-MERGE-REVIEW | Wordgard current source | ../wordgard/src/collab/collab.ts:23-37<br>../wordgard/src/collab/collab.ts:64-82<br>../wordgard/src/collab/collab.ts:122-230 |
| LOCAL-OFFLINE-MERGE-REVIEW | Plite current source | packages/yjs/test/canonical-change-contract.spec.ts:97-290<br>packages/yjs/test/insert-fragment-contract.spec.ts:76-102 |
| LOCAL-OFFLINE-MERGE-REVIEW | Plate current source | packages/yjs/test/canonical-change-contract.spec.ts:97-290<br>packages/suggestion/src/lib/BaseSuggestionPlugin.ts:1204-1303<br>packages/suggestion/src/lib/BaseSuggestionPlugin.ts:1392-1425<br>packages/suggestion/src/lib/BaseSuggestionPlugin.spec.tsx:1882-1915<br>packages/suggestion/src/lib/BaseSuggestionPlugin.spec.tsx:2572-2617 |
| LOCAL-HOST-EDITOR-CAPABILITY | forum intent/coverage only | https://discuss.wordgard.net/t/any-plan-to-render-angular-components-inside-the-editor/8/1<br>https://discuss.wordgard.net/t/any-plan-to-render-angular-components-inside-the-editor/8/2<br>https://discuss.wordgard.net/t/porting-to-other-languages-environments/18/1<br>https://discuss.wordgard.net/t/porting-to-other-languages-environments/18/2<br>https://discuss.wordgard.net/t/virtualization-windowing-occlusion-culling-support/29/2<br>https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/4 |
| LOCAL-HOST-EDITOR-CAPABILITY | Wordgard current source | ../wordgard/src/editor/editor.ts:26-79<br>../wordgard/src/command/command.ts:19-55<br>../wordgard/src/state/state.ts:41-79 |
| LOCAL-HOST-EDITOR-CAPABILITY | Plite current source | packages/plite/src/interfaces/editor.ts:120-180<br>packages/plite/src/interfaces/editor.ts:1285-1311<br>packages/plite-dom/src/index.ts:23-55<br>packages/plite-react/src/index.ts:35-85 |
| LOCAL-HOST-EDITOR-CAPABILITY | Plate current source | packages/core/src/react/editor/PlateEditor.ts:24-70<br>packages/core/src/react/editor/TPlateEditorCore.spec.ts:55-90 |
| LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY | forum intent/coverage only | https://discuss.wordgard.net/t/wordgard-markdown/16/1<br>https://discuss.wordgard.net/t/wordgard-markdown/16/2 |
| LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY | Wordgard current source | — |
| LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY | Plite current source | packages/plite-dom/test/host-codec.test.ts:163-239<br>packages/plite-dom/test/host-codec.test.ts:356-411 |
| LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY | Plate current source | packages/markdown/package.json:2-29<br>packages/markdown/src/lib/MarkdownPlugin.ts:47-122<br>packages/markdown/src/lib/MarkdownPlugin.spec.ts:152-185<br>packages/markdown/src/lib/MarkdownPlugin.spec.ts:304-434 |
| LOCAL-EXTERNAL-MODEL-SYNC | forum intent/coverage only | https://discuss.wordgard.net/t/strongly-referencing-document-positions/19/1<br>https://discuss.wordgard.net/t/strongly-referencing-document-positions/19/2<br>https://discuss.wordgard.net/t/strongly-referencing-document-positions/19/3<br>https://discuss.wordgard.net/t/offline-collaborative-editing/31/3 |
| LOCAL-EXTERNAL-MODEL-SYNC | Wordgard current source | ../wordgard/src/editor/editor.ts:170-190<br>../wordgard/src/editor/editor.ts:240-243<br>../wordgard/src/editor/editor.ts:635-658<br>../wordgard/src/editor/editor.ts:1015-1039 |
| LOCAL-EXTERNAL-MODEL-SYNC | Plite current source | packages/plite/src/interfaces/editor.ts:1285-1311<br>packages/plite/src/interfaces/editor.ts:3491-3508<br>packages/plite/src/core/listener-state.ts:105-118<br>packages/plite/test/transaction-extension-contract.ts:19-79 |
| LOCAL-EXTERNAL-MODEL-SYNC | Plate current source | packages/core/src/react/components/Plate.tsx:34-53<br>packages/core/src/react/components/Plate.tsx:111-175<br>packages/core/src/react/components/PlateContent.spec.tsx:209-280<br>packages/core/src/react/components/PlateContent.spec.tsx:282-373 |

These are proposals for the parent audit to accept, merge, or reject. Their presence here does not mutate the matrix.

## Reviewed non-material posts

| Post | Author | Scope | Reason |
| --- | --- | --- | --- |
| 1 | system | category-description | Discourse category boilerplate; no editor requirement. |
| 3 | system | category-description | Discourse category boilerplate; no editor requirement. |
| 6 | system | project-process | Forum conduct and issue-routing policy, not an editor architecture claim. |
| 11 | mariojsnunes | context-only | Clarifies a CodeMirror package link; no Wordgard capability claim. |
| 13 | marijn | context-only | Corrects the CodeMirror/Wordgard mix-up; no architecture claim. |
| 22 | akiyama | social | Agreement about AI companies and pull requests; no editor claim. |
| 25 | homelesshimalayan | social | Website praise; no editor requirement. |
| 26 | kingbluetooth | documentation-request | Requests a competitor table but does not assert an editor capability. |
| 38 | Xheldon | question-only | Asks about AI and motivation without asserting architecture. |
| 39 | marijn | tooling-policy | Maintainer opinion on AI-assisted development, not editor architecture. |
| 40 | vighnesh153 | question-only | Asks about motivation without adding an atomic claim. |
| 48 | akiyama | documentation-translation | Community opinion on translated docs; peripheral to editor design. |
| 52 | Xheldon | documentation-translation | Describes a translated-site workflow; no editor architecture claim. |
| 54 | marijn | documentation-translation | Maintainer accepts maintained translated docs; no editor architecture claim. |
| 58 | akiyama | documentation-translation | Encourages translation; no editor architecture claim. |
| 73 | karintou8710 | social | Acknowledges the vertical-writing answer; no new requirement. |

## Validation

- Exact cooked-body hashes matched for 48/48 visible posts.
- Every visible post is either material (32) or explicitly excluded (16).
- Unexplained visible corpus: 0 topics / 0 posts.
- 37 claims map to 42 existing matrix rows and 6 proposed rows.
- Every material claim has at least one existing or proposed atomic row mapping.
- The global post index, topic post streams, latest index, and category indexes agree.


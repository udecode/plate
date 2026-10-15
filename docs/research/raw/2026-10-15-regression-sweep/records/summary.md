Observed: this is a read-only source catalog, not a fresh behavior replay. Repository next was b1e70bb257 when checked. No repository file was written, staged, committed or deleted. Media, linked artifacts and cited test bodies were not independently inspected or replayed.

Observed: records.tsv contains 484 evidence records: 112 plan entries, 348 lesson entries and 24 editing-behavior issues. These are source-record counts, not 484 distinct confirmed regressions. Multiple plans/notes/issues can describe one defect; some entries are proof limitations or supporting workflow lessons. Inferred: the lead should deduplicate and judge those contextual entries before treating them as a miss-class incidence estimate.

Observed: gh returned 27 issues opened since 2026-08-01, below the 300 cap. Three were excluded from editing-behavior counts: #5153 (installation SSR), #5128 (headless package import) and #5146 (DOCX export integration). Serialization/data-loss reports were retained because they affect editor content. Observed: all 24 exact `git log --oneline -E --grep='#<number>' next` queries returned no match; this is not proof of no fix. The checkout is not shallow. Plan-history commits establish plan presence only. Plan excerpts labeled local, dirty or unpushed are not presented as landed fixes.

Observed counts; inferred primary surface classification (one surface per record):

| Surface | Plans | Notes | Issues | Total |
| --- | ---: | ---: | ---: | ---: |
| model | 20 | 65 | 0 | 85 |
| render | 2 | 37 | 1 | 40 |
| caret-or-selection-paint | 8 | 9 | 3 | 20 |
| native-keyboard | 5 | 21 | 3 | 29 |
| pointer-or-mouse | 7 | 3 | 1 | 11 |
| ime-or-composition | 10 | 18 | 0 | 28 |
| mobile-or-touch | 4 | 18 | 0 | 22 |
| clipboard-or-paste | 3 | 34 | 1 | 38 |
| drag-and-drop | 4 | 0 | 2 | 6 |
| scroll-or-layout | 13 | 26 | 1 | 40 |
| focus | 5 | 21 | 2 | 28 |
| popover-or-toolbar-ui | 6 | 5 | 3 | 14 |
| collaboration | 12 | 25 | 1 | 38 |
| serialization | 2 | 13 | 5 | 20 |
| perf | 2 | 17 | 1 | 20 |
| other | 9 | 36 | 0 | 45 |

Observed browser-name mentions, not browser executions or verified support. A record can name several engines; Chrome and Chromium remain separate:

| Browser named | Records | Retained issues |
| --- | ---: | ---: |
| Chrome | 95 | 4 |
| Chromium | 103 | 0 |
| Firefox | 30 | 0 |
| WebKit | 30 | 0 |
| Safari | 15 | 0 |
| no browser named | 331 | 20 |

Inferred recurring miss classes, with observed examples:

- Inferred: semantic/model success substitutes for visible correctness. Observed: #5091's plans record correct Range geometry with stale Blink paint, then a width-only 5/5 that accepted two highlight layers. `docs/plans/5091-current-stale-selection-paint-regression.md` revokes two prior completions. Observed: `docs/plans/2026-08-26-table-native-highlight-reporter-contradiction-regression.md` records a computed-style/count false green; horizontal drag missed row-major native fragments during the held vertical gesture. Observed: `docs/plans/2026-09-22-mixed-suggestion-selection-deletion.md` records passing model assertions while green retained deletion markup stayed visible.
- Inferred: helpers bypass the actual gesture or phase. Observed: `docs/plans/2026-04-27-plite-hovering-toolbar-mouse-selection.md` identifies programmatic selectText instead of real drag. Observed: `docs/plans/5085-floating-toolbar-bold-regression.md` identifies vague selection, locator clicks and obsolete aria-checked. Observed: `docs/plans/5086-seeded-removal-suggestion-crash-regression.md` says the old aggregate-count test passed before the reporter's direct red-text path crashed. Observed: `docs/plans/2026-09-13-suggestion-retained-caret.md` invalidates click proof captured only after arrow keys.
- Inferred: isolated fresh-page cases miss ownership transitions on a warm page. Observed: `docs/plans/2026-04-24-plite-selection-caret-conformance-kernel-plan.md` describes fresh deterministic greens with warm-page cursor failures from stale async selection/repair. Observed: `docs/research/sources/plate-notes/selection-and-editing.md` documents native ArrowDown then model-owned ArrowRight, delayed per-character input, repeated scroll-away/type without a click, and cross-root ordered typing failures that isolated/helper-based tests missed.
- Inferred: synthetic input hides OS timing, DOM identity and platform transport. Observed: `docs/plans/2026-08-22-plite-long-ime-history-atomicity-regression.md` finds split history after 1,100 ms and explicitly limits proof to synthetic desktop Chromium. Observed: `docs/plans/5137-ime-inline-caret.md` says a prior heading/link repair missed ordinary paragraph text and leaves native preedit caret paint open. Observed: `docs/research/sources/plate-notes/input-and-events.md` separates Android text-tree/caret proof from keyboard-visible device proof.
- Inferred: an oracle can be green without exercising or asserting the shipped contract. Observed: `docs/editor-behavior/current-evidence.md` records current-kit tests comparing two undefined fragment children; stand-in inline affinity tests do not prove the shipped LinkPlugin; retired paths do not retain tested status. Observed: `docs/research/sources/plate-notes/testing-and-proof.md` records empty assertion loops, runner filters selecting nothing, harness-shaped output, and first-parse loss hidden by second-parse round trips.
- Inferred: a narrower fixture/plugin stack misses integration and consumer effects. Observed: #5066 contrasts programmatic insertion benchmarks with slow native homepage typing. Observed: `docs/plans/2026-08-26-floating-toolbar-duplicate-shell-regression.md` says link-only proof missed transparent table/AI consumers. Observed: `docs/plans/2026-08-29-block-void-layout-regression-attempt-3.md` says negative caret proof omitted positive full-row geometry. Observed: `docs/plans/2026-09-21-multi-image-drop-regression.md` identifies dynamic upload DOM ownership plus authored/source key-space mismatches.

Observed evidence gaps and surface limits:

Observed: evidence-limits.tsv retains 97 verbatim gap/partial/limit blocks from `docs/editor-behavior/current-evidence.md`, including the family table, matrix-era proof, open behavior/spec conflicts and compiled gaps. These are statements in that file, not a new exhaustive search of all tests. Some compiled-gap entries actually name proof that supersedes an older gap; the artifact preserves that distinction.

Observed: the source does not justify saying an entire vocabulary surface has zero automated proof. It names model, browser and device proofs within most surfaces. Inferred: report missing scenarios, not a whole-surface absence. The strongest documented missing scenarios are:

- Observed, ime-or-composition / caret-or-selection-paint: native OS during-preedit caret paint remains unverified. PR 5137's CDP proof establishes connected Text continuity and commit, not OS IME pixels; the native Pinyin attempt has no completed five-run set and no duplicate-caret control. The evidence file maps no table composition test; raw mention and CodeMirror candidates do not prove all Plate atom/code/table clauses.
- Observed, mobile-or-touch / drag-and-drop: touch drag remains unverified. Android autocomplete proof is one Pixel 9 emulator, API 36, Chrome 146, Gboard 17.0.14. It composed nothing in that run. Composition-time taps, physical phones, other keyboards, iOS, physical desktop IME and WebKit confirming Enter remain unverified. Android keyboard-clipboard trigger paste has no test or device run.
- Observed, native-keyboard / model: paragraph and heading boundary deletion/break scenarios, expanded selection Enter/delete directions, quoted/nested/empty list and quote keys, callout key results, Details Tab/Shift+Tab, block-math empty Backspace/Tab, keys in columns, delete commands and conversion commands have unmapped or partial proof. Many partial rows assert structure but omit caret. Table Shift+Tab test and law disagree; no mapped table column-insert proof; merged-cell deletion span repair is unproven. Deferred platform shortcut/IME/mouse/clipboard cases only throw and prove nothing.
- Observed, pointer-or-mouse / focus / popover-or-toolbar-ui: link plain/mod-click, footnote preview/navigation/insertion/scroll feedback, TOC/outline activation and feedback, and inline-math edge-arrow behavior include unmapped rows. Notes identify real projected-text click-then-Backspace and hovering-toolbar real-drag paths absent from current helper-driven donor rows. Partial footnote model commands do not prove click/scroll/focus.
- Observed, clipboard-or-paste: rich-plus-plain copy and paste preference order have no mapped test; visible paste-loss toast is not browser-proven; nonrectangular table fill refusal and post-fill selection are not covered; paste of files plus HTML has no test. Notes document no Shift+Delete cut proof on Windows/Linux, and current unsupported-file admission proof covers paste but misses drop.
- Observed, collaboration: matrix-era comment create/remove, suggestion accept/reject, discussion anchors and presence have unmapped claims, despite other current owners/tests named elsewhere. Pending comment-undo tests read no remote update during replay. Do not generalize this to zero collaboration tests.
- Observed, serialization / render: media embed width round trip, provider render paths and selected-parent insertion, media-type change with caption lifecycle, date long labels/timezone breadth, local-media path/PDF policy, and some table lossy-warning clauses remain unproven or partial. Notes record DOCX list-whitespace loss without a current `<li>` spec.
- Observed: replace/jump-to-selection/outline-header search and some strict/autopair behaviors have no shipped surface or proof. Inferred: these need a product-law decision before a human regression checklist treats them as shipped behavior.

Observed open editing issues from the live query; inferred human reproduction priority:

| Issue | Observed body evidence and environment | Observed next proof/status | Inferred next human check |
| --- | --- | --- | --- |
| #5126 | Reporter video; browser/OS not named; body says click count is reporter-confirmed, not visually counted | Combined 5125/5126 plan says current first-click cases pass but reporter failure remains needs-repro; no #5126 commit-message match | Highest priority: reproduce exact first click on existing highlighted text, initially unfocused, then dismiss/reopen; capture the differentiating precondition |
| #5127 | Screenshot, no video; macOS 15.7.3 / Chrome 152.0.7977.84; inactive-selection spans already exist | OPEN; no #5127 commit-message match | Check occlusion/contrast while composer owns focus, for both shortcut and toolbar entry; DOM span presence is insufficient |
| #5088 | Video; macOS, browser unknown | OPEN; no #5088 commit-message match | Real gutter/marquee drag across blocks; distinguish whole-block paint from normal text selection |
| #5149 | No video; browser/OS not named; detailed Slate/Plate 49.x report | OPEN; no #5149 commit-message match | First establish whether Enter then slash after existing content reproduces on next; do not assume a stable-v49 report transfers to Plite |
| #5093 | No video; browser/OS not named; two-editor copy/paste report | OPEN; no #5093 commit-message match | Copy comments across independent documents, resolve copied thread, inspect source thread for unwanted coupling |
| #5125 | No video; browser/OS not named; original diagnosis source-backed | OPEN; combined plan says Date repaired locally with five native runs, uncommitted/unpushed at that checkpoint | Retest current integrated next in both directions and Date picker; open tracker is not evidence the local repair still fails |
| #5142 | No video; macOS; headless Markdown repro | OPEN; no #5142 commit-message match | Deterministic package reproduction is cheaper than a human browser session; inspect bold/italic/strike nested filtering |

Observed: issue closure is separate from exact current runtime proof. Closed reports still useful for the miss catalog include #5091, #5113, #5085, #5086 and #5066. Observed: #5113's ship plan records first pushed SHA 85d92abbad and a subsequent harness correction, but its recorded checkpoint is not a final integrated replay receipt; live GitHub independently says CLOSED.

Inferred test-layer implications for the lead: encode deterministic tree, selection, history, filtering and ownership rules at their package owner. Preserve a browser test for the exact copied UI gesture and follow-up input. Keep pixels and same-phase controls for paint defects; keep native/device evidence separate for OS IME, mobile keyboard, touch and native clipboard. Human finds should seed the smallest exact failing test plus the integration path that exposed the miss.

Observed coverage: docs/plans — partly, selected scope/cause/miss/proof excerpts plus several full short plans; filename matches and per-file inclusions/exclusions in coverage.tsv. plate-notes — all nine files inventoried, README fully read, eight lesson pages partly read with every relevant lesson extracted; historical cited documents/tests not replayed. current-evidence.md — partly manually read across family navigation, matrix table, open work and compiled gaps; all gap/limit blocks extracted. GitHub — query succeeded/authenticated, 27 entire bodies fetched, 24 editing bodies field-extracted and relevant prose partly read; attachment media, comments and issue timeline not read; all 24 exact next commit-message searches executed. Coverage is partial, not an exhaustive manual audit.

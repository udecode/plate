# Performance Benchmark Spec Rewrite Plan

## Goal

Rewrite
[performance-benchmark-spec.md](/Users/zbeyens/git/plate-2/docs/performance/performance-benchmark-spec.md)
from scratch so it stops reading like a polite public-doc contract and starts
reading like a real benchmark program spec.

The target is the rigor and control surface of
`js-framework-benchmark`, translated into rich-text editor terms.

Not a toy `Plate vs Slate` note.
Not a marketing page.
A production-grade editor benchmark spec.

## Decision

Use `js-framework-benchmark` as the primary benchmark-model reference.

Copy these traits:

- dense results-first table
- benchmark families with stable ids
- low-level metric decomposition
- memory lanes
- startup lanes
- result display modes
- framework and benchmark selection controls
- compare-with controls
- known-issues gating
- reproducible pipeline from raw runs to compiled result payloads

Do **not** copy its domain assumptions.

This benchmark is for rich-text editors, not DOM row-table libraries.

## Source Inputs

Primary references:

- [performance-benchmark-spec.md](/Users/zbeyens/git/plate-2/docs/performance/performance-benchmark-spec.md)
- [editor-performance-master-plan.md](/Users/zbeyens/git/plate-2/docs/performance/editor-performance-master-plan.md)
- [editor-protocol-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/editor-protocol-matrix.md)
- local clone:
  [/Users/zbeyens/git/js-framework-benchmark/README.md](/Users/zbeyens/git/js-framework-benchmark/README.md)
- local clone:
  [/Users/zbeyens/git/js-framework-benchmark/docs/RESULT_CREATION.md](/Users/zbeyens/git/js-framework-benchmark/docs/RESULT_CREATION.md)
- local clone:
  [/Users/zbeyens/git/js-framework-benchmark/webdriver-ts/src/benchmarksCommon.ts](/Users/zbeyens/git/js-framework-benchmark/webdriver-ts/src/benchmarksCommon.ts)
- local clone:
  [/Users/zbeyens/git/js-framework-benchmark/webdriver-ts/src/benchmarksLighthouse.ts](/Users/zbeyens/git/js-framework-benchmark/webdriver-ts/src/benchmarksLighthouse.ts)
- local clone:
  [/Users/zbeyens/git/js-framework-benchmark/webdriver-ts/src/benchmarksSize.ts](/Users/zbeyens/git/js-framework-benchmark/webdriver-ts/src/benchmarksSize.ts)
- local clone:
  [/Users/zbeyens/git/js-framework-benchmark/webdriver-ts-results/src/Common.ts](/Users/zbeyens/git/js-framework-benchmark/webdriver-ts-results/src/Common.ts)
- local clone:
  [/Users/zbeyens/git/js-framework-benchmark/webdriver-ts-results/src/store.ts](/Users/zbeyens/git/js-framework-benchmark/webdriver-ts-results/src/store.ts)

## What The Current Spec Gets Wrong

The current spec is too high-level and too timid.

It has:

- scope
- philosophy
- a few workload bullets
- some claim boundaries

It does **not** have:

- stable benchmark ids
- explicit benchmark families
- size matrix
- operation matrix
- warmup policy
- CPU throttling policy
- trace-slice policy
- memory benchmark definitions
- startup benchmark definitions
- payload benchmark definitions
- correctness gating policy
- issue-flag policy
- display/control model
- result aggregation contract
- rank/summary computation rules

That is the real gap.

## Benchmark Program Shape

The rewritten spec should define five layers:

1. editor scope
2. benchmark families
3. low-level measured metrics
4. result controls and display modes
5. pipeline and publication contract

## Scope Boundary

### v1 benchmark scope

Rich-text standard plus the parts of the Slate example surface people actually
care about:

- paragraphs
- headings
- blockquotes
- inline marks
- links
- lists
- code blocks / code marks
- tables
- markdown-ish editing behaviors
- clipboard behavior
- history
- selection and caret behavior

Explicitly out:

- collaboration
- AI
- comments
- presence
- media-heavy workflows
- plugin-ecosystem vanity comparisons

### Comparison set

The spec must be written for a future multi-editor table, not a permanent 1v1.

Near term:

- Plate
- Slate

Future:

- ProseMirror
- Tiptap
- Lexical
- others

That means the spec should avoid hardcoding `Plate vs Slate` assumptions into
the benchmark model.

## Benchmark Families

The spec should mirror `js-framework-benchmark` by defining stable benchmark
ids and families.

### Family A: Interaction CPU benchmarks

These replace the row-table operations with editor operations.

They should report:

- `total`
- `script`
- `layout`
- `paint`
- `other`

If `layout` and `other` are not yet reliable in the runner, the spec should
still reserve them. Do not design a baby benchmark just because the runner is
not there yet.

#### Core mount and replace

- `01_ready-empty`
  - load empty editor route until editor is visibly ready
- `02_mount-1k`
  - mount a `1k` doc
- `03_mount-10k`
  - mount a `10k` doc
- `04_mount-50k`
  - mount a `50k` doc
- `05_replace-same-size`
  - replace the whole mounted document with an equivalent-size document

#### Incremental document growth and teardown

- `06_append-1k-to-1k`
- `07_append-5k-to-10k`
- `08_remove-single-block`
- `09_clear-document`

#### Local content mutations

- `10_type-middle`
- `11_type-start`
- `12_type-end`
- `13_type-inside-marked-text`
- `14_partial-update-every-10th-block`
- `15_partial-update-every-10th-leaf`

#### Structural editing

- `16_enter-split-paragraph`
- `17_backspace-merge-block`
- `18_delete-forward-merge`
- `19_tab-indent-list-item`
- `20_shift-tab-outdent-list-item`
- `21_toggle-mark-selection`
- `22_toggle-block-format-selection`

#### Selection and navigation

- `23_select-single-caret`
- `24_shift-arrow-expand-inline`
- `25_shift-arrow-expand-cross-block`
- `26_mouse-drag-range`
- `27_arrow-nav-cross-block`
- `28_select-table-range`

#### Clipboard

- `29_paste-plain-text`
- `30_paste-html-rich-text`
- `31_paste-markdown-ish`
- `32_paste-large-fragment`
- `33_paste-duplicate-id-fragment`

#### History

- `34_undo-single-change`
- `35_redo-single-change`
- `36_undo-after-large-paste`
- `37_redo-after-structural-edit`

#### Structural relocation

- `38_move-block-up`
- `39_move-list-item`
- `40_swap-adjacent-blocks`

### Family B: Memory benchmarks

This should be as serious as `js-framework-benchmark`, not one hand-wavy
“memory after mount” bullet.

- `51_ready-memory`
  - memory after route load, before doc mount
- `52_mount-1k-memory`
- `53_mount-10k-memory`
- `54_mount-50k-memory`
- `55_typing-churn-memory`
  - repeated typing cycles on loaded document
- `56_paste-clear-memory`
  - repeated large paste then clear cycles
- `57_history-churn-memory`
  - repeated edit + undo + redo cycles
- `58_table-selection-memory`
  - sustained table range activity

### Family C: Startup and boot benchmarks

Directly analogous to the Lighthouse/startup family in
`js-framework-benchmark`.

- `61_startup-time`
  - navigation start to editor-ready state
- `62_consistently-interactive`
  - pessimistic fully-idle interactive point
- `63_script-bootup`
  - parse / compile / evaluate script time
- `64_main-thread-work`
  - total main-thread work during startup
- `65_first-paint`
- `66_first-contentful-paint`
- `67_editor-first-interaction-ready`
  - editor-specific ready gate, not just page-ready

### Family D: Payload and size benchmarks

- `71_size-uncompressed`
- `72_size-compressed`
- `73_editor-route-js`
- `74_editor-route-css`
- `75_total-byte-weight`

Do **not** reduce this to generic app bundle trivia. The spec should define
which code counts as “editor route payload” and which shared shell assets are
counted separately.

### Family E: Correctness and coverage

This is where the current work is still too soft.

The protocol matrix is not optional supporting documentation anymore. It must
become a benchmark gate.

- `81_protocol-coverage`
  - percent of declared protocol cells with executable coverage
- `82_protocol-pass-rate`
  - percent of executed protocol cells passing
- `83_open-critical-regressions`
- `84_open-major-regressions`
- `85_family-completeness`
  - tested / partial / specified / deferred by family

Correctness metrics are **not** rolled into speed.
They are a separate gate and a separate visible family.

## Workload Axes

The spec should define benchmark axes instead of pretending one `10k mixed`
lane tells the truth.

### Document families

Required families:

- `plain-paragraphs`
- `mixed-blocks`
- `heavy-marks`
- `nested-lists`
- `code-heavy`
- `tables`
- `markdown-doc`

### Sizes

Required sizes:

- `1k`
- `5k`
- `10k`
- `50k`

Not every family must run at every size on day one, but the spec should define
the full target matrix.

### Selection shapes

- `collapsed`
- `expanded-inline`
- `expanded-cross-block`
- `backward-expanded`
- `table-range`

### Input sources

- keyboard
- mouse
- clipboard plain
- clipboard html
- clipboard markdown-ish
- programmatic replace

## Result Controls

Copy the `js-framework-benchmark` control philosophy almost whole.

The spec should require:

- `Which editors?`
- `Which benchmarks?`
- `Which document families?`
- `Which sizes?`
- `Which browsers / runs?`
- `Display mode`
- `Trace slice mode`
- `Compare with`
- `Copy/paste selection state`
- `Hide flagged editors`
- `Show only correctness-clean editors`

### Display modes

Required:

- `median`
- `mean`
- `box-plot`

Optional later:

- `p95`
- `worst`

### Trace slice modes

Required target model:

- `total`
- `script`
- `layout`
- `paint`
- `other`

If the runner can only support `total/script/paint` at first, fine. The spec
should still define the richer target and mark the missing slices as an
implementation gap, not silently lower the standard.

### Comparison modes

- compare vs best in column
- compare vs selected baseline editor
- raw values
- slowdown factor
- rank

## Result Tables

The main page should be a dense results table, not a dashboard cosplay.

The spec should require:

- one table-first homepage
- benchmark columns grouped by family
- editors as rows
- sortable by:
  - name
  - per-benchmark value
  - family geometric mean
  - selected baseline delta
- sticky identity columns
- implementation notes / issue flags per editor
- implementation link / docs link per editor

## Charts

Charts are secondary, but they should be meaningful.

Required chart families:

1. scaling lines
   - performance over `1k/5k/10k/50k`
2. family heatmap
   - editor × benchmark-family deltas
3. distribution / box plot
   - selected benchmark across editors
4. startup decomposition
   - startup submetrics by editor
5. memory trend
   - lifecycle memory by editor
6. correctness coverage
   - tested / partial / open by editor/family
7. rank movement / bump chart
   - which editor leads by family

Prune:

- pie charts
- vanity radars
- source-code complexity charts

Those are generic-framework fluff for this repo.

## Known Issues And Gating

This is one of the best `js-framework-benchmark` ideas and we should steal it.

The spec should define a benchmark issue registry:

- issue id
- severity
- affected editor
- affected families
- whether the issue blocks visibility
- link to reproducer / tracker

Editors with unresolved benchmark-invalidating bugs must be:

- flagged in the selector
- optionally hidden from rankings
- never allowed to “win” a lane they fail semantically

## Statistical Policy

The spec rewrite must stop being vague here.

Define:

- warmup count per benchmark family
- measured iteration count
- confidence interval policy
- outlier handling
- CPU throttling policy
- when box plots are required
- when medians vs means are used
- when weighted family means are allowed

Recommendation:

- no single overall score in v1
- family-level geometric means are allowed
- a total benchmark-wide winner badge is not

## Pipeline Contract

Keep the three-stage `js-framework-benchmark` pipeline shape:

1. benchmark execution
2. result aggregation
3. result display

The rewritten spec should define:

- raw result file naming
- per-editor/per-benchmark result payload schema
- compiled dashboard payload schema
- metadata captured with each run:
  - browser version
  - OS
  - machine class
  - throttling mode
  - run timestamp
  - harness version
  - editor implementation revision

## Controls To Prune From The JS Benchmark Model

These do not map cleanly and should be removed:

- keyed / non-keyed split
- vanilla-framework special casing
- row-table specific benchmark descriptions
- generic framework language bragging as a first-class ranking surface

Language / runtime can still appear as metadata, just not as the center of the
UI.

## Controls To Add Beyond The JS Benchmark Model

Because editors are richer, the spec should add:

- document family selector
- size selector
- correctness gate toggle
- protocol family filter
- interaction-source filter
- selection-shape filter

## Rewrite Structure For performance-benchmark-spec.md

The rewritten file should use this order:

1. purpose
2. benchmark philosophy
3. scope and comparison set
4. benchmark families
5. workload axes
6. low-level measured metrics
7. statistical rules
8. correctness gates
9. issue registry policy
10. results UI controls
11. result table contract
12. chart contract
13. pipeline contract
14. publication rules
15. explicit non-goals

## Next Implementation Order

1. Rewrite the spec file completely.
2. Refactor `editor-benchmarks` dashboard design target from dashboard-first to
   table-first.
3. Redesign the data model around benchmark families and stable ids.
4. Expand the runner contract to support startup, memory, and richer CPU slices.
5. Connect correctness/protocol coverage as a visible gate in the UI.
6. Only then start adding more editors.

## Recommendation

Do not half-copy `js-framework-benchmark`.

If we use it as the reference, use the real bones:

- benchmark ids
- benchmark families
- selectors
- display modes
- issue gating
- dense table
- low-level metrics

Anything softer will look like a benchmark site and still behave like a toy.

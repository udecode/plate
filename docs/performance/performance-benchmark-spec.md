# Performance Benchmark Spec

## Purpose

This file defines the benchmark program for Plate's editor-performance work.

It is not a public summary.
It is the contract behind the benchmark runner, the results UI, and any public
claims.

If a benchmark page, doc, or chart says something stronger than this file
supports, that output is wrong.

## Source Of Truth

This benchmark needs two levels of truth:

1. editorial seed sources
2. the benchmark-owned registry

### Editorial seed sources

Performance work here starts from the editor-behavior authority stack:

- [markdown-standards.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-standards.md)
- [markdown-editing-spec.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-editing-spec.md)
- [markdown-parity-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-parity-matrix.md)
- [editor-protocol-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/editor-protocol-matrix.md)

That means:

- Typora is the primary behavioral north star for markdown-native editing
- Google Docs is the primary behavioral north star for tables, document-style
  editing, and review behavior
- Notion is the primary behavioral north star for block-editor-native elements
- GitHub is the primary authority for GFM-only semantics
- Milkdown is the inspectable cross-check

These docs are the best current source for shaping the first benchmark model.

### Benchmark-owned protocol registry

The lasting source of truth for cross-editor benchmarking is not Plate docs.
It is the benchmark-owned registry.

That registry must:

- live with the benchmark program, not inside one editor implementation
- reference Typora / Google Docs / Notion / GitHub / Milkdown directly as the
  real authority stack
- copy scenario structure from the Plate editor-behavior work only as seed
  material, not as permanent law

Rules:

- Plate docs may seed the registry
- Plate docs may not silently define the final benchmark contract for every
  future editor
- once a scenario is promoted into the benchmark-owned registry, that registry
  becomes the benchmark truth

The benchmark must inherit the scenario model from the editor-behavior work,
but it must not stay editorially Plate-owned forever.

## Benchmark Philosophy

This benchmark should copy the best parts of
`js-framework-benchmark`, not the shallow parts:

- stable benchmark ids
- narrow benchmark families
- low-level timing slices
- memory lanes
- startup lanes
- payload lanes
- dense results-first table
- framework and benchmark selectors
- compare-with baseline controls
- issue gating
- reproducible pipeline from raw runs to published results

What it must not copy:

- one fake overall winner score
- domain-irrelevant vanity metrics
- speed claims that ignore correctness

The benchmark is valid only when correctness and performance are both visible.

## Scope

### Rich-text scope

This benchmark targets rich-text markdown editing plus the mainstream editor
surfaces that surround it.

In scope:

- markdown-native editing
- markdown extensions
- tables
- block-editor-native elements that affect real document editing
- styling and layout behavior
- history
- selection
- clipboard behavior
- startup
- memory
- payload size

Out of scope:

- AI workflows
- collaboration / presence / multiplayer
- comment-only chrome
- slash menu / toolbar chrome
- media-hosting quality
- export quality that does not change editing behavior

### Comparison set

The benchmark model is multi-editor by design.

Current editors:

- Plate
- Slate

Future editors can include:

- ProseMirror
- Tiptap
- Lexical

The registry and UI must not hardcode `Plate vs Slate` assumptions.

### Benchmark profiles

This is the missing fairness boundary.

There is no honest single comparison universe for all editor products.
The benchmark must define profiles and rank editors only inside the relevant
profile.

Required profiles:

1. `core-markdown-editor`
   - markdown-native behavior
   - markdown extensions
   - tables
   - history
   - selection
   - clipboard
   - startup / memory / payload
2. `extended-editor-surface`
   - everything in `core-markdown-editor`
   - block-editor-native elements
   - styling and layout behavior

Rules:

- every benchmark lane belongs to at least one profile
- rankings are computed per profile, never across all profiles at once
- unsupported features are shown as `N/A` outside a profile and must not count
  against the editor
- unsupported features inside the active profile disqualify the editor from a
  clean ranking in that profile

This kills the main fairness bug: no editor should lose a markdown benchmark
because another editor also ships callouts, columns, or media blocks.

## Coverage Model

The benchmark program has four suites.

### 1. Protocol Conformance Suite

This is the hard behavioral gate.

It is derived from
[editor-protocol-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/editor-protocol-matrix.md).

Every protocol row is a benchmarkable scenario record with:

- `family`
- `entity`
- `context`
- `selection`
- `caret_or_edge`
- `input`
- `expected`
- `authority`
- `spec_id`
- `evidence`
- `status`

The conformance suite reports:

- pass / fail per protocol row
- tested / partial / specified / deferred status
- coverage by protocol family
- open critical regressions
- open major regressions

This suite is the difference between “fast” and “correct.”

### 2. Interaction Latency Suite

This measures the latency of concrete editing operations.

It is not enough to benchmark mount and typing. The benchmark must measure the
operations users actually hit while editing:

- enter
- backspace
- delete
- tab
- shift+tab
- arrow navigation
- shift+arrow expansion
- click
- drag
- copy
- paste
- undo
- redo
- toggle mark
- toggle block

### 3. Workflow Stress Suite

This measures whole-workflow behavior across realistic document families and
sizes.

It answers:

- how the editor scales
- how setup cost changes with document type
- where repeated editing churn starts to hurt

### 4. Startup, Memory, And Payload Suite

This measures everything outside direct editing latency that still matters in a
production editor:

- startup readiness
- main-thread work
- memory retention
- payload size

## Registry Model

The benchmark registry has two layers:

1. a scenario registry
2. a measurement registry

### Scenario registry

The scenario registry comes from the protocol matrix and remains exhaustive.

Its job is coverage and correctness.

Long term, this registry must become benchmark-owned and editor-neutral.

Minimum scenario-registry fields:

- `scenario_id`
- `profile_ids`
- `protocol_family`
- `feature_family`
- `entity`
- `context`
- `selection_shape`
- `caret_or_edge`
- `input`
- `expected`
- `authority_primary`
- `authority_secondary`
- `authority_syntax`
- `status`
- `timed_candidate`
- `timed_priority`

### Measurement registry

The measurement registry defines benchmark lanes with stable ids.

Its job is timing, memory, startup, and payload.

The benchmark UI should render measurement lanes directly and use the scenario
registry for correctness gating and drill-down.

### Reduction rule: protocol rows to timed lanes

This is mandatory. Without it, the spec becomes a combinatorial joke.

Rules:

1. every protocol row gets correctness status
2. not every protocol row gets a timed benchmark lane
3. timed lanes are chosen by a hard selection formula, not taste
4. a red family can earn more timed lanes, but only after measurement or
   conformance failures justify them

Each timed lane must declare:

- the protocol family it represents
- the feature family it represents
- the operation family it represents
- the workload axes it fixes
- why it is canonical

Hard selection formula:

For each active benchmark profile, for each supported feature family:

1. select one canonical lane for each relevant operation class:
   - `structural-edit`
   - `text-mutation`
   - `selection-navigation`
   - `clipboard`
   - `history`
2. for every selected operation class:
   - include one `collapsed` representative if the family supports collapsed
     editing
   - include one `expanded` representative if the family supports expanded
     editing
3. include one scaling lane for the family across document sizes if the family
   participates in document scaling
4. include one churn or stress lane for the family if repeated interaction is a
   realistic cost center

So the minimum timed set for one feature family is:

- `operation-class × relevant selection classes`
- `+ 1 scaling lane`
- `+ 1 stress lane when warranted`

Escalation rules:

- add family-specific timed lanes only when:
  - a canonical lane is red
  - a protocol row fails in that family
  - the family has a unique owner seam the canonical lane cannot represent
- typical examples of legitimate widening:
  - merged-table paths
  - hard-affinity mark boundaries
  - multiline code-block editing
  - cross-block clipboard replacement

Every protocol family needs:

- at least one canonical timed lane per relevant operation class
- at least one scaling lane
- at least one stress lane if the family is performance-relevant

Escalation rule:

- if a canonical lane is red or unstable, widen that family with more specific
  timed lanes
- if a family is green enough, keep the lane set narrow

That is how we get exhaustive correctness without drowning in meaningless timed
cells.

## Protocol Families

The benchmark must recognize these protocol families from the editor-behavior
source docs:

- `markdown-native`
- `markdown-extension`
- `block-editor-native`
- `styling-layout`
- `collaboration`

Only the first four are part of the current benchmark claim.
`collaboration` stays visible as deferred or excluded, not silently omitted.

## Feature Families

The measurement registry must cover these feature families because they are the
real content surfaces people expect from a Typora-grade markdown editor:

- paragraph
- heading
- blockquote
- unordered list
- ordered list
- task list
- link
- image
- emphasis / italic
- strong / bold
- inline code
- fenced code block
- thematic break
- hard line break
- table
- strikethrough
- inline math
- block math
- autolink literal
- footnote
- mention
- callout
- toggle
- date
- table of contents
- columns
- media blocks
- caption
- indent
- text align
- text indent
- line height
- font family / size / weight / color / background

Not every editor will support every family. Unsupported families must be shown
as unsupported, not dropped from the model.

But unsupported does not mean “ranking loser.” Whether unsupported families
matter depends on the active benchmark profile.

## Workload Axes

Every interaction lane should be taggable by these axes:

- `family`
- `entity`
- `context`
- `selection_shape`
- `caret_or_edge`
- `input_source`
- `document_family`
- `document_size`

### Document families

Required document families:

- `plain-paragraphs`
- `mixed-markdown`
- `quote-heavy`
- `list-heavy`
- `task-list-heavy`
- `code-heavy`
- `table-heavy`
- `heavy-marks`
- `mixed-rich-text`

### Document sizes

Required sizes:

- `1k`
- `5k`
- `10k`
- `50k`

### Selection shapes

Required shapes:

- `collapsed`
- `expanded-inline`
- `expanded-multiblock`
- `backward-expanded`
- `cell-range`
- `node-selected`

### Input sources

Required sources:

- keyboard
- mouse
- clipboard-plain
- clipboard-html
- clipboard-markdown
- programmatic

## Fixture And Corpus Contract

“Same scenario” must mean the same semantic document, not two hand-built docs
that feel similar.

The benchmark needs a neutral fixture layer.

### Fixture registry

Every benchmark lane must point at a canonical fixture id.

Each fixture entry needs:

- `fixture_id`
- `profile_ids`
- `document_family`
- `document_size`
- `semantic_source`
- `serialization_variants`
- `required_feature_families`

### Corpus sources

Fixtures should come from:

- minimal canonical handwritten fixtures for narrow operation lanes
- larger benchmark corpora for stress lanes
- reference-derived markdown corpora when that improves realism

### Serialization variants

Each fixture can have multiple source representations:

- markdown
- html
- editor-native json

Rules:

- one semantic fixture, many adapters
- adapters must preserve the declared semantic fixture, not invent per-editor
  equivalents
- the semantic fixture id is the comparison anchor

### Adapter rules

Editors may adapt the fixture into their internal model, but they may not:

- drop required blocks or marks without declaring `unsupported`
- rewrite the workload into a simpler semantic document
- silently skip unsupported constructs

If an editor cannot represent a required construct for the active profile, the
lane is `N/A` or disqualifying according to the profile rules. It is not
allowed to mutate the corpus into a different workload and call it fair.

## Interaction Benchmark Families

The interaction suite should mirror the stable-id style of
`js-framework-benchmark`.

### Family A: Core lifecycle and document replacement

- `01_ready-empty`
  - load the editor route and wait until the empty editor is ready for input
- `02_mount-1k`
- `03_mount-10k`
- `04_mount-50k`
- `05_replace-same-size`

### Family B: Incremental document growth and teardown

- `06_append-1k-to-1k`
- `07_append-5k-to-10k`
- `08_remove-single-block`
- `09_clear-document`

### Family C: Local text mutation

- `10_type-middle`
- `11_type-start`
- `12_type-end`
- `13_type-inside-marked-text`
- `14_partial-update-every-10th-block`
- `15_partial-update-every-10th-leaf`

### Family D: Structural editing

- `16_enter-split-paragraph`
- `17_backspace-merge-block`
- `18_delete-forward-merge`
- `19_tab-indent`
- `20_shift-tab-outdent`
- `21_toggle-mark-selection`
- `22_toggle-block-selection`

### Family E: Selection and navigation

- `23_select-single-caret`
- `24_shift-arrow-expand-inline`
- `25_shift-arrow-expand-cross-block`
- `26_mouse-drag-range`
- `27_arrow-nav-cross-block`
- `28_select-table-range`

### Family F: Clipboard

- `29_paste-plain-text`
- `30_paste-html-rich-text`
- `31_paste-markdown`
- `32_paste-large-fragment`
- `33_paste-duplicate-id-fragment`

### Family G: History

- `34_undo-single-change`
- `35_redo-single-change`
- `36_undo-after-large-paste`
- `37_redo-after-structural-edit`

### Family H: Structural relocation

- `38_move-block-up`
- `39_move-list-item`
- `40_swap-adjacent-blocks`

## Feature-Directed Interaction Coverage

The benchmark ids above are generic operation ids. They must be instantiated
across feature families.

For a Typora-grade benchmark, the interaction registry must include at least
these concrete feature + operation combinations:

- paragraph: enter, backspace, delete, tab, shift+tab
- heading: enter, backspace
- blockquote: enter, backspace, tab, shift+tab
- unordered list: enter, backspace, tab, shift+tab
- ordered list: enter, backspace, tab, shift+tab
- task list: enter, backspace, toggle checked state
- link: boundary typing and deletion
- emphasis / strong: boundary typing
- inline code: hard-boundary typing
- code block: enter, backspace, tab, shift+tab, select-all
- hard line break: serialize and edit preservation
- table: enter, backspace, tab, shift+tab, arrow nav, cell-range, copy, paste,
  row insert/delete, column insert/delete
- strikethrough: boundary typing
- math: inline and block boundary behavior
- callout: enter and delete behavior
- toggle: open/close and nested editing
- columns: split and movement behavior
- media blocks and caption: adjacency and caption movement
- styling/layout: apply and remove style runs without corrupting markdown

These are the minimum canonical timed representatives.
The protocol matrix remains broader than this list.

## Timing Slices

CPU and interaction benchmarks must reserve these slices:

- `total`
- `script`
- `layout`
- `paint`
- `other`

The current runner may not expose every slice yet.
That is an implementation gap, not a reason to shrink the spec.

## Statistical Requirements

Every timed lane must record:

- raw samples
- mean
- median
- standard deviation
- p95
- confidence interval

Every lane must also declare:

- warmup count
- measured iteration count
- throttling mode
- whether layout events are required

The benchmark UI must support these display modes:

- `mean`
- `median`
- `box-plot`

Optional later:

- `p95`
- `worst`

The result payload should still store `p95` and `worst` even if the first UI
pass does not surface them yet.

## CPU Throttling Policy

Like `js-framework-benchmark`, not every lane should run at the same CPU
profile.

Heavy interaction lanes should support throttled runs where that makes the
difference visible:

- partial updates
- selection
- row/column-like structural moves
- table selection
- clipboard stress

The benchmark artifact must record the exact throttle factor for every run.

## Memory Suite

Memory is not one number.

The required memory lanes are:

- `51_ready-memory`
  - memory after route load and before document mount
- `52_mount-1k-memory`
- `53_mount-10k-memory`
- `54_mount-50k-memory`
- `55_typing-churn-memory`
  - repeated typing cycles on a mounted document
- `56_paste-clear-memory`
  - repeated large paste and clear cycles
- `57_history-churn-memory`
  - repeated edit, undo, redo cycles
- `58_table-selection-memory`

Memory results should include:

- used heap
- heap delta
- retained delta after idle

## Deferred Benchmark Suites

The benchmark must explicitly list real editor dimensions that are deferred
instead of pretending they do not exist.

### Deferred suite A: Cross-app clipboard fidelity

Current active clipboard lanes cover direct editor-side paste costs.

Deferred here:

- cross-app copy/paste between reference products and benchmark editors
- richer clipboard fidelity matrices by source app and payload kind
- exact preservation scoring for html/markdown hybrids

### Deferred suite B: Pointer and drag behavior

Current active selection lanes cover basic range and table selection cost.

Deferred here:

- document drag-selection parity at full protocol depth
- block drag and block relocation via pointer
- richer pointer-selection conformance sweeps

### Deferred suite C: Platform shortcuts

Deferred here:

- platform-specific shortcut matrices
- OS-specific modifier behavior
- editor command parity under native shortcut sets

### Deferred suite D: IME and composition

Deferred here:

- composition event correctness
- IME-specific latency
- partial-composition interaction with marks, tables, code, and inline atoms

Rules:

- deferred suites stay visible in the benchmark model
- deferred suites do not count toward current headline claims
- deferred suites should appear in the UI as empty or deferred families rather
  than disappearing

## Startup Suite

The startup suite should match the rigor of the startup and Lighthouse lanes in
`js-framework-benchmark`.

Required startup lanes:

- `61_startup-time`
- `62_consistently-interactive`
- `63_script-bootup`
- `64_main-thread-work`
- `65_first-paint`
- `66_first-contentful-paint`
- `67_editor-ready`

`editor-ready` is editor-specific and required. A page that painted is not
necessarily an editor that is ready for input.

## Publication Environment

Headline benchmark publication uses one environment first.

Required primary environment:

- browser: `Chrome stable`
- machine:
  - `MacBook Pro 16-inch`
  - color: `Space Black`
  - chip: `Apple M5 Max`
  - CPU: `18-core`
  - GPU: `40-core`
  - Neural Engine: `16-core`
  - memory: `128 GB unified memory`
  - storage: `2 TB SSD`

This machine profile must be recorded exactly in published artifacts and result
metadata.

Required captured environment metadata:

- browser channel and exact version
- macOS version
- machine profile id
- CPU throttle mode
- power mode if relevant
- harness version
- capture timestamp

Deferred environments:

- Safari stable
- Firefox stable
- Windows and Linux reference machines

Those are explicitly deferred, not forgotten. The benchmark UI should expose
the current browser/environment selector model even if only one environment is
populated at first.

## Payload Suite

Required payload lanes:

- `71_size-uncompressed`
- `72_size-compressed`
- `73_editor-route-js`
- `74_editor-route-css`
- `75_total-byte-weight`

Payload should be reported per editor route, not as a vague app bundle total.

## Correctness Gate

Correctness is a first-class suite, not a note beside performance.

Required correctness metrics:

- `81_protocol-coverage`
- `82_protocol-pass-rate`
- `83_open-critical-regressions`
- `84_open-major-regressions`
- `85_family-completeness`

An editor with unresolved correctness failures must be visibly flagged.

The UI must support:

- show all editors
- hide flagged editors
- show only correctness-clean editors

Correctness-clean means:

- no critical open regressions in the active profile
- no major open regressions in the active family being ranked
- no missing required conformance coverage in the active profile

No editor should appear as a clean performance leader when it fails protocol
rows in the same family.

## Issue Registry

The benchmark system should maintain a known-issues registry similar to
`js-framework-benchmark`.

Each issue entry needs:

- stable issue id
- severity
- affected editor
- affected benchmark families
- whether the issue blocks ranking
- link to tracker evidence

The results UI must show:

- issue badges per editor
- notes row per editor
- option to hide flagged editors

## Result Table Contract

The homepage must be a dense results table.

Not a dashboard.
Not cards first.
Not charts first.

Table model:

- editors are rows
- benchmark lanes are columns
- lanes are grouped by benchmark family
- cells show:
  - value
  - slowdown factor or delta
  - optionally confidence interval

Sortable keys:

- editor name
- any benchmark lane
- any family mean
- selected baseline delta

Required sticky surfaces:

- sticky identity column
- sticky family headers
- sticky control bar

Required editor metadata rows:

- notes
- issue flags
- implementation links
- docs links

## Control Surface

The result app should expose these controls:

- `Which editors?`
- `Which benchmarks?`
- `Which profile?`
- `Which protocol families?`
- `Which document families?`
- `Which sizes?`
- `Which environment?`
- `Display mode`
- `Duration slice`
- `Compare with`
- `Hide flagged`
- `Show only correctness-clean`
- `Copy / paste current selection state`

If a control does not map to a meaningful benchmark dimension, it should not
exist.

## Chart Contract

Charts are secondary views.
They must help someone understand the table, not replace it.

Required chart families:

1. scaling lines
   - benchmark value by document size
2. family heatmap
   - editor by benchmark family
3. box plots
   - sample distribution for selected lanes
4. startup decomposition
5. memory trend
6. correctness coverage
7. rank movement by family

Do not add:

- pie charts
- radars
- source-code complexity charts
- vanity “overall score” donuts

## Ranking Rules

Allowed:

- per-lane winner
- per-family geometric mean
- per-baseline delta
- per-profile ranking

Not allowed:

- one benchmark-wide total winner score
- a blended score that hides correctness failures

If an editor is missing support for a family, that family stays visible as
unsupported.

Ranking rules:

- `N/A` outside the active profile: visible, excluded from ranking
- `N/A` inside the active profile: visible, disqualifying for clean ranking
- flagged but supported: visible, optionally hidden, not silently merged into a
  clean leaderboard

## Pipeline Contract

The benchmark pipeline has three stages, just like
`js-framework-benchmark`:

1. benchmark execution
2. result aggregation
3. result display

### Raw result schema

Every raw result file must capture:

- editor id
- editor version or commit
- benchmark id
- benchmark family
- workload axes
- timing slices
- raw samples
- statistics
- browser version
- browser channel
- OS
- machine class
- machine profile id
- CPU throttle
- harness version
- capture time

### Aggregated result schema

The compiled results payload must include:

- editor metadata
- benchmark registry
- aggregated values
- issue registry
- correctness registry summary

The UI should not compute benchmark identity from ad hoc labels.
The ids and family groupings belong in the registry.

## Fairness Rules

Any headline comparison must satisfy all of these:

1. same scenario
2. same document family
3. same document size
4. same input source
5. same benchmark runner
6. same browser/runtime environment
7. same capture settings
8. no hidden correctness failure in that family
9. same active profile

If any of those drift, the lane is no longer headline material.

## Publication Rules

Public benchmark pages may claim:

- exact lane values
- deltas versus a baseline
- family-level performance patterns
- correctness coverage
- clear caveats

Public benchmark pages may not claim:

- fastest editor overall
- best editor overall
- one synthetic number that tells the whole truth

## Current Implementation Standard

A benchmark implementation in this repo is only credible when it has:

- a stable benchmark id
- a declared family
- a declared workload shape
- a correctness interpretation
- real raw samples
- reproducible capture settings

Anything less is a probe, not a benchmark lane.

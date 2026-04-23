# Standalone Benchmark Gap Analysis

## Why the standalone lab exposed a different result

The new standalone benchmark lab under
[benchmarks/editor](/Users/zbeyens/git/plate-2/benchmarks/editor) did not
invalidate the earlier public `apps/www` numbers.

It measured a different surface.

That distinction matters because the current public guide originally read too
broadly, while the underlying data was only strong for the simpler docs harness.

## Two benchmark surfaces

### Public docs harness

The public numbers in
[performance.mdx](/Users/zbeyens/git/plate-2/content/(guides)/performance.mdx)
come from:

- [editor-perf/page.tsx](/Users/zbeyens/git/plate-2/apps/www/src/app/dev/editor-perf/page.tsx)
- [run-editor-perf.mts](/Users/zbeyens/git/plate-2/apps/www/scripts/run-editor-perf.mts)
- [editor-perf-public-summary-3020.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-public-summary-3020.json)

That public harness uses:

- chunking on
- chunk size `1000`
- a simplified `huge-mixed-block` fixture from
  [workloads.ts](/Users/zbeyens/git/plate-2/apps/www/src/app/dev/editor-perf/workloads.ts)
- a large-doc shape that is mostly headings plus paragraphs

Headline result there:

- Plate core `10k` mixed mount: `475.61 ms`
- Slate `10k` mixed mount: `529.58 ms`

That harness is still useful.
It answers the narrower question:

> Does Plate add a large tax on the simpler chunked large-document route we use
> in the docs perf surface?

Right now, no.

### Standalone benchmark lab

The standalone lab uses:

- [benchmarks/editor/apps/shared/fixtures.ts](/Users/zbeyens/git/plate-2/benchmarks/editor/apps/shared/fixtures.ts)
- [benchmarks/editor/apps/plate/src/App.tsx](/Users/zbeyens/git/plate-2/benchmarks/editor/apps/plate/src/App.tsx)
- [benchmarks/editor/apps/slate/src/App.tsx](/Users/zbeyens/git/plate-2/benchmarks/editor/apps/slate/src/App.tsx)
- [core-markdown-live.json](/Users/zbeyens/git/plate-2/benchmarks/editor/data/results/core-markdown-live.json)

That `mixed-markdown-10k` fixture is much richer:

- headings
- rich marks
- blockquotes
- unordered lists
- ordered lists
- code blocks
- link-like rows

Headline result there:

- Plate `03_mount-10k`: `736.30 ms`
- Slate `03_mount-10k`: `437.60 ms`

That is not a contradiction.
It is a different workload.

## Current diagnosis

### 1. The public harness was simpler than the standalone profile

This is the main reason the gap appeared.

The old public harness mostly stressed:

- plain block rendering
- chunked large-doc mount
- simpler plugin composition

The standalone rich-markdown fixture stresses:

- list normalization
- richer node-type mix
- code-block mount
- blockquote and mark-heavy render paths

So the standalone gap does **not** prove the public benchmark was fake.
It proves the public benchmark was narrower.

### 2. The red tax is in richer element and mark composition, not generic core mount

We now have decomposition rows from the standalone lab:

| Lane | Plate | Slate | Read |
| --- | ---: | ---: | --- |
| `41_mount-10k-plain-core` | `215.20 ms` | `197.90 ms` | same class, Plate somewhat slower |
| `42_mount-10k-plain-basic` | `212.60 ms` | `193.40 ms` | same class, Plate somewhat slower |
| `43_mount-10k-blockquote-core` | `163.90 ms` | `403.00 ms` | Plate faster |
| `44_mount-10k-blockquote-basic` | `524.10 ms` | `447.30 ms` | Plate clearly slower |
| `45_mount-10k-code-core` | `102.20 ms` | `387.70 ms` | Plate faster |
| `46_mount-10k-code-basic` | `129.80 ms` | `384.00 ms` | Plate faster |
| `47_mount-10k-marks-core` | `1227.50 ms` | `925.50 ms` | both expensive, Plate worse |
| `48_mount-10k-marks-basic` | `1299.80 ms` | `889.50 ms` | Plate much worse |
| `49_mount-10k-list-markdown` | `890.40 ms` | `630.10 ms` | Plate much worse |
| `86_mount-10k-bold-basic` | `585.90 ms` | `375.90 ms` | Plate much worse |
| `87_mount-10k-italic-basic` | `622.10 ms` | `345.30 ms` | Plate much worse |
| `88_mount-10k-underline-basic` | `591.40 ms` | `332.00 ms` | Plate much worse |
| `89_mount-10k-strikethrough-basic` | `580.70 ms` | `334.40 ms` | Plate worst in this set |
| `90_mount-10k-bold-single` | `424.50 ms` | `343.20 ms` | single-plugin helps, still red |
| `91_mount-10k-italic-single` | `422.60 ms` | `339.80 ms` | single-plugin helps, still red |
| `92_mount-10k-underline-single` | `428.00 ms` | `345.60 ms` | single-plugin helps, still red |
| `93_mount-10k-strikethrough-single` | `450.10 ms` | `384.80 ms` | single-plugin helps, still worst |

The `90..93` rows are from targeted direct standalone probes, not yet from the
main frozen batch artifact.

That changes the diagnosis:

- generic Plate core mount is **not** the main story
- plain paragraphs are slower, but not catastrophic
- code-heavy mount is actually fine
- blockquote becomes red only once the richer basic bundle is in play
- heavy marks are a major red zone
- every basic mark we measured is materially slower than Slate
- `strikethrough` is the worst single mark, but not uniquely bad
- switching from `BasicMarksPlugin` to a single mark plugin helps a lot, but it
  still leaves a real red gap
- list-heavy markdown is a major red zone

So the likely problem is not "Plate mount is just slow."
The likely problem is:

- richer mark composition
- richer block renderer composition
- list normalization / list shaping

working together on the richer markdown fixture.

### 3. Lists are still a first-class suspect, but not the only one

The standalone fixture still feeds Slate true nested list containers:

- `bulleted-list`
- `numbered-list`
- `list-item`

But for Plate, the fixture adapter currently flattens list containers into
paragraph blocks with:

- `indent: 1`
- `listStyleType: 'disc' | 'decimal'`

That still makes `ListPlugin` a real suspect.
It is just no longer the only suspect, because the new heavy-marks and
blockquote-basic rows also go red.

### 4. The standalone mutation lanes are still too coarse

The live contract results show most edit lanes clustering around `50 ms`:

- `10_type-middle`: Plate `50.00 ms`, Slate `50.10 ms`
- `29_paste-plain-text`: Plate `49.90 ms`, Slate `50.00 ms`
- `30_paste-html-rich-text`: Plate `49.80 ms`, Slate `50.30 ms`
- `34_undo-single-change`: Plate `50.00 ms`, Slate `50.00 ms`

That is not a believable story about perfect parity.
It is a measurement artifact.

The current shell waits on a fixed `requestAnimationFrame` cadence, so the edit
lanes are effectively quantized by the browser/frame clock in headless preview.

Conclusion:

- current standalone mount numbers are useful
- current standalone mutation numbers are directionally okay at best
- edit lanes need a better completion signal before they deserve deep reading

## What this means

The real live story today is:

- Plate is still competitive on the simpler chunked docs harness
- Plate is slower on the richer standalone `10k` markdown mount lane
- the standalone mount gap is real
- the decomposition says the red zone is richer mark/list/blockquote work, not
  generic core mount
- the standalone mutation near-parity is not trustworthy enough yet because the
  measurement seam is too coarse

## What to optimize next

### Priority 1: attack heavy marks first

This is now the clearest red lane.

`47_mount-10k-marks-core` is already worse than Slate.
`48_mount-10k-marks-basic` is still dramatically worse.

The single-mark rows make the next step clearer:

- bold basic: `585.90 ms` vs `375.90 ms`
- italic basic: `622.10 ms` vs `345.30 ms`
- underline basic: `591.40 ms` vs `332.00 ms`
- strikethrough basic: `580.70 ms` vs `334.40 ms`
- bold single: `424.50 ms` vs `343.20 ms`
- italic single: `422.60 ms` vs `339.80 ms`
- underline single: `428.00 ms` vs `345.60 ms`
- strikethrough single: `450.10 ms` vs `384.80 ms`

That means:

- the whole basic-mark path is expensive
- `BasicMarksPlugin` bundle fan-out adds meaningful extra cost
- even the single-plugin path is still red
- `strikethrough` is the worst measured mark
- this is not one isolated plugin bug
- it is a mark-render class problem with one especially bad leaf

That points at mark-heavy render composition as a real mount tax in the richer
standalone surface.

### 2b. What the current lower-bound rows and DOM probe actually proved

The earlier trace was useful, but it hid one important thing:

- it only counted the keyed active work we instrumented
- it did **not** prove that Plate had stopped paying inactive per-leaf runtime
  overhead

The next direct lower-bound rows made that clearer:

| Lane | Plate | Slate | Read |
| --- | ---: | ---: | --- |
| `86_mount-10k-bold-basic` | `678.10 ms` | `458.20 ms` | full basic-marks bundle still clearly red |
| `90_mount-10k-bold-single` | `496.40 ms` | `463.90 ms` | single bold plugin is much better, but still slower |
| `94_mount-10k-bold-direct` | `436.10 ms` | `468.40 ms` | direct `renderLeaf` lower bound is already fine |

That split is the real answer:

- `BasicMarksPlugin` is still paying large bundle-side fan-out above the direct
  bold lower bound
- the single bold path still pays about `60 ms` above the direct lower bound
- the direct lower bound itself is already in the same class as Slate

So the red lane is **not** "Plate cannot mount bold leaves fast enough."
It is the work Plate chooses to do around that mount.

The DOM probe on `90_mount-10k-bold-single` makes that even more explicit.

For the whole `10k` bold fixture, both editors mount the same leaf topology:

- `10,000` `<strong>` nodes
- `30,000` `[data-slate-leaf]` nodes
- `30,000` `[data-slate-string]` nodes
- `90,000` `<span>` nodes

The first paragraph is also almost the same shape:

- Plate:
  `<div data-slate-node="element" data-block-id="..." class="slate-p">...`
- Slate:
  `<p data-slate-node="element" style="content-visibility:auto">...`

So the bold gap is **not** caused by extra leaf DOM nodes.

It is caused by runtime work before the commit:

1. `BasicMarksPlugin` bundle fan-out
   - `pipeRenderLeaf(...)` and `pipeRenderText(...)` were still visiting
     inactive mark renderers on every leaf/text node
   - the kept cut now keys both paths by active mark and skips inactive
     renderers
2. active single-mark runtime
   - even after removing bundle fan-out, the single bold path still pays the
     shared `pipeRenderLeaf(...)` / `pluginRenderLeaf(...)` machinery above the
     direct lower bound
3. not setup, not DOM size
   - editor creation and `useEditableProps(...)` assembly are small
   - the mounted DOM shape is already basically equivalent

That is the current exact cause statement.

The optimization order is now justified, not guessed:

1. kill inactive bundle fan-out in `pipeRenderLeaf(...)`
2. kill inactive bundle fan-out in `pipeRenderText(...)`
3. if the single-mark lane is still red after that, attack the active shared
   mark runtime itself

### 2c. What happened after the inactive fan-out cut

The kept current package cut did exactly what it was supposed to do:

- `pipeRenderLeaf(...)` now skips inactive sibling mark renderers
- `pipeRenderText(...)` now skips inactive sibling text renderers

After that cut, the next direct standalone probes on the Plate target changed
the conclusion again.

Repeated local-preview runs for the bold rows were noisy, but the stable read
was:

- the single bold lane moved much closer to the direct rows
- the large remaining tax stayed in the full `BasicMarksPlugin` bundle lane
- the custom direct `renderLeaf` probes were not a trustworthy permanent
  benchmark row for this standalone shell; they were useful diagnostics, not a
  clean new headline lane

The important consequence is:

- the earlier "active single-mark runtime is obviously the next wall" story is
  too strong now
- after removing inactive sibling fan-out, the next honest red seam is still
  the mark bundle path, not the isolated bold plugin path

One fresh standalone rerun on the kept final state landed here:

- `86_mount-10k-bold-basic`: Plate `639.10 ms`, Slate `582.00 ms`
- `90_mount-10k-bold-single`: Plate `434.60 ms`, Slate `578.50 ms`
- `94_mount-10k-bold-direct`: Plate `484.50 ms`, Slate `544.30 ms`

That is noisy in the absolute numbers, but the shape is the point:

- the full basic bundle still pays the visible bill
- the single bold path is no longer the obvious next emergency
- the direct lower-bound probes do not justify more package surgery on the
  isolated bold path right now

The next kept mark cut stayed inside the leaf pipe itself:

- `pipeRenderLeaf(...)` now handles simple active leaf marks directly instead
  of routing them back through `pluginRenderLeaf(...)`
- that keeps the existing semantics for:
  - nested simple marks
  - hard-affinity leaf spacers
  - complex leaves that still need the generic path

Fresh full-batch rows on the kept final state:

- `47_mount-10k-marks-core`: Plate `1227.50 ms`, Slate `925.50 ms`
- `48_mount-10k-marks-basic`: Plate `1299.80 ms`, Slate `889.50 ms`
- `86_mount-10k-bold-basic`: Plate `585.90 ms`, Slate `375.90 ms`
- `87_mount-10k-italic-basic`: Plate `622.10 ms`, Slate `345.30 ms`
- `88_mount-10k-underline-basic`: Plate `591.40 ms`, Slate `332.00 ms`
- `89_mount-10k-strikethrough-basic`: Plate `580.70 ms`, Slate `334.40 ms`
- `90_mount-10k-bold-single`: Plate `424.50 ms`, Slate `343.20 ms`

Compared to the pre-batch standalone snapshot, that means:

- `48_mount-10k-marks-basic`: about `1387 ms -> 1310 ms`
- `86_mount-10k-bold-basic`: about `673 ms -> 597 ms`
- `90_mount-10k-bold-single`: about `439 ms -> 428 ms`

That is a real win.

The lane is still red, but the cut moved both the heavy bundle lane and the
single-mark lane in the right direction, which the earlier hook-elision batch
failed to do.

The next widened decomposition also ruled out an easy special-mark scapegoat.

Fresh rows for the remaining unmeasured marks:

- `98_mount-10k-code-basic`: Plate `418.70 ms`, Slate `387.00 ms`
- `99_mount-10k-code-single`: Plate `450.30 ms`, Slate `365.80 ms`
- `100_mount-10k-subscript-basic`: Plate `410.90 ms`, Slate `382.80 ms`
- `101_mount-10k-subscript-single`: Plate `395.00 ms`, Slate `340.10 ms`
- `102_mount-10k-superscript-basic`: Plate `395.30 ms`, Slate `384.20 ms`
- `103_mount-10k-superscript-single`: Plate `400.00 ms`, Slate `359.10 ms`

Take:

- no single special mark is catastrophically worse than the rest
- `code` is not secretly the whole problem
- directional marks (`sub`, `sup`, `strikethrough`) are red, but not enough on
  their own to explain the full `marks-basic` wall
- the remaining `marks-basic` bill is mostly aggregate mark composition across
  many marked leaves, not one hidden monster plugin

So the current optimization order becomes:

1. keep the inactive bundle fan-out cut
2. keep the direct simple-mark leaf path
3. keep the hybrid activation scan in the shared mark pipes so plain leaves do
   not pay the full simple-mark loop while marked leaves still avoid
   `Object.keys(...).flatMap(...).sort(...)` churn
4. treat `BasicMarksPlugin` bundle composition as the next real seam only after
   those shared-pipe wins are frozen

The latest kept mark cut is exactly that hybrid scan.

What changed:

- the first naive "iterate every simple entry every time" batch helped marked
  leaves and hurt plain leaves inside rich paragraphs
- the kept version first checks whether a leaf/text node owns any relevant
  simple or complex mark keys
- only then does it walk the already ordered mark arrays

That keeps the two good properties together:

- marked leaves stop paying per-render allocation and sort churn
- plain leaves stop paying the full mark-entry loop

Focused reruns on the kept hybrid path landed here:

- `48_mount-10k-marks-basic`: Plate `1244.70 ms`, Slate `903.00 ms`
- `86_mount-10k-bold-basic`: Plate `557.20 ms`, Slate `335.60 ms`
- `87_mount-10k-italic-basic`: Plate `547.90 ms`, Slate `339.40 ms`
- `89_mount-10k-strikethrough-basic`: Plate `555.50 ms`, Slate `344.50 ms`
- `90_mount-10k-bold-single`: Plate `399.90 ms`, Slate `342.50 ms`
- `91_mount-10k-italic-single`: Plate `388.30 ms`, Slate `349.90 ms`
- `93_mount-10k-strikethrough-single`: Plate `439.80 ms`, Slate `339.60 ms`

That is the cleanest remaining shared-pipe win so far.

### Priority 2: isolate list normalization cost

Specifically check whether the Plate fixture adapter plus `ListPlugin` mount
path is doing expensive reshaping on initial value.

The likely question is:

> How much of the `03_mount-10k` gap is really "rich markdown", and how much is
> just list normalization on mount?

The `49_mount-10k-list-markdown` row says list work is still very red.
So this is still high priority.

That split is no longer hypothetical. The dedicated list rows say:

- `49_mount-10k-list-markdown`: Plate `890.40 ms`, Slate `630.10 ms`
- `96_mount-10k-list-core`: Plate `622.70 ms`, Slate `679.20 ms`
- `97_mount-10k-list-only`: Plate `848.70 ms`, Slate `671.70 ms`

That means:

- the flattened Plate list fixture itself is not the main problem
- `ListPlugin` is the problem
- the extra markdown bundle around `ListPlugin` adds only a small extra tax on
  top of that

The DOM probe made the reason concrete:

- Plate `list-core`: `0` `<ul>`, `0` `<li>`, `30,000` paragraph nodes
- original Plate `list-only`: `30,000` `<ul>`, `30,000` `<li>`,
  `30,000` paragraph nodes
- fixed Plate `list-only`: `0` `<ul>`, `0` `<li>`, `30,000`
  `[role="listitem"]` paragraphs
- Slate nested list lane: `10,000` `<ul>`, `30,000` `<li>`

So the original list cliff was not mysterious.

Plate's original flattened-list render model created one list container per
item instead of styling the paragraph element itself.

That was the exact cause.

The kept fix has three parts:

1. unordered list items stop using `belowNodes` wrappers
2. unordered list metadata is injected onto the paragraph element itself:
   - `role="listitem"`
   - `display: list-item`
   - `listStyleType`
3. `pipeRenderElement(...)` keeps the plain fast path when:
   - there are no active `belowNodes` wrappers for the current element
   - inject props are pathless

That is why the lane moved:

- `97_mount-10k-list-only`: about `1564 ms -> 849 ms`
- `49_mount-10k-list-markdown`: about `1452 ms -> 890 ms`

The remaining list work is no longer the main embarrassment.

### Priority 3: investigate blockquote/basic composition tax

`43_mount-10k-blockquote-core` is good.
`44_mount-10k-blockquote-basic` is not.

That means the red tax is not blockquote itself.
It is what the richer basic surface adds around it.

That makes blockquote a good focused seam for tracing element/render overhead
without list complexity muddying the picture.

### Priority 4: improve mutation timing methodology

Before reading too much into the `~50 ms` edit lanes, stop using the current
fixed-frame settle as the main contract.

Replace it with something closer to:

- operation start
- editor mutation
- DOM/selection settle signal
- sampled wall time

Until that is fixed, mount is the honest lane.
Typing/paste/undo are not yet good enough to drive major optimization decisions.

### Priority 5: keep the public guide scoped

The public docs should keep saying exactly what the public harness proves, not
what the richer lab might eventually prove.

That means:

- public docs can talk about the simpler large-document overhead story
- richer standalone markdown results belong in the benchmark lab and technical
  performance docs until that methodology hardens

## Blunt takeaway

The surprising part was not that Plate can lose on a richer workload.
The surprising part was that the simpler public docs harness sounded broad
enough to hide that distinction.

The fix is not to throw out the old benchmark.
The fix is:

1. keep the old harness scoped honestly
2. trust the new decomposition rows
3. attack the shared single-mark path first
4. then attack `BasicMarksPlugin` fan-out
5. then attack `strikethrough`
6. attack list normalization next

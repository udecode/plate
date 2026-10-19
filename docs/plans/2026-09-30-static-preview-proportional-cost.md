---
review_scopes:
  - html
  - code
review_basis:
  - 2026-09-29-static-preview-document-review
  - 2026-09-30-static-preview-decoration-cost-review
  - 2026-09-22-code-last-pass-ownership-gates
work_kind: implementation
---

# Static preview proportional cost

Status: Complete — every item adopted and measured on the final tree (S5 runs
pp3 and pp4); per-block caching and chunking deferred on browser evidence.

Objective:

A streamed preview costs work in proportion to what changed. It keeps the
main thread responsive and stays equal to a fresh render. Decorations follow
one contract in live and static views. Presence decorations stay out of static
output and out of other documents.

Completion threshold:

1. Static decoration reads cost in proportion to the change, or to the nodes
   a source actually decorates.
   - Code highlighting reads once per code block.
   - The Plate source wrapper and the Plite reads under it drop their
     per-node overhead.
2. Streamed previews render the latest document without saturating the main
   thread (deferred rendering).
3. A generative oracle proves that a reused static render equals a fresh
   render for sharing document sequences.
4. Presence decorations (remote cursors, find) never paint another document or
   static output. Comments and suggestions are proven on foreign documents.
5. HTML gaps are closed: an image list item keeps `listType`, and HTML
   attributes that no decoder reads are accounted on parse.
6. The schema-construction locality benchmark is robust under machine load.
7. S5 static and AI cells are re-measured on the final tree. Docs, doctrine,
   changesets, registry output and the ledger are current.

Verification surface:

Plite and platejs partitions, the static oracle, registry specs, HTML
conformance, the benchmark test under load, S5 Chromium cells, and the www and
doctrine gates.

Constraints:

No mutable stable view. React Server Components keep working. Decorations keep
the live editor's invalidation contract. No staging or commit; the user owns
commits on `next`.

Boundaries:

- Plite owns decoration sources, views and reads.
- Plate owns the static renderer and the decoration source wrapper.
- Feature plugins own their sources.
- Registry UI owns presentation and scheduling.
- The html-accounting lane owns the HTML leftovers.
- A benchmark lane owns the flaky benchmark.
- An oracle lane owns the new generative spec.

Blocked condition:

None. If decoration caching needs a public declaration, that API gets a Best
API decision recorded in this plan before it is implemented.

Work Checklist:

- [x] Decoration cost: element-level code highlighting, the wrapper, Plite
  read overhead, the AI preview background and end marker, and fast
  equality.
- [x] Deferred rendering for streamed previews.
- [x] Static oracle (lane).
- [x] Presence and foreign-document decorations.
- [x] HTML leftovers (lane html-accounting).
- [x] Benchmark robustness (lane).
- [x] Per-block decoration caching and chunked rendering, decided on measured
  cost (both deferred on browser evidence).
- [x] S5 re-measure; docs, doctrine, changesets, registry output and ledger.

## Decisions

### First-principles target

The live editor already maintains decorations incrementally. A source's
`read(entry)` may depend only on its entry node and on state it observes, and
it refreshes node keys when that state changes. Static rendering was built
without that contract: it re-reads every source on every node for every
render. On S5 snapshot w that cost 21–58% of React time at 50 KB.

What we would build knowing streaming previews are a core job:

1. **A source reads where it decorates.** A code highlighter decorates a code
   block, not every text node that might sit inside one. Prior art:
   Streamdown and react-markdown highlight per block, and Lexical registers
   transforms per node class.
2. **The wrapper costs next to nothing when a source has nothing to say.**
3. **Rendering follows the latest document.** React's deferred rendering skips
   intermediate documents when the machine falls behind, which is the
   recommended pattern for expensive renders fed by fast input.
4. **Reuse is proven generatively,** not by one case per renderer.
5. **Presence belongs to live sessions.** Remote cursors and find matches are
   positions in the source session's document, so they must never paint
   another document or static output.

Per-block caching and chunked rendering (as in Slate) are the next structural
levers. Both assume the decoration contract holds for every source, and the
AI end marker, find and Yjs read beyond their node. So they are decided on the
cost that remains after items 1–3.

### What changed, and why each is the owner's fix

- **Code highlighting reads the code block, not every text.** Changed
  ancestors count as changed for decorations (every prefix of a changed path
  is added), so the live editor rereads the element when its text changes.
  Unchanged blocks reuse their highlighting by identity. The live editor keeps
  its key-based cache, which keeps token keys stable while typing.
- **The Plate source wrapper resolves the plugin context once** per view and
  published model. Before, `Object.create()` over the context proxy made
  every property read a proxy trap, and `store` re-resolved the plugin on
  each access.
- **The static renderer does no redundant per-block work:**
  - a block's own source reads are reused for its subtree;
  - first and last leaves are computed only when there are parent decorations
    to intersect;
  - the schema is taken once per render instead of one read per call;
  - decoration equality checks identity before serializing.
- **Plite `cloneValue` returns primitives as they are.** Every projected read
  cloned the null selection through `structuredClone`.
- **Deferred rendering:** the AI menu and the streaming demo render
  `useDeferredValue` of the preview document. The AI draft's purple text is
  styled by its container, and the end marker is read on the last block only,
  compared by identity so a content root's block at the same index cannot
  match. The marker covers the last code point without copying the text.
- **The streaming demo's output describes what it renders** (found by the S5
  lane's preflight). The status label updated urgently while the static
  output deferred, so "Finished: strict parse" showed over the previous
  document. In static mode, the status, parse error and document now come
  from one deferred snapshot and commit together. The chunk heading and the
  controls stay urgent, because they describe the input. The browser tests
  had used those input signals as output readiness:
  - they now wait for Ready after a reset, so a jump to the last chunk really
    renders the fresh parse;
  - they settle after chunk navigation;
  - the lifetime tests capture the stopped output only after the action's
    own Ready.
- **Size-dependent costs the S5 lane found** in the browser, each fixed at
  its owner:
  - The streaming demo and the AI menu re-rendered `EditorStatic` on every
    urgent update, such as a chunk arrival or a publication's first pass,
    which keep its document. Each such render re-reads every block's
    decorations: 1.15–2.16 s per 50 KB stream in the demo. Both now memoize
    the preview element on the document it renders. `EditorStatic` itself
    stays unmemoized, because re-rendering it is how a consumer refreshes
    decorations that read other state.
  - The code highlighter looked up a runtime key for each block it had not
    seen. In a document view, nodes get new keys, and resolving one indexes
    the whole document (about 130 ms per 50 KB stream). Document views now
    find highlighting by block identity only.
  - The AI end marker read the document's children before its cheap path
    check, and that read was about 90% of its cost.
  - The inline AI draft measured layout after every render to keep its end
    in view (1.2–9.2 ms per commit, growing with size). It now scrolls only
    from its resize observer, which reads layout the browser has already
    computed.
  - The AI preview spent 5.4–14.8 ms per commit on style recalculation at
    50 KB, against 0.7–0.9 ms in the static demo. It was not the draft's
    purple styling: moving that back to per-text decorations was no faster.
    The fallback end marker, a sibling after the preview, mounted and
    unmounted as the last text emptied and filled. That flipped whether the
    preview was the last child. Three Tailwind `group-last/*` utilities
    compile to `:is(:where(.group\/x):last-child *)`, so Chrome restyled the
    whole preview, 33,000–49,000 elements, 15–38 times per stream. The marker
    now stays mounted and toggles only its attribute and display, and the
    test "keeps the draft end marker mounted while the draft changes" fails
    otherwise. On the final tree, style recalculation fell to 1.30 ms (rich)
    and 1.81 ms (CJK) per commit at 50 KB, one full recalc remains per
    stream, and main-thread busy fell 29–35% at 50 KB.
- **Anchors in document views** (the comments finding, confirmed by probe).
  An anchor painted its source path onto any document view: a foreign
  document got the source comment at `[0,0]`, and a document sharing the
  commented node at a new path lost it. Anchors now resolve in a document view
  by node identity: nothing on a foreign document, the mapped path on a
  shifted document, the same path on the source's own document.
- **Authored changes in document views** (the suggestions finding, caught by
  the guard). `changesAt` read the source's authored state while decorating a
  document view. A document view renders an already projected document with
  no authored session, so `change`, `changes` and `changesAt` report nothing
  there.
- **Remote cursors (Yjs)** are positions in the live session's document, so a
  document view shows none.
- **The document-view guard covers leaf and text renders,** not only element
  renders. A mark's `leafAttributes` that reads a captured source editor now
  throws; the test "refuses a leaf render that reads the source editor" fails
  without it. React runs component bodies after render code returns, so no
  scope can cover them; the static guide tells components to read their
  `editor` prop.
- **Nested document readers** (found by the oracle lane). A TOC inside a table
  cell stayed stale, because the memo checked `readsDocument` only on the
  element while an unchanged ancestor block was reused wholesale. A block now
  reads the document when it or any element inside it declares
  `readsDocument` (cached per block and published plugins).

- **Stale list numbers in the live editor** (found by the oracle lane, seed
  31). `BaseListPlugin` cached ordinals by the node index, which keeps its
  identity across property-only changes. After an earlier block became a
  list item, a later item kept `start=5` instead of 2, and static reuse then
  memoized that number. The cache is now keyed by the root children array,
  which is new on every content change and unchanged on selection-only
  changes. List test "renumbers a later item when an earlier block becomes a
  list item" fails with the old key.

- **Content roots** (found by the oracle lane's captions sequences). A TOC
  inside a figure caption stayed stale, which exposed two holes:
  - A block's memo input ignored everything in element-owned content roots,
    which live outside the element's children. `readBlockInputs` now covers
    every content root owned anywhere in the block's subtree: their arrays,
    their decorations, and whether an element in them reads the document.
    Every element in the block compares those inputs.
  - The live-editor fast path treated "same root nodes and same editor" as an
    unchanged document, but a caption root can stay the same while the main
    document changes. Rendering now threads the main children array, and the
    fast path requires it to be unchanged too.
  Both mutations fail the captions oracle tests.

### The reuse oracle

`PlateStatic.reuse-oracle.spec.tsx` (oracle lane) generates seeded,
replayable document sequences with structural sharing:

- Real TOC, list (ordinal wrapper) and table plugins.
- Content-local, element-level, forward and backward decoration sources.
- Each step re-renders both the document path and the live-editor path and
  requires `innerHTML` to equal a fresh, history-free render exactly.
- The same document must re-render nothing, and a changed document fewer
  elements than a fresh render.
- Its sensitivity check runs a TOC without `readsDocument`; both paths catch
  it at seed 1, step 1.
- A captions profile adds figure captions, which are element-owned content
  roots.
- It found the nested-reader bug, the list-ordinal bug and the content-root
  holes. It passes 6/6: four sequence profiles and two sensitivity checks.

### Per-block decoration caching and chunking

Headless, the full decoration pass fell from 24 to 2.4 ms (rich 50 KB) and
from 38 to 6.3 ms (CJK 50 KB). A headless stream of 256-character
publications through `parseSlice({ partial, previous })` into
`EditorStatic document` measured:

| Load | Rich 10 KB (237 blocks) | Rich 50 KB (1,179 blocks) |
| --- | --- | --- |
| About 55, before the per-block fixes | 31 ms per publication | 45 ms |
| About 9, after them | 13–15 ms | 14–16 ms |

The browser refuted the reading that cost no longer depends on document size.
On the final tree (S5 run pp3, receipts in
`docs/research/probes/2026-09-28-conversion-boundary/lanes/s5/proportional/`),
React time per publication still grows from 10 to 50 KB, though far less than
on snapshot w:

| Cell | Final tree, 10 → 50 KB | Snapshot w, 10 → 50 KB |
| --- | --- | --- |
| Static rich | 4.8 → 8.7 ms | 9.8 → 30.0 ms |
| Static CJK | 7.4 → 12.3 ms | 16.2 → 40.4 ms |
| AI rich | 5.0 → 5.6 ms | 9.6 → 22.3 ms |
| AI CJK | 7.2 → 10.0 ms | 16.8 → 41.5 ms |

What still grows is the pass over every top-level block: each block's
decoration reads, `readBlockInputs` and the memo compares. It costs 0.7–1.3 ms
per commit at 10 KB and 1.7–3.8 ms at 50 KB, of which source reads are
0.7–1.8 ms. Rendering the changed blocks stays flat. Style, layout and paint
now grow more, from 3.1–7.4 ms per commit at 10 KB to 5.1–14.9 ms at 50 KB,
and neither chunking nor caching reduces them.

Per-block caching and chunked rendering are one decision, and both are
deferred rather than rejected. Skipping an unchanged block, alone or in a
chunk, is correct only when every source reads within its entry and the
renderer knows no observed state changed. The AI end marker reads the whole
document, and a static render has no version of source state. Either lever
would save about 2–4 ms per commit at 50 KB. Meanwhile every commit stays
within the 32 ms publication cadence (the deferred render takes 5–10 ms at
50 KB), and no publication was skipped. Revisit when a product flow renders
documents well beyond 50 KB or a commit nears the cadence. Start the design
from sources that obey the entry contract and a runtime version of observed
decoration state.

Verification evidence:

- Plite: 21/21 test tasks uncached (the runner prints failures only) and
  typecheck 13/13. Laws:
  - "resolves an anchor only on the nodes a document shares" fails without the
    mapping;
  - "refuses a source read made while the view reads", with schema queries
    passing.
- platejs typecheck 90/90. Focused suites:
  - code block 59/59 (two cache-lifetime tests updated to the element-level
    contract: release on the last observer, reuse after an undo that restores
    the same block);
  - comments 58/58 (foreign and shifted regression);
  - suggestion 6/6 (foreign regression);
  - static partition 63/63: the oracle 6/6, the nested TOC regression and
    "refuses a leaf render that reads the source editor", each
    mutation-checked;
  - list: "renumbers a later item when an earlier block becomes a list item"
    fails with the old cache key;
  - find 6/6, yjs 5/5, yjs-react 3/3, markdown 225/225, ai 8/8,
    ai-react 96/96, toc 9/9, table 204/204.
- Registry: `ai-menu.spec` 1/1 (the end marker covers a whole surrogate pair
  and fails with `end - 1`) and streaming demo 11/11, both after the
  output-snapshot and memoization changes; `code-block-static` 2/2.
- After the S5 owner fixes: code block and static partition 122/122 and
  platejs typecheck 90/90.
- Benchmark: `plite-schema-construction-benchmark.test.ts` passes on the final
  tree, and `bench-targets check` passes for 55 targets. In the lane's 38
  loaded runs (load 5–81), the worst median delta used 35% of its budget; the
  old p95 gate failed 14 of the same runs. A schema check on every root child
  inside the timed prefix edit fails the gate at 1.8–2.5x the budget at
  10,000 siblings and 5–6x at 50,000.
- HTML (lane): html 60/60 and the other partitions green; conformance pins the
  18-name Plate attribute set in both directions.
- S5 on the final tree (run pp3; receipts in
  `docs/research/probes/2026-09-28-conversion-boundary/lanes/s5/proportional/`):
  - All 8 cells pass across 64 streams. No stream recorded a page or console
    error, so the document-view guard never threw.
  - Final text and HTML are identical between arms. Static HTML is
    byte-identical to snapshot w's.
  - React time per stream fell 48–55% against w at 10 KB and 73–74% at 50 KB.
    Every static source read now takes 8–21% of React time, against 23–61%
    on w.
  - Preflight on both arms: contract 8/8 and lifetime 14/14. `ai-session`
    passes 18 of 19 on both arms: the inline-scroll test passes, and the
    narrow-view failure is the same on the baseline.
  - Streamed output equals a fresh render in all five fixtures.
  - The AI end marker covers the last code point in 8 of 8 samples.
  - The status now commits with the output it describes.
  - After the end-marker fix (run pp4, AI cells, `pp4-ai/`): all four cells
    pass, the contract AI tests pass 3/3, `ai-session` matches the
    baseline, and every frame sample shows exactly one end marker. The pp3
    static cells stand for the final tree, whose static code did not change.
- Full suites on the final tree, against HEAD's failure lists:
  - `pnpm test`: 26 failures, none outside HEAD's list, and the node tests
    fail only HEAD's five. An earlier run also failed "generated entrypoint
    Turbo state is current", because the lanes' new test imports made
    `packages/platejs/turbo.json` stale; it was regenerated.
  - `pnpm test:slow`: 25 failures, none outside HEAD's 26-name list.
  - `pnpm --filter www typecheck` passes: fresh registry, docs parity,
    registry source check and both `tsc` projects.
- Lint: oxfmt and oxlint are clean on the changed code files. Type-aware
  oxlint reports nothing on added lines; 22 older errors remain in touched
  test files.
- Registry output is rebuilt with `pnpm --filter www build:registry`, the
  registry changelog check passes, and `pnpm brl` changes nothing.
- Doctrine v252 is valid and its mirrors are in sync.
- The review ledger checks after refreshing the audio inventory fingerprint,
  which moved with the HTML lane's media mappings.

Open risks:

- **Numbering in content roots.** Numbered items inside an element-owned
  content root, such as a caption, restart instead of continuing:
  `read.ordinal` finds no main-root path for them. Reused and fresh renders
  agree, so the oracle does not flag it.
- **Decoration paths in content roots.** A source gets a root-relative path
  without its root. A source that indexes positions by path must also check
  the document it read, as Find does, or it can paint a main-root position
  inside a content root. Passing the root needs a Plite decoration API
  decision, which this plan does not take.
- **Guard coverage.** The document-view guard covers the view's reads,
  decoration reads and render callbacks. Component bodies run after those
  return, and reads that bypass `read` and `key` are not guarded.
- **HTML limits (lane):**
  - numbered heading items decode with an explicit `listRestart`, and the
    first numbered item decodes `listStart: 1`;
  - `font-weight: 600` decodes as bold, and a cell background as text
    `backgroundColor` (both predate this plan);
  - an `<li>` that holds several blocks still flattens;
  - a table inside a list item drops its list properties without a report;
  - a decoder's claim covers its subtree, so it hides deeper attributes with
    the same name.
- **Per-commit pass over every block.** Reading each top-level block's
  decorations and comparing its memo inputs still costs 1.7–3.8 ms per commit
  at 50 KB. Caching and chunking are deferred, as the decision above explains.
- **Smaller size-dependent reads:**
  - Static table cells call `table.read.cell({ at: element })`, which indexes
    each new document once: about 1.3 ms per commit at CJK 50 KB. A path
    would avoid the index, but a bare path misses tables in content roots;
    the fix needs a root-aware location from the renderer.
  - The highlighter's type check reads the code block type through the
    plugin portal and the schema proxy for every element: 0.2–0.55 ms per
    commit at 50 KB.
- **Style, layout and paint** grow more with size than React does. In the
  static cells they take 3.1–4.8 ms per commit at 10 KB and 5.1–8.3 ms at
  50 KB.
- **End-of-stream restyle.** Toggling the `streaming` classes on the AI
  preview's root still restyles the whole preview once per stream: 90 ms
  (rich) and 136 ms (CJK) at 50 KB.
- **`group-last/*` utilities restyle whole subtrees.** Any element whose
  last-child state flips invalidates all its descendants in Chrome while
  `group-last/column:pr-0`, `group-last/column:-right-1` (`column.tsx`,
  `column-static.tsx`) or `group-last/toolbar-group:hidden!` (the base
  toolbars) ship. The AI preview no longer flips; other containers that gain
  or lose a trailing sibling still pay this. Plate UI owns replacing these
  utilities, and Sync Shadcn owns the base toolbars (evidence:
  `lanes/s5/proportional/style-isolation/`).
- **Benchmark floor.** The median gate still passes a per-child loop that
  costs less than 25% of the plain edit.
- **Benchmark history.** `benchmarks/targets/history/slate-v2-latest.json`
  has lagged the registry since 2026-09-15. At HEAD it already missed three
  targets, kept a removed one and held older questions for two, so
  `bench-targets report --check` fails before and after this plan.
  Regenerating it would also write this machine's local artifact states into
  every target, so it is not regenerated here.
- **Failures that predate this plan:** registry `code-block.spec` (its
  `platejs` mock omits `ElementApi`); registry `list.spec` "decodes configured
  list items as paragraphs with list properties", which now also warns
  `data-list-start`; `HtmlPlugin.mapping.slow` 1/4 (the html-safety baseline).

Final handoff prepared:

- Delivered:
  - Static previews cost work in proportion to the change: decorations are
    read where they apply, and the wrapper and Plite reads no longer pay per
    node.
  - Streamed previews render deferred, with the demo's status committing
    with its output.
  - The reuse oracle and the fixes it found.
  - Session state isolated from other documents, including leaf and text
    renders under the guard.
  - The HTML leftovers (lane) and the median benchmark gate (lane).
  - The S5-found owner fixes: preview memoization, highlighter keys,
    end-marker order, the resize-driven scroll and the mounted end marker.
- Decisions:
  - Review `2026-09-30-static-preview-decoration-cost-review` defers
    per-block caching and chunking until every source reads within its
    entry and static renders can see a version of observed state.
  - `EditorStatic` stays unmemoized.
- Evidence: see Verification evidence. S5 receipts live in
  `docs/research/probes/2026-09-28-conversion-boundary/lanes/s5/proportional/`
  (pp3, `pp4-ai/` and `style-isolation/`), with superseded runs kept.
- Follow-ups for other owners are in Open risks:
  - Plate UI: `group-last/*` utilities;
  - a Plite decoration API decision: content-root paths;
  - table static cells: a root-aware location.
- Nothing is committed; the user owns commits on `next`.

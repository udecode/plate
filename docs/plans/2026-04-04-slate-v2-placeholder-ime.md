# Slate v2 Placeholder IME Proof

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Context

- Continue from the current `slate-browser` and `slate-v2` state across:
  - `/Users/zbeyens/git/plate-2`
  - `/Users/zbeyens/git/slate-v2`
- The next live seam is the zero-width / renderer-input policy path on a real
  `slate-v2` surface.
- Work this with TDD:
  - add a real-browser proof surface
  - keep the Playwright IME test red for the right reason
  - fix the smallest runtime seam that turns it green

## Phases

1. Complete: reload task context, learnings, and current proof files after compaction.
2. Complete: reproduce the failing placeholder IME proof on a fresh local server.
3. Complete: instrument the red path until the actual root cause is explicit.
4. Complete: implement the smallest seam fix in `slate-v2` example/runtime code.
5. Complete: verify the browser proof and the relevant package checks in the same turn.
6. Complete: capture the reusable learning exposed by the IME proof.
7. Complete: add the no-FEFF empty-block placeholder proof surface.
8. Complete: prove the no-FEFF path red in Chromium IME and isolate the crash.
9. Complete: implement the smallest renderer-boundary fix forced by that red proof.
10. Complete: re-verify the IME lane with both FEFF and no-FEFF proofs.
11. Complete: capture the new no-FEFF renderer-policy learning.
12. Complete: move the zero-width line-break policy into a shared `slate-react-v2` component.
13. Complete: add a browser matrix for line-break, inline-edge, and void-like zero-width shapes.
14. Complete: update the browser test scripts so Playwright builds `slate-react-v2` before running.
15. Complete: add a real FEFF-backed inline-edge IME proof surface.
16. Complete: prove the inline-edge IME path with semantic selection setup.
17. Complete: re-verify the IME and e2e lanes with inline-edge folded in.
18. Complete: capture the inline-edge selection-setup learning.
19. Complete: add a real FEFF-backed void-like IME proof surface.
20. Complete: determine whether the void-like FEFF path is a real Chromium IME target.
21. Complete: adapt the void-like proof to the real legacy void spacer seam.
22. Complete: capture the void-like structural-proof conclusion.
23. Complete: land a shared `TextString` primitive in `slate-react-v2`.
24. Complete: migrate the v2 proof surfaces and matrix to the shared text boundary.
25. Complete: add a focused package test for `TextString` DOM repair behavior.
26. Complete: land minimal `SlateElement` / `SlateSpacer` / `SlateText` / `SlateLeaf` primitives in `slate-react-v2`.
27. Complete: migrate the v2 proof surfaces and zero-width matrix to the packaged renderer node shapes.
28. Complete: land a reusable `SlatePlaceholder` primitive in `slate-react-v2`.
29. Complete: migrate the v2 placeholder proof surface to the packaged overlay primitive.
30. Complete: land a reusable `EditableText` primitive in `slate-react-v2`.
31. Complete: migrate the v2 proof surfaces and matrix to the composed text primitive.
32. Complete: land reusable `EditableElement` and `VoidElement` primitives in `slate-react-v2`.
33. Complete: migrate the v2 proof surfaces and matrix to the composed element layer.
34. Complete: land a minimal reusable `Editable` root in `slate-react-v2`.
35. Complete: migrate the v2 proof surfaces to the packaged editable root loop.
36. Complete: extend `EditableText` to split leaves from projection slices.
37. Complete: add a real decorated-text browser proof.
38. Complete: fix cumulative offset mapping for decorated multi-leaf selections.
39. Complete: teach `EditableText` to bind text/runtime ids from a Slate path.
40. Complete: prove zero-length projection slices as mark placeholders in package and browser.
41. Complete: wire clipboard bridge semantics into the v2 Editable surface.
42. Complete: prove decorated copy semantics and mark-placeholder selection transitions.
43. Complete: expose `EditableBlocks` as the first honest public v2 editor-facing surface.
44. Complete: extend `slate-v2` fragment semantics to one-block mixed-inline selections and inserts.
45. Complete: preserve mixed-inline structure when `EditableBlocks` commits DOM text back into editor state.
46. Complete: harden `slate-browser` nested-path selection helpers against handle-hydration and page-eval leaks.
47. Complete: build `slate-v2` in the Playwright lane and prove mixed-inline select/type/copy/paste in Chromium.
48. Complete: extend mixed-inline fragment semantics from one block to multi-block top-level selections.
49. Complete: add a dedicated multi-block mixed-inline browser proof surface.
50. Complete: verify multi-block mixed-inline clipboard round-trip in core, DOM, and Chromium.
51. Complete: rebase explicit-at mixed-inline editor selections inside the current proved shape.
52. Complete: rebase later-block mixed-inline range refs after explicit multi-block inserts.
53. Complete: rebase same-block mixed-inline range refs for explicit inserts inside the current proved shape.
54. Complete: extend fragment semantics from top-level blocks to nested quote paragraph containers.
55. Complete: prove nested quote clipboard round-trip in core, DOM, and Chromium.
56. Complete: rebase explicit-at selections and range refs inside nested quote paragraph containers.
57. Complete: extend fragment semantics to nested mixed-inline quote paragraph containers.
58. Complete: rebase explicit-at selections and range refs inside nested mixed-inline quote paragraph containers.
59. Complete: prove nested mixed-inline quote clipboard round-trip in core, DOM, and Chromium.
60. Complete: generalize block geometry from direct inline children to richer inline descendant trees.
61. Complete: prove richer-inline fragment, selection, and range-ref behavior at top level and inside nested quote containers.
62. Complete: prove top-level wrapper block units with richer-inline paragraph descendants in Chromium.
63. Complete: promote deeper wrapper stacks where quote, list-item, inner quote, and richer-inline paragraphs all survive together.
64. Complete: prove list-item wrapper units that mix paragraph and nested-list descendants through core contracts.
65. Complete: promote the same list-unit shape through `slate-dom-v2` clipboard transport and Chromium copy/paste.
66. Complete: prove list-item wrapper units that mix paragraph and quote descendants through core contracts.
67. Complete: promote the same paragraph-plus-quote list-unit shape through `slate-dom-v2` and Chromium copy/paste.
68. Complete: prove list-item wrapper units that mix paragraph, nested-list, and quote descendants through core contracts.
69. Complete: promote the same paragraph-plus-list-plus-quote list-unit shape through `slate-dom-v2` and Chromium copy/paste.
70. Complete: prove sibling complex list-item units extract and round-trip as one wrapper-list fragment.
71. Complete: promote sibling complex list-item units that mix paragraph, nested-list, and quote descendants through DOM and Chromium.
72. Complete: align explicit-at range-ref rebasing for broader sibling wrapper-list fragments with the real insert-container semantics.
73. Complete: prove sibling complex list-item units whose nested list and quote children each contain multiple blocks.
74. Complete: prove that explicit-at rebasing for broader sibling units still follows the same selection-driven model even when those child containers become multi-block.
75. Complete: prove the same explicit-at model for expanded cross-unit selections and range refs across those broader sibling units.
76. Complete: generalize the wrapper-unit seam from `bulleted-list` to compatible ordered-list containers and prove it through core, DOM, and Chromium.
77. Complete: prove cross-container wrapper-unit transplant between compatible list containers.
78. Complete: generalize the same seam to compatible non-`list-item` unit types and prove it through core, DOM, and Chromium.
79. Complete: generalize the same seam to compatible heterogeneous sibling unit types and prove it through core contracts without regressing the browser stack.
80. Complete: prove the same seam for compatible `check-list` / `check-list-item` unit types.

## Findings

- The current failing proof is:
  - `/Users/zbeyens/git/slate-v2/playwright/integration/examples/slate-v2-placeholder-ime.test.ts`
- The proof targets:
  - `/Users/zbeyens/git/slate-v2/site/examples/ts/slate-v2-placeholder.tsx`
- The example currently mounts a minimal `slate-v2` + `slate-react-v2` editor
  with an empty-block placeholder path, FEFF zero-width span, `<br />`, and a
  native `beforeinput` / `input` reconciliation layer.
- `slate-dom-v2` already has a two-way zero-width normalization rule and was
  further patched here to map FEFF-prefixed native offsets with `offset - 1` in
  `resolvePointForDOMPoint(...)`.
- The red test is still red after that patch, which is the useful signal:
  the failure is not obviously just a missing bridge clamp anymore.
- Prior learnings that matter here:
  - `docs/solutions/logic-errors/2026-04-03-zero-width-dom-selection-bridges-must-normalize-both-directions.md`
  - `docs/solutions/logic-errors/2026-04-03-jsdom-contenteditable-composition-is-not-a-trustworthy-ime-proof.md`
  - `docs/solutions/logic-errors/2026-04-03-legacy-line-break-placeholders-still-keep-feff-until-ime-proof-exists.md`
  - `docs/solutions/logic-errors/2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md`
- The likely hot spot is the example’s DOM-to-Slate reconciliation path after
  composition commit, not `slate-browser`.
- The first honest probe after instrumentation showed the real bug:
  Chromium IME steps were being committed as document text one by one, so the
  DOM ended up as the concatenation of every composition step.
- Once transient composition input was ignored, the next probe exposed the
  cleaner rule:
  Chromium finished the commit on `compositionend`, not on a later friendly
  `insertText` input.
- The durable fix for the proof surface is:
  - ignore transient composition `input`
  - reconcile editor state from DOM on `compositionend`
  - still reconcile on normal non-composition `input`
- This was enough to make the minimal `slate-v2` placeholder proof behave like
  a real committed editor surface again.
- The next proof slice asked the real policy question directly:
  can the same `slate-v2` placeholder path survive Chromium IME without FEFF?
- The first no-FEFF red proved something sharper than “selection is wrong”:
  React crashed with `removeChild` against the inner `<br />` subtree and the
  editable surface disappeared.
- That was not bridge debt.
  It was renderer ownership debt.
- The smallest working fix was to keep React ownership at the zero-width
  wrapper span while making the no-FEFF branch’s inner `<br />` DOM-owned
  instead of a React child fiber.
- With that boundary, Chromium IME passed on the no-FEFF path too.
- That upgrades the current conclusion for `slate-v2`:
  FEFF is not inherently required for the empty line-break placeholder path in
  Chromium, but the renderer must not let React own the IME-mutated `<br />`
  interior.
- There was still no shared v2 renderer seam after that proof.
  The behavior lived in example markup, which is not good enough.
- The shared seam now exists in `slate-react-v2` as
  `ZeroWidthString`, with the current split baked in:
  - line-break placeholders default to no FEFF and a DOM-owned `<br />`
  - non-linebreak zero-width placeholders still retain FEFF
- The current browser matrix now pins three v2 zero-width shape cases:
  - line-break path defaults to no FEFF
  - empty block line-break path
  - inline-edge start/end paths
  - void-like zero-width path
- The first inline-edge behavior red was not a renderer-policy bug.
  It was sloppy test setup:
  root click alone did not guarantee selection on the intended zero-width leaf.
- Once the proof set selection semantically before IME composition, the
  FEFF-backed inline-edge path passed in Chromium.
- The first void-like red was a fake negative caused by an insufficient proof
  surface that collapsed the void chrome and the spacer into one wrapper.
- Once the proof mirrored the real legacy void seam:
  - `data-slate-void="true"` element
  - non-editable content wrapper
  - separate absolutely positioned spacer leaf
    the FEFF-backed void-like path also passed in Chromium.
- That is the current honest split:
  - line-break path:
    no FEFF is proved in Chromium
  - inline-edge path:
    FEFF-backed behavior is proved in Chromium
  - void-like path:
    FEFF-backed behavior is proved in Chromium once the structure mirrors the
    real void spacer seam
  - non-linebreak no-FEFF paths:
    still unproved and therefore still conservative
- With the zero-width matrix proved, the next repeated renderer/input seam was
  ordinary text itself.
- `slate-react-v2` now owns `TextString` as the shared DOM text boundary, so
  v2 proof surfaces no longer hand-roll `data-slate-string` spans.
- The next repeated seam after that was node shape itself:
  text nodes, leaves, elements, and spacers.
- `slate-react-v2` now owns those shapes too, so the proof surfaces are finally
  depending on a minimal renderer stack instead of impersonating one.
- The next repeated seam after that was the placeholder overlay contract.
- `slate-react-v2` now owns that too through `SlatePlaceholder`, so the
  placeholder proof surface no longer hand-rolls overlay attrs and style.
- The next repeated seam after that was the branch logic itself:
  text vs zero-width vs optional placeholder.
- `slate-react-v2` now owns that through `EditableText`, so the proof surfaces
  finally depend on a compositional text surface instead of juggling the
  primitives by hand.
- The next repeated seam after that was element composition itself:
  ordinary elements versus real void wrappers with spacers.
- `slate-react-v2` now owns that through `EditableElement` and `VoidElement`,
  so the proof surfaces no longer rebuild the element/void contract by hand.
- The next repeated seam after that was the root loop itself:
  mount, selection sync, focus initialization, and DOM commit.
- `slate-react-v2` now owns that through `Editable`, so the proof surfaces no
  longer keep private browser-reconciliation loops.
- The next real rich-text seam after that was projection-driven leaf splitting.
- `EditableText` now owns that too, and the browser/bridge stack now does
  cumulative offset mapping across decorated multi-leaf text nodes.
- The next ergonomic seam after that was path/runtime-id plumbing and collapsed
  mark-placeholder rendering.
- `EditableText` now binds itself from `path={[...]}` and treats zero-length
  projection slices as mark placeholders, which removes more route-local glue.
- The next browser-truth seam after that was copy/selection semantics across
  decorated and mark-placeholder text.
- `Editable` now owns clipboard bridge wiring, and the browser helpers now
  normalize FEFF out of selected text so those proofs measure editor truth
  instead of renderer debris.
- With those seams proved, `EditableBlocks` is now the first honest public
  editor-facing v2 surface: narrow, but real.
- That is enough to continue `slate-v2` with a real shared renderer-policy seam
  instead of more bespoke example DOM.
- The next honest limit after that public surface was mixed-inline editing:
  a top-level block with direct text children and inline element children.
- The first red there was not clipboard itself.
  It was editor truth:
  `Editable` still reconciled DOM edits by flattening the whole root back into a
  single text block.
- That was good enough for proof surfaces with one text node.
  It was wrong for a real mixed-inline public surface because typing or paste
  could preserve visible text while destroying the node structure that selection
  paths still pointed at.
- The durable fix was to let `Editable` accept `snapshotFromDom(...)` and let
  `EditableTextBlocks` preserve the current descendant shape while replacing
  only text-leaf content from DOM.
- The next red was more subtle:
  `slate-browser` nested-path selection helpers could be correct in the page but
  still fail in helper assertions because the page-eval snapshot functions
  referenced `SLATE_BROWSER_HANDLE_KEY` without serializing it into browser
  context.
- The helper also needed to wait briefly for handle hydration instead of
  falling back to the dumb DOM-only selection path too early.
- The final browser false negative was not runtime logic at all.
  The site examples were consuming stale `slate-v2` dist output because the
  Playwright build lane was not rebuilding `slate-v2` alongside the other v2
  packages.
- Once the lane built `slate-v2` too, the browser copy proof matched the green
  core/DOM clipboard contracts.
- Mixed-inline Chromium proofs are now green for:
  - semantic selection across inline boundaries
  - typing inside an inline child text node
  - copy/paste round-trip across a mixed-inline selection
- The next honest limit after that was no longer “mixed inline exists.”
  It was “does the fragment model still work once the selection crosses block
  boundaries?”
- The one-block mixed-inline work proved inline children inside a single block.
  It still did not prove the first real document-level clipboard case:
  partial first block, partial last block, real block break in the middle.
- The durable core extension was to keep the same narrow mixed-inline shape but
  let fragment extraction span multiple top-level blocks when each touched block
  still matches that proved shape.
- The matching insert seam stayed intentionally narrow too:
  multi-block mixed-inline fragments can now paste into a collapsed or same-block
  mixed-inline target range, but we did not pretend to solve arbitrary nested
  block trees.
- The browser proof uses a dedicated two-block surface instead of mutating the
  original one-block example, so the earlier proof stays sharp and the new one
  names the broader document-level seam directly.
- The resulting Chromium proof is now green for:
  - cross-block mixed-inline selection
  - copy payload generation with real block breaks
  - paste round-trip that preserves inserted inline structure across blocks
- The next honest limit after that was explicit-at rebasing inside the same
  mixed-inline shape.
- The old explicit-at logic still only understood the flat text-block proof
  subset, so mixed-inline insertions with `{ at: ... }` could leave editor
  selections stale even when the inserted document shape itself was correct.
- The durable editor-side fix was to rebase through block-relative text offsets
  inside the current proved mixed-inline shape, then map those offsets back to
  child paths after insertion.
- The next geometry seam after deeper wrapper stacks was a wrapper unit with
  mixed sibling block descendants:
  - a paragraph
  - plus a nested list
- The durable core seam there was to treat `list-item` fragments as sibling
  units when the target container is a nested `bulleted-list`, instead of
  unwrapping them into paragraph children.
- The DOM and Chromium proofs agreed on one useful browser truth:
  after real clipboard paste, collapsed selection lands at the deepest inserted
  descendant, not at the first obvious inserted chip leaf.
- The next widening step after `paragraph + nested-list` did not need a new
  unit-insert model.
  The same sibling-unit seam also survives `paragraph + quote`.
- The next widening step after that also did not need a new seam.
  The same sibling-unit rule still survives `paragraph + nested-list + quote`.
- Crossing multiple sibling units with those already-proved child-block mixes
  also did not force a new seam.
  The fragment simply lifts to one proved wrapper list of proved sibling units.
- The same remains true when each sibling unit itself uses the broader
  `paragraph + nested-list + quote` child-block mix.
  That still lifts cleanly to one proved wrapper-list fragment.
- That also remains true once those inner nested-list and quote children each
  contain multiple blocks.
  The outer sibling-unit fragment still reduces to one wrapper list of proved
  units.
- The next useful expansion was not new geometry at all.
  It was the same wrapper-unit seam on `ordered-list`.
  That needed the seam widened, not redesigned.
- Once that seam was widened, cross-container transplant between compatible list
  containers also held without needing a new fragment model.
- The same thing happened one level deeper for unit type:
  once the container and sibling contracts matched, `check-list-item` reused the
  same wrapper-unit seam too.
- That means the wrapper-unit model no longer cares about one concrete list
  container or one concrete unit type, as long as the compatible container and
  sibling-unit contracts still match.
- The same pattern extends one step further:
  compatible heterogeneous sibling unit types can still reuse the same seam
  when the outer wrapper-list contract holds.
- Explicit-at rebasing also stayed on the same model after that widening:
  quote-target inserts can still move later sibling units, nested-list targets
  can still leave them alone, and range refs still have to follow the real
  post-insert selection semantics.
- Expanding the selection/range across sibling units did not change that rule.
  The same insert-container story still decides whether the later unit moves.
- The next actual seam after that was not extraction or clipboard.
  It was explicit-at rebasing for later sibling units.
- The fix there was not “shift later siblings more.”
  It was to let range refs follow the same post-insert semantics as the real
  editor selection for broader block-unit inserts.
- The main thing that still changes by shape is not whether the fragment stays a
  sibling unit.
  It is where the real browser/runtime stack leaves selection afterward.
- That was enough to make explicit-at editor selection rebasing honest for:
  - same-block selections before the target
  - same-block selections after the target
  - later-block selections after explicit multi-block mixed-inline inserts
- The range-ref side is narrower.
  With the current `insert_fragment` operation payload, we can honestly rebase
  later-block mixed-inline range refs through top-level block shifts, but
  same-block mixed-inline range-ref rebasing would need richer insert metadata
  than the op currently carries.
- That turned out to be too pessimistic for the current proved shape.
  The operation still lacks enough metadata for arbitrary tree rebasing, but
  same-block mixed-inline refs inside the current top-level proved shape can be
  rebased honestly by reusing the same block-relative text-offset model as the
  editor selection seam.
- The real remaining limit is now narrower:
  arbitrary nested-tree range-ref rebasing for insert fragments still needs
  richer insert metadata, but same-block top-level mixed-inline refs are no
  longer blocked on that.
- The next real pressure after that was the first nested block-container case:
  a quote with paragraph children.
- That is not “arbitrary nested trees,” but it is the first place where fragment
  semantics have to preserve a structural wrapper instead of only top-level
  blocks.
- The durable extension was:
  - detect simple text-block sibling containers at any depth
  - extract those selections as wrapped fragments when the container is nested
  - insert the wrapped fragment back into the same container shape on paste
- That is enough for the quote+paragraph case, and it keeps the next remaining
  limit honest:
  explicit-at rebasing and range-ref rebasing inside nested block containers
  still are not generally solved.
- The next slice closed that gap for the current quote+paragraph proof shape.
- The durable move was not another bespoke rebasing algorithm.
  It was to strip the container prefix off nested block paths, reuse the
  already-proved top-level text-block rebasing logic, then prefix the container
  path back onto the result.
- That works because the current nested proof shape is still just “simple block
  siblings inside a wrapper,” not arbitrary nested geometry.
- The honest remaining limit is now sharper:
  nested containers whose child blocks are not the simple one-text-child proof
  subset, or nested mixed-inline containers, still need a broader transform.
- The next slice closed the nested mixed-inline half of that gap:
  quote wrapper plus paragraph children that themselves use the current
  mixed-inline text+inline+text shape.
- The durable move was again not a new transform family.
  It was to detect mixed-inline sibling-block containers at any depth, strip the
  wrapper path, reuse the proved top-level mixed-inline transform math, and
  prefix the wrapper path back on.
- That is enough for the current nested mixed-inline quote shape because the
  inner geometry is still the same direct mixed-inline block geometry already
  proved at top level.
- The honest remaining limit is now narrower again:
  nested containers whose child blocks are neither the current simple text-block
  subset nor the current direct mixed-inline subset still need a broader model.
- In practical terms, the next sharp limit is richer inline geometry inside a
  block:
  inline descendants with more than the current direct single-text-child shape,
  or inner wrappers whose geometry no longer reduces cleanly to the proved
  top-level mixed-inline transform.
- The next slice closed that richer-inline geometry gap for the current proof
  model.
- The durable move was to stop modeling block geometry as “direct child or one
  hop” and instead flatten each block into recursive text-leaf entries:
  - text leaf path inside the block
  - text length
- Once the block math used recursive leaf entries, the rest of the current
  transform stack kept working:
  - block-relative offset mapping
  - fragment extract/insert
  - explicit-at editor selection rebasing
  - explicit-at range-ref rebasing
  - nested quote wrapper prefix stripping
- That is enough for the current richer-inline proof shape:
  inline wrappers that contain text plus deeper inline descendants.
- The honest remaining limit is now sharper still:
  block descendants whose geometry cannot be reduced to a flat text-leaf list
  plus wrapper prefixes, or cases where insert semantics need more than local
  leaf-order math.
- The next probe after that asked whether wrapper block units already fit the
  same geometry model.
- Top-level list-item wrappers around richer-inline paragraphs do fit:
  the current recursive text-leaf block geometry plus container-path stripping is
  enough to prove fragment and browser copy/paste behavior there.
- The next slice promoted the nested wrapper-stack version too:
  quote container plus list-item wrapper units whose inner paragraphs use the
  richer-inline descendant geometry.
- That shape still reduces to the same proved ingredients:
  - recursive text-leaf ordering inside each paragraph block
  - stable wrapper-unit sibling ordering
  - wrapper-path stripping only where it does not change the inner geometry
- With the browser proof green, nested wrapper stacks are now promoted from
  contract-only probes into real proved state.
- The honest remaining limit is now sharper still:
  shapes where wrapper containers, wrapper units, and inner geometry all change
  in ways that no longer reduce to recursive text-leaf ordering plus wrapper
  path stripping.
- The next slice proved that one more wrapper level is still inside the current
  model:
  outer quote -> list-item wrapper unit -> inner quote -> richer-inline
  paragraphs.
- That shape still reduces to the same current ingredients:
  - recursive text-leaf ordering inside each block
  - stable wrapper-unit ordering
  - wrapper-path stripping that still exposes a proved inner geometry
- So deeper wrapper stacks are now browser-proved too, at least while the inner
  block geometry still reduces cleanly to the current recursive leaf model.
- The honest remaining limit is now even narrower:
  shapes where the inner geometry itself no longer reduces to recursive text
  leaves, or where the wrapper stack stops exposing a stable inner geometry when
  prefixes are stripped.

## Progress

- 2026-04-04: resumed after compaction and reloaded the required workflow:
  `learnings-researcher`, `planning-with-files`, `tdd`, `debug`, `react`.
- 2026-04-04: re-read the active proof test, placeholder example, bridge code,
  and the existing `slate-browser` plan file to recover exact state.
- 2026-04-04: reproduced the red proof on a fresh local server and confirmed
  the stable failure was selection `0.0:6|0.0:6`.
- 2026-04-04: probed the live DOM after IME and confirmed the example was
  appending each composition step into document text.
- 2026-04-04: logged the native event sequence and found the clean Chromium
  path ended on `compositionend` after transient `insertCompositionText` events.
- 2026-04-04: updated
  `../slate-v2/site/examples/ts/slate-v2-placeholder.tsx`
  so the proof surface ignores transient composition input and commits from DOM
  on `compositionend`.
- 2026-04-04: verified the browser proof with:
  - `bash ./scripts/run-slate-browser-local.sh 3100 /examples/slate-v2-placeholder "yarn build:slate-browser && yarn exec playwright test playwright/integration/examples/slate-v2-placeholder-ime.test.ts --project=chromium --workers=1"`
- 2026-04-04: verified TypeScript/lint sanity with:
  - `yarn lint:typescript`
- 2026-04-04: wired the new proof into the existing IME lane by updating
  `../slate-v2/package.json` so `test:slate-browser:ime` and
  `test:slate-browser:ime:local` both include
  `playwright/integration/examples/slate-v2-placeholder-ime.test.ts`.
- 2026-04-04: verified the combined local IME lane with:
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: documented the reusable rule in
  `docs/solutions/logic-errors/2026-04-04-slate-v2-placeholder-ime-proofs-must-commit-on-compositionend.md`.
- 2026-04-04: extracted the shared placeholder proof surface into
  `../slate-v2/site/examples/ts/components/slate-v2-placeholder-surface.tsx`,
  kept the FEFF route in `../slate-v2/site/examples/ts/slate-v2-placeholder.tsx`,
  and added the no-FEFF route in
  `../slate-v2/site/examples/ts/slate-v2-placeholder-no-feff.tsx`.
- 2026-04-04: added the hidden no-FEFF example path in
  `../slate-v2/site/constants/examples.ts`.
- 2026-04-04: extended
  `../slate-v2/playwright/integration/examples/slate-v2-placeholder-ime.test.ts`
  with a Chromium proof for the no-FEFF placeholder path.
- 2026-04-04: reproduced the initial no-FEFF red and confirmed the page crashed
  with `NotFoundError: Failed to execute 'removeChild' on 'Node'`.
- 2026-04-04: probed the no-FEFF path and found the failing seam:
  React owned the mutable inner `<br />` child that Chromium rewrote during IME.
- 2026-04-04: fixed the no-FEFF branch by keeping React ownership at the
  zero-width wrapper span and rendering the inner `<br />` as DOM-owned
  interior.
- 2026-04-04: verified the focused no-FEFF proof with:
  - `bash ./scripts/run-slate-browser-local.sh 3100 /examples/slate-v2-placeholder-no-feff "yarn build:slate-browser && yarn exec playwright test playwright/integration/examples/slate-v2-placeholder-ime.test.ts --project=chromium --workers=1"`
- 2026-04-04: re-verified the IME lane with:
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: documented the no-FEFF renderer-boundary rule in
  `docs/solutions/logic-errors/2026-04-04-slate-v2-no-feff-line-break-placeholders-need-dom-owned-br-interiors.md`.
- 2026-04-04: added the shared renderer seam in
  `../slate-v2/packages/slate-react-v2/src/components/zero-width-string.tsx`
  and exported it from
  `../slate-v2/packages/slate-react-v2/src/index.ts`.
- 2026-04-04: added direct package tests for the shared zero-width component in
  `../slate-v2/packages/slate-react-v2/test/runtime.tsx`.
- 2026-04-04: switched the placeholder proof surface to consume the shared
  `ZeroWidthString` component in
  `../slate-v2/site/examples/ts/components/slate-v2-placeholder-surface.tsx`.
- 2026-04-04: added the hidden browser matrix example in
  `../slate-v2/site/examples/ts/slate-v2-zero-width-matrix.tsx`
  and wired it in
  `../slate-v2/site/constants/examples.ts`.
- 2026-04-04: added the browser matrix proof in
  `../slate-v2/playwright/integration/examples/slate-v2-zero-width-matrix.test.ts`.
- 2026-04-04: updated
  `../slate-v2/package.json`
  so the Playwright e2e/IME lanes build
  `slate-react-v2` alongside `slate-browser`, `slate-react`, and
  `slate-dom-v2` before running.
- 2026-04-04: re-verified:
  - `yarn lint:typescript`
  - `yarn workspace slate-react-v2 test`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/src/core.ts`
  so `Editor.getFragment(...)` and `Transforms.insertFragment(...)` support the
  current one-block mixed-inline proof shape in addition to the earlier simple
  text-block proof shape.
- 2026-04-04: extended
  `../slate-v2/packages/slate-dom-v2/src/clipboard.ts`
  and
  `../slate-v2/packages/slate-dom-v2/test/clipboard-boundary.ts`
  so the clipboard boundary accepts the same mixed-inline proof shape and proves
  the round-trip.
- 2026-04-04: extended
  `../slate-v2/playwright/integration/examples/slate-v2-mixed-inline.test.ts`
  from “fail closed for now” into the real mixed-inline browser proof:
  selection, typing, and copy/paste round-trip.
- 2026-04-04: fixed
  `../slate-v2/packages/slate-react-v2/src/components/editable.tsx`
  so `Editable` can commit through `snapshotFromDom(...)` instead of only the
  old flat-text `snapshotForText(...)` path.
- 2026-04-04: fixed
  `../slate-v2/packages/slate-react-v2/src/components/editable-text-blocks.tsx`
  so `EditableBlocks` preserves the current descendant shape and only replaces
  text-leaf content when DOM edits commit back into editor state.
- 2026-04-04: fixed
  `../slate-v2/packages/slate-browser/src/playwright/index.ts`
  so nested-path selection helpers:
  - pass handle keys explicitly into page-eval snapshots
  - wait for handle hydration before falling back
  - avoid the earlier false-null selection reads
- 2026-04-04: updated
  `../slate-v2/package.json`
  so `build:slate-browser:playwright` also rebuilds `slate-v2`, which the site
  examples consume during browser proofs.
- 2026-04-04: verified the mixed-inline tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn workspace slate-react-v2 test`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/src/core.ts`
  so mixed-inline fragment extraction can span multiple top-level blocks and
  mixed-inline fragment insertion can paste multi-block fragments into the
  current proved mixed-inline target shape.
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  with multi-block mixed-inline fragment extraction and insertion proofs.
- 2026-04-04: extended
  `../slate-v2/packages/slate-dom-v2/test/clipboard-boundary.ts`
  with the matching cross-block clipboard boundary round-trip proof.
- 2026-04-04: extracted the shared mixed-inline surface into
  `../slate-v2/site/examples/ts/components/slate-v2-mixed-inline-surface.tsx`,
  kept the existing one-block route in
  `../slate-v2/site/examples/ts/slate-v2-mixed-inline.tsx`,
  and added the dedicated multi-block route in
  `../slate-v2/site/examples/ts/slate-v2-mixed-inline-multiblock.tsx`.
- 2026-04-04: added the hidden multi-block example path in
  `../slate-v2/site/constants/examples.ts`.
- 2026-04-04: added the browser proof in
  `../slate-v2/playwright/integration/examples/slate-v2-mixed-inline-multiblock.test.ts`
  and folded it into the local e2e lane in
  `../slate-v2/package.json`.
- 2026-04-04: verified the multi-block mixed-inline tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/src/core.ts`
  so explicit-at mixed-inline inserts rebase editor selections through
  block-relative text offsets inside the current proved mixed-inline shape.
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/src/range-ref-transform.ts`
  so later-block mixed-inline range refs shift correctly after explicit
  multi-block fragment inserts.
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  with explicit-at mixed-inline selection rebasing proofs.
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  with the later-block mixed-inline range-ref rebasing proof.
- 2026-04-04: verified the explicit-at mixed-inline rebasing tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/src/core.ts`
  with a core-only mixed-inline range-ref transform path for `insert_fragment`
  operations so same-block mixed-inline refs can rebase without bloating the
  public operation shape with synthetic metadata.
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  with same-block mixed-inline range-ref proofs for:
  - refs before the explicit insertion target
  - refs after the explicit insertion target
- 2026-04-04: re-verified after the same-block range-ref tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/src/core.ts`
  so simple text-block fragment extraction and insertion can operate inside a
  nested sibling-block container and preserve the wrapper element in the
  fragment.
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  with the nested quote extraction and insertion proofs.
- 2026-04-04: extended
  `../slate-v2/packages/slate-dom-v2/src/clipboard.ts`
  so plain-text export preserves nested block breaks and the accepted proof
  fragment subset includes the nested quote wrapper case.
- 2026-04-04: extended
  `../slate-v2/packages/slate-dom-v2/test/clipboard-boundary.ts`
  with the nested quote round-trip proof and a sharper unsupported nested shape.
- 2026-04-04: added the hidden browser proof surface in
  `../slate-v2/site/examples/ts/slate-v2-nested-quote.tsx`
  and registered it in
  `../slate-v2/site/constants/examples.ts`.
- 2026-04-04: added the Chromium browser proof in
  `../slate-v2/playwright/integration/examples/slate-v2-nested-quote.test.ts`
  and folded it into the local e2e lane in
  `../slate-v2/package.json`.
- 2026-04-04: verified the nested quote tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/src/core.ts`
  so explicit-at editor selections inside nested quote paragraph containers
  rebase by stripping the container prefix, reusing the top-level text-block
  rebasing logic, and prefixing the container path back.
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/src/core.ts`
  with a second core-only insert-fragment range-ref transform path for the same
  simple nested block-container shape.
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  with nested quote explicit-at selection rebasing proofs.
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  with nested quote explicit-at range-ref rebasing proofs.
- 2026-04-04: re-verified after the nested explicit-at rebasing tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: added the FEFF-backed inline-edge proof surface in
  `../slate-v2/site/examples/ts/components/slate-v2-inline-edge-surface.tsx`
  and the hidden route in
  `../slate-v2/site/examples/ts/slate-v2-inline-edge.tsx`.
- 2026-04-04: added the inline-edge IME proof in
  `../slate-v2/playwright/integration/examples/slate-v2-inline-edge-ime.test.ts`
  and folded it into the IME lane in
  `../slate-v2/package.json`.
- 2026-04-04: proved the inline-edge IME path passes in Chromium once the test
  sets the Slate selection semantically before composition instead of trusting
  a generic root click.
- 2026-04-04: re-verified:
  - `yarn lint:typescript`
  - `yarn test:slate-browser:ime:local`
  - `yarn test:slate-browser:e2e:local`
- 2026-04-04: documented the inline-edge setup rule in
  `docs/solutions/logic-errors/2026-04-04-inline-edge-ime-proofs-should-set-selection-semantically-before-composition.md`.
- 2026-04-04: added the FEFF-backed void-like proof surface in
  `../slate-v2/site/examples/ts/components/slate-v2-void-edge-surface.tsx`
  and the hidden route in
  `../slate-v2/site/examples/ts/slate-v2-void-edge.tsx`.
- 2026-04-04: added the focused browser proof in
  `../slate-v2/playwright/integration/examples/slate-v2-void-edge-ime.test.ts`
  and folded it into the IME lane in
  `../slate-v2/package.json`.
- 2026-04-04: proved the first void-like red was a false negative caused by a
  proof surface that did not mirror the real void spacer structure.
- 2026-04-04: updated
  `../slate-v2/site/examples/ts/components/slate-v2-void-edge-surface.tsx`
  so it matches the real legacy void seam:
  `data-slate-void="true"` element, non-editable content wrapper, and separate
  absolutely positioned spacer leaf.
- 2026-04-04: verified the focused void-like Chromium proof with:
  - `bash ./scripts/run-slate-browser-local.sh 3100 /examples/slate-v2-void-edge "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/slate-v2-void-edge-ime.test.ts --project=chromium --workers=1"`
- 2026-04-04: documented the structural void-like rule in
  `docs/solutions/logic-errors/2026-04-04-void-like-zero-width-ime-proofs-need-the-real-void-spacer-structure.md`.
- 2026-04-04: added the shared `TextString` primitive in
  `../slate-v2/packages/slate-react-v2/src/components/text-string.tsx`
  and exported it from
  `../slate-v2/packages/slate-react-v2/src/index.ts`.
- 2026-04-04: migrated the v2 placeholder, inline-edge, void-edge, and
  zero-width matrix proof surfaces to consume `TextString`.
- 2026-04-04: added a focused package test in
  `../slate-v2/packages/slate-react-v2/test/runtime.tsx`
  proving `TextString` repairs stale DOM text on rerender.
- 2026-04-04: re-verified:
  - `yarn workspace slate-react-v2 test`
  - `yarn lint:typescript`
  - `bash ./scripts/run-slate-browser-local.sh 3100 /examples/slate-v2-zero-width-matrix "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/slate-v2-zero-width-matrix.test.ts --project=chromium --workers=1"`
  - `bash ./scripts/run-slate-browser-local.sh 3101 /examples/slate-v2-placeholder "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/slate-v2-placeholder-ime.test.ts playwright/integration/examples/slate-v2-inline-edge-ime.test.ts playwright/integration/examples/slate-v2-void-edge-ime.test.ts --project=chromium --workers=1"`
- 2026-04-04: documented the shared text-boundary rule in
  `docs/solutions/logic-errors/2026-04-04-v2-text-string-primitives-should-own-the-dom-text-boundary.md`.
- 2026-04-04: added the minimal renderer-shape primitives in
  `../slate-v2/packages/slate-react-v2/src/components/`:
  `slate-text.tsx`, `slate-leaf.tsx`, `slate-element.tsx`, and
  `slate-spacer.tsx`.
- 2026-04-04: exported those primitives from
  `../slate-v2/packages/slate-react-v2/src/index.ts`
  and migrated the v2 placeholder, inline-edge, void-edge, and zero-width
  matrix proof surfaces to consume them.
- 2026-04-04: added focused package tests for the renderer node shapes in
  `../slate-v2/packages/slate-react-v2/test/runtime.tsx`.
- 2026-04-04: re-verified:
  - `yarn workspace slate-react-v2 test`
  - `yarn lint:typescript`
  - `bash ./scripts/run-slate-browser-local.sh 3100 /examples/slate-v2-zero-width-matrix "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/slate-v2-zero-width-matrix.test.ts --project=chromium --workers=1"`
  - `bash ./scripts/run-slate-browser-local.sh 3101 /examples/slate-v2-placeholder "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/slate-v2-placeholder-ime.test.ts playwright/integration/examples/slate-v2-inline-edge-ime.test.ts playwright/integration/examples/slate-v2-void-edge-ime.test.ts --project=chromium --workers=1"`
- 2026-04-04: documented the renderer-shape rule in
  `docs/solutions/logic-errors/2026-04-04-v2-renderer-primitives-should-own-node-shapes-not-example-markup.md`.
- 2026-04-04: added the shared placeholder primitive in
  `../slate-v2/packages/slate-react-v2/src/components/slate-placeholder.tsx`
  and exported it from
  `../slate-v2/packages/slate-react-v2/src/index.ts`.
- 2026-04-04: migrated the v2 placeholder proof surface to `SlatePlaceholder`
  in
  `../slate-v2/site/examples/ts/components/slate-v2-placeholder-surface.tsx`.
- 2026-04-04: added a focused package test for placeholder overlay attrs/style
  in
  `../slate-v2/packages/slate-react-v2/test/runtime.tsx`.
- 2026-04-04: re-verified:
  - `yarn workspace slate-react-v2 test`
  - `yarn lint:typescript`
  - `bash ./scripts/run-slate-browser-local.sh 3100 /examples/slate-v2-placeholder "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/slate-v2-placeholder-ime.test.ts --project=chromium --workers=1"`
- 2026-04-04: documented the placeholder-layer rule in
  `docs/solutions/logic-errors/2026-04-04-v2-placeholder-primitives-should-own-overlay-attrs-and-style.md`.
- 2026-04-04: added the compositional `EditableText` primitive in
  `../slate-v2/packages/slate-react-v2/src/components/editable-text.tsx`
  and exported it from
  `../slate-v2/packages/slate-react-v2/src/index.ts`.
- 2026-04-04: migrated the v2 placeholder, inline-edge, void-edge, and
  zero-width matrix proof surfaces to consume `EditableText`.
- 2026-04-04: added a focused package test for `EditableText` in
  `../slate-v2/packages/slate-react-v2/test/runtime.tsx`.
- 2026-04-04: re-verified:
  - `yarn workspace slate-react-v2 test`
  - `yarn lint:typescript`
  - `bash ./scripts/run-slate-browser-local.sh 3100 /examples/slate-v2-zero-width-matrix "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/slate-v2-zero-width-matrix.test.ts --project=chromium --workers=1"`
  - `bash ./scripts/run-slate-browser-local.sh 3101 /examples/slate-v2-placeholder "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/slate-v2-placeholder-ime.test.ts playwright/integration/examples/slate-v2-inline-edge-ime.test.ts playwright/integration/examples/slate-v2-void-edge-ime.test.ts --project=chromium --workers=1"`
- 2026-04-04: documented the compositional text-layer rule in
  `docs/solutions/logic-errors/2026-04-04-v2-editable-text-primitives-should-compose-leaf-text-zero-width-and-placeholder.md`.
- 2026-04-04: added the compositional element-layer primitives in
  `../slate-v2/packages/slate-react-v2/src/components/editable-element.tsx`
  and
  `../slate-v2/packages/slate-react-v2/src/components/void-element.tsx`,
  then exported them from
  `../slate-v2/packages/slate-react-v2/src/index.ts`.
- 2026-04-04: migrated the v2 placeholder, inline-edge, void-edge, and
  zero-width matrix proof surfaces to consume the element layer instead of
  rebuilding wrappers and void spacer layout by hand.
- 2026-04-04: added focused package tests for `EditableElement` and
  `VoidElement` in
  `../slate-v2/packages/slate-react-v2/test/runtime.tsx`.
- 2026-04-04: re-verified:
  - `yarn workspace slate-react-v2 test`
  - `yarn lint:typescript`
  - `bash ./scripts/run-slate-browser-local.sh 3100 /examples/slate-v2-zero-width-matrix "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/slate-v2-zero-width-matrix.test.ts --project=chromium --workers=1"`
  - `bash ./scripts/run-slate-browser-local.sh 3101 /examples/slate-v2-placeholder "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/slate-v2-placeholder-ime.test.ts playwright/integration/examples/slate-v2-inline-edge-ime.test.ts playwright/integration/examples/slate-v2-void-edge-ime.test.ts --project=chromium --workers=1"`
- 2026-04-04: documented the element-layer rule in
  `docs/solutions/logic-errors/2026-04-04-v2-element-primitives-should-compose-element-and-void-contracts.md`.
- 2026-04-04: added the minimal editable root in
  `../slate-v2/packages/slate-react-v2/src/components/editable.tsx`
  and exported it from
  `../slate-v2/packages/slate-react-v2/src/index.ts`.
- 2026-04-04: migrated the v2 placeholder, inline-edge, and void-edge proof
  surfaces to the packaged editable root loop.
- 2026-04-04: added a focused package test for `Editable` DOM-to-snapshot
  reconciliation in
  `../slate-v2/packages/slate-react-v2/test/runtime.tsx`.
- 2026-04-04: re-verified:
  - `yarn workspace slate-react-v2 test`
  - `yarn lint:typescript`
  - `bash ./scripts/run-slate-browser-local.sh 3100 /examples/slate-v2-zero-width-matrix "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/slate-v2-zero-width-matrix.test.ts --project=chromium --workers=1"`
  - `bash ./scripts/run-slate-browser-local.sh 3101 /examples/slate-v2-placeholder "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/slate-v2-placeholder-ime.test.ts playwright/integration/examples/slate-v2-inline-edge-ime.test.ts playwright/integration/examples/slate-v2-void-edge-ime.test.ts --project=chromium --workers=1"`
- 2026-04-04: documented the editable-root rule in
  `docs/solutions/logic-errors/2026-04-04-v2-editable-roots-should-own-mount-selection-sync-and-dom-commit.md`.
- 2026-04-04: extended `EditableText` so it can split one text node into
  multiple rendered leaves from projection slices via `runtimeId` and
  `renderSegment(...)`.
- 2026-04-04: added the highlighted rich-text proof surface in
  `../slate-v2/site/examples/ts/slate-v2-highlighted-text.tsx`
  and the browser proof in
  `../slate-v2/playwright/integration/examples/slate-v2-highlighted-text.test.ts`,
  then folded it into
  `../slate-v2/package.json` e2e scripts.
- 2026-04-04: fixed the decorated-text browser seam by teaching
  `slate-dom-v2` and `slate-browser` to map cumulative offsets across
  multi-leaf text nodes instead of assuming one DOM text node per Slate text
  node.
- 2026-04-04: re-verified:
  - `yarn workspace slate-react-v2 test`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: documented the decorated-text rules in
  `docs/solutions/logic-errors/2026-04-04-v2-editable-text-should-split-leaves-from-projection-slices.md`
  and
  `docs/solutions/logic-errors/2026-04-04-decorated-multi-leaf-text-needs-cumulative-offset-mapping.md`.
- 2026-04-04: taught `EditableText` to derive `text` and `runtimeId` from a
  Slate path and to render zero-length projection slices as mark-placeholder
  leaves.
- 2026-04-04: migrated the highlighted-text and mark-placeholder proof surfaces
  to the path-bound `EditableText` API.
- 2026-04-04: added focused package coverage for path-bound `EditableText` and
  zero-length mark-placeholder rendering in
  `../slate-v2/packages/slate-react-v2/test/runtime.tsx`.
- 2026-04-04: added the mark-placeholder browser proof in
  `../slate-v2/playwright/integration/examples/slate-v2-mark-placeholder.test.ts`
  and folded it into
  `../slate-v2/package.json` e2e scripts.
- 2026-04-04: re-verified:
  - `yarn workspace slate-react-v2 test`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: documented the path-binding and mark-placeholder rule in
  `docs/solutions/logic-errors/2026-04-04-v2-text-surfaces-should-bind-runtime-ids-from-paths-and-use-zero-length-projections-for-mark-placeholders.md`.
- 2026-04-04: wired `Editable` to the `ClipboardBridge` for browser-side copy
  and paste semantics.
- 2026-04-04: added browser proofs for decorated selection/copy and
  mark-placeholder selection transitions in
  `../slate-v2/playwright/integration/examples/slate-v2-highlighted-text.test.ts`
  and
  `../slate-v2/playwright/integration/examples/slate-v2-mark-placeholder.test.ts`.
- 2026-04-04: normalized `slate-browser` selected-text reads so FEFF sentinels
  do not leak through mark-placeholder selections.
- 2026-04-04: re-verified:
  - `yarn workspace slate-react-v2 test`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: documented the rich-text browser helper rule in
  `docs/solutions/logic-errors/2026-04-04-decorated-clipboard-and-selected-text-helpers-should-strip-render-only-wrappers-and-feff.md`.
- 2026-04-04: exposed `EditableBlocks` from
  `../slate-v2/packages/slate-react-v2/src/components/editable-blocks.tsx`
  as the first narrow public editor-facing surface over the proved renderer
  stack.
- 2026-04-04: migrated the highlighted-text and mark-placeholder examples to
  consume that public surface directly.
- 2026-04-04: documented the public-surface conclusion in
  `docs/solutions/logic-errors/2026-04-04-v2-editable-blocks-can-be-the-first-public-editor-surface.md`.
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/src/core.ts`
  so nested mixed-inline quote paragraph containers can:
  - extract wrapped fragments
  - insert wrapped fragments back into the same container shape
  - rebase explicit-at editor selections by stripping the wrapper path and
    reusing the top-level mixed-inline transform
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/src/core.ts`
  with a fourth core-only insert-fragment range-ref transform path for nested
  mixed-inline block containers.
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  with nested mixed-inline quote extraction, insertion, and explicit-at
  selection rebasing proofs.
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  with nested mixed-inline quote explicit-at range-ref rebasing proofs.
- 2026-04-04: extended
  `../slate-v2/packages/slate-dom-v2/src/clipboard.ts`
  so the clipboard proof subset includes a wrapped container whose child blocks
  are mixed-inline blocks.
- 2026-04-04: added the hidden browser proof surface in
  `../slate-v2/site/examples/ts/slate-v2-nested-mixed-inline.tsx`
  and registered it in
  `../slate-v2/site/constants/examples.ts`.
- 2026-04-04: added the Chromium browser proof in
  `../slate-v2/playwright/integration/examples/slate-v2-nested-mixed-inline.test.ts`
  and folded it into the local e2e lane in
  `../slate-v2/package.json`.
- 2026-04-04: installed the missing local Playwright Chromium binaries with:
  - `yarn exec playwright install chromium`
- 2026-04-04: re-verified after the nested mixed-inline tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: synced the higher-level docs again in:
  - `docs/slate-v2/overview.md`
  - `docs/slate-v2/cohesive-program-plan.md`
  - `docs/slate-v2/final-synthesis.md`
- 2026-04-04: generalized the core block-geometry helpers in
  `../slate-v2/packages/slate-v2/src/core.ts`
  from the old direct-child / one-hop assumption to recursive text-leaf entry
  mapping inside a block.
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  with richer-inline top-level and nested quote proofs for:
  - extraction
  - insertion
  - explicit-at selection rebasing
- 2026-04-04: extended
  `../slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  with richer-inline top-level and nested quote proofs for explicit-at
  range-ref rebasing.
- 2026-04-04: extended
  `../slate-v2/packages/slate-dom-v2/src/clipboard.ts`
  so the supported proof subset includes richer inline descendant trees inside
  a block, not only the earlier direct single-text-child inline shape.
- 2026-04-04: added the hidden browser proof surfaces in:
  - `../slate-v2/site/examples/ts/slate-v2-rich-inline.tsx`
  - `../slate-v2/site/examples/ts/slate-v2-nested-rich-inline.tsx`
  - `../slate-v2/site/examples/ts/components/slate-v2-rich-inline-surface.tsx`
- 2026-04-04: added the Chromium browser proofs in:
  - `../slate-v2/playwright/integration/examples/slate-v2-rich-inline.test.ts`
  - `../slate-v2/playwright/integration/examples/slate-v2-nested-rich-inline.test.ts`
    and folded them into the local e2e lane in
    `../slate-v2/package.json`.
- 2026-04-04: re-verified after the richer-inline geometry tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-04: synced the higher-level docs again in:
  - `docs/slate-v2/overview.md`
  - `docs/slate-v2/cohesive-program-plan.md`
  - `docs/slate-v2/final-synthesis.md`
- 2026-04-05: probed wrapper block units using list-item wrappers around
  richer-inline paragraphs.
- 2026-04-05: added the hidden top-level browser proof surface in
  `../slate-v2/site/examples/ts/slate-v2-list-rich-inline.tsx`
  and registered it in
  `../slate-v2/site/constants/examples.ts`.
- 2026-04-05: added the Chromium browser proof in
  `../slate-v2/playwright/integration/examples/slate-v2-list-rich-inline.test.ts`
  and folded it into the local e2e lane in
  `../slate-v2/package.json`.
- 2026-04-05: verified the wrapper-unit top-level slice with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
- 2026-04-05: added the hidden nested wrapper-stack browser proof surface in
  `../slate-v2/site/examples/ts/slate-v2-nested-list-rich-inline.tsx`
  and registered it in
  `../slate-v2/site/constants/examples.ts`.
- 2026-04-05: added the Chromium browser proof in
  `../slate-v2/playwright/integration/examples/slate-v2-nested-list-rich-inline.test.ts`
  and folded it into the local e2e lane in
  `../slate-v2/package.json`.
- 2026-04-05: extended
  `../slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  with top-level and nested wrapper-stack range-ref rebasing proofs.
- 2026-04-05: promoted nested quote+list wrapper stacks from contract-only probe
  to browser-proved state after the Chromium proof matched the contract layer.
- 2026-04-05: re-verified after the nested wrapper-stack promotion tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-05: synced the higher-level docs again in:
  - `docs/slate-v2/overview.md`
  - `docs/slate-v2/cohesive-program-plan.md`
  - `docs/slate-v2/final-synthesis.md`
- 2026-04-05: added top-level and quote-wrapped list-unit browser proof routes in:
  - `../slate-v2/site/examples/ts/slate-v2-list-unit-rich-inline.tsx`
  - `../slate-v2/site/examples/ts/slate-v2-nested-list-unit-rich-inline.tsx`
- 2026-04-05: added the matching Chromium proofs in:
  - `../slate-v2/playwright/integration/examples/slate-v2-list-unit-rich-inline.test.ts`
  - `../slate-v2/playwright/integration/examples/slate-v2-nested-list-unit-rich-inline.test.ts`
- 2026-04-05: extended `../slate-v2/packages/slate-dom-v2/test/clipboard-boundary.ts`
  with list-unit clipboard round-trip coverage.
- 2026-04-05: re-verified the list-unit promotion tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
- 2026-04-05: added top-level and quote-wrapped paragraph-plus-quote list-unit
  routes in:
  - `../slate-v2/site/examples/ts/slate-v2-list-unit-quote-rich-inline.tsx`
  - `../slate-v2/site/examples/ts/slate-v2-nested-list-unit-quote-rich-inline.tsx`
- 2026-04-05: added the matching Chromium proofs in:
  - `../slate-v2/playwright/integration/examples/slate-v2-list-unit-quote-rich-inline.test.ts`
  - `../slate-v2/playwright/integration/examples/slate-v2-nested-list-unit-quote-rich-inline.test.ts`
- 2026-04-05: extended `../slate-v2/packages/slate-dom-v2/test/clipboard-boundary.ts`
  with paragraph-plus-quote list-unit round-trip coverage.
- 2026-04-05: re-verified the paragraph-plus-quote list-unit tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
- 2026-04-05: added top-level and quote-wrapped paragraph-plus-list-plus-quote
  list-unit routes in:
  - `../slate-v2/site/examples/ts/slate-v2-list-unit-quote-rich-inline.tsx`
  - `../slate-v2/site/examples/ts/slate-v2-nested-list-unit-quote-rich-inline.tsx`
- 2026-04-05: added the matching Chromium proofs in:
  - `../slate-v2/playwright/integration/examples/slate-v2-list-unit-quote-rich-inline.test.ts`
  - `../slate-v2/playwright/integration/examples/slate-v2-nested-list-unit-quote-rich-inline.test.ts`
- 2026-04-05: extended `../slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  and `../slate-v2/packages/slate-dom-v2/test/clipboard-boundary.ts`
  for the paragraph-plus-list-plus-quote wrapper-unit shape.
- 2026-04-05: re-verified the paragraph-plus-list-plus-quote tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
- 2026-04-05: added top-level and quote-wrapped multi-unit complex list routes in:
  - `../slate-v2/site/examples/ts/slate-v2-complex-list-units-rich-inline.tsx`
  - `../slate-v2/site/examples/ts/slate-v2-nested-complex-list-units-rich-inline.tsx`
- 2026-04-05: added the matching Chromium proofs in:
  - `../slate-v2/playwright/integration/examples/slate-v2-complex-list-units-rich-inline.test.ts`
  - `../slate-v2/playwright/integration/examples/slate-v2-nested-complex-list-units-rich-inline.test.ts`
- 2026-04-05: extended `../slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  and `../slate-v2/packages/slate-dom-v2/test/clipboard-boundary.ts`
  for multi-unit complex wrapper-list fragments.
- 2026-04-05: re-verified the multi-unit complex wrapper-list tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
- 2026-04-05: added top-level and quote-wrapped multi-unit complex list routes in:
  - `../slate-v2/site/examples/ts/slate-v2-complex-list-units-rich-inline.tsx`
  - `../slate-v2/site/examples/ts/slate-v2-nested-complex-list-units-rich-inline.tsx`
- 2026-04-05: added the matching Chromium proofs in:
  - `../slate-v2/playwright/integration/examples/slate-v2-complex-list-units-rich-inline.test.ts`
  - `../slate-v2/playwright/integration/examples/slate-v2-nested-complex-list-units-rich-inline.test.ts`
- 2026-04-05: re-verified the sibling complex wrapper-list tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
- 2026-04-05: aligned broader sibling-unit explicit-at range-ref behavior with
  the real selection semantics in `../slate-v2/packages/slate-v2/src/core.ts`.
- 2026-04-05: re-verified the explicit-at rebasing tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
- 2026-04-05: added top-level and quote-wrapped multi-block-child complex unit
  routes in:
  - `../slate-v2/site/examples/ts/slate-v2-multi-block-complex-list-units-rich-inline.tsx`
  - `../slate-v2/site/examples/ts/slate-v2-nested-multi-block-complex-list-units-rich-inline.tsx`
- 2026-04-05: added the matching Chromium proofs in:
  - `../slate-v2/playwright/integration/examples/slate-v2-multi-block-complex-list-units-rich-inline.test.ts`
  - `../slate-v2/playwright/integration/examples/slate-v2-nested-multi-block-complex-list-units-rich-inline.test.ts`
- 2026-04-05: extended `../slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  and `../slate-v2/packages/slate-dom-v2/test/clipboard-boundary.ts`
  for sibling complex units whose nested list and quote children each contain
  multiple blocks.
- 2026-04-05: re-verified the multi-block-child-container tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
- 2026-04-05: extended `../slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  and `../slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  with explicit-at selection/range-ref proofs for broader sibling units whose
  child containers are multi-block.
- 2026-04-05: re-verified the multi-block-child explicit-at tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn lint:typescript`
- 2026-04-05: extended `../slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  and `../slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  with expanded cross-unit explicit-at selection/range-ref proofs.
- 2026-04-05: re-verified the expanded cross-unit explicit-at tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn lint:typescript`
- 2026-04-05: added the ordered-list browser proof route in:
  - `../slate-v2/site/examples/ts/slate-v2-ordered-list-unit-rich-inline.tsx`
- 2026-04-05: added the matching Chromium proof in:
  - `../slate-v2/playwright/integration/examples/slate-v2-ordered-list-unit-rich-inline.test.ts`
- 2026-04-05: extended `../slate-v2/packages/slate-v2/src/core.ts`,
  `../slate-v2/packages/slate-v2/test/clipboard-contract.ts`,
  `../slate-v2/packages/slate-v2/test/range-ref-contract.ts`,
  and `../slate-v2/packages/slate-dom-v2/test/clipboard-boundary.ts`
  for the ordered-list wrapper-unit variant.
- 2026-04-05: re-verified the ordered-list wrapper-unit tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
- 2026-04-05: extended the ordered-list tranche to cover cross-container
  ordered-list -> bulleted-list transplant in:
  - `../slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `../slate-v2/packages/slate-v2/test/range-ref-contract.ts`
- 2026-04-05: re-verified the cross-container list transplant tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn lint:typescript`
- 2026-04-05: extended the wrapper-unit seam in
  `../slate-v2/packages/slate-v2/src/core.ts`
  from hardcoded `list-item` to compatible homogeneous unit types.
- 2026-04-05: added the check-list contract proofs in:
  - `../slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `../slate-v2/packages/slate-v2/test/range-ref-contract.ts`
- 2026-04-05: re-verified the compatible unit-type tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
- 2026-04-05: added the check-list browser proof route in:
  - `../slate-v2/site/examples/ts/slate-v2-check-list-unit-rich-inline.tsx`
- 2026-04-05: added the matching Chromium proof in:
  - `../slate-v2/playwright/integration/examples/slate-v2-check-list-unit-rich-inline.test.ts`
- 2026-04-05: re-verified the explicit `check-list-item` variant with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
- 2026-04-05: extended the seam again in `../slate-v2/packages/slate-v2/src/core.ts`
  so compatible heterogeneous sibling unit types can reuse the same wrapper-list
  path when the outer container contract still matches.
- 2026-04-05: re-verified the heterogeneous sibling-unit tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
- 2026-04-05: added the hidden deeper wrapper-stack browser proof surface in
  `../slate-v2/site/examples/ts/slate-v2-deep-wrapper-rich-inline.tsx`
  and registered it in
  `../slate-v2/site/constants/examples.ts`.
- 2026-04-05: added the Chromium browser proof in
  `../slate-v2/playwright/integration/examples/slate-v2-deep-wrapper-rich-inline.test.ts`
  and folded it into the local e2e lane in
  `../slate-v2/package.json`.
- 2026-04-05: extended
  `../slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  with deeper wrapper-stack range-ref rebasing proofs.
- 2026-04-05: promoted deeper wrapper stacks from “should probably still work”
  into browser-proved state after the Chromium proof matched the contract layer.
- 2026-04-05: re-verified after the deeper wrapper-stack promotion tranche with:
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts`
  - `bun test /Users/zbeyens/git/slate-v2/packages/slate-v2/test/range-ref-contract.ts`
  - `yarn workspace slate-dom-v2 test clipboard-boundary`
  - `yarn lint:typescript`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
- 2026-04-05: synced the higher-level docs again in:
  - `docs/slate-v2/overview.md`
  - `docs/slate-v2/cohesive-program-plan.md`
  - `docs/slate-v2/final-synthesis.md`

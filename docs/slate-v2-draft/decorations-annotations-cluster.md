# Slate decorations / annotations cluster

## Why this deserves its own cluster

The old Slate issue corpus kept flattening decorations into bigger buckets like React runtime, selection, performance, and API ergonomics. That hides the real pattern.

Decorations were carrying at least four different jobs at once:

- render-time marks on text
- cross-node visual overlays
- externally-driven transient highlights
- annotation-like anchors for comments and cursors

That overloading is why the same family of bugs keeps resurfacing with different symptoms.

This is not one bug. It is one bad abstraction boundary.

## Core issue families

### 1. Semantic collapse: leaf props are too lossy

The cleanest example is [`#3383`](https://github.com/ianstormtaylor/slate/issues/3383): overlapping marks or decorations with the same semantic meaning but different metadata cannot coexist once everything is flattened into leaf props.

The issue is not “highlighting is hard”. The issue is that the current leaf model only preserves orthogonal properties well. Once two overlays want the same key with different payloads, one wins and the other dies.

Related pressure:

- [`#3383`](https://github.com/ianstormtaylor/slate/issues/3383): overlapping same-semantic metadata is lossy
- [`#2564`](https://github.com/ianstormtaylor/slate/issues/2564): marks vs inlines were already semantically muddy
- [`#2465`](https://github.com/ianstormtaylor/slate/issues/2465): render-time mark ergonomics are brittle because the renderer works on split leaves, not a richer overlay model

Takeaway: leaf splitting is fine for basic formatting. It is weak for preserving multiple independent overlay payloads.

### 2. Range topology: decorations want to span more than one text leaf

The second cluster is about shape, not speed.

Users want decorations that:

- span siblings
- bridge inline boundaries
- operate from higher-order nodes
- preview or mask content without mutating document state

Related pressure:

- [`#4392`](https://github.com/ianstormtaylor/slate/issues/4392): cross-node decorate
- [`#4426`](https://github.com/ianstormtaylor/slate/issues/4426): range masking
- [`#4477`](https://github.com/ianstormtaylor/slate/issues/4477): selection-anchored comments for collaborative writing

These are all variants of the same problem: the public `decorate(entry)` contract is too text-leaf-shaped for richer overlay behavior, but too implicit to expose a real overlay/annotation model.

Takeaway: once an overlay needs to outgrow “mark this leaf fragment”, the API stops feeling honest.

### 3. Performance and invalidation: decoration propagation explodes fast

This is the hottest runtime cluster.

The local issue docs already tagged it:

- [`#4483`](https://github.com/ianstormtaylor/slate/issues/4483): dynamic decorations rerender cost
- old corpus notes around nested-leaf invalidation and large decorated trees

The important detail from [`#4993`](https://github.com/ianstormtaylor/slate/pull/4993):

- computing all decorations at the top of the tree and passing them downward makes `Range.intersection` the bottleneck
- mixed-depth trees become brutal because each level keeps intersecting large decoration sets against many descendants
- nested structures like code containers with many lines turn this into practical unusability

`#4993` argues that top-level flattening was a regression because it destroyed the old “only redecorate the changed part of the tree” behavior.

The important detail from [`#4997`](https://github.com/ianstormtaylor/slate/pull/4997):

- selector/store-style subscriptions can localize rerenders better than pure context propagation
- that helps when the `decorate` function itself changes often
- but it still keeps `decorate` in a fragile place: a prop whose timing must line up perfectly with Slate reconciliation and DOM selection repair

Takeaway: performance pain here is not generic “decorations are slow”. It is invalidation-model pain.

### 4. Selection, IME, and async timing: decorated DOM and editor state drift apart

This is where decoration debt stops being annoying and starts breaking editing.

Related pressure:

- `#3309`: decorated text cannot be selected
- `#3162`: decorate + IME input desync
- `#4712`: decoration range with `text` field interferes with selection
- [`#5987`](https://github.com/ianstormtaylor/slate/issues/5987): caret jumps when async decorate updates land
- `#4581`: deleting decoration/void then typing can crash in Firefox

This family keeps saying the same thing:

- decoration application changes DOM structure or leaf boundaries
- selection mapping and composition timing are extremely sensitive to that
- externally-timed decoration updates make the problem worse

`#4997` is the most useful thread here because it did not die at “perf seems better”.

It found a harder failure mode:

- a selector-style subscription model looked promising
- then a real debounced-decoration repro produced cursor jumps, ghost plain-text in the DOM, and broken internal state
- the author’s conclusion was blunt: `decorate` as a prop is a delicate house of cards when decoration changes are driven externally and not synchronized with editor `onChange`

That matters more than the micro-optimization details.

Takeaway: the runtime contract between decorations, selection reconciliation, and externally-driven updates is structurally fragile.

### 5. Annotation pressure: comments and cursors are not just “more decorations”

This is the part people kept circling without fully landing.

The old discussions repeatedly converge on the same idea:

- decorations derived from document structure are one thing
- externally-maintained anchored overlays are another

`#4477` asks for comment anchors. The `#4993` discussion explicitly points back to older annotation concepts and says decorations are not ideal for cursors. The comments around potential APIs mention keyed overlays, range refs, and imperatively maintained decoration-like entities.

That is annotation pressure, not mere decoration pressure.

The useful distinction:

- decoration: derived projection from node content or local structure
- annotation: persistent or externally-owned anchor tied to a range over time

Once you force both through the same `decorate` funnel, you get:

- ambiguous invalidation semantics
- pressure for stable vs unstable decorate references
- hacks for collaborative cursors or comments
- timing bugs when external state changes need to rebroadcast into the tree

Takeaway: annotations want explicit ownership and lifetime semantics. Decorations do not give that for free.

## What `#4993` and `#4997` actually taught

### `#4993`: the contract was already ambiguous

The real argument in `#4993` was not just performance. It was contract ambiguity.

Two incompatible expectations existed:

1. Old Slate-style expectation:
   - changed node => local redecorate
   - changed `decorate` function reference => full redecorate
2. Plate / slate-yjs-era expectation:
   - stable `decorate` function should still reflect changing external state

That is the actual fracture line.

`#4993` says forcing top-level recomputation for the whole tree is too expensive and breaks efficient local decoration propagation.

It also surfaced a fair complaint from downstream libraries: if Slate expects `decorate` invalidation-by-reference, that contract was not explicit enough and was hostile to frameworks that naturally keep a stable function and vary external state.

### `#4997`: faster subscriptions do not fix the semantic mismatch

`#4997` tried the smart version:

- use subscription/selectors instead of raw context churn
- rerender only nodes whose resulting decoration slice changed

That helps the pure perf story.

Then async/debounced decoration updates broke it.

That result is gold because it proves the problem is deeper than “wrong rerender primitive”.

Better subscription mechanics do not solve:

- externally-owned decoration timing
- selection reconciliation hazards
- annotation-like overlay semantics hiding inside `decorate`

So `#4997` is useful not because it landed. It is useful because it found the wall.

## Current architectural read

My read is simple:

- do not revive legacy `decorate` semantics casually
- do not pretend comments/cursors/anchors are solved by better leaf decoration plumbing
- do not collapse projection-local decorations and annotation anchors into one undifferentiated API again

The current `slate-v2` direction is closer to the truth:

- projection-local decoration behavior stays narrow
- annotation anchors get explicit treatment
- the engine does not get widened just to appease legacy `decorate` weirdness

That matches the evidence better than trying to make one old abstraction satisfy every overlay use case.

## Local `slate-v2` ideas already on the table

The good news is that `slate-v2` already has most of the right instincts. They
were just spread across too many docs.

### 1. Projection slices already beat a second decoration model

The most important local rule is already written down:

- [projection proof must split range semantics from React overlay store](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-react-v2-projection-proof-must-split-range-semantics-from-react-overlay-store.md)
- [editable text should split leaves from projection slices](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-text-should-split-leaves-from-projection-slices.md)

That is the right seam.

Core should own logical range meaning. React should own subscription breadth and
slice delivery. The renderer should consume slices, not reinvent decorations
again.

### 2. Durable anchors already want range refs / bookmarks, not callback tricks

The annotation work already found the honest substrate:

- [range refs must be transaction-aware and default inward](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-v2-range-refs-must-be-transaction-aware-and-default-inward.md)

That matters because comments, review anchors, persistent diagnostics, and other
durable spans are not just “whatever the latest decorate function returned”.

They need:

- ids
- lifetime
- affinity semantics
- transaction-aware rebasing
- commit-time publication

That is bookmark/range-ref territory.

### 3. Decorated text changed the DOM contract, and the bridge had to admit it

Local browser proof already killed the naive assumptions:

- [decorated multi-leaf text needs cumulative offset mapping](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-decorated-multi-leaf-text-needs-cumulative-offset-mapping.md)
- [decorated clipboard and selected-text helpers should strip render-only wrappers and FEFF](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-decorated-clipboard-and-selected-text-helpers-should-strip-render-only-wrappers-and-feff.md)

So the rewrite cannot stop at “React rerenders less”.

It also has to preserve:

- honest Slate offset <-> DOM offset mapping
- clipboard semantics that ignore render-only wrappers
- selected-text semantics that ignore FEFF or placeholder junk

### 4. Huge docs want corridor + occlusion, not fake foundational chunking

The local huge-doc posture is already better than old Slate thinking:

- [chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/replacement-family-ledger.md)

The right default is:

- selector-first runtime
- active editing corridor
- occlusion outside the corridor
- heavy overlays separate from text-tree rerender

That is the correct place to start if decorations need to survive huge docs or
future virtualization.

## Cross-editor scan

This is the part where most editor design docs get weak. They either blindly
worship ProseMirror or they cherry-pick shiny terms from five repos and call it
strategy.

The honest take is narrower.

### ProseMirror

Useful things to steal:

- explicit decoration kinds and mapping discipline in [decoration.ts](/Users/zbeyens/git/prosemirror/view/src/decoration.ts)
  - inline decorations
  - widget decorations
  - node decorations
  - mapping through transactions
  - hierarchical `DecorationSet`
- selection bookmark seriousness in [selection.ts](/Users/zbeyens/git/prosemirror/state/src/selection.ts)
  and [history.ts](/Users/zbeyens/git/prosemirror/history/src/history.ts)

Useful thing to reject:

- letting the PM decoration engine become the final truth for all overlay use
  cases

Why reject it:

- it is strong at mapped document-attached overlays
- it is weaker when the product wants richer overlapping review/suggestion UI
- even Tiptap’s docs admit overlapping suggestions are blocked by a ProseMirror
  decoration limitation

So the steal is:

- explicit overlay types
- mapped sets
- bookmarks

Not:

- “just use one decoration engine for everything”

### Lexical

Useful things to steal:

- React-side decorator subscriptions in [useReactDecorators.tsx](/Users/zbeyens/git/lexical/packages/lexical-react/src/shared/useReactDecorators.tsx)
  via `useSyncExternalStore`
- explicit node decorator surface in [LexicalDecoratorNode.ts](/Users/zbeyens/git/lexical/packages/lexical/src/nodes/LexicalDecoratorNode.ts)
- dirty-set-aware update filtering in [LexicalOnChangePlugin.ts](/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalOnChangePlugin.ts)
- cursor overlay separation in [useYjsCollaboration.tsx](/Users/zbeyens/git/lexical/packages/lexical-react/src/shared/useYjsCollaboration.tsx)
  with a dedicated cursor container

Useful thing to reject:

- pretending `DecoratorNode` is a general text-decoration answer

Why reject it:

- Lexical decorators are excellent for node-sized React portals and embedded UI
- they are not a general overlapping inline decoration + annotation-anchor
  substrate

So the steal is:

- portal/widget layer
- subscription/store discipline
- dirty-tag filtering
- collaboration cursor UI outside the text leaf model

Not:

- make every overlay a decorator node

### Tiptap

Useful things to steal:

- ruthless product packaging distinction
- comments as a separate feature/system in [overview.mdx](/Users/zbeyens/git/tiptap-docs/src/content/comments/getting-started/overview.mdx)
- mark views as explicit in-editor rendering surfaces in [mark-views/index.mdx](/Users/zbeyens/git/tiptap-docs/src/content/editor/extensions/custom-extensions/mark-views/index.mdx)

Useful thing to reject:

- relying on ProseMirror decoration limits for review/suggestion UX

Why reject it:

- [display-suggestions.mdx](/Users/zbeyens/git/tiptap-docs/src/content/content-ai/capabilities/ai-toolkit/api-reference/display-suggestions.mdx)
  says overlapping suggestions cannot be displayed because of a ProseMirror
  decoration limitation

That is fine for their product surface. It is not the right north star for a
fresh rewrite.

So the steal is:

- comments as a real annotation product, not a cute highlight
- mark views separate from output serialization

Not:

- accept “overlapping overlays don’t work” as an engine law

### Premirror + Pretext

Useful things to steal:

- snapshot -> measure -> compose -> viewport split in [Premirror README](/Users/zbeyens/git/premirror/README.md)
- layout as a separate deterministic model in [design-proposal.md](/Users/zbeyens/git/premirror/docs/design-proposal.md)
- explicit widget decorations for page chrome and diagnostics
- selection projection and mapping between document positions and composed layout

Useful thing to reject:

- dragging page-layout measurement into the core editing hot path

Why reject it:

- this lane is gold for pagination, page chrome, offscreen planning, and future
  virtualization
- it is overkill for normal inline decoration semantics

So the steal is:

- layout is derived state
- layout has its own invalidation and profiling model
- overlays can project from composed output without owning document semantics

Not:

- let pagination needs dictate the base decoration API

### `use-editable`, `rich-textarea`, and `edix`

These repos matter mostly because they keep you honest about the lower end of
the space.

What they prove:

- [use-editable README](/Users/zbeyens/git/use-editable/README.md):
  contenteditable surfaces need mutation rollback and selection restoration
- [rich-textarea README](/Users/zbeyens/git/rich-textarea/README.md) and
  [textarea.tsx](/Users/zbeyens/git/rich-textarea/src/textarea.tsx):
  a textarea + backdrop overlay is fantastic for plain-text decoration,
  autocomplete, menus, and IME-safe highlighting
- [edix README](/Users/zbeyens/git/edix/README.md) and
  [editor.ts](/Users/zbeyens/git/edix/src/editor.ts):
  small declarative contenteditable state managers can work when the model stays
  simple and selection snapshots are explicit

What not to steal:

- none of these are the spine for a structured rich-text engine with durable
  anchors

What to steal:

- small-surface lessons
- explicit selection snapshots
- DOM rollback paranoia
- IME respect

### TanStack DB

This is not an editor repo, which is exactly why it is useful.

Useful things to steal:

- normalized collection mindset in [README.md](/Users/zbeyens/git/db/README.md)
- live-query subscription design in [useLiveQuery.ts](/Users/zbeyens/git/db/packages/react-db/src/useLiveQuery.ts)
  through `useSyncExternalStore`
- stable snapshot rebuilding only when version or collection identity changes

This is a much smarter mental model for annotations and overlay indexes than
yet another ad hoc React context pile.

Steal:

- normalized annotation collections
- live queries for visible ranges / selected threads / block-local overlays

Do not steal:

- a database-shaped public API for ordinary editor consumers

### EditContext

This is future-platform pressure, not present-day shipping guidance.

Useful things to steal conceptually from [dev-design.md](/Users/zbeyens/git/edit-context/dev-design.md):

- explicit shared text buffer
- explicit `updateSelection(...)`
- explicit `updateLayout(...)`
- explicit IME decoration requests through `textformatupdate`
- external updates that do not inherently cancel composition if the model/layout
  channel is honest

That is exactly the direction old Slate never had.

Do not steal:

- a hard dependency on EditContext today

Steal:

- the architecture shape

### The rest of the candidate map

The remaining entries from [editor-architecture-candidates.md](/Users/zbeyens/git/plate-2/docs/analysis/editor-architecture-candidates.md)
still matter, just less directly for this rewrite.

#### VS Code + LSP

Steal the service boundary:

- diagnostics
- semantic analysis
- code actions
- thread or review intelligence

can live outside the core editor engine and re-enter as annotation or
diagnostic sources.

Do not steal:

- a desktop-app-heavy rendering model

#### urql

Steal the mindset:

- composable source pipeline
- cache and derivation layers
- extensible update flow

Good inspiration for how multiple overlay sources can compose without becoming a
single monolith.

#### Open UI / richer text fields

Treat this as platform pressure, not implementation guidance.

The useful signal is that the platform itself still lacks a coherent answer for
richer text fields, which means any serious editor architecture still needs to
be explicit about:

- text buffer ownership
- selection ownership
- paint-time overlays
- IME interaction

So the shortlist still points in one direction:

- product packaging from Tiptap
- strict mapped overlay semantics from ProseMirror
- React/runtime subscriptions from Lexical
- layout separation from Premirror/Pretext
- lightweight small-surface lessons from `use-editable`, `rich-textarea`, and
  `edix`
- normalized reactive indexing from TanStack DB
- service boundaries from VS Code / LSP
- future platform shape from EditContext / Open UI

## Golden insights from the deeper pass

### 1. ProseMirror's real win is child-scoped propagation, not just `DecorationSet`

The strongest bit in [decoration.ts](/Users/zbeyens/git/prosemirror/view/src/decoration.ts)
is not that it has decorations. It is that `forChild(...)` hands each child only
the relevant intersecting inline decorations plus any child-owned subtree set.

That is the opposite of old Slate's worst behavior.

It means:

- no top-level flat decoration list shoved through the whole tree
- child-local overlap slicing
- hierarchical overlay ownership

That specific idea is worth stealing.

### 2. ProseMirror bookmarks are exactly the durability line old Slate lacked

In [selection.ts](/Users/zbeyens/git/prosemirror/state/src/selection.ts),
bookmarks are document-independent mapped selections. In
[history.ts](/Users/zbeyens/git/prosemirror/history/src/history.ts), history
stores bookmarks at event boundaries instead of concrete live selections.

That is the right mental model for durable anchors:

- map without needing mounted DOM
- resolve later against the current document
- store the durable representation, not a stale resolved handle

That is why annotations should ride bookmark/range-ref semantics.

### 3. Lexical already split three jobs Slate kept smashing together

The deeper Lexical read sharpened the split:

- [MarkNode](/Users/zbeyens/git/lexical/packages/lexical-mark/src/index.ts)
  is an id-bearing inline wrapper that can span text, inline elements, and even
  inline decorator nodes
- [DecoratorNode](/Users/zbeyens/git/lexical/packages/lexical/src/nodes/LexicalDecoratorNode.ts)
  is for node-sized rendered UI
- [useYjsCollaboration.tsx](/Users/zbeyens/git/lexical/packages/lexical-react/src/shared/useYjsCollaboration.tsx)
  keeps remote cursor UI in a separate DOM container

That is gold.

It says the winning architecture is not:

- one overlay system

It is:

- inline identity-bearing wrappers
- anchored widget/portal nodes
- fully external overlay chrome where appropriate

### 4. Lexical's dirty sets and tags are the right invalidation vocabulary

[LexicalUpdates.ts](/Users/zbeyens/git/lexical/packages/lexical/src/LexicalUpdates.ts)
and [LexicalOnChangePlugin.ts](/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalOnChangePlugin.ts)
make one thing painfully obvious:

- invalidation should talk in terms of dirty leaves, dirty elements, and tags

not:

- “some callback changed, good luck”

For Slate v2 overlays, that suggests:

- transaction metadata should carry invalidation hints
- overlay sources should declare what dirties them
- React subscriptions should consume narrow invalidation scopes

### 5. Tiptap accidentally proves comments and suggestions should stay separate

The Tiptap docs say two interesting things at once:

- comments support overlapping threads and rich product behavior
- AI suggestions rendered as ProseMirror decorations cannot overlap because of
  the decoration engine limit

That is an excellent warning.

If a system needs:

- durable overlap
- workflows
- thread metadata
- programmatic CRUD

it wants annotation semantics.

If it needs:

- temporary preview
- styling
- diff-ish visual projection

it can often live as decoration semantics.

Trying to force both through one mechanism is where editor APIs go stupid.

### 6. VS Code proves serious editors split visual channels aggressively

The useful VS Code lesson is not “copy Monaco”.

It is this:

- diagnostics in [markerDecorationsService.ts](/Users/zbeyens/git/vscode/src/vs/editor/common/services/markerDecorationsService.ts)
  become combinations of:
  - inline class decorations
  - overview ruler markers
  - minimap markers
  - stickiness policy
  - z-index
- ghost text in [ghostTextView.ts](/Users/zbeyens/git/vscode/src/vs/editor/contrib/inlineCompletions/browser/view/ghostText/ghostTextView.ts)
  uses:
  - injected text for inline previews
  - view zones for additional lines
- [modelLineProjectionData.ts](/Users/zbeyens/git/vscode/src/vs/editor/common/modelLineProjectionData.ts)
  gives injected text its own cursor-stop semantics

That means even a mature text editor does not trust one “range decoration”
primitive to do all of this.

It splits:

- inline inserted text
- line/block attached zones
- side-channel diagnostics in rulers, minimap, and gutter

That maps almost perfectly onto the proposed Slate v2 split:

- text decorations
- widgets / chrome
- out-of-band diagnostics channels

### 7. Premirror's invalidation-plan discipline is a huge-doc superpower

The really good bit in Premirror is not pagination itself.

It is the insistence on:

- explicit invalidation ranges
- position mapping in both directions
- profiling counters per transaction
- incremental recomposition by region

That is exactly how a serious overlay runtime should think for huge docs:

- know what changed
- know which ranges or semantic islands are affected
- know what viewport or layout regions need recompute
- measure the cost

### 8. EditContext exposes a missing overlay lane: IME-owned formatting

The [EditContext design docs](/Users/zbeyens/git/edit-context/dev-design.md)
make one future-facing point very clearly:

- IME composition formatting is its own channel

`textformatupdate` is not “comments”, not “syntax highlighting”, and not
ordinary search highlighting. It is transient input-method visual state driven
by the platform.

That implies a future-proof design should leave room for:

- platform/IME overlay lanes
- separate priority and lifetime rules

without pretending they are normal annotations.

## React 19.2 posture

React 19.2 does not magically solve editor architecture, but it does make the
right shape clearer.

Official references:

- [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [useTransition](https://react.dev/reference/react/useTransition)
- [useDeferredValue](https://react.dev/reference/react/useDeferredValue)
- [useEffectEvent](https://react.dev/reference/react/useEffectEvent)
- [Activity](https://react.dev/reference/react/Activity)
- [React 19.2 blog](https://react.dev/blog/2025/10/01/react-19-2)

### 1. `useSyncExternalStore` should be the overlay subscription backbone

This is the clear winner for React-facing overlay state.

Why:

- it is the official subscription hook
- it matches the local projection-store direction
- it fits normalized annotation/decor indexes well

Important caveats from the docs:

- `getSnapshot` must return immutable cached snapshots
- changing `subscribe` identity causes resubscription
- if the external store mutates during a Transition, React may restart and
  apply that update as blocking
- suspending from external store values is discouraged

That leads to one hard rule:

> The active editing corridor cannot depend on lazy/suspending overlay store
> reads or unstable snapshots.

### 2. `startTransition` is for non-urgent overlay work only

React says Transition updates are non-blocking, can be interrupted, and cannot
control text inputs.

That means:

- typing
- DOM selection sync
- caret movement
- IME composition handling
- urgent visible overlay changes around the caret

must stay out of transitions.

Good uses of transitions here:

- rebuilding offscreen overlay indexes
- recomputing sidebar models
- filtering thread lists
- loading or reprojecting non-visible pages
- expensive diagnostics panels

### 3. `useDeferredValue` is for lagging views, not editor truth

Use it where stale-but-useful UI is acceptable:

- thread sidebars
- search result lists
- diff/suggestion panes
- minimaps
- inspector panels

Do not use it for:

- the actual active text decorations around the caret
- committed selection truth
- DOM bridge mapping

### 4. `useEffectEvent` is perfect for bridge listeners with latest config

This is very relevant for editor runtime code.

Use it for logic that is:

- triggered from effects
- needs the latest props/state
- should not resubscribe the effect itself

Examples:

- selectionchange listener callbacks
- resize / scroll / layout bridge callbacks
- analytics / logging hooks around editor subscriptions
- side-effectful notifications tied to editor state

Do not misuse it as an escape hatch for real dependencies.

### 5. `<Activity>` is a huge-doc and sidebar tool, not an editing primitive

`<Activity hidden>` preserves state while cleaning up Effects and deprioritizing
the hidden subtree. That is strong for:

- comment sidebars
- review panes
- hidden page chrome surfaces
- pre-rendered next panels or tabs

But it also means hidden subtree subscriptions are gone.

So:

- keep the source-of-truth overlay stores outside hidden Activity subtrees
- use Activity to preserve UI state without keeping all Effects alive
- do not hide the active editing corridor in Activity and expect input to stay
  healthy

## DX non-negotiables

If this rewrite is actually meant to be good, the DX bar has to be brutal.

### The API must not require users to:

- swap function identity to make decorations refresh
- build WeakMap caches for correctness
- guess whether “stable callback” means “stale output”
- manually fan ranges out to text leaves
- understand DOM wrapper leakage just to copy text correctly

### The API should give users:

- explicit source registration
- explicit refresh semantics
- explicit annotation CRUD
- obvious distinction between transient and durable overlays
- straightforward subscription hooks for local slices
- stable defaults that do not tank perf on large docs

If a consumer has to learn five historical footguns before they can highlight
search results, the API is bad.

## Performance non-negotiables

### Must have

- hierarchical or indexed propagation, not flat top-down scans
- explicit invalidation scopes from transactions and source refreshes
- block/text runtime-id indexing
- overlap-friendly payload storage
- active-corridor priority
- offscreen occlusion and deferred work
- profiling counters and frozen benchmark lanes

### Must not have

- broad rerender by callback identity
- full-document recompute by default
- leaf-prop flattening that destroys multiplicity
- forcing all overlay UI through text leaves
- hidden sidebars or pages keeping expensive subscriptions alive by accident

## When to stop researching

Here is the harsh answer: we should stop when new passes stop changing the
architecture shape and only keep restating it with different repo mascots.

That line is basically here.

### What has converged already

Across the local `slate-v2` docs and the external repos, the same structure
keeps reappearing:

- durable anchors need bookmark/range-ref semantics
- transient overlays need projected slices and narrow subscriptions
- widget/chrome UI needs its own lane
- invalidation must be explicit
- huge-doc work needs corridor/region planning, not full-tree repaint
- IME/input state is its own serious subsystem

That is enough to design.

### What further research is unlikely to change

Another repo pass is very unlikely to overturn:

- the need to split decorations and annotations
- the need for a widget/chrome layer
- the need for explicit invalidation and range/bookmark durability
- the need for selector-first React subscriptions

If we keep researching without switching to design, we are probably just
avoiding hard API decisions.

### What is still unknown, but should be answered in design not research

The remaining unknowns are design questions, not discovery questions:

- exact public API names
- whether annotations are a dedicated store or editor-owned registry
- how source refresh scoping is expressed
- whether widget/chrome entries are block-keyed, runtime-id-keyed, or both
- what the migration adapter for legacy `decorate` looks like
- which lanes are urgent vs transition/deferred by default

Those need a spec and prototypes now.

### My recommendation

Stop broad research after this pass.

Do one final design phase with:

1. a written architecture spec
2. exact type shapes and ownership boundaries
3. one or two thin prototypes
4. benchmark lanes frozen up front

If those prototypes uncover a contradiction, then reopen research on that
specific contradiction only.

Anything broader than that is wheel-spinning.

## Harsh take

One callback for syntax highlighting, search hits, AI suggestions, remote
cursors, comments, diagnostics, placeholder-ish UI, and review anchors is not
“flexible”.

It is a garbage abstraction.

That is what old `decorate` became.

The fix is not a smarter callback.
The fix is splitting the jobs.

## Absolute best rewrite

### Short answer

Yes. Do both:

- **Decorations**
- **Annotations**

But do **not** do them as one API with two marketing names.

They should share projection plumbing, not ownership semantics.

### 1. Core owns logical ranges and durable anchors

Core should own:

- logical `Range` meaning
- `projectRange(editor, range)` or equivalent pure projection entrypoint
- transaction-aware range refs / bookmarks
- anchor rebasing and affinity policy

Core should not own:

- React subscriptions
- DOM paint overlays
- viewport culling
- page layout

This keeps the engine document-first.

### 2. Decorations are derived, transient, and overlap-friendly

Decorations should mean:

- derived from committed snapshot state or external state
- transient
- cheap to throw away and recompute
- overlap-friendly
- not the source of truth for durable ids

They should support:

- syntax highlighting
- search hits
- diagnostics
- spellcheck-ish or review-ish temporary ranges
- selection-derived highlight projections

They should **not** require object-flattened leaf props.

The logical decoration payload should preserve multiplicity. If two highlights
stack on the same span, the system should hold two highlights, not flatten them
into one winner.

### 3. Annotations are durable anchored entities

Annotations should mean:

- stable id
- metadata
- explicit lifetime
- anchor backed by range ref / bookmark semantics
- rebased through transactions
- resolvable even when not mounted

They should support:

- comments and threads
- remote cursors and selections
- review suggestions if they need identity and workflow
- persistent diagnostics
- bookmarks or other user-owned anchors

This is not optional. Comments are not just decorated text with opinions.

### 4. Both should feed one projection runtime

This is where the systems meet.

The shared layer should:

- take logical ranges or anchor resolutions
- project them into runtime-local slices keyed by stable runtime ids
- index them by text runtime id, block runtime id, and maybe higher semantic
  island ids
- expose narrow subscriptions for mounted consumers

So:

- separate semantics at the top
- shared projection/index pipeline underneath

That is the right split.

### 5. Add a third layer for widgets / portals / chrome

Text slices are not enough for everything.

You also need a first-class widget/chrome layer for:

- comment buttons
- selection affordances
- remote cursor labels
- review balloons
- diagnostics popovers
- page chrome and break markers later

ProseMirror widget decorations, Lexical decorator portals, and Premirror page
chrome all say the same thing: some UI is anchored to the document but should
not be modeled as inline text styling.

So the rewrite should have at least three render layers:

1. text decorations
2. durable annotations
3. anchored widgets / portals / chrome

### 6. React runtime should be selector-first and index-driven

Do not pass overlay arrays down the tree.

Do not invalidate giant contexts.

Do:

- `useSyncExternalStore` or equivalent subscription semantics
- stable snapshot reads
- per-runtime-id subscriptions
- dirty-scope invalidation
- optional derived selectors for aggregate views

The local projection proof and Lexical’s decorator subscription model are
aligned here. TanStack DB is the better mental model for the store.

### 7. Invalidation must be explicit

The old `decorate` ambiguity was poison.

The new design should say, plainly:

- node change invalidates local derived projections
- explicit source refresh invalidates declared scopes
- annotation mutations reproject only affected anchors
- full-document recompute is allowed but never implicit by accident

That means external-state decorations need an explicit refresh path.

Not:

- “maybe stable function identity means full refresh”

That ambiguity deserves to die.

### 8. Huge-doc posture: corridor first, virtualization optional

The rewrite should be good on huge docs before any virtualization fantasy.

Default huge-doc posture:

- active editing corridor
- local overlay subscriptions
- occlusion outside the corridor
- deferred offscreen overlay projection
- semantic islands instead of blind child bucketing

Virtualization later:

- anchors live above mounted React nodes
- annotations remain valid offscreen
- overlay index can answer viewport queries without materializing the whole doc
- page layout or offscreen planning can consume the same anchor/projection data

Premirror/Pretext are relevant here because they prove layout can be a derived
model. They are not the excuse to overcomplicate normal editing.

### 9. Clipboard and DOM bridge contracts stay strict

Decorations and annotations must never be allowed to rot the bridge again.

Keep the local rules:

- render-only wrappers do not leak into clipboard semantics
- DOM offset mapping is cumulative across split leaves
- zero-width / placeholder sentinels do not leak into selected-text truth
- selection reconciliation is judged against committed semantics, not whatever
  wrapper DOM happened to be present

If the rewrite gets faster but copy/select/IME become fake again, it failed.

### 10. Compatibility policy

Do not make the new public surface be `decorate(entry) 2.0`.

That would be cowardly.

What I would do:

- keep a narrow compatibility adapter for legacy `decorate`
- classify it as a projection source
- allow explicit refresh hooks for legacy external-state callers
- keep it out of the new architecture docs as the preferred surface

The preferred v2 surface should talk in terms of:

- decoration sources
- annotation stores
- projection runtime
- widget layers

Not one magic callback.

## Recommended target shape

### Core

- `Editor.projectRange(editor, range)`
- `Editor.projectRanges(editor, ranges)`
- transaction-aware `rangeRef` / bookmark API
- annotation anchor rebasing primitives

### React runtime

- `createSlateProjectionStore(editor, options)`
- `useTextProjections(runtimeId, layer?)`
- `useBlockProjections(runtimeId, layer?)`
- `useAnchoredWidgets(runtimeId | blockId)`
- explicit `refresh(sourceId, scope?)`

### Decorations

- register derived sources
- sources return logical ranges + payload + layer + priority
- overlap is first-class

### Annotations

- CRUD store with ids and metadata
- bookmarks/range refs under the hood
- resolvable to slices and widgets

### Widgets

- anchored UI entries rendered through portals or explicit chrome layer

## Final recommendation

If the goal is the absolute best rewrite, the answer is:

1. Keep projection-local decorations.
2. Add first-class annotations.
3. Make them separate systems with shared projection plumbing.
4. Add a widget/chrome layer instead of forcing everything through inline
   leaves.
5. Make invalidation explicit.
6. Make subscriptions index-driven.
7. Keep huge-doc strategy corridor-first, not chunk-first.

That gives you a model that can honestly cover:

- syntax highlighting
- search
- diagnostics
- comments
- tracked review suggestions
- remote cursors
- persistent anchors
- huge documents
- future virtualization
- future page layout

without pretending that one callback should own the whole damn thing.

## Working cluster summary

If we need a concise label for future analysis, use this:

> The legacy decorations system is a mixed abstraction covering render-time marks, cross-node overlays, and annotation-like anchors, and it fails along four axes: semantic loss, invalidation cost, DOM/selection timing fragility, and missing ownership semantics for persistent anchors.

## Source anchors

- local corpus synthesis:
  - [issue-clusters.md](/Users/zbeyens/git/plate-2/docs/slate-issues/issue-clusters.md)
  - [requirements-from-issues.md](/Users/zbeyens/git/plate-2/docs/slate-issues/requirements-from-issues.md)
  - [open-issues-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-issues/open-issues-ledger.md)
  - [open-issues-dossiers/4541-4392.md](/Users/zbeyens/git/plate-2/docs/slate-issues/open-issues-dossiers/4541-4392.md)
  - [open-issues-dossiers/3313-2733.md](/Users/zbeyens/git/plate-2/docs/slate-issues/open-issues-dossiers/3313-2733.md)
  - [open-issues-dossiers/5994-5918.md](/Users/zbeyens/git/plate-2/docs/slate-issues/open-issues-dossiers/5994-5918.md)
- GitHub threads:
  - [`#3383`](https://github.com/ianstormtaylor/slate/issues/3383)
  - [`#4993`](https://github.com/ianstormtaylor/slate/pull/4993)
  - [`#4997`](https://github.com/ianstormtaylor/slate/pull/4997)
- local v2 design pressure:
  - [chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md)
  - [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/replacement-family-ledger.md)
  - [package-end-state-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/package-end-state-roadmap.md)
  - [projection proof must split range semantics from React overlay store](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-react-v2-projection-proof-must-split-range-semantics-from-react-overlay-store.md)
  - [range refs must be transaction-aware and default inward](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-v2-range-refs-must-be-transaction-aware-and-default-inward.md)
  - [editable text should split leaves from projection slices](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-text-should-split-leaves-from-projection-slices.md)
  - [decorated multi-leaf text needs cumulative offset mapping](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-decorated-multi-leaf-text-needs-cumulative-offset-mapping.md)
  - [decorated clipboard and selected-text helpers should strip render-only wrappers and FEFF](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-decorated-clipboard-and-selected-text-helpers-should-strip-render-only-wrappers-and-feff.md)
  - [code block language change must trigger redecorate](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-03-26-code-block-language-change-must-trigger-redecorate.md)
  - [code block format must rebuild code lines](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-03-27-code-block-format-must-rebuild-code-lines.md)
- external repo anchors:
  - [ProseMirror decoration.ts](/Users/zbeyens/git/prosemirror/view/src/decoration.ts)
  - [ProseMirror selection.ts](/Users/zbeyens/git/prosemirror/state/src/selection.ts)
  - [ProseMirror history.ts](/Users/zbeyens/git/prosemirror/history/src/history.ts)
  - [Lexical useReactDecorators.tsx](/Users/zbeyens/git/lexical/packages/lexical-react/src/shared/useReactDecorators.tsx)
  - [Lexical LexicalDecoratorNode.ts](/Users/zbeyens/git/lexical/packages/lexical/src/nodes/LexicalDecoratorNode.ts)
  - [Lexical Mark package index.ts](/Users/zbeyens/git/lexical/packages/lexical-mark/src/index.ts)
  - [Lexical MarkNode tests](/Users/zbeyens/git/lexical/packages/lexical-mark/__tests__/unit/LexicalMarkNode.test.ts)
  - [Lexical useYjsCollaboration.tsx](/Users/zbeyens/git/lexical/packages/lexical-react/src/shared/useYjsCollaboration.tsx)
  - [Lexical useLexicalSubscription.tsx](/Users/zbeyens/git/lexical/packages/lexical-react/src/useLexicalSubscription.tsx)
  - [LexicalOnChangePlugin.ts](/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalOnChangePlugin.ts)
  - [LexicalEditorState.ts](/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditorState.ts)
  - [LexicalUpdates.ts](/Users/zbeyens/git/lexical/packages/lexical/src/LexicalUpdates.ts)
  - [Tiptap lowlight-plugin.ts](/Users/zbeyens/git/tiptap/packages/extension-code-block-lowlight/src/lowlight-plugin.ts)
  - [Tiptap comments overview](/Users/zbeyens/git/tiptap-docs/src/content/comments/getting-started/overview.mdx)
  - [Tiptap comments integration for tracked changes](/Users/zbeyens/git/tiptap-docs/src/content/tracked-changes/guides/comments-integration.mdx)
  - [Tiptap display suggestions](/Users/zbeyens/git/tiptap-docs/src/content/content-ai/capabilities/ai-toolkit/api-reference/display-suggestions.mdx)
  - [Tiptap style suggestions](/Users/zbeyens/git/tiptap-docs/src/content/content-ai/capabilities/ai-toolkit/advanced-guides/style-suggestions.mdx)
  - [Tiptap mark views](/Users/zbeyens/git/tiptap-docs/src/content/editor/extensions/custom-extensions/mark-views/index.mdx)
  - [Premirror README](/Users/zbeyens/git/premirror/README.md)
  - [Premirror design-proposal.md](/Users/zbeyens/git/premirror/docs/design-proposal.md)
  - [Premirror prosemirror-adapter index.ts](/Users/zbeyens/git/premirror/packages/prosemirror-adapter/src/index.ts)
  - [use-editable README](/Users/zbeyens/git/use-editable/README.md)
  - [edix README](/Users/zbeyens/git/edix/README.md)
  - [edix editor.ts](/Users/zbeyens/git/edix/src/editor.ts)
  - [rich-textarea README](/Users/zbeyens/git/rich-textarea/README.md)
  - [rich-textarea textarea.tsx](/Users/zbeyens/git/rich-textarea/src/textarea.tsx)
  - [TanStack DB README](/Users/zbeyens/git/db/README.md)
  - [TanStack DB useLiveQuery.ts](/Users/zbeyens/git/db/packages/react-db/src/useLiveQuery.ts)
  - [EditContext dev-design.md](/Users/zbeyens/git/edit-context/dev-design.md)
  - [VS Code markerDecorationsService.ts](/Users/zbeyens/git/vscode/src/vs/editor/common/services/markerDecorationsService.ts)
  - [VS Code ghostTextView.ts](/Users/zbeyens/git/vscode/src/vs/editor/contrib/inlineCompletions/browser/view/ghostText/ghostTextView.ts)
  - [VS Code modelLineProjectionData.ts](/Users/zbeyens/git/vscode/src/vs/editor/common/modelLineProjectionData.ts)
  - [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
  - [React 19.2 blog](https://react.dev/blog/2025/10/01/react-19-2)
  - [React Activity](https://react.dev/reference/react/Activity)
  - [React useTransition](https://react.dev/reference/react/useTransition)
  - [React useDeferredValue](https://react.dev/reference/react/useDeferredValue)
  - [React useEffectEvent](https://react.dev/reference/react/useEffectEvent)

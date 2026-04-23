# Editor Behavior Architecture for Plate

This is the architectural frame for the major release. It is intentionally
written before the full Typora and Milkdown audit so the repo does not drift
into reference-chasing without a model.

The goal is not "make Plate behave like Typora." The goal is stronger:

- make Plate capable of expressing multiple editor behavior profiles cleanly
- make markdown-first behavior a first-class profile
- stop baking structural key behavior into scattered plugin overrides

## Bottom Line

Plate should move from a plugin-scattered behavior model to a profile-driven
behavior engine.

That means:

- one shared document model
- one shared transform layer
- multiple behavior profiles on top

Examples:

- `markdown_typora`
- `markdown_milkdown`
- `notion`
- `bear`
- `google_docs`
- `plate_default`

The markdown-first profile is the first lane, not the final personality.

## Why This Exists

Today behavior ownership is fragmented:

- list owns part of `Enter` and reset behavior
- indent owns generic `Tab`
- table owns `Tab` and movement
- code block owns `Enter` and `Tab`
- blockquote owns almost nothing
- affinity is configured separately from structural behavior
- autoformat is rule-shaped, not profile-shaped

That architecture is fine for local fixes and bad for editor emulation.

If Plate wants to clone major editors cleanly, behavior has to become an
explicit system.

## Goals

- Make structural key behavior explicit and composable.
- Make behavior ownership deterministic.
- Allow multiple editor profiles without forking the core editor model.
- Let markdown-first behavior stay strict where syntax exists.
- Support streaming and partial markdown as first-class inputs, not hacks after
  deserialization.
- Drive tests from spec IDs instead of local plugin assumptions.

## Non-Goals

- Rebuild the document model around one reference editor.
- Force every plugin to expose every possible behavior knob immediately.
- Freeze all behavior from day one of the major. The point is to create a
  durable decision system first.
- Spend the major on minor new markdown features while old structural behavior
  is still wrong.

## Major Scope Bias

This major should prefer breaking cleanup over feature expansion.

That means:

- fix existing behavior seams before adding new syntax lanes
- prioritize ownership, parity, affinity, autoformat, and streaming cleanup
- defer minor markdown feature additions unless they unlock those goals

If a proposed addition does not improve an existing broken seam, it is probably
the wrong use of major-release energy.

## Core Principles

### One shared model, multiple behaviors

Plate's node model should remain shared. The behavior profile decides how users
reach and modify that structure.

### Nearest structure wins

When multiple structures could own a key event, the nearest structural owner
should win first. Example order:

1. table cell
2. code block / fenced block
3. toggle-like container
4. list item
5. blockquote / quote container
6. indent block
7. generic block fallback

### One keypress changes one structural depth

Do not collapse multiple container levels in one step unless a profile
explicitly wants that.

### Syntax-driven where syntax exists

If Markdown has a real structural representation, Plate should prefer that over
visual-only shortcuts or local fake structure.

### Profiles own decisions, plugins provide capabilities

Plugins should provide transforms, queries, and normalization primitives.
Profiles should decide which primitive wins for a given editing context.

## Proposed Behavior Domains

Behavior should be organized into domains instead of spread across unrelated
plugin overrides.

### 1. Structural keys

Owns:

- `Enter`
- `Backspace` at block start
- `Delete` at block end
- `Tab`
- `Shift+Tab`

### 2. Selection and affinity

Owns:

- directional affinity
- outward vs inward behavior at boundaries
- hard boundaries
- cursor behavior around marks, links, mentions, inline voids

### 3. Input rules and autoformat

Owns:

- markdown shortcut recognition
- contextual transforms
- profile-aware trigger priorities
- interaction with partial/incomplete syntax during streaming

### 4. Streaming and incremental parse behavior

Owns:

- partial block handling
- incomplete syntax tolerance
- chunk-boundary semantics
- monotonic shape evolution during streaming

### 5. Structural transforms

Owns:

- lift one level
- exit one level
- wrap / unwrap current block set
- split container around current block
- reset nearest structure

These should become reusable transforms, not bespoke one-off plugin tricks.

### 6. Navigation feedback

Owns:

- scroll to target
- transient target highlight
- replacement or clearing of the previous navigation target state

This should be a shared editor-scoped primitive, not one flash hack per
feature. TOC, footnote, and search jumps should all reuse it.

## Proposed Core Abstractions

### Behavior profile

A profile should declare behavior policy by domain:

```ts
type BehaviorProfileId =
  | 'markdown_typora'
  | 'markdown_milkdown'
  | 'notion'
  | 'bear'
  | 'google_docs'
  | 'plate_default';

interface EditorBehaviorProfile {
  id: BehaviorProfileId;
  structuralKeys: StructuralKeyPolicy;
  selection: SelectionPolicy;
  autoformat: AutoformatPolicy;
  streaming: StreamingPolicy;
}
```

### Behavior context snapshot

Every behavior decision should operate on a normalized context snapshot instead
of each plugin re-deriving the same state:

- current block
- nearest containers
- selection shape
- active profile
- markdown parse context if relevant
- whether current content is complete or partial

### Behavior decision

Resolvers should return explicit outcomes:

- `handled`
- `fallthrough`
- `prevent_default`
- `transform`
- `select`
- `reject`

That beats today's mix of silent overrides and implicit fallback.

## Proposed Event Pipeline

For structural keys, Plate should use a single behavior pipeline:

1. build context snapshot
2. ask the active profile for event ownership order
3. run resolvers in order
4. stop on the first handled decision
5. fall back to generic editor behavior only if no resolver handles the event

This is the seam that should replace scattered local ownership.

## Affinity Proposal

Affinity should be part of behavior policy, not a separate oddball concern.

That means:

- the profile chooses the default affinity model
- individual node families can override it
- the editing spec can state affinity semantics next to the structural behavior
  they affect

Example:

- markdown-first profile may prefer predictable outward edges for links and
  formatting boundaries
- Notion-like profile may prefer a softer, block-oriented cursor model

If affinity remains disconnected from the editing spec, it will keep drifting.

## Autoformat Rewrite Proposal

Autoformat should stop being "a list of trigger strings that happen to mutate
nodes."

It should become behavior-aware:

- aware of the active profile
- aware of the current structural owner
- aware of whether the syntax should wrap, reset, lift, split, or retag
- aware of partial streaming input and incomplete syntax

Examples:

- `> ` in markdown-first mode should wrap a quote container, not retag a text
  block
- list markers should respect current container depth
- syntax that is incomplete across chunks should remain stable until closed

The rewrite target is not "more rules." It is "the right transform selected by
profile and context."

## Transform Seams Worth Introducing

These are likely high-leverage additions:

- `exitContainerLevel`
- `liftContainerLevel`
- `splitContainerAroundSelection`
- `resetNearestStructure`
- `wrapBlocksInContainer`
- `unwrapCurrentContainerLevel`

These should work across quote, list, toggle, and future container blocks where
possible.

## How The Spec Files Fit

This architecture doc is the top-level frame.

- [markdown-standards.md](./markdown-standards.md)
  defines the authority order and methodology
- [markdown-editing-spec.md](./markdown-editing-spec.md)
  defines the markdown-first profile behavior
- [markdown-parity-matrix.md](./markdown-parity-matrix.md)
  defines syntax support and round-trip expectations

Later, other profiles can layer on the same architecture with different
behavior decisions.

## Testing Strategy

Tests should be keyed to spec IDs, not just file-local descriptions.

Each important rule should have:

- a spec ID
- one or more focused tests
- a declared owning profile

The same scenario may have different expected outputs across profiles. That is a
feature, not a bug, as long as the profile owns the difference explicitly.

## Migration Direction

This major release is the right time to break behavior toward clearer
standards.

Expected candidates:

- move generic `Tab` ownership away from broad indent behavior
- make quote behavior follow container semantics
- unify exit / reset / outdent rules around nearest structure
- rewrite autoformat around profile-aware structural transforms
- fold affinity into the same behavioral model

## Immediate Next Steps

1. Audit Typora and Milkdown against the markdown-first spec.
2. Audit current Plate plugin ownership for structural keys.
3. Mark direct conflicts between current Plate behavior and the target profile.
4. Add failing spec-keyed tests before refactoring core behavior seams.

## Open Questions

- Which behaviors should be truly core versus profile-plugin supplied?
- How much of the current indent system survives once list and quote outdent
  become explicit structural transforms?
- Should autoformat stay plugin-configurable as data, or move partly into
  executable behavior resolvers?
- How should profile selection interact with package-level defaults?

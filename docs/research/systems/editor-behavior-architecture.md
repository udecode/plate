---
title: Editor behavior architecture for Plate
type: system
status: strong
updated: 2026-07-23
related:
  - docs/editor-behavior/README.md
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/editor-protocol-matrix.md
  - docs/vision/plate.md
---

# Editor Behavior Architecture for Plate

This document maps editor-behavior law to runtime and plugin ownership.
[markdown-editing-spec.md](../../editor-behavior/markdown-editing-spec.md)
decides what the editor should do;
[editor-protocol-matrix.md](../../editor-behavior/editor-protocol-matrix.md)
enumerates the scenarios. This document decides what stays inline, what belongs
in `options`, and what earns independent plugin identity.

## Bottom Line

Keep one document model, one Plite execution model, and ordinary Plate plugin
composition.

- Feature invariants stay inside their owning plugin.
- Data that tunes one capability stays in inferred `options`.
- Only proven substitutable capabilities earn ordinary plugin identity.
- Product-specific choices stay in app kits.
- Complete feature plugins remain the default path.

Plate does not need a second behavior engine, behavior registry, or profiles
runtime. A named behavior profile is a specification label or an ordinary
reusable plugin array after real reuse earns that name.

## Why This Exists

Behavior ownership can become fragmented even when each local handler is
correct:

- list owns part of `Enter` and reset behavior
- indent owns generic `Tab`
- table owns `Tab` and movement
- code block owns `Enter` and `Tab`
- blockquote owns almost nothing
- affinity is configured separately from structural behavior
- autoformat and structural input can compete for the same context

The solution is explicit law and ownership, not another public composition
language. Handlers, commands, queries, corrections, selections, and files are
implementation contributions. They do not map one-to-one to capabilities.

## Owner Map

| Concern                                                           | Owner                                    |
| ----------------------------------------------------------------- | ---------------------------------------- |
| expected editing result and authority                             | editor-behavior spec and protocol matrix |
| generic transaction, command, selection, DOM, and input mechanics | Plite packages                           |
| feature correctness and mandatory behavior                        | owning Plate feature plugin              |
| proven optional or replaceable capability                         | ordinary Plate plugin or Plite extension |
| product personality and chosen defaults                           | app kit                                  |
| public promotion decision                                         | `best-api`                               |
| adoption and proof plan                                           | `plate-plan` or `plite-plan`             |

## Goals

- Make structural key behavior explicit and composable.
- Make behavior ownership deterministic.
- Let products replace coherent capabilities without forking the editor model.
- Let markdown-first behavior stay strict where syntax exists.
- Keep streaming and partial markdown behavior explicit where it applies.
- Drive tests from spec IDs instead of local plugin assumptions.
- Preserve one obvious full-preset path for normal users.

## Non-Goals

- Rebuild the document model around one reference editor.
- Expose every handler or extension contribution as a plugin.
- Turn every boolean into a capability plugin.
- Make correctness repair, schema validity, or cache invalidation optional.
- Add profiles, variants, registries, serialization, or runtime switching for
  hypothetical future use.
- Split files merely because a colocated owner is large.

## Core Principles

### One shared model, explicit behavior law

Plate's node model stays shared. The behavior spec chooses expected results per
context; installed plugins provide the implementation.

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

Do not collapse multiple container levels in one step unless the owning
behavior contract explicitly requires it.

### Syntax-driven where syntax exists

If Markdown has a real structural representation, Plate should prefer that over
visual-only shortcuts or local fake structure.

### Specs own law; plugins own shipped capability

The spec chooses the winning behavior for each context. A feature plugin owns
its mandatory implementation. An app kit chooses which optional capability
plugins it installs.

## Behavior Domains

Use these as audit categories, not public namespaces. A public plugin must group
coherent user intent; it does not exist merely because one category has a
handler.

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
- context- and syntax-aware trigger priorities
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

Promote these to shared transforms only when multiple independent owners reuse
them. Otherwise keep the algorithm inline with its feature owner.

### 6. Navigation feedback

Owns:

- scroll to target
- transient target highlight
- replacement or clearing of the previous navigation target state

Only promote navigation feedback to a shared editor-scoped primitive when TOC,
footnote, search, or another independent owner actually reuses one contract.

## Behavior Promotion Protocol

### 1. Start from scenario law

Before discussing packaging, record:

- entity and node model
- context and nearest structural owner
- selection shape and caret edge
- input or command
- expected model and cursor result
- fallback when the feature does not handle it
- invariants that may never be disabled
- authority, spec ID, and proof

The protocol matrix already carries most of this dossier.

### 2. Classify the behavior

| Class                    | Decision test                                                                        | Shape                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| invariant                | omission makes the feature invalid, unsafe, inaccessible, or semantically incomplete | inline in the owning feature plugin                                         |
| parameter                | callers want the same capability with different data, thresholds, or policy values   | inferred `options`                                                          |
| substitutable capability | omission or replacement leaves a complete editor with defined fallback behavior      | ordinary plugin or extension candidate                                      |
| product policy           | the choice belongs to one app personality rather than Plate's framework default      | inline in the app kit; promote separately only if the capability gates pass |

“Non-universal” is not enough. A non-universal width or threshold remains an
option. A broadly required keyboard capability may still need a replaceable
owner when legitimate products implement it differently.

### 3. Pass every promotion gate

A capability becomes a public plugin or extension only when:

1. one stable capability name describes the user job;
2. a real caller needs omission or replacement, or a hard host, dependency,
   security, or lifecycle boundary requires independent ownership;
3. omission and replacement have explicit, valid fallback semantics;
4. dependencies close through public contracts without private sibling access
   or cycles;
5. the capability can be tested independently in default, omitted, and replaced
   configurations;
6. native keyboard, clipboard, selection, focus, or DOM behavior has browser
   proof;
7. the complete preset remains the obvious common path;
8. advanced composition uses the existing plugin or extension array.

If a gate fails, keep the behavior inline or parameterized. Do not add a public
name in anticipation of future reuse.

### 4. Separate identity from files

Plugin identity is a composition and ownership boundary. It does not require a
new file. Keep single-owner capability descriptors colocated with their feature;
the Base/React boundary remains a valid split when host behavior requires it.

### 5. Export only after the consumer job exists

An internal contribution may stay anonymous. A coherent capability may be
named privately when the runtime requires independent installation or proof.
Public export requires a real external composition job, not internal test
convenience.

## Runtime Arbitration

Use the existing Plite command, query, correction, selection, and handler
ordering. Preserve contribution ownership and explicit handled/fallthrough
semantics inside that runtime instead of creating a parallel behavior engine.

Repeated context derivation may become an internal query or matcher primitive
after real reuse. Do not publish a generic behavior-context object merely to
organize local code.

Affinity belongs beside the node family and scenario law it affects. Shared
affinity mechanics belong in Plite; feature-specific edge policy stays with the
feature or app kit.

## Autoformat Rewrite Proposal

Autoformat should stop being "a list of trigger strings that happen to mutate
nodes."

It should become behavior-aware:

- aware of the current structural owner
- aware of whether the syntax should wrap, reset, lift, split, or retag
- aware of partial streaming input and incomplete syntax
- configured through the installed feature and app-kit plugins

Examples:

- `> ` in markdown-first mode should wrap a quote container, not retag a text
  block
- list markers should respect current container depth
- syntax that is incomplete across chunks should remain stable until closed

The target is not more rules. It is the right transform selected by context and
installed ownership.

## Shared Transform Candidates

These are likely high-leverage additions:

- `exitContainerLevel`
- `liftContainerLevel`
- `splitContainerAroundSelection`
- `resetNearestStructure`
- `wrapBlocksInContainer`
- `unwrapCurrentContainerLevel`

Extract one only after quote, list, toggle, or another independent owner proves
the shared contract. Until then, keep the transform with its owner.

## Behavior Contracts And Kits

`markdown_typora` and similar names are specification and test labels. They do
not imply a runtime registry.

When multiple apps genuinely reuse one plugin selection, publish an ordinary
kit constant containing that plugin array. Runtime switching, serialization,
fingerprints, and profile receipts require separate real jobs and separate API
review; they are not part of behavior authoring by default.

## Table Pressure Test

The current Table owner has seven `.extendExtension(...)` contributions plus
React clipboard and keyboard handlers. Applying the promotion gates to those
implementation blocks produces no new public capability plugin today:

- schema validity, grid correction, cache invalidation, selection clamping, and
  destructive-boundary protection are mandatory Table behavior;
- table-selection mapping, command interception, deletion, fragment, paste, and
  typing behavior jointly define Table selection semantics and have no complete
  independent fallback;
- `Tab`, arrow-boundary movement, selection escalation, copy, and cut stay
  inline in the React Table owner while they depend on DOM geometry, hotkeys,
  and native events;
- headless `BaseTablePlugin` versus React `TablePlugin` is the proven host
  boundary;
- clipboard customization is the most plausible future capability candidate,
  but no real omit or replacement caller currently earns its public export.

The existing contribution count is not evidence for seven plugins. A future
clipboard owner still needs a real caller, explicit fallthrough semantics,
public dependency closure, and default/omitted/replaced browser proof.

## How The Spec Files Fit

This architecture doc is the top-level frame.

- [markdown-standards.md](../../editor-behavior/markdown-standards.md)
  defines the authority order and methodology
- [markdown-editing-spec.md](../../editor-behavior/markdown-editing-spec.md)
  defines the markdown-first behavior contract
- [markdown-parity-matrix.md](../../editor-behavior/markdown-parity-matrix.md)
  defines syntax support and round-trip expectations

Other behavior contracts may choose different outcomes. Shipped differences
compose through feature plugins and app kits.

## Testing Strategy

Tests should be keyed to spec IDs, not just file-local descriptions.

Each important rule should have:

- a spec ID
- one or more focused tests
- a declared owning behavior contract
- an owning invariant, option, capability, or app-policy classification

For a promoted capability, also prove:

- the complete default preset
- omission and its fallback
- replacement through ordinary plugin composition
- browser behavior when native input or DOM state matters

## Migration Direction

For each feature family:

1. map source contributions to spec rows;
2. classify invariant, parameter, substitutable capability, or app policy;
3. keep mandatory behavior colocated;
4. audit real omit/replace callers before naming public capability plugins;
5. move capability-specific options and proof to the accepted owner;
6. keep the complete plugin or kit as the normal path;
7. delete flags or helpers made redundant by accepted composition.

## Immediate Next Steps

1. Audit real repository callers before promoting Table clipboard behavior.
2. Keep the complete Base and React Table presets as the default path.
3. Route any concrete replacement proposal through `best-api design`.
4. Hand an accepted API to `plate-plan` for adoption and proof.

## Open Questions

- Does Table clipboard customization have a real external replacement caller?
- Which keyboard behaviors are mandatory for accessibility even when their
  policy is replaceable?
- Does table-aware clipboard need one Base capability plus a React host owner,
  or one composed Table capability?

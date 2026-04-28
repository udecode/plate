---
date: 2026-04-24
topic: slate-v2-absolute-architecture-release-claim
status: active
---

# Slate v2 Absolute Architecture Release Claim

## Current Claim

Slate v2 keeps Slate's JSON-like model and operation stream, and uses a
Lexical-style read/update lifecycle, ProseMirror-style transaction and DOM
selection authority, Tiptap-style extension ergonomics, and a React 19.2
runtime built around live reads, dirty commits, semantic islands, projection
sources, and strict browser conformance proof.

This is the public runtime shape:

```ts
editor.read(() => {
  const selection = editor.getSelection()
  const children = editor.getChildren()
})

editor.update(() => {
  editor.unwrapNodes({ match: isList })
  editor.setNodes({ type: 'list-item' })
  editor.wrapNodes({ type: 'bulleted-list', children: [] })
})
```

Primitive editor methods are the power API:

- `editor.insertText`
- `editor.delete`
- `editor.insertNodes`
- `editor.insertFragment`
- `editor.setNodes`
- `editor.removeNodes`
- `editor.unwrapNodes`
- `editor.wrapNodes`
- `editor.select`

Convenience methods are optional surface on top of primitives, not the runtime
foundation.

## Runtime Contract

```txt
editor.update
  -> one transaction
  -> implicit target resolution when a primitive omits `at`
  -> operation production
  -> EditorCommit
  -> history / collaboration / React / DOM repair consumers
```

Rules:

- `editor.update(fn)` is the write boundary.
- `editor.read(fn)` is the coherent read boundary.
- `tx.resolveTarget()` is internal engine-room API.
- A primitive with explicit `at` never imports DOM selection.
- A primitive without explicit `at` uses the active transaction target.
- Operations remain the collaboration truth.
- `EditorCommit` remains the local runtime truth.
- React consumes commit dirtiness and live reads; React does not own model or
  operation truth.

## Extension Contract

Extensions add named methods through `editor.extend({ methods })`.

```ts
editor.extend({
  name: 'todo',
  methods: {
    toggleTodo() {
      this.update(() => {
        this.setNodes({ type: 'todo', checked: true })
      })
    },
  },
})
```

Extension methods compose through the editor method runtime. Direct method
replacement is not the blessed extension model.

## Hard Cuts

These are not primary public API:

- `Transforms.*`
- mutable `editor.selection`
- mutable `editor.children`
- mutable `editor.marks`
- mutable `editor.operations`
- direct `editor.apply` as an extension point
- direct `editor.onChange` as an extension point
- command policy objects
- exposed `tx.resolveTarget()`
- child-count chunking
- `decorate` as the primary overlay API

Internal storage and compatibility mirrors exist only where package/runtime code
still requires them. Public docs, examples, and plugin guidance must use
read/update, primitive methods, extension methods, commit listeners, and
projection sources.

## Browser Editing Claim

Browser editing correctness is claimed only when the generated gauntlet proves:

- Slate model tree or text
- Slate model selection
- visible DOM
- DOM selection or caret when observable
- focus owner
- commit metadata when the row mutates the model
- legal kernel trace
- follow-up typing after the interaction

The generated gauntlet substrate is release-blocking for cursor/caret claims.
Model-only proof is not enough for browser editing behavior. DOM-only proof is
not enough for Slate correctness.

Current destructive editing proof includes generated richtext destructive
paste/word-delete scenarios, replay/shrink coverage, cross-browser Chromium /
Firefox / WebKit / mobile-project rows, and persistent-profile soak artifacts.
That proof covers the screenshot-class repeated word-delete and paste-over-range
regression family. Final architecture closure still requires the full
`bun test:integration-local` sweep in the closeout slice.

## Kernel Authority Claim

`EditableConformanceKernel` and the editing epoch runtime own event-frame and
native-action authority for:

- keydown
- beforeinput
- input
- selectionchange
- paste
- cut
- drop
- repair

Controllers and strategies are workers. They do not own selection source,
target source, mutation authority, repair scheduling, or release-trace truth
outside the kernel contract.

Destructive editing is model-owned. Native structural delete is not trusted as
the final document or selection truth.

## Mobile And IME Claim

Current automated mobile proof is scoped:

- Playwright mobile viewport rows prove mobile viewport plus Playwright
  keyboard behavior.
- Semantic mobile handles prove semantic editor operations on a mobile-shaped
  surface.
- Appium Android/iOS descriptors are direct-device candidates for
  device-browser text input and IME commit proof.
- agent-browser iOS is proxy evidence, not release-quality native-device proof.

The current automated claim does not include native mobile clipboard, human
soft keyboard behavior, glide typing, voice input, or raw device rows unless a
device gate explicitly runs.

## React 19.2 Perf Claim

React 19.2 runtime proof is based on:

- selector-first live reads
- dirty runtime ids and dirty top-level ranges
- `EditorCommit` metadata
- source-scoped projection invalidation
- semantic islands
- direct DOM text sync as a capability with React fallback
- hidden/background UI posture compatible with React Activity

The 5000-block huge-document comparison is the release perf gate:

```sh
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

The accepted caveat is direct model-only typing into an unpromoted middle shell.
The user editing corridor is promote/activate then type, and that corridor beats
legacy chunking-on while keeping child-count chunking dead.

## Release Limits

The architecture does not claim:

- every historical legacy behavior survives
- Chromium-only proof is framework-grade proof
- semantic handles are raw native mobile proof
- model-only tests prove caret behavior
- DOM-only tests prove Slate correctness
- child-count chunking is a product runtime primitive
- `Transforms.*` is the primary mutation story

## Required Closure Gates

Final closure requires:

- public hard-cut contracts
- read/update and primitive method runtime contracts
- extension method runtime contracts
- kernel authority audit contracts
- generated browser gauntlet release gates
- scoped mobile/IME proof contracts
- React/core perf guardrails
- persistent-profile destructive editing soak
- `bun test:integration-local`
- relevant package build, typecheck, and lint gates

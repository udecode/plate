---
date: 2026-04-04
topic: editor-global-systems-objective
---

# Editor Global Systems Objective

## Purpose

This doc answers a bigger question than “what should `slate-browser` do next?”

It answers:

- what should the whole future system look like if we steal the best ideas from
  the strongest local references without turning Slate into a stitched-together
  mess?

This is the objective.
Not the immediate implementation order.

## Strong Take

The best future system is **layered by responsibility**.

Not:

- one giant editor package
- one giant plugin API
- one giant test runner
- one giant service bucket

The best references all punish that kind of slop:

- ProseMirror punishes core/runtime blur
- Lexical punishes sloppy update and test discipline
- Premirror punishes layout/rendering blur
- Pretext punishes measurement-by-reflow laziness
- TanStack DB punishes ad hoc derived-state sprawl
- urql punishes middleware soup
- VS Code and LSP punish feature-hosting blur
- rich-textarea punishes using cathedral editors for tiny surfaces
- Tiptap punishes underinvesting in productization

## The Target Stack

## 1. Document Engine Plane

Owner:

- `slate-v2`

Target:

- document semantics
- operations
- transactions
- immutable committed snapshots
- runtime identity sidecar

Primary references:

- ProseMirror package discipline:
  [state.ts](/Users/zbeyens/git/prosemirror/state/src/state.ts)
- Lexical immutable editor state and update discipline:
  [LexicalEditorState.ts](/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditorState.ts)
- current locked v2 docs:
  [final-synthesis.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/final-synthesis.md)

Rule:

- keep the core boring and strong
- do not let product UX, service protocols, or layout engines leak downward

## 2. Runtime And Rendering Plane

Owner:

- `slate-react-v2`

Target:

- selector-first subscriptions
- semantic islands
- active editing corridor
- default large-doc-safe posture
- update metadata good enough to avoid broad rerender sludge

Primary references:

- Lexical update metadata and dirty discipline:
  [LexicalUpdates.ts](/Users/zbeyens/git/lexical/packages/lexical/src/LexicalUpdates.ts)
- current runtime rules:
  [Part IV. React Runtime Spec](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-iv-react-runtime-spec)

Rule:

- trust live DOM for active editing
- use deterministic planning helpers only off the active path

## 3. Browser Proof Plane

Owner:

- `slate-browser`

Target:

- layered test lanes
- example-mounted truth
- selection and clipboard as first-class artifacts
- Chromium-first IME proof
- explicit later cross-browser and perf lanes

Primary references:

- Lexical test discipline and setup orchestration:
  [index.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/utils/index.mjs)
- edix browser-contract split:
  [vitest.config.ts](/Users/zbeyens/git/edix/vitest.config.ts)
- rich-textarea lightweight browser lane:
  [vitest.config.ts](/Users/zbeyens/git/rich-textarea/vitest.config.ts)
- Premirror lane governance:
  [testing-strategy.md](/Users/zbeyens/git/premirror/docs/testing-strategy.md)
- current `slate-browser` direction:
  [overview.md](/Users/zbeyens/git/plate-2/docs/slate-browser/overview.md)
  and
  [next-system-move.md](/Users/zbeyens/git/plate-2/docs/slate-browser/next-system-move.md)

Rule:

- browser proof is its own system, not a sidecar

## 4. Projection And Derived-Data Plane

Owner:

- future `plate-v2`

Target:

- normalized projection stores
- explicit indexes
- incremental derived views
- relation-aware annotation / comment / semantic projections

Primary references:

- TanStack DB normalized collections and live queries:
  [README.md](/Users/zbeyens/git/db/README.md)
- existing architecture read:
  [slate-v2-plate-v2-architecture-research.md](/Users/zbeyens/git/plate-2/docs/analysis/slate-v2-plate-v2-architecture-research.md)

Rule:

- editor truth stays in `slate-v2`
- semantic projections and relation-aware views live above it

## 5. Execution Pipeline Plane

Owner:

- future `plate-v2`

Target:

- one central execution hub
- exchange-like stages
- explicit ordering
- optional capabilities without one mega middleware bucket

Primary references:

- urql overview and graphcache:
  [README.md](/Users/zbeyens/git/urql/docs/README.md)
  and
  [README.md](/Users/zbeyens/git/urql/exchanges/graphcache/README.md)

Rule:

- no plugin soup
- no hidden side effects
- no undocumented execution order

## 6. Hosted Feature And Protocol Plane

Owner:

- future `plate-v2`

Target:

- per-feature registries
- explicit host boundaries
- protocol-shaped semantic services
- capability negotiation
- cancellable, versioned request flows

Primary references:

- VS Code agent/session protocol:
  [protocol.md](/Users/zbeyens/git/vscode/src/vs/platform/agentHost/protocol.md)
- VS Code test/perf entrypoints:
  [package.json](/Users/zbeyens/git/vscode/package.json)
- LSP overview and initialize contract:
  [overview.md](/Users/zbeyens/git/language-server-protocol/_overviews/lsp/overview.md)
  and
  [initialize.md](/Users/zbeyens/git/language-server-protocol/_specifications/lsp/3.18/general/initialize.md)

Rule:

- semantic services should speak documents, positions, edits, diagnostics, and
  capabilities
- they should not speak Slate internals

## 7. Layout And Measurement Plane

Owner:

- future `plate-v2`
- narrowly, selective planning support in `slate-react-v2`

Target:

- deterministic measurement
- layout as its own engine
- page-aware composition above document truth
- optional offscreen planning geometry

Primary references:

- Premirror architecture:
  [README.md](/Users/zbeyens/git/premirror/README.md)
- Pretext `prepare -> layout` split and accuracy/benchmark commands:
  [README.md](/Users/zbeyens/git/pretext/README.md)
  and
  [package.json](/Users/zbeyens/git/pretext/package.json)

Rule:

- never route active caret, selection, or composition through a measurement
  engine
- use deterministic measurement for planning, pagination, occlusion, and scroll
  stability

## 8. Lightweight Surface Plane

Owner:

- future `plate-v2`

Target:

- native-input-first small surfaces
- decorated textareas
- lightweight contenteditable only when the problem really demands it

Primary references:

- rich-textarea:
  [README.md](/Users/zbeyens/git/rich-textarea/README.md)
- edix:
  [README.md](/Users/zbeyens/git/edix/README.md)

Rule:

- do not force full Slate onto tiny text problems

## 9. Productization Plane

Owner:

- future `plate-v2`

Target:

- strong packaging
- clear extension catalog
- docs and examples that make the system feel fast to adopt

Primary reference:

- Tiptap as the productization benchmark:
  [editor-architecture-candidates.md](/Users/zbeyens/git/plate-2/docs/analysis/editor-architecture-candidates.md)

Rule:

- packaging wins matter
- they still do not justify corrupting the lower layers

## The Combined Objective

If this goes right, the future system should feel like this:

1. `slate-v2` owns document truth and transactions.
2. `slate-dom-v2` owns browser transport and DOM bridges.
3. `slate-react-v2` owns subscriptions, rendering posture, and runtime policy.
4. `slate-browser` proves browser-facing truth with layered lanes.
5. future `plate-v2` owns projections, services, product extensions, and
   layout-aware experiences.
6. lightweight native surfaces stay out of the full editor stack when they can.

That is the best “global system” target.

## What We Should Not Do

Do not aim for:

- Lexical’s whole engine model
- ProseMirror’s whole ontology
- Tiptap’s product layer inside Slate core
- Premirror’s layout engine inside active editing runtime
- TanStack DB as the editor source of truth
- urql exchanges shoved directly into `slate-v2`
- VS Code extension hosting inside core editor packages
- LSP-style protocols for browser-local editing primitives

Those are all category errors.

## Immediate Implication

Because this is the target stack, the next work should stay disciplined:

1. `slate-browser`:
   strengthen `openExample(...)` readiness and prove the zero-width / IME /
   empty-state gauntlet.
2. `slate-v2` / `slate-react-v2`:
   keep cashing out renderer/input-policy seams and later dirty-signal
   discipline.
3. future `plate-v2` research:
   turn the cross-domain imports into explicit design work for:
   - projections
   - execution pipelines
   - per-feature registries
   - protocol-shaped semantic services
   - layout/measurement hosting

## Bottom Line

The best future system is not “pick the best editor repo and copy it.”

It is:

- ProseMirror-grade package discipline
- Lexical-grade runtime and browser-test discipline
- Premirror + Pretext measurement and composition discipline
- TanStack DB projection discipline
- urql pipeline discipline
- VS Code + LSP service discipline
- rich-textarea / edix discipline for lightweight surfaces
- Tiptap discipline for productization

Steal the right thing from each layer.
Keep each layer in its lane.

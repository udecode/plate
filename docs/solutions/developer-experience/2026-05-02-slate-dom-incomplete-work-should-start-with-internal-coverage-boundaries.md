---
title: Slate DOM-incomplete work should start with internal coverage boundaries
date: 2026-05-02
last_updated: 2026-05-02
category: docs/solutions/developer-experience
module: slate-v2 slate-dom slate-react performance tooling
problem_type: developer_experience
component: tooling
symptoms:
  - Hidden or collapsed editable descendants need support without letting renderers silently omit Slate children
  - Normal DOM point lookup still throws when a model node has no mounted DOM
  - Public slots are tempting before lifecycle, stress, browser, and dev-safety proof exists
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags: [slate-v2, slate-dom, dom-coverage, hidden-content, benchmark, performance]
---

# Slate DOM-incomplete work should start with internal coverage boundaries

## Problem

Slate v2 needs first-class support for model content whose DOM is intentionally
absent or temporarily unmounted. The risky path is shipping a public collapse
API first and only later discovering that selection, copy/paste, IME, mobile,
browser find, and stale DOM behavior need a lower-level runtime contract.

## Symptoms

- A model point inside hidden content still reaches `editor.dom.assertDOMPoint(...)`
  and throws because the Slate node has no mapped DOM node.
- Nested hidden children and hidden first/last root nodes are separate proof
  cases; covering only top-level large-document islands does not prove either.
- Benchmark timings alone can look better while DOM nodes, editable descendants,
  root groups, or shell placeholders quietly grow.

## What Didn't Work

- Starting with public `slots.HiddenRange` / `slots.HiddenSelf` was too early.
  That commits to product-shaped "hidden" vocabulary before the bridge contract
  is proven.
- Letting app renderers omit editable descendants recreates the old missing-DOM
  crash class with nicer names.
- Treating large-document shell behavior as enough proof misses app collapse,
  first/last root boundaries, and nested child ranges.

## Solution

Start with an internal DOM coverage primitive:

```ts
DOMCoverage.registerBoundary(editor, {
  boundaryId: 'section-body',
  coveredPathRanges: [{ anchor: [0, 1], focus: [0, 1] }],
  reason: 'app-collapse',
  selectionPolicy: 'boundary',
  copyPolicy: 'include-model',
  findPolicy: 'not-native-until-mounted',
  state: 'intentionally-hidden',
  // owner/runtime metadata omitted
})
```

Add boundary-aware lookup before changing public rendering APIs:

```ts
DOMCoverage.resolveDOMPointOrBoundary(editor, hiddenPoint)
```

The first tracer should prove:

- normal `editor.dom.assertDOMPoint(hiddenPoint)` still fails for missing DOM;
- `DOMCoverage.resolveDOMPointOrBoundary(...)` returns the boundary instead of
  calling normal DOM lookup;
- first and last root self-boundaries cover their own descendants only;
- no stable `slots.Boundary`, `slots.SelfBoundary`, `HiddenRange`, or
  `HiddenSelf` ships before the proof matrix is green.

Once the proof matrix is green, expose only the narrow unstable adapter:

```tsx
renderElement={({ children, element, slots }) => {
  if (element.type !== 'section') {
    return <EditableElement>{children}</EditableElement>
  }

  const childNodes = React.Children.toArray(children)

  return (
    <EditableElement>
      {childNodes[0]}
      <slots.unstableBoundary
        boundaryId="section-body"
        mounted={false}
        scope={{ from: 1, type: 'children' }}
      >
        Collapsed body
      </slots.unstableBoundary>
    </EditableElement>
  )
}}
```

The unstable adapter should support child-range and self scopes without raw
runtime ids. Keep stable `slots.Boundary` for a later docs/adoption pass.

The private harness should store covered runtime endpoints, not only path
ranges. That lets the registry distinguish safe structural movement from stale
coverage:

- insert/move: owner and covered runtime ids move together, so the boundary
  rebases;
- remove: owner runtime disappears, so the boundary clears;
- split/merge: covered runtime content can leave its owner, so the boundary
  invalidates instead of silently covering the wrong path.

For lookup scale, bucket registered boundaries by covered root key and refresh
the index from the editor snapshot version. That keeps unrelated point lookup
cheap in the 5000-block / 100-boundary stress case without committing to a full
virtualization-grade interval tree yet.

For performance, add surface-weight profile counters to the existing benchmark
instead of creating a new lane too early:

- `surface-weight:dom-node-count`
- `surface-weight:dom-nodes-per-block`
- `surface-weight:editable-descendant-count`
- `surface-weight:editable-descendants-per-block`
- `surface-weight:root-group-count`
- `surface-weight:slate-element-count`
- `surface-weight:slate-text-count`
- `surface-weight:slate-leaf-count`
- `surface-weight:shell-count`

## Why This Works

The core invariant is not "collapsed UI." It is model-present content with
incomplete DOM coverage. That same primitive can later cover app collapse,
large-document staged mounting, aggressive shell mode, atom boundaries, and
future virtualization with different policies.

Keeping the first slice internal avoids fossilizing the wrong public API. The
bridge can learn how to resolve model points/ranges, placeholders, copy/paste,
and materialization without promising an app-facing React slot shape.

After the bridge proof is green, `slots.unstableBoundary` is acceptable because
it is just a React authoring adapter over the internal primitive. It still keeps
the important policy centralized: the app chooses mounted vs hidden and the
scope; Slate owns registration, placeholder import, model-backed copy, and dev
safety.

The profile counters matter because staging or shelling can make startup look
good while the repeated editable unit stays bloated. Counting DOM and editable
surface weight keeps the benchmark honest.

## Prevention

- Do not let renderers omit editable descendants unless they register a
  runtime-owned coverage boundary.
- Keep normal `renderElement` children mandatory until the boundary bridge is
  proven.
- Add one red/green tracer at a time: point export, range export, DOM import,
  copy/select, paste, materialization, IME, mobile.
- Keep public slots out of the first implementation slice.
- Before even an unstable slot ships, require StrictMode cleanup, boundary ID
  replacement, structural insert/remove/move, split/merge invalidation, nested
  policy, paste-over-hidden, select-all model-backed copy, drag import, browser
  find before/after expand, placeholder a11y smoke, hidden update dirtiness,
  desktop IME, mobile-project touch smoke, 5000-block/100-boundary stress,
  1000-descendant expansion, and a dev warning when renderers drop editable
  children without coverage.
- Treat raw mobile device proof and full collaboration remote-dirtiness proof
  as separate release lanes. Do not claim them from Playwright mobile viewport
  or model-update smoke rows.
- Pair huge-document timings with surface-weight profile rows.
- For benchmark changes inside embedded source strings, run a tiny profile-mode
  smoke, not only `node --check` on the wrapper script.

## Related Issues

- [Slate v2 legacy compare benchmark must align Bun workspace source and built React surfaces](../performance-issues/2026-05-01-slate-v2-legacy-compare-benchmark-must-align-bun-workspace-source-and-built-react-surfaces.md)
- [Slate React model-owned input must ignore stale DOM target ranges](../ui-bugs/2026-04-21-slate-react-model-owned-input-must-ignore-stale-dom-target-ranges.md)
- [Slate v2 ReactEditor should ride the mounted bridge and keep base components standalone](./2026-04-09-slate-v2-reacteditor-should-ride-the-mounted-bridge-and-keep-base-components-standalone.md)

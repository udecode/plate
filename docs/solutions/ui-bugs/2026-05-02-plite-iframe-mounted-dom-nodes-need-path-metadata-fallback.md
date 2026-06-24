---
title: Plite iframe mounted DOM nodes need path metadata fallback
date: 2026-05-02
last_updated: 2026-05-03
category: docs/solutions/ui-bugs
module: plite plite-dom slate-react iframe example
problem_type: ui_bug
component: tooling
symptoms:
  - Clicking inside `/examples/iframe` threw `Cannot resolve a Plite node from DOM node`.
  - Normal iframe paragraphs logged false `omitted editable child without a DOM coverage boundary` errors.
  - The iframe rendered Plite paragraph and text DOM without `data-plite-path`.
  - Browser repros showed mounted DOM, not intentionally hidden or unmounted content.
root_cause: missing_validation
resolution_type: code_fix
severity: high
tags: [plite, plite-dom, slate-react, iframe, dom-bridge, browser-editing]
---

# Plite iframe mounted DOM nodes need path metadata fallback

## Problem

Clicking mounted Plite content inside the iframe example crashed or logged false
DOM coverage warnings because the DOM bridge only trusted hot weak-map state. In
the iframe/custom renderer path, the paragraph and text spans were real Plite
DOM, but lifecycle timing could leave bridge maps behind the mounted DOM.

## Symptoms

- `dev-browser` reproduced the crash on
  `http://localhost:3100/examples/iframe` by clicking the first iframe
  paragraph.
- The console/page error was `Cannot resolve a Plite node from DOM node`.
- The dev-safety checker also logged `omitted editable child without a DOM
  coverage boundary` for ordinary paragraph children.
- Inspecting the iframe DOM showed `data-plite-node="element"` and
  `data-plite-node="text"` without `data-plite-path` or runtime metadata.

## What Didn't Work

- Treating this as DOM coverage boundary fallout was the wrong shape. No Plite
  content was intentionally hidden or virtualized; the target DOM was mounted.
- Relying only on `usePliteNodeRef` to populate weak maps left no fallback when
  the event path reached a mounted node whose mapping was missing.
- Adding only a `toDOMNode` fallback was incomplete. `toDOMPoint` can already
  know the model path while node-to-path maps are still catching up, so it needs
  a direct mounted-DOM-by-path fallback.
- A microtask dev-safety check fired too early for iframe/portal descendants.
  It reported normal mounted children as omitted before the child refs caught up.
- Accepting arbitrary `data-plite-path` from foreign DOM would have hidden real
  bugs and opened the bridge to unsafe outside-editor nodes.

## Solution

Make the mounted DOM contract explicit and guarded:

- render `data-plite-path` and `data-plite-runtime-id` directly on Plite element
  and text DOM, including custom `renderElement` / `renderText` attributes;
- let `DOMEditor.toPliteNode` fall back from a missing weak-map entry to
  `data-plite-path` only when the DOM node is inside the current editor and the
  path still exists;
- let `DOMEditor.toDOMNode` and `toDOMPoint` recover mounted DOM from the
  current Plite path plus matching `data-plite-runtime-id`;
- repair the normal weak maps after a successful fallback so later lookups are
  fast again;
- schedule the editable-child dev-safety check on the next macrotask and cancel
  it on cleanup, so iframe/portal descendants get one commit turn to register;
- keep the iframe integration test listening for the false DOM coverage warning
  and wait long enough to catch delayed logs;
- keep foreign path-tagged DOM throwing.

Representative bridge shape:

```ts
const fallbackPath =
  domEl && DOMEditor.hasDOMNode(editor, domEl)
    ? parseSlateDOMPath(domEl.getAttribute('data-plite-path'))
    : null

if (fallbackPath && Editor.hasPath(editor, fallbackPath)) {
  const [fallbackNode] = editor.read((state) => state.nodes.get(fallbackPath))
  const key = DOMEditor.findKey(editor, fallbackNode)

  keyToElement.set(key, domEl)
  ELEMENT_TO_NODE.set(domEl, fallbackNode)
  NODE_TO_ELEMENT.set(fallbackNode, domEl)

  return fallbackNode
}
```

For Plite-to-DOM point export, do not force recovery through stale node maps when
the caller already resolved the model path:

```ts
const el =
  DOMEditor.toDOMNode(editor, text, { suppressThrow: true }) ??
  findMountedDOMNodeByPath(editor, resolvedPoint.path)

if (!el) {
  throw new Error(`Cannot resolve a DOM node from Plite node: ${text}`)
}
```

## Why This Works

Weak maps are the fast path, but mounted Plite DOM needs a stable recovery lane
when an iframe, custom renderer, or lifecycle gap leaves that fast path empty.
The fallback is safe because it is scoped to the editor root, matched to the
runtime id, and validated against the live model path before resolving the node.

The dev-safety checker should catch genuinely omitted editable children, not
race normal iframe children. A macrotask is enough for the mounted bridge to
catch up while still surfacing real omissions in the same browser turn.

## Prevention

- Browser examples that use iframes or custom renderers should assert mounted
  Plite nodes expose path metadata.
- DOM bridge fallbacks must validate both editor containment and live model
  paths before accepting DOM-provided metadata.
- `toDOMPoint` fallback tests should cover stale node path maps separately from
  stale DOM weak maps.
- Browser regressions for dev-safety warnings should wait a short bounded delay
  after interaction; immediate console assertions can miss delayed checks.
- Tests should cover both sides: recovery for mounted in-editor nodes and a hard
  throw for path-tagged foreign DOM.

## Related Issues

- [Plite ReactEditor should ride the mounted bridge and keep base components standalone](../developer-experience/2026-04-09-plite-reacteditor-should-ride-the-mounted-bridge-and-keep-base-components-standalone.md)
- [Plite DOM-incomplete work should start with internal coverage boundaries](../developer-experience/2026-05-02-plite-dom-incomplete-work-should-start-with-internal-coverage-boundaries.md)
- [Plite mentions portal positioning must fail closed on transient DOM range gaps](2026-04-23-plite-mentions-portal-positioning-must-fail-closed-on-transient-dom-range-gaps.md)

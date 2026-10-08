# Tiptap: rendering and dom

## Focus and read-only

- **Focus and read-only.** Tiptap's ReadOnly guide demo spec (`ueberdosis/tiptap@91c51be53c:demos/src/GuideContent/ReadOnly/React/index.spec.js:12-32`, mirrored in Vue) checks in a browser that after `setEditable(false)` typing changes nothing and the editor root has no `tabindex`, and that once editable again typing lands and `tabindex` is `0`. The Focus extension demo spec (`ueberdosis/tiptap@91c51be53c:demos/src/Extensions/Focus/React/index.spec.js:6`) checks only that the first paragraph has the `has-focus` class. The harvest routed raw read-only and focus behavior to Plite and the focused-block class to Plate (`docs/editor-test-harvester/tiptap/report.md:97`). Read at that commit on 2026-10-08; the 2026-05-10 harvest pinned no commit, but its cited lines match this one.

## Mount and unmount lifecycle

- **Unmounted editors.** `ueberdosis/tiptap@91c51be53c:packages/core/__tests__/unmounted.spec.ts:8-255` (14 tests) pins that a Tiptap editor created with `element: null` does not throw, has a non-null `view`, accepts changes, reads state, and emits `update`, `transaction`, `selectionUpdate` and `destroy` events before it is ever mounted. `mount(element)` and `unmount()` emit `mount` and `unmount`. Mounting injects a shared `<style data-tiptap-style>` that unmount removes only when no other editor remains. The harvest routes this to Plite host and runtime tests and Plate editor host examples (`docs/editor-test-harvester/tiptap/portable-mixed-routing.md:66`). Read at that commit on 2026-10-08.

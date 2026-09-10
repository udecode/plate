---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Use `useExcalidrawSync({ api, excalidraw })` for persisted scene updates, document undo/redo, and stale-write protection. The copied renderer owns dynamic loading, controls, view mode, and dimensions. Canvas viewport and selection changes do not write the document.

Move the Excalidraw plugin and insertion helper to the Base editor transaction API, load the Excalidraw component once per mount, and register Excalidraw element properties with versioned inline validation in compiled schemas. Store the dynamically imported component without invoking it as a React state updater. Normalize Excalidraw change payloads into JSON-compatible persisted data.

**Migration:** Replace direct `insertExcalidraw(editor, props, options)` calls with `editor.update.excalidraw.insert(props, options)`. Pass `at` to target the block after which Excalidraw is inserted.

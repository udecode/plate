---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Use `useExcalidrawSync({ api, excalidraw })` for persisted scene updates, document undo/redo, and stale-write protection. The copied renderer owns dynamic loading, controls, view mode, and dimensions. Canvas viewport and selection changes do not write the document.

Move the Excalidraw plugin and insertion helper to the Base editor transaction API, load the Excalidraw component once per mount, and register Excalidraw element properties with versioned inline validation in compiled schemas. Store the dynamically imported component without invoking it as a React state updater. Normalize Excalidraw change payloads into JSON-compatible persisted data. Store a drawing's referenced images in `data.files`, an object keyed by file id; any other `files` value fails validation.

Remove `ExcalidrawDataState`. Type Excalidraw's own input, such as `initialData`, with Excalidraw's `ImportedDataState`, and a stored drawing with `NonNullable<ExcalidrawElement['data']>` from `platejs/excalidraw`.

Drop `width` from Excalidraw nodes in the v54 document migration unless the target schema declares it for that node.

**Migration:** Replace direct `insertExcalidraw(editor, props, options)` calls with `editor.plugin(BaseExcalidrawPlugin).update.insert(props, options)`. Pass `at` to target the block after which Excalidraw is inserted.

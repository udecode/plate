# Shard 001: EditContext Native Input

## Why This Matters

EditContext makes hidden editor assumptions explicit. It separates the text
input buffer from the DOM view, forces editors to report selection and layout
metadata, and surfaces IME formatting as data. That is exactly the class of
bugs Slate v2 keeps tripping over in large documents and complex selection:
text/model state can look correct while the native/visual target is wrong.

## Strong Invariants

- Text input is model-owned. The source text buffer changes first, then the app
  updates its model/view. DOM mutation is not the authority.
- Selection is not implicit. Editors must map DOM/native movement back to a
  logical text/model selection.
- Geometry is proof, not decoration. Selection/control/character bounds must
  be valid after scroll, render, and selection changes because text services use
  those rects for candidate placement.
- Composition has visual state. IME formatting is a separate signal from text
  update and can conflict with existing highlights or decorations.
- Focus controls routing. When the associated element loses focus, text updates
  must stop and keystrokes must route to the new focused input.

## Slate Routing

Current Slate v2 should stay on contenteditable behavior proof. The useful
promotion is stricter native/visual selection proof:

- for navigation or selection bugs, assert model selection;
- assert `window.getSelection()` anchor/focus and selected text;
- capture direction where the browser exposes it or infer anchor/focus order;
- inspect visual caret/selection rectangles against the intended target;
- include scroll-adjusted checks when the editor is virtualized, staged, or
  huge;
- type after the selection move to prove the editor target is not just pretty.

Composition decoration and Android/raw-device IME behavior stay backlog until a
real device lane exists.

---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Export `TabbablePluginState` and `TabbableEventContext` from `platejs/tabbable`, and stop exporting `BaseTabbablePlugin`, `findTabDestination` and `TabbableEffects`. Accept any `FocusableElement`, HTML or SVG, as a `TabbableEntry`'s `domNode`.

Pass `TabbablePlugin`'s `query`, `insertTabbableEntries` and `isTabbable` one context, `{ editor, event }`, whose `editor` is the editor of the view Tabbable runs in; `isTabbable` also receives `entry`. A Tab pressed on a stop Tabbable admits, which is an inserted entry or an in-editor tabbable that `isTabbable` accepts, skips `query` and always follows the tab order.

**Migration:** Read the caret from the callback's `editor`, not from an editor captured in `configure`:

```tsx
// Before
TabbablePlugin.configure(({ editor }) => ({
  options: {
    query: () => !editor.api.some({ match: { type: 'code_block' } }),
  },
}));

// After
TabbablePlugin.configure({
  initialState: {
    query: ({ editor }) => !editor.read.nodes.some({ type: 'codeBlock' }),
  },
});
```

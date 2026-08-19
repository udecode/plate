---
"@platejs/tabbable": major
---

Require React and React DOM 19.2 or newer.

Export `TabbablePluginState` as the complete mutable state contract for
`BaseTabbablePlugin`.

Support HTML and SVG tabbables through the snapshot-aware
`editor.plugin(TabbablePlugin).read.findDestination(options)` query. Accept
`FocusableElement` in custom `TabbableEntry` values and remove the standalone
`findTabDestination` helper. Keep `TabbableEffects` as plugin implementation
instead of a public component.

---
"@platejs/tabbable": major
---

Export `TabbablePluginState` as the complete mutable state contract for
`BaseTabbablePlugin`.

Support HTML and SVG tabbables through the snapshot-aware
`editor.plugin(TabbablePlugin).read.findDestination(options)` query. Accept
`FocusableElement` in custom `TabbableEntry` values and remove the standalone
`findTabDestination` helper. Export the correctly spelled `TabbableConfig`
type.

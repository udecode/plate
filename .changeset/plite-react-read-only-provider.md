---
"@platejs/plite-react": major
---

Add Plite React integration with strict editor and element hooks, typed
`usePliteCommand` dispatch, latest-value selectors, revision-based external
view data, provider-lifetime `onCommit` observation, and read-only state for
shell components outside a `<Plite>` root.

- Preserve focused-root selection across child editors and lifecycle target
  changes
- Coordinate DOM reads, writes, selection repair, Android input latency, and
  external mutation recovery through one bounded scheduler per mounted root
- Re-export the model-owned caret after composition repair renders only while
  the focused snapshot version and selection remain current
- Keep `NodeSelection` model-only with no native browser range, and expose exact
  node selection through `useElementSelected({ mode: 'node' })`
- Project custom structural selections through their declared DOM range and
  restore model-owned projections after document updates
- Let non-void `keyboardSelectable` owners receive node focus from non-editable
  chrome, enter editable children with ArrowDown, and regain owner focus with
  ArrowUp at the leading boundary
- Isolate optional decoration, annotation, widget, and render-callback
  failures
- Preserve inline decorated-range data in projection slices
- Infer React editor values from complete installed schemas and expose typed
  interactive content-root slots
- Preserve element-owned named roots through projected clipboard serialization
  and insertion
- Expose transaction announcements through one `aria-live` region per logical
  editor
- Keep placeholder and drop-cursor presentation in applications while
  retaining structural DOM, geometry, and selection behavior in Plite React

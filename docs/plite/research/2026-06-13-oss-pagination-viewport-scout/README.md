# OSS Pagination Viewport Scout

Date: 2026-06-13

Scope:
- Search and inspect OSS/editor sources for pagination, viewport, visible page,
  selection drawing, composition, and document-rendering ideas portable to Plite
  v2.
- Promote only source-backed proof, benchmark, or architecture leads.
- Do not copy runtime code or patch Plite from issue titles, screenshots, or
  docs-only claims.

Sources:
- ProseMirror forum pagination discussions:
  - https://discuss.prosemirror.net/t/a-new-text-editor-with-pagination/6667
  - https://discuss.prosemirror.net/t/implementing-pagination-with-prosemirror/6336
- Local clones:
  - `/Users/zbeyens/git/prosemirror-pagination`
  - `/Users/zbeyens/git/react-prosemirror`
  - `/Users/zbeyens/git/editable`
  - `/Users/zbeyens/git/windoc`

Outcome:
- Reject ProseMirror-style schema page splitting as the main Plite direction.
  It measures DOM overflow, dispatches pagination metadata, rewrites page/header
  structure, and contains table-specific split repair logic. That is useful as a
  cautionary comparison, not as a Plite target.
- Keep CSS/layout projection as a research lead. Badon Writer's public
  description claims pagination mostly relies on CSS layout and avoids node
  splitting; no source was available in this packet, so it stays research-only.
- Promote composition-pause and stale-selection proof from `react-prosemirror`:
  during composition, selection and DOM updates may need explicit freezing, and
  tests should cover unchanged-looking DOM selection parameters plus
  `Selection.extend` exceptions.
- Promote drawn-selection rectangle proof from `editable`: custom selection
  layers should be tested as rect geometry, focus/blur styling, and input
  transport, not just final model selection.
- Reject `windoc` internals for current Plite-native runtime work. It is a
  canvas document editor; visible page-list APIs are useful as a comparison
  metric, but its rendering architecture is a different product lane.

Decision:
- Keep as research/proof leads. No runtime patch in this packet.

Plite-native follow-up:
- Composition-freeze proof is covered for the active repair packet by existing
  richtext IME/composition guard rows. Add a narrower row only when a concrete
  route fails.
- Projected selection rectangle proof was promoted into `plite-browser`
  displayed-selection snapshots and huge-document route assertions.
- Keep the current Plite policy: pages/fragments are layout/projection state,
  not document schema nodes, unless `plite-plan` deliberately changes the law.

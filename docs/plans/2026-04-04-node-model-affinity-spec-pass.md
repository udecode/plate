# Node Model And Affinity Spec Pass

## Goal

Make node atomicity, voidness, and affinity explicit across the editor-behavior
docs so the spec stops hand-waving over the actual editor model.

## Phases

- [x] Re-check current spec gaps around footnote references, inline atoms, and
  affinity policy
- [x] Cross-check current package surfaces for real `isVoid`, `isInline`, and
  mark-affinity declarations
- [x] Update the standards doc to require explicit node-model and affinity
  declarations
- [x] Update the readable spec with node-model classes and corrected family law
- [x] Update the parity/protocol docs so every current feature family states its
  model and affinity class
- [x] Verify docs consistency and note any newly exposed stale claims

## Findings

- The docs already talked about “atoms” and affinity, but they did not require
  one explicit model field per feature family.
- The spec drifted into a real lie on footnotes: `footnoteReference` was treated
  like an atom in prose while the runtime node was still non-void.
- Runtime surfaces are mixed:
  - links are inline non-void spans with directional affinity
  - mention/date/inline equation are inline void atoms
  - TOC, thematic break, media embed, file/audio/video, image, drawing, and
    block equation are block void atoms
  - many formatting marks already expose selection affinity in plugin rules
    (`directional`, `hard`, or `outward`)

## Notes

- This pass started as docs-only.
- It exposed one real runtime mismatch: footnote references were spec'd as
  inline void atoms before the package actually implemented that node model.
- That mismatch was fixed in the follow-up execution tracked in
  [2026-04-04-footnote-inline-void-fix.md](./2026-04-04-footnote-inline-void-fix.md).

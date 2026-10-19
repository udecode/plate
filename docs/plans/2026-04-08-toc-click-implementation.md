# TOC Click Implementation

## Goal
Implement the TOC activation contract from the updated editor spec: navigation-only activation in edit/readonly, no block-selection or caret-entry side effects, keyboard activation on Enter/Space.

## Phases
- [ ] Inspect current TOC navigation / selection code after revert.
- [ ] Add targeted tests for navigation-only activation and keyboard activation.
- [ ] Implement the TOC activation change.
- [ ] Verify with tests, build/typecheck, lint, and browser proof.

## Notes
- Spec says TOC generated entries are overlay navigation controls, not block-selection targets.
- Prior attempt to preserve visible block selection was wrong; it fought the selection plugin design.

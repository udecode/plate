# Editor Behavior Release Prep

## Goal
Execute the current editor-behavior 'release prep and final verification' slice from the live docs, not from stale memory.

## Phases
- [ ] Read current gate docs and plans.
- [ ] Define the smallest honest release-prep slice.
- [ ] Implement any required docs/code updates.
- [ ] Run relevant verification.

## Notes
- Current truth should come from `docs/editor-behavior/` first.
- Avoid inventing broad ceremony if the docs only justify a narrow prep pass.
- That pass added a separate non-Ralph operator lane for release-prep work.
- Wired the command into the pack README and the command graph from `replan-next-batch` and `launch-next-ralph-batch`.
- Narrowed the next slice to docs clarity debt only: table multi-paragraph policy wording and HTML-fallback explanation depth.
- Separated roadmap from operations: release prep is now explicitly operator-only, while the parity doc's roadmap section lists the real remaining backlog.
- Expanded `reinterview-open-authority-gaps.md` so it explicitly covers roadmap/priority reevaluation when ambiguity blocks normal replanning.

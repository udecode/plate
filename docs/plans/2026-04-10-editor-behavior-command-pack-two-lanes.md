---
date: 2026-04-10
topic: editor-behavior-command-pack-two-lanes
---

# Editor Behavior Command Pack Two-Lane Cleanup

## Task

Make `docs/editor-behavior/commands/*` work as an operator surface for both:

- doc-governance work
- implementation/runtime lane work

## Desired Outcome

The command pack should stop reading like it only exists to maintain spec docs.
It should route cleanly between:

- truth maintenance across standards/spec/protocol/parity/audit
- execution planning and runtime/code batches from the roadmap lanes

## Known Facts

- The canonical remaining work lanes live in
  [master-roadmap.md](docs/editor-behavior/master-roadmap.md).
- `README.md`, `replan-next-batch.md`, and `launch-next-ralph-batch.md` still
  skew toward doc-oriented framing or old major-artifact routing.
- The command pack was introduced in
  [2026-04-08-editor-behavior-commands-pack.md](docs/plans/2026-04-08-editor-behavior-commands-pack.md).

## Findings

- `reconsolidate-law-stack.md` and `refresh-evidence-ledger.md` already read as
  doc-governance commands.
- `replan-next-batch.md` should be the bridge from doc truth into concrete
  implementation/runtime lane selection.
- `launch-next-ralph-batch.md` should be lane-agnostic and point at the active
  approved implementation artifacts, not just the old major plan.

## Planned Edits

1. Tighten [commands/README.md](docs/editor-behavior/commands/README.md)
   so it names the two-lane model explicitly.
2. Rewrite [replan-next-batch.md](docs/editor-behavior/commands/replan-next-batch.md)
   as the handoff from truth maintenance into an implementation lane.
3. Rewrite [launch-next-ralph-batch.md](docs/editor-behavior/commands/launch-next-ralph-batch.md)
   so it works for whatever implementation lane is active, not just the old
   major artifacts.
4. Patch any adjacent command docs whose next-step routing still implies a
   docs-only surface.

## Verification

- read back edited command docs
- grep for stale one-lane wording in the command pack

## Progress

- [done] Context gathered from command docs, roadmap, and related plan notes.
- [done] Patched command docs around a two-lane model:
  - doc-governance
  - implementation/runtime
- [done] Readback and grep verification.

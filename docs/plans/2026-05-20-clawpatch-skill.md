# 2026-05-20 Clawpatch Skill

## Goal

Create a first-class Plate repo skill for operating Clawpatch from the current
docs and local Slate v2 state.

## Source

- Official docs: `https://clawpatch.ai/`
- Local active Slate v2 state: `Plate repo root/.clawpatch`

## Result

- Added `.agents/rules/clawpatch.mdc`.
- Synced generated `.agents/skills/clawpatch/SKILL.md` with `pnpm install`.
- Added `clawpatch` to `.agents/AGENTS.md`.
- Added `.clawpatch/` to the root `.gitignore`.
- Normalized `Plate repo root/.gitignore` to ignore `.clawpatch/`.

## Verification

- `pnpm install`: passed and ran Skiller successfully.
- `pnpm lint:fix`: passed.
- `test -f .agents/skills/clawpatch/SKILL.md`: passed.
- `rg -n "Force Re-Review All Features|review --dry-run|requireCleanWorktreeForFix|\\Plate repo root"` against source and generated skill: passed.
- `cd Plate repo root && clawpatch status --json`: confirmed the moved state is initialized with `features: 92`.
- `cd Plate repo root && clawpatch review --dry-run --json`: confirmed plain review queue is empty with `wouldReview: 0`.
- `node tooling/scripts/completion-check.mjs`: passed.

## Notes

- `Plate repo root` currently reports `findings: 182`, `openFindings: 75`, and `activeLocks: 1`.
- Fixing or cleaning that queue is separate from this skill-creation task.

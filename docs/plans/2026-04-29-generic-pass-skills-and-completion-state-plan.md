# 2026-04-29 Generic Pass Skills And Completion State

## Goal

Create reusable, project-generic pass skills that can be conditionally loaded by
planning, review, and continuation workflows without introducing a separate
agent/team orchestration layer.

## Decisions

- `complete-plan` owns scheduling and Stop-hook continuation.
- `.tmp/completion-check.md` stores lane status and current-pass state.
- Pass skills are small conditional units, not always-on reviewers.
- Pass evidence belongs in the active plan or ledger; completion state stores
  concise pointers only.
- Top-level `status` is lane status. `current_pass_status` is pass status.

## Added Pass Skills

- `deslop-pass`: scoped cleanup after behavior is locked.
- `regression-lock-pass`: focused proof before risky edits.
- `verification-sweep-pass`: fresh closeout proof before `done`.
- `stall-debug-pass`: different hypothesis after repeated failures.
- `visual-proof-pass`: visual/browser proof when the task requires it.
- `security-pass`: targeted security/trust-boundary review.
- `intent-boundary-pass`: intent, scope, non-goals, and decision boundaries.
- `steelman-pass`: strongest fair objection and tradeoff pass.
- `high-risk-deliberate-pass`: pre-mortem and expanded proof for high-risk work.

## Verification

- `pnpm install` regenerated `.agents/skills/*`.
- Generated pass skill files exist.
- Source and generated skills contain current-pass fields.
- Forbidden external workflow vocabulary grep returned no matches.
- `bun run completion-check` passes after this state update.

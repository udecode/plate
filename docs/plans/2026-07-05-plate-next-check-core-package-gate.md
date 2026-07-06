# plate-next check-core package gate

Objective:
Repair Plate Next package-review workflow so Core-adjacent packages are added to `check:core`, then include `packages/utils` and prove the gate.

Completion threshold:
- `tooling/scripts/check-core.mjs` includes `packages/utils` in the Core-adjacent gate.
- `plate-next` source rule and plan template tell future package reviews to update `check:core` when a package becomes Core/Plite boundary proof.
- Generated `plate-next` skill mirror is synced from source.
- `pnpm check:core` passes.
- Goal plan passes `check-complete`.

Verification surface:
- `pnpm install`
- `pnpm prepare`
- `pnpm --filter @platejs/utils lint:fix`
- `pnpm check:core`
- `rg -n "check-core\\.mjs|Core-adjacent package review|shared Core gate|blind to that package|Utils" .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md docs/plans/templates/plate-next.md tooling/scripts/check-core.mjs`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-check-core-package-gate.md`

Constraints:
- Do not broaden into another package migration.
- Do not turn `check:core` into full-repo `check`.
- Keep `packages/utils` source-first like Core/Plite tests.
- No git operations.

Boundaries:
- In scope: `tooling/scripts/check-core.mjs`, `plate-next` source/generated skill, `docs/plans/templates/plate-next.md`, this plan.
- Out of scope: package API redesign, unrelated package migrations, PR/commit.

Blocked condition:
- None.

Work Checklist:
- [x] First checkpoint copied the user's requirement: update the skill and `check:core` to include the new package.
- [x] Patched `check:core` to include `packages/utils` typecheck/lint/tests.
- [x] Patched `plate-next` source rule and template so future package reviews do not miss this.
- [x] Ran `pnpm install` and `pnpm prepare` to sync generated skill mirror.
- [x] Ran `pnpm check:core` and fixed the formatting failures it exposed.
- [x] Ran audits and `check-complete`.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Requirement capture | done | this plan |
| Script patch | done | `Utils` target added to `tooling/scripts/check-core.mjs` |
| Skill/template patch | done | source rule and template mention Core-adjacent package gate |
| Sync generated skill | done | `pnpm prepare`; audit found generated `SKILL.md` wording |
| Proof | done | `pnpm check:core` passed |

Changed list:
- `tooling/scripts/check-core.mjs`: adds `packages/utils` as a source-first test target, adds Utils to turbo typecheck, and adds Utils lint.
- `.agents/rules/plate-next.mdc`: package review mode now requires updating `check:core` for Core-adjacent packages or recording why not.
- `.agents/skills/plate-next/SKILL.md`: regenerated from the source rule.
- `docs/plans/templates/plate-next.md`: adds shared Core gate rows for package review mode.
- `docs/plans/2026-07-05-plate-next-check-core-package-gate.md`: records this repair.
- `packages/utils/*`: formatter changes from `pnpm --filter @platejs/utils lint:fix`.

Verification evidence:
- `pnpm install` passed.
- `pnpm prepare` passed and Skiller applied generated rules.
- `pnpm --filter @platejs/utils lint:fix` fixed 8 formatting files.
- audit passed: source rule, generated skill, template, and script contain the new gate.
- `pnpm check:core` passed:
  - Core/Plite/Utils typecheck passed.
  - Core lint passed.
  - Plite lint passed.
  - Utils lint passed.
  - Core tests passed: 703 pass.
  - Plite tests passed: 1900 pass, 85 skip.
  - Utils tests passed: 57 pass.

Decisions:
- `packages/utils` belongs in `check:core` because the package now carries Core/Plite boundary behavior and runtime proof for normalized plugin behavior.
- The shared gate stays scoped. It does not become full-repo `check`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Workflow repair complete |
| Where am I going? | Stop and hand off |
| What is the goal? | Make `check:core` include `packages/utils` and teach `plate-next` to do this in future package reviews |
| What have I learned? | Package-local proof was not enough once Utils became Core-adjacent proof |
| What have I done? | Patched the script, skill source, generated skill, template, formatting, and proof gate |

Open risks:
- None.

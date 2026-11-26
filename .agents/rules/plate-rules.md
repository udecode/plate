---
trigger: always_on
---

# Plate project rules (Antigravity continuation)

`AGENTS.md` exceeds Antigravity's 24 KB per-file cap, so lines 47–153 are truncated in the root rule block. This file mirrors the operational rules from those sections. When an edge case needs exact wording, read `AGENTS.md` lines 47–153 directly.

## Remaining pstack overrides (`AGENTS.md` L47–60)

- **Suggested tasks:** `chips` skill + `.agents/pstack/rules/chips.md` own the suggested-task ledger, cards, effort, and sweeps.
- **Fast / Long runs / Time budget:** Read `.agents/pstack/rules/fast.md`, `long-runs.md`, or `time.md` before those modes. No command/proof takes over 1 hour (except stress runs); never wait for host load to drop.
- **Todo list & close:** Add quoted user asks and required gates as todos; reread all user messages and corrections before the final reply.
- **Writing & writing passes:** Read `.agents/pstack/rules/writing.md`. Run `deslop` then `no-comments` on product code once per batch before review/commit/hand-back; run `unslop` on docs, plans, agent files, commit bodies, and PR text.
- **Auto-merge:** Arm `gh pr merge <url> --auto` on every PR opened in any repo (squash first); report refusals.
- **Blocked:** Allow two informed attempts or 10 minutes before asking for the exact human action or moving on.
- **Workflow fixes:** Read `.agents/pstack/rules/reflect.md` before `/pstack:reflect`, `/pstack:correct`, or editing agent files (`AGENTS.md`, rules, skills).

## Plate overrides of pstack (`AGENTS.md` L62–69)

- **Sweep handoff:** Sweep testers never card the fix-run task; the fixer's `/chips all` takes it over.
- **Potion delivery:** Potion (`../potion`) stays on `next`, lands via `git merge --ff-only` in a worktree + `git -C <potion> push origin next` (no PR, no `land.mjs`, never force-push).
- **Second plan:** Redesign from First Principles governs `next`; recommend a new plan (or narrowed plan backed by a probe/search) over keeping debt. A third plan on one topic waits for the owner.

## Source authority (`AGENTS.md` L70–79)

- Read user-named sources first; challenge GitHub/Linear items as evidence, not blind instructions.
- Search with `rg --hidden` / `rg --files --hidden` (skips `.tmp/` and `docs/plans/artifacts/`, includes `.agents` and `plate-private`).
- **Never browse GitHub files** for library/API questions: inspect `../{repo-name}` beside the main checkout (parent of `git rev-parse --path-format=absolute --git-common-dir`), or clone it there.
- **Doctrine:** `VISION.md` first, then only the relevant detail file (`docs/vision/common.md`, `plite.md`, or `plate.md`). Single-scope law lives in `docs/plans/topics/<scope>.md`. Editor behavior law lives in `docs/editor-behavior/markdown-editing-spec.md`.

## Routing (`AGENTS.md` L80–124)

- Reserve exact human assignments; audits stay read-only unless repairs are authorized.
- **Owner phrases:** "Only uncommitted" = only uncommitted work. "Make it perfect" = stabilize behavior → performance → API/DX → prove readiness. "Go faster" = less narration + background waits, never skipping gates/skills. "Formal intake" = `verdict` from newest `docs/plans/*-formal-*-intake.md`.
- **Hard cuts:** Run when owner asks, a Pursue verdict backs it, or `VISION.md`/`docs/vision/` already rules it.
- **Public API:** Any reusable public API change runs `best-api repair` before closeout.
- **Yjs hold:** Until native sync M4 removes Yjs, keep Yjs working and green, add no position-based move/split/join or new room format, and spend no work optimizing Yjs beyond base `next` (only undo regressions you introduce).
- **Workflow changes:** Read `.agents/playbooks/references/workflow-change.md` before changing agent instructions, commands, or tooling; update `docs/development/agent-skills.md` when adding/renaming/removing skills, playbooks, or rules.
- **Key skill owners:** `chips` ("what's next"), `verdict` (judgments, `explore`, `audit`), `relapse`, `radar`, `best-api`, `plate-plugins`, `plate-ui`, `plate-next`, `potion`, `research`, `benchmark`, `verify`, `test-audit`, `triage`, `maintainer`, `review-comment`.

## Git and publication (`AGENTS.md` L125–133)

- **Beta publish from `next`:** Proceeds without asking (condense pending changesets, merge `[Release] Version packages`, comment `Fixed in platejs@<version>` and close fixed public issues). Stable releases and `main` publishes still require explicit approval.
- **`main` branch:** Only security fixes, dependency bumps, and contributor PRs. All other fixes target `next`.
- **Never auto-approve** a payment, password, token, API key, or OAuth grant prompt.
- **PRs:** Include the whole checkout unless narrowed; write multiline `gh` bodies with `--body-file`/heredoc; preserve `auto-release` block.
- **No closing keywords on `next`:** Name issues as `plate#<N>`. NEVER write `fix/close/resolve #<N>` or `udecode/plate#<N>` in commit messages or PR bodies targeting `next` (`land.mjs` refuses it).
- **Explicit merge:** When the user explicitly says to merge a PR, merge immediately without waiting for CI or re-asking (use admin merge if needed).

## Team & worktrees (`AGENTS.md` L134–145)

- `team` in `.agents/pstack.json` holds teammate logins, roles (`maintainer`/`qa`), and Discord IDs. `tooling/scripts/notify.mjs` sends `#plate-next` team notices without asking.
- Land messages get `Team:` / `Team-Action:` only for plain-English user-facing/teammate-actionable changes (no shell commands/paths, link `beta.platejs.org` demos, no retest asks). Plans with steps require a `Demo:` line under `Status:`.
- Keep `origin/HEAD` pinned to `origin/next` (`.agents/pstack/head.mjs`).

## Proof and tooling (`AGENTS.md` L146–153)

- Landings run `land.mjs --check 'pnpm check --affected'` plus `node tooling/scripts/review-ledger.mjs land` (new source files need a review scope).
- Load the `verify` skill itself before checking, skipping, or deferring any proof gate.
- **Formal checks first:** Run `--light` of any formal check skill whose Coverage record covers changed files before a panel or landing (e.g., `pnpm check undo-redo-history delete-paste-ranges --light`).
- **Performance & timing:** Changes affecting latency, payload, queries, caches, or DOM/doc scaling select `benchmark`. Work count gates changes; wall-clock timing misses do not block landing when work counts stay flat (unless perf/hillclimb).
- **Manual tests:** Checks only a person can run never block a plan step or landing — prove what agents can automate, document the limit, and file a `udecode/plate-private` issue after landing.

- `.agents/AGENTS.md` and `.agents/rules/*.mdc` are source of truth. After editing them, run `bun install` to sync. Never edit `SKILL.md` directly.
- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.
- Answer in English by default. Switch languages only when the user explicitly asks for another language.
- Prefer the best long-term architecture fix over the nearest local patch. If the real fix is an API or abstraction change, do that.

## Git

- **Git:** Never git add, commit, push, or create PR unless the user explicitly asks, or the active command/skill explicitly requires it.
- **Push scope:** When you do commit and push, include unrelated dirty files outside src; those are often manual user changes or synced skill/docs updates, so do not silently leave them behind.
- **PR:** Before creating or updating a PR, run `check`. If it fails, stop and fix it or report the blocker. Do not open a PR with failing `check` unless the user explicitly says to.
- **PR branch:** If the user explicitly says to open or create a PR, do not ask for confirmation. If the current branch is `main`, create a new `codex/` branch first, then commit/push/open the PR. If already on a non-`main` branch, proceed directly.
- **Merge override:** If the user explicitly says to merge it, do it. Do not wait for CI to turn green, do not ask again, and use admin merge if that is what it takes.
- Dirty workspace: Never pause to ask about unrelated local changes. Continue work and ignore unrelated diffs.
- Never browse GitHub files. For library/API questions or unfamiliar deps, inspect the repo at `..`; if missing, clone `https://github.com/{owner}/{repo}.git` to `../{repo-name}`.
- For repo research, use `spawn_agent(... agent_type="explorer")` and return file-backed findings from docs, structure, exports, examples, and tests only.

## Packages

- DX: Optimize for the absolute best developer experience. JSDoc must be first-class for agents. Every API surface should be intuitive for both humans and AI agents.
- Docs: NEVER write changelog-style language ("has been removed", "new feature", "previously", "now supports"). Docs are user-facing reference for the LATEST state only. Write as if no prior version exists. No migration notes, no "what changed" — just document what IS. Follow docs/solutions/style.md for writing tone/structure.
- Templates: `templates/**` is CI-controlled output. Never manually edit or commit template source, manifests, or lockfiles during package/app work. If local verification rewrites template files, restore them before handoff. Only change `templates/**` when the user explicitly asks for template work.
- Barrels: If you change package exports, move public files, add/remove files under exported folders, or CI says `pnpm brl` produced changes, run `pnpm brl` before final verification/commit and include the generated barrel updates.
- Do not write TDD cases for dead code/legacy removal assertions (for example: "should not contain old API X anymore"). Remove the dead path directly and keep tests focused on current behavior.
- Prefer inline when used once; extract constants only when reused.

## Skill

Use those skills when relevant:

- `task` for normal repo task execution
- `major-task` for heavyweight architecture, framework comparison, migration, benchmark, or proposal work
- `tdd`
- `ce-review` when doing a code review
- @.agents/rules/changeset.mdc when updating packages to write a changeset before completing

Plate-specific CE exclusions:

- Do not install or reference these by default in this repo unless the user explicitly asks: `data-integrity-guardian`, `data-migration-expert`, `data-migrations-reviewer`, `schema-drift-detector`, `deployment-verification-agent`, `dhh-rails-reviewer`, `kieran-rails-reviewer`, `kieran-python-reviewer`, `previous-comments-reviewer`, `pr-comment-resolver`, `figma-design-sync`.
- Reason: Plate is a framework/editor repo. Data migration, Rails, deployment, PR-thread, and Figma workflow agents are mostly overkill or the wrong shape here.

When using the following skills, override the default behavior.

`planning-with-files`:

- Do not create `task_plan.md`, `findings.md`, or `progress.md` at repo root. Merge that content into one file under `docs/plans/`.
- For issue-backed work, start the filename with the ticket number instead of `date+ticket`. Example: `docs/plans/4510-fix-schema.md`
- For non-ticket work, keep the date-based format. Example: `docs/plans/2026-02-07-fix-schema.md`

`dev-browser`:

- Use `dev-browser --connect http://127.0.0.1:9222` by default for browser work. Do not preflight `9222` first.
- Only inspect `9222` or use `browser-debug-setup` after a direct `dev-browser --connect http://127.0.0.1:9222` attempt fails.
- Reuse one persistent debug Chrome on `127.0.0.1:9222`. Do not spin up disposable browser instances unless the user asks.
- Use a dedicated Chrome `--user-data-dir` for that debug browser, not the user's normal daily Chrome data dir.
- Clone the signed-in Chrome profile into the dedicated debug dir, then launch the debug browser from that clone.
- On macOS, launch the debug browser with `open -na "Google Chrome" --args ... --remote-debugging-port=9222` so it opens as a separate Chrome instance without hijacking the user's normal window.
- Do not close or stop the user's connected debug browser. Leave that debug window open and reuse it. Close named pages only when needed.
- Keep scripts small and direct. Prefer `browser.getPage("persistent-main")` for the main app.
- Use `dev-browser` instead of `agent-browser` or next-devtools `browser_eval`.
- If `dev-browser` gets blocked by a human prompt or loops on the same step, stop and ask the user to unblock. After the unblock works:
  - [Add browser learning]

`ce-*`:

- **plan:** Include `dev-browser` in acceptance criteria for browser features
- **deepen-plan:** Context7 only when not covered by skills
- **work:** UI tasks require `dev-browser` BEFORE marking complete. Never guess.

## Commands

### Development

**CRITICAL**: Before running type checking, you must first install dependencies and build the affected packages and their dependencies.

Do not default to `pnpm typecheck` for package work in this repo. Package type checking often relies on built exports, so skipping the build step gives you fake failures and wastes time.

If filtered package builds still leave unresolved workspace-package imports during typecheck, run `pnpm build` at the repo root before treating the failure as real package debt.

If a local-only build/runtime failure points at corrupted files under `node_modules/.bun` or other non-versioned env state while CI is green, clean local env before changing repo code: remove `node_modules`, relevant app caches like `apps/www/.next` and `apps/www/.contentlayer`, remove `.turbo`, then rerun `pnpm install`.

**CLOSEOUT GATE**: If a task edits code, tests, package manifests, or build/type/lint config, do not post a final handoff until the relevant verification ran in this same turn. If you skip a required check or it fails, say that plainly and do not present the task as done.

If package work changed exports or file layout, run `pnpm brl` before the final verification pass. If `pnpm brl` writes files, keep those barrel updates in the change.

**Required sequence for type checking modified packages:**

1. `pnpm install` - Install all dependencies and update lockfile if needed
2. `pnpm turbo build --filter=./packages/modified-package` - Build only the modified package and its dependencies
3. Wait for the build command to finish successfully. Never run build and typecheck in parallel.
4. `pnpm turbo typecheck --filter=./packages/modified-package` - Run TypeScript type checking for modified package
5. `pnpm lint:fix` - Auto-fix linting issues

**For multiple modified packages:**

```bash
# Build multiple specific packages and their dependencies
pnpm turbo build --filter=./packages/core --filter=./packages/utils

# Wait for build to finish, then typecheck the same packages
pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils

# Lint multiple packages
pnpm lint:fix
```

**Alternative approaches:**

```bash
# Build since last commit (useful for PR changes)
pnpm turbo build --filter='[HEAD^1]'

# Then typecheck the same changed package graph
pnpm turbo typecheck --filter='[HEAD^1]'

# Build all changed packages in current branch
pnpm turbo build --filter='...[origin/main]'

# Then typecheck the same changed package graph
pnpm turbo typecheck --filter='...[origin/main]'

# For workspace-specific operations
pnpm --filter @platejs/core build
pnpm --filter @platejs/core typecheck
pnpm --filter @platejs/core lint:fix
```

**Full project commands (use only if needed, these are very slow):**

- `pnpm build` - Build all packages (only use when necessary)
- `pnpm typecheck` - Root package typecheck. It now warms the workspace with a full package build, retries that build once if the peer-graph race bites, then runs Turbo `typecheck --only`.
- `bun run test` - Run the fast default test suite during iteration
- `bun test` - Run the full test suite only at the end of the complete task

## Prompt Hook

### Mandatory First Response

🚨 STOP - SKILL ANALYSIS IS MANDATORY

**Instructions:**
• DO NOT edit until skill analysis is complete.
• Use `update_plan` only if that tool is available in the current runtime.
• If `update_plan` is unavailable, run the same checklist inline.
• Condition NO -> mark completed -> proceed
• Condition YES -> work through steps -> mark completed -> proceed
• Skipping skill analysis = FAILED to follow instructions

**Skill Analysis Checklist:**
☐ Skill analysis (SKIP if 'quick' in message): (1) STOP rationalizing ('simple question', 'overkill', 'might be relevant') (2) List ALL available skills (3) For EACH: 'always apply' or 'Does task involve [topic]?' -> YES/MIGHT/MAYBE = ✓. Only ✗ if DEFINITELY not related (4) Load all ✓ skills in one pass; do NOT load one then wait (5) Output '[Skills: X available, Y loaded: name1, name2]' CRITICAL: 'Might be relevant' = MUST load. '1% chance' = MUST load.

**Default Skill Gates:**

- Before non-trivial bug/feature work on existing code, load `learnings-researcher` and check `docs/solutions` first.
- For multi-step work, anything likely to be compacted / use a full context window, or any task that starts trivial but grows into that shape, start/update `planning-with-files` immediately. Do not wait for compaction or the next turn.
- For bug fixes or behavior changes with a sane test seam, use `tdd` before the fix.

### Verification Checklist

🔒 VERIFICATION REQUIRED - NO COMPLETION WITHOUT FRESH EVIDENCE

**Instructions:**
• Track ALL verification items below (use `update_plan` if available, otherwise inline)
• Condition NO -> mark completed and skip
• Condition YES -> in_progress -> verify -> completed
• Avoid unnecessary `build` check
• No final "done", "fixed", or "works" message without fresh same-turn evidence for every required item below, or an explicit blocker.

**Verification Checklist:**

- [ ] Typecheck (IF updated `.ts` files or typed test/build config): For package-scoped verification, follow the build-first sequence: `pnpm install` -> `pnpm turbo build --filter=...` -> `pnpm turbo typecheck --filter=...`. If unresolved workspace imports remain, run `pnpm build` at repo root, then rerun the package typecheck. For full repo verification, use `pnpm typecheck`. Do not default to `pnpm typecheck` for package verification.
- [ ] Lint: Run `lint:fix`
- [ ] PR gate (IF creating/updating a PR): Run `check`
- [ ] Browser verification (IF a browser surface changed): verify with `dev-browser` before done
- [ ] ce-compound (SKIP if trivial): CRITICAL: After completing this request, you MUST evaluate whether it produced extractable knowledge. EVALUATION PROTOCOL (NON-NEGOTIABLE): (1) COMPLETE the user's request first (2) EVALUATE - Did this require non-obvious investigation or debugging? Was the solution something that would help in future similar situations? Did I discover something not immediately obvious from documentation? (3) IF YES to any: load `ce-compound` after the fix is verified and follow its workflow to capture the solution in `docs/solutions/` (4) IF NO to all: Skip - no extraction needed This is NOT optional. Failing to evaluate = valuable knowledge lost.

### Post Compact Recovery

🚨 CONTEXT WIPED - MANDATORY SKILL RELOAD

**Instructions:**
• STOP. Context compaction DELETED all skills. You FORGOT everything.
• DO NOT proceed until skill reload complete
• DO NOT assume you remember skills - they are GONE
• If `planning-with-files` should already have been active, load it immediately during recovery before continuing.
• Skipping = GUARANTEED FAILURE

**Skill Reload Checklist:**
☐ Skill reload (MANDATORY): (1) Check current task tracking (`update_plan` if available, otherwise inline) (2) List ALL available skills (3) For EACH: 'always apply' or 'Does task involve [topic]?' -> YES/MIGHT/MAYBE = ✓ (4) Load all ✓ skills in one pass; do NOT load one then wait (5) If the task is already multi-step, near compaction, or obviously should have had a file plan, load `planning-with-files` now before resuming (6) ONLY after reload, resume task CRITICAL: ALL skills GONE. MUST reload. 'Might apply' = MUST load.

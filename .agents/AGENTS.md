- `.agents/AGENTS.md` and `.agents/rules/*.mdc` are source of truth. After editing them, run `pnpm install` to sync. Never edit `SKILL.md` directly.
- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.
- Answer in English by default. Switch languages only when the user explicitly asks for another language.
- Prefer the best long-term architecture fix over the nearest local patch. If the real fix is an API or abstraction change, do that.

## Git

- **Git:** Never git add, commit, push, or create PR unless the user explicitly asks, or the active command/skill explicitly requires it.
- **Open PR follow-up:** If the current branch already has an open PR and you make any change, treat that PR as explicit authorization to commit and push the entire checkout before handoff. Do not leave local-only follow-up changes on an open PR branch.
- **Push scope:** When you do commit and push, include unrelated dirty files outside src; those are often manual user changes or synced skill/docs updates, so do not silently leave them behind.
- **PR:** Before creating or updating a PR, run `check`. If it fails, stop and fix it or report the blocker. Do not open a PR with failing `check` unless the user explicitly says to.
- **PR branch:** If the user explicitly says to open or create a PR, do not ask for confirmation. If the current branch is `main`, create a new `codex/` branch first, then commit/push/open the PR. If already on a non-`main` branch, proceed directly.
- **Merge override:** If the user explicitly says to merge it, do it. Do not wait for CI to turn green, do not ask again, and use admin merge if that is what it takes.
- Dirty workspace: Never pause to ask about unrelated local changes. Continue work and ignore unrelated diffs.
- Never browse GitHub files. For library/API questions or unfamiliar deps, inspect the repo at `..`; if missing, clone `https://github.com/{owner}/{repo}.git` to `../{repo-name}`.

## Packages

- DX: Optimize for the absolute best developer experience. JSDoc must be first-class for agents. Every API surface should be intuitive for both humans and AI agents.
- Docs: NEVER write changelog-style language ("has been removed", "new feature", "previously", "now supports"). Docs are user-facing reference for the LATEST state only. Write as if no prior version exists. No migration notes, no "what changed" — just document what IS. Follow `.agents/rules/docs-creator.mdc` for writing tone/structure.
- Templates: `templates/**` is CI-controlled output. Never manually edit or commit template source, manifests, or lockfiles. Fix the source registry, package, or workflow inputs and let CI regenerate templates. If local verification rewrites template files, restore them before handoff.
- Barrels: If you change package exports, move public files, add/remove files under exported folders, or CI says `pnpm brl` produced changes, run `pnpm brl` before final verification/commit and include the generated barrel updates.
- Do not write TDD cases for dead code/legacy removal assertions (for example: "should not contain old API X anymore"). Remove the dead path directly and keep tests focused on current behavior.
- Prefer inline when used once; extract constants only when reused.

## Tooling

- Never run `build:registry` outside CI. Registry build output is automated by CI and does not belong in local agent commits.
- If typecheck/build/dev suddenly blows up with missing-module or package-resolution garbage that does not match the current diff, run `pnpm run reinstall` once before deeper debugging.
- Treat local-only React runtime weirdness as install corruption first, not product code:
  - `Invalid hook call`
  - `resolveDispatcher()` / null dispatcher crashes
  - package-local `node_modules/react` or `node_modules/react-dom` paths under `packages/*`
  - mixed `.bun` and `.pnpm` React paths in the same failing stack
- If `pnpm test`, `bun test`, or `pnpm check` suddenly fails with those signals and the failure does not line up with the current diff, run `pnpm run reinstall` once before blocking on the task.
- `pnpm run reinstall` is the repo reset button: it deletes root/workspace/app `node_modules`, `.turbo`, `apps/www/.next`, and `tsconfig.tsbuildinfo`, then runs `pnpm install`.
- Do not use `pnpm run reinstall` as a lazy substitute for fixing real code errors.
- For `react-dnd` / DnD fixes, do not treat a follow-up Bun `Invalid hook call`, `resolveDispatcher()`, or mixed `.bun` + `.pnpm` React stack as proof the DnD fix is wrong. In this repo, run `pnpm run reinstall` once before reopening the diagnosis; that failure shape is usually local env rot, not duplicate deps or broken DnD logic.

## Skill

Use those skills when relevant:

- `autogoal` for any prompt with a verifiable and quantitative outcome. Always use
  the autogoal skill before durable work when the task has a measurable completion
  threshold. Codex tends to compact output and miss requirements from the prompt,
  so the first autogoal checkpoint must copy every explicit requirement, scope
  boundary, timing constraint, stop condition, deliverable, and final-handoff
  section into the goal plan as checkable checkpoints before work starts
- `orchestrator` when the current thread should route per-branch work to child threads instead of executing locally
- `task` for normal repo task execution
- `major-task` for heavyweight architecture, framework comparison, migration, benchmark, or proposal work
- `clawsweeper` f[text](cid:f_mpqm0jua0)or Slate issue-ledger triage, duplicate/stale/invalid classification, small high-confidence issue processing, and exact claim sync
- `clawpatch` for Clawpatch init/map/review/report/fix/revalidate workflows
- `editor-test-harvester` for mining external editor repositories for portable editor-behavior tests, Slate v2 coverage gaps, and copy/refactor/create decisions
- `editor-harvest-plan` for turning an `editor-test-harvester` result into a lane-specific Slate v2 or Plate execution plan
- `slate-research` for Slate v2 web/GitHub/OSS discovery, scalable repo scans, research ledgers, dedupe, source synthesis, evidence grading, scoring, and promotion into `slate-ar-*`, `slate-patch`, `slate-plan`, `issue-harvester`, or docs packets. It does not run Codex Autoresearch packets
- `slate-auto` for Slate v2 long autonomous supervisor loops: quality, behavior, visual proof, perf, API cleanup, benchmark/test repair, external issue/test harvests, skill repair, docs consolidation, and private-alpha readiness without user micro-routing
- `sync-plate-ui` for fork-aware Plate UI registry component syncs into downstream apps like Potion, including status, planning, review, dashboard, and accepted-row apply workflows
- `release-lanes` for beta/latest release lane maintenance, promote, direct main-to-next sync, beta pre-mode, and npm/GitHub release verification
- `sync-main-to-next` for the fast direct `main -> next` release-lane sync wrapper without promotion or autoreview ceremony
- `tdd`
- @.agents/rules/changeset.mdc when updating packages to write a changeset before completing
- @.agents/rules/plate-plan.mdc when defining or updating editor-behavior law, authority maps, protocol rows, or parity coverage

Plate-specific CE exclusions:

- Do not install or reference these by default in this repo unless the user explicitly asks: `data-integrity-guardian`, `data-migration-expert`, `data-migrations-reviewer`, `schema-drift-detector`, `deployment-verification-agent`, `dhh-rails-reviewer`, `kieran-rails-reviewer`, `kieran-python-reviewer`, `previous-comments-reviewer`, `pr-comment-resolver`, `figma-design-sync`.
- Reason: Plate is a framework/editor repo. Data migration, Rails, deployment, PR-thread, and Figma workflow agents are mostly overkill or the wrong shape here.

Goal plans:

- For issue-backed goal work, start the filename with the ticket number.
  Example: `docs/plans/DEV-4510-fix-schema.md`
- For non-ticket goal work, keep the date-based format.
  Example: `docs/plans/2026-02-07-fix-schema.md`

Browser testing:

- When updating `content/**`, `apps/www/**`, or `packages/**`, start the relevant dev server and verify the affected route, UI, or package-facing behavior with browser proof before handoff. If the surface has no runnable browser path or the server/browser is blocked, say that explicitly.
- Use `[@Browser](plugin://browser@openai-bundled)` first for ordinary app QA. It is the fast path for route navigation, DOM checks, forms, screenshots, responsive checks, and browser-rendered UI proof.
- Use `[@Chrome](plugin://chrome@openai-bundled)` directly when the ticket involves native browser/profile/OS behavior: downloads, print or print preview, file picker/uploads, clipboard, browser permissions/dialogs, extension/profile state, or exact Chrome rendering. Do not stop at Browser proof for these.
- Use `[@Computer](plugin://computer-use@openai-bundled)` only when native Chrome/OS UI must be visually inspected or interacted with and Chrome automation cannot read it, such as print preview, save/open dialogs, or permission sheets.
- If Browser hits a known limitation and native proof matters, switch to Chrome/Computer instead of lowering confidence or asking for user confirmation.
- Do not substitute Puppeteer, standalone Playwright, or raw Chrome DevTools for Browser/Chrome usage.
- For Plate registry/browser proof, prefer `/blocks/[id]-demo` over docs wrappers when that standalone demo route exists.

## Commands

### Slate v2 packages in Plate repo

- Use root Slate package commands for Slate v2 iteration: `pnpm slate:packages:typecheck`, `pnpm slate:packages:test`, and focused `pnpm --filter www test:slate-browser` when browser proof is needed.
- Do not put broad browser sweeps in the fast package loop; they are closure gates.
- Use `pnpm --filter www test:slate-browser` for the Slate browser proof lane.
- `pnpm --filter www test:slate-browser` must be paired with package proof when making release-quality Slate behavior claims.
- Use `bun test:mobile-device-proof:raw` only on a machine/device lane that can provide real Appium Android/iOS proof artifacts. Do not let semantic mobile handles or Playwright mobile viewport rows satisfy raw-device claims.
- During editor-kernel/browser work, use focused package tests and focused Playwright greps first.
- Run broad app browser proof only before marking an architecture/browser plan `done`, before a release-quality browser claim, or when explicitly requested.

### Development

Default to source-first typecheck. Do not build packages just to run types unless the repo script or failure proves the typecheck graph still resolves built `dist` output.

If typecheck fails with stale workspace-package declarations, source/dist split-brain, or unresolved package exports, first inspect the package/app `paths` and source-entry setup. Build only when the affected surface intentionally validates release artifacts or still has no source-first typecheck path.

If a local-only build/runtime/test failure points at corrupted files under `node_modules/.bun`, mixed `.bun` / `.pnpm` React installs, package-local `node_modules/react*` symlinks, `Invalid hook call`, or other non-versioned env state while CI is green, clean local env before changing repo code: run `pnpm run reinstall` once, then rerun the exact failing command. If the failure shape changes or disappears, it was local env rot. If not, go back to normal debugging.

**Required sequence for type checking modified packages:**

1. `pnpm install` - Install dependencies when needed by the task or lockfile state.
2. `pnpm turbo typecheck --filter=./packages/modified-package` - Run source-first package type checking.
3. If that fails because the graph resolves built output, fix the source-entry or `paths` setup when that is the right long-term shape.
4. Build only when checking artifact output, package exports, or a package that intentionally has no source-first typecheck path.
5. `pnpm lint:fix` - Auto-fix linting issues.

**For multiple modified packages:**

```bash
# Typecheck multiple specific packages through their source graph
pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils

# Lint multiple packages
pnpm lint:fix
```

**Alternative approaches:**

```bash
# Typecheck since last commit
pnpm turbo typecheck --filter='[HEAD^1]'

# Typecheck all changed packages in current branch
pnpm turbo typecheck --filter='...[origin/main]'

# For workspace-specific operations
pnpm --filter @platejs/core typecheck
pnpm --filter @platejs/core lint:fix
```

**Full project commands (use only if needed, these are very slow):**

- `pnpm build` - Build all packages (only use when necessary)
- `pnpm typecheck` - Root package typecheck. It should use source-first package graphs; if it needs a build, treat that as source-entry debt unless the check is explicitly artifact-facing.
- `bun run test` - Run the fast default test suite during iteration
- `bun test` - Run the full test suite only at the end of the complete task

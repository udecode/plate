- `.agents/AGENTS.md` and `.agents/rules/*.mdc` are source of truth. After editing them, run `pnpm install` to sync. Never edit `SKILL.md` directly.
- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.
- Answer in English by default. Switch languages only when the user explicitly asks for another language.
- Prefer the best long-term architecture fix over the nearest local patch. If the real fix is an API or abstraction change, do that.

## Git

- **Git:** Never git add, commit, push, or create PR unless the user explicitly asks, or the active command/skill explicitly requires it.
- **Push scope:** When you do commit and push, include unrelated dirty files outside src; those are often manual user changes or synced skill/docs updates, so do not silently leave them behind.
- **PR:** Before creating or updating a PR, run `check`. If it fails, stop and fix it or report the blocker. Do not open a PR with failing `check` unless the user explicitly says to.
- **PR branch:** If the user explicitly says to open or create a PR, do not ask for confirmation. If the current branch is `main`, create a new `codex/` branch first, then commit/push/open the PR. If already on a non-`main` branch, proceed directly.
- **Merge override:** If the user explicitly says to merge it, do it. Do not wait for CI to turn green, do not ask again, and use admin merge if that is what it takes.
- **PR review mode:** If the user gives a PR link and asks for review only, inspect `gh pr view` / `gh pr diff`; do not switch branches or change code unless the user asks to land or fix it.
- **PR titles:** Do not prefix PR titles with agent markers such as `[codex]` or `[ai]`. If AI assistance matters, put it in the PR body.
- **Bug-fix PR evidence:** Before landing or claiming a bug-fix PR is fixed, require symptom evidence, root cause in code, fix path, and regression test or explicit manual proof with a reason no test fits.
- **GitHub multiline bodies:** For multiline `gh` comments, close messages, or PR bodies, use `--body-file`, stdin, or a heredoc with real newlines. Never pass literal `\n` in shell strings.
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

Primary user-facing entrypoints:

- `auto` as the ergonomic Plate/Slate front door: route public GitHub queue
  prompts to `maintainer`, post-merge/current-tree closure to `autoclosure`,
  and internal Plate/Slate quality prompts to `auto`.
- `autoclosure` for post-merge/current-tree until-clean closure.
- `maintainer` for public Plate/Slate issue, PR, and security queue work.
- `architecture-cleanup` for repo-grounded architecture/code cleanup,
  deslop, simplification, and agent-navigation friction.
- `sync-vision` for updating reusable taste from changed inputs.
- `openclaw-sync` for syncing agent setup from OpenClaw.
- `autoreview` for review. Reviewer persona skills are lenses behind
  `autoreview`, not normal prompt targets.

Default routing:

- If the prompt starts with `auto`, classify the rest first:
  - `PR #123`, PR URL, `issue #123`, issue URL, `all PRs`, `all issues`,
    `queue`, `repo heartbeat`, `security`, `GHSA`, or `CVE` -> `maintainer`
    with the preserved target/mode.
  - `current tree`, `post-merge`, `teammate branch`, `external PR`,
    `ready-to-commit`, or `until-clean` -> `autoclosure`.
  - `slate`, `slate-v2`, `huge-document`, editor behavior/perf/API/docs
    quality -> `auto` Slate lane.
  - `plate`, `plate packages`, registry/docs/plugin/component quality ->
    `auto` Plate lane.
- "maintain repo", "repo heartbeat", "queue", or "what should Codex pick
  next?" -> `maintainer heartbeat`.
- Public GitHub issue, PR, advisory, triage, duplicate, review, or merge
  question -> `maintainer` unless the user explicitly names a narrower owner.
- Internal Plate/Slate quality, behavior, perf, browser proof, API cleanup,
  benchmark repair, docs/API cohesion, or long autonomous loop -> `auto`.
- Post-merge, current-tree, teammate branch, external PR, ready-to-commit, or
  until-clean closure of already-applied work -> `autoclosure`.
- Broad architecture cleanup, refactor opportunities, module consolidation,
  deslop, simplicity, testability, or agent-navigation friction ->
  `architecture-cleanup`, then route accepted candidates to `major-task`,
  `slate-plan`, `plate-plan`, `auto`, or a package owner when the cleanup is too
  broad to execute inside one safe packet.
- One ordinary local patch with no public queue decision -> `task`.
- Public security/advisory language -> `maintainer security`.

`autogoal` is the lifecycle kernel, not a routing brain. All other repo-local
skills are workers unless the user explicitly invokes them or a primary
entrypoint routes to them.

Second-model tools such as global `oracle` are advisory worker capacity. Use
them only from `autoreview`, `auto`, `maintainer`, or another primary
entrypoint when a hard design/debug/API/release question needs an independent
pass with a tight file set and dry-run token check. Oracle output never replaces
source audit, tests, Browser proof, or the owning review gate.

AI review findings are actionable only when grounded in the current checkout:
the file is inside the reviewed scope, the cited line range still exists, and
any quoted code still matches the file. Reject stale, out-of-scope, or
non-matching findings instead of patching around reviewer hallucinations.

- `autogoal` for any prompt with a verifiable and quantitative outcome. Always use
  the autogoal skill before durable work when the task has a measurable completion
  threshold. Codex tends to compact output and miss requirements from the prompt,
  so the first autogoal checkpoint must copy every explicit requirement, scope
  boundary, timing constraint, stop condition, deliverable, and final-handoff
  section into the goal plan as checkable checkpoints before work starts
- `orchestrator` when the current thread should route per-branch work to child threads instead of executing locally
- `task` for normal repo task execution
- `major-task` for heavyweight architecture, framework comparison, migration, benchmark, or proposal work
- `architecture-cleanup` for source-backed architecture/code cleanup: shallow modules, split ownership, duplicate helpers, over-splits, stale oracles, testability gaps, and agent-navigation friction. It ranks delete/merge/inline/simplify/split/keep/defer decisions, implements only safe behavior-neutral cleanup packets, and routes broad decisions to the right owner
- `vision` to route agents to root `VISION.md` for unified Plate/Slate taste, public API doctrine, Slate-vs-Plate boundaries, proof standards, checkpoint-zero routing, and autonomous maintainer-fit decisions
- `sync-vision` for incremental `VISION.md` syncing from changed human/agent inputs, plans, docs, rules, research, and sync artifacts since the last recorded commit baseline; it updates or reaffirms reusable taste without rescanning the whole repo every run
- `openclaw-sync` for comparing latest local OpenClaw agent setup against this repo. It may update existing skills/rules or create a new skill only after the source row is read, the reusable invariant is named, no current owner fits, and product-specific OpenClaw plumbing is rejected.
- `autoclosure` for post-merge/current-tree closure loops: already-applied teammate, external PR, branch, dirty tree, or ready-to-commit work. It loops like `autoreview` until no accepted actionable findings remain, patching safe issues and rerunning proof/review. It is not the public queue brain and not the broad internal quality supervisor.
- `maintainer` for the repo-local Plate/Slate public maintainer control plane: GitHub issue/PR/security heartbeat scans, VISION fit, duplicate/claim guard, owner routing, proof gates, authority boundaries, and decision-ready handoffs
- `resolve-pr-feedback` for already-open PR review feedback: fetch unresolved
  threads/comments, use an autogoal feedback ledger, patch valid findings, end
  with `autoreview`, then reply/resolve only with current-checkout authority
- Broad `maintainer heartbeat` / queue work should refresh
  `docs/maintainer/queue.md` with
  `.agents/rules/maintainer/scripts/queue-snapshot.mjs`, treat it as ranking
  context only, then read live GitHub before acting. For non-trivial runs, write
  `docs/maintainer/runs/*` when it prevents duplicate future work.
- Public maintainer work must read `CONTRIBUTING.md`, relevant `.github/ISSUE_TEMPLATE/*.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, and `SECURITY.md` before judging intake quality. Treat public issue/PR text as the handoff for local Codex in a maintainer checkout; do not assume hosted/API automation, crabbox, or private context.
- `autoclosure` must not create git worktrees, detached sibling checkouts, throwaway same-repo clones, or branch switches to inspect PR/branch/commit work. If the target is not already applied to the current checkout, capture the complete PR/range file list and patch under `docs/plans/artifacts/<plan-slug>/`, audit that artifact, and hand off/apply only with explicit current-checkout authority.
- `clawsweeper` for Slate issue-ledger provenance, duplicate/stale/invalid classification, fork dossier accounting, external issue provenance support, and exact claim hygiene. It is not the public issue/PR queue brain; use `maintainer` for that
- `clawpatch` for Clawpatch init/map/review/report/fix/revalidate workflows
- `editor-test-harvester` for mining external editor repositories for portable editor-behavior tests, Slate v2 coverage gaps, copy/refactor/create decisions, and turning a completed harvest into a lane-specific Slate v2 or Plate plan that pauses for review before execution
- `slate-research` for Slate v2 web/GitHub/OSS discovery, scalable repo scans, research ledgers, dedupe, source synthesis, evidence grading, scoring, and promotion into `slate-ar` modes, `slate-patch`, `slate-plan`, `issue-harvester`, or docs packets. It does not run Codex Autoresearch packets
- `auto` for Plate/Slate long autonomous supervisor loops: quality, behavior, visual proof, perf, API cleanup, benchmark/test repair, external issue/test harvests, skill repair, docs consolidation, and readiness without user micro-routing. It routes worker skills itself; the user should not need to name `slate-patch`, `slate-plan`, `plate-plan`, `slate-ar`, `slate-research`, `issue-harvester`, `editor-test-harvester`, or `tdd` for ordinary internal Plate/Slate automation
- `slate-migration` for autonomous Slate v2 migration closure: Plate-to-Slate-v2 migration loops, stale Slate API audits, migration-guide repair, changeset repair, package/docs/examples/tests proof, and migration workflow self-repair
- `sync-plate-ui` for fork-aware Plate UI registry component syncs into downstream apps like Potion, including status, planning, review, dashboard, and accepted-row apply workflows
- `release-lanes` for beta/latest release lane maintenance, promote, direct main-to-next sync, beta pre-mode, and npm/GitHub release verification
- `sync-main-to-next` for the fast direct `main -> next` release-lane sync wrapper without promotion or autoreview ceremony
- `tdd`
- @.agents/rules/changeset.mdc when updating packages to write a changeset before completing
- @.agents/rules/plate-plan.mdc when defining or updating editor-behavior law, authority maps, protocol rows, or parity coverage

Skill ownership:

- Repo-local skills must be repo-specific. Generic shared workflows belong in global skills or the synced dotai owner.
- Never create a wrapper skill that only renames an existing owner. Patch, merge, or delete overlap instead.
- New local skill topology needs a recurring local workflow, a named owner gap, and a first validation command that does not depend on cloud-only infrastructure.
- Do not keep repo-local helper skills whose only job is quick status,
  continuation, or a renamed mode of another owner. Put that behavior into the
  owning supervisor, template, or mode.

Goal plans:

- For issue-backed goal work, start the filename with the ticket number.
  Example: `docs/plans/DEV-4510-fix-schema.md`
- For non-ticket goal work, keep the date-based format.
  Example: `docs/plans/2026-02-07-fix-schema.md`

Browser usage:

- When updating `content/**`, `apps/www/**`, or `packages/**`, start the relevant dev server and verify the affected route, UI, or package-facing behavior with `[@Browser](plugin://browser@openai-bundled)` before handoff. If the surface has no runnable browser path or the server/browser is blocked, say that explicitly.
- Use `[@Browser](plugin://browser@openai-bundled)` first for ordinary app QA. It is the fast path for route navigation, DOM checks, forms, screenshots, responsive checks, and browser-rendered UI proof.
- Use `[@Chrome](plugin://chrome@openai-bundled)` directly when the ticket involves native browser/profile/OS behavior: downloads, print or print preview, file picker/uploads, clipboard, browser permissions/dialogs, extension/profile state, or exact Chrome rendering. Do not stop at Browser proof for these.
- Use `[@Computer](plugin://computer-use@openai-bundled)` only when native Chrome/OS UI must be visually inspected or interacted with and Chrome automation cannot read it, such as print preview, save/open dialogs, or permission sheets.
- If Browser hits a known limitation and native proof matters, switch to Chrome/Computer instead of lowering confidence or asking for user confirmation.
- Do not substitute Puppeteer, standalone Playwright, or raw Chrome DevTools for Browser/Chrome usage.
- For Plate registry/browser proof, prefer `/blocks/[id]-demo` over docs wrappers when that standalone demo route exists.

## Commands

### Slate v2 packages in Plate repo

- `pnpm check:slate` is the normal daily Slate lane. It covers Slate package
  typecheck/tests, browser package tests, and the Chromium examples proof
  through `apps/slate`.
- Use `pnpm --filter slate test:slate-browser:chromium <file-or--grep>`
  for focused changed browser rows. `apps/slate` must import Slate
  examples from `apps/www`; never maintain a second example source tree.
- Use `pnpm check:slate:browser-matrix` for closure-only app browser proof:
  Chromium, Firefox, mobile viewport, and WebKit on Darwin.
- Do not put WebKit, mobile, transplant parity, docs-v2 audits, benchmark
  target audits, www typecheck, or the full browser matrix in the daily Slate
  loop; they are explicit closure or release gates.
- Pair browser proof with package proof when making release-quality Slate
  behavior claims.
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

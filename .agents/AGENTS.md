- `.agents/AGENTS.md` and `.agents/rules/*.mdc` are source of truth. After editing them, run `pnpm install` to sync. Never edit `SKILL.md` directly.
- Be concise in all interactions and commit messages. Never sacrifice precision or readability for brevity.
- Answer in English by default. Switch languages only when the user explicitly asks for another language.
- Prefer the best long-term durable architecture that materially fixes the owning problem over the nearest compatible or local patch. Before stability, break APIs and abstractions when that buys materially better lasting value; preserve only hard correctness, security, serialized-data, native-behavior, or runtime laws.
- For every API or architecture plan, review, or feedback request, run the maximum-value hard-cut counterfactual before presenting a local improvement. Treat each current or proposed public noun, namespace, plugin, abstraction, owner, layer, and package as deletable; test delete, merge, inline, and reuse of an existing canonical owner. Retain one only for a hard law, an explicit user constraint, or a proven independent current user job. Compatibility and implementation difficulty affect adoption order, never the target. Lead harsh honest feedback with the strongest materially justified cut even when its blast radius is large. This rule applies repo-wide, not only to packages.

## Technical prose

These rules apply to user-facing technical prose: docs, commit messages, PR descriptions, reports, proposals, and replies. They do not constrain analysis, investigation, code, API names, or quoted text.

- Lead with the decision or outcome. Give the reason before implementation details.
- Prefer common words. Use one project term for one concept. Define unavoidable jargon on first use. If a term recurs or is ambiguous, define it in the owning doc and reuse it exactly.
- Use active voice, short sentences, and short single-topic paragraphs. Prefer 20 words or fewer when clarity survives; never sacrifice precision to hit a word limit.
- For an implementation proposal or handoff, cover these points when they apply: symptom or objective, root cause or owner, chosen fix, governing invariant, material alternatives rejected, blast radius, verification, and remaining risk.
- Never make the reader inspect the diff to understand why the approach is correct and safe.

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
- **Public issue status:** After a user-selected non-security public behavior issue passes its reporter-valid proof gates, always post one concise status comment. Local-only or unpushed work is a candidate, not fixed/completed. Fixed/completed wording and the `completed` label require exact-case replay on the final pushed ref, with matching proof-file fingerprints. A fresh reporter contradiction invalidates earlier green proof. State the exact local/commit/PR status, leave the issue open unless closure is separately authorized, and never imply the fix is shipped.
- **Failed-fix interrupt:** When a claimed candidate/kept/completed bug fix fails exact replay/final verification or receives a reporter contradiction, stop product edits and automatically run `regression repair <case-id>: <missed invariant or proof failure>` before retrying. Expected red-before-green is not a failed fix. A second failed fix, or a Regression architecture trigger, requires `best-api` and the owning Plite/Plate plan before another implementation attempt.
- Dirty workspace: Never pause to ask about unrelated local changes. Continue work and ignore unrelated diffs.
- Never browse GitHub files. For library/API questions or unfamiliar deps, inspect the repo at `..`; if missing, clone `https://github.com/{owner}/{repo}.git` to `../{repo-name}`.

## Packages

- DX: Optimize for clear, low-friction developer experience without speculative machinery. JSDoc must be first-class for agents. Every API surface should be intuitive for both humans and AI agents.
- Docs: NEVER write changelog-style language ("has been removed", "new feature", "previously", "now supports"). Docs are user-facing reference for the LATEST state only. Write as if no prior version exists. No migration notes, no "what changed" — just document what IS. Follow `.agents/rules/docs-creator.mdc` for writing tone/structure.
- Templates: `templates/**` is CI-controlled output. Never manually edit or commit template source, manifests, or lockfiles. Fix the source registry, package, or workflow inputs and let CI regenerate templates. If local verification rewrites template files, restore them before handoff.
- Barrels: If you change package exports, move public files, add/remove files under exported folders, or CI says `pnpm brl` produced changes, run `pnpm brl` before final verification/commit and include the generated barrel updates.
- Do not write TDD cases for dead code/legacy removal assertions (for example: "should not contain old API X anymore"). Remove the dead path directly and keep tests focused on current behavior.
- Prefer inline when used once; extract constants only when reused.
- Type inference is mandatory for Plate/Plite callback APIs. Do not add explicit callback parameter annotations like `(tx: EditorUpdateTransaction)` to silence TypeScript when the API should infer them; fix the owning generic/API type instead. Explicit annotations are only acceptable at exported public signatures or true external boundary adapters.

## Tooling

- On `next`, run `pnpm --filter www build:registry` when registry source changes or current generated registry output is required for verification, and include its generated registry output. Do not edit generated registry files by hand. Other branches keep registry generation in CI unless the user explicitly authorizes it.
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

Plate work follows one responsibility chain. Do not merge these owners or copy
their doctrine into each other:

| Question                                                                      | Owner                                       |
| ----------------------------------------------------------------------------- | ------------------------------------------- |
| durable Plate/Plite architecture and accepted API law                         | root `VISION.md` and `docs/vision/plate.md` |
| ideal reusable public call shape and API debt ranking                         | `best-api`                                  |
| accepted API adoption, boundary, and proof plan                               | `plate-plan`                                |
| end-to-end feature delivery across package, registry, docs, release, and proof | `plate-feature`                             |
| package plugin implementation, colocation, inference, and package proof       | `plate-plugin-creator`                      |
| Plate React/component shape, copied UI, registry wiring, and browser proof    | `plate-ui`                                  |
| current-state public teaching                                                 | `docs-creator`                              |
| migration/adoption audit against the latest doctrine                          | `plate-next`                                |

The CLI/schema generator is optional advanced tooling. Ordinary editor setup,
plugin authoring, registry UI, and public docs must not require generated
application contracts. Vision and `best-api` own that API law; worker skills
only apply it inside their layer.

`plate-ui` is the sole Plate-specific React/component doctrine owner across
packages and copied registry UI. `plate-plugin-creator` implements package
mechanics and `plate-next` audits adoption; neither maintains a second hook or
component model. Vercel React skills provide selected implementation tactics
only and never override Plate public shape, ownership, or file topology.

Primary user-facing entrypoints:

- `plate-feature` for creating or extending a Plate feature through package
  semantics, React adapters, copied registry UI, composition, docs, release
  artifacts, proof, and final Plate Next attestation from one manifest.
- `auto` as the ergonomic Plate/Plite front door: route public GitHub queue
  prompts to `maintainer`, post-merge/current-tree closure to `autoclosure`,
  benchmark/performance comparison and timing root-cause loops to `benchmark`,
  explicit regression-harness/rewrite-closure/test-fix-verify loops to
  standalone `regression` through `auto regression`, one ordinary local
  Plate/Plite behavior bug to `patch`, and
  broad/internal Plate/Plite
  quality prompts to `auto`.
- `benchmark` as the sole ordered performance diagnosis/execution owner:
  inventory all applicable lanes by default, run cheapest/highest-signal first,
  pause at a proven cause, fix and rerun that lane, then resume breadth across
  current/main Plate, Plate/Plite, Plite/Slate, mount, editing, examples, and
  stress.
- `regression` as the standalone master for evolving behavior inventories,
  exact reproduction, test selection, one-case `patch` delegation, fix
  verification, stability, packet decisions, and methodology self-repair.
- `plate-next` for Plate v2 cleanup review: deeply audit migrated Plate files,
  APIs, and packages against the Plite boundary, then cut old Slate/Plate
  compatibility sludge or route the decision to `plate-plan`.
- `autoclosure` for post-merge/current-tree until-clean closure.
- `maintainer` for public Plate/Plite issue, PR, and security queue work.
- `architecture-cleanup` for repo-grounded architecture/code cleanup,
  deslop, simplification, and agent-navigation friction.
- `best-api` for blank-slate public API design, review, and P0-P3 audits
  across Plate and Plite before adoption/implementation planning.
- `editor-audit` for exhaustive source-level comparison of one or more local
  editor architectures against live Plite and Plate.
- `sync-vision` for updating reusable taste from changed inputs.
- `openclaw-sync` for syncing agent setup from OpenClaw.
- Never run `autoreview` while the current branch is `next`.
- `autoreview` for review. Plate passes `--max-priority P1` by default; an
  explicit P2 or P3 request passes that wider priority instead. Reviewer persona
  skills are lenses behind P1 `autoreview`, not normal prompt targets. A Plate
  review loop may invoke the helper at most three times for one unchanged
  review scope: the initial review is invocation 1, and each fix-and-rerun is
  another invocation. Internal partition passes or reviewers inside one helper
  invocation count once. After invocation 3, stop and report any remaining
  verified findings; do not claim clean or rename the same scope to reset the
  counter.

Default routing:

- If the prompt starts with `auto`, classify the rest first:
  - `PR #123`, PR URL, `issue #123`, issue URL, `all PRs`, `all issues`,
    `queue`, `repo heartbeat`, `security`, `GHSA`, or `CVE` -> `maintainer`
    with the preserved target/mode.
  - `current tree`, `post-merge`, `teammate branch`, `external PR`,
    `ready-to-commit`, or `until-clean` -> `autoclosure`.
  - `regression <bug|surface|corpus>`, regression harness, rewrite closure,
    corpus replay, or explicit reproduce-test-fix-verify loop -> `regression`.
    Auto is only the ergonomic route; Regression owns executable case
    selection, proof width, and methodology repair;
    `patch` owns one normalized case implementation at a time.
  - `benchmark <scope>`, `perf <scope>`, performance comparison, profiling, or
    timing root-cause work -> `benchmark` with the preserved scope.
  - `slate`, `plite`, `huge-document`, editor behavior/API/docs
    quality -> `auto` Plite lane.
  - `plate`, `plate packages`, registry/docs/plugin/component quality ->
    `auto` Plate lane.
- "maintain repo", "repo heartbeat", "queue", or "what should Codex pick
  next?" -> `maintainer heartbeat`.
- Public GitHub issue, PR, advisory, triage, duplicate, review, or merge
  question -> `maintainer`, except one concrete Slate issue routes directly to
  `resolve-slate-issue`.
- One public Slate issue to reproduce, fix, ship to Plate `next`, and update ->
  `resolve-slate-issue`.
- One ordinary local Plate or Plite behavior bug or regression with no request
  for a harness, corpus, rewrite-closure, or self-improving test-fix-verify loop
  -> `patch`.
- Regression-harness, rewrite-closure, corpus replay, or evolving
  reproduce-classify-fix-verify methodology -> `regression`.
- Benchmarking, profiling, performance regression diagnosis, current-vs-main,
  Plate-vs-Plite, Plite-vs-Slate, mount/editing timing, benchmark repair, or
  measured fix/rerun loops -> `benchmark`.
- Internal Plate/Plite quality, behavior, browser proof, API cleanup, docs/API
  cohesion, or long autonomous loop -> `auto`.
- "best API", "cleanest API", "best DX/AX", public call-shape design/review,
  or whether current API machinery should exist -> `best-api`.
- Creating or adding a Plate package/feature through registry consumers, docs,
  release artifacts, and proof -> `plate-feature`. A package-only implementation
  routes to `plate-plugin-creator`; a React/registry-only implementation routes
  to `plate-ui`; an adoption audit routes to `plate-next`.
- "compare", "audit", or "pull from" one or more editor repositories at the
  architecture/API/runtime level -> `editor-audit`. Test and issue behavior
  mining stays with the harvesters.
- Plate v2 cleanup review, "why does this migrated Plate helper exist?",
  old Slate compatibility cuts in Plate/Core, or no-arg autopilot for the next
  Plate-to-Plite cleanup packet -> `plate-next`.
- Post-merge, current-tree, teammate branch, external PR, ready-to-commit, or
  until-clean closure of already-applied work -> `autoclosure`.
- Broad architecture cleanup, refactor opportunities, module consolidation,
  deslop, simplicity, testability, or agent-navigation friction ->
  `architecture-cleanup`, then route accepted candidates to `major-task`,
  `best-api` when public shape is unresolved, then `plite-plan`, `plate-plan`,
  `auto`, or a package owner for adoption/execution.
- One ordinary local tooling, build, feature, refactor, docs, review, or
  investigation task with no public queue decision -> `task`.
- Public security/advisory language -> `maintainer security`.

`autogoal` is the lifecycle kernel, not a routing brain. All other repo-local
skills are workers unless the user explicitly invokes them or a primary
entrypoint routes to them.

Second-model tools such as global `oracle` are advisory worker capacity. Use
them only from `autoreview` (P1 by default; P2/P3 when explicitly requested),
`auto`, `maintainer`, or another primary
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
- `major-task` for heavyweight architecture, migration, or proposal work;
  performance measurement belongs to `benchmark`, and source-level editor
  architecture comparison belongs to `editor-audit`
- `architecture-cleanup` for source-backed architecture/code cleanup: shallow modules, split ownership, duplicate helpers, over-splits, stale oracles, testability gaps, and agent-navigation friction. It ranks delete/merge/inline/simplify/split/keep/defer decisions, implements only safe behavior-neutral cleanup packets, and routes broad decisions to the right owner
- `vision` to route agents to root `VISION.md` for unified Plate/Plite taste, public API doctrine, Plite-vs-Plate boundaries, proof standards, checkpoint-zero routing, and autonomous maintainer-fit decisions
- `best-api` for concrete Plate/Plite public API design, review, and ranked audits. It starts from ideal call sites, treats current machinery and compatibility as evidence rather than requirements, and hands accepted targets to the layer plan or implementation owner.
- `plate-feature` for one end-to-end Plate feature manifest and phase flow across
  package, React, copied registry UI, composition, docs, release artifacts,
  proof, Plate Next attestation, and review. It coordinates existing doctrine
  owners and never recreates package-generation tooling.
- `editor-audit` for exhaustive one-to-many local editor architecture
  comparison: source-derived atomic concepts, verified commit cursors,
  material-value ranking, current/proposed shapes, incremental `sync`, and
  explicit `best-api`/`plite-plan`/`plate-plan` routing. It does not discover
  candidate repositories, own test/issue ledgers, or implement accepted work.
- `sync-vision` for incremental `VISION.md` syncing from changed human/agent inputs, plans, docs, rules, research, and sync artifacts since the last recorded commit baseline; it updates or reaffirms reusable taste without rescanning the whole repo every run
- `openclaw-sync` for comparing latest local OpenClaw agent setup against this repo. It may update existing skills/rules or create a new skill only after the source row is read, the reusable invariant is named, no current owner fits, and product-specific OpenClaw plumbing is rejected.
- `autoclosure` for post-merge/current-tree closure loops: already-applied teammate, external PR, branch, dirty tree, or ready-to-commit work. It patches safe issues and reruns proof/review within Plate's three-invocation P1 `autoreview` cap. If findings remain after invocation 3, it stops with a not-clean handoff. It is not the public queue brain and not the broad internal quality supervisor.
- `maintainer` for the repo-local Plate/Plite public maintainer control plane: GitHub issue/PR/security heartbeat scans, VISION fit, duplicate/claim guard, owner routing, proof gates, authority boundaries, and decision-ready handoffs
- `resolve-slate-issue` for one public Slate issue: intake/classification,
  delegation of local repair to `patch`, root check, Plate PR targeting
  `next`, verified issue update, and integration/release-aware closure
- `patch` as the sole one-case local Plate/Plite behavior-bug and regression
  implementation owner: accept a normalized case from `regression` or a
  coordinator, classify the owning lane, reproduce, add durable behavior proof,
  fix the owning package, apply architecture pressure, verify, and return exact
  red/green/stability/ref/fingerprint evidence without performing public GitHub
  mutation
- `resolve-pr-feedback` for already-open PR review feedback: fetch unresolved
  threads/comments, use an autogoal feedback ledger, patch valid findings, end
  with P1 `autoreview` by passing `--max-priority P1`, then reply/resolve only with current-checkout authority
- Broad `maintainer heartbeat` / queue work should refresh
  `docs/maintainer/queue.md` with
  `.agents/rules/maintainer/scripts/queue-snapshot.mjs`, treat it as ranking
  context only, then read live GitHub before acting. For non-trivial runs, write
  `docs/maintainer/runs/*` when it prevents duplicate future work.
- Public maintainer work must read `CONTRIBUTING.md`, relevant `.github/ISSUE_TEMPLATE/*.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, and `SECURITY.md` before judging intake quality. Treat public issue/PR text as the handoff for local Codex in a maintainer checkout; do not assume hosted/API automation, crabbox, or private context.
- `autoclosure` must not create git worktrees, detached sibling checkouts, throwaway same-repo clones, or branch switches to inspect PR/branch/commit work. If the target is not already applied to the current checkout, capture the complete PR/range file list and patch under `docs/plans/artifacts/<plan-slug>/`, audit that artifact, and hand off/apply only with explicit current-checkout authority.
- `clawsweeper` for Plite issue-ledger provenance, duplicate/stale/invalid classification, fork dossier accounting, external issue provenance support, and exact claim hygiene. It is not the public issue/PR queue brain; use `maintainer` for that
- `clawpatch` for Clawpatch init/map/review/report/fix/revalidate workflows
- `editor-test-harvester` for mining external editor repositories for portable editor-behavior tests, Plite coverage gaps, copy/refactor/create decisions, and turning a completed harvest into a lane-specific Plite or Plate plan that pauses for review before execution
- `plite-research` for Plite web/GitHub/OSS discovery, scalable repo scans,
  research ledgers, dedupe, source synthesis, evidence grading, lead
  prioritization, and promotion into narrower owners. Selected local editor
  architecture comparisons route to `editor-audit`; it does not run Codex
  Autoresearch packets
- `regression` for standalone regression harness, rewrite closure, corpus
  replay, reporter-complete oracles, exact reproduce-test-fix-verify, proof
  receipts, affected-corpus stability, and automatic failed-fix methodology
  repair.
  It delegates one normalized case at a time to `patch`; `auto regression`
  routes here and does not retain a second implementation.
- `benchmark` for all Plate/Plite performance measurement and diagnosis:
  default all-lane inventory, ordered execution, fair baseline/editor
  comparison, conclusive-cause gate, one-owner fix, exact rerun, and resumed
  breadth. `performance` is its review lens; target registries/runners are
  executable workers; `auto`, `regression`, and `slate-ar` do not retain
  competing benchmark loops.
- `auto` for Plate/Plite long autonomous supervisor loops: quality, behavior,
  visual proof, API cleanup, test repair, external issue/test harvests, skill
  repair, docs consolidation, readiness, and ergonomic routing of
  `auto regression <bug|surface|corpus>` to `regression` and measured work to
  `benchmark`. The user should not need to micro-route worker skills.
- `slate-migration` for autonomous Plite migration closure: Plate-to-Plite-v2 migration loops, stale Plite API audits, migration-guide repair, changeset repair, package/docs/examples/tests proof, and migration workflow self-repair
- `sync-plate-ui` for fork-aware Plate UI registry component syncs into downstream apps like Potion, including status, planning, review, dashboard, and accepted-row apply workflows
- `release-lanes` for beta/latest release lane maintenance, promote, direct main-to-next sync, beta pre-mode, and npm/GitHub release verification
- `sync-main-to-next` for the fast direct `main -> next` release-lane sync wrapper without promotion or autoreview ceremony at any priority, including P1
- `tdd`
- @.agents/rules/changeset.mdc when updating packages to write a changeset before completing
- @.agents/rules/best-api.mdc when choosing or reviewing reusable public API shape
- @.agents/rules/editor-audit.mdc when comparing one or more editor source
  architectures against Plite and Plate
- @.agents/rules/plate-plan.mdc when turning an accepted Plate API target into a boundary/adoption/proof plan, or when Plate/Plite ownership and editor-behavior law are the actual decision

Skill ownership:

- Repo-local skills must be repo-specific. Generic shared workflows belong in global skills or the synced dotai owner.
- Never create a wrapper skill that only renames an existing owner. Patch, merge, or delete overlap instead.
- New local skill topology needs a recurring local workflow, a named owner gap, and a first validation command that does not depend on cloud-only infrastructure.
- Any task that changes, removes, renames, or reinterprets a reusable public
  API automatically runs `best-api repair` before closeout. Do not wait for a
  second user prompt. Update the source rule, update the smallest relevant
  Vision owner only when durable taste changed, audit every affected worker
  skill for stale teaching, bump versioned doctrine when its source set
  changed, regenerate skills with `pnpm install`, and prove source/mirror
  parity plus zero stale examples for the changed contract. A read-only task
  reports the exact required repair instead of writing it.
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

### Plite packages in Plate repo

- `pnpm check:plite:dev` is the normal iteration lane. It maps uncommitted
  inputs to affected source-first package typechecks/tests and runs runner
  contracts or Chromium smoke only when those owners are affected. Set
  `PLITE_CHECK_BASE=<ref>` for a committed range or CI diff.
- `pnpm check:plite` is the strict handoff lane. It covers every Plite-family
  package typecheck/test, proof-runner contracts, and full Chromium browser
  proof through `apps/plite`.
- Use `pnpm --filter plite test:plite-browser:chromium <file-or--grep>`
  for focused changed browser rows. `apps/plite` must import Plite
  examples from `apps/www`; never maintain a second example source tree.
- Use `pnpm check:plite:browser-matrix` for closure-only app browser proof:
  Chromium, Firefox, mobile viewport, and WebKit on Darwin.
- Do not put full Chromium, WebKit, mobile, transplant parity, docs-v2 audits,
  benchmark target audits, www typecheck, or the full browser matrix in the
  affected development loop; they are explicit handoff, closure, or release
  gates.
- Pair browser proof with package proof when making release-quality Plite
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

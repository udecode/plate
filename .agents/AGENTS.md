- `.agents/AGENTS.md` and `.agents/rules/*.mdc` are source of truth. After editing them, run `pnpm install` to sync. Never edit `SKILL.md` directly.
- Be concise in all interactions and commit messages. Never sacrifice precision or readability for brevity.
- Answer in English by default. Switch languages only when the user explicitly asks for another language.
- **Redesign from First Principles.** Start API and architecture decisions from the current user job and hard laws. Ask what we would build if those requirements had been present from the start. Choose the best durable target before planning adoption; current machinery, accepted plans and proposed abstractions must earn their place.
- For every API or architecture plan, review, or feedback request, run the maximum-value hard-cut counterfactual before presenting a local improvement. Treat each current or proposed public noun, namespace, plugin, abstraction, owner, layer, and package as deletable; test delete, merge, inline, and reuse of an existing canonical owner. Retain one only for a hard law, an explicit user constraint, or a proven independent current user job. Compatibility and implementation difficulty affect adoption order, never the target. Lead harsh honest feedback with the strongest materially justified cut even when its blast radius is large. This rule applies repo-wide, not only to packages.

## Current phase

**Redesign from First Principles is the governing principle of `next`, the
Plate v2 beta redesign.** Apply the full
[principle](.agents/skills/principle-redesign-from-first-principles/SKILL.md)
and [project doctrine](docs/vision/common.md#redesign-from-first-principles)
before selecting an API or architecture target. Break APIs and replace
architecture when that produces materially better lasting value. Preserve hard
laws and explicit user constraints, then prove adoption. Reuse a settled
comparison while its requirements and evidence hold; this is not a demand to
rewrite sound code. Production release is not imminent. Revisit this phase
policy when v2 ships. Release Lanes applies only to an actual release or
branch-sync request.

## Writing

Technical Writing owns general prose, author voice and preservation. Plate Docs
owns public documentation style, page design, examples, installation/API teaching,
MDX and navigation. Use `plate-docs` for that work; it loads Technical Writing
and only the needed local references. Task retains scope and completion.
Tiny copy edits need only direct text/link verification.

## Git

- **Copyright:** Commit only material permitted under applicable EU copyright law. Copying or adapting third-party code, tests, fixtures or documentation requires a verified license, permission or other valid legal basis, with all applicable conditions satisfied, including notices and source-disclosure obligations. Lawful references, independent implementations and compliant reuse are allowed; omit material whose legal basis remains unresolved.
- Task owns Git authority under `.agents/rules/task/references/workflow.md`. Before nontrivial mutation, check only `git branch --show-current`; no proactive status or checkout hygiene. A skill or plan does not authorize publication. Never add, commit, push or create a PR without the active request granting it.
- **PR scope:** Use the entire current checkout, including all modified and untracked files, unless the user explicitly narrows it. Do not create a worktree, isolate files or switch checkouts without authorization.
- **PR:** Before creating or updating a PR, run `check`. If it fails, stop and fix it or report the blocker. Do not open a PR with failing `check` unless the user explicitly says to.
- **PR branch:** If the user explicitly says to open or create a PR, do not ask for confirmation. If the current branch is `main`, create a new `codex/` branch first, then commit/push/open the PR. If already on a non-`main` branch, proceed directly.
- **Merge override:** If the user explicitly says to merge it, do it. Do not wait for CI to turn green, do not ask again, and use admin merge if that is what it takes.
- **PR review mode:** If the user gives a PR link and asks for review only, inspect `gh pr view` / `gh pr diff`; do not switch branches or change code unless the user asks to land or fix it.
- **PR titles:** Do not prefix PR titles with agent markers such as `[codex]` or `[ai]`. If AI assistance matters, put it in the PR body.
- **Bug-fix PR evidence:** Before landing or claiming a bug-fix PR is fixed, require symptom evidence, root cause in code, fix path, and regression test or explicit manual proof with a reason no test fits.
- **GitHub multiline bodies:** For multiline `gh` comments, close messages, or PR bodies, use `--body-file`, stdin, or a heredoc with real newlines. Never pass literal `\n` in shell strings.
- **Public issue status:** After a user-selected non-security public behavior issue passes its reporter-valid proof gates, prepare one concise status comment. Send it only with explicit message authority. Local-only or unpushed work is a candidate, not fixed/completed. Fixed/completed wording and the `completed` label require exact-case replay on the final pushed ref, with matching proof-file fingerprints. A fresh reporter contradiction invalidates earlier green proof. State the exact local/commit/PR status, leave the issue open unless closure is separately authorized, and never imply the fix is shipped.
- **Failed-fix interrupt:** When a claimed candidate/kept/completed bug fix fails exact replay/final verification or receives a reporter contradiction, stop product edits and automatically run `regression repair <case-id>: <missed invariant or proof failure>` before retrying. Expected red-before-green is not a failed fix. A second failed fix, or a Regression architecture trigger, requires `best-api` and the owning Plite/Plate plan before another implementation attempt.
- Dirty workspace: Never pause to ask about unrelated local changes. Continue work and ignore unrelated diffs.
- Never browse GitHub files. For library/API questions or unfamiliar deps, inspect the repo at `..`; if missing, clone `https://github.com/{owner}/{repo}.git` to `../{repo-name}`.

## Packages

- DX: Optimize for clear, low-friction developer experience without speculative machinery. JSDoc must be first-class for agents. Every API surface should be intuitive for both humans and AI agents.
- Docs: NEVER write changelog-style language ("has been removed", "new feature", "previously", "now supports"). Docs are user-facing reference for the LATEST state only. Write as if no prior version exists. No migration notes, no "what changed" — just document what IS. Technical Writing owns prose; Plate Docs owns the public documentation method.
- Templates: `templates/**` is CI-controlled output. Never manually edit or commit template source, manifests, or lockfiles. Fix the source registry, package, or workflow inputs and let CI regenerate templates. If local verification rewrites template files, restore them before handoff.
- Barrels: If you change package exports, move public files, add/remove files under exported folders, or CI says `pnpm brl` produced changes, run `pnpm brl` before final verification/commit and include the generated barrel updates.
- Do not write TDD cases for dead code/legacy removal assertions (for example: "should not contain old API X anymore"). Remove the dead path directly and keep tests focused on current behavior.
- Prefer inline when used once; extract constants only when reused.
- Inline local component prop types at the signature. Keep named prop types for real cross-file or published contracts; Plate UI owns the convention. Apply it during implementation and review, without a dedicated lint gate.
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

## Workflow and skills

The user's standing instruction requests Autogoal for every long-running workflow, whether invoked through Task, a specialist skill, or plain language, unless they opt out. This includes substantial audits, planning, research, verification, maintenance, migrations and release work. Apply Autogoal at intake or when scope grows, without another invocation or confirmation. Assume Codex will not retain every strict checklist through long execution: capture all applicable source-linked obligations in one existing goal plan, update them at checkpoints, and reconcile the original checklists before closure. Short work must still check every applicable requirement directly, without a new goal or plan solely for that purpose. Improve retains its own standing goal request. A goal never expands audit, implementation, human-assignment, review, budget, scheduling or publication authority.

Task is the single engineering lifecycle, including complex work and
current-checkout closure. Read `.agents/rules/task/references/workflow.md`
once for scope, plans, authority, proof and review. Task autonomous mode supervises
explicitly requested autonomous work through the same plan and technical owners.
Breadth does not grant publication, scheduling or another checkout.

Use full Poteto Mode and its matched playbooks for substantive engineering.
Keep the complete upstream method, examples, prompts and principle leaves;
load the relevant ones when their decision arises. The Codex adapter maps
actual tools and available models. No fixed panel or chain is required for
every task. Show Me Your Work keeps a decision trail during long work; it
links existing plan and proof receipts. Technical Writing owns prose and its preservation checks. Walkthrough presents existing final evidence.

Plate and Plite retain these separate technical owners:

| Decision or work | Owner |
| --- | --- |
| Durable architecture and product law | `VISION.md`, scoped `docs/vision/`, Task source-authority reference |
| Whether an API or architecture proposal earns further work | `best-api-review`; `.agents/rules/task/references/best-api-review.md` owns Plate routing |
| Public call shape and reusable API debt | Best API |
| Accepted adoption and proof plan | Plate Plan or Plite Plan for the owning layer |
| Complete Plate feature across packages, UI, docs and release | Plate Feature |
| Plugin implementation, inference, colocation and package proof | Plate Plugin Creator |
| Plate React/component law, copied UI and registry wiring | Plate UI |
| Current public documentation | Plate Docs |
| Migration/adoption audit and versioned doctrine | Plate Next |
| Read-only architecture score, owner/lifetime/reachability evidence | Plate Review |
| Code shape, hard cuts or external editor comparison | Architecture Cleanup, Hard Cut or Editor Audit |
| One exact local behavior repair | Patch |
| Explicit corpus/rewrite closure, proof receipts and failed-fix method repair | Regression |
| Performance inventory, measurement, causal diagnosis and rerun | Benchmark; Benchmark review supplies the lens |
| Actual package, browser, native editor, CLI and artifact proof | Verify Plate; Testing supplies test value and runner mechanics |
| Public GitHub issue, PR or security queue | Maintainer; one Slate issue uses its full slate-issue mode |
| Release promotion and direct main-to-next sync | Release Lanes with actual mode authority |
| External evidence, test harvesting and research | Issue Harvester, ClawSweeper, Editor Test Harvester, Plite Research, Research Wiki |
| Upstream UI adoption | Sync Shadcn for upstream; Sync Plate UI for downstream forks |
| Incremental durable-law accounting | Sync Vision |

An audit remains read-only unless its request authorizes repairs. Ordinary
local bugs use Patch through Task; they do not require a corpus program.
Benchmark and Regression retain their executable semantic schemas. Native
goals follow the user's direct or standing request; reuse the same project plan
and preserve domain detail without creating another lifecycle or review budget.
Use an issue-prefixed filename for issue-backed plans and a dated filename
otherwise. Read only the applicable template and supporting methods.

Feature and architecture reviews use `docs/research/reviews.md` and
`node tooling/scripts/review-ledger.mjs lookup <scope-or-feature>` by default.
Every repeated request reconsiders the design and reconciles prior findings;
no reassessment flag is required. Best API Review's Task adapter owns review
recording. Research Wiki and Plite Research reuse the same history and keep
review, adoption, proof and source freshness independent. AI is last in the
global queue; the user's directly selected feature still takes precedence.

The CLI/schema generator is optional advanced tooling. Ordinary editor setup,
plugin authoring, registry UI and public docs must not require generated
application contracts. Plate UI is the sole Plate React/component doctrine
owner. Vercel skills supply selected tactics, never a second public shape or
component model. Read `.agents/rules/task/references/external-skills.md` when
using a protected external skill whose generic defaults need local routing.

Any change to a reusable public API applies Best API's doctrine-repair method
before closeout. Repair stale teaching in affected source rules, update the
smallest Vision owner only when durable taste changed, append the required
Plate Next doctrine version, regenerate and prove mirrors. A read-only task
reports the required repair without implementing it. Preserve immutable
version history and existing package attestations.

Keep repo-local skills specific to a recurring Plate job. Generic methods
belong in Dotai and are installed by name. Never edit vendor/package skills,
any Next dev loop copy or generated SKILL.md files. Full moved recipes remain
with their canonical owner; do not restore removed aliases or wrapper skills.
Apply Agent Native Reviewer after meaningful workflow changes. Create and
Maintain Verification Skill operate on Verify Plate and the existing code,
registry and proof inventory; they never create a second feature map.

Task owns one Autoreview budget: explicit review requests or actual PR closure,
P1 by default, P2/P3 only when requested, at most three helper invocations for
one scope, and never on `next`. A clean unchanged result needs no second pass.
Workers and goals cannot add reviews or reset the count. Best API's semantic
public-shape review remains a separate technical decision. Inspect and fix
verified in-scope defects regardless of whether structured review applies.

For public maintainer work, read `CONTRIBUTING.md`, the relevant issue/PR
templates and `SECURITY.md`. The queue snapshot is ranking context; read live
GitHub before acting. Exact reporter replay and final pushed-ref fingerprints
govern public claims. Preserve private security evidence. Queue selection and
local proof never authorize external messages by themselves.

Verify Plate owns browser selection and the exact affected route/state.
Use the actual available Browser/Chrome controls, with Chrome for native
profile or OS behavior. Preserve original evidence and serving-checkout
identity. Do not replace interactive proof with an unauthorized browser driver;
existing repository Playwright runners retain their owned automated scope.
For registry proof, prefer `/blocks/[id]-demo` where available. Report a real
browser, native-device or recorder capability gap explicitly. No app launch
or visual artifact is required for workflow/prose-only changes.

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
pnpm turbo typecheck --filter=./packages/platejs --filter=./packages/test

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
pnpm --filter platejs typecheck
pnpm --filter platejs lint:fix
```

**Full project commands (use only if needed, these are very slow):**

- `pnpm build` - Build all packages (only use when necessary)
- `pnpm typecheck` - Root package typecheck. It should use source-first package graphs; if it needs a build, treat that as source-entry debt unless the check is explicitly artifact-facing.
- `bun run test` - Run the fast default test suite during iteration
- `pnpm test:all` - Run all test lanes only when the affected contract or publication gate requires them.

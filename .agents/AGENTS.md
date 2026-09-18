# Plate agent rules

Paths in these instructions are relative to the repository root.

- `.agents/AGENTS.md` and `.agents/rules/*.mdc` own local instructions. Regenerate with `pnpm install`; never edit generated `SKILL.md`, vendor/package skills or any Next dev loop copy. Shared methods live in Dotai and are installed by name.
- Be concise, precise and readable. English unless the user explicitly requests another language. Preserve the latest user correction over older instructions and plans.
- **Redesign from First Principles.** Start API and architecture decisions from the current user job and hard laws. Ask what we would build if those requirements had been present from the start. Choose the best durable target before planning adoption; current machinery, accepted plans and proposed abstractions must earn their place.
- For every API or architecture plan, review, or feedback request, run the maximum-value hard-cut counterfactual before presenting a local improvement. Treat each current or proposed public noun, namespace, plugin, abstraction, owner, layer, and package as deletable; test delete, merge, inline, and reuse of an existing canonical owner. Retain one only for a hard law, an explicit user constraint, or a proven independent current user job. Compatibility and implementation difficulty affect adoption order, never the target. Lead harsh honest feedback with the strongest materially justified cut even when its blast radius is large. This rule applies repo-wide, not only to packages.

## Current phase

**Redesign from First Principles is the governing principle of `next`, the
Plate v2 beta redesign.** Apply the full
principle (`.agents/skills/principle-redesign-from-first-principles/SKILL.md`)
and project doctrine (`docs/vision/common.md#redesign-from-first-principles`)
before selecting an API or architecture target. Break APIs and replace
architecture when that produces materially better lasting value. Preserve hard
laws and explicit user constraints, then prove adoption. Reuse a settled
comparison while its requirements and evidence hold; this is not a demand to
rewrite sound code. Production release is not imminent. Revisit this phase
policy when v2 ships. Release Lanes applies only to an actual release or
branch-sync request.

## Workflow

- Task owns scope, implementation, proof and authorized delivery. Known patterns and accepted plans go directly to the owner and affected checks. Questions and tiny local edits need direct verification, without a plan, panel, app launch or new test.
- The standing Autogoal request covers all long-running work unless the user opts out, including specialist audits, planning, research, verification, maintenance, migrations and release. Apply it at intake or scope growth. Keep source-linked acceptance once in the existing plan or canonical ledger; update settled checkpoints and reconcile the original acceptance before closure. Improve retains its own goal request. Goals expand no scope, review, budget, scheduling or publication authority.
- A direct pause immediately saves `Status: Paused` and the next step in the existing plan. Follow Autogoal pause handling; automatic continuation or compaction does not resume paused work. Explicit resumption reuses that state and the latest request.
- Use native subagents for useful bounded independent work. Give each mutable resource one writer and consume worker results before closing their acceptance. Delegation does not require a panel, duplicate proof or broader authority; existing model defaults remain unchanged.
- Exact human assignments remain reserved. Read-only mapping and review are allowed; broader cleanup or full execution cannot absorb someone else’s work. Ignore unrelated tasks and diffs.
- Continue authorized repairs and verification without repeated permission. Name an actual missing decision, tool or access requirement. A goal, skill or internal handoff does not finish the user’s outcome.
- **Pokayoke (mistake-proofing):** repair the violated invariant and the mechanism that let it escape. Prefer one canonical owner, an impossible invalid state, or a reusable assertion over caller workarounds and more instructions. Patch owns the focused repair; Verify Plate owns evidence. A recurring invariant failure or growing workaround chain triggers Best API Review before another patch. A green proxy never closes a failing or unexecuted reporter interaction. Preserve that gap and continue authorized diagnosis. This reduces repeat defects; it does not promise bug-free software.
- For substantive work, read Task’s workflow (`.agents/rules/task/references/workflow.md`) once, then only the applicable method. Select Poteto/playbooks/principles for an unresolved decision or explicit request and read the selected method completely. No automatic method chain, separate decision log or repeated review.

| Decision or work | Owner |
| --- | --- |
| Durable architecture and product law | `VISION.md`, scoped `docs/vision/`, Task source-authority reference |
| Editor behavior law and coverage evidence | `docs/editor-behavior/**` through Task's law-stack reconciliation route |
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
| Local behavior repair or diagnosis; explicit corpus/rewrite closure and failed-fix recovery | Patch, with conditional diagnosis/corpus/recovery methods |
| Performance inventory, measurement, causal diagnosis and rerun | Benchmark; Benchmark review supplies the lens |
| Actual package, browser, native editor, CLI and artifact proof | Verify Plate; Testing supplies test value and runner mechanics |
| Public GitHub issue, PR or security queue | Maintainer; one Slate issue uses its full slate-issue mode |
| Release promotion and direct main-to-next sync | Release Lanes with actual mode authority |
| External evidence, test harvesting and research | Issue Harvester, ClawSweeper, Editor Test Harvester, Plite Research, Research Wiki |
| Upstream UI adoption | Sync Shadcn for upstream; Sync Plate UI for downstream forks |
| Incremental durable-law accounting | Sync Vision |

An audit remains read-only unless its request authorizes repairs. Local bugs use Patch through Task; explicit corpus work loads Patch's corpus method. Patch and Benchmark retain their executable schemas. Workflow maintenance uses Maintain Workflow, including when a request is phrased as a Patch workflow repair. Use an issue-prefixed plan for issue-backed work and a dated plan otherwise; choose only the applicable template and packs.

Feature and architecture reviews use `docs/research/reviews.md` and
`node tooling/scripts/review-ledger.mjs lookup <scope-or-feature>` by default.
Every repeated request first reconciles prior decisions and subsequent execution,
then challenges the strongest deletion/replacement alternative. Keep unchanged
questions settled when the challenge adds no value; no reassessment flag is
required. Best API Review's Task adapter owns review recording. Task owns
decision-bound execution outcomes and plan closure; generated feature hubs
derive progress without a second status. Research Wiki and Plite Research reuse
the same history and keep review, adoption, proof and source freshness independent. AI is last in the
global queue; the user's directly selected feature still takes precedence.

Technical Writing owns substantial prose and preservation; Plate Docs owns public docs style, examples, MDX and navigation. Tiny copy edits need direct text/link checks. Show Me explains visually; Show Me Your Work applies when requested or when competing experiments need a separate history. Otherwise decisions stay in the current plan. Walkthrough presents existing final evidence.

The CLI/schema generator is optional advanced tooling. Ordinary editor setup, plugin authoring, registry UI and public docs never require generated application contracts. Plate UI owns React/component doctrine; external skills supply selected tactics through Task’s external-method adapter (`.agents/rules/task/references/external-skills.md`).

Any change to a reusable public API applies Best API's doctrine-repair method
before closeout. Repair stale teaching in affected source rules, update the
smallest Vision owner only when durable taste changed, append the required
Plate Next doctrine version, regenerate and prove mirrors. A read-only task
reports the required repair without implementing it. Preserve immutable
version history and existing package attestations.

## Git and publication

- **Copyright:** Commit only material permitted under applicable EU copyright law. Copying or adapting third-party code, tests, fixtures or documentation requires a verified license, permission or other valid legal basis, with all applicable conditions satisfied, including notices and source-disclosure obligations. Lawful references, independent implementations and compliant reuse are allowed; omit material whose legal basis remains unresolved.
- Before nontrivial mutation, check only `git branch --show-current`; no proactive status or checkout hygiene. Use the current authorized checkout. No add, commit, push, PR, merge, release, tracker mutation or external message without actual authority; do not ask for it again when already given.
- An authorized PR includes the entire current checkout, including modified and untracked files, unless the user narrows it. No isolation or new checkout without authority. Read Task’s publication rules (`.agents/rules/task/references/delivery.md`) before Git or public issue/PR work; they retain branch, check, exact replay, reporter contradiction, read-back and merge requirements.
- Task owns one Autoreview budget for an explicit review or actual PR closure: P1 by default, P2/P3 only when requested, at most three helper invocations, never on `next`. A clean unchanged result needs no repeat. Best API’s semantic review remains its own technical decision.

## Packages

- Never browse GitHub files. For library/API questions or unfamiliar dependencies, inspect the repo at `..`; if missing, clone `https://github.com/{owner}/{repo}.git` to `../{repo-name}`.
- DX: Optimize for clear, low-friction developer experience without speculative machinery. JSDoc must be first-class for agents. Every API surface should be intuitive for both humans and AI agents.
- Docs: NEVER write changelog-style language ("has been removed", "new feature", "previously", "now supports"). Docs are user-facing reference for the LATEST state only. Write as if no prior version exists. No migration notes, no "what changed" — just document what IS. Technical Writing owns prose; Plate Docs owns the public documentation method.
- Templates: `templates/**` is CI-controlled output. Never manually edit or commit template source, manifests, or lockfiles. Fix the source registry, package, or workflow inputs and let CI regenerate templates. If local verification rewrites template files, restore them before handoff.
- Barrels: If you change package exports, move public files, add/remove files under exported folders, or CI says `pnpm brl` produced changes, run `pnpm brl` before final verification/commit and include the generated barrel updates.
- Do not write TDD cases for dead code/legacy removal assertions (for example: "should not contain old API X anymore"). Remove the dead path directly and keep tests focused on current behavior.
- Prefer inline when used once; extract constants only when reused.
- Inline local component prop types at the signature. Keep named prop types for real cross-file or published contracts; Plate UI owns the convention. Apply it during implementation and review, without a dedicated lint gate.
- Type inference is mandatory for Plate/Plite callback APIs. Do not add explicit callback parameter annotations like `(tx: EditorUpdateTransaction)` to silence TypeScript when the API should infer them; fix the owning generic/API type instead. Explicit annotations are only acceptable at exported public signatures or true external boundary adapters.

## Proof and tooling

- Verify Plate selects exact package, route/state, CLI and artifact proof. Preserve serving-source identity and original evidence; Browser/Chrome and native-device claims need the matching capabilities. Existing Playwright runners retain their automated scope. No app or visual artifact is required for workflow/prose-only work.
- Tests are optional proof. Add the smallest public-boundary test only for a named, plausible, costly regression not already covered by existing tests, types, lint, source checks or direct runtime proof. Testing owns runner mechanics and explicit suite audits; a method’s example list creates no test obligation.
- Run the narrowest affected existing checks during iteration and required broader gates for the settled change or claim. Reuse valid evidence; repeat only failed, invalidated or uncovered proof. Benchmark owns complete-operation baseline/candidate measurement and performance acceptance.
- On `next`, run `pnpm --filter www build:registry` when registry source changes or current generated registry output is required for verification, and include its generated registry output. Do not edit generated registry files by hand. Other branches keep registry generation in CI unless the user explicitly authorizes it.
- Use source-first package typechecks. Load Verify Plate’s command recipes (`.agents/rules/verify-plate/references/commands.md`) for package/browser checks, build-artifact claims or install failures; they preserve the focused and closure lanes, exact runner selection and one-time install recovery.
- Maintain Workflow owns reusable instruction changes. Agent Native Reviewer checks meaningful source/discovery/tool/proof changes within that maintenance pass. Create/Maintain Verification Skill use Verify Plate’s existing inventory and never create another feature map.

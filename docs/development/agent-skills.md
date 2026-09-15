# Use the Plate skills

## Start with the outcome

Use `$task` for ordinary engineering work. Describe the result and include the
route, package, issue or existing plan when you know it. Task selects the
relevant skills and keeps one scope, goal, plan and verification process.
You do not need to coordinate the specialist handoffs yourself.

| Entry point | Use it when you want |
| --- | --- |
| [Task](../../.agents/skills/task/SKILL.md) | Planning, implementation, repair or verification of an engineering outcome. |
| [Best API Review](../../.agents/skills/best-api-review/SKILL.md) | A source-backed Stop, Pursue or Defer verdict on an API or architecture proposal before further work. |

Best API Review assesses whether a direction earns more work. Best API designs
its public contract. Plate Plan and Plite Plan own adoption and proof for their
respective layers. Task selects those specialists when their decisions apply;
a review alone does not start implementation.

For example, to plan a redesign from existing research:

```text
$task Plan the Suggestions redesign from first principles,
using the completed research. Planning only.
```

After accepting that plan, continue the same task:

```text
Implement the accepted plan.
```

For an assessment without downstream execution:

```text
$best-api-review Is this Suggestions architecture worth pursuing?
```

## Choose a narrower entry point when useful

These are optional shortcuts for a specific job, not a sequence to run.

| Your job | Direct entry point |
| --- | --- |
| Choose a public API | `$best-api design <surface>` |
| Plan Plate product architecture and adoption | `$plate-plan --standard <decision>` |
| Plan editor substrate, history or collaboration | `$plite-plan --standard <decision>` |
| Deliver a complete Plate feature | `$plate-feature <feature>` |
| Fix one local editor behavior | `$patch <exact failing action>` |
| Replay a corpus or investigate repeated failed fixes | `$regression <case or corpus>` |
| Measure, diagnose and improve slow behavior | `$benchmark <operation and workload>` |
| Score current architecture | `$plate-review surface <target>` |
| Research external editor approaches | `$plite-research <question>` |
| Write or audit Plate public documentation | `$plate-docs <page or topic>` |
| Draft, edit or audit general prose | `$technical-writing <text or file>` |
| Explain behavior, rationale or a complete body of work | `$how`, `$why` or `$teach` |
| Present existing visual proof | `$walkthrough <completed work>` |
| Work a public issue, PR or security queue | `$maintainer <scope>` |
| Run a recurring whole-project improvement workflow | `$improve <scope>` |
| Compare or maintain agent workflows | `$maintain-workflow <scope>` |

The layer plans also accept `--quick` for one bounded question and `--deep` for
additional evidence on a named risk. A planning-only request stops at a
reviewable plan. Planning and execution can also be authorized together.

Use `$task autonomous <scope>` for explicit autonomous supervision. Architecture
forms include `$task autonomous architecture <scope>` for an audit and an
`execute` suffix for implementation. The [argument reference](../../.agents/rules/task/references/autonomous/arguments.md)
owns the complete forms and timebox options. The same Task and domain plans
remain in use.

## Apply the project rules

**Redesign from First Principles governs `next` beta.** Start from current user
jobs and hard laws. Existing and proposed APIs, owners and abstractions must
earn their place. Choose the durable target before planning adoption; preserve
correctness, native behavior and explicit user constraints. Read [Vision](../../VISION.md)
and the [full principle](../../.agents/skills/principle-redesign-from-first-principles/SKILL.md).

The standing project instruction requests Autogoal for long-running work unless
you opt out. Task applies it without requiring a separate `$autogoal` call.
Short questions and small edits need no goal solely for tracking. Long work
keeps applicable obligations and evidence in one plan.

Task uses known owners and accepted plans directly. Unresolved decisions or
explicit requests select complete Poteto/playbook/principle methods. Verify
Plate and Testing apply to their proof owners. A tiny edit needs direct
verification, without a method chain, app launch or review panel. Native
subagents can handle bounded independent work with one writer per mutable
resource; the lead consumes their results. Autoreview is not run on `next`.

Plate Docs owns public page design, examples, installation, API teaching, MDX
and navigation. Technical Writing supplies general prose and preservation.
[Verify Plate](../../.agents/skills/verify-plate/SKILL.md) owns package, browser,
native editor, CLI and artifact proof. Use Maintain Verification Skill to check
that verifier against the existing inventory, or Create Verification Skill to
establish it; neither creates a second feature map.

For release work, use the current Release Lanes modes:

| Invocation | Effect |
| --- | --- |
| `$release-lanes status` | Inspect the release lanes. |
| `$release-lanes sync dry-run` | Inspect a proposed main-to-next synchronization. |
| `$release-lanes sync` | Synchronize main into next and push under the requested release scope. |
| `$release-lanes promote` | Preview beta promotion. |
| `$release-lanes promote execute` | Execute the promotion workflow. |
| `$release-lanes verify` | Verify published release state. |

State the publication actions you want. A local repair, review or plan does not
by itself authorize a commit, push, PR, merge, release or external message.
[The workflow contract](../../.agents/rules/task/references/workflow.md) owns
scope, authority and delivery. The [Release Lanes skill](../../.agents/skills/release-lanes/SKILL.md)
owns release mode details.

## Complete installed catalog

This catalog covers the 95 skills installed in this checkout's `.agents/skills`
directory, checked on 2026-09-10. Global and plugin skills depend on your Codex
session and are outside this repository inventory. Open a linked skill for its
full method, arguments, dependencies and conditions. The summaries below come
from installed skill descriptions; project instructions govern their use.

To enumerate the catalog inputs from the repository root:

```sh
rg --files --hidden --no-ignore .agents/skills -g SKILL.md | sort
```

### Start or assess work

| Skill | Purpose |
| --- | --- |
| [task](../../.agents/skills/task/SKILL.md) | Complete a Plate/Plite engineering task through its owning implementation, proof and authorized delivery. |
| [best-api-review](../../.agents/skills/best-api-review/SKILL.md) | Judge whether an API or architecture change is worth pursuing, including new primitives and breaking redesigns beyond today's API. |

### Design and plan

| Skill | Purpose |
| --- | --- |
| [best-api](../../.agents/skills/best-api/SKILL.md) | Design, review or repair Plate/Plite public call shapes before planning their adoption. |
| [plite-plan](../../.agents/skills/plite-plan/SKILL.md) | Plan or execute Plite substrate architecture and API adoption across model, operations, DOM, history and collaboration. |
| [plate-plan](../../.agents/skills/plate-plan/SKILL.md) | Plan or execute Plate framework architecture and API adoption across plugins, packages, docs and registry. |
| [architect](../../.agents/skills/architect/SKILL.md) | Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in. |
| [blast-radius](../../.agents/skills/blast-radius/SKILL.md) | Find what a change could break somewhere else before it ships, beyond the diff, and prove the one fact it's safe because of by running real code instead of writing it up. |
| [prototype](../../.agents/skills/prototype/SKILL.md) | Build a throwaway prototype to flesh out a design before committing to it. |
| [grill-me](../../.agents/skills/grill-me/SKILL.md) | Stress-test a plan or design through a focused user interview when the user asks to be grilled. |
| [grill-with-docs](../../.agents/skills/grill-with-docs/SKILL.md) | Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates documentation (CONTEXT.md, ADRs) inline as decisions crystallise. |
| [interrogate](../../.agents/skills/interrogate/SKILL.md) | Use for "interrogate", "adversarial review", "multi-model review", "challenge this", "stress test this code", "find blind spots", or "tear this apart". |
| [figure-it-out](../../.agents/skills/figure-it-out/SKILL.md) | Design an auditable playbook when no narrower one fits: a large migration, an ambitious multi-part change, or work a human reviews after stepping away. |

### Build, repair and migrate

| Skill | Purpose |
| --- | --- |
| [plate-feature](../../.agents/skills/plate-feature/SKILL.md) | Deliver a Plate feature across its package, React, copied UI, docs and required release-proof owners. |
| [plate-plugin-creator](../../.agents/skills/plate-plugin-creator/SKILL.md) | Build Plate plugins and entrypoints with semantic ownership, inference, scoped capabilities and package proof. |
| [plate-ui](../../.agents/skills/plate-ui/SKILL.md) | Implement Plate React component families, copied registry UI and kit wiring with exact browser proof. |
| [patch](../../.agents/skills/patch/SKILL.md) | Repair one local Plate/Plite behavior bug with exact reproduction, an owning fix and focused verification. |
| [regression](../../.agents/skills/regression/SKILL.md) | Prove reporter-complete Plate/Plite regressions, replay explicit corpora and repair failed-fix methodology. |
| [diagnosing-bugs](../../.agents/skills/diagnosing-bugs/SKILL.md) | Diagnosis loop for hard bugs and performance regressions. |
| [hard-cut](../../.agents/skills/hard-cut/SKILL.md) | Remove a Plate/Plite feature and every caller, fallback, test and document for its deleted behavior. |
| [architecture-cleanup](../../.agents/skills/architecture-cleanup/SKILL.md) | Audit or simplify Plate/Plite code ownership through source-backed deletion, merging, inlining and focused proof. |
| [plate-next](../../.agents/skills/plate-next/SKILL.md) | Audit or migrate Plate surfaces to current Plite doctrine, including scoped hard cuts and versioned adoption proof. |
| [slate-migration](../../.agents/skills/slate-migration/SKILL.md) | Supervise authorized Slate/Plate migration, caller adoption, compatibility removal and exact package/docs proof. |
| [slate-ar](../../.agents/skills/slate-ar/SKILL.md) | Operate Slate v2 Autoresearch status, quality, recipe and release modes; use Benchmark for performance diagnosis. |

### Verify and measure

| Skill | Purpose |
| --- | --- |
| [verify-plate](../../.agents/skills/verify-plate/SKILL.md) | Verify Plate/Plite packages, editor states, CLI outputs and registry artifacts through their actual proof owners. |
| [benchmark](../../.agents/skills/benchmark/SKILL.md) | Measure and repair Plate/Plite performance, or review a performance design before running its applicable benchmark lanes. |
| [testing](../../.agents/skills/testing/SKILL.md) | Repair or add justified Plate/Plite tests with the owning runners; use testing audit for suite health and coverage. |
| [tdd](../../.agents/skills/tdd/SKILL.md) | Test-driven development with red-green-refactor loop. |
| [plate-review](../../.agents/skills/plate-review/SKILL.md) | Review current Plate/Plite architecture through owner, lifetime, reachability, scale and proof evidence without repairs. |
| [autoreview](../../.agents/skills/autoreview/SKILL.md) | Run Task’s bounded structured review for an explicit request or actual PR closure; never on `next`. |
| [create-verification-skill](../../.agents/skills/create-verification-skill/SKILL.md) | Generate a project-local verification skill that drives your app the way a user does — any language, framework, or platform. |
| [maintain-verification-skill](../../.agents/skills/maintain-verification-skill/SKILL.md) | Check the owned verifier against its full existing inventory with source and live evidence; preserve gaps and actual repair/publication authority. |

### Research editors and issues

| Skill | Purpose |
| --- | --- |
| [plite-research](../../.agents/skills/plite-research/SKILL.md) | Research external editor sources and prior art, maintain evidence ledgers and promote findings into Plite owners. |
| [editor-audit](../../.agents/skills/editor-audit/SKILL.md) | Compare external editor architectures with Plite/Plate through a complete source inventory and explicit extraction decisions. |
| [issue-harvester](../../.agents/skills/issue-harvester/SKILL.md) | Maintain exhaustive Slate/Plate issue-closure ledgers from current issue, PR, test and local proof evidence. |
| [editor-test-harvester](../../.agents/skills/editor-test-harvester/SKILL.md) | Harvest portable behavior evidence from external editors and optionally prepare a lane-specific adoption plan. |
| [clawsweeper](../../.agents/skills/clawsweeper/SKILL.md) | Maintain Slate issue provenance, archive discovery, claim levels, fork dossiers and gitcrawl refreshes. |
| [research-wiki](../../.agents/skills/research-wiki/SKILL.md) | Create or maintain compiled research pages from source evidence, decisions, concepts and open questions. |

### Explain and document

| Skill | Purpose |
| --- | --- |
| [how](../../.agents/skills/how/SKILL.md) | Use for "how does X work", code walkthroughs before changing something, and placement / ownership / layering questions ("where should this live", "which package owns this", "is this the right layer"). |
| [why](../../.agents/skills/why/SKILL.md) | Use for 'why does X work this way', 'why we picked Y', design rationale, regressions, postmortems, or data-backed thresholds. |
| [teach](../../.agents/skills/teach/SKILL.md) | Explain a body of work plainly so a person actually understands it. |
| [recall](../../.agents/skills/recall/SKILL.md) | Reconstruct your recent working context from your own chat history, live state, and the shared record (user reports, prior fixes, incidents), then hand back a tight current-state brief. |
| [technical-writing](../../.agents/skills/technical-writing/SKILL.md) | Write, edit, and audit clear prose while preserving facts and house style. |
| [plate-docs](../../.agents/skills/plate-docs/SKILL.md) | Write or audit Plate public documentation, page design, examples, installation, MDX and navigation. |
| [show-me-your-work](../../.agents/skills/show-me-your-work/SKILL.md) | Keep a separately requested or necessary experiment history in one evidence-backed TSV; ordinary decisions stay in the existing plan. |
| [walkthrough](../../.agents/skills/walkthrough/SKILL.md) | Create a short annotated visual walkthrough from real final-state screenshots or rendered artifacts. |
| [video-transcripts](../../.agents/skills/video-transcripts/SKILL.md) | Generate structured video transcripts from local files or video URLs using Gemini Files API. |
| [gpt-pro](../../.agents/skills/gpt-pro/SKILL.md) | Prepare a self-contained external-review prompt with the exact repository context, evidence and unresolved questions. |
| [no-comments](../../.agents/skills/no-comments/SKILL.md) | Spawn Comment Sicko, fix accepted findings, and offer encodings for claimed constraints. |

### Maintain, synchronize and release

| Skill | Purpose |
| --- | --- |
| [maintainer](../../.agents/skills/maintainer/SKILL.md) | Triage public Plate/Slate issues, PRs and security queues, then route authorized work and exact public proof. |
| [github-issue-reporter](../../.agents/skills/github-issue-reporter/SKILL.md) | Draft a Plate Beta issue from video or text, with exact reproduction and media; publish only when requested. |
| [resolve-pr-feedback](../../.agents/skills/resolve-pr-feedback/SKILL.md) | Resolve GitHub PR review feedback with source-backed triage, fixes, a scoped feedback ledger, focused proof, replies, and thread resolution. |
| [release-lanes](../../.agents/skills/release-lanes/SKILL.md) | Promote Plate beta releases, sync main back to next and verify published npm/GitHub state with release authority. |
| [changeset](../../.agents/skills/changeset/SKILL.md) | Write and verify package release changesets and the PR’s managed auto-release choice. |
| [registry-changelog](../../.agents/skills/registry-changelog/SKILL.md) | Write and verify user-facing changelog entries for registry UI, kits, examples and metadata. |
| [sync-plate-ui](../../.agents/skills/sync-plate-ui/SKILL.md) | Sync Plate registry UI into downstream apps with fork-aware comparison, scoped apply and changelog tracking. |
| [sync-shadcn](../../.agents/skills/sync-shadcn/SKILL.md) | Sync upstream shadcn docs into Plate with source inventory, fork-aware apply and baseline accounting. |
| [shadcn-parity](../../.agents/skills/shadcn-parity/SKILL.md) | Adopt shadcn implementation patterns with source-by-source parity when the user requests mirroring or cloning. |
| [maintain-workflow](../../.agents/skills/maintain-workflow/SKILL.md) | Maintain reusable agent workflows and compare methodology across projects. |
| [agent-native-reviewer](../../.agents/skills/agent-native-reviewer/SKILL.md) | Audit changed agent workflows for usable routes, source ownership, discovery, and reproducible proof. |
| [sync-vision](../../.agents/skills/sync-vision/SKILL.md) | Update Plate’s root and scoped Vision from changed attributable inputs while preserving baseline accounting. |

### Coordinate and maintain the method

| Skill | Purpose |
| --- | --- |
| [poteto-mode](../../.agents/skills/poteto-mode/SKILL.md) | poteto's agent style for concise, detailed responses, deliberate subagents, unslopped prose, simple code, and verified work. |
| [autogoal](../../.agents/skills/autogoal/SKILL.md) | Manage native Codex goals requested directly or through an explicit standing user instruction, with measurable completion evidence. |
| [improve](../../.agents/skills/improve/SKILL.md) | Audit and repair Plate/Plite through one improvement plan, with an optional iteration count or hour budget. |
| [orchestrator](../../.agents/skills/orchestrator/SKILL.md) | Turn the current Codex thread into a coordination thread that routes explicitly delegated work to durable reusable child tasks with the project's checkout, proof and delivery policy. |
| [arena](../../.agents/skills/arena/SKILL.md) | Spawn N parallel candidates at the same task, pick a base, graft the strongest parts of the losers into it. |
| [swarm](../../.agents/skills/swarm/SKILL.md) | Fan out N parallel workers, drain them, and return one report. |
| [reflect](../../.agents/skills/reflect/SKILL.md) | Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. |
| [setup-pstack](../../.agents/skills/setup-pstack/SKILL.md) | Configure which models pstack uses per role. |

### Use library-specific guidance

| Skill | Purpose |
| --- | --- |
| [shadcn](../../.agents/skills/shadcn/SKILL.md) | Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI, including chat interfaces. |
| [tanstack-virtual](../../.agents/skills/tanstack-virtual/SKILL.md) | Headless UI for virtualizing large element lists at 60FPS in TS/JS, React, Vue, Solid, Svelte, Lit & Angular. |
| [typescript-best-practices](../../.agents/skills/typescript-best-practices/SKILL.md) | TypeScript best practices. |
| [typescript-advanced-types](../../.agents/skills/typescript-advanced-types/SKILL.md) | Master TypeScript's advanced type system including generics, conditional types, mapped types, template literals, and utility types for building type-safe applications. |
| [vercel-composition-patterns](../../.agents/skills/vercel-composition-patterns/SKILL.md) | React composition patterns that scale. |
| [vercel-react-best-practices](../../.agents/skills/vercel-react-best-practices/SKILL.md) | React and Next.js performance optimization guidelines from Vercel Engineering. |

### Apply engineering principles

| Skill | Purpose |
| --- | --- |
| [principle-boundary-discipline](../../.agents/skills/principle-boundary-discipline/SKILL.md) | Apply when wiring validation, error handling, or framework adapters. |
| [principle-build-the-lever](../../.agents/skills/principle-build-the-lever/SKILL.md) | Apply to any non-trivial work, not just bulk work: edits, migrations, analyses, checks. |
| [principle-encode-lessons-in-structure](../../.agents/skills/principle-encode-lessons-in-structure/SKILL.md) | Apply when you catch yourself writing the same instruction a second time, or notice a recurring correction. |
| [principle-exhaust-the-design-space](../../.agents/skills/principle-exhaust-the-design-space/SKILL.md) | Apply when facing a novel UI interaction or architectural decision with no precedent in the codebase. |
| [principle-experience-first](../../.agents/skills/principle-experience-first/SKILL.md) | Apply when product, UX, or feature-scope tradeoffs come up. |
| [principle-fix-root-causes](../../.agents/skills/principle-fix-root-causes/SKILL.md) | Apply when debugging. |
| [principle-foundational-thinking](../../.agents/skills/principle-foundational-thinking/SKILL.md) | Apply before writing logic: choosing core types and data structures, sequencing scaffold-vs-feature work, asking what concurrent actors share. |
| [principle-guard-the-context-window](../../.agents/skills/principle-guard-the-context-window/SKILL.md) | Apply when context is filling up: large outputs, long files, repeated reads, fan-out planning. |
| [principle-laziness-protocol](../../.agents/skills/principle-laziness-protocol/SKILL.md) | Apply when refactoring, evaluating diff size, or tempted to add abstractions, layers, or signal threading. |
| [principle-make-operations-idempotent](../../.agents/skills/principle-make-operations-idempotent/SKILL.md) | Apply when designing commands, lifecycle steps, or processing loops that run amid crashes, restarts, and retries. |
| [principle-migrate-callers-then-delete-legacy-apis](../../.agents/skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md) | Apply when introducing a new internal API while old callers still exist. |
| [principle-minimize-reader-load](../../.agents/skills/principle-minimize-reader-load/SKILL.md) | Apply when reviewing or shaping code that's hard to trace. |
| [principle-model-the-domain](../../.agents/skills/principle-model-the-domain/SKILL.md) | Apply when writing stateful logic, or when code branches a lot or repeats a shape assumption across files. |
| [principle-never-block-on-the-human](../../.agents/skills/principle-never-block-on-the-human/SKILL.md) | Apply when tempted to ask 'should I do X?' on reversible work. |
| [principle-outcome-oriented-execution](../../.agents/skills/principle-outcome-oriented-execution/SKILL.md) | Apply during planned rewrites and migrations with explicit phase boundaries. |
| [principle-prove-it-works](../../.agents/skills/principle-prove-it-works/SKILL.md) | Apply after completing a task, before declaring done. |
| [principle-redesign-from-first-principles](../../.agents/skills/principle-redesign-from-first-principles/SKILL.md) | Apply when integrating a new requirement into an existing design. |
| [principle-separate-before-serializing-shared-state](../../.agents/skills/principle-separate-before-serializing-shared-state/SKILL.md) | Apply when concurrent actors might write to the same file, branch, key, or state object. |
| [principle-sequence-verifiable-units](../../.agents/skills/principle-sequence-verifiable-units/SKILL.md) | Apply to multi-step work (sweeps, migrations, runs of similar edits) and to how you stack commits and PRs. |
| [principle-subtract-before-you-add](../../.agents/skills/principle-subtract-before-you-add/SKILL.md) | Apply when sequencing an addition, refactor, or rewrite. |
| [principle-type-system-discipline](../../.agents/skills/principle-type-system-discipline/SKILL.md) | Apply when designing types, reviewing a function signature, or writing code in any statically-typed language. |

## Source ownership

The linked skills and [project instructions](../../.agents/AGENTS.md) own the
current contracts. Edit repository rules in `.agents/rules` and shared methods
in their canonical package, then regenerate or use a named install. Maintain
Workflow handles meaningful workflow changes within the requested scope.

The [September 5 skill audit](agent-skill-audit.md) records historical decisions
and evidence. Use this guide and the current skill files to choose today's route.

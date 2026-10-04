# Use the Plate skills

## Start with the outcome

Describe the result you want, with the route, package, issue or existing plan
when you know it. pstack's `poteto-mode` is the engineering method: its session
hook routes multi-file, design and unexplained-bug work to the matching
playbook, and the Plate skills below supply each domain's method and proof. You
do not need to coordinate the specialist handoffs yourself.
[AGENTS.md](../../AGENTS.md) has the install steps and the routing table.

Plate adds playbooks on top of pstack's in [`.agents/playbooks/`](../../.agents/playbooks/), and the pstack block in `AGENTS.md` lists them, so a plain request reaches them. The v2 release loop stops at four points:

| Stop | You say | What runs | It stops with |
| --- | --- | --- | --- |
| Next item | "next" | [API review](../../.agents/playbooks/api-review.md): `review-ledger.mjs next` and `status` | The open ledger unit, why it is open, its prior work and the release counts |
| Review | "review <scope>", then "again" or "panel" to iterate | API review: `best-api-review` | A Stop, Pursue or Defer verdict with the current and proposed call site |
| Plan | "plan" | [Plan](../../.agents/playbooks/plan.md), with its architecture reference for API or architecture work | The ready plan and its open questions |
| Execute | "go" | [Build](../../.agents/playbooks/build.md): every slice without pausing, then `verify` and the ledger record | The done report, ending with the next item |

Bugs go through [Bug fix](../../.agents/playbooks/bug-fix.md) and finishing a PR or the current tree through [Babysit](../../.agents/playbooks/babysit.md). "review PR <number>" on someone else's PR runs a review-only panel through Babysit and returns findings without editing anything. A structural cleanup runs [Refactoring](../../.agents/playbooks/refactoring.md), and a slowness report runs [Perf issue](../../.agents/playbooks/perf-issue.md) with `benchmark`.

Best API Review assesses whether a direction earns more work, Best API designs
its public contract, and the Plan playbook owns adoption and proof for the Plate or
Plite layer. A review alone does not start implementation.

For example:

```text
next
review link
plan
go
```

## Choose a narrower entry point when useful

These are optional shortcuts for a specific job, not a sequence to run.

| Your job | Direct entry point |
| --- | --- |
| Choose a public API | `$best-api design <surface>` |
| Deliver a complete Plate feature | "plan <feature>", then "go" |
| Fix one local editor behavior or regression, or recover a failed fix | Describe it, or paste a screenshot or recording |
| Finish a PR or the current tree | "clean up PR <number>" or "finish the current tree" |
| Simplify code ownership: delete, merge, inline or split | "clean up <surface>" |
| Measure, diagnose and improve slow behavior | `$benchmark <operation and workload>` |
| Research external editor approaches | `$research <feature or question>` |
| Compare external editor architectures, or harvest their tests | `$research audit <repo>`, `$research harvest <repo>` |
| Write or audit Plate public documentation | `$plate-docs <page or topic>` |
| Draft, edit or audit general prose | `/pstack:technical-writing <text or file>` |
| Explain behavior, rationale or a complete body of work | `/pstack:how`, `/pstack:why` or `/pstack:teach` |
| Present existing visual proof | `$walkthrough <completed work>` |
| Work a public issue, PR or security queue | `$maintainer <scope>` |
| Draft a Plate Beta issue from video or text | `$maintainer issue-draft <video or text>` |

A planning-only request stops at a reviewable plan. Planning and execution can also be authorized together.

For long unattended work, state a checkable exit condition. pstack's Autonomous
run keeps going with `/loop` in Claude Code or `/goal` in Codex, and the domain
plans stay in use.

## Apply the project rules

**Redesign from First Principles governs `next` beta.** Start from current user
jobs and hard laws. Existing and proposed APIs, owners and abstractions must
earn their place. Choose the durable target before planning adoption; preserve
correctness, native behavior and explicit user constraints. Read [Vision](../../VISION.md)
and the full principle (`pstack:principle-redesign-from-first-principles`).

Known owners and accepted plans go directly to their Plate skill. `verify`
applies to every proof owner. A tiny edit needs direct verification,
without a playbook, app launch or review panel. Subagents research and review;
the lead writes the code. The panel review (`/pstack:interrogate`) runs without
asking only for the rows in the `reviews` list of `.agents/pstack.json`: an API
or architecture plan (after `architect`), a
PR's diff before it opens and "review PR <number>". For anything else, say
"panel", "arena" or "full".

Plate Docs owns public page design, examples, installation, API teaching, MDX
and navigation. `pstack:technical-writing` supplies general prose guidance.
[`verify`](../../.agents/skills/verify/SKILL.md) owns package, browser,
native editor, CLI and artifact proof, and is pstack's driver skill here. Use
`pstack:maintain-verification-skill` to check that verifier against the existing
inventory, or `pstack:create-verification-skill` to establish it; neither
creates a second feature map.

For release work, use the current Release Lanes modes:

| Invocation | Effect |
| --- | --- |
| `$release-lanes status` | Inspect the release lanes. |
| `$release-lanes sync dry-run` | Inspect a proposed main-to-next synchronization. |
| `$release-lanes sync` | Synchronize main into next and push under the requested release scope. |
| `$release-lanes promote` | Preview beta promotion. |
| `$release-lanes promote execute` | Execute the promotion workflow. |
| `$release-lanes verify` | Verify published release state. |

State the publication actions you want. You own commits: a local repair, review
or plan does not by itself authorize a commit, push, PR, merge, release or
external message. [AGENTS.md](../../AGENTS.md) owns scope, authority and
delivery. The [Release Lanes skill](../../.agents/skills/release-lanes/SKILL.md)
owns release mode details.

## Installed skills

These 21 skills live in this checkout's `.agents/skills` directory. pstack's
skills come from the pinned `pstack@pstack-claude` plugin instead: invoke them
as `/pstack:<name>`, such as `/pstack:how`, `/pstack:why`, `/pstack:architect`
or `/pstack:reflect`, and its principle skills load by name when a decision
rests on them. Open a linked skill for its full method; project instructions
govern its use.

To enumerate the local skills from the repository root:

```sh
rg --files --hidden --no-ignore .agents/skills -g SKILL.md | sort
```

| Skill | Purpose |
| --- | --- |
| [benchmark](../../.agents/skills/benchmark/SKILL.md) | Measure and repair Plate/Plite performance, or review a performance design before running its applicable benchmark lanes. |
| [best-api](../../.agents/skills/best-api/SKILL.md) | Design, review or repair Plate/Plite public call shapes before planning their adoption. |
| [best-api-review](../../.agents/skills/best-api-review/SKILL.md) | Reconcile earlier reviews, then judge whether a Plate or Plite API or architecture direction earns further work before detailed design or implementation, and record the verdict in the review ledger. |
| [changeset](../../.agents/skills/changeset/SKILL.md) | Write and verify package release changesets, registry changelog entries, and the PR’s managed auto-release choice. |
| [issue-harvester](../../.agents/skills/issue-harvester/SKILL.md) | Maintain exhaustive Slate/Plate issue-closure ledgers from current issue, PR, test and local proof evidence. |
| [maintainer](../../.agents/skills/maintainer/SKILL.md) | Triage public Plate/Slate issues, PRs and security queues, then route authorized work and exact public proof. |
| [plate-docs](../../.agents/skills/plate-docs/SKILL.md) | Write or audit Plate public documentation, page design, examples, installation, MDX and navigation. |
| [plate-next](../../.agents/skills/plate-next/SKILL.md) | Keep the live Plate packages attested against Plate Next doctrine through package review with the Plate v2 review law, and doctrine sync. |
| [plate-plugins](../../.agents/skills/plate-plugins/SKILL.md) | Build Plate plugins and entrypoints with semantic ownership, inference, scoped capabilities and package proof, and deliver a feature across its package, UI, docs and release. |
| [plate-ui](../../.agents/skills/plate-ui/SKILL.md) | Implement Plate React component families, copied registry UI and kit wiring with exact browser proof. |
| [release-lanes](../../.agents/skills/release-lanes/SKILL.md) | Promote Plate beta releases, sync main back to next and verify published npm/GitHub state with release authority. |
| [research](../../.agents/skills/research/SKILL.md) | Research prior art and external editor evidence for any Plate or Plite feature, picking the gap most likely to change a decision; compare external editor architectures through a strict source inventory; harvest portable tests from external editors; and maintain the compiled research layer. |
| [shadcn](../../.agents/skills/shadcn/SKILL.md) | Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI, including chat interfaces. Provides project context, component docs, and usage examples. Applies when working with shadcn/ui, component registries, presets, --preset codes, or any project with a components.json file. Also triggers for "shadcn init", "create an app with --preset", or "switch to --preset". |
| [sync-plate-ui](../../.agents/skills/sync-plate-ui/SKILL.md) | Sync Plate registry UI into downstream apps with fork-aware comparison, scoped apply and changelog tracking. |
| [sync-shadcn](../../.agents/skills/sync-shadcn/SKILL.md) | Sync upstream shadcn docs into Plate with source inventory, fork-aware apply and baseline accounting, or match shadcn's registry and install protocol source by source. |
| [tanstack-virtual](../../.agents/skills/tanstack-virtual/SKILL.md) | Headless UI for virtualizing large element lists at 60FPS in TS/JS, React, Vue, Solid, Svelte, Lit & Angular. |
| [vercel-react-best-practices](../../.agents/skills/vercel-react-best-practices/SKILL.md) | React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements. |
| [verify](../../.agents/skills/verify/SKILL.md) | Review implementation ownership and verify Plate/Plite packages, editor states, CLI outputs and registry artifacts through their actual proof owners. |
| [video-transcripts](../../.agents/skills/video-transcripts/SKILL.md) | Transcribe a supplied local or linked video with Gemini Files API when its contents are needed as evidence. |
| [walkthrough](../../.agents/skills/walkthrough/SKILL.md) | Present final screenshots or rendered artifacts as an annotated walkthrough when visual evidence is requested. |

## Source ownership

The linked skills and [project instructions](../../AGENTS.md) own the current
contracts. Edit repository rules in `.agents/rules` and regenerate with
`pnpm install`. The pstack block in `AGENTS.md`, `.agents/pstack.json` and
`.agents/pstack/` come from the `sync-pstack` skill, so shared pstack rules
change there; pstack's own skills come from the pinned plugin.

The [September 5 skill audit](agent-skill-audit.md) records historical decisions
and evidence. Use this guide and the current skill files to choose today's route.

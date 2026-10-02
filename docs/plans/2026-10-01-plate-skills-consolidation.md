# Plate skills consolidation on pstack

Status: done
Topic: pstack

## Defaults

- **The hard-cut law lives in `plate-architecture`, not `refactoring.md`.** A hard cut removes behavior, and pstack's Refactoring playbook preserves it; Build cites the law. Say "hard cut in refactoring" to move it.
- **`plate-feature`, `github-issue-reporter` and the research methods moved word for word.** Inventory B proposed deduplicating the audit laws shared with the matrix file; that is a trim, not a move. Say "dedup research" to apply it.
- **Trims cut only rules restated by the pstack block, which every session loads.** Rules restated only by a pstack skill that may not be loaded at that moment stay as Plate law. Say "trim harder" to point those at pstack too.
- **`verify`'s testing reference keeps its narrow snapshot exception** for serialized text or AST output, which the Tests rule's "no snapshots" does not mention. Say "ban snapshots" to remove it.
- **`plate-plan` and `plite-plan` stay as benchmark `layer-plan` schema values**, because existing benchmark plans record them. Say "rename layer-plan values" to change the schema and its test.

## Public API

Every command typed before pstack, each on the same line as what replaces it today. Plain words go to the matching playbook through poteto-mode's session hook.

The v2 loop: next item, review, plan and build.

```text before
$best-api-review            pick the next item
$best-api-review <scope>    judge an API
$wait-what                  before/after snippets
$task plan <goal>
$plate-plan <question>
$plite-plan <question>
$task execute <plan>
$task full <goal>
$task <goal>
```

```text after
next
review <scope>, then again or interrogate
the verdict leads with today's and the proposed call site
plan <goal>
$plate-architecture <question>
$plate-architecture <question>
go
plan <goal>, then go; a long run uses /loop or /goal
describe the goal
```

Bugs, pull requests and cleanup.

```text before
$patch <report>
$patch diagnose <report>
$diagnosing-bugs <report>
$autoclosure <PR or current tree>
$resolve-pr-feedback <PR>
$architecture-cleanup <surface>
$hard-cut <feature>
```

```text after
the report, screenshot or recording
diagnose <report>
the report, screenshot or recording
clean up PR <number>, or finish the current tree
clean up PR <number>
clean up <surface>
remove <feature>: Build with plate-architecture's Hard cut
```

Features, plugins, UI, docs and proof.

```text before
$plate-feature <feature>
$plate-plugin-creator <plugin>
$plate-ui <component>
$plate-docs <page>
$verify-plate <surface>
$testing audit <scope>
```

```text after
plan <feature>, then go (plate-plugins feature delivery)
$plate-plugins <plugin>
$plate-ui <component>
$plate-docs <page>
$verify <surface>
$verify testing audit <scope>
```

Research and performance.

```text before
$research-wiki full <area>
$research-wiki maintain <area>
$plite-research <question>
$editor-audit <repo>
$editor-audit sync
$editor-test-harvester <repo>
$editor-test-harvester plan <lane> <report>
$benchmark <scope>
$slate-ar
```

```text after
$research full <area>
$research maintain <area>
$research <question>
$research audit <repo>
$research audit sync
$research harvest <repo>
$research harvest plan <lane> <report>
$benchmark <scope>, or describe the slowness (Perf issue playbook)
ask about Plite Autoresearch (benchmark's Autoresearch reference)
```

Public queue, releases and sync.

```text before
$maintainer <scope>
$github-issue-reporter <video or text>
$clawsweeper <update>
$issue-harvester <repo>
$changeset
$registry-changelog
$release-lanes
$plate-next <package>
$plate-review <package>
$shadcn-parity <surface>
$sync-shadcn
$sync-plate-ui
$sync-vision
$slate-migration
```

```text after
$maintainer <scope>
$maintainer issue-draft <video or text>
$issue-harvester slate <update>
$issue-harvester <repo>
$changeset
$changeset (registry changelog reference)
$release-lanes
$plate-next <package>
$best-api-review <scope>
$sync-shadcn parity <surface>
$sync-shadcn
$sync-plate-ui
$sync-vision
retired
```

Method skills. pstack's were vendored into `.agents/skills/`; they now come from the pinned pstack plugin, and shared workflow skills install globally from dotai.

```text before
$poteto-mode
$how, $why, $teach, $recall
$interrogate, $arena, $architect, $swarm
$figure-it-out, $orchestrator
$autogoal
$improve
$tdd, $no-comments, $blast-radius
$technical-writing, $typescript-best-practices
$show-me-your-work, $reflect, $setup-pstack
$create-verification-skill, $maintain-verification-skill
$principle-* (21 skills)
$grill-me
$grill-with-docs
$gpt-pro
$agent-native-reviewer
$maintain-workflow
(none)
```

```text after
pstack:poteto-mode, also loaded by its session hook
pstack:how, pstack:why, pstack:teach, pstack:recall
pstack:interrogate, pstack:arena, pstack:architect, pstack:swarm
pstack:figure-it-out, pstack's Orchestrate playbook
pstack's Autonomous run: /loop in Claude Code, /goal in Codex
retired
pstack:tdd, pstack:no-comments, pstack:blast-radius
pstack:technical-writing, pstack:typescript-best-practices
pstack:show-me-your-work, pstack:reflect, pstack:setup-pstack
pstack:create-verification-skill, pstack:maintain-verification-skill
pstack:principle-* (23 skills, two of them new)
$grill-me (global)
retired
$gpt-pro (global)
$agent-native-reviewer (global)
the sync-pstack skill in dotai
pstack:thermo-nuclear-code-quality-review, pstack:unslop, pstack:deslop, $cross-review (global)
```

Unchanged: `best-api`, `benchmark`, `changeset`, `issue-harvester`, `maintainer`, `plate-docs`, `plate-next`, `plate-ui`, `release-lanes`, `sync-plate-ui`, `sync-shadcn`, `sync-vision`, `prototype`, `autoreview`, `optimise-github-actions`, `shadcn`, `tanstack-virtual`, `typescript-advanced-types`, `vercel-composition-patterns`, `vercel-react-best-practices`, `video-transcripts` and `walkthrough`.

## Main changes

- Lifecycle moved into playbooks on top of pstack's: `refactoring.md` (from `architecture-cleanup`) and `perf-issue.md` (from `benchmark`) are new, and `pr-closure.md` became `babysit.md`.
- Feature delivery, the package host law and the import graph moved into `plate-plugins`; the registry-only law and the hard-cut law moved into `plate-architecture`.
- `research` absorbed the editor audit and test harvest as modes; `maintainer` absorbed issue drafting as a mode.
- Build runs `pstack:blast-radius` before a public API slice and `pstack:thermo-nuclear-code-quality-review` after a shared-code slice; Babysit runs thermo-nuclear before calling a PR ready.
- Every plan gets a page, and the owner's calls default to the recommended option.
- `plate-next` keeps its doctrine, attestations and package review; its review law drops 44 rules that `best-api` and `plate-architecture` state in full, and points to them instead.

## Outcome

Plate's agent layer keeps every Plate law while dropping what pstack already does. The 32 rules become 17 skills and 7 playbooks: lifecycle lives in playbooks on top of pstack's, skills hold knowledge only, names follow one convention, and no alias remains. pstack's `thermo-nuclear-code-quality-review` and `blast-radius` start guarding code quality in Build.

## Evidence

- plate-2 holds 19,253 lines of Markdown agent instructions plus 7,624 lines of scripts, against 5,614 lines for all of pstack 0.9.54's skills. Measured with `find … | xargs cat | wc -l` over `.agents/rules` and `.agents/playbooks`, and over the plugin's `skills/`.
- Typed counts over all history: `plate-feature` 1, `architecture-cleanup` 8, `github-issue-reporter` 0, `editor-audit` 19, `editor-test-harvester` 22, `benchmark` 1, `plate-next` 167 (2 in the last week), `task` 58, `plite-plan` 67, `plate-plan` 34, `patch` 31, `clawsweeper` 17. Measured with `sync-pstack discover`.
- `architecture-cleanup` duplicates pstack's Refactoring playbook plus `thermo-nuclear-code-quality-review`, except for the Plate laws in the table below. Judged by reading both, not measured.
- `benchmark`'s sections from Plan Contract to Handoff rebuild pstack's Perf issue and Hillclimb playbooks. Judged from section headings, not measured.
- `docs/research/review-index.json` cites `.agents/rules/testing.mdc` and `.agents/rules/verify-plate/references/*`, which the earlier setup deleted or moved. Found with grep; which scopes fail to draft is not yet run.
- `version.mjs` lists `architecture-cleanup`, `editor-audit`, `plate-feature`, `architecture` and `plate-plugin-creator` as required skills, and `update-template-skills.sh` copies `hard-cut.mdc`. Found with grep.
- Every law in a cut skill has a home in the table below. Claimed; step 1 verifies it line by line.

## Scope

In:

- Cut `plate-feature`, `architecture-cleanup` and `github-issue-reporter`, after moving each law they hold.
- Cut the aliases `task`, `patch`, `autoclosure`, `plate-plan`, `plite-plan`, `plite-research`, `research-wiki`, `verify-plate`, `clawsweeper` and `hard-cut`.
- Merge `editor-audit` and `editor-test-harvester` into `research` as methods.
- Rename `architecture` to `plate-architecture`, `plate-plugin-creator` to `plate-plugins`, and the playbook `pr-closure.md` to `babysit.md`.
- New playbooks `perf-issue.md` (lifecycle out of `benchmark`) and `refactoring.md` (lifecycle out of `architecture-cleanup`).
- Delete `plate-next` review-law rows that `best-api` or `plate-architecture` restate (the owner chose no release gate).
- Measured trims of `maintainer`, `best-api`, `sync-shadcn`, `verify`, `plate-plugins` and `plate-ui`.
- Wire `thermo-nuclear-code-quality-review` and `blast-radius` into Build and Babysit.
- Repair the review ledger's evidence paths that the earlier setup broke.

Out: `sync-plate-ui`, `sync-vision`, `release-lanes`, `changeset`, `issue-harvester` and `best-api-review` keep their names and content. pstack's own files stay untouched.

## Decisions

- **Every law stays.** A trim cuts only a rule that restates a pstack principle, replaced by a pointer to that principle, or a rule that is stale. Each cut is logged with its disposition.
- **Naming.** Plate knowledge skills are `plate-` plus a topic noun. A playbook that only adds Plate law to one pstack playbook takes that playbook's name. The v2 loop stops keep their words (`api-review`, `plan`, `build`). `best-api`, `best-api-review`, `benchmark`, `research` and `verify` keep their names: none clashes with pstack, `verify` is pstack's own name for the project's verification skill, and the `best-api` names anchor the ledger history.
- **No aliases, no compatibility.** The owner dropped backward compatibility. Every cut name goes under `dropped` in `.agents/pstack.json`, so `sync-pstack verify` treats it as intended.
- **Split law over thermo-nuclear.** Thermo-nuclear's size-based split advice stays overridden: a file splits only when the new owner has durable behavior or proof ownership.

The evidence behind each is in [the decision log](./2026-10-01-plate-skills-consolidation.decisions.tsv).

### Where the cut skills' laws go

| Law | From | New home |
| --- | --- | --- |
| Package host law (`platejs` host, `plitejs` dependency, peers, docs installs, packed proof, root ownership, entrypoint sizes) | `plate-feature` | `plate-plugins`, new Package host section |
| Entrypoint creation and Oxlint boundary maintenance | `plate-feature` | `plate-plugins` |
| Registry-only flow first tests for a neutral Editable law | `plate-feature` | `plate-architecture` layer law |
| Feature manifest, phase order, proof routing, template | `plate-feature` | `plate-plugins/references/feature/`, used by the Plan and Build playbooks |
| `check-plate-feature.mjs` at the close of a feature build | `plate-feature` | Build playbook close |
| Split law, source-owner oracle repair, scale probe for per-node owners, candidate ranking and ledger | `architecture-cleanup` | `refactoring.md` |
| Hard-cut law and its Plate closeout (`pnpm brl`, registry build, changeset, `retiredPackages`, `best-api repair`) | `architecture-cleanup` | `plate-architecture`'s Hard cut, cited by Build's hard-cut step (see Defaults) |
| Candidate areas for Plite and Plate | `architecture-cleanup` | `refactoring.md`'s Candidates section, where the ranking uses them |
| Issue draft from video or text, exact reproduction and media, publish only on request | `github-issue-reporter` | `maintainer`, new Issue draft section |
| Benchmark lifecycle: plan contract, ordered execution, cause gate, durable fix decision, fix-rerun-resume, handoff | `benchmark` | `perf-issue.md` changes anchored on pstack's Perf issue and Hillclimb steps; the cause gate and fix decision stay laws |

## Steps

1. - [x] **Baseline.** Done: baseline snapshot of rules and playbooks at the start of Build, and seven inventories (laws per file with dispositions) in the run's scratch notes; decision log rows for steps 5 to 12 cite them. Record the typed counts (`sync-pstack discover`), rule sizes and the full law inventory of every file this plan touches, as one disposition row per law. Proof: every row names a source line and a planned home.
2. - [x] **Ledger evidence paths.** Done: decision log row "Repoint the ledger evidence paths". Re-point `docs/research/review-index.json` entries that cite `.agents/rules/testing.mdc`, `.agents/rules/verify-plate/references/*`, `.agents/skills/plate-plan/SKILL.md`, `.agents/skills/plite-plan/SKILL.md`, `.agents/rules/plate-plan.mdc` and `.agents/rules/plate-plugin-creator/*` to their current homes. Proof: `review-ledger.mjs draft` succeeds for every scope that cites one of them.
3. - [x] **Renames.** Done: decision log row "Rename architecture, plate-plugin-creator and pr-closure.md". `architecture` to `plate-architecture`, `plate-plugin-creator` to `plate-plugins`, `pr-closure.md` to `babysit.md`, with every reference, `version.mjs`'s required-skills list and the ledger index updated. Proof: `git grep` for the old names returns only plans and immutable records; `version.mjs validate` and `sync-pstack verify` pass.
4. - [x] **Alias cuts.** Done: same row; `update-template-skills.sh` needed no change. Delete the ten alias rules, their generated skills and `.claude/skills` links, list them under `dropped`, and remove them from playbook `when` lines, `AGENTS.md`, `docs/development/agent-skills.md` and `update-template-skills.sh`. Proof: `sync-pstack verify` passes.
5. - [x] **`plate-feature`.** Done: decision log row "Move plate-feature into plate-plugins"; new template test in `tooling/scripts/check-plate-feature.test.mjs`. Move each law per the table, then delete the rule. Proof: each disposition row's key sentence greps in its new home; `node --test tooling/scripts/check-plate-feature.test.mjs` passes against the moved template.
6. - [x] **`architecture-cleanup`.** Done: `.agents/playbooks/refactoring.md`; decision log rows for the hard-cut placement and the move. Write `refactoring.md` on pstack's Refactoring with the split law, oracle repair, scale probe and candidates, move the hard cut to `plate-architecture`, and delete the rule. Proof: `sync-pstack playbook . refactoring` reads in order; anchors hold.
7. - [x] **`github-issue-reporter`.** Done: `maintainer`'s issue-draft mode; decision log row "Fold github-issue-reporter". Move its law into `maintainer`, then delete it. Proof: disposition rows.
8. - [x] **Research merge.** Done: decision log row "Merge editor-audit and editor-test-harvester". `research` keeps the gap picker and gains `editor-audit` and `editor-test-harvester` as methods under `references/`. Proof: disposition rows; the ledger index entries that cite `editor-audit` still resolve.
9. - [x] **Benchmark.** Done: `.agents/playbooks/perf-issue.md`; decision log row "Move benchmark's lifecycle", including the same-family law-loss review and its eight fixes. Write `perf-issue.md` on pstack's Perf issue and Hillclimb; `benchmark` keeps lanes, harness, cohorts, budgets, the comparison law, correctness guards and the pre-acceptance probe. Proof: `sync-pstack playbook . perf-issue` reads in order; disposition rows.
10. - [x] **Quality wiring.** Done: decision log row "Wire thermo-nuclear and blast-radius". Build runs `thermo-nuclear-code-quality-review` on slices that touch shared code, with the split law on top, and `blast-radius` when a public API changes; Babysit runs thermo-nuclear before it calls a PR ready. `verify`'s implementation review keeps Plate ownership checks and points to thermo-nuclear for maintainability. Proof: renders of `build.md` and `babysit.md`; no contradiction between `verify` and the playbooks.
11. - [x] **`plate-next` review law.** Done: the owner chose no release gate; 44 rows that `best-api` or `plate-architecture` state in full were cut after an independent check (232 lines), and the 54 partial and 6 refuted rows stay; decision log row "Delete only the plate-next review-law rows".
12. - [x] **Measured trims.** Done: one decision log row per skill; plate-ui keeps three stale examples (see Follow-ups). Tag every rule in `maintainer`, `best-api`, `sync-shadcn`, `verify`, `plate-plugins` and `plate-ui` as a restated pstack principle, Plate-specific, or stale; replace restated ones with a pointer and delete stale ones. Proof: one decision-log row per file with its counts and line delta.
13. - [x] **Sync and docs.** Done: `docs/development/agent-skills.md`, AGENTS.md Routing, the editor-behavior command recipes and the workflow guide; smoke runs routed 7 of 8 plain requests, and the eighth routed correctly after the Routing row split. Regenerate skills (`pnpm install`), `sync-pstack apply`, and update `AGENTS.md`'s Routing table, `docs/development/agent-skills.md` and the workflow guide. Proof: `sync-pstack verify`; `version.mjs validate`; plain-request smoke runs in both runtimes route to the right playbook.
14. - [x] **Close.** Done: writing passes on the new prose, the same-family decision-trail review with its 12 fixes, decision log rows, `ultracite check` on the touched scripts, and the plan page; the hand-off line ends the report.

## Proof

Each step names its proof above. The plate-2 checkout is shared with other sessions, so every check runs on this plan's paths only, and the owner commits.

## Follow-ups

- `plate-next`'s review law contradicts `best-api` in two places: `review-law.md`'s rule against any document mutation outside `update` (the `best-api` api row allows a complete one-update action) and its rule to inline in the plugin's chain (`best-api.mdc` says inline is not a mandatory chain spelling). Owner: Ziad, tracked here.
- `plate-ui` examples still use `useSelected`, `createIdentity` and a package-owned `useToc`, which no longer exist; no current replacement API was found. Owner: Ziad, tracked here.
- `maintainer` runs its heartbeat in local Codex sessions, while `AGENTS.md` assigns Codex to reviews. Owner: Ziad, tracked here.
- `docs/plite/research/2026-09-09-editor-performance-iteration-2/validate-research-artifacts.mjs` imports `tooling/scripts/plate-review-score.mjs`, which does not exist; this predates the run. Owner: Ziad, tracked here.
- The benchmark template's Work Checklist repeats the lifecycle the playbook now owns, so the two can drift. Owner: Ziad, tracked here.

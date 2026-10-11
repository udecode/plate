# AGENTS.md diet: cut no-ops, disclose process rules, move code rules to CODING_STANDARDS.md

Status: executed: dotai and Ellie pushed; plate-2 waits for your commit, and Ellie's last sync waits on another session
Topic: pstack
Playbook: plan

The owner asked: "my AGENTS.md is a hot mess, propose a series of restructurings that: Remove no-ops, Use progressive disclosure, Move instructions to CODING_STANDARDS.md, using poteto". This iteration is that proposal and edits nothing. On go, the Build playbook runs it one restructuring at a time, each gated by its proof.

## Brief

### What will change?

The agent file every session loads is 32 KB, down from 111 KB. Code rules now live in a coding standards file, and panel, plan, close and reflect rules live in files agents open when that work starts.

### What could go wrong?

Each fresh-agent trial ran once per side, read-only. Codex's use of the new pointers is unproven, and one how-it-works trial skipped a step no moved rule covers. Ellie's latest sync waits on another session.

## Teach

The agent file is the instruction file every agent session loads whole, on every turn, before it reads your request. Here it is 111 KB, about 28,000 tokens. Codex reads only the first 32 KB unless each person raises a config limit.

Two thirds of it is the shared pstack section, which a sync script copies into every pstack project. Most of that section is step-by-step procedure for one process, such as running a review panel or keeping a decision log. Of Plate's own third, most is code rules that matter only while editing code.

The proposal keeps only what every task needs, plus one line per process that says when to open its rule file. Code rules move to a coding standards file that agents read before touching code. Rules a model already follows, or that repeat another rule, go.

![before](artifacts/2026-10-09-agents-md-diet/before.svg) ![after](artifacts/2026-10-09-agents-md-diet/after.svg)

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Shared section | Shrink it at its source, so every pstack project gets the short file (look) | Trim only Plate's third; the file stays near 85 KB | plate only | big |
| Review panel rules | Move all 15 KB as they are; rewriting them is a separate plan (look) | Rewrite it while moving it | rewrite panel | big |
| Where process rules go | Their own files, copied into each project by the sync | Fold each into its pstack skill | into skills | small |
| Rules table | Moves with the code rules into the coding standards file | Stays in the agent file | keep table | small |
| Shared test rule | A rule file the block and the coding standards file point to; the plan said the sync writes it into the coding standards file | Stays in the always-loaded block | tests inline | small |
| Push permissions | One shared setting replaces Plate's two paragraphs about pushing branches | Keep the two paragraphs | keep override | small |
| Lint steps | One script runs the four lint steps on the task's files | Keep the paragraph that spells them out | keep lint prose | small |
| Fresh-agent tests | Test each move during the build; the pass bar is set now | Test before you see this proposal | trial now | small |
| Script reminders | Each script a process runs prints which rule file to read | Pointer lines only | no reminders | detail |
| Session title | Its own rule file, which the decision log script names; the plan said the script prints the exact title | Keep the 2.5 KB title rule | keep title rule | detail |
| Password and payment stop | Keep it, though Claude Code already stops there | Cut it as a no-op | cut guardrail | detail |
| Retired command names | Move the list to the contributor guide; the config already stops them coming back | Keep the paragraph | keep aliases | detail |
| Order | Plate-only moves first, then the shared source | Shared source first | shared first | detail |
| How many test runs | Keep the changes for now, after one test run per side with no edits allowed (look) | Run each request three times per side, with edits allowed, first | rerun trials | big |
| Codex and the new files | Accept the changes though Codex's answers never mention the coding standards file (look) | Prove Codex opens the new files first | prove codex | small |
| Codex setup line | Keep it while Ellie's agent file is over 32 KiB | Drop it now; Ellie trims its own file | drop codex line | detail |
| Subject page link | The old page at https://claude.ai/artifact/559ZPtXQdgX6DHwS5vacmj no longer opens, so the subject now uses https://claude.ai/artifact/LFHiwSeDHVK1okqGjtnZY6 | Drop the new page and restore the old link | drop new page | detail |

## Outcome

- The rendered `AGENTS.md` is at most 32,768 bytes, so Codex loads it whole on its default config and the `project_doc_max_bytes` setup line goes. The estimate is about 29 KB.
- Each rule has one home. A moved rule sits in exactly one file and is reached by one pointer line that names its trigger.
- `CODING_STANDARDS.md` at the repository root holds the code rules and the Rules and enforcement table.
- No rule is lost. Every moved sentence lands in its destination, or the plan lists it as cut with its reason.
- Paired trials show agents still open each disclosed rule at its trigger, and open none on an unrelated question.

## Scope

The plan changes `AGENTS.md`, a new `CODING_STANDARDS.md`, the Plate playbooks, skills and docs that receive moved text, and dotai's `skills/sync-pstack` block template, renderer and helpers.

It leaves out a rewrite of what the panel rule says, which moves as is, the content of `.agents/rules` skills beyond receiving moved text, and the owner's user-level `~/.claude/CLAUDE.md`, whose overlaps with this file are noted only.

## Findings

Measured on 2026-10-09 by `measure.mjs` (`docs/plans/artifacts/2026-10-09-agents-md-diet/size-a1.log`).

| Part | Bytes | Share |
| --- | --- | --- |
| Whole file | 110,918 | 100% |
| Shared pstack block, rendered from dotai | 73,052 | 66% |
| Plate's own sections | 37,866 | 34% |

The block's biggest rules are procedures for one process each. Together they hold 51,119 bytes.

| Block rule | Bytes | Fires when |
| --- | --- | --- |
| Panel review | 14,902 | a panel, `architect` or arena runs |
| Plans and trails | 9,588 | writing a plan, a decision row or a proof log |
| Todo list and close | 5,763 | closing planned work |
| Improve the workflow mid-task | 5,057 | `/pstack:reflect` runs, or a workflow fix |
| Review | 4,552 | a panel on a diff |
| Plan pages | 4,020 | writing a plan page, when the `plan-page` skill already loads |
| Session title | 2,517 | a stage change, desktop app only |
| Long runs | 2,432 | `/loop`, `/goal`, pause, resume or compaction |
| Corrections | 2,288 | `/pstack:correct` |

| Plate section | Bytes | What it mostly holds |
| --- | --- | --- |
| Routing | 10,180 | the routing table, plus paragraphs for one branch each |
| Rules and enforcement | 7,890 | the code rules table |
| Proof and tooling | 4,486 | lint and proof commands |
| Packages | 4,326 | code rules |
| Git and publication | 4,237 | delivery grants, two of them overlapping |
| Source authority | 3,120 | doctrine pointers and the editor-behavior law |

The file says "never" 91 times (measured). Writing-for-agents warns that a ban makes the banned act more available, so the rewording pass in R6 pairs each soft ban with its positive target.

### No-ops

Each sentence below changes nothing versus what the model or harness already does, or only repeats another rule.

| Sentence | Why it does nothing | Section |
| --- | --- | --- |
| "Be concise, plain and candid, in English." | Claude Code's system prompt and the owner's global file say it; "in English" also clashes with the reply-language lesson | block, How work runs |
| "Never claim a skipped or unavailable proof passed." | The harness already requires faithful outcome reports | block, Blocked |
| "Continue authorized repairs and verification without repeated permission." | Autopilot already runs work to its close | Routing |
| "Releases, and a comment, review, label or close on a public GitHub issue or PR, need the active request's authority" | The Messages rule says it, and both delivery grants repeat it | Git and publication |
| "Plate Docs owns public docs style ... Walkthrough presents existing final evidence." | The routing table and both skills' descriptions say it | Routing |
| "`verify`'s testing reference owns test shape and runners, `test-audit` prunes" | The routing table and the Tests addendum say it | Proof and tooling |
| "Optimize for clear, low-friction developer experience ... intuitive for both humans and AI agents." | Aspiration with no observable behavior; the JSDoc and `no-comments` keep-list after it stays | Packages |
| "Reuse valid evidence; repeat only failed, invalidated or uncovered proof." | `verify`'s Evidence section says when evidence carries forward | Proof and tooling |
| "Name an issue-backed plan `docs/plans/<issue>-<slug>.md`" | The Plan playbook's Replace step says it | Routing |
| The Codex `project_doc_max_bytes` setup sentence | Does nothing once the file is under 32 KiB | block, How work runs |

### Duplicates

| Meaning | Homes today | One home |
| --- | --- | --- |
| A gate is not weakened to get green | Routing bullet, rules table row | the table row in `CODING_STANDARDS.md`, carrying the bullet's text |
| `templates/**` is CI output | Packages, rules table | `CODING_STANDARDS.md` |
| Docs carry no changelog language | Packages, rules table, `plate-docs` | `plate-docs`, plus one table row |
| The agent pushes branches other than `main` and `next` | Branch delivery, Main-line PR delivery, and the block's Delivery, which says the opposite | one shared delivery setting (R4) |
| Run `pnpm run prepare` after a rule edit | preamble, block Agent files | the reflect rule file (R5) |
| Test law | block Tests, Packages Tests addendum, Proof and tooling, rules table | `CODING_STANDARDS.md` |
| Lint only the task's files | block Delivery, the Ultracite paragraph | a lint script (R2) |
| Plan file naming | Routing, Plan playbook | Plan playbook |
| Plan page rules | block Plan pages, `plan-page` skill | `plan-page` skill |
| The whole workflow, restated for contributors | `docs/development/agent-skills.md`, 16,587 bytes | the guide links to each rule's home instead |

## Restructurings

The order subtracts first and runs Plate-only moves before the shared source. Each one ends in a keep or revert decision on its own proof.

### R1. Cut the no-ops and collapse the duplicates (Plate)

Delete each Plate-side sentence in the No-ops table. Keep each meaning in the Duplicates table at its one home and delete the rest. Upstream the four lessons under "Lessons waiting for the shared source" through `sync-pstack`'s Lesson mode, then delete that section. That takes about 6 KB out of the always-loaded file (estimate).

### R2. Create `CODING_STANDARDS.md` (Plate)

Move Packages, the TypeScript bans, the Tests addendum, the editor-behavior test-tag rule, the registry and barrel rules, Copyright, and the whole Rules and enforcement section with its baseline, exception and new-rule proof paragraphs. "Never browse GitHub files" stays in `AGENTS.md`, because it governs research too.

Replace the Ultracite paragraph with a `pnpm lint:task <files>` script. It runs `ultracite fix`, `oxfmt`, `ultracite check` and `oxlint --type-aware` on the given files, compares the linted count with the paths passed, and exits non-zero on either gap. The 2 KB of zsh and exit-code gotchas then live in the script.

`CODING_STANDARDS.md` opens with "Read in full before you write, review or deslop any source, test or tooling file," then has these sections:

1. TypeScript and inference.
2. Components.
3. Comments and JSDoc.
4. Tests, with Plate's addendum; the shared Tests rule renders here after R5.
5. Generated output: templates, barrels, registry and `pnpm generate`.
6. Lint and format, which is `pnpm lint:task`.
7. Third-party material.
8. Rules and enforcement: the table, baselines, exceptions and how to prove a new rule.

`AGENTS.md` keeps one pointer: "**Code.** Before you write, review or deslop any source, test or tooling file, read `CODING_STANDARDS.md` in full." The `deslop`, `no-comments` and panel briefs name the file too, because a subagent never sees the lead's pointer fire. `/pstack:correct` keeps its table "in the agent instruction file"; the pointer line names `CODING_STANDARDS.md` as that table's home. That takes about 16 KB out (estimate).

### R3. Send Plate's one-branch paragraphs to their owners (Plate)

| Paragraph | New home | Pointer left in `AGENTS.md` |
| --- | --- | --- |
| Feature review history | `.agents/playbooks/verdict.md`, which already runs `review-ledger.mjs` | none; the routing table sends reviews there |
| Pokayoke's audit-the-whole-class rule | `.agents/playbooks/bug-fix.md` | none |
| Environment-blocker tracing | `.agents/playbooks/bug-fix.md` | none |
| Editor behavior law | the header of `docs/editor-behavior/markdown-editing-spec.md`; the tag rule goes to `CODING_STANDARDS.md` | the existing routing table row |
| Retired command names | `docs/development/agent-skills.md`; `.agents/pstack.json` `dropped` already stops a sync restoring them | one line |
| Workflow-change trials and answer keys | `.agents/playbooks/references/workflow-change.md` | the reflect pointer (R5) |
| CLI and schema generator | `docs/vision/plate.md` | none |
| `create-verification-skill` scope | `.agents/rules/verify.mdc` | none |

That takes about 5 KB out (estimate).

### R4. Replace Plate's prose overrides with shared config (dotai, then Plate)

Add a delivery mode to `sync-pstack` for "the owner's word for `main` and `next`, the agent commits and pushes every other branch". Plate sets it in `.agents/pstack.json`, and the block renders one Delivery rule. That deletes Branch delivery and Main-line PR delivery, about 2 KB, and the always-loaded contradiction where the block says "Commit, push or open a PR only when the user's own message asks for it" and Plate overrides it a page later.

### R5. Disclose the shared block's process rules (dotai)

`sync-pstack` already copies helper scripts into `.agents/pstack/`. It copies rule files the same way, and the block keeps one pointer per file.

| File | From the block | Bytes | Pointer kept in the block |
| --- | --- | --- | --- |
| `.agents/pstack/rules/panel.md` | Panel review mechanics, Review, Extraction | about 21,000 | "**Panel.** Before you launch any panel, `architect` or arena seat, read `.agents/pstack/rules/panel.md` in full." The reviews list stays inline because it is the trigger. |
| `.agents/pstack/rules/trails.md` | Plans and trails, Decision-trail review | about 11,300 | "**Trail.** Before you write a plan file, a decision row or a proof log, read `.agents/pstack/rules/trails.md`." |
| `.agents/pstack/rules/close.md` | Todo list and close, except one todo per user ask | about 4,800 | "**Close.** Before you close planned work, read `.agents/pstack/rules/close.md`." |
| `.agents/pstack/rules/reflect.md` | Improve the workflow (except "fix the blocking tool now"), Corrections, Agent files | about 8,500 | "**Reflect.** Before `/pstack:reflect`, `/pstack:correct` or an edit to an agent file, read `.agents/pstack/rules/reflect.md`." |
| `.agents/pstack/rules/long-runs.md` | Long runs | about 2,400 | "**Long run.** On `/loop`, `/goal`, pause, resume or compaction, read `.agents/pstack/rules/long-runs.md`." |
| `plan-page` skill | Plan pages | about 4,000 | none; the skill loads before any plan |
| `CODING_STANDARDS.md`, a second managed region | Tests | about 1,600 | the Code pointer |
| `decisions-check.mjs append` | Session title | about 2,500, down to one sentence | "Rename the session to the title line the helper prints." |

The helpers each process already runs print their rule file's path on start: `cross.mjs` names `panel.md`, `decisions-check.mjs append` names `trails.md`. The pointer then fires at the moment the process begins, not only when the agent remembers it.

The block keeps every rule a typical task needs: How work runs, Delivery, Git, Other sessions, The lead writes the code, Messages, Autopilot, Fast, Writing passes, Commit and PR text, Principles in replies, Blocked, the reviews list and the pointers. The block shrinks from 73 KB to about 18 KB (estimate).

### R6. Reword what stays (dotai and Plate)

One writing pass over the text that stays. Each soft ban gets its positive target first ("reset a proof case in a fresh detached worktree" ahead of "never `git stash`"); the hard guardrails keep their ban, paired with the target. Repeated phrases collapse into the terms the block already defines, such as run directory, frozen commit, seat and round. A fresh-context reader given only the old and new text confirms that no permission, gate, stop or trigger changed, as the Improve the workflow rule requires for rewording.

### R7. Prove it

`AGENTS.md`'s Routing requires paired baseline and revised trials in fresh contexts for a broad change to discovery or method selection, per pstack's Eval playbook. The variants, prompts and grader brief freeze before any arm runs. A separate agent writes the answer key and a separate grader scores against it.

| Trial | Plain request | Passes when |
| --- | --- | --- |
| T1 code | a one-file fix in a package | reads `CODING_STANDARDS.md` before its first edit and follows its TypeScript bans |
| T2 test | add a regression test | the test fails before the fix, per the Tests rule |
| T3 panel | "panel" on a small plan | reads `panel.md` before launching seats, and the `seats` row passes `decisions-check` |
| T4 trail | a small plan that logs decisions | reads `trails.md`, and its rows pass `decisions-check` |
| T5 delivery | repair a PR on a topic branch | commits and pushes that branch, and leaves `main` and `next` untouched |
| T6 adjacent | "how does the history plugin work?" | opens no rule file |

A move stays only when the revised arm matches or beats the baseline on every gate of every trial that covers it. A move whose trial loses a gate gets one pointer rewording; if it still loses, that rule goes back inline.

## Main changes

- `AGENTS.md` keeps the rules every task needs plus one trigger line per process; code rules, process procedures and one-branch paragraphs live with their owners.
- New `CODING_STANDARDS.md` holds Plate's code rules and the Rules and enforcement table, and the Code pointer sends agents there before they plan or make a code change.
- `sync-pstack` renders a short block and eight rule files into `.agents/pstack/rules/` from its `RULE_FILES` table, checks skip entries once against every template, and offers a `pushBranches` delivery setting.
- `pnpm lint:task` lints a task's own files with the flags `pnpm check` uses, and `decisions-check.mjs` names `title.md` when a stage changes.

## Steps

- [x] 1. R1: cut the no-ops, collapse the duplicates, upstream the waiting lessons. Proof: a `proof.mjs` log of `measure.mjs` before and after, and a logged `git grep -F` of each collapsed meaning's key phrase that returns one home. Done: docs/plans/artifacts/2026-10-09-agents-md-diet/size-a2.log, docs/plans/artifacts/2026-10-09-agents-md-diet/accounting-a3.log and docs/plans/artifacts/2026-10-09-agents-md-diet/classify-a1.log; the waiting lessons landed upstream in dotai 3719912.
- [x] 2. R2: write `CODING_STANDARDS.md`, the Code pointer and `pnpm lint:task`. Proof: the measure log; `pnpm lint:task` on a mixed ignored and lintable list matches the four manual commands as control and fails on a planted lint error; trials T1 and T2. Done: docs/plans/artifacts/2026-10-09-agents-md-diet/lint-task-mixed-a2.log, docs/plans/artifacts/2026-10-09-agents-md-diet/lint-task-ignored-a2.log, docs/plans/artifacts/2026-10-09-agents-md-diet/lint-task-planted-a2.log, docs/plans/artifacts/2026-10-09-agents-md-diet/lint-task-unused-a1.log and docs/plans/artifacts/2026-10-09-agents-md-diet/trials/comparison2.tsv.
- [x] 3. R3: move the one-branch paragraphs. Proof: `check-playbooks.mjs` exit 0, `sync-resources.mjs --check` exit 0 when `.agents/rules` changed, and `pnpm check knowledge` exit 0. Done: docs/plans/artifacts/2026-10-09-agents-md-diet/check-playbooks-a1.log, docs/plans/artifacts/2026-10-09-agents-md-diet/sync-resources-check-a1.log and docs/plans/artifacts/2026-10-09-agents-md-diet/check-knowledge-a2.log, whose one finding fails the same way at HEAD in docs/plans/artifacts/2026-10-09-agents-md-diet/check-knowledge-head-a1.log.
- [x] 4. R4: the delivery mode in dotai, then Plate's config. Proof: a `sync-pstack.test.mjs` render test per delivery mode, the rendered Plate block showing one Delivery rule, and trial T5. Done: dotai 4b50ad9 and 0080402, and docs/plans/artifacts/2026-10-09-agents-md-diet/trials/comparison2.tsv.
- [x] 5. R5: the block's rule files, pointers and helper reminders in dotai, then a Plate sync. Proof: `sync-pstack` tests, the measure log showing the rendered `AGENTS.md` at most 32,768 bytes, trials T3, T4 and T6, and `sync-pstack smoke` in both runtimes. Done: dotai 3719912, 4b50ad9, 0080402 and 21e5354, docs/plans/artifacts/2026-10-09-agents-md-diet/size-a2.log, docs/plans/artifacts/2026-10-09-agents-md-diet/trials/comparison.tsv and docs/plans/artifacts/2026-10-09-agents-md-diet/smoke/smoke-plate-a3.log.
- [x] 6. R6: the rewording pass. Proof: the fresh-context reader's verdict file with no rule changed. Done: docs/plans/artifacts/2026-10-09-agents-md-diet/r6-reader-reply.txt and dotai d29c329; two of the four rewordings stayed.
- [x] 7. Drop the Codex config line and turn `docs/development/agent-skills.md` into links. Proof: the measure log and the guide's diff. Done: docs/plans/artifacts/2026-10-09-agents-md-diet/guide-links.mjs and docs/plans/artifacts/2026-10-09-agents-md-diet/check-knowledge-a2.log; the Codex line stays, as Open work says.

## Completion Gates

| Gate | Applies | Artifact |
| --- | --- | --- |
| `deslop`, then `no-comments`, on `tooling/scripts/lint-task.mjs` and the dotai changes to `sync-pstack.mjs`, `audit.mjs` and the two new tests | yes | docs/plans/artifacts/2026-10-09-agents-md-diet/comment-sicko/reply.txt |
| `unslop` on the new prose: `CODING_STANDARDS.md`, the new `AGENTS.md` lines, `workflow-change.md`, the `bug-fix.md` additions, the spec paragraph, `agent-skills.md`, and the dotai pointers, rule-file headers, `SKILL.md` and `interview.md` | yes | docs/plans/artifacts/2026-10-09-agents-md-diet/unslop-prose.mjs |
| `pstack:thermo-nuclear-code-quality-review` on the dotai diff from 74404aa to the last push, as a fresh-context subagent | yes | docs/plans/artifacts/2026-10-09-agents-md-diet/thermo/reply.txt |
| `pnpm lint:task tooling/scripts/lint-task.mjs` | yes | docs/plans/artifacts/2026-10-09-agents-md-diet/lint-task-self-a1.log |
| Sync every managed project from the pushed dotai commit and run `verify` on each, per sync-pstack Lesson step 6; plate-2 is applied from 4b50ad9 | yes | docs/plans/artifacts/2026-10-09-agents-md-diet/verify-plate-a1.log and docs/plans/artifacts/2026-10-09-agents-md-diet/verify-ellie-a1.log; Ellie's sync of 21e5354 waits, as Open work says |
| Codex config sentence: drop it from the block only when every managed project's rendered `AGENTS.md` is at most 32,768 bytes; plate-2 is 33,462 | yes | skip: Ellie is 34,369 bytes, so the sentence stays, as Open work says |
| `sync-pstack smoke` in both runtimes, with the intended-behavior file written before any answer is read | yes | docs/plans/artifacts/2026-10-09-agents-md-diet/smoke/smoke-plate-a3.log |
| Paired trials T1 to T6 per `.agents/playbooks/references/workflow-change.md`, with each move's keep rule from R7 | yes | docs/plans/artifacts/2026-10-09-agents-md-diet/trials/comparison.tsv and docs/plans/artifacts/2026-10-09-agents-md-diet/trials/comparison2.tsv |
| Decision-trail review on a `codex:gpt-6.1-sol @xhigh` seat, because a shared script changed | yes | docs/plans/artifacts/2026-10-09-agents-md-diet/trail/answer.txt |
| `docs/development/agent-skills.md` links to each rule's home instead of restating it | yes | docs/plans/artifacts/2026-10-09-agents-md-diet/guide-links.mjs |
| Close, fold into the pstack subject, republish the page | yes | docs/plans/topics/pstack.md and https://claude.ai/artifact/LFHiwSeDHVK1okqGjtnZY6 |

## Proof

Every step keeps a `proof.mjs` log under `docs/plans/artifacts/2026-10-09-agents-md-diet/`. The size gate is the measure log's `total` line at most 32,768. The single-home gate is a logged `git grep -F` per moved meaning. Behavior is the R7 trials, graded against an answer key the lead never sees. This is an instruction-only change, so it claims no product behavior.

## Close

Reversals and deviations come first. Each has its own row in the decision log.

- Extraction stays in the always-loaded block, because its trigger, reading several unread files to find where a change goes, fires on most code tasks.
- The Decision-trail review rule moved into `close.md` with the close order, not into `trails.md`.
- The Session title rule moved into `title.md`, and `decisions-check.mjs` names that file. The script cannot print the exact title, because the count depends on the stages a run plans.
- The shared Tests rule became `rules/tests.md`, which the block and `CODING_STANDARDS.md` point to, not a second managed region of `CODING_STANDARDS.md`.
- The Plan pages rule became `rules/pages.md`, not part of the `plan-page` skill.
- The Code, Plans and trails and Plan pages pointers now fire on planning. In the first trials, plan-mode sessions drafted plans without opening the files those pointers named.
- Five routing rows, the long verify bullet and two precedence repeats were cut so plate-2 fits in 32 KiB. Each restated a skill description, the `verify` skill or a block rule.
- The Codex `project_doc_max_bytes` sentence stays in the block, because Ellie's rendered `AGENTS.md` is 34,369 bytes.
- `pnpm lint:task` reports how many paths lint ignores and exits 2 only when it ignores them all, instead of failing on any ignored path.
- R6 kept two of its four rewordings. The fresh-context reader found that the other two changed a rule, so they were reverted.
- Another session's commit-all pushed the split mid-edit as dotai `3719912`, before its tests landed. `4b50ad9` restored a green suite, and it went out before its own writing passes, which landed in `ea07892` and `0080402`.
- Every restructuring was built and the shared source pushed before the trials that decided whether each move stays, so a lost trial would have meant a revert commit.
- Ellie got no smoke of its own; plate-2's smoke stands in for the shared pointer lines.
- The fresh-session handoff was proposed and never started, so work paused until you said "go continue here", and the card was withdrawn.

What landed:

- plate-2, uncommitted for your commit: `AGENTS.md` at 32,272 bytes, down from 111,919; `CODING_STANDARDS.md`; eight rule files under `.agents/pstack/rules/`; `pnpm lint:task`; the one-branch paragraphs in their owners' files; `pushBranches` in `.agents/pstack.json`.
- dotai, pushed: `3719912`, `4b50ad9`, `ea07892`, `0080402`, `21e5354` and `d29c329`.
- Ellie, pushed: `d35ba0c14`, its sync of `0080402`.

Proof and its limits. `measure.mjs` logs each size. The sentence accounting gives every one of the 231 pre-build sentences and 58 table rows outside the block a home or a logged cut. The dotai suite passes 160 of 160, and seven planted defects each fail their own test. Trials ran each request once per side in plan mode, graded blind against keys the lead never opened before grading. No repository file was edited, though the sessions wrote plan files under `~/.claude/plans` and scratch scripts. The kept moves match or beat the baseline on every item the baseline passed, except one item in the how-it-works control. Keeping them is provisional, because plan mode could not run a panel's seat launch, write a plan to `docs/plans` with its page, or repair a real PR. Claude's smoke answers plan every intended behavior, and the trial transcripts show Claude opening the files the pointers name. Codex's summaries never name the coding standards, so whether Codex follows the new pointers is unproven. The CI workflow test could not run on this machine (EMFILE), so the new script's name was checked against that test's own predicate.

Counts: 18 items, the 7 steps and the 11 Completion Gates. 11 are done, 6 partial, 1 skipped, 0 blocked and 0 open. The partial ones are steps 4, 5 and 7, the Ellie sync, the smoke and the trials, and Open work tracks what each still lacks.

### Attention

reviewed by gpt-6.1-sol @xhigh, on the log against the transcript, frozen at `d6fc4fe`.

- critical: the trials stood in for R7's proof without its execution gates. Settled by calling the keep provisional and moving the three gates to Open work.
- warning: the trials ran after delivery, against the plan's per-step keep decision. Logged as a deviation.
- warning: the smoke rows treated Claude's planned reads as reads. Corrected; the trial transcripts carry the observed reads.
- warning: the counts listed two pending gates as done. Both gates closed before this page went out.
- warning: the repair commit went out before its writing passes, and the log did not say so. Logged as a deviation.
- warning: two untested rule-file paths were filed as older behavior. Now open work under R5.
- warning: Ellie's smoke was waived without its own evidence. Logged as a deviation and open work.
- warning: the accounting row miscounted its categories. Corrected to 17 cuts, 8 encoded, 1 kept and 34 reworded.
- warning: the T6 row claimed a cause. Corrected to cause unknown.
- warning: the trials were called read-only though they wrote plan files and scratch scripts. Corrected.
- warning: Open work claimed subject tracking before the fold. The fold below makes it true.
- warning: the handoff row read as a handoff, though nothing started. Corrected to a pause until "go continue here".
- nit: the proposal's edit scope left out the decision log and the subject's Page line. Corrected.

## Open work

Each item is tracked here and in the pstack subject's Open work.

- Ellie still needs dotai `21e5354` and `d29c329`. Another session's uncommitted edit to Ellie's `AGENTS.md` blocks a clean push. owner: Ziad. stop: that edit lands, then sync Ellie and push its `next`.
- Two of two revised how-it-works trials failed the explorer-and-check item the baseline passed. The cause is unknown; the Extraction rule is byte-identical in both, which does not rule out an effect of the restructuring. owner: Ziad. stop: a rerun at three or more runs per side shows parity or names the cause.
- The trials could not reach three of R7's gates: a panel's seat launch, a plan written to `docs/plans` with its page, and a real PR repair. owner: Ziad. stop: a trial with edits allowed in a throwaway checkout runs them, or you drop them.
- Ellie has no smoke of the new pointers. owner: Ziad. stop: `sync-pstack smoke` on Ellie after its next sync.
- Codex's use of the new pointers is unproven. owner: Ziad. stop: a Codex transcript shows it opening `CODING_STANDARDS.md` before a code plan, or you drop the item.
- The Codex `project_doc_max_bytes` sentence. owner: Ziad. stop: every managed project's rendered `AGENTS.md` is at most 32,768 bytes, then drop the sentence from the block.
- Two new rule-file paths have no test, so they are unverified parts of R5: the refusal diff for an edited rule file, and removing a rule file whose section becomes skipped. owner: Ziad. stop: a test for each lands in dotai, or you drop them.
- Deferred refactors from the code-quality review: one shared drift path for the block and files, removing a renamed rule file, splitting the template engine out of `sync-pstack.mjs`, and the audit's placeholder shingling. owner: Ziad. stop: you take or drop each.
- Smoke conflicts that predate this change: a fork PR's push remote, a stacked PR's target against "a PR targets `next`", editing another person's PR body, and the unattended-run triggers. owner: Ziad. stop: you take or drop each.
- The panel rule moved as is, at 15 KB. owner: Ziad. stop: you say "rewrite panel" or drop it.
- The CI workflow test hits EMFILE in its bun preload here. owner: Ziad. stop: it runs on a machine without that limit, or you drop it.

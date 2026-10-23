---
review_scopes: [proof]
review_basis: []
work_kind: implementation
review_commit: 95a313df66424cd687154afa019c6e68f55c7a6c
review_inputs: [apps/www/src/registry/components/editor/autoformat.tsx, apps/www/src/registry/components/editor/basic-marks.tsx, packages/platejs/src/lib/plugins/input-rules/createInputRules.ts, packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.ts, docs/editor-behavior/markdown-editing-spec.md, docs/plans/2026-10-23-formal-verification-intake.md]
---

# Autoformat check: every short typed sequence against the kits

Status: executed: the check runs in pnpm check, and the rule-order fix run owns its known failures
Playbook: build

## Brief

### What will change?

pnpm check now types every autoformat shorthand and every sequence of up to three keys into a real editor, in about 6 seconds. It catches the seven known bugs and four new kinds, and fails any change that adds one.

### What could go wrong?

It checks the editor model, not the browser, and only short sequences. A known bug that gets worse stays green. 172 known failures sit in a list that only shrinks, and the rule-order fix run owns them.

## Teach

The autoformat demo turns shorthands into marks and symbols as you type. Two asterisks around a word make it bold, and a dash then an angle bracket becomes an arrow. Each shorthand is a rule in one of two kit files.

Each rule had a test that types its one string. Rules share keys, so one rule can fire halfway through another and break it. Five Beta bugs on the demo were this kind, and no test typed the sequence that showed them.

The new check reads every rule the kits declare and types each one, plus every sequence of up to three keys made from the rules' characters. It compares what lands with what the rule promises. It also checks that the paragraphs around stay put and that one undo takes back each rule. Known failures sit in a list that can only shrink.

## Demo

1. From the repository root, run `pnpm check:autoformat-rules`. It prints one summary line with 3,910 runs and 172 failures, then says the baseline matches the tree, and exits 0.
2. Run `pnpm check:autoformat-rules --typed='==a=='`. It shows the highlight shorthand giving `≡a≡` in each context, the bug in plate#5201.
3. Run `pnpm check:autoformat-rules --typed='__a__'`. It shows the underline shorthand giving bold, one of the new kinds.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What "go here" covers | Both pieces in this session, this check first, then a screen of which other domains earn a check (look) | This check only | check only | big |
| Combo shorthand closers | The closing run mirrors the opening run the spec names, so the three underline combos count as broken today (look) | Accept the closers the code uses now | factory syntax | small |
| Sub and superscript inside a word | They must apply there, as the spec's water-formula example says, so the three cases that stay literal count as broken (look) | Treat them like other marks, which stay literal inside a word | literal script | small |
| Known failures | A list that only shrinks, so the gate passes today and each fix lowers it | Fail until every bug is fixed | strict gate | small |
| A mark that applies but pulls in the next paragraph | The mark counts as applied, and the pulled-in paragraph stays its own failure | Count both as failures | strict join | small |
| Where key sequences start | At the start of a paragraph only, which keeps the gate near 6 seconds | Also after a word | both contexts | detail |
| Content inside a mark | One letter, plus one character for each rule that could fire inside it | Every character of the alphabet | all contents | detail |
| Workers | Eight at most, so a run uses less memory | One per core | all cores | detail |
| Proof of when the check runs | One run of the step picker on seven changed files | A new test case | reach test | detail |
| Review | Two reviewers on the diff and no panel, since this adds a check and changes no public API | A panel on the diff | panel | detail |

## Main changes

- `pnpm check` has an `autoformat-rules` step. `apps/www/scripts/autoformat-input-rules.ts` reads every rule the www autoformat and basic marks kits declare and types it key by key into a real editor, then types every sequence of up to three keys over the rules' 15 characters. A shorthand must apply whole, no sequence may change another paragraph, and one undo must take back each rule. The editor's own count of text input rules must match the rules the script reads, so a rule that reaches the editor another way fails the check. It runs for a change to the registry editor kits, platejs or plitejs source, the script or the baseline helper.
- Its 172 current failures sit in `apps/www/scripts/autoformat-input-rules-baseline.json`, which only shrinks. The `autoformat-input-rules` skill says how to read a failure, tell a real bug from a modeling error and move its coverage record forward.

## Steps

The execution playbook is Build (`.agents/playbooks/build.md`).

- [x] 1 Write the check: read the declarations, type each one and every short sequence, and compare. Proof: the gate finds the seven known cases (plate#5201 to plate#5204, plate#5226, t_167ab658, t_dceb960e) in under 15 seconds.
- [x] 2 Seed the baseline and add the step to `pnpm check` and its CI test. Proof: `node --test tooling/scripts/ci-workflow.test.mjs` passes, and the gate matches the baseline.
- [x] 3 Write the `autoformat-input-rules` skill, its enforcement row and its agent-skills row. Proof: `sync-resources.mjs --check` exits 0 after `pnpm run prepare`.
- [x] 4 Plant three bugs in a detached proof worktree and drop them. Proof: each plant fails the gate, and the gate matches the baseline before and after.
- [x] 5 Run the writing passes and a two-reviewer review of the diff. Proof: the reviewers' findings are fixed or answered, and the gate still matches.
- [x] 6 Land through `land.mjs` and record the task. Proof: the commit is on `origin/next`, and t_30422a81 is logged landed.

## Close

Deviations come first. The review widened when the step runs, from eight named paths to the registry editor folder and all platejs and plitejs source, because a change to plugin compilation or the editor entry skipped it. The declared check now judges the caret paragraph without the paragraph plate#5226 pulls in, which freed 18 known failures: italic, code, subscript and superscript apply, and only the join fails. The baseline went from 190 entries to 172. The review also added the rule-count guard and a fourth planted bug for it. No pick was reversed.

What landed is the `autoformat-rules` step, its script and 172-entry baseline, the `autoformat-input-rules` skill, and its enforcement and agent-skills rows, as `test(www): check every short typed sequence against the autoformat kits`.

The proof, each from its decision-log row:

- On the final bytes the gate makes 3,910 runs and 352 declared checks, finds 86 declared and 86 blocks failures and no undo failure, and matches the baseline.
- In a detached worktree at `95a313df66` with the final script copied in, a substitution that keeps its end text gives 293, 127 and 456 against 86, 86 and 0. A history merge gives 456 undo failures. A computed pattern exits 2, and so does a rule the reader cannot see, at 29 rules against 28. The clean runs before and after match.
- The four-key run makes 54,535 runs and finds the same 86 declared failures, 1,976 blocks failures and no undo failure.
- The step picker runs the check for a change to platejs or plitejs source and to the editor kits, and skips a plitejs test or a browser spec. The CI workflow test passes 9 of 9. Lint and the www typecheck are clean.

The check reads the editor model with one model insert per key, never the browser, and the gate types three keys. A known failure that gets worse stays green, and the other kits of `EditorKit` are not read. The skill's What it does not cover section lists the rest.

The owner's "Go here" covers two pieces. This check is the first, and the screen of which other domains earn a check follows in this session. Open work moved to the proof subject.

## Reflect

One reviewer applied the judgment, tooling and divergent lenses to the transcript from the sweep handoff's reflect to this one, which covers this check and the domain screen, and the lead sorted the findings. No lesson met the two kinds the lead applies without the owner, so every accepted lesson waits in Backlog. Before sorting, the lead checked four claims. Every compaction in that stretch restored deslop, unslop, no-comments and bro whole. The app's effort tool refuses to change its own session. The decision-order script's flag parser reads whole numbers only. `refs/pstack/ledger` is on the public `udecode/plate` remote.

Fixed in this run. The fifth cleanup near miss joined t_bf9eb062 as a folded finding.

Needs the owner. `setup.mjs` pushes the ledger to `refs/pstack/ledger` on `origin`, the public `udecode/plate`, so anyone can fetch its internal task text, local paths and session ids. Keep it, move it to a private remote or strip those fields.

Backlog, each with owner: zbeyens and stop: the owner takes or drops it.

- `sweep.md`'s After a round says "Before the next round", which the lead read as a start time until the owner corrected it. Say the verification-skill pass runs as soon as its scope is fixed.
- A formal check's `pnpm check` reach comes from its imports, not a hand list, and each declared rule keeps one passing case outside the baseline. This check's first reach missed plitejs core, and 12 of 15 mark rules had every positive case in the baseline until review.
- A hand-back reply starts with what landed and what is next, in plain words, before the page link. The owner asked for both twice.
- A local rule that narrows a shared law cites its clause instead of restating it. Two rewrites of the sweep's step 6 invented chips rules before a cited version passed.
- `verify`'s command recipes say that the repository's TypeScript has no compiler API, so a script parses with `@babel/parser`; that a bun probe runs from inside the checkout whose kits it imports; and which six places a new `pnpm check` step touches.
- `lead.mjs` matches a compound or heredoc command, or `append` stops instead of writing an unknown lead. Two rows in this plan's log and 17 in the ledger say the lead is unknown.
- `owns: none` stops reading as a check named none.
- A `chips decision <id>` command prints a task's exact decision cell, and the Do list can write its own queue.
- The chips Sweep says an overflowed `list_sessions` result is already the JSON array `--sessions` takes.
- The chips skill's description names "next" and "what's next", which `AGENTS.md` routes there. One "next" answer came from an old board read.
- A workflow helper that can archive a live session ranks above P3. t_bf9eb062 now holds five such near misses.
- The board resolves who owns an archived session's tasks when it reads them, instead of one takeover row per task. Archiving three sessions wrote 470 rows.
- The card pass weighs shared-host load, such as carding load-sensitive flake fixes one at a time. Four of the ten P0 cards are plitejs flakes.

Rejected.

- Audit the owned checks when judging P0 again. chips.md's Priority already keys P0 to the owned check, and one task claimed too broad a check.
- Clear stale ownership before carding lower work. The run did that under the Owner rule.
- Keep doing ready work instead of asking. The Autopilot rule already says it. The lead broke it, and the three helper frictions it kept asking about are now Backlog items above.
- Brief reviewers with read-only runs and a false-green focus. The run did, and it worked.
- `--tsconfig-override`, the input-rule registry path and the explorer command. The autoformat skill and the Extraction rule already hold them.
- The fast typecheck command and slow-command timings. They drift.
- The Write tool's refusal in the run directory, and land.mjs in the background. `land.md` and the hooks already say both.
- Stage a second deliverable outside the worktree, and the doctype warning on publish. One-offs that change no later step.
- Writing passes ran from memory after a compaction. False, because each compaction restored those skills whole and named only verify to reload.
- Use the app's effort tool to lower a session's own effort. False, because the tool refuses this session.
- Switching to verdict skipped pstack's investigation steps. Verdict's deltas replace three of its four steps, and the fourth is a one-line checkpoint.
- The decision-order script's `flag()` drops text after a second `=`. Its flags take whole numbers only.
- A stored title keeps an old `(xhigh)`. The Title rule keeps the stored decision on purpose and drops the tag from the brief.
- Rereads after each compaction cost context. Open tasks t_211e4328 and t_e658793a already ask it.

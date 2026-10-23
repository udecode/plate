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

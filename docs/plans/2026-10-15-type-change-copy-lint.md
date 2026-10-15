---
work_kind: workflow
---

# Type change: one owner for what a block keeps

Status: waiting: on the reset plan's timing rerun and decision-trail review
Topic: correct
Playbook: build

Round 1 of the diff panel on [the reset plan](2026-10-15-transactions-reset-default.md) found that `elementPropertiesForResetAt` rebuilt what `setNodes` does to a block's text when its type changes, and the copy ran that rule even when the type stayed. The finding matches the rule-only row "New code calls the existing owner instead of copying it" in `CODING_STANDARDS.md`, so the Panel review rule runs `/pstack:correct` on its class before that run closes. This iteration is that correction. Its first build was a lint rule, and round 1 of its own diff panel found six ways around it, so the correction moved up to architecture through `architect`. The run directory is `docs/plans/artifacts/2026-10-15-type-change-copy-lint/`.

## Brief

### What will change?

Reviewing your reset task caught reset copying the code that changes a block's type. Now one function answers what a block keeps, and everything asks it. The lint rule that tried to block copies missed six cases, so it's gone.

### What could go wrong?

Setting a block to its own type no longer strips its properties, which nothing uses. Type changes might be slower; no quiet run has checked. One review finding stays open. A check reads keys the write ignores, as before.

## Teach

When a block changes type, such as a paragraph becoming a heading, some of its properties and some of its text's marks carry over and the rest drop. Each property's schema entry says which.

Today three places work that out on their own: the block type writer, reset, and paste into an empty block. Reset's copy got the rule wrong once. A lint rule meant to stop a fourth copy only matched one name, and review found six ways around it.

Now one function answers the question. It takes the block and the new type and returns the block as the change leaves it, or the block untouched when the type stays the same. The writer, reset and paste all ask it, and the old internal reads are deleted. Code can still rebuild the rule from the settings a property shows publicly, and only a written rule covers that.

## Main changes

- `elementForTypeChangeAt(element, type, path, root)` on `InternalEditorSchemaApi` returns `element` as changing its type to `type` at `path` leaves it. The result has `type` set and each of the block's own properties the change keeps, with its validated value. Each direct text child is cut down to the properties it keeps and stays the same object when it loses none. Inline children pass through. The function returns `element` itself when `type` is already its type, before it reads the document.
- The function reads the document once per call: one ancestor walk and two target contexts shared by the element and every direct text child. A direct text child resolves its properties against its parent's type and ancestors, so it uses the block's own context. A private `getTextPropertyInParent`, which `getTextProperty` also calls, does that resolution. The function caches each text key's resolution for the call, and copies the children array only when a text child loses a key.
- A private classifier, `keptElementProperties`, applies the element rule. The function and reset's same-type seed call it. The text rule exists only in the function's child loop, and it keeps today's unknown-key rule.
- `setNodes`, reset's `elementPropertiesForResetAt` and slice landing's empty-block replacement call the function. Slice landing passes a copy of the block with no children, because the pasted head brings its own. `setNodes` skips a text child with nothing to remove. `elementPropertiesForTypeChangeAt`, `textPropertiesForTypeChangeAt` and `textPropertiesForTypeChange` are deleted, so an old call fails to compile.
- A `setNodes` write that keeps the type, through a custom `compare` or a `merge` that returns the old type, drops nothing. Before, it dropped every property and mark whose lifecycle drops on a type change.
- The lint rule `plate/no-type-change-copy`, its tests, its config block in `oxlint.config.ts` and its baseline entry are deleted. `CODING_STANDARDS.md`'s owner-copy row names the function instead. Only that row covers code that rebuilds the rule from `lifecycle.typeChange`, which the public `schema.property()` read returns.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How to stop a copy | One shared function every caller asks | A lint rule that names the shared read, which review got past six ways | lint only | big |
| Setting a block to its own type | Keeps everything (look) | Strips properties, as a forced write does today | keep forced drops | small |
| Undeclared marks on a type change | Kept, as today | Dropped, as blocks treat undeclared properties | unify unknown | detail |
| Paste into an empty block | Asks the same function | Keeps its own block-only read | paste read | detail |
| This topic's page | A new page, because the old link at https://claude.ai/artifact/BNu77HJFf4WXN5QYDyxjTk no longer opens | No published page | drop page | detail |
| Proof that deleting the lint rule left the lint check clean | Deleting it adds no lint error beyond the four next already has (look) | Wait until the lint check passes fully, after next's own four errors are fixed | wait clean | detail |

## Steps

- [x] 1. Add the rule, its tests, its config block and its baseline entry. Proof: the plugin tests pass; the rule fails on reset's copy at `e75aa61ed8` and passes the base file at `d53a881036`; `plate-baseline.mjs --check` finds no new finding beyond the four the base already holds.
  `docs/plans/artifacts/2026-10-15-type-change-copy-lint/plugin-tests-a1.log` passes 123 of 123. `docs/plans/artifacts/2026-10-15-type-change-copy-lint/lint-past-mistake-a2.log` flags reset's copy at `e75aa61ed8`, and `docs/plans/artifacts/2026-10-15-type-change-copy-lint/lint-past-mistake-control-a1.log` flags nothing at the base. `docs/plans/artifacts/2026-10-15-type-change-copy-lint/baseline-check-a1.log` lists only the four findings `docs/plans/artifacts/2026-10-15-type-change-copy-lint/lint-baseline-check-base-a1.txt` shows at the base. Step 6 deletes this rule.
- [x] 2. Try every way to pass the rule without fixing code, through the real tool in a disposable worktree. Proof: a log of each way's result, and a Defaults row for each way that passes.
  `docs/plans/artifacts/2026-10-15-type-change-copy-lint/ways-to-pass-a1.log` runs each way at `940ad192d8`. Round 1 of the diff panel found six more ways this log never tried, which moved the correction to Step 5.
- [x] 3. Name the rule in `CODING_STANDARDS.md`'s owner-copy row. Proof: the row reads back with the rule and its rule-only cases.
  The copy before the edit is `docs/plans/artifacts/2026-10-15-type-change-copy-lint/pre-CODING_STANDARDS.md`. Step 6 rewrites the row.
- [x] 4. Review the change on its own, with the configured panel on its diff. Proof: the panel's rows in this plan's decision log.
  Round 1 (`docs/plans/artifacts/2026-10-15-type-change-copy-lint/panel-r1.md` and its three answers) found six ways around the rule, which moved the correction to Step 5 through `architect`.
- [x] 5. Build `elementForTypeChangeAt` from `docs/plans/artifacts/2026-10-15-type-change-copy-lint/architect/design.md`, move `setNodes`, reset and slice landing onto it, and delete the three old reads. Proof: the type-change cases in `schema-contract.ts`, `transforms-contract.ts`, `slice-landing-contract.test.ts`, `OverridePlugin.spec.tsx` and `withPlite.slow.ts` pass; new cases for a write that keeps the type through `compare` and through `merge` fail at the base through `proof-worktree.mjs`; `mutate.mjs` reverts the trigger, the text cut, the element classifier and slice landing's call one at a time, and each fails its case.
  `docs/plans/artifacts/2026-10-15-type-change-copy-lint/member/contracts-before-a1.log` and `docs/plans/artifacts/2026-10-15-type-change-copy-lint/member/contracts-after-a1.log` hold 1095 passes and the same 18 failures, `docs/plans/artifacts/2026-10-15-type-change-copy-lint/member/plate-type-change-a1.log` passes 326 Plate tests, and `docs/plans/artifacts/2026-10-15-type-change-copy-lint/member/same-type-write-red-a1.log` fails both new cases at `9da1c17a61`. On the round 2 fix tree `eff9588a77`, `docs/plans/artifacts/2026-10-15-type-change-copy-lint/mutate-member-r3-proof-a2.log` catches 27 of 28 mutants, the trigger, text cut, classifier and slice landing's call among them. Its destination mutant survives the Plate case its spec named, which checks only kept marks, and `docs/plans/artifacts/2026-10-15-type-change-copy-lint/mutate-member-r3b-proof-a2.log` catches it with the schema case whose paragraph-only mark must drop.
- [x] 6. Delete the lint rule, its tests, its config block and its baseline entry, and rewrite the owner-copy row to name the function. Proof: the plugin tests and `plate-baseline.mjs --check` pass; `git grep` finds none of the three old read names in `packages`.
  `docs/plans/artifacts/2026-10-15-type-change-copy-lint/member/plugin-tests-a1.log` passes, and `git grep` finds none of the old names in `packages`. `plate-baseline.mjs --check` does not pass: `docs/plans/artifacts/2026-10-15-type-change-copy-lint/member/baseline-check-a1.log` exits 1 on the four findings next already has, the same ones `docs/plans/artifacts/2026-10-15-type-change-copy-lint/lint-baseline-check-base-a1.txt` shows at the base, so the step closes on that narrower proof through the "wait clean" Defaults row.
- [ ] 7. Run the reset plan's pre-acceptance probe with a cohort that sets the type directly through `setNodes`, frozen in its config before any candidate run. Proof: `paired-timing.mjs` conclusive within the frozen 1.5 budget per cohort. A conclusive miss sends the design back to `architect`; an inconclusive run under load leaves a gate row and reruns on the final tree.
- [x] 8. Review Steps 5 and 6 in round 2 of the diff panel, as round 1's applied critical findings earn. Proof: the round's rows in this plan's decision log.
  Round 2 (`docs/plans/artifacts/2026-10-15-type-change-copy-lint/panel-r2.md`) applied one critical finding by narrowing the claim to internal reads and dismissed one as rare and unchanged from the base. Round 3 (`docs/plans/artifacts/2026-10-15-type-change-copy-lint/panel-r3.md`) re-reviewed its fixes and found no critical finding.

### Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Past-mistake proof through the real tool | yes | `docs/plans/artifacts/2026-10-15-type-change-copy-lint/member/copy-probe-after-a1.log` fails the plitejs typecheck on both old reads, and `docs/plans/artifacts/2026-10-15-type-change-copy-lint/member/copy-probe-before-a1.log` passes at `9da1c17a61` |
| Ways to pass tried | yes | rounds 2 and 3 of the diff panel; rebuilding the rule from the public `lifecycle.typeChange` stays a written rule |
| The blocking gate runs the check | yes | `pnpm check` runs the plitejs typecheck, which refuses a call to a deleted read, as the copy probe shows |
| Panel on the diff | yes | three rounds; round 3 found no critical finding |
| Writing passes | yes | the decision log's writing rows; `docs/plans/artifacts/2026-10-15-type-change-copy-lint/no-comments-r2/reply.md` |
| `pnpm lint:fix` on the task's files | yes | `docs/plans/artifacts/2026-10-15-transactions-reset-default/lint-task-final-a1.log` |
| Hand drive | no | skip: an internal schema function shows nothing new in a browser |
| Benchmark performance pack | yes | pending: Step 7 |
| Decision-trail review | yes | pending: the reset run's review covers this log too |

## Close

**Reversals and deviations.**

- Steps 1 to 3 built the lint rule `plate/no-type-change-copy`. Round 1 of its diff panel found six ways past it, so Step 5 replaced it with one internal member, `elementForTypeChangeAt`, through `architect`, and Step 6 deleted the rule. Steps 1 to 3 keep their wording.
- Round 2 narrowed the claim that nothing is left to copy. The member is the only internal read, but the public `schema.property()` read still returns `lifecycle.typeChange`, so code can rebuild the rule from it, and only the owner-copy row in `CODING_STANDARDS.md` covers that. Taking the field out of the public read is a hard cut, so the question goes to t_65f9d758.
- Round 2 dismissed one critical finding as rare: `canApplyBlockProps` checks patch keys that `setNodes` never writes, such as `text` or `toString`. The decision-trail review showed the count behind "rare" came from the repository's source, which the panel rule treats as inferred, so the dismissal does not hold. The finding stays open at the diff panel's cap. This task leaves that behavior as the base has it, and t_a95a78e2 owns one patch projection for both.
- Step 6's approved proof says `plate-baseline.mjs --check` passes. It exits 1 at the base and on this tree with the same four findings, so the step closes on the narrower proof that it adds none, through the "wait clean" Defaults row.
- The lint rule's plugin, tests, config and baseline, and `docs/plans/topics/correct.md`'s Page line, were written before the ledger's started row named those paths. Deleting the rule restored the lint files to the base.

**Proof.**

- The plitejs typecheck, which `pnpm check` runs, fails on a copy of each deleted read and passes the same copy at the base `9da1c17a61`.
- The type-change contract cases hold 1095 passes and the same 18 failures before and after the member, 326 Plate type-change tests pass, and the two new same-type write cases fail at the base.
- Mutation caught 28 of 28 mutants on round 2's fix tree `eff9588a77`, each with a passing control. The trigger, the text cut, the element classifier and slice landing's call are among them.
- The plugin tests pass after the rule's deletion, and `plate-baseline.mjs --check` finds only the four findings the base holds.
- Performance. It waits on the reset plan's rerun, which carries this plan's `setNodes` cohorts.

**Limits.**

- Code that rebuilds the rule from the public `lifecycle.typeChange` stays rule-only.
- The mutation and performance runs used base `d53a881036`, as the reset plan's Close says.

**Counts.** 17 items: 8 steps and 9 gates. 13 done, 1 partial (Step 6, accepted on its narrower proof), 1 skipped (the hand drive, since an internal function shows nothing new in a browser), 2 open (Step 7 and the benchmark gate, which one probe closes), none blocked.

**Open work.** t_65f9d758, t_a95a78e2 and t_42ff6dbf, listed under the reset plan's Open work, each waiting on this task landing. owner: zbeyens. stop: the task is started or dropped.

**Attention.**

reviewed by gpt-6.1-sol @xhigh. [The reset plan](2026-10-15-transactions-reset-default.md)'s Close lists its review in full. Its three critical flags are about this log, and the reversals above settle each. The rare dismissal is now open, the early lint writes are logged, and Step 6 closes on its accepted narrower proof.

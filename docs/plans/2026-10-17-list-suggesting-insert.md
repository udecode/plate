# Keep text typed into a list item while Suggesting

Status: partial, the landed patch's commit waits on t_37fd70d5's timing run
Page: https://claude.ai/artifact/4aKvLbThTxkBC1GbXF5GNz
Playbook: bug-fix

## Brief

### What will change?

While Suggesting, text you type, delete or format inside a list item now shows up as a suggestion. Enter, indenting and joining items still refuse until the lists plan lands. The change is in your checkout, uncommitted.

### What could go wrong?

Typing might be slower. Other work on the machine pushed all five timing runs over the load limit, so hold the commit until t_37fd70d5 times it. Suggesting select-all then Bold now refuses in documents with a table or code block.

## Teach

Suggesting refuses a change that review marks can't show yet. Each feature names the blocks it protects with a veto, and before a change lands, Plite asks every veto about each block the change touches.

Right now a veto only sees the block's properties. So the list veto can't tell typing inside an item from adding, splitting or changing the type of one, and it refuses all of it. That's why typing in a list item does nothing while Suggesting.

With this change, Plite also tells the veto how the change touches the block: only what's inside it, or the block itself. A change counts as inside when the block's start and end both survive and still wrap one block. The list veto refuses only changes to the block itself. The table and code block vetoes ignore the new input, so they still refuse everything.

## Public API

The list veto now refuses only changes to the list item itself, so text typed inside one records.

```ts before
// packages/platejs/src/features/list/lib/BaseListPlugin.ts
authoredVeto.of((element) => (element.listType ? 'list' : null)),
```

```ts after
// packages/platejs/src/features/list/lib/BaseListPlugin.ts
authoredVeto.of((element, touch) =>
  element.listType && touch !== 'content' ? 'list' : null
),
```

A veto gets a second input, which Plite fills in. A veto that ignores it refuses both kinds, like the table veto does.

```ts before
// packages/plitejs/src/core/authored-veto.ts
export type AuthoredVeto = (
  element: Readonly<Record<string, unknown>>
) => string | null;
```

```ts after
// packages/plitejs/src/core/authored-veto.ts
export type AuthoredVeto = (
  element: Readonly<Record<string, unknown>>,
  touch: 'content' | 'element'
) => string | null;
```

## Main changes

- `proposalRefusal` (`packages/plitejs/src/authored/refusal.ts`) gives each element a change touches a `'content'` touch when its original open and close tokens survive the step and still delimit one element in the step's after-index, and an `'element'` touch otherwise. An element whose own properties change, and an element the change inserts, always gets an `'element'` touch. The walk computes each element's touch once per step and asks each veto about each element once.
- A property edit now also checks every element that holds the edited node. Before, a property edit below a vetoed element, such as bold on a whole text leaf in a table cell, called no veto.
- A delete that removes a whole plain paragraph and trims the list item after it now records, because the item itself stays in place.
- `DraftStep` keeps both its before-index and its after-index, which both producers in `packages/plitejs/src/core/change/builder.ts` already build, and its readers stop treating them as optional. `proposalRefusal` drops its `before` parameter and the fallback index it built from it, which no producer reached.
- The copied `SuggestionRefusals` toast (`apps/www/src/registry/components/editor/suggestion.tsx`) says "Suggesting can't change list items yet, only the text in them." for a list refusal and keeps its table and code block sentence. A refusal with both reasons shows both sentences.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Typing inside a list item while Suggesting | Records as a suggestion, and changes to the list itself still refuse (look) | Keep refusing everything in a list | refuse list typing | big |
| Pressing Enter in a list item while Suggesting | Still refused with a message until the lists plan lands, so text you type right after stays on the same item. Enter adds a list item, and list structure belongs to that plan. With the vetoes off, 8 generated Enter cases record, and accepting or rejecting each gives the right document (look) | Suggest a new list item now | suggest list Enter | big |
| Edits in a table or code block that change only formatting or settings, like bolding a cell's whole text, or select-all then Bold in a document that holds one | Refused whole, as the suggestions plan's rows "Tables and lists until their plans land" and "A selection across a refused block" already rule for every other edit there. On the playground, select-all then Bold now shows the table and code block message and changes nothing (look) | Keep recording them | keep table formatting | big |
| The message when Suggesting refuses a list change | Says list items can't change yet, only the text in them | Keep saying Suggesting is off in lists | old list message | small |
| How a veto learns where a change lands | A second input that says inside or the block itself | The veto returns a reason with a scope | scoped veto result | detail |
| Building after the plan review | Build now, since the review found nothing critical and its fixes are in the plan (look) | Wait for the owner to read the plan | hold | detail |
| Timing a Suggesting keystroke against the base | Suggested task t_37fd70d5 times it on a quiet host with 21 samples per arm. The five runs here each went over the load limit of 9, peaking between 14 and 51 on 18 cores. Step 4 stays open until it passes (look) | Keep rerunning it in this run | time it here | small |

## Steps

- [x] 1. A Codex worker writes the Plite change, the list veto and their package regression tests from `docs/plans/artifacts/codex/t_2db01b1d/brief.md`. Proof: each new test fails at 51f3a53b66 and passes on the change, and `plitejs` and `platejs` typecheck.
  Each new case that changes behavior fails at 51f3a53b66 in `docs/plans/artifacts/2026-10-17-list-suggesting-insert/base-fail-plite-a1.log`, `docs/plans/artifacts/2026-10-17-list-suggesting-insert/base-fail-plate-a1.log` and `docs/plans/artifacts/2026-10-17-list-suggesting-insert/base-fail-plite-bold-a1.log`, and passes on the commit rebased onto 2e865a0bc4 in `docs/plans/artifacts/2026-10-17-list-suggesting-insert/check-plite-tests-a5.log` and `docs/plans/artifacts/2026-10-17-list-suggesting-insert/check-plate-spec-a3.log`. `plitejs` typechecks uncached in `docs/plans/artifacts/2026-10-17-list-suggesting-insert/check-plite-typecheck-a3.log`. `platejs` fails only `migratePlateV54Suggestions.internal.ts(413,20)` in `docs/plans/artifacts/2026-10-17-list-suggesting-insert/check-plate-typecheck-a3.log`, the same way as 2e865a0bc4 in `docs/plans/artifacts/2026-10-17-list-suggesting-insert/base3-plate-typecheck-migrations-a1.log`, which t_086e37a6 owns. The spec types hold the same 222 errors as at 2e865a0bc4, none in a changed file. Deviation: the two new refusing cases, two paragraphs pasted into an item and an item turned back into a paragraph, already refuse at the base, so a mutant guards each instead of a base control.
- [x] 2. The lead reviews the whole diff and every caller of `proposalRefusal`, `DraftStep` and `AuthoredVeto`. Proof: mutating each check site alone fails its own test: the pairing check fails the case that pastes two plain paragraphs into an item's middle, the inserted-element check fails the Enter case, the property-edit holder check fails the whole-leaf mark under the box, and the element's own property check fails "refuses turning a paragraph into a list item".
  Mutation rounds `docs/plans/artifacts/2026-10-17-list-suggesting-insert/mutate-r1/mutate/`, `docs/plans/artifacts/2026-10-17-list-suggesting-insert/mutate-r2/mutate/`, `docs/plans/artifacts/2026-10-17-list-suggesting-insert/mutate-r3/mutate/` and `docs/plans/artifacts/2026-10-17-list-suggesting-insert/mutate-r4/mutate/` catch every check site's mutant with its own case, and none of the four is stale against the current tree. Deviation: the inserted-element check fails "refuses inserting a vetoed block", because no single-site mutant fails the Enter case. The close token's association mutant is caught by a new case that types a bold run at an item's end. Its track-mode mutant is caught by a case that removes an item's last text leaf, a delete that ends at the close token, in `docs/plans/artifacts/2026-10-17-list-suggesting-insert/mutate-final-r5/mutate/close-tracks-before-a1.log`; the diff panel found that `mapPos` starts at the first section ending at or past the close, so that delete reaches the track check. Three cases that shared another case's failure mode were cut.
- [x] 3. The differential oracle reruns its 5,000 base cases on the candidate. Proof: every recorded candidate case accepts to the Editing result and rejects back to the start; every other difference is a newly recording case whose list items keep their properties, numbers and marks in both the Editing result and the pending review tree, or a newly unchanged case that changes nothing in Editing.
  With the base at 2e865a0bc4, `docs/plans/artifacts/2026-10-17-list-suggesting-insert/oracle-base3-a1.log` and `docs/plans/artifacts/2026-10-17-list-suggesting-insert/oracle-cand3-a1.log` report no semantic failure among recorded cases. `docs/plans/artifacts/2026-10-17-list-suggesting-insert/compare-cand3-a2.log`, whose comparator now rejects any candidate exception (`docs/plans/artifacts/2026-10-17-list-suggesting-insert/compare-known-bad-a1.log`), finds 1,411 of the 5,000 cases differ: 1,386 newly record a bold, delete, insert, paste or replace whose list items keep their properties, and 25 bolds that change nothing in Editing are newly unchanged. No difference falls outside those classes. The 65 recorded cases the oracle labels join fall on the last block, so each deletes text inside one item and joins nothing (`docs/plans/artifacts/2026-10-17-list-suggesting-insert/check-joins-a1.log`).
- [ ] 4. Benchmark's pre-acceptance probe times a Suggesting letter in a plain paragraph, a Suggesting bold on a whole leaf and a Suggesting select-all bold, each at 2,000 blocks holding list items, base against candidate through `paired-timing.mjs`, with a planted-slowdown arm and a same-code arm and a budget frozen from the base runs before any candidate result is read. Proof: every cohort passes conclusively, and the candidate's veto calls per Suggesting letter in a list item are equal at 100 and 2,000 blocks.
  Partial. The work half holds. The list work cases read every work counter with a veto installed, Suggesting typing and a whole-leaf bold inside a list item do the same work at 100 and 2,000 blocks (`docs/plans/artifacts/2026-10-17-list-suggesting-insert/check-plite-tests-a7.log`), and both fail on a planted per-element index rebuild (`docs/plans/artifacts/2026-10-17-list-suggesting-insert/mutate-final-r7/mutate/walk-rebuilds-index-a1.log`). The timing half is open, because all five paired runs here were inconclusive when the host's one-minute load went over the frozen limit of 9, and the decision log holds each run. Suggested task t_37fd70d5 reruns the protocol on a quiet host with `perf/config-21.json` and `perf-probe.ts` from the run directory, as hashed in `perf/frozen-21.sha256`: 21 samples per arm, budget 1.10 on the median pair ratio, load limit 9, a planted 1.3x arm and a same-code arm, base 2e865a0bc4 against 2e865a0bc4 plus `source.patch`. A conclusive miss on any cohort sends the touch design back to `architect`, and a pass closes this step and lets the plan close.
- [x] 5. The lead changes the copied toast and the www refusal spec: the list row leaves the refusal loop, the list-copy assertion at `:131` and the mixed-reason case at `:181` follow the new reasons, and a new case types at the end of a list item, refuses Enter and types again. The touched cases assert the model, the DOM text, the caret and that the toast shows, never its words. Proof: the spec passes in Chromium against a source dev server without `PLATE_WWW_PLITE`, where the toast mounts until t_391b7b01 lands.
  7 of 7 pass against http://localhost:3527 on the final bytes, after the round 1 fixes (`docs/plans/artifacts/2026-10-17-list-suggesting-insert/www-refusal-spec-a2.log`).
- [x] 6. The API reference manifest and the registry output (`apps/www/public/r/suggestion.json`) regenerate, `best-api repair` sweeps every teaching of `AuthoredVeto`, and a changeset and a registry changelog entry describe the change. Proof: the manifest's `AuthoredVeto` signature shows the touch input, and the teaching sweep leaves no live hit that teaches the one-argument veto.
  The manifest shows `(element, touch: 'content' | 'element') => string | null` and the new doc, and `api-reference --check` passes (`docs/plans/artifacts/2026-10-17-list-suggesting-insert/api-reference-check-a2.log`). The sweep's only live one-argument vetoes are the code block and table vetoes and the example in `docs/plans/topics/basic.md`, which stay valid because `touch` is a second input they may ignore (`docs/plans/artifacts/2026-10-17-list-suggesting-insert/teaching-sweep-a1.log`). `docs/plans/topics/authored.md` now shows the list veto's call shape. The changesets are `.changeset/plite-authored-review-cards.md` and `.changeset/suggestion-feature-entrypoints.md`, and the registry entry is `apps/www/src/registry/changelog/entries/2026-10-13-suggestions-review-tree.mdx`.
- [x] 7. The writing passes, the diff panel, the hand drive and the lint check run, and the patch lands in the main checkout. Proof: the hand drive's check log and the applied patch.
  The decision log's `writing` rows record each pass, and the diff panel's round 1 found no critical finding. The hand drive covers 43 of 43 cells (`docs/plans/artifacts/2026-10-17-list-suggesting-insert/hand-drive-check-a2.log`), `pnpm lint:task` passes (`docs/plans/artifacts/2026-10-17-list-suggesting-insert/lint-task-a2.log`), and `docs/plans/artifacts/chips/t_2db01b1d.patch` passes `git apply --check` and applies in the main checkout. Its `docs/development/enforcement.md` hunk is taken against the main checkout's copy, because rows near 45 changed on next. The trail review's corrections, this plan's later edits and their log rows land as `docs/plans/artifacts/chips/t_2db01b1d-trail.patch`.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Hand drive | 43 of 43 cells covered after the redrive of `/docs/suggestion` at 1280 px, with S14 driven on `/blocks/playground-demo` (`docs/plans/artifacts/2026-10-17-list-suggesting-insert/hand-drive-check-a2.log`) |

## Open work

- The suggestions plan (`docs/plans/2026-10-12-suggestions-complete.md`) still says typing in a list item refuses, in its behavior row at line 79, its Defaults row at line 89, its P2.2 box and its refusal paragraph at line 177. This change narrows that to changes to list items themselves: a mark across two items and a delete that removes a plain paragraph and trims the next item now record too. Tracked in the Open work of `docs/plans/topics/suggestions.md`. owner: the owner; stop: that plan's next revision.
- S14 of the suggestions scenarios (`docs/editor-behavior/scenarios/suggestions.md:37`) expects Enter at the end of a list item to suggest a new item. After this change its typed text records and its Enter still refuses, so S14 stays half failing, and the list refusal toast does not offer Switch to Editing (found by the diff panel). Tracked in the Open work of `docs/plans/topics/suggestions.md`. owner: the owner, through P3.1 of the suggestions plan; stop: P3.1's build.
- Step 4's timing is open. No paired run of a Suggesting letter, a whole-leaf bold or a select-all bold against 2e865a0bc4 stayed under the load limit, so the touch walk's cost per keystroke is unmeasured. Suggested task t_37fd70d5 reruns the 21-sample protocol on a quiet host and logs its verdict in this plan's decision log. A pass closes step 4 and the plan; a conclusive miss sends the touch design back to `architect`. Hold the commit of the landed patch until then. Tracked in the suggested-task ledger. owner: the owner, who starts t_37fd70d5 when the host is quiet; stop: t_37fd70d5 logs a conclusive verdict.

## Close

Reversals and deviations come first.

- The first close of this plan ticked step 4 through the accepted route and dropped the words "pre-acceptance" from its line. The trail review found that the trails rule forbids both, because the design waits on that probe. Step 4 is open again with its approved words, and the plan is partial.
- Step 4's protocol now takes 21 samples per arm instead of 7. At 7, a planted 1.3x slowdown on a letter read only 1.118, inside the noise around the 1.10 budget, so the protocol could not catch a real slowdown. The budget, metric, load limit, cohorts and arms are unchanged.
- Step 2 was approved with the inserted-element mutant failing the Enter case. It fails "refuses inserting a vetoed block" instead, because no single-site mutant fails the Enter case.
- Step 1's two new refusing cases already refuse at 2e865a0bc4, so a mutant guards each instead of a base control.
- During the diff panel, `compare.py` changed while the Opus seat could still read the run directory. The change moved the exception check first, and the Opus answer raised nothing on that file.

What landed: Suggesting now records typing, deleting and formatting inside a list item and still refuses Enter, indenting and joins. `proposalRefusal` gives every veto a `touch` input, the list veto refuses only `'element'` touches, and a property edit also checks every element that holds the edited node. The copied toast says "Suggesting can't change list items yet, only the text in them." The run regenerated the API reference manifest and the registry output, and two changesets and the registry changelog entry describe the change. `docs/plans/topics/authored.md` shows the list veto's call shape, row 45 of `docs/development/enforcement.md` names the new work cases, and the suggestions subject's Open work lists what P3.1 still owes. The patch `docs/plans/artifacts/chips/t_2db01b1d.patch` is applied, uncommitted, in the main checkout. A second patch carries this Close and the trail review's corrections there.

Proof, from each log row's scope:

- The two plitejs test files pass 47 of 47 on the final bytes (`docs/plans/artifacts/2026-10-17-list-suggesting-insert/check-plite-tests-a7.log`). The plate list spec and the plate authored partition pass, and `plitejs` typechecks. The plitejs authored partition fails only the five authored-tree-record cases, and the `platejs` typecheck only `migratePlateV54Suggestions.internal.ts(413,20)`. Both fail the same way at 2e865a0bc4, and t_cca6f352 and t_086e37a6 own them.
- No package script typechecks `packages/plitejs/test/*.test.ts`. Run directly with `tsconfig.test.json`, the two changed test files hold the same type errors as at 2e865a0bc4, and the round's deslop cleared the two errors HEAD's work case added.
- Every check site's mutant fails its own case in four mutation rounds, the close token's track-mode mutant fails the new last-leaf removal case, and a planted per-element index rebuild fails both list work cases.
- The 5,000-case oracle finds no semantic failure on either side, and its 1,411 differences are 1,386 newly recording edits whose list items keep their properties and 25 bolds that change nothing in Editing. The fixed comparator fails any candidate exception, and a planted exception fails it.
- The www refusal spec passes 7 of 7 in Chromium against a source dev server without `PLATE_WWW_PLITE`. The hand drive covers 43 of 43 cells. S14 ran on `/blocks/playground-demo`, because `/docs/suggestion` holds no list.
- On `/blocks/playground-demo` in Suggestion mode, select-all then Bold shows the table and code block message and leaves the document unchanged, with the same 128 leaves, 4 bold leaves and value size before and after (`docs/plans/artifacts/2026-10-17-list-suggesting-insert/drive-select-all-bold-a1.txt`).
- `pnpm lint:task` passes on the 11 of the task's 15 files that lint reads.

Limits: no timing number exists. Each of the five paired runs went over the load limit. The one 21-sample run whose cohorts all resolved read 1.009 for a letter, 0.981 for a whole-leaf bold and 1.026 for a select-all bold, but its load went over the limit too, so it proves nothing. The browser proof is Chromium and the in-app browser only, and the pane was hidden for the last 15 load cells, which were read as page text. That select-all then Bold recorded before this change is inferred from the whole-leaf mark case failing at the base, not driven.

Counts: 7 steps, 6 done and 1 partial. Step 4 is partial because its timing half is open. Nothing is skipped or blocked.

Open work: the three items under Open work, each with its owner and stop.

**Attention** (reviewed by claude-opus-5-5, a same-family fallback for gpt-6.1-sol, which this machine's Codex login cannot run)

- Critical, applied. Step 4 was closed without its pre-acceptance probe passing. It is open again with its approved words, and the plan is partial. Three more runs here were inconclusive on load, so t_37fd70d5 runs the timing.
- Warning, applied. The first two timing runs ran beside other work from this session. The three reruns ran with nothing else from this session running, and other work on the machine still pushed the load past the limit.
- Warning, applied. The table and code block row understated select-all then Bold. The drive confirmed that it refuses whole, and the row now says so, cites the suggestions plan's rows that already rule it and rates its impact big.
- Warning, dismissed. The plan panel's Backspace and table-cell Plate cases were missing. Backspace at an item's start runs `tx.list.outdent`, which the own-property case covers, and the whole-leaf mark case and the www table case cover the table cell.
- Warning, corrected. The Enter row's evidence was wrong. With the vetoes off, 8 generated Enter cases record and accept and reject cleanly, so the row now rests on the lists plan owning list structure.
- Warning, dismissed. Nobody owed a select-all bold work case. Its work grows with the document by definition, so no size-independent count exists to assert, and the timing's select-all cohort measures its cost.
- Warning, applied. The last rows and commit missed the main checkout. A second patch lands them with this Close.
- Nit, corrected. Rows 15 and 18 call the close token's track-mode mutant equivalent, but the last-leaf removal case kills it.
- Nit, no action. `compare.py` changed while the Opus seat could read it, and the comparator's own planted-exception check proves the fix.
- Needs you, outside this plan. The gpt-6.1-sol seat fails with "not supported when using Codex with a ChatGPT account". Logging Codex in with an API key, `printenv OPENAI_API_KEY | codex login --with-api-key`, may restore it, which is inferred, not tried.

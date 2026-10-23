---
review_scopes: [authored]
verdict: pursue
review_basis: [2026-10-22-authored-transactions-forks]
work_kind: implementation
review_commit: da4bc3e523ee7286ed479be75981808583f1215d
review_inputs: [VISION.md, docs/vision/plite.md, docs/plans/topics/authored.md, docs/plans/2026-10-12-suggestions-complete.md, docs/plans/2026-10-19-preview-places-on-next.md, packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/tree/record.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/test/authored-tree-recording-laws.spec.ts, packages/plitejs/test/authored-tree-commands.test.ts]
---

# Deletions that empty a block another author's pending change hides

Status: executed
Playbook: plan

Pursue, on two owners. The task's two findings look alike and are not. Seed -1104012454 of the plain-editor command law is a core transform called straight inside `update`, which the subject's law runs on the stored tree, so its range stops before Alice's struck `h` while the same letters on the proposed document cover the whole quote. The recorder does what the law says there, and the command path over the same letters already matches a plain editor; the law's oracle needs a named limit, not the recorder a new rule. The restored ledger-law example is a real recorder gap. A framed deletion moves the only line out of a quote Alice's pending unwrap dissolves, the frame never showed that quote, and nothing claims it once its content goes. So Editing breaks the frame law, and Suggesting leaves an empty quote when Alice's unwrap is rejected.

## Brief

### What will change?

Deleting the last line out of a quote someone else is unwrapping now removes the quote too, whether their unwrap is accepted or rejected. The plain-editor test skips a raw write whose result on the stored document differs from its result on the accepted one. Both landed in one commit, after three review rounds that changed how the recorder tells whether a quote still holds something.

### What could go wrong?

Accepting the unwrap first now asks you to decide Bob's deletion with it. Before, accepting the deletion first asked for the unwrap. After a rejected unwrap, you get Bob's edit as recorded, not a rerun of his command. Deleting a long quote's lines one at a time from the top gets slower with each line, and a suggested task bounds that. Tests and probes prove the change; nobody tried it in a browser.

## Teach

A review document stores every pending change as marks on one tree. Commands run on a view where everything is accepted, and a recorder turns what they did back into marks. In that view a quote someone is unwrapping is already gone, and its lines sit at the top level.

So when Bob deletes backward from that quote's only line, the view sees two lines merge. The recorder crossed out the line inside the hidden quote and stopped. That left a quote with nothing in it and nothing saying it should go.

Now the recorder also marks that quote as deleted by Bob, so it goes once nothing in it survives. As with any quote that has a pending deletion, the reviewer then decides its unwrap and that deletion together. A raw transform inside an update works on the stored tree, not the view. So the plain-editor test runs each write on both, and skips the comparison when the two give different documents.

## Public API

No public call changes. The same backward deletion out of a quote another author is unwrapping now leaves that quote marked deleted by its writer, so accepting everything removes it whichever way the unwrap is decided.

## Main changes

- After a step, the recorder adds the writer's delete claim to each wrapper a pending unwrap dissolves once the step's framed removals take its last live content and the step lands no live node inside it, such as the empty line that keeps a struck line in the frame. Inner wrappers decide first (`packages/plitejs/src/authored/tree/record.ts`).
- A block with no pending deletion that keeps its opening or its end counts as live content at any depth. So a line that joins out of a nested quote keeps that quote until the join lands.
- Another author's pending deletion of the wrapper does not stand in for the writer's claim, since it waits on that author.
- The check walks the wrapper's blocks, skips each block the removals take whole, and goes into a block only when its own mark or edges leave the answer open. It stops at the first block that holds live content, so a range deletion in a long quote whose first block is live reads as many tokens as in a short one. A step that removes nothing, such as typing, runs no check.

## What other editors do

No editor checkout was read, because the decision is internal to how Plite records a frame change against marks the frame hides. The table says what each editor is inferred to ship from its public feature set, not checked in source.

| Editor | Pending structural unwrap in review | Raw writes beside hidden review content | Read |
| --- | --- | --- | --- |
| ProseMirror | No; `prosemirror-changeset` tracks inserted and deleted ranges | Not applicable | Inferred, not read |
| Lexical | No review mode in core | Not applicable | Inferred, not read |
| Slate | No review mode in core | Not applicable | Inferred, not read |

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| A step's framed removals claim the dissolved wrapper they empty | Plite | `plitejs` authored, `tree/record.ts` | The recorder owns lifting a frame change into stored marks, and only it knows the frame never showed the wrapper |
| The plain-editor oracle's limit for raw writes the stored and accepted documents disagree on | Test | `plitejs` test, `authored-tree-recording-laws.spec.ts` | The oracle owns which writes a plain editor can stand in for |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| A framed deletion that empties a quote another author's pending unwrap dissolves | Editing keeps the frame law; Suggesting removes the quote once the deletion is accepted, whether the unwrap is accepted or rejected | Laws U5 and U6, the restored ledger-law example, the record tests for a rejected unwrap, for nested quotes a deletion moves the only line out of, for two joins out of nested quotes, and for a deletion of the last live letter of a line another author's pending deletion strikes, and the work test at 2,000 quoted blocks, alone and inside another quote |
| Deciding that unwrap before the deletion | It comes back blocked with the deletion, and applies decided together with it, as accepting the deletion first did before | The existing test that decides a quote's pending unwrap with its pending deletion, and probe d7 over its documents' first decisions |
| A raw `tx.text.delete` or typing whose stored result, once accepted, differs from its result on the accepted document, such as a range that struck text keeps off a block's edge | Unchanged; the plain-editor law no longer compares it | Seed -1104012454 at 400 runs, and the six panel seat cases |
| Decisions once the unwrap is rejected | They follow Bob's recorded edit, not a replay of his command on that document, so a framed removal of the quote's last line as a node, with no merge, loses the quote there | A limit; probe d4 keeps 14 of 28 such diffs, and all but one match base |
| A framed deletion inside a dissolved wrapper, a Backspace included | The check visits each of the wrapper's children once to tell blocks from text, and reads each block before the first live one, the writer's own pending deletions included, so deleting a long quote's lines one at a time from the top costs more with each line | A limit, measured by a panel seat at 300 child visits for 100 paragraphs and 6,000 for 2,000, and read from the code; t_c2ca1bf8 bounds it; typing never runs the check |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What a raw write next to hidden text leaves | The same as today, listed as a known limit of the test (look) | Stretch a raw range over the hidden text beside it | stretch raw ranges | small |
| Whether deciding an unwrap waits for a pending deletion of its quote | It waits, as it already does for any such deletion (look) | Drop the wait, so the unwrap is decided on its own | drop lift wait | small |
| What deciding gives after the unwrap is rejected | Bob's edit as recorded, listed as a known limit (look) | Rerun Bob's command on the document with the quote kept | replay rejected unwrap | big |

## Steps

- [x] **1. Oracle limit.** The plain-editor oracle runs each write on the accepted document and on the stored one, and returns no plain result when the accepted stored result differs. Proof: seed -1104012454 passes at 400 runs on base source with the new spec, and with the change; of the six panel seat cases, the two whose results differ are skipped and the four others compared; 22 of 300 runs still compare plain results.
- [x] **2. Recorder.** A step's framed removals claim the dissolved wrapper they empty. Proof: U5, U6 and the rejected-unwrap record test fail on base source and pass with the change; the two nested join tests, the struck-line deletion test and the work test fail on the change as a panel round reviewed it and pass with the fixes; the nested move test fails with inner wrappers decided last; the restored ledger-law example passes; the recording laws and the authored partition pass.
- [x] **3. Subject.** The rule goes into the subject's Rules, and its Open work drops the unwrap example. Proof: `review-ledger.mjs check` and `plan-page.mjs --check` pass.
- [x] **4. Close.** Writing passes, a panel on the diff, and landing through `land.mjs`. Proof: the panel's rows and the landed commit.

## Close

Reversals and deviations come first. The design first dropped the unwrap lift's wait on a pending deletion of its wrapper. A trial then broke the existing test that decides a quote's unwrap together with its deletion, so the wait came back. Deciding the unwrap first now comes back blocked with Bob's deletion, and both apply when decided together. The diff panel ran three rounds, its limit. Round 1's rule for whether a wrapper still holds live content checked only the edges of its first child. Round 2 replaced it with a walk over the wrapper's blocks, the mechanism's one replacement. That walk dropped round 1's check for a live node the step lands inside the wrapper, and round 3 put the check back, because the index does not yet hold the empty line that keeps a struck line in the frame. The oracle's limit started as a rule about struck text at a range's edges. Each version of that rule misread cases both ways, so the oracle now runs each raw write on the stored document as well.

What lands. `fix(plitejs): delete the hidden quote a framed deletion empties`, the commit that carries this Close. After each step the recorder marks a wrapper a pending unwrap dissolves as deleted by the writer's change. It does so once the step's framed removals take the wrapper's last live content and the step lands no live node inside it. The wrapper then goes once nothing inside it survives, whichever way the unwrap is decided. The plain-editor command law runs each raw write on the stored document too. Where that result, once accepted, differs from the plain editor's, the law skips the comparison. Seed -1104012454 passes, and the ledger law runs the restored example again.

Proof and its limits:

- On the landing bytes, lint and the plitejs types pass. Seed -1104012454 passes at 400 runs, and the recording laws pass 90 of 90. The authored partition passes, with 1,092, 19 and 68 tests across its three runs. Probes d4, d6, d7 and f1 give round 2's results.
- The commands, record, work and decisions files pass 456 of 457. The one failure is a content-root test of the work file that ran past its own 20 s limit at load 60. In three rounds alternating base and the fix at load 50 to 80, those tests timed out eight times on base and four times on the fix, never on an assertion, and all seven passed on the landing bytes in the third round. t_0a13d914 owns those timeouts.
- Each test the panel rounds added fails for its named defect. U5, U6 and the rejected-unwrap record test fail on base source. The two nested join tests and the work test fail on round 2's reviewed tree. The struck-line deletion test fails on round 3's reviewed tree, with both decisions blocked. Each passes on the fix.
- Limits. After a rejected unwrap, decisions follow Bob's recorded edit, not a rerun of his command. So a framed removal of the quote's last line as a node, with no merge, loses the quote there. Probe d4 keeps 14 of 28 such diffs, and all but one match base. The check visits each of the wrapper's children to tell blocks from text, and reads each block before the first live one. So deleting a long quote's lines one at a time from the top costs more with each line, and t_c2ca1bf8 bounds it. That the restored landing check keeps the wrapper of a plugin turn-into comes from reading the code; no test runs it. The oracle skips raw writes whose stored and accepted results differ instead of asserting the stored one, and t_6100e44c owns that. No seat read round 3's fix in its final form; its record test and the rerun seat probes cover it. The base and reviewed-tree controls ran in one worktree at the base, with the new tests and each reviewed `record.ts` copied in, not in a fresh `proof-worktree.mjs --with` worktree per control as the verify recipe asks. They ran source through Bun and built nothing there. Nobody drove the change in a browser.

Counts. The run had one ask, t_de241d0c's brief with its two findings, and both are settled: the seed passes and the ledger-law example runs again. The verdict was Pursue, so the run built it. `architect` ran once. The diff panel ran three rounds. Round 1 raised two criticals, from Astra and Sol, and the run applied both. Round 2 raised one, from Astra, and the run applied it. Round 3 raised none. Its warning on the landing check was applied, and its other warnings and nits wait in t_c2ca1bf8, t_6100e44c and t_0a13d914. The run offered three suggested tasks, t_c2ca1bf8, t_6100e44c and t_4c48c517, and added findings to t_0a13d914 and t_7b084db3.

Landing. After the final proofs, the landing lint removed one unneeded type assertion in the laws spec, and the types and the laws spec passed again on those bytes. Two runs of the landing check then failed only on the 32-view selection import case of the plitejs react caret-work test, which ran past its 5 s limit under host load. t_1bf5e7d5 owns that case, the project's lint forbids raising its limit, and the evidence went into that task.

Inputs. The review read `VISION.md`, `docs/vision/plite.md`, `docs/plans/topics/authored.md`, `docs/plans/2026-10-12-suggestions-complete.md`, `docs/plans/2026-10-19-preview-places-on-next.md`, `packages/plitejs/src/authored/authored.ts`, `packages/plitejs/src/authored/tree/record.ts`, `packages/plitejs/src/authored/tree/resolve.ts`, `packages/plitejs/test/authored-tree-recording-laws.spec.ts` and `packages/plitejs/test/authored-tree-commands.test.ts`. The change lands in `record.ts`, the laws spec and the commands, record and work tests, and the subject gains the rule.

## Open work

- The emptied-wrapper check visits each of the wrapper's children to tell blocks from text and reads each block before the first live one, the writer's own pending deletions included, so deleting a long quote's lines one at a time from the top costs more with each line. owner: zbeyens; stop: t_c2ca1bf8 lands or is dropped; tracked: the suggested-task ledger.
- The plain-editor command law skips a raw write whose stored result, once accepted, differs from the plain editor's, instead of asserting that stored result. owner: zbeyens; stop: t_6100e44c lands or is dropped; tracked: the suggested-task ledger.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

### Requirements

- Commands decide on the proposed projection, and the recorder lifts their result back into marks; a core transform called directly inside `update` runs on the stored tree ([the authored subject](topics/authored.md), lines 396-397 at the review commit).
- The frame law says accepting a framed recording gives what its commands wrote (`packages/plitejs/src/authored/authored.ts:445-470`).
- The command law says accepting everything after a command in either intent gives what a plain editor gives on the accepted document (`packages/plitejs/test/authored-tree-recording-laws.spec.ts`, `acceptsLikePlainEditor`).
- The ledger law says the review ledger equals the kernel after every step, undo, redo, decision and remote commit (`packages/plitejs/test/authored-tree-recording-laws.spec.ts`, `MAIN_ROOT`).
- A block goes when its own mark says so and nothing inside it survives (`packages/plitejs/src/authored/tree/resolve.ts:568`).
- A decision that would drop a pending claim waits on it; the unwrap lift waits on the claims left on the wrapper it removes (`packages/plitejs/src/authored/tree/resolve.ts:1424`).
- Stored documents keep their shape, with no new mark kind or record.

### Lanes

- **No runtime change.** The oracle limit alone passes the seed on base source, and the restored example still throws the frame-law error. Rejected, because it leaves the recorder gap.
- **A claim in the node move only.** It fixes the restored example and misses three framed range deletions that throw at base, one of them law U5's. Rejected, because the same gap stays in the other removal paths.
- **A claim after the step over every framed strike.** Picked, from all three architect seats. It covers moves, range replacements and removals that together empty one wrapper, and costs a loop over the strikes' contexts when no unwrap is pending.
- **The resolver infers removal from emptiness.** Rejected. An emptied wrapper the writer did see, with a later unwrap rejected, would go where a plain editor keeps it, and only the recorder knows what the writer saw.
- **The frame shows or deletes hidden wrappers.** Rejected, because commands would depend on structure outside their document.
- **Strongest deletion, the lift's wait on a lifted wrapper's deletion.** Rejected after a trial. With the claim, deciding the unwrap first blocks on 6 of 56 first decisions in probe d6, and the 6 that blocked at base, which decided the deletion first, apply. A trial that dropped the wait removed those blocks, but it also broke the existing test that decides a quote's pending unwrap with its pending deletion (`packages/plitejs/test/authored-tree-decisions.test.ts:229-257`). A blocked result is a designed path that review UI decides together with the changes it names (`docs/plans/topics/authored.md:59`), and in probe d7 all 15 blocked first decisions apply that way. A nested case can block again on a third author's change before it applies, as it does at base.
- **The oracle limit as a rule about struck text at a range's edges.** Rejected after review. Each version skipped writes the two documents agree on or compared writes they disagree on, while running the write on both skips exactly the ones they disagree on.
- **The rule is wrong, and raw ranges act on the accepted document.** Rejected, because corrections and migrations are physical writes by law, so the oracle names the limit instead.

### Dependents

- `ai`, `layout`: `packages/platejs/src/ai/react/AIChatPlugin.ts`, unaffected, it decides changes and never reads how a frame removal is recorded.
- `comments`: `apps/www/src/registry/components/editor/discussion.tsx`, unaffected, it reads cards and anchors, and no card shape changes.
- `documents`: `packages/platejs/src/docx/export/lib/reviewProjection.tsx`, unaffected, a projection of the fixed case now drops a quote the view never showed.
- `exports`: `apps/www/src/registry/components/editor/export-toolbar-button.tsx`, unaffected, it calls the export entry points.
- `html`: `packages/platejs/src/static/renderStaticHtml.tsx`, unaffected, no mark kind changes.
- `persistence`: `packages/platejs/src/migrations/migratePlateV54Suggestions.internal.ts`, unaffected, no stored shape changes.
- `react`, `suggestions`, `ui`: `packages/platejs/src/react/features/suggestion/useSuggestion.ts`, `apps/www/src/registry/components/editor/suggestion.tsx`, `apps/www/src/app/(app)/examples/plite/plite-example-client.tsx`, unaffected beyond the fixed recording, which adds a delete mark the suggestion UI already renders and a blocked result it already decides together.

### History

This review reopens `2026-10-22-authored-transactions-forks`, whose Stop reconciled the scope's two landed Pursues, because neither covers a frame removal inside a dissolved wrapper. It retains limit CE2 of `2026-10-12-suggestions-complete` (`docs/plans/2026-10-12-suggestions-complete.md:210`), which says a raw node move out of a dissolved wrapper is a raw write, and this plan leaves it as it is. It takes over the ledger-law example that `docs/plans/2026-10-19-preview-places-on-next.md` left out for this task. No external checkout was read.

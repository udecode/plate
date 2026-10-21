# Land the rejected-cut fix in slices, starting with the admission guard

Status: superseded: docs/plans/2026-10-21-cut-join-redesign.md redesigns slice 1 and carries slices 2 and 3
Topic: cut-join
Playbook: bug-fix

## Brief

### What will change?

Nothing in the editor yet. Slice 1's crash fix went back to next after its second review found that a later retype throws where next does not. This lands only the plans, and a fresh session redesigns slice 1.

### What could go wrong?

Nothing new, because the code matches next. Deciding a suggestion can still crash the same way it does on next, and rejecting Carol's Enter still drops Alice's second url until later slices land.

## Teach

When someone accepts or rejects a suggestion, the editor puts back any value the decision restores. If that value equals a default the schema leaves out, cleanup strips it, the editor repairs the document again, and that second repair throws.

Slice 1 skipped putting such a value back. Its first review showed the skipped value could later read another place's default, so it was narrowed to defaults that are the same everywhere. Its second review found that retyping the block to a type without that property then throws, because a pending change puts its own value back.

Both fixes rested on one idea, that leaving the value unset changes nothing anyone reads, and both failed. So the code is back on next. Slice 1's next design has to hold up after a retype, a move and a reload, not just at the decision.

## Scope

- In: this plan, the four earlier iterations it replaces (docs/plans/2026-10-20-cut-join-values.md, -order.md, -moves.md and docs/plans/2026-10-21-cut-join-classes.md) and their decision logs, and the cut-join lessons in `docs/plans/topics/correct.md`.
- Out: every code change. The reverted guard is kept as the run folder's `slice-a/panel-2/slice-a-r2.patch`, the earlier branch's values fix as `wip/t_a2a1c87f-values` at a52ee3bb68, and slices 1 to 8 in Steps.

## Steps

- [ ] Slice 1, the admission guard, redesigned. A fresh session writes its new plan iteration with its own decision log, and that plan's panel runs before any code. The design must keep a value right after the decision and after a later retype, move or reload. Round 2's retype case and its text-color variant become tests that throw on the reverted guard and return on next, and the case table gains a retype step after each decision. Proof: those tests; the plitejs suite, typecheck and lint on the final bytes; the case table against next removing a P0 or P1 kind and adding none; a push panel on the diff; then land.mjs.
- [ ] Slice 2, values on next without retained tags. An omitted right value of a place-dependent key takes next's join, the type-context cap counts grouped rule contexts, and a verdict-probe memo keeps lookups near next. Removes the type-mismatch rows, the order LOSS rows, the other landed split and the url rows where both values are stored and differ, the card's case included. Its panel attacks this premise. If accepting a block retype re-canonicalizes a child's omitted value, taking next's join for an omitted value splits by order where next does not. The reviewed slice cleared only 6 of 17 replayed cases with a place-gated compare.
- [ ] Slice 3, dropped keys: a rejected cut whose left piece is gone gives the dropped key back through a join into the gone piece and waits for the decisions it needs together. Removes the five t_44385dec P0 rows and the dropped-key order split.
- [ ] Slice 4, the same-batch reader. Removes t_048448ff.
- [ ] Slice 5, block halves and unwraps. Removes t_ab434358's P0 and P1.
- [ ] Slice 6, storage: the store rule with one fingerprint bump, and filled-default provenance when it is ready. Removes the moved-link url rows slice 2 leaves, the panels' heading variant of the card, the shown-value P0, t_a069c19a's throw wherever slice 1 leaves it, and t_546ba394 with provenance.
- [ ] Slice 7, storage: acceptance evidence on retained tags and removal facts with scope. Removes t_4293d5c9's kinds and t_f1233d76, and lets retention return if slice 2 needs it.
- [ ] Slice 8, Yjs interval ownership, a wire-format change. Removes t_649d2131.

Each slice runs in a fresh session from this plan, removes at least one P0 or P1 kind against next and adds none, judged case by case, gets a push panel on its own diff and lands through land.mjs. The ledger's landed row for t_a2a1c87f waits for the last slice.

## Proof

Slice 1 lands no code, so its proof is the revert. Logs are in the run folder's `slice-a` directory, and its `panel-2` directory holds round 2.

- The landed code matches fe0fbacdf4: `git diff fe0fbacdf4 -- packages` prints nothing on the reverted tree.
- Round 2's retype case, `panel-2/repro/editing-retype.template.ts`, throws "cannot target" on the guard in `editing-retype.template.ts.slice-a1.log`. It returns on next and on the reverted tree, in `editing-retype.template.ts.next-a1.log` and `editing-retype.template.ts.reverted-a1.log`.
- What the reverted guard proved, for the redesign to start from: the url and text-color tests, round 1's three critical cases and its case table. Those logs are in `round-3`, `cases/hits` and `cases/r3`, and this plan's decision log lists each one.

## Cases

Slice 1 as landed matches next in every case. The reverted guard removed t_a069c19a's throw in the three cases where every link shares one url default and added only a reload drift. Then round 2 found a retype throw the case table cannot see, because its flows never retype after a decision.

| Rank | Kind | next | Slice 1 as landed | Reverted guard |
| --- | --- | --- | --- | --- |
| P0 | t_a069c19a's throw where the left-out default is the same at every place | 65 hits in 3 cases, 5 order-check throws and its own repro | the same | 0 |
| P0 | t_a069c19a's throw where that default depends on place | 332 hits in 21 cases | the same | the same |
| P0 | a retype after a decision throws "cannot target" | not reached, because the decision throws first | not reached | round 2's retype case and its text-color variant |
| P2 | reload-changed: a reload writes out the shared default, and every value reads the same | 0 | 0 | 3 cases |
| P0 and P1 | every other kind the checks report | present | the same | the same |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the fix lands | In eight slices, each removing a kind of wrong result and adding none | One change at the end | back to one plan | big |
| Which slice lands first | The crash fix, redesigned, because it helps on its own | The values fix, which loses values depending on the order of decisions until values are stored | values first | big |
| How the case table counts the throw | As two kinds, by whether the left-out default is the same everywhere or depends on place, because their fixes differ | As one kind, which slice 1 only shrinks, so slice 1 waits for slice 6 | one throw kind | big |
| Where slice 1's redesign runs | A fresh session from this plan, which writes the new design and has it reviewed before any code (look) | This session, whose long history every step re-reads | plan here | detail |
| Whether the revert gets its own review | No, because the code it lands matches next | A third review of the plans alone | review the revert | detail |
| How reload-changed ranks | P2, because only the saved bytes change and every value reads the same | P1, which would hold slice 1 until reloads keep the bytes | reload is P1 | detail |
| Plans for later slices | Each later slice ticks its box here | A new plan per slice | plan per slice | detail |

## Open work

- Slice 1's redesign, then slices 2 to 8. Owner: the lead session, which starts each in a fresh session from this plan. Stop: each slice's land.mjs push; the ledger's landed row after slice 8.
- Two decide questions from the design pass go to the owner as suggested tasks: whether a property whose default depends on where the node stands may still turn omitDefault off, and whether loading a save that holds only children refuses that incomplete input instead of guessing. Owner: the lead session. Stop: the owner's answer, before slice 6.
- Two retype cases round 2 found on next go to suggested tasks: one decide call that accepts a tone and rejects the retype it needs throws, and a retype cannot be rejected while a property only the new type declares stands on the block. Owner: the lead session. Stop: each task's land.

## Close

This session landed slice 1's plans and decision logs and no code. The reversal comes first. The restore guard, narrowed after round 1, went back to next after round 2's critical retype finding, because round 1's narrowing was already its one replacement. The proof is the empty code diff against fe0fbacdf4 and the retype case's three logs under Proof, so every P0 and P1 kind reads as on next. Slice 1's diff had two panel rounds. Open work is slice 1's redesign and slices 2 to 8, owned by the lead session, each stopping at its land.mjs push.

---
review_scopes: [authored, suggestions]
review_basis: [2026-10-12-suggestions-complete]
work_kind: implementation
review_commit: be4cac3bd50723e842895d50d69f3e5d85c79952
review_inputs: [packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/refusal.ts, packages/plitejs/src/authored/format.ts, packages/plitejs/src/authored/resolve-schema.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/authored/tree/halves.ts, packages/plitejs/src/authored/tree/holds.ts, packages/plitejs/src/authored/tree/marks.ts, packages/plitejs/src/authored/tree/record.ts, packages/plitejs/src/authored/tree/record-completion.ts, packages/plitejs/src/authored/facts/records.ts, packages/plitejs/src/authored/facts/admission.ts, packages/plitejs/src/core/authored-document-capability.ts, packages/plitejs/src/core/content-completion.ts, packages/plitejs/src/core/editor-schema.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/scripts/authored-decision-order.ts, packages/plitejs/test/support/authored-laws.ts, packages/plitejs/test/written-default-storage.test.ts, packages/plitejs/test/authored-refusal.test.ts, packages/platejs/src/lib/plugins/element-id/ElementIdPlugin.ts, packages/platejs/src/lib/editor/withPlite.ts, packages/platejs/src/docx/export/lib/exportDocx.tsx]
---

# Suggest, preview and decide in an editor that makes block ids

Status: planning: waits on the plan panel
Playbook: plan

This iteration does the rest of suggested task t_f821f679. Under a schema whose element id generates, Carol's suggested Enter inside a link, or in the text after it, left the paragraph unchanged. Every element generator turns Suggesting and previews off (`constructsValues` in `packages/plitejs/src/authored/refusal.ts`), because a preview or a decision that builds a block calls the generator, so two reads of one document could show different ids. It is the "values a fill constructs" plan that step P3.1 of [Suggestions complete](2026-10-12-suggestions-complete.md) sends out, and it must meet the redesign's Construction values stop ([Authored redesign](2026-10-11-authored-redesign.md) line 172). Its first draft kept a removed block in place of a built one, and its first plan panel showed that cannot work. The third architect replay picked stored spare blocks instead. It also takes back the line-start fix that [Generated values](2026-10-23-generated-values.md) reverted after its third diff round, in a narrower form.

## Brief

### What will change?

Suggesting works in editors that give blocks ids. Enter splits a block, and rejecting it gives the block back with its id. Previews, exports and decisions never make an id, because each suggestion stores the spare blocks it could need.

### What could go wrong?

In editors with block ids, each pending suggestion stores a small hidden block per container it touches. An older editor in a shared room ignores them and decides as next does. Markdown and HTML exports now complete an emptied quote.

## Teach

Plate can give every block an id. The schema says how to make one, and the editor calls that maker whenever a new block appears, such as the second half of an Enter.

Suggesting is off in such editors today. Showing or deciding a suggestion can need a new block, such as a line in a quote whose every line is struck out, and building that block called the id maker again. Two reads could then show different ids, and two decision orders could store different ones.

After this plan, only writes make ids. A suggestion that could empty a container stores a spare block for it, made when the suggestion is written. A read or a decision that needs a block takes the first spare in a fixed order, so every read and every order shows and stores the same ids.

## What other editors do

Read from local checkouts on 2026-10-23 by a Codex explorer and run by none: BlockNote `1e26f1c`, prosemirror-suggest-changes `653fba7`, manuscripts track-changes `62f4d19`, EigenPal DOCX editor `84c4622`, Tiptap `91c51be53`, CKEditor 5 `14e73cc31b`, Lexical `dd5c41b13` and Slate `945a484df`. No editor makes ids while it shows a preview, and the ones that store ids either tolerate a deleted copy's duplicate or rename it.

| Editor | New block's id on a suggested split | Pending deletions and moves | Ids made by a preview or decision |
| --- | --- | --- | --- |
| BlockNote `1e26f1c` | Made when the split is recorded (`UniqueID.ts:218`) | Stored duplicates allowed; id repair skips attributed deletions (`UniqueID.ts:179`) | None in reads; a decision's transaction can run the ordinary repair |
| prosemirror-suggest-changes `653fba7` | Makes none; keeps the slice's attributes | Custom ids can duplicate; no index | None |
| manuscripts track-changes `62f4d19` | No id maker of its own | Shadow copies get a prefixed id (`normalizeShadowIds.ts:22`) | None; prefixes added and removed deterministically |
| EigenPal DOCX `84c4622` | Made when recorded, seeded by the head's id and offset | No exemption; load replaces duplicates | None |
| Tiptap UniqueID `91c51be53` | Made on edit by `appendTransaction` | No exemption | Loading can make ids; reads do not |
| CKEditor 5 `14e73cc31b` | No block id in the open model | Marker names are unique; no block ids | Preview runs a temporary editor; not documented |
| Lexical `dd5c41b13`, Slate `945a484df` | No tracked changes; runtime keys only | Runtime keys are never stored | Not found |
| Plite after this plan | Made by the command; the recorder keeps it | A pending move's copy stores its own id and shows the original's | None; a read or decision takes a stored spare block |

## Public API

DOCX export completes its projection through the editor it already holds, as Markdown and HTML export do after this plan.

```ts before
// packages/platejs/src/docx/export/lib/exportDocx.tsx
const projected = projectAuthoredDocument(stored, { projection });
```

```ts after
// packages/platejs/src/docx/export/lib/exportDocx.tsx
const projected = projectAuthoredDocument(stored, { editor, projection });
```

A projection with an editor can refuse a document whose pending changes need a block and store no spare, such as one written by another tool. Callers that branch on `ok` already handle it.

```ts before
// packages/plitejs/src/authored/refusal.ts
export type AuthoredProjectionRefusalCode = 'authored-generated-values';
```

```ts after
// packages/plitejs/src/authored/refusal.ts
export type AuthoredProjectionRefusalCode =
  | 'authored-generated-values'
  | 'authored-uncovered';
```

## Hard cuts and app migration

- No public export is removed. The refusal code `authored-generated-values` keeps its name and now names a generated element property outside the supported set: one whose target reads its parent or the root, a pattern key, a set value, or content that drops on split. No first-party schema declares one. `authored-uncovered` is new.
- Text-placement generators keep next's behavior: Suggesting allows them, and their generator still runs when resolution completes an empty leaf. Refusing them would remove behavior nobody asked to remove, so the run offers that question as a suggested task.
- `ElementIdPlugin` does not change, because stored ids stay unique. Its lookups read stored ids under a preview, as on next.
- `projectAuthoredDocument` without an editor keeps working as on next, without completion.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| The decision-order check builds generated ids and moves | Plite | `plitejs` scripts (`authored-decision-order.ts`) and its test support | The check owns the order law's proof |
| A standing line takes the emptied line's metadata for keys every element holds | Plite | `plitejs/authored` (`tree/resolve.ts`) | The resolver owns where a rejected split lands |
| Validity comes from a table filled before resolution | Plite | `plitejs` core (`editor-schema.ts`, `public-state.ts`), `plitejs/authored` (`tree/holds.ts`, `authored.ts`) | The resolver's contract says it runs no plugin code |
| Every resolving read completes through one resolve schema that never generates | Plite | `plitejs/authored` (`resolve-schema.ts`, `format.ts`), `plitejs` core (`authored-document-capability.ts`); `platejs` (`exportDocx.tsx`) | Exports and previews read the same outcome |
| Suggestions store spare blocks, and reads and decisions take them | Plite | `plitejs/authored` (a new `tree/reserves.ts`, `tree/record.ts`, `tree/resolve.ts`, `facts/records.ts`, `facts/admission.ts`) | The write owns making values, and the resolver owns choosing among stored ones |
| The recorder keeps the command's generated values | Plite | `plitejs/authored` (`authored.ts`, `tree/record.ts`, `tree/record-completion.ts`) | The framed law compares exact values |
| The refusal covers only generated values a write cannot store | Plite | `plitejs/authored` (`refusal.ts`) | One schema predicate for the recorder and `setView` |

Each row stays inside the package that owns it today, so no new import crosses `tooling/entrypoints/entrypoint-dag.mjs`.

## Main changes

- **Line-start metadata.** When a rejected split's left half keeps no content, the right half stands in its place as on next, and now takes the left half's decided metadata values for each key whose target holds on every element type at every place, such as Plate's block id. A retype or a move can never drop such a value, so taking it adds no wait and no place check. A chain of standing lines passes the first line's values along. The standing line drops its own format tags on the keys it takes, as a mid-line join drops the right half's. Any other metadata key stays lost at a line's start, as on next.
- **Validity table.** Before resolution runs, a cover pass reads every stored value of a validated key, format tag histories, cut `kept` values, spare blocks and `as` values included, and checks each once against each declaration of its key, memoized by declaration and canonical value. Resolution, decide's document check, a decision commit's construction check and the export checks after resolution read that table and call no validator. A value the cover missed throws under `PLITE_LAW_CHECK`.
- **One resolve schema.** `storedResolveSchemaOf(schema)` replaces `authoredResolveSchemaOf` and `ownershipResolveSchemaOf`. Its completion is next's, with generation masked: a built subtree that needs no generated value comes out as today, and one that needs a generated value takes a spare block or refuses as `authored-uncovered`. The capability's projection for Markdown, HTML and detached conversion completes through it, and DOCX export passes its editor. This also fixes a bug next has for every schema: the proposed Markdown export of a quote whose only line is crossed out throws "requires at least 1 children".
- **Spare blocks.** A spare is a hidden member of a container's review set, `{ kind: 'reserve', change, type, slot, node }`, where `slot` names a construction site of `type`'s content program (a prefix index or a minimum ordinal) and `node` is the element completion builds there, made by the schema's constructor when the suggestion is written. The root's spares live in a record set, `authored-reserves`. A write that leaves a pending claim of a change on a container's child or on its type stores one spare per slot for every type that container can take (its stored type and the values of its type tags) whose completion builds an element with a generated value. Plain schemas never store one.
- **Reads and decisions take spares.** A build that needs a generated value takes the spare of that container, type and slot whose change is canonically first. A read never removes it. A decision that builds from a spare stores its node and drops that spare, drops every spare of a container whose children and type hold no pending claim, and merges the spare sets of containers a join or landing merges. Builds and waits stay next's: `completeLevel`, `waitOnBuild`, `waitOnPrefix` and `underInsertions` in `tree/resolve.ts`.
- **Command values.** The recorder's fills and `completeProposed` build shapes, with generation masked. Before the recording returns, a closing pass projects the touched windows as `proposed` and walks them beside the command's final frame. An inserted element whose frame value an element this recording struck still holds stores a freshly generated value and an `as` member that shows the frame value; any other inserted element stores the frame value; a kept element gets a format tag with the frame value. A difference on any other key refuses the write as `diverged`, as the ledger does today. A decision writes an `as` value onto its holder once no holder of that value is pending.
- **Admission.** Loading a document whose pending changes lack spares stores them, as a load repair, the way `ElementIdPlugin` fills missing ids.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Rejected split with an empty left half | The right half stands in the left half's place with its own values | It also takes the left half's metadata for keys every element holds | `plitejs/authored` resolver | The ask's S7 row rejects an Enter at a heading's start under `ElementIdPlugin` | None | Step 2 | Other metadata keys stay lost there | rearchitect |
| Validators in resolution and decisions | Called through `heldProps`, decide's check and the commit's construction check | Read from a table filled before resolution | `plitejs` core schema and `plitejs/authored` | No application callback in resolution | None | Step 3 | A missed value throws under the law check | rearchitect |
| Export projections | Resolve with no completion | Resolve with completion through one resolve schema | `plitejs` capability and `authored/format.ts` | One outcome for every read | `exportDocx.tsx` passes its editor | Step 4 | Exports of emptied containers change | rearchitect |
| Blocks an outcome needs | Built, with a fresh generated value | Taken from a spare the suggestion stored | `plitejs/authored` writes and resolver | No generator in resolution and one document per order | None | Step 6 | Hidden bytes per pending suggestion | rearchitect |
| Recorder values | Fills and canonical steps make fresh values | The command frame's values, with `as` for copies | `plitejs/authored` recorder | The framed law compares exact values | None | Step 7 | One windowed projection per recording | rearchitect |
| Suggesting refusal | Any element generator refuses Suggesting and previews | Only generated values a write cannot store refuse | `plitejs/authored` refusal | Writes make every other value | Registry toast unchanged | Step 10 | A schema outside the supported set still refuses | rearchitect |

## Failures and rollback

- Each pending suggestion stores a hidden spare block for each container it touches whose completion needs a generated value, about 60 bytes each, and only under such schemas.
- Under such schemas the recorder always inserts a fill instead of keeping a struck shell. Next refuses these schemas today, so no stored document changes.
- When two peers decide at once and the Yjs merge leaves a container empty, the remote commit's ordinary completion builds it with a fresh id, as concurrent Editing does. That is a merge, not a decision order.
- A built block's id can come from a rejected suggestion's spare. Ids carry no meaning to a reviewer.
- An editor without this plan refuses a saved document that holds spares ("A review mark is malformed"), and in a shared room it ignores them and decides as next does (`fence-base-a2.log`). Every peer in a room needs this version before Suggesting runs under `ElementIdPlugin`.
- Markdown and HTML exports of a container a projection empties now complete it, for every schema.
- Rejecting an Enter at a line's start drops a pending suggestion that only set the new line's id, as rejecting a mid-line Enter drops the right half's tags.
- Metadata keys whose target leaves out some type or reads the place, and compared values a split drops, stay lost at a line's start, as on next.
- A text-placement generator still runs inside resolution, as on next.

Phases A and B land as their own commits and keep the refusal, so each reverts alone. Phase C lifts the refusal and lands only after both; reverting C restores the refusal.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where a block a read or decision needs gets its values | A spare block the suggestion stored when it was written (look) | Keep a removed block emptied, which the first panel showed cannot meet the order law | survivors | big |
| How spares are keyed | By container type and construction slot, so a container that builds in two slots takes a spare for each (look) | By container, which builds twice in a details summary and gives ids by decision order | per container | small |
| Fencing older editors | The existing review mark check, which refuses spares at load; in a shared room an older peer ignores them (look) | A new storage revision, which would also stop this editor loading every saved document under Plate's block ids and joining existing rooms | storage revision | big |
| Which metadata a line's start gives back | Keys every element holds at every place, such as Plate's block id (look) | Every metadata key, which needs a design for a type that cannot hold the value | every metadata key | small |
| Projection without an editor | Keep it, without completion, as on next (look) | Remove it, so every read completes | remove schema-free projection | small |
| Text-placement generators | Keep next's behavior (safe) | Refuse Suggesting for them | refuse text generators | small |
| The AI chat's preview of selected blocks | Project those blocks as today, spares included (safe) | Project the whole document, then pick the blocks | whole-document preview | detail |
| Id lookups under a preview | Read stored ids, as on next (safe) | Index the view being read | view index | detail |
| Fills under a generating schema | Always insert a fill (look) | Keep a struck shell when its values match | keep shells | detail |
| Delivery | Phases A, B and C land as their own commits, C last | One commit for the plan | one commit | detail |

## Steps

The build runs under the Build playbook on this worktree's branch. Phase A is steps 1 to 5, phase B is steps 6 to 9 and phase C is steps 10 to 13; each phase lands as its own commit and ends with a keep, revert or quarantine call in the decision log.

- [ ] 1. **The order check builds generated ids and moves.** `authored-decision-order.ts` takes `--schema=generated`, a quotes schema whose every element gets an id from a counting generator and whose `align` has a counting validator, and a `move` option. Its comparison covers ids, review members and the `authored-reserves` records, and every run asserts that a decision calls neither counter. Proof: with the refusal switched off in a probe copy at `be4cac3bd5`, the generated run reports ids that differ by decision order and generator calls inside decisions; the plain run keeps `pnpm check:authored-order`'s baseline.
- [ ] 2. **Line-start metadata.** In `tree/resolve.ts`, a standing line takes the emptied line's decided metadata values for keys whose target holds on every element type at every place, composes them through chains and drops its own format tags on those keys. Proof: under a key that targets every element, a rejected Enter at a line's start gives back the line's value, alone, with a proposal on the new line's value, and after two Enters, in every order that applies; diff round 3's two cases of Generated values (`panel/diff-r3/probe/zz-diff-r3.test.ts`, with that key and with a paragraph-only key) store the same lines in every order and decide each rejection alone; a paragraph-only key stores the lines `be4cac3bd5` stores; the cases that give back fail at `be4cac3bd5`; the order check keeps its baseline.
- [ ] 3. **Validity table.** The cover pass, the table and its readers, as Main changes says. Proof: the decide probe (`cv-r2/premises/p3-decide-validate-a3.log`, 6 or 7 validator calls per decide at base) counts none during decide, previews and projections, and the carried value lands or drops as at base; a value written by a collaboration update and by an undo lands the same way; the law check throws on a planted miss.
- [ ] 4. **One resolve schema.** `storedResolveSchemaOf` replaces the two resolve schemas, the capability projection completes through it, and `exportDocx.tsx` passes its editor. Proof: `probe-export-struck` exports schema-valid Markdown, HTML, DOCX and detached Markdown for a quote whose only line is crossed out, red at `be4cac3bd5` for Markdown (`probe-export-struck-base-a1.log`); the `platejs` Markdown, HTML and DOCX authored export tests pass.
- [ ] 5. **Close phase A.** The writing passes, the panel on the diff (reviews: push, for Plite core), the proofs replayed on the final bytes and the landing through `land.mjs`.
- [ ] 6. **Spare blocks.** The spare member, the root record set, the write rule in the recorder, admission's load repair, taking a spare in completion and settling in decisions, as Main changes says. Proof: the order check under `--schema=generated` at `--blocks=2 --changes=2 --marks=2`, at `--changes=3 --marks=3` and with moves finds no order difference and no set decidable only together, and no decision calls the generator or adds a spare; the architect replay's cases, `q[a{del A}, b{del B}]` from two peers, `q[a{del A}, b{ins B}]`, `q[a{del A}, b{del B}, c{ins C}]`, `q[a{del A}, b{del B, del D}]` and the crossed pair of quotes, store the same bytes in every order; a quote holding an image and a paragraph, both deleted and accepted, stores one paragraph; the hand-written details tree (`cv-r2/premises/p4-handmade-a1.log`, ids by order at base) stores one id per slot in every order; a plain schema stores no spare and keeps next's bytes.
- [ ] 7. **Command values.** The closing pass, `as` and its settling. Proof: the recording laws under a generating id, with the refusal switched off in a probe copy and the instrument fixes (the support file stops stripping ids, the five closed schemas get the id property, `framed-diff.mjs` compares structure), give no framed-law mismatch (8 at base, f-24 among them) and no `diverged` refusal (f-27, twice at base, `laws/laws-genid-off-ids-a1.log`); an Enter's right half holds the id the command made; a heading retyped to a paragraph under an id that targets paragraphs only shows the frame's id; stored ids stay unique after every commit of `probe-dupes`; two Yjs peers that each suggest and decide store the same bytes in both delivery orders.
- [ ] 8. **Scale gate.** Under `benchmark`'s pre-acceptance probe: typing 200 characters in Suggesting into a paragraph of 1,000 and 10,000 paragraph documents, a suggested Enter there, and deciding one of 100 pending suggestions in a 1,000 paragraph document. Budget, frozen now: each within 1.3 times the same work under the same schema without the id property at `be4cac3bd5`, through `paired-timing.mjs` with a planted arm and a same-code arm per cohort; work indicators, spares written per keystroke and windows the closing pass projects; guards, the right half's id and the decided bytes. A conclusive miss sends the spare or closing-pass row back to `architect`.
- [ ] 9. **Close phase B.** The writing passes, the panel on the diff (reviews: push, for Plite core), the proofs replayed on the final bytes and the landing through `land.mjs`.
- [ ] 10. **Narrow the refusal.** `generatedSupport(schema)` replaces `constructsValues` in the recorder, `setView` and the projection refusal, and refuses only the properties Hard cuts lists. Proof: `packages/plitejs/test/authored-refusal.test.ts` records Suggesting and projects under the generating metadata schema, and still refuses each refused kind through `setView` and a forced proposal; typecheck of `plitejs`, `platejs` and `www`.
- [ ] 11. **The ask.** Proof: a `platejs` test under `ElementIdPlugin` with `paragraph` declared records a suggested Enter at a line's start, middle and end, inside a link at offset 1, in the text after it and in a quote line; each proposed view equals Editing's frame with ids, accepting equals Editing, rejecting restores the original bytes, previewing and projecting twice show the same ids with no generator call, and stored ids stay unique; the card's own probe, `docs/plans/artifacts/cut-join-values/generated-id-probe-v2.test.ts`, changes `paragraph[p1]`; `docs/plans/artifacts/cut-join-values/storage/table/s7.sh <worktree> genid` passes every row with and without `ElementIdPlugin`.
- [ ] 12. **Docs and the API law.** `content/docs/(guides)/authored-changes.mdx` and its `.cn.mdx` twin, and `content/docs/(guides)/editor.mdx`, through `plate-docs`: which generated properties Suggesting supports, that exports complete emptied containers, and the new refusal code; `docs/plans/topics/persistence.md` on spare blocks in saved documents; `best-api repair` on the refusal code; changesets for `plitejs` and `platejs`. Proof: the docs checks and preview of each page and its twin, `best-api repair`'s mirror proof and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`.
- [ ] 13. **Close.** The writing passes, the panel on the diff (reviews: push, for Plite core), the acceptance proofs replayed on the final bytes, the fold into the authored subject file, the S7 item of [Cut-join storage](2026-10-21-cut-join-storage.md)'s Open work replaced by `s7.sh`'s result, and the landing through `land.mjs`.

## Proof

Each step's proof above closes its box. Base controls that ran before the build, all in `docs/plans/artifacts/generated-id-split/`: accepting a whole-paragraph deletion that empties a quote calls the id generator once inside the decision (`resolve-mint-head-a1-a1.log`); the proposed Markdown export of a quote whose only line is crossed out throws on next for every schema (`probe-export-struck-base-a1.log`); the recording laws under a generating id with the refusal off give 8 framed mismatches and 2 `diverged` refusals (`laws/laws-genid-off-ids-a1.log`); a pending move throws in every id lookup (`probe-dupes-a1.log`); the card's Enter is refused at base (`repro-head-a1.log`). The premises the design rests on ran on real code (`cv-r2/premises/`): Yjs merges two peers' review members as a union (`p1-yjs-union-a1.log`); today's editor refuses a storage revision it does not know, and a changed fingerprint refuses saved documents and rooms (`p2-storage-revision-a2.log`); a decision calls validators through decide's check, the commit's construction check and `heldProps` (`p3-decide-validate-a3.log`); a hand-written details tree builds once per slot with ids by order (`p4-handmade-a1.log`), while recordings fill those slots at write time (`p4-details-ids-a2.log`); an editor of today refuses an unknown review member at load and ignores it from a Yjs peer (`fence-base-a2.log`); a decision that empties a box calls a text-placement generator once, which this plan leaves as on next (`textgen-base-a2.log`).

## Challenge delta

Plan panel round 1 (Opus, Astra and Sol at xhigh) read the survivor draft and found it could not meet the stop. A stored survivor can only mean "shown when these changes are accepted", while the need for a block can turn on a rejection (all three seats). A survivor kept an image whose required `url` an accepted deletion removed (Opus, Astra). Equal `copy: 'drop'` values were taken as move identity (all three). A validity table filled at load and commit missed detached inputs (all three). A retype under a paragraph-only id got its id from a canonical step the recorder skips (Astra, Sol). Exports without an editor still projected childless quotes (Astra, Sol). Validators still ran in decide's check and the export checks (Sol, Astra). Text generators had no source for an empty leaf (Sol, Opus).

The third architect replay (Opus, Astra and Sol runners, an Opus cross-judge, all at xhigh) designed again against those findings. The judge picked the Opus runner's stored spares and found its order proof false for a container that builds in two slots, which keying spares by slot closes; the details case reaches it only through a hand-written tree (`p4-handmade-a1.log`). The plan takes two more grafts, slot keying from the Astra runner's design and, from the Sol runner's, a decision commit that reads the validity table instead of calling validators. It leaves out a storage revision, because the premise run showed one would stop this editor from loading saved documents and joining rooms. It leaves out the whole-document AI preview and the view index as Defaults. The pick came from one model family's runner and judge, so the next panel attacks it with seats of the other family.

Generated values' third diff round reverted its line-start fix, which joins this plan as step 2 for keys every element holds, so no taken value can be dropped or waited on.

## Open work

- `ElementIdPlugin` lookups read stored ids under a preview, as on next for every id, so under the proposed view a moved block's shown id names its struck original. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- Whether text-placement generators should refuse Suggesting. owner: zbeyens, through a suggested task. stop: that task's decision.
- Metadata keys that some element type cannot hold, and compared values a split drops, at a line's start. owner: the suggested task Generated values offers. stop: none in this plan.

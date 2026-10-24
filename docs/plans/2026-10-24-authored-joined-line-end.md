---
review_scopes: [authored]
verdict: pursue
review_basis: [2026-10-22-emptied-line]
work_kind: implementation
review_commit: 05b58b8c9a589fc89d7c9996d0593a24bfbb99dd
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, docs/plans/topics/authored.md, docs/plans/2026-10-22-emptied-line.md, docs/plans/2026-10-24-framed-recording-accept.md, docs/plans/2026-10-23-construction-values.md, docs/development/enforcement.md, packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/resolve-schema.ts, packages/plitejs/src/authored/tree/alignment.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/authored/ledger/level.ts, packages/plitejs/src/authored/ledger/runs.ts, packages/plitejs/src/authored/ledger/preview-lens.ts, packages/plitejs/src/core/representation.ts, packages/plitejs/scripts/authored-decision-order.ts, packages/plitejs/test/authored-plugin.test.ts, packages/plitejs/test/authored-tree-recording-laws.spec.ts, packages/plitejs/test/react/authored-preview-selection.test.tsx]
review_upstreams: ['../prosemirror-changeset@e215757276357b64cf74f536552f3a5ef292fa1a']
---

# Typing at the end of a line a pending join pulls up

Status: planning: plan round 2 on the revised plan, then the build once the framed-recording plan lands
Playbook: plan

Pursue, on the map from the stored tree to the preview. Where the map cannot match content by identity, it pairs tokens by shape, and the empty lines completion builds to fill a root or a container have the same shape as stored lines. So the end of a line a pending join pulls up can pair with the closes of the line built after it, and a letter typed there lands in the built line, or the framed law throws. Two rounds of better shape rules on this task each broke other edits, and earlier sessions reverted the same family twice. The resolver already knows which nodes it built, as the same objects the map reads, and drops that fact once it has used it. The fix carries the built nodes its final children still hold to the map, which takes them out before any matching and inserts them back after, so no pass can pair a stored token with a built one. A caret in a built line has no stored place, so it is stored at the end of the text before that line, leaning forward, and the preview draws it in the built line.

## Brief

### What will change?

For your ledger-law task, when another author's pending suggestion pulls a line into the one above, a letter typed at the end of that line stays there. Today it lands in an added empty line, or the edit throws.

### What could go wrong?

Edits beside the lines the page adds could land differently, since those lines no longer match stored ones. The expected-results table, both test suites, the laws and a seed search check that. Nobody tries it in a browser.

## Teach

A review document keeps pending suggestions as marks on one stored tree. You edit a preview where they are all accepted. When accepting leaves a root or a quote with fewer lines than it needs, the preview adds empty lines to fill it.

After each edit, the recorder maps the preview back to the stored tree. Where it cannot tell where a preview piece came from, it guesses by shape, and an added empty line looks like any stored line. So a letter typed at the end of a joined line can land in the added line after it.

The part that builds the preview knows which lines it added. Now it passes that list to the map, which sets those lines aside before matching and adds them back as new lines. A caret in an added line is kept at the end of the line before it.

## Public API

No public call changes. Inside plitejs, the map takes the resolve result's children together with the lines it built, so no caller can drop them.

```ts before
// packages/plitejs/src/authored/ledger/runs.ts, resolveRun
const { aligned, change: alignment } = changeOf(aligning, output, context);
```

```ts after
// packages/plitejs/src/authored/ledger/runs.ts, resolveRun
const { aligned, change: alignment } = changeOf(
  aligning,
  resolution ?? { built: NOTHING_BUILT, children: output },
  context
);
```

## What other editors do

Read `prosemirror-changeset` at e215757 in source. The other editors have no review mode in core, and their review features were not read.

| Editor | How it knows what an edit added | Where it matches by content | Read |
| --- | --- | --- | --- |
| ProseMirror (`prosemirror-changeset`) | Each step's map records the ranges it inserted and deleted | Only inside a changed range, to shrink it to the real difference; its own docs say that match can shift with range boundaries | Read in source |
| Lexical | No review mode in core | Not applicable | Inferred, not read |
| Slate | No review mode in core | Not applicable | Inferred, not read |
| Tiptap | Built on ProseMirror; its review features were not read | Not read | Not read |

This plan takes ProseMirror's split. What an edit added comes from the edit, and content matching runs only on what is left.

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| The resolution carries the built nodes its final children hold | Plite | `plitejs` authored, `tree/resolve.ts` | Only completion knows which nodes it added |
| The map sets built subtrees aside before matching | Plite | `plitejs` authored, `tree/alignment.ts` | The map owns pairing stored content with accepted content |
| No written-window reuse for a slot whose replaced run built a line | Plite | `plitejs` authored, `ledger/level.ts` | A written run has no resolution, so no built set |
| A caret in a built line is stored at the end of the text before it, leaning forward | Plite | `plitejs` authored, `ledger/preview-lens.ts` | The lens maps carets between the preview and the stored tree |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Typing at the end of a joined line, in an empty joined line, or after an inline that ends one, in a root, a quote, a titled root or a named root | The letter stays in that line in both intents | Rows P0-1, P0-2, P0-4, P0-5, P1-1, P1-2 and C1 to C5 and their suite tests, jsdom; unproven in a browser |
| Enter at the end of a line joined into a quote, then a letter | The new line lands in the quote | Row P1-3, jsdom; unproven in a browser |
| A caret in the line the page adds after a joined line | Stays in that line after an edit elsewhere | PR 5218's preview-selection tests in the React suite, jsdom |
| The caret after both joins are accepted | Stays at the start of the line after the quote | Row G-7, jsdom |

## Main changes

- `completeLevel` adds every node completion builds to a set, and the resolution returns the members its final children still hold. A line a later completion flattens away, or a fill a level builds and then drops, is not among them. `resolveAuthoredValue` returns the union over its roots, since each root's children hold only their own nodes (`packages/plitejs/src/authored/tree/resolve.ts`).
- The stored-to-accepted map takes the settled children with that set. It takes the built subtrees out before the structural walk, the character alignment and the fallback diffs, aligns the rest with today's passes, then composes the change that inserts them. A run with a built line can now pass the structural walk, which always failed on it. Under the test environment the map throws when the children it reads hold fewer members than the set, as the framed law does; elsewhere a missing member is paired by shape as today (`packages/plitejs/src/authored/tree/alignment.ts`, `packages/plitejs/src/authored/ledger/runs.ts`, `packages/plitejs/src/authored/authored.ts`).
- When a level replaces slots, each new pending slot is marked if a run it replaces built a line or was itself marked, and a run the commands wrote is not adopted for a window holding a marked slot, so the normal resolve supplies the set. Each level marks its own slots (`packages/plitejs/src/authored/ledger/level.ts`).
- Mapping a stored caret to the preview with an explicit forward lean, at the end of a text whose next text starts a block with no stored node, puts it at the start of that block. A collapsed caret with no lean maps as today (`packages/plitejs/src/authored/ledger/preview-lens.ts`).
- `acceptedChange`, which nothing calls, is deleted.

## Expected results

Each row runs in Editing and in Suggesting through the authored plugin and its Proposed view. "Joined" means carol's pending join of that line into the line before it. "On next" is commit 05b58b8c9a. The table check is a probe in the run folder; each failure mode a slice fixes also becomes a suite test.

| Row | Rank | Start | Operations | Result | On next |
| --- | --- | --- | --- | --- | --- |
| P0-1 | P0 | Root needs 3 lines: ab, cd joined, ef joined | Type x at the end of ef | abcdefx, then two empty lines | Fails |
| P0-2 | P0 | Root needs 2: ab, cd joined | Type x at the end of cd | abcdx, then one empty line | Fails |
| P0-3 | P0 | As P0-1 | Type x in the middle of ef; on a second copy, at the end of ab | abcdexf or abxcdef, then two empty lines | Passes |
| P0-4 | P0 | As P0-1 | Type x at the end of ef, then y | abcdefxy, then two empty lines | Fails |
| P0-5 | P0 | Two-block root: ab, cd; carol suggests Backspace at the start of cd | Alice types after d in a framed Editing step | The letter stays in the joined line, and the ledger equals the kernel | Fails |
| P1-1 | P1 | Root needs 2: ab, an empty line joined | Type x in the empty line | abx, then one empty line | Fails |
| P1-2 | P1 | Root needs 2: ab, a joined line that holds the link ef | Type x after the link | ab, the link ef, x, then one empty line | Fails |
| P1-3 | P1 | Root needs 2: quote(ab), cd joined | Enter at the end of cd, then X | quote(abcd, X), then one empty line | Fails |
| C1 | P0 | Quotes need 2: quote(ab, cd joined) | Type x at the end of cd | quote(abcdx, an empty line) | Fails |
| C3 | P0 | Titled root: title(ab), cd joined | Type x at the end of cd | title(abcdx), then one empty line | Fails |
| C4 | P0 | A named root that needs 2: ab, cd joined | Type x at the end of cd | abcdx, then one empty line | Fails |
| C5 | P0 | Root needs 2: ab, cd joined by alice herself | Type x at the end of cd | abcdx, then one empty line | Fails |
| L-1 | P1 | As P0-2, the caret at the end of cd leaning forward | Type x | abcdx, then one empty line; the lean moves only where the preview draws the caret | Fails |
| L-2 | P1 | As P0-2 | Type x, then y | abcdxy, then one empty line | Fails |
| D-1 | P1 | A group of exactly two cells, a and b, after a paragraph; carol suggests removing a | Type x, then y at the end of b | group(bxy, an empty cell) | Fails |
| G-1 | P0 | Root needs 1: quote(ab), bold cd joined | Enter at the start of cd | quote(ab, bold cd) | Passes |
| G-2 | P0 | As G-1, root needs 2 | As G-1 | quote(ab, bold cd), then one empty line | Passes |
| G-3 | P0 | Root needs 1: an empty line, bold cd joined | Type X in the empty line | bold Xcd | Passes |
| G-4 | P0 | Root needs 2: quote(an empty line), bold cd joined | Type Y in the quote's line | quote(bold Ycd), then one empty line | Passes |
| G-5 | P1 | Quotes need 2: quote(ab, cd joined), ef joined, gh | Type y at the start of gh | quote(abcdef, an empty line), ygh | Passes |
| G-6 | P1 | quote(bold cd), an empty plain line joined | Type x at the end of cd | quote(bold cdx) | Passes |
| G-7 | P1 | As G-5 | Caret at the start of gh, accept both joins, type y | Stored quote(abcdef, an empty line), ygh | Passes |
| G-8 | P1 | quote(quote(ab)), where carol inserted ab and suggests the outer quote, which was a paragraph | Reject both together | Applied, giving one empty line | Passes; the built set must not throw |
| E-1 to E-5 | P1 | Root needs 2 or 3 beside joined lines | Enter in the first line, at the end of it, at the start or end of the joined line, or at the end of the last of two | Fails as on next, or records what it shows; Enter itself writes nothing and drops the caret, as on next | Fails |
| F-1 | P0 | Titled root: ab, cd, quote(ef, gh) | Suggest a break after a, then an Editing delete from a to g | Accepting everything gives what the commands wrote | Fails; the framed-recording plan fixes it |
| F-2 | P0 | The history fast-check seed 1144417495 once found | The pinned plain-editor test | Suggesting gives what a plain editor gives | The pinned test fails; the seeded law passes, because its runs no longer reach the history; the framed-recording plan fixes it |
| F-3 | P0 | Ledger seed 1936384615 | The main and titled ledger laws | The ledger equals the kernel | Fails; the framed-recording plan fixes it |
| F-4 | P1 | Ledger seed 1806324954 | The ledger law's own oracle | The oracle projects with each root's own schema and names its root | Fails, because the oracle used a schema without titles; the framed-recording plan fixes the oracle |
| K-a | P1 | quote(ab, cd), ef; alice suggests deleting from a to e | A remote edit moves a after c, then shifts a child | The remote commit's review delta names alice's change | Fails; its own task |
| K-b | P3 | Random fast-check seeds | The undo law | It compares more than 24 histories | Fails at some seeds; open work |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Built-node provenance | `completeLevel` reads `completion.built` to wait on it, then drops it (`tree/resolve.ts:2184-2192`) | The resolution carries a `ReadonlySet<JsonNode>` of the built nodes its final children hold, by identity | `tree/resolve.ts` | Only completion knows what it built, and its nodes reach the final children as the same objects | Internal; `AuthoredResolution` gains the set, and its one script reader is unaffected | The premise probe, G-8, then the table | A later pass rebuilds a built node, which then pairs by shape as today | rearchitect |
| Stored-to-accepted map | `characterAlignedChange` pairs every unmatched token by `sameShape` (`tree/alignment.ts:242`, `:284`) | Callers pass the children with the set; the map sets built subtrees aside, aligns the rest with today's passes and composes their insertion | `tree/alignment.ts` | It removes the guess instead of ranking it | `ledger/runs.ts:403-414`, `authored.ts:677`, `authored.ts:1042` and the laws spec's `decidedAlignment` | The table's P0 and P1 rows, the laws, a seed search | A built node inside a stored element's text run | rearchitect |
| Written-window reuse | A run the commands wrote is reused without a resolve when its output fits (`ledger/level.ts:368`) | Refused for a window holding a slot whose replaced run built a line | `ledger/level.ts` | A written run has no resolution, so no built set | Internal | P0-4, D-1, the ledger law, speed lines L1 to L3 | More resolves on those slots | gate |
| A caret in a built line | The tail pairing sends the joined line's stored end into the built line (`ledger/preview-lens.ts:167-227`) | A forward lean at that stored end shows in the built line | `ledger/preview-lens.ts` | Separation removes the pairing that placed it | Internal | PR 5218's preview-selection tests | A forward lean set by another command shows in a built line | rearchitect |
| `acceptedChange` | Exported, no caller (`tree/alignment.ts:628`) | Deleted | None | Dead code | None | Typecheck and a `git grep` | None | cut |

The gate row's probe is the speed lines below, frozen before building. They read the ledger's work counters (`ledger/work.ts`). Each line runs on next first, and a conclusive miss sends the target back to `architect`.

- **L1.** With nothing built in a run, every counter the authored work test reads equals next's for typing, a range delete and a decision at 2,000 blocks, and a new `setAsideNodes` counter stays at 0. Control: a planted gate that refuses every written window must fail L1.
- **L2.** On a root of 2,000 paragraphs then quote(ab, cd joined), where quotes need 2, 20 letters typed inside cd in each intent resolve at most one more run per key than next does, read from `resolvedRuns`. Control: a planted arm that resolves each run twice must fail L2.
- **L3.** On L2's document and P0-1's, in the proposed and accepted previews, `setAsideNodes` per key stays at most that key's `resolvedNodes` plus `writtenNodes`, so setting lines aside reads only the run. Control: a planted pass that sets aside over the whole root must fail L3 on L2's document.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How typing beside added lines is fixed | Added lines are set aside before matching, so typing stays in its line (look) | A better guess at which lines match | shape rules | small |
| Where a caret in an added line is kept | At the end of the line before it, leaning forward (look) | A separate place number for each added line | caret number | small |
| An added line missing from what the map reads | Tests stop on it; elsewhere the edit matches by shape as today (safe) | Stop everywhere | stop always | detail |
| Failures the random search finds in other parts | Each goes to its own task, so this run stays on line ends (look) | Fix them in this run | fix here | small |
| Enter beside an added line, apart from the quote case | Stays with its own task (look) | Fix every Enter case here | fix enter here | small |
| Where the table check lives | In the run folder, with each fixed failure mode also a suite test (safe) | Commit the table check as a test | commit the table | detail |
| Speed check | Count the work at 2,000 blocks against limits set before building (safe) | Also time it on a large document | time it | detail |
| Landing | The whole design as one slice, after the framed-recording plan lands (safe) | Land the built set alone first | split slices | detail |
| The authored page link | A new page at https://claude.ai/artifact/76WBiPNpgcW9rHMoxesgct, because https://claude.ai/artifact/C5zrU46DjyucvH1hwC3jHP no longer opens for this account (safe) | Go back to the old page | old page | detail |

## Steps

- [ ] **1. Build.** The resolution's built set, the map's separation and its test-only throw, the written-window gate, the lens rule, and the `acceptedChange` cut. Proof: the premise probe on the slice's tree finds every surviving built node in the set, and typecheck and lint pass.
- [ ] **2. Tests.** Round 1's three alignment tests and the pinned history (P0-5) come back, the history in the ledger law's two-block root. Each failure mode the table fixes that no suite test catches gets one test, such as a container's fill (C1), a deferred fill (D-1) and a consumed built line (G-8). Proof: each new or restored test fails at next in a detached worktree and passes on the slice, P0-4 and D-1 fail with the written-window refusal removed, and the mark's carry from an already marked slot keeps a test that fails without it or is cut.
- [ ] **3. Proof.** The table check passes every P0 and P1 row apart from K-a in both intents, and the Enter guard rows fail as on next or record what they show. The recording laws pass at the default seed and at seeds 5, 1936384615 and 1806324954 and fast-check seed 1144417495, with the plitejs Bun suite, the React vitest suite and the decision-order gate at its gate bounds, three marks and three blocks. Speed lines L1 to L3 pass, each with its control. A fresh-seed search runs in rounds of six seeds through `proof.mjs`. Proof: their logs.
- [ ] **4. Ship.** Writing passes, the push panel on the diff, and one `land.mjs` run. Proof: the panel's rows and the landed commit.
- [ ] **5. Close.** The subject's rules gain the built set and the lens rule, then the Close, the fold and a second land. Proof: `review-ledger.mjs check` and a `--folded` render.

## Open work

- K-a. A remote commit that moves and shifts nodes under a pending range delete reports an empty review delta where the kernel counts the delete as changed, as on next. owner: zbeyens; stop: suggested task t_235e0cbb lands or is dropped; tracked: suggested task t_235e0cbb.
- K-b. The undo law's floor of 24 compared histories fails at some random fast-check seeds, because the generator sometimes samples too few undoable histories, as on next. owner: zbeyens; stop: the law's next change; tracked: this plan.
- Enter beside a line the page adds, other than row P1-3, stays with suggested task t_9cb6f7a6. Enter there writes nothing and drops the caret, as on next. owner: zbeyens; stop: t_9cb6f7a6 lands or is dropped; tracked: the suggested-task ledger.
- Spares. A spare a read or decision takes has no stored tokens either, so it must join the built set where completion places it. The construction-values plan's sentence that keeps a taken spare out (`docs/plans/2026-10-23-construction-values.md`, Spare blocks and Reads and decisions take spares) is wrong for this design. owner: zbeyens; stop: that plan's step 6 lands spares; tracked: this plan.

## Evidence

Model: claude-opus-5-5 at xhigh effort, from this session's lead rows.

### Requirements

- The framed law says accepting a framed recording gives what its commands wrote (`packages/plitejs/src/authored/authored.ts:466-485` at the review commit).
- The ledger law says the review ledger equals the kernel after every step, undo, redo, decision and remote commit (`packages/plitejs/test/authored-tree-recording-laws.spec.ts`).
- Completion fillers exist only in the preview, and no stored key names them ([the authored subject](topics/authored.md), line 196 at the review commit).
- The map runs for each changed run on every key, and its work stays proportional to the run. An earlier session's design where the resolver writes the map lost on 2026-10-17 because it paid a full resolve on every key (this run's recall of earlier sessions).
- Stored documents keep their shape, with no new mark kind or record.
- The decision-order baseline only shrinks (`.claude/skills/authored-decision-order/SKILL.md`).
- Each test keeps Bun's 5,000 ms deadline (`docs/development/enforcement.md:32`).

### Lanes

- **Control: keep shape matching.** It adds no artifact. Rejected, because rows P0-1, P0-2, P0-4, P0-5, P1-1 to P1-3, C1 to C5, L-1, L-2 and D-1 fail on next.
- **Better shape rules.** This task built two and reverted both after panel rounds. Closing the gap's front first missed P1-1 to P1-3. Pairing from the front with a rule for a joined first text crashed G-1 and typed plain in G-3 and G-4. Earlier sessions reverted head-first pairing on 2026-10-17 and rejected masking removed text leaves on 2026-10-19 (this run's recall). Rejected, because shape cannot tell a built line from a stored one.
- **Pair by the resolver's identity map.** Rejected, because it returns null for merged blocks, merged texts and some canonical replacements (read in `tree/resolve.ts` by two arena runners).
- **Store the built lines.** The recorder would write each fill into the stored tree. Rejected, because it changes stored documents and the cards they show, and the open construction-values plan already owns the spares completion takes.
- **Mask built tokens inside each matching pass.** Two arena candidates, scored 21 and 20 of 30 by the cross-judge. Rejected, because a masked token still sits in the gap, so pairing falls to the middle LCS.
- **Set built subtrees aside, then compose their insertion.** Picked, the arena's base at 24 of 30. Its grafts are the identity set, the gate on written windows, and the cut of `acceptedChange`, all from the 21-point candidate. The lead added the check for a missing built node. The judge also found that one mask design's written-window refusal missed deferred fills, which the slot mark covers, and that no candidate ran the decision-order gate, which step 3 runs.
- **A place number for each built line's caret.** PR 5218's arena picked it for its own design. Rejected here, because a forward lean at the stored end of the text before the line places the caret with no new stored field.
- **Strongest deletion: no fill lines in the preview.** Rejected, inferred: commands run on the preview under the schema, where a root below its minimum is not a valid document, and the subject keeps fillers as preview-only lines.

A prototype of this design in a scratch worktree passed every table row it ran, 28 in the first table and 15 in the second, the recording laws at every pinned seed, the authored plugin suite, the plitejs Bun suite of 6,154 tests and the React vitest suite of 1,953. Without the lens rule, three of PR 5218's 21 preview-selection tests failed. Without the survivor rule, G-8 threw. The premise probe ran on this run's tree. Every node completion built is the same object in the resolution's final children: 2 of 2 for P0-1's document, 1 of 1 for a quote's filler and 2 of 2 for a quote filler under a root filler. The table and the laws run only in jsdom, and nobody drives the change in a browser.

### Dependents

- `ai`, `comments`, `documents`, `exports`, `html`, `layout`, `persistence`, `react`, `suggestions` and `ui` are unaffected. None imports the alignment functions or `resolveAuthoredChildren` (`git grep` at the review commit), and the documents, cards and marks they read keep their shapes. The one reader of `AuthoredResolution` outside the tree is `packages/plitejs/scripts/authored-decision-order.ts`, which step 3's gate runs. The React preview reads carets through the lens, which PR 5218's tests cover.

### History

This review retains `2026-10-22-emptied-line`, the scope's head, and leaves its rule for emptied wrappers as it is. It takes over finding 4 of `docs/plans/2026-10-24-framed-recording-accept.md`, which moved it here after two panel rounds. It fits `docs/plans/2026-10-23-construction-values.md`, building at step 6 of 13: a spare completion takes has no stored tokens, so it joins the built set as a built line does. It read `../prosemirror-changeset` at e215757.

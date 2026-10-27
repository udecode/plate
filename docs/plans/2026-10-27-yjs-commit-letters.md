---
review_scopes: [collaboration]
verdict: pursue
review_basis: [2026-10-24-collaboration-empty-text-runs, 2026-10-25-yjs-split-repairs]
work_kind: implementation
review_commit: 79aa12d342298e89921694675681769625d6b31d
review_inputs: [packages/plitejs/src/yjs/core/replacement.ts, packages/plitejs/src/yjs/core/text-runs.ts, packages/plitejs/src/yjs/core/joins.ts, packages/plitejs/src/yjs/core/event-change-bridge.ts, packages/plitejs/src/yjs/core/change-bridge.ts, packages/plitejs/src/core/change/root-change.ts, packages/plitejs/src/core/change/builder.ts, packages/plitejs/src/history/history-replay.ts, packages/plitejs/src/transforms-text/delete-text-whole-blocks.ts, packages/plitejs/test/yjs/canonical-replacement-contract.spec.ts, .changeset/plite-yjs-attribute-keys.md, docs/plans/topics/collaboration.md, docs/vision/plite.md]
review_upstreams: ['../slate-yjs@69f3e0eaecc0b81049dc57e70403df60e7a10163', '../y-prosemirror@9200946f0ea455c681a7496c364ee998a9f064f7', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988']
---

# Typed letters stay new when a teammate deletes the old word

Status: planning: the design runners pick where the kept-letters fact lives, then a panel reviews this plan
Playbook: plan

Verdict: pursue. Typing a word over a selected word, while an offline teammate deletes the old word, loses the new word's first letters for everyone (plate#5279). The Yjs binding writes such an edit by comparing the old and new text and keeping what they share (`diffText`), so `Lisa` typed over `Lin` reuses the old `L`, and the teammate's delete removes it. The first fix in this triage run read every letter from the commit and kept a replacement's shared letters only when its changed range sat on node boundaries. Diff round 3 showed that the shape of a change cannot tell a value replacement from typing. A formatting edit beside a `replaceChildren` call moved the range off a boundary, which did worse than the base, and a selection that ends just outside a formatted word commits a whole-leaf removal that looks like a value replacement, which fails as on the base. The whole-node rule had already used its one replacement, so the panel rule reverted the fix and sent it back to planning. The strongest reason to pursue is that the reported operation loses a user's typed letters in every peer, and only the code that builds a change knows whether its letters are new or kept by value, so that fact belongs where the change is made.

## Brief

### What will change?

Your triage fix run asked for this issue's fix. A word typed over a selected word keeps all its letters when a teammate deletes the old word offline. Review round 3 sent the first fix back to planning.

### What could go wrong?

If the editor misjudges which letters it kept, a teammate's edit can land in the wrong place or a deleted letter can come back. Replacing content through the editor's value calls must keep working as it does today.

## Teach

In a shared document every letter has an identity. When a teammate deletes a letter, every copy of the document deletes that same letter, wherever it ends up.

Today the editor sends a change by comparing the old and new text and keeping what they share. Typing Lisa over Lin keeps the old L, so a teammate who deletes Lin also deletes that L, and everyone reads isa.

The fix makes typed and pasted letters new. Some changes really do mean keep what you can, such as replacing a node's children by value, or undo and redo rebuilding a block. Those must keep shared letters, so teammates' cursors and concurrent typing survive. The first try guessed which is which from the change's shape, and the guess failed twice. This plan has the code that makes the change say which it is.

## Public API

No public call changes shape. The markdown streaming recipe's call keeps its meaning: it replaces children by value, and the binding keeps the letters the old and new children share.

```ts before
// content/docs/(plugins)/(serializing)/markdown.mdx
tx.nodes.replaceChildren(nodes.slice(start), { at: [], index: start });
```

```ts after
// content/docs/(plugins)/(serializing)/markdown.mdx
tx.nodes.replaceChildren(nodes.slice(start), { at: [], index: start });
```

## Layer and owner

No public call changes. `tx.nodes.replaceChildren` keeps its meaning: it replaces children by value, and the binding keeps the letters the old and new children share, as the canonical-replacement contract tests and the changeset's sentence "Preserve shared character identity across compatible text replacements so remote positions survive canonical history replay" (`.changeset/plite-yjs-attribute-keys.md`) require. Text input, paste and text deletion keep theirs, and the letters they insert become new letters in Yjs.

The ownership flow this plan targets:

1. A transform builds the change: text operations for typing, paste and deletion, or a value replacement for `replaceChildren`, `replaceChildRuns`, history replay and root rewrites.
2. The change itself says which letters its author kept and which it wrote. The design runners pick how.
3. The binding writes exactly those edits to Yjs and infers nothing from the change's shape.

## Expected results

Each row is a two-peer case: peer A makes the edit, peer B deletes the old word offline, and both reconnect. "Base" is `next` at 79aa12d342, "Iteration 1" the reverted fix after diff round 2. Probe ids name cases in the run directory's probes; spec ids name the tests in the saved iteration 1 patch.

| Row | Priority | Case | Expected after reconnect | Base | Iteration 1 |
| --- | --- | --- | --- | --- | --- |
| R1 | P0 | The report: `Lisa` typed key by key over `Lin` in `Ada and Lin edit` | `Ada and Lisa edit` | fails | passes |
| R2 | P0 | The report, `Lisa` written as one input | `Ada and Lisa edit` | fails | passes |
| G | P0 | G1 to G4, G6 to G9, G12, G15, G16: words at line start and end, bold paste, a new bold leaf, a whole italic leaf, each typed and as one input | the new word whole | fails, except G13 and G14 pass | passes |
| H | P0 | H1 to H4, X1, X2, P1, P2: a selection across an italic leaf or a bold letter, typed, written once or pasted | the new word whole | fails | passes |
| C | P0 | C14, C5b, Q4, C5: a word between formatted leaves, typed, written once, or deleted and typed in one update | `Ada and Lisa edit` | fails | fails |
| V | P0 | B1, B2, G10, G11: `replaceChildren` over a leaf, with or without a formatting edit beside it in the same commit | the old word's shared letters are gone with the teammate's delete, as on base | passes | B1 and B2 fail |
| V2 | P0 | B2c, the same replacement without the formatting edit | as on base | passes | passes |
| K | P0 | The ten canonical-replacement contract tests, such as `alpha AdaLin fragment` after an offline `replaceChildren` and undo and redo after reconnect | pass | pass | pass |
| S | P1 | The twelve `[plate#5279]` spec cases: the report's edits plus the same edit inside commits that also retype, move, remove, insert or join blocks | the new word whole | the eight cases that existed then all failed | passes |
| W | P1 | G5: select a whole line and type a word key by key | the new word whole | fails | fails |
| E | P1 | The same word typed over itself as one input, or pasted | the word stays | fails | fails |
| Y | P0 | The plitejs Yjs test partition and its typecheck | pass | pass | pass |
| T | P2 | Typing cost per key in a shared document | within noise of base | n/a | not measured |

## What other editors do

The three editors were read at the commits in this plan's front matter and not run.

| Editor | How a typed replacement reaches the shared text | Does the new word reuse old letters? | Source |
| --- | --- | --- | --- |
| slate-yjs | It applies Slate's `insert_text` and `remove_text` operations as Yjs inserts and deletes | No | `BitPhinix/slate-yjs@69f3e0eaec:packages/core/src/applyToYjs/text/insertText.ts` |
| y-prosemirror | It diffs the two document values with lib0's `delta.diff` | Yes, inferred from the diff | `yjs/y-prosemirror@9200946f0e:src/sync-utils.js`, lines 384 to 387 |
| Lexical | It diffs each text node's old and new string, keeping the shared start up to the caret | Yes, for letters before the caret, inferred | `facebook/lexical@dd5c41b131:packages/lexical-yjs/src/CollabTextNode.ts`, lines 26 to 45 |
| Plite on next | It diffs old and new text runs with `diffText` when the writer gets no letter edits | Yes | `packages/plitejs/src/yjs/core/text-runs.ts` |

Only slate-yjs keeps typed letters new, because it never compares values. It has no value replacement that keeps letters, since Slate replaces a node by removing and inserting it.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What happens after the revert | Plan again, with a design comparison and a panel before any fix, as the review rule requires | Leave the issue open and ship nothing more | leave open | big |
| What a value replacement keeps | The letters the old and new value share, as the replacement contract tests require (look) | Every replaced letter becomes new, which drops the contract | new letters | big |
| Whole line typed, and a word typed over itself | Rows the design should meet; any it cannot meet stays open work with an owner | Out of this plan | drop extras | small |

## Steps

- [ ] 1. Architect: three runners design against the expected results, a cross-judge scores them, and the lead picks a base, grafts, runs each premise the pick rests on, and records the pick and the comparison here. Proof: the rationale and judge files in the run directory's architect round, and one premise log per premise.
- [ ] 2. Plan panel on this plan with three seats. Proof: the decision log's panel rows; each applied critical finding changes this plan before the build.
- [ ] 3. Build the pick with one test per P0 and P1 row it meets, each run at base first. Proof: each new test fails at base and passes on the build; the plitejs Yjs partition and its typecheck pass.
- [ ] 4. Writing passes over the diff and this plan. Proof: the decision log's writing row.
- [ ] 5. Diff panel. Proof: the decision log's panel rows.
- [ ] 6. Runtime proof: the report on the collaboration demo in Chromium and Firefox, five forced runs each, and a hand drive of the pages the change reaches. Proof: the run logs and the hand-drive check.
- [ ] 7. Land through land.mjs, then record and comment on #5279 with the other three issues. Proof: the landed commit and the issue comment.

## Evidence

### Requirements

- The report's Repro 1: after reconnect both editors read `Ada and Lisa edit independent documents through a local Yjs room.`, with `Lisa` typed key by key and again as one input.
- The canonical-replacement contract ([canonical-replacement-contract.spec.ts](../../packages/plitejs/test/yjs/canonical-replacement-contract.spec.ts)): a value replacement keeps the Yjs text node and the shared letters, so a concurrent remote append survives (`alpha AdaLin fragment`), and undo and redo after reconnect touch only the local replacement.
- The changeset's identity sentence in [plite-yjs-attribute-keys.md](../../.changeset/plite-yjs-attribute-keys.md), quoted under Layer and owner.
- The markdown streaming recipe in the `markdown.mdx` docs page calls `tx.nodes.replaceChildren` on every chunk, so value replacements run often in real use.

### Lanes

1. Stop and keep `diffText`. Every P0 report row keeps failing.
2. The strongest deletion: delete `diffText` from every write that has a commit and take every letter from the commit. The canonical contract and rows V fail, because `replaceChildren` records one replacement over the whole range; the run's mutant without the whole-node rule shows it (`5279-mutant-no-node-rule-r2-a1.log` in the run directory).
3. Classify each change section in the binding instead of each run, as an Opus seat suggested in round 3. It still reads shape, and rows C and V show that typing and a value replacement can leave the same shape.
4. The code that builds a value replacement records it in the change, and the binding compares texts only there and takes every other letter from the commit.
5. The code that builds a value replacement writes the smallest change itself, keeping the letters it shares, so every change already says which letters it kept and the binding reads only the commit.
6. Drop the identity rule, so value replacements also write new letters. Rejected: the contract tests and the changeset require it, and markdown streaming and history replay rely on it.

The pick comes from step 1.

### Earlier reviews

- 2026-10-24-collaboration-empty-text-runs: retains, because this plan keeps the empty text beside an inline and its fill, and changes only which letters a text write keeps.
- 2026-10-25-yjs-split-repairs: retains, because splits and joins keep their cut marker and write scope, and this plan changes only the compatible-replacement writer they share.

### Dependents

- Markdown streaming and any app that calls `tx.nodes.replaceChildren`, `replaceChildRuns` or a root rewrite: their letters must keep identity, rows V and K.
- History undo and redo through Yjs: the contract's undo and redo cases.
- distribution: unaffected, because its markdown paragraph plugin calls no Yjs code and no public call changes.
- ui: unaffected, because the example pages call the binding through its unchanged descriptor.
- editing: unaffected, because text input, paste and deletion keep their calls and model results; only what the binding writes to Yjs changes.

Model: Claude Opus 5.5 at xhigh leads; the runners and seats are named in the decision log.

## Open work

- Fallback lowering in `lowerDocumentChangeToYjs` still calls `reconcileYjsRoot` without the change, so a commit that falls back writes by comparing texts. Owner: zbeyens, the Yjs binding. Stop: the next fallback the trace records for a text edit.
- The Hocuspocus test server's owner across browser projects. Owner: the plite browser runner. Stop: a matrix run where one project's teardown stops the server another project's test uses.
- The whole-document read per update (benchmark row 18). Owner: zbeyens, the Yjs binding. Stop: the next Yjs typing benchmark.

---
review_scopes: [authored, suggestions]
review_basis: [2026-10-04-authored-audit, 2026-10-07-suggestions-editor-input]
verdict: pursue
work_kind: implementation
review_commit: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad
review_inputs: [docs/research/decisions/authored-change-ownership.md, docs/research/decisions/suggestion-review-semantics.md, docs/plite/research/2026-09-10-authored-changes/assessment.md, docs/plite/research/2026-09-10-authored-changes/skill-audit.md, docs/plans/2026-09-10-native-authored-changes-and-suggestions.md, docs/plans/2026-09-12-authored-loadable-state-design.md, docs/plans/2026-09-14-retained-deletion-editing.md, docs/plans/2026-09-17-authored-direct-editing-with-visible-suggestions.md, docs/vision/plite.md, docs/vision/plate.md, content/docs/(guides)/authored-changes.mdx, packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/decisions.ts, packages/plitejs/src/authored/markup.ts, packages/plitejs/src/authored/state.ts, packages/plitejs/src/authored/steps.ts, packages/plitejs/src/core/authored-runtime.ts, packages/plitejs/src/core/authored-fragment-view.ts, packages/plitejs/src/core/change/document-change.ts, packages/plitejs/src/core/change/root-change.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/react/editable/mutation-controller.ts, packages/plitejs/src/react/editable/model-input-strategy.ts, packages/plitejs/src/yjs/core/controller.ts, packages/plitejs/src/yjs/core/set-valued-attributes.ts, packages/plitejs/src/yjs/core/shared-effect-log.ts, packages/platejs/src/authored/AuthoredPlugin.ts, packages/platejs/src/features/suggestion/BaseSuggestionPlugin.ts, packages/platejs/src/features/find/lib/BaseFindPlugin.ts, packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts, packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts, packages/platejs/src/ai/react/AIChatPlugin.ts, apps/www/src/registry/components/editor/discussion.tsx, apps/www/src/registry/examples/version-history-demo.tsx, apps/www/src/registry/examples/playground-demo.tsx]
review_upstreams: ['../prosemirror-suggest-changes@653fba70ba29ef6ea6af3ad8d60244a58df7281b', '../y-prosemirror@9200946f0ea455c681a7496c364ee998a9f064f7', '../yjs@da0523008392f10b078bcbf7f056ec9a478c4585', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../manuscripts-track-changes-plugin@62f4d19dda4c2d41afa5d9fdecea840fb6bfb0be', '../libreoffice-core@760394bbadd6077379f9eef116e5ba87bb5cb31c', '../sdkjs@72b0421c0bbf9d01eed9cf14834ae47eb2df1b50', '../Open-XML-SDK@431ab05cf160248cc3885a4a766026d4f8243792', '../docx-redline-js@616b7f515c44a417f3700b84847ad6be21aeea74']
---

# Authored: one review tree the editor edits

Status: planning: paused at plan review after three panel rounds; waiting on your review
Playbook: plan

**Go with option 3, one document that holds the suggestions (Pursue, replacing the 2026-10-04 Stop).** Today crossed-out text lives outside the document you edit, so every click and keystroke in it needs special code. That one choice causes most of the bugs. Positions are tracked eight ways, edits save through a second path, and every accept or reject replays changes between two documents. No editor we checked works this way, and LibreOffice dropped the one design that tried it in 2018. Agents picked today's design by argument in September and never tested it against this one.

Three AI models each sketched a design, and a fourth judged them. The winner goes further than the verdict. It keeps no separate list of changes. Each piece of suggested text has a small tag with the change, the author and the time, and the change list comes from those tags. One function makes the accepted copy, the proposed copy and every accept or reject. The work has three phases, and the first one tests the risky parts before touching the real code.

Three review rounds agreed with the direction, and no reviewer wanted to keep today's design. They found three things this plan doesn't solve yet: plugin fix-ups inside a suggestion, like column widths that must add up to 100%; two people deciding competing format changes at once; and suggestions inside code blocks. A follow-up design will handle those. The teammate's doc, "Authored redesign: discussion with Ziad", reaches the same option, and this page changes five things in it (Reply to the design doc).

## Brief

### What will change?

Suggestions will live in the document you edit. Typing, deleting and pasting in crossed-out text will work like normal text, except in code blocks. The mode only decides whether your edit becomes a suggestion.

### What could go wrong?

We still need a design for how tables, columns and formatting behave in suggestions. You can't suggest edits inside a code block. Undoing someone's old accepted work and the conflict state go away. Nothing is built yet.

## Teach

Suggestions let someone propose an edit that others accept or reject before it counts. Deleted words show crossed out, and new words show highlighted.

Today the document you type in holds only accepted text. Suggestions go in a side log, the editor builds a second document from it, and each crossed-out run becomes its own tiny document. So the editor translates every click in crossed-out text between documents, and that is where most of the 55 fixes came from.

The plan keeps one document. Suggested text stays in place with a small tag that says which change, who and when. Typing works like any text, and the mode only decides whether your edit gets a tag. Accept or reject removes either the tag or the tagged text. Word and Google Docs work this way. The catch is plugins that fix things up on their own, like column widths, which still need a design.

![before](artifacts/2026-10-08-authored-review/teach-before.svg) ![after](artifacts/2026-10-08-authored-review/teach-after.svg)

## Public API

A mounted view sets how input is recorded. Every editable view shows the review tree; accepted and proposed previews are read-only, and the view type cannot express a suggesting preview.

```tsx before
// content/docs/(plugins)/(collaboration)/suggestion.mdx
<EditorRoot
  editor={editor}
  authored={{ intent: 'propose', projection: 'markup' }}
>
```

```tsx after
// content/docs/(plugins)/(collaboration)/suggestion.mdx
<EditorRoot editor={editor} authored={{ intent: 'propose' }}>
```

A read-only preview of the accepted or proposed document is a view input of its own.

```tsx before
```

```tsx after
// content/docs/(guides)/authored-changes.mdx
<EditorRoot editor={editor} authored={{ preview: 'accepted' }}>
```

A feature that reads live text near the caret asks for content explicitly, on both the step and the string read. Core reads stay raw; the content option steps over struck runs, returns points in the review tree and reads only live text, so input rules, mention and slash triggers, Find and AI context get live text without filtering it themselves. Phase 1 settles the option's name through `best-api`.

```ts before
// packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts
const afterPoint = state.points.after(selection, {
  distance: 1,
  unit: 'character',
});

return afterPoint
  ? state.text.string({
      anchor: selection.anchor,
      focus: afterPoint,
    }) || undefined
  : undefined;
```

```ts after
// packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts
const afterPoint = state.points.after(selection, {
  content: true,
  distance: 1,
  unit: 'character',
});

return afterPoint
  ? state.text.string(
      { anchor: selection.anchor, focus: afterPoint },
      { content: true }
    ) || undefined
  : undefined;
```

Copied review UI decides the change it rendered. The change object is the staleness token, so `select`, `AuthoredSelection`, the `conflicted` status, `resolve` and the uncalled `preview` go.

```tsx before
// apps/www/src/registry/components/editor/discussion.tsx
const input = {
  action,
  selection: authored.read.select({ ids }),
};
const result =
  latest.status === 'conflicted'
    ? authored.update.resolve(input)
    : authored.update.decide(input);
```

```tsx after
// apps/www/src/registry/components/editor/discussion.tsx
const result = authored.update.decide({ action, changes: [change] });
```

Saved suggestions load as a marked document through `initialValue`, so `createAuthoredReviewDocument` and its imported-revision types go.

```tsx before
// apps/www/src/registry/examples/playground-demo.tsx
initialValue: createAuthoredReviewDocument({
  accepted: baseline,
  revisions: [
    {
      id: 'playground1',
      authorId: 'alice',
      createdAt: createdAt - 900_000,
      change: DocumentChange.between(baseline, inserted),
    },
  ],
}),
```

```tsx after
// apps/www/src/registry/examples/playground-demo.tsx
initialValue: playgroundReview,
```

Selective revert of retained accepted work and the retention option go. Restoring earlier content compares the current proposed read with a saved revision and imports the result as one suggestion.

```tsx before
// apps/www/src/registry/examples/version-history-demo.tsx
const result = editor.update.authored.revert({
  selection: editor.read.authored.select({ ids: [change.id] }),
});
```

```tsx after
// apps/www/src/registry/examples/version-history-demo.tsx
const comparison = await compare({
  before: projectAuthoredDocument(editor.read.value(), { projection: 'proposed' }).document,
  after: savedRevision,
  schema: editor.read.schema,
});
const result = proposeAuthoredComparison(editor, { comparison });
```

```tsx before
// apps/www/src/registry/examples/version-history-demo.tsx
AuthoredPlugin.configure({ initialState: { retainHistory: true } }),
```

```tsx after
```

## Document shape

Applications save and load `editor.read.value()`, and serializers read it. Today it holds the accepted children and a codec-owned checkpoint with a second full document, two position indexes and every operation, accepted keystrokes included; one 14-character paragraph with one pending replacement saves 6,130 bytes (`docs/plans/artifacts/2026-10-08-authored-review/probes/saved-shape-a1.log`). After, the children are the review tree and nothing else. Struck and inserted text sit in place, each leaf or element carries its marks, and there is no `meta.authored`. Every mark of one change carries the same author and time, so the leaves of one change merge, and the loader refuses a document whose marks of one change disagree. A `format` mark carries both the previous and the proposed values of the keys it holds. A text inserted inside the writer's own pending element still carries its own insert mark, so a late edit is reviewable wherever it lands.

```json before
{
  "children": [{ "type": "paragraph", "children": [{ "text": "keep gone tail" }] }],
  "meta": {
    "authored": {
      "version": 6,
      "value": {
        "acceptedPositions": ["…"],
        "changes": ["…"],
        "documentId": "…",
        "operations": ["…"],
        "projected": { "children": [{ "type": "paragraph", "children": [{ "text": "keep NEW tail" }] }] },
        "projectedPositions": ["…"]
      }
    }
  }
}
```

```json after
{
  "children": [
    {
      "type": "paragraph",
      "children": [
        { "text": "keep " },
        { "text": "gone ", "authored": [{ "kind": "delete", "change": "c1", "author": "bob", "at": 1791460800000 }] },
        { "text": "NEW ", "authored": [{ "kind": "insert", "change": "c1", "author": "bob", "at": 1791460800000 }] },
        { "text": "tail" }
      ]
    }
  ]
}
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Mark types, well-formedness and the derived change index | Plite | `plitejs/authored` | One owner for change identity; the index derives from the marks and is never written on its own |
| Recording a canonical change by intent | Plite | `plitejs/authored`, called from the existing finish hook in `plitejs` core | `DocumentChange` stays the sole mutation truth; no command or plugin records anything |
| One resolver for accepted and proposed reads and for decide | Plite | `plitejs/authored` | Reads and decisions share one implementation; decide is one ordinary undoable transaction |
| Accepted and proposed reads | Plite | `plitejs/authored`, the pure resolver over any document | Exports, detached serializers and fragments keep one read; it reports that correction-derived values were not recomputed |
| Explicit content reads | Plite | `plitejs` core point and text reads | One owner for stepping over struck runs; raw reads keep their meaning |
| Struck-text caret, selection and input | Plite | `plitejs/react` | Struck text is ordinary text; the fragment paths go |
| Collaboration of the review tree | Plite | `plitejs/yjs` | Marks are set-valued attributes on the ordinary binding; the authored effect transport goes |
| Suggesting and Editing modes, mark paint | Plate | `platejs/suggestion` | Mode is view intent; paint reads marks through data attributes |
| Review cards, previews and the version history demo | Plate registry | copied UI | Cards call `decide`; the demo restores a saved revision |

## Hard cuts and app migration

These cuts follow from the Pursue on a review the owner asked for, so they are one `look` Defaults row rather than an open question. `pstack:blast-radius` names every remaining caller in Phase 2, and Phase 2 migrates every caller its cut breaks.

- Delete from `packages/plitejs/src/authored/`: `anchors`, `checkpoint`, `counterparts`, `decisions`, `fragment-index`, `fragment-order`, `history`, `intervals`, `markup`, `positions`, `positions-codec`, `projection-context`, `properties`, `read`, `record-tree`, `render`, `retained`, `selection`, `state`, `steps`, plus `isolate.ts` where natamox's branch adds it. `authored.ts`, `comparison.ts`, `format.ts` and `types.ts` are rewritten; `marks.ts`, `record.ts` and `resolve.ts` are new.
- Delete `core/authored-fragment-view.ts`, the fragment and view-selection paths for struck text in `react/editable/`, `projected-clipboard.ts`, `markup-selection.ts`, and the authored branches and effect type in `yjs/core/`. The generic shared-effect log stays.
- Delete the public nouns `select`, `AuthoredSelection`, `AuthoredStatus` and its `conflicted` value, `resolve`, `preview`, `revert`, `retainHistory`, `canPropose`, `AuthoredEditor`, `isAuthoredEditor`, `projection` on editable views, `projectAuthoredRange`, `projectAuthoredReview`, `AuthoredReviewProjection`, `AuthoredFormatProjection`'s `markup` value, `AuthoredFormatSegment`, `AuthoredFormatPropertyChange`, `authoredProjectionDiagnostics`, `createAuthoredReviewDocument`, `createAuthoredImportedRevisionChange`, `AuthoredImportedRevision`, `AuthoredImportedRevisionSection`, `parseAuthoredDocument`, `AuthoredChangeReview`, the decision history in `details()`, and identity-preserving moves.
- Named roots are never pending. Suggesting creates a root directly and suggests its content; suggesting a root's deletion strikes its content and keeps the root. No Plate product code creates or deletes a root with authored installed; the three raw Plite examples that create roots (`editable-voids`, `multi-root-document`, `synced-blocks`) do not install authored (`git grep`, 2026-10-08).
- A Suggesting edit whose recorded form breaks the schema, such as split leaves inside a code block that allows one text child, is refused as a whole transaction. How code blocks take suggestions, including refusing before the CodeMirror binding changes and Editing inside a struck code block, is open work for the follow-up iteration. Today's model can suggest inside code, so until then this is a loss.
- Saved authored documents from `next` builds stop loading, with an error that names the old format. No published release wrote them: `platejs@54.0.0-beta.1` shipped on 2026-06-17, before authored existed, and `plitejs` on npm is a 0.0.1 placeholder (`npm view`, 2026-10-08). Open work below reopens this if a release carrying authored ships before Phase 2 lands.
- Apps that read `editor.read.value().children` see marked suggestions. Every serializer already refuses an authored document without a projection, and `projectAuthoredDocument` gives the clean copy.
- App migration: replace `authored={{ intent, projection }}` with `{ intent }` or `{ preview }`; replace `select` plus `decide` or `resolve` with `decide({ action, changes })`; replace `revert` with a saved revision and `proposeAuthoredComparison`; replace `createAuthoredReviewDocument` with a marked `initialValue`; a plugin that reads live text near the caret passes the content option.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Caret and range selection in struck text | Native caret in ordinary text; no painted caret, dock point or view selection | unproven; Phase 1 Chromium, five warm runs |
| Typing and paste in struck text | Splits the deletion around the new text, in both modes | unproven; Phase 1 Chromium |
| Backspace and Delete in struck text | Editing removes it; Suggesting steps over it, Backspace leftward and Delete rightward | unproven; Phase 1 Chromium |
| IME in struck text and inside another author's insertion | Ordinary composition; a marked leaf split mid-composition is the named risk, with recording at commit as the fallback | unproven; Phase 1 Chromium through CDP IME |
| Native input repair with struck text present | The DOM-to-model comparison keeps reading raw text, so struck text never looks like an unrecorded insertion | unproven; Phase 1 Chromium fallback case |
| Enter and Backspace across a block boundary | A suggested split or join is a `split` or `join` element mark | unproven; Phase 1 package tests and Chromium |
| Typing or IME in a code block while suggesting | Refused when the recorded form breaks the schema; the refusal timing in CodeMirror is open work | unproven; follow-up iteration |
| Undo of a suggestion edit or a decision | Local history on ordinary operations; a step whose marks a peer already decided is skipped as a history conflict | unproven; Phase 1 package and two-client tests |
| Copy from the review tree | Suggesting copies proposed content; Editing copies visible text with struck text as plain text; marks never leave the editor | unproven; Phase 2 Chromium clipboard |

## Main changes

- The authored editor's document is the review tree. Text marks are `insert`, `delete` and `format`; element marks add `split`, `join`, `wrap` and `unwrap` for boundaries and enclosures. A `format` mark keeps the previous and proposed values of the keys it holds.
- `recordAuthoredChange` runs where `finish` runs today, after commands and corrections, and its result goes through validation. It classifies each section of the canonical change (a removal, an insertion, a property patch or a combination) and keys only on token kind, existing marks, intent and writer. Remote (`collaboration`) and history (`historic`) transactions and decisions pass through unrecorded. How plugin corrections and their derived values behave under a suggestion is not settled: recording before corrections, recording the corrections into the suggestion, and refusing suggestions that trigger them each failed a panel case (Open work).
- Text typed in Suggesting inside the writer's own pending element carries its own insert mark of that change, so a late typed insertion after a decision reappears as pending; a late deletion or format change inside one's own insertion still lands unreviewed, and one-text elements are exempt. Typing in Editing inside a whole-element strike pushes the element's delete mark down onto its children first, so the new text survives accept. Containment at an insertion's edge never inherits. An insertion takes another change's insert mark only when the text on both sides carries it. The writer's own insertion is amended at either edge in Suggesting. When a transaction forces a change ID through `propose({ changeId })`, as AI requests do, "own" means that change, not the writer.
- `resolveAuthored(value, outcome)` is the only implementation of accept and reject. A node goes when one of its insert marks is rejected or one of its delete marks is accepted. How format suggestions on one key coexist and resolve under concurrency is open work. A container whose live children fall below its schema minimum is repaired by hoisting its live content to the nearest level the validator accepts; live content is never removed, and when no level accepts it the decision is blocked and the read fails with an error. A decision whose result needs such a repair is blocked unless it includes every pending change on or inside the repaired container, and a blocked decision changes nothing. Decisions commute over the orders and batches that are not blocked.
- `projectAuthoredDocument(document, { projection })` stays the pure resolver over any document, so exports, detached serializers and saved files keep one read. It runs no plugin corrections, so a proposed read can differ from the decided document in correction-derived values such as column widths, and its diagnostics say so. A fragment is read by projecting the whole document and slicing it by node key, so a block under a struck table is not read as live.
- Core reads stay raw. A `content` option on point stepping and text reads steps over text under a pending `delete` mark and returns review-tree points; input rules, triggers, Find and AI context opt in.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Document model | Accepted roots, a projected document, struck fragment documents | One review tree with set-valued `authored` marks | `plitejs/authored` | One coordinate space for input, selection and decisions | Phase 2 cutover, every caller of the removed nouns | Phase 1 package, Chromium and two-client exits | Tables, columns and code blocks | gate |
| Change records | Operation log, change records, two position indexes | Index derived from marks | `plitejs/authored` | No second authority to sync | Phase 2 | Phase 1 property tests | Late edits reopen decided changes | gate |
| Recording | `finish`, `updateViews`, React per-fragment loop | `recordAuthoredChange` at the finish hook | `plitejs/authored` | Mode changes only recording | Phase 2 | Stop-rule import check, recording-table tests | Corrections and derived values under a suggestion, open work | gate |
| Decisions and reads | Replay across two documents, dependant rebase | One resolver for decide and for pure reads | `plitejs/authored` | Reads and decide share one implementation | Phase 2 | Commutation over admissible decisions, content preservation | Same-change concurrent decisions; reads that skip corrections | gate |
| Content reads | Projection per view; Find and AI inconsistent | Raw reads plus one explicit content option | `plitejs` core | A mistake shows struck text instead of corrupting a write | Phase 2 adoption in input rules, triggers, Find, AI | Input-rule, trigger and Find tests across struck text | A consumer that should opt in and does not | gate |
| View input | `{ intent, projection }` | `{ intent }` or `{ preview }` | `plitejs/react` | Editing only where coordinates are honest | Phase 2 docs, examples and AI | Type tests | AI drafts in editable projections today | rearchitect |
| Decision API | `select`, status, `conflicted`, `resolve`, `preview` | `decide({ action, changes })` | `plitejs/authored` | The rendered change is the staleness token | Phase 2 registry and docs | Package tests | Lost decision provenance | cut |
| Retained history | `retainHistory`, `revert` | Saved revision plus `proposeAuthoredComparison` | `plitejs/authored` and the copied demo | No reference editor reverts one author's old work | Phase 2 demo | Demo test | Users of selective revert | cut |
| Moves and roots | Identity-preserving moves, pending root lifecycle | Deletion plus insertion; roots never pending | `plitejs/authored` | No move replay; no node to mark for an empty root | Phase 2 | Package tests | Moves show twice in markup | cut |
| Yjs transport | Authored effect log, own CRDT | Ordinary tree binding with set-valued marks | `plitejs/yjs` | One sync path | Phase 2 | Two-client spec on the real binding, paired with plain-editing controls | A join decision that defeats the binding's merge preservation | gate |
| Saved format | Version 6 checkpoint in `meta.authored` | Marked children only | `plitejs/authored` | No published release carries it | Phase 2 | Old-checkpoint refusal test | A release from `next` before Phase 2 lands | cut |
| Doctrine | Accepted roots are canonical (`docs/vision/plite.md`) | The review tree is canonical | `VISION.md` owners | Law must match the target | Phase 2 `best-api repair` | Grep of the rejected shape | Stale skills teach the old model | rearchitect |

Every `gate` row stays gated until Phase 1's exit, Benchmark's pre-acceptance probe included, passes.

## Steps

### Phase 1: prove the review tree in isolation

The production `authored` owner stays untouched. The new modules live under an internal path that no entry point exports, wired into a proof-only plugin on a Plate proof route that installs the real table, column, list and code-block plugins and renders the marks' data attributes and struck styling. Phase 1 needs these core edits, which its revert also removes with the route and the proof plugin: a registration that skips the authored Yjs effect path and the fragment branches for the proof plugin, the content option on point and text reads, and a merge recognizer in the Yjs bridge that compares element properties without the `join` mark.

- [ ] Run each step's cheapest control at base in a detached worktree from `node tooling/scripts/proof-worktree.mjs`, per `verify`'s command recipes, and rewrite any step whose control does not behave as the step claims. Proof: one control log per step under `docs/plans/artifacts/2026-10-08-authored-review/controls/`.
- [ ] Write `marks.ts`: mark types, the schema property, and a well-formedness check that refuses marks of one change with different authors or times. Proof: a package test that loads a document whose two leaves of one change disagree and expects the refusal.
- [ ] Add the core recording slot and write `record.ts` over the canonical token algebra, combined sections included, with the edge rule, own-element marks, the delete-mark push-down and forced-change ownership from Main changes, and the schema refusal from Hard cuts. Proof: one package test per recording rule with a distinct failure mode; a check, run through `proof.mjs`, that fails when `record.ts` imports a plugin or command module (the stop rule); and package cases for typing at both edges of another author's insertion in each mode, and for an AI rewrite over the user's own pending suggestion that Discard fully restores.
- [ ] Run the derived-value cases as probes against today's base and record each outcome for the follow-up iteration, without claiming a fix: the 33/33/33 and 30/70 column presets, a column inserted into 30/70 and rejected, two concurrent column inserts followed by unrelated Editing typing and two rejections, a row deleted across a merged cell, a task item switched to a bulleted list, a second resize by the same writer, and a correction that removes content such as a duplicate multi-select value. Proof: one probe log per case under `docs/plans/artifacts/2026-10-08-authored-review/probes/`.
- [ ] Write `resolve.ts` with the content-preserving repair. Proof: property tests that every admissible decision order or batch over random trees with up to six pending changes gives the same content, that a blocked decision leaves the document unchanged, that resolving with every change accepted equals accepting each admissible batch in turn, contested format keys excluded, and that undoing any recorded change restores the document before it; a two-column group with one struck column whose surviving column's text appears in both the proposed read and the decided document, with a planted "remove the group" branch as the control that must fail; Sol's counterexample, a suggested type change to a column group plus a suggested column deletion, decided in both orders; two pending deletions on the two columns of one group; and concurrent same-key format marks decided in every order, with the generator building those marks directly.
- [ ] Measure how far the pure proposed read differs from the decided document on the column cases, and that a fragment read slices the whole projection. Proof: a package test per case that records the difference and asserts the diagnostic names it.
- [ ] Add the `content` option to point stepping and text reads and adopt it in the proof route's input rule, trigger and Find. Proof: an input rule whose following-character condition sits behind struck text, with both its step and its string read opted in, an input rule whose match would span struck text in Editing, a mention trigger after struck text, Find across struck text, and the native-input fallback with struck text present that inserts nothing twice.
- [ ] Prove native input in Chromium on the proof route: click and arrow into struck text, typing, paste, Backspace and Delete in both modes, Enter at a struck boundary, typing in Editing inside a whole-block strike, which must survive accept, and CDP IME in struck text and inside another author's insertion, each checking model, DOM, native selection and follow-up typing. Proof: Playwright logs from five warm runs without retries, per `verify`.
- [ ] Prove the doc's table rule on the real table plugin: Editing text typed in another person's pending table stays in its cell, survives accept and leaves with the table on reject, in both Yjs delivery orders. Proof: package and two-client logs.
- [ ] Prove collaboration headless with two clients, checking that the run went through the ordinary binding. Cases: suggestions and decisions converge; concurrent accept and reject on an insertion, a deletion and a replacement in both delivery orders; overlapping batch decisions; an offline late amendment to a decided inline insertion and to a decided inserted block; identical concurrent accept and reject of a split, a join, a wrap, an unwrap and a decision that hoists a column's content, and a peer typing in that column during the hoist; concurrent format suggestions on one key, decided both ways; a join decision against a peer typing in the right block, paired with the same plain-editing merge of single-text blocks with equal properties as the control the authored run must match, and the multi-leaf merge loss that plain editing shares recorded as such; and undo of a local decision after a remote edit inside the decided content. Proof: one spec log per case with each outcome recorded, and the Defaults rows for concurrent decisions and late edits reworded to the measured outcomes.
- [ ] Run Benchmark's pre-acceptance probe. Cohorts: 100 blocks with 10 pending changes, 5,000 with 500, 20,000 with 2,000, and one block with 1,000 alternating marked runs. Measure keystroke commit in Editing and Suggesting in plain, inserted and struck text, recording and correction work per keystroke, index update work, the resolver for export and accept-all, index build on load, and saved bytes. Take the baseline at base through `proof-worktree.mjs`, freeze the budgets before reading the candidate, include a planted-slowdown control the budgets must reject, and count work through CDP metrics because the host is shared. Proof: the frozen budget file and the probe's attempt logs; a pass moves the `gate` rows to their verdicts.
- [ ] Decide keep or revert. Keep starts Phase 2. Revert deletes the internal modules and the core edits listed above and sends the plan back to review with the failing case; the current model is not the fallback. Proof: a decision-log row citing the exits above.

### Phase 2: cut over and migrate every caller the cut breaks

- [ ] Replace `authored()` with the tree owner and delete the modules, React paths and Yjs transport the Hard cuts list names; refuse old checkpoints. Proof: `pstack:blast-radius` caller list, a grep of the removed names, in qualified forms such as `authored.read.preview`, over live source, docs, skills and open plans that finds none, and an old-checkpoint load test that expects the refusal.
- [ ] Reshape the public types to the noun table in `architect/runner-opus.md` with the changes in `architect/synthesis.md` and this plan's Hard cuts, and run `pnpm brl`. Proof: package typechecks, type tests for the `{ intent }` and `{ preview }` union and for `decide({ action, changes })`.
- [ ] Adopt `AuthoredPlugin` without retention and `SuggestionPlugin` painting marks, split and join boundaries and wraps through data attributes. Proof: a package test that a suggesting view records marks with the editor's user, and Chromium screenshots of a suggested split, join and struck block inspected at legible scale.
- [ ] Adopt `discussion.tsx`: it decides the rendered change and reports a detached placement when the change's content is gone. Proof: a registry test that a card of a decided change keeps its thread and never attaches it to nearby text.
- [ ] Adopt `AIChatPlugin`: it drafts in the review view under its request's change, reads the proposed projection for both `{editor}` and `{block}`, and replaces only its own insertion. Proof: package tests that Discard restores the user's pending suggestion and that both prompt slots read the same document.
- [ ] Adopt input rules, triggers and Find through the content option. Proof: their package tests across struck text.
- [ ] Adopt serializer projections through the pure resolver, `projectAuthoredDocument`, comparison import, and DOCX insertions, deletions and paragraph and run property revisions, with an unsupported-content diagnostic for the rest. Proof: a package test per format that exports accepted and proposed content of one mixed suggestion, and a DOCX round trip of `pPrChange` and `rPrChange`.
- [ ] Migrate the version history demo to restore a saved revision, and the playground and other registry demos to marked initial values. Proof: their Chromium demo tests and `pnpm --filter www build:registry`.
- [ ] Rewrite the branch's surviving regressions as public-API tests, one per distinct failure mode, from the 45 rows `branch-fixes/fixes-detail.tsv` marks as surviving a review tree in full or in part. Proof: those tests passing in Chromium.
- [ ] Run a two-client spec on the real Yjs binding, history across peers included. Proof: its log.
- [ ] Rerun the Phase 1 benchmark contract on the production path and source identity, then the correctness guard. Proof: the attempt logs against the frozen budgets.
- [ ] Run `best-api repair`: rewrite the authored passages of `docs/vision/plite.md` and `docs/vision/plate.md` (accepted roots, projections per view, retained author history, the attribution sentence), supersede `docs/research/decisions/authored-change-ownership.md`, and fix each skill that teaches the old model. Proof: a grep for the rejected shapes over `docs/vision`, `docs/research/decisions` and `.agents/rules`, then `pnpm run prepare` and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`.
- [ ] Reconcile `docs/editor-behavior/markdown-editing-spec.md` for typing, deleting and IME in struck text and for split and join suggestions, and tag the proving tests. Proof: `pnpm kb gaps` lists no new untested rule.
- [ ] Run `plate-docs` on `content/docs/(guides)/authored-changes.mdx` and its Chinese twin. Proof: the docs checks and a preview of the rendered page.
- [ ] Run `plate-docs` on `content/docs/(plugins)/(collaboration)/suggestion.mdx` and its Chinese twin. Proof: the docs checks and a preview of the rendered page with its demo.
- [ ] Run `plate-docs` on `content/docs/(plugins)/(collaboration)/discussion.mdx` and `comment.mdx` with their twins. Proof: the docs checks and previews.
- [ ] Run `plate-docs` on `content/docs/(plugins)/(collaboration)/yjs.mdx` and its twin. Proof: the docs checks and a preview.
- [ ] Run `plate-docs` on `content/docs/(guides)/history.mdx` and `serializing.mdx` with their twins. Proof: the docs checks and previews.
- [ ] Run `plate-docs` on `content/docs/(plugins)/(serializing)/markdown.mdx`, `html.mdx` and `docx.mdx` with their twins. Proof: the docs checks and previews.
- [ ] Run `plate-docs` on `content/docs/examples/version-history.mdx` and its twin. Proof: the docs checks and a preview with its demo.
- [ ] Run `plate-docs` on `content/docs/api/core/plate-components.mdx` and `editor-api.mdx` with their twins. Proof: the docs checks and previews.
- [ ] Run `plate-docs` on `content/docs/installation/node.mdx`, `content/docs/(plugins)/(ai)/copilot.mdx` and `ai.mdx` with their twins. Proof: the docs checks and previews.
- [ ] Write the changesets and registry changelog entries through `changeset`. Proof: the changeset check in `pnpm check`.
- [ ] Run `pnpm check` once on the settled cutover. Proof: its log. Decide keep, or revert the phase as one unit together with Phase 1's revert list.

### Phase 3: DOCX table revisions

- [ ] DOCX paragraph-mark, row and cell revisions map to marks and back. Proof: a round-trip corpus test.
- [ ] Decide keep, or revert the paragraph-mark, row and cell mappings together; Phase 2's DOCX export keeps its unsupported-content diagnostic for them when reverted. Proof: a decision-log row citing the corpus test. Before deferring paragraph-mark revisions here, check at base whether today's import already carries them, and move them into Phase 2 if it does.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where suggestions live | In the document you edit, as tagged text | Keep today's separate documents | keep accepted-first | big |
| The list of changes | Read from the tags | A separate stored list | change table | small |
| What plugins see | Everything; they ask for live text when they need it | Only the accepted text | filter by default | big |
| Two people decide one change at once | Whichever removes text wins | Keep a record so a reject always wins | rejection wins | small |
| A late edit to a decided suggestion | It shows up again as a new suggestion; edits inside a rejected block are lost | Keep records so decisions stay final | final decisions | small |
| Who accepted or rejected | Not kept after the decision | Keep a decision history | keep decision history | small |
| Typing inside someone else's suggestion | It becomes part of their suggestion | It becomes your own suggestion | typist owns it | small |
| Typing right at the edge of someone's suggestion | It stays outside it | It joins it | join at edges | detail |
| Suggesting inside a code block | Not allowed for now; whole code blocks still work | Replace the whole block, or allow split text in code | replace code blocks | big |
| A layout left with too few parts, like one column | Pull its content out; never delete it | Refuse the edit that causes it | refuse underfull | detail |
| Undoing someone's old accepted work | Gone; restore an older saved version instead | Keep that undo | keep revert | big |
| Where you can edit | Only the review view; previews are read-only | Edit in the previews too | editable previews | small |
| Moved text and new document parts | A move is a delete plus an insert; new parts are never suggestions | Keep tracked moves and suggested parts | keep moves | small |
| Old saved suggestion data | Refused, since no release ever wrote it | Convert it when loading | convert old docs | small |
| Old names in the code | Removed in phase 2 | Kept | keep names | detail |
| Typing inside crossed-out text | It splits the deletion, in both modes, except in code blocks | It moves to the end of the deletion | move to end | big |
| When to stop | If any one command or plugin needs special code, rethink the plan | Go back to today's design | keep current on stop | big |
| Where this run stops | After review, before building | Before review | pause earlier | detail |
| The page link | A new page at https://claude.ai/artifact/HmRjqgC5E9htfk2Kn5psAB, because the old one now belongs to another account | Go back to https://claude.ai/artifact/Ni3BZD1MVVsoiRkkcqVn7Z | old page | detail |

## Open work

- Property values under suggestions: how plugin corrections and their derived values (column widths, table spans, list properties, content a correction removes) and format suggestions on one key behave when suggested, decided, decided concurrently, or touched by a later Editing transaction. Three panel rounds rejected recording before corrections, recording the corrections into the suggestion, and blocking competing formats. owner: zbeyens, who opens a follow-up plan iteration on this subject with its own architect pass and panel, briefed with the cases in `panel-3/seat-*.md`. stop: that iteration's panel passes with every Phase 1 derived-value probe reproducing as fixed, or it finds no design without plugin branches and this plan returns to review. Tracked here and, once this plan folds, in `docs/plans/topics/authored.md`.
- Code blocks and other one-text elements under suggestions: refusing input before the CodeMirror binding changes, reporting the refusal, and Editing inside a struck code block. owner: zbeyens, in the same follow-up iteration. stop: that iteration's panel passes with CodeMirror typing, paste, drop and IME refusal proven in Chromium, or code-block suggestions are named a permanent cut.
- Saved authored data stays unpublished only while no release carries authored. owner: zbeyens, who holds authored out of releases or reopens the convert-or-refuse default. stop: a `platejs` or `plitejs` release carrying authored ships before Phase 2 lands, or Phase 2 lands first. Tracked in `docs/plans/topics/authored.md` once this plan folds.

## Reply to the design doc

I agree with the doc's direction and push it a bit further. Here are six answers, then five changes. The full reasoning is in the plan file's Evidence.

**Answers**

1. **Plugin view.** Yes. Plugins see the whole document, and exports, AI and Find ask for clean text. Plugins never saw clean text anyway.
2. **Revert of old accepted work.** Drop it. Restore an older saved version instead.
3. **Unwritten constraints.** The record shows none. Agents picked accepted-first in September, and no owner ruled on it.
4. **Saved data.** Cut it. No release ever wrote it.
5. **Editable views.** Only the review view is editable. Previews are read-only, as in ONLYOFFICE and Google Docs.
6. **Moves.** A move is a delete plus an insert, as in Word.

**Changes to the doc**

1. **No change table either.** Tags on the text carry the change, the author and the time, so nothing extra needs syncing.
2. **A stop rule that tests something.** If any command or plugin needs special code, the plan comes back for review instead of falling back to today's design.
3. **A harder first slice.** It covers Enter and Backspace across paragraphs, real tables and columns, and two people editing at once.
4. **Name every loss.** Moves, the conflict state, decision history, code-block suggestions and editable previews each get a row in Picked for you.
5. **A softer fix count.** Many of the 55 fixes are paging and card work any design keeps. The argument stands without the count.

On deleted text in normal mode, you are right. Other editors let you type there, and the new text splits the deletion. In one document that is plain editing.

## Evidence

Model: claude-opus-5-5 led the review. The readers read `13956eec` and natamox's branch at `5a183f0d02`. History was later rewritten, so `review_commit` names `c70bacbd4a`, whose authored members match what the readers read except `packages/plitejs/src/react/editable/clipboard-input-strategy.ts` (drag and drop). Eight Opus readers traced the code, the branch, prior art and the record; their replies are saved verbatim under `docs/plans/artifacts/2026-10-08-authored-review/`, beside the teammate's doc as `felix-doc.md`.

This review supersedes `2026-10-04-authored-audit` (Stop), because the requirement that editing in struck text feels like normal editing is new, and the coordinate-space count, the fix trail and the prior art contradict its conclusion. It retains `2026-10-07-suggestions-editor-input` (Pursue), because the editor's single user still stamps suggestions and comments. It takes up the unified content tree that [the loadable-state design](2026-09-12-authored-loadable-state-design.md) deferred as the strongest larger challenger, and it reverses the accepted-roots law in `docs/vision/plite.md` and [the authored ownership decision](../research/decisions/authored-change-ownership.md), which Phase 2 repairs through `best-api repair`.

### Requirements

- Record who suggested what, show it, and accept or reject one change, a batch or one author's changes atomically (`content/docs/(guides)/authored-changes.mdx`).
- Editing inside suggestions and struck text feels like normal editing; the mode changes only how the change is recorded (the message's typed ask).
- Deleted text is editable in normal mode (the message's point 1).
- Direct text typed in a pending table stays in its cell and leaves with the table on reject (the doc's owner rule).
- Exports choose accepted, proposed or review content explicitly (`docs/vision/plate.md`, Authored projection is an option on the ordinary format operation).
- Comments anchor to changes and survive decisions; AI suggestions use the same records (`docs/vision/plate.md`).
- Two collaborators converge on suggestions and decisions (`docs/vision/common.md` Claim Width, collaboration behavior).
- Hard laws: `DocumentChange` stays the sole mutation truth (`VISION.md`); every document a consumer reads is schema-valid; caret and IME claims need native browser proof; hard cuts over compatibility.
- The retained-history job in `docs/vision/plite.md` ("retained author history produces new compensating changes") and the attribution sentence in `docs/vision/plate.md` ("Plate attributes every authored write") are cut or narrowed by this target and need their law repaired.

### Lanes

1. **Keep the model and merge execution (option 1).** Removes the per-fragment execution class only. Keeps eight coordinate spaces, two full documents, decision replay and the table split. Rejected.
2. **Accepted-first without fragment documents (option 2).** The editor would edit a projected document that holds struck ranges, which is a review tree, while a second authority still syncs and decisions still replay. It adds a hidden-content fact for the table rule. It keeps the costs of both models. Rejected.
3. **One review tree with a stored change table and decision records (the doc's option 3; arena candidates from Sol and Astra).** Removes the coordinate spaces and the replay, but keeps a second store of review state, either a core `DocumentChange` data channel or a named record root plus retained decision content. Rejected for split ownership.
4. **One review tree whose marks describe themselves (arena base, from the Opus runner).** Removes the coordinate spaces, the replay, the change table, status and dependency records, and the custom collaboration transport. Costs: the losses in the Defaults and a schema-driven collapse rule. Picked.
5. **Delete native authored and use Yjs suggestion documents.** Every suggestion would need Yjs and a forked document. Upstream y-prosemirror calls its pending-delete view "a best-effort read-only projection" and reverts writes into it. Rejected.
6. **Control: no change.** Keeps the 2026-10-04 Stop. Loses to the fix trail and to every reference editor; the cross-judge scored it 5 of 24. Rejected.

### Architect arena

Three runners received one prompt (`architect/prompt.md`) and returned candidates (`architect/runner-opus.md`, `runner-astra.md`, `runner-sol.md`). The Opus cross-judge read anonymized copies against a rubric the runners never saw and scored the Opus runner's design 20 of 24, Sol's 15, Astra's 14 and the control 5 (`architect/judge.md`); it verified the claims the scores rest on at `592ec28578`. It is the same model family as the lead, because the cross-judge pool holds only Opus. The synthesis (`architect/synthesis.md`) took the Opus design as base, changed its collapse rule and its preview after the judge found a schema-invalid column read and a gap between preview and decide, and grafted the caller classification and detached comment placement from Sol and caret-affinity containment from Astra. Challenge delta: improved. Against the verdict's first target it deletes the stored change table, change status, the selection token, recorded dependencies and decision history, and it replaces "a rejection wins" with "the decision that removes content wins".

### Plan panel

Round 1 ran Opus, Astra at xhigh and Sol at xhigh on frozen commit `21e6136a` (`panel-1/seat-opus.md`, `seat-astra.md`, `seat-sol.md`). It raised eight critical findings, each checked against the code before it was applied. Both model families found that the "unwrap, otherwise remove" repair deletes a surviving column (`BaseColumnPlugin.ts:178`, `:53`), that concurrent format suggestions lose a proposed value, and that filtering `text.string` breaks native input repair (`model-input-strategy.ts:146`) and step-then-read callers. The Codex seats found that code blocks allow exactly one text child (`BaseCodeBlockPlugin.ts:216`), that named roots have no node to mark (`document-change.ts:38`), that the binding's merge preservation needs equal element properties, so the plan's "plain editing loses it too" claim was false, and that Phase 2 removed APIs its own Phase 3 migrated. Opus found that plugin corrections ran before recording and would leave tables and columns inconsistent in the stored tree. The fixes changed the design: recording now runs before corrections, reads normalize a detached copy, repairs never remove live content, format marks carry proposed values, core reads stay raw beside an explicit content option, `preview` is cut, code-block suggestions replace the block, roots are never pending, and Phase 2 migrates every caller its cut breaks. The decision log holds one row per finding.

Round 2 ran the same seats on the fixes (frozen commit `0f177ae5`, `panel-2/seat-*.md`). All three found that recording before corrections still let correction writes escape the suggestion, so a rejected column insert, merged-row delete or task-list change left accepted content altered; that the detached read had no editor or schema to run corrections with; and that whole-block code replacement duplicated concurrent edits, broke CodeMirror composition and lost Editing text typed inside the struck block. Two found that the format rule depended on decision order. Following the panel rule, each mechanism got one replacement or a revert. Corrections now join the suggestion that caused them, reads roll back a speculative transaction on the editor, code-block suggestions are refused and the claim narrows, and two pending format suggestions on one key block each other. The warnings moved property revisions and boundary paint into Phase 2, gave Phase 3 a decision, narrowed commutation to decisions that are not blocked, pinned the merge control, and made late edits inside one's own inserted block reviewable.

After these cuts the lead re-scored the base against the incumbent on the judge's rubric: 3, 3, 2, 2, 3, 3 for 16 of 24, against the judge's 4, 3, 3, 3, 4, 3 and 5 for today's model. The losses the panel's fixes added (code-block suggestions, pending roots, blocked decisions, unsettled derived values) lower criteria 1, 3, 4 and 5 but leave the margin wide; the score is the lead's own, same family as the arena judge.

Round 3 ran on the round-2 fixes (frozen commit `7863a33b`, `panel-3/seat-*.md`) and was the last allowed before a build. All three seats found new critical problems in the replaced mechanisms. Recording corrections into the suggestion accepts the wrong widths (the 30/70 preset accepts as 35/65), later Editing transactions still rewrite held values, and the format refusal cascades onto correction writes. Concurrent rejections of competing formats can leave a rejected value applied. An editor-bound read cannot serve detached documents, `document` options, fragments or reads inside the AI prompt. And refusing code-block input in the recorder comes after CodeMirror has already changed. Following the panel rule, a mechanism that already had its one replacement leaves the loop. Reads reverted to the pure resolver with a named limit. Derived values, format concurrency and code-block suggestions became open work for a follow-up design iteration, and the plan no longer claims them. The warnings narrowed the late-edit claims, made Phase 2's revert include Phase 1's, widened Phase 3's decision, and named the multi-leaf merge loss that plain editing shares.

### Mechanism counts

- Coordinate spaces and mappers: eight spaces, 41 named mappers in Plite's core and authored layer, at least 13 more in the DOM layer (`how-model/reply.md`).
- Struck-only branches in `packages/plitejs/src/react/editable/` on the branch: 60, of which 42 are new on the branch (`how-edit/struck-branches.tsv`).
- React runs one command per fragment: `mutation-controller.ts:1040-1199` on the branch, verified (`how-edit/reply.md`).
- Decisions replay forward onto accepted or inverted onto projected, with a remove, decide and re-add pass for independent dependants (`decisions.ts:204-242`, `:601-682` on the branch; `how-decide/reply.md`).
- The table split reproduces on the branch and not on the owner checkout, where another author's typing becomes a dependent proposal (`how-edit/table-split-branch-a1.log`, `table-split-owner-a1.log`).
- The authored owner is 18,724 lines in 25 files on `next` (`architect/judge.md`, verified with `wc`).

### Fix trail

The branch's plans, decision logs and commits hold 114 fix rows, not 55. The classifier dropped 9 that change no code and read the code change behind each of the other 105 (`branch-fixes/fixes-detail.tsv`). By root cause: 54 map or sync coordinate spaces, 12 replay operations on accept, reject or undo, 4 come from direct text that must exist in the accepted document, and 35 are other work (the paging cursor, grouping, review-card summaries, codec versions and the original-text store the branch later deleted). None is a pure browser defect: each row that looks like one, such as double-click word selection or the caret after IME, traces to struck text being a `contenteditable=false` fragment. 60 rows would not exist in a review tree, 29 partly, and 16 still would. 20 rows fix code that is gone or partly gone at the branch head. The doc's own tally (22 sync, 13 replay, 12 per-fragment execution, 5 browser, 3 product rules) agrees in direction.

### Consumers

Of 28 consumers, 14 work unchanged on a review tree, 13 need an explicit filtered read, and 1, the Yjs binding, is rebuilt onto the ordinary tree path (`how-consumers/consumers.tsv`). Most of the 13 read text near the caret or export content, and they opt into the content option or a filtered read; the mutating ones (normalizers, table, list and mark commands) see the review tree, and recording runs before corrections so their output matches it. Two current defects surfaced: Find paints nothing on a markup view with pending changes, and AI sends accepted content for `{editor}` but projected content for `{block}` (`how-consumers/consumer-probe-a1.log`).

### Why accepted-first

The record holds no owner ruling. Agent-written plans chose accepted-first on 2026-09-10 ([the native authored plan](2026-09-10-native-authored-changes-and-suggestions.md), lines 48-51 and 272), the same day research said "Neither representation has won the comparison" ([assessment](../plite/research/2026-09-10-authored-changes/assessment.md), line 129). The woven tree was rejected by argument, never prototyped. Struck text became read-only fragments because typing there "requires an explicit restore/proposal action" (`plan:240`), a rule the code has since dropped. Plate v1's suggestion engine failed mostly through per-command recording behind a global flag, not through the single tree (`how-consumers/reply.md`; `why-git/reply.md`). Linear holds no Plate design record (`why-linear/reply.md`).

### Proof limits

Nothing here is built or measured beyond the saved-shape probe and the readers' headless probes. The fix classification and consumer buckets are agent readings checked against code, not runs. Prior art for Google Docs, Word, CKEditor and Notion comes from vendor docs. The arena candidates and the panel are design reviews read against code, not prototypes; the review tree's corrections, schema repairs, block-boundary rule, concurrent decisions and performance are unproven until Phase 1's exits pass.

### Reply in full

The direction is right, and I would push it further than the doc does. My answers to its six questions, then the five places I would change it.

**Plugin view.** Yes. Commands and normalizers run on the review tree, and exports, AI context and Find read a filtered copy. "Plugins see clean content" was never true of the current model. In a markup view plugins already read the projected document, not the accepted one. Typing in struck text runs installed commands against a fragment document. Find searches the accepted text and paints nothing on a markup view. AI sends accepted content for `{editor}` and projected content for `{block}` (Evidence, consumers). The choice is one honest tree with one explicit content read, against three partial documents that disagree. Plugin corrections are where this bites, and here accepted-first is better today: each of its documents runs its own corrections, so derived values such as column widths and table spans come out right in both. Three panel rounds did not settle a review-tree design for them, so the follow-up iteration owns it, and if it finds none without plugin branches, the stop rule fires and the target fails.

**Closed-history revert.** Drop it. Vision names the job, so the plan repairs that law and gives restore a replacement, a saved revision plus the comparison import that already exists. `retainHistory` is off by default in Plate, no reference editor we read reverts one author's long-accepted work, and the cut also removes an operation log that today grows with every accepted keystroke.

**Unwritten constraints.** None that the record shows. It holds no owner ruling for accepted-first. Agent-written plans chose it on 2026-09-10, the same day the research said "neither representation has won". The decisive argument was that a woven tree "exposes invalid intermediate structures to schema, selection, serializers, and ordinary consumers". That argument is about Plate v1's text marks with per-command overrides, and the same research rated canonical-change recording with marks as the strongest smaller repair. Collaboration was not a reason; it is a cost, because authored editors today bypass the Yjs tree binding for a CRDT of their own.

**Saved data.** Hard cut. No published release carries any authored format, and Open work reopens this if one ships first.

**Editable views.** Yes, review views only, with read-only accepted and original previews. OnlyOffice locks co-editing in its Final and Original views, Google Docs accepts writes only in its inline mode, and LibreOffice makes hidden deletions unreachable.

**Moves.** Yes, delete plus insert. Word and the ProseMirror suggestion libraries do the same.

Where I would change the doc:

1. **Drop the change table too.** The doc keeps "a small change table" for author, time, status and dependencies. Plite's `DocumentChange` has no metadata section and the Yjs binding rebuilds `meta` locally, so a table needs either a core extension or a second synced store. Marks that carry their change, author and time need neither, and containment replaces recorded dependencies. Rejecting Alice's insertion removes everything under or between her marks.
2. **The stop rule points the wrong way.** "Stop and keep the current model" falls back to the design that produced the fix trail. Make the stop measurable. Recording and corrections must pass with no branch keyed on a Plate command or plugin, checked by a script and by a fixed-point test on the real table and column plugins. If either fails, the plan comes back for review.
3. **The first slice must include block boundaries, real structural plugins and two clients.** "Paragraphs and text only" reads as text runs. Enter and Backspace across a paragraph boundary are the hard case for a tree model. Google Docs avoids it because a paragraph break is a character, prosemirror-suggest-changes needed a breaking release to replace its boundary markers, and y-prosemirror records a split as delete plus insert. Tables, columns and code blocks break a paragraph-only slice in ways the slice cannot see, and today's model passes convergence specs a slice without two clients would regress.
4. **Name every loss.** The doc lists closed-history revert. The target also drops identity-preserving moves, pending root lifecycle, the `conflicted` status and `resolve`, decision history, the author of direct text inside someone else's pending insertion, suggestions inside code blocks, and editable accepted and proposed views. Concurrent opposite decisions do not let "a rejection win" either. The decision that removes content wins, so a replacement accepted by one reviewer and rejected by another loses both sides, and a late edit can reopen a decided suggestion. Each loss is a Defaults row.
5. **The fix tally is directionally right, but softer than stated.** An independent classification of the branch's fix rows finds no pure browser defect and most rows tied to the coordinate spaces or replay, but also a large share of paging, grouping and card work any model keeps, and several fixes of the branch's own earlier fixes (Evidence, fix trail). The argument does not need the tally. The coordinate-space count and the prior art are enough.

On deleted text in normal mode, you are right. LibreOffice, ONLYOFFICE and y-prosemirror's view mode all let you type inside struck text outside tracking, and the new text splits the deletion. The current owner code drops other people's input there silently; the branch fixed that with more fragment code. In a review tree it is ordinary editing.

---
review_scopes: [authored, suggestions]
review_basis: [2026-10-04-authored-audit, 2026-10-07-suggestions-editor-input]
verdict: pursue
work_kind: implementation
review_commit: 13956eec4dee8fc34adb6e1f499324f7da797c03
review_inputs: [docs/research/decisions/authored-change-ownership.md, docs/research/decisions/suggestion-review-semantics.md, docs/plite/research/2026-09-10-authored-changes/assessment.md, docs/plite/research/2026-09-10-authored-changes/skill-audit.md, docs/plans/2026-09-10-native-authored-changes-and-suggestions.md, docs/plans/2026-09-12-authored-loadable-state-design.md, docs/plans/2026-09-14-retained-deletion-editing.md, docs/plans/2026-09-17-authored-direct-editing-with-visible-suggestions.md, docs/vision/plite.md, docs/vision/plate.md, content/docs/(guides)/authored-changes.mdx, packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/decisions.ts, packages/plitejs/src/authored/markup.ts, packages/plitejs/src/authored/state.ts, packages/plitejs/src/authored/steps.ts, packages/plitejs/src/core/authored-runtime.ts, packages/plitejs/src/core/authored-fragment-view.ts, packages/plitejs/src/react/editable/mutation-controller.ts, packages/plitejs/src/yjs/core/controller.ts, packages/plitejs/src/yjs/core/shared-effect-log.ts, packages/platejs/src/authored/AuthoredPlugin.ts, packages/platejs/src/features/suggestion/BaseSuggestionPlugin.ts, packages/platejs/src/features/find/lib/BaseFindPlugin.ts, packages/platejs/src/ai/react/AIChatPlugin.ts, apps/www/src/registry/components/editor/discussion.tsx, apps/www/src/registry/examples/version-history-demo.tsx]
review_upstreams: ['../prosemirror-suggest-changes@653fba70ba29ef6ea6af3ad8d60244a58df7281b', '../y-prosemirror@9200946f0ea455c681a7496c364ee998a9f064f7', '../yjs@da0523008392f10b078bcbf7f056ec9a478c4585', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../manuscripts-track-changes-plugin@62f4d19dda4c2d41afa5d9fdecea840fb6bfb0be', '../libreoffice-core@760394bbadd6077379f9eef116e5ba87bb5cb31c', '../sdkjs@72b0421c0bbf9d01eed9cf14834ae47eb2df1b50', '../Open-XML-SDK@431ab05cf160248cc3885a4a766026d4f8243792', '../docx-redline-js@616b7f515c44a417f3700b84847ad6be21aeea74']
---

# Authored: one review tree the editor edits

Status: planning: architect arena picked its base; grafts, plan steps and the plan panel are still to do before the pause for your review
Playbook: plan

**Pursue option 3, superseding `2026-10-04-authored-audit`.** Pending-deleted text lives outside the document the editor edits, and that one choice forces a second editing system. Each struck run is its own read-only document, so Plite carries eight coordinate spaces, 41 core mappers between them plus at least 13 on the DOM side, 60 struck-only branches in the React editable layer, a second commit pipeline (`updateViews`) that runs one command per fragment, and decisions that replay operations across two full documents (Evidence). No editor we read lets the caret into deleted text held outside its editable document, and LibreOffice dropped the one design that moved deleted text out of the body in 2018. The accepted-first choice was made on 2026-09-10 by argument, never prototyped, and reopened two days later as "the strongest larger challenger" without coming back. The fix is the largest cut. The review tree becomes the editor's document, one rewrite owner records each canonical change by mode, and accepted and proposed content become filtered reads.

The doc "Authored redesign: discussion with Ziad" (pasted into this session, saved at `docs/plans/artifacts/2026-10-08-authored-review/felix-doc.md`) reaches the same option. This page agrees with its direction and changes five things: the stop rule, the first slice, what "plugins see clean content" means, which losses it names, and the shape of the decision API (Reply to the design doc).

## Brief

### What will change?

Suggestions will live in the same document that people edit. Typing, deleting, pasting and IME inside struck text will work like normal text, and only the mode decides how the change is recorded.

### What could go wrong?

Plugins see struck text unless a read filters it. Revert of old accepted work goes away. Splitting and joining paragraphs is the hard part, and nothing is built or measured yet.

## Public API

A mounted view sets only how input is recorded. Every editable view shows markup; accepted and proposed previews become read-only.

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

Copied review UI decides every change the same way. Concurrent decisions merge through collaboration, so no change is left conflicted and `resolve` goes.

```tsx before
// apps/www/src/registry/components/editor/discussion.tsx
const result =
  latest.status === 'conflicted'
    ? authored.update.resolve(input)
    : authored.update.decide(input);
```

```tsx after
// apps/www/src/registry/components/editor/discussion.tsx
const result = authored.update.decide(input);
```

Selective revert of retained accepted work and the retention option go. Restoring earlier content goes through a saved revision and the comparison import that already exists; the architect pass picks that call.

```tsx before
// apps/www/src/registry/examples/version-history-demo.tsx
const result = editor.update.authored.revert({
  selection: editor.read.authored.select({ ids: [change.id] }),
});
```

```tsx after
```

```tsx before
// apps/www/src/registry/examples/version-history-demo.tsx
AuthoredPlugin.configure({ initialState: { retainHistory: true } }),
```

```tsx after
```

## Document shape

Applications save and load `editor.read.value()`, and serializers read it. Today it holds the accepted children and a codec-owned checkpoint with a second full document, two position indexes and every operation, including accepted keystrokes. Measured on this checkout: one 14-character paragraph with one pending replacement saves 6,130 bytes (`docs/plans/artifacts/2026-10-08-authored-review/probes/saved-shape-a1.log`). After, the children are the review tree: struck and inserted text sit in place with a change mark, and the checkpoint keeps only the change table. Property names in the after shape are illustrative; the architect pass picks them.

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
        { "text": "gone ", "authored": { "delete": "c1" } },
        { "text": "NEW ", "authored": { "insert": "c1" } },
        { "text": "tail" }
      ]
    }
  ],
  "meta": {
    "authored": {
      "version": 8,
      "changes": [
        { "id": "c1", "authorId": "bob", "createdAt": 1791460800000, "status": "pending", "dependencies": [] }
      ]
    }
  }
}
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Review tree marks, change table, codec | Plite | `plitejs/authored` | Durable document truth; one owner for identity and attribution |
| One rewrite owner that records an ordinary change by intent | Plite | `plitejs/authored` | `DocumentChange` stays the sole mutation truth; no per-command recording |
| Accept, reject, preview as plain tree edits | Plite | `plitejs/authored` | Decisions become ordinary transactions with local undo |
| Accepted and proposed filtered reads | Plite | `plitejs/authored` | Exports, AI context and find read one projection owner |
| Struck-text caret, selection and input | Plite | `plitejs/react` | Struck text becomes ordinary editable text; the fragment paths go |
| Collaboration of the review tree | Plite | `plitejs/yjs` | The ordinary tree binding carries marks; the authored effect transport goes |
| Suggesting and Editing modes, decorations | Plate | `platejs/suggestion` | Mode is view intent; paint reads marks |
| Review cards and version history demo | Plate registry | copied UI | Cards call `decide`; the demo restores a saved revision |

## Hard cuts and app migration

These cuts follow from the Pursue on a review the owner asked for, so each is a `look` Defaults row rather than an open question. `pstack:blast-radius` names every caller during planning.

- Delete the projected document, fragment documents and fragment views, both position indexes and their 41 core mappers, decision replay and the dependant rebase, `isolate.ts`, `updateViews`, the per-fragment React command loop and the struck-only editable branches.
- Delete the operation log for accepted edits. Accepted edits are plain transactions again; only pending changes have records.
- Delete `retainHistory`, `revert`, `resolve`, the `conflicted` status, identity-preserving moves, editable accepted and proposed projections, and `projectAuthoredRange`.
- Delete the authored shared-effect transport in the Yjs binding; the review tree syncs through the ordinary tree binding.
- Saved authored documents from `next` builds stop loading. No published release wrote them: `platejs@54.0.0-beta.1` shipped on 2026-06-17, before authored existed, and `plitejs` on npm is a 0.0.1 placeholder (`npm view`, 2026-10-08).
- Apps that read `editor.read.value().children` directly now see marked suggestions. Every serializer already refuses an authored document without a projection, and the guide's export section shows the filtered read.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Caret and range selection in struck text | Native caret in ordinary text; no painted caret, dock point or view selection | unproven; planned Chromium |
| Typing and paste in struck text | Splits the deletion around the new text, in both modes | unproven; planned Chromium |
| Backspace and Delete in struck text | Editing removes it; Suggesting steps over it | unproven; planned Chromium |
| IME in struck text | Ordinary composition; no cancelled intermediate events | unproven; planned Chromium |
| Enter and Backspace across a block boundary | A suggested split or join is a marked boundary | unproven; the first slice's decisive case |
| Undo of a suggestion edit or decision | Local history on ordinary operations | unproven; planned package test |

## Main changes

- The authored editor's document is the review tree. Pending insertions carry an insertion mark on text or on an element; pending deletions stay in place with a deletion mark; property suggestions keep their previous values.
- One rewrite owner receives each transaction's `DocumentChange`. Editing commits it unchanged. Suggesting turns removals into deletion marks, except removals of the writer's own insertions, which go for real, and marks insertions.
- Accepted and proposed content are reads that filter the tree; they never become a second stored document.

## Reply to the design doc

The direction is right, and I would push it further than the doc does. My answers to its six questions, then the five places I would change it.

**Plugin view.** Yes. Commands and normalizers run on the review tree, and exports, AI context, find and counts read a filtered copy. "Plugins see clean content" was never true of the current model. In a markup view plugins already read the projected document, not the accepted one. Typing in struck text runs installed commands against a fragment document. Find searches the accepted text and paints nothing on a markup view. AI sends accepted content for `{editor}` and projected content for `{block}` (Evidence, consumers). The choice is one honest tree with one filtered read, against three partial documents that disagree.

**Closed-history revert.** Drop it. Vision names the job, so the plan repairs that law and gives restore a replacement: a saved revision plus the comparison import that already exists. `retainHistory` is off by default in Plate, no reference editor we read reverts one author's long-accepted work, and the cut also removes an operation log that today grows with every accepted keystroke.

**Unwritten constraints.** None that the record shows. It holds no owner ruling for accepted-first. Agent-written plans chose it on 2026-09-10 after the research said "neither representation has won". The decisive argument was that a woven tree "exposes invalid intermediate structures to schema, selection, serializers, and ordinary consumers". That argument is about Plate v1's text marks with per-command overrides, and the same research rated canonical-change recording with marks as the strongest smaller repair. Collaboration was not a reason; it is a cost, because authored editors today bypass the Yjs tree binding for a CRDT of their own.

**Saved data.** Hard cut. No published release carries any authored format.

**Editable views.** Yes, markup only, with read-only accepted and original previews. OnlyOffice locks co-editing in its Final and Original views, Google Docs accepts writes only in its inline mode, and LibreOffice makes hidden deletions unreachable.

**Moves.** Yes, delete plus insert. Word and the ProseMirror suggestion libraries do the same.

Where I would change the doc:

1. **The stop rule points the wrong way.** "Stop and keep the current model" falls back to the design that produced the fix trail. Make the stop measurable: the slice passes when the rewrite owner handles the closed set of canonical operation kinds with no branch keyed on a Plate command or plugin. If it fails, the plan comes back for review; the current model is not the fallback.
2. **The first slice must include block boundaries.** "Paragraphs and text only" reads as text runs. Enter and Backspace across a paragraph boundary are the hard case for a tree model. Google Docs avoids it because a paragraph break is a character, prosemirror-suggest-changes needed a breaking release to replace its boundary markers, and y-prosemirror records a split as delete plus insert. If the boundary rule fails in the slice, the target fails.
3. **Name every loss.** The doc lists closed-history revert. The target also drops identity-preserving moves, the `conflicted` status and `resolve` (concurrent accept and reject merge, and a rejection wins), attribution of accepted text, and editable accepted and proposed views. Each one is a Defaults row below.
4. **Direct text inside another person's pending insertion.** Containment covers blocks: X typed in pending table T leaves with T. Text runs have no container, so unmarked X typed inside Alice's inserted sentence would survive her rejection. The rule has to cover both: direct text inside a pending insertion follows that insertion's decision and keeps its own author.
5. **The fix tally is directionally right, but softer than stated.** An independent classification of the branch's fix rows finds no pure browser defect and most rows tied to the coordinate spaces or replay, but also a large share of paging, grouping and card work any model keeps, and several fixes of the branch's own earlier fixes (Evidence, fix trail). The argument does not need the tally. The coordinate-space count and the prior art are enough.

On deleted text in normal mode, you are right. LibreOffice, ONLYOFFICE and y-prosemirror's view mode all let you type inside struck text outside tracking, and the new text splits the deletion. The current owner code drops other people's input there silently; the branch fixed that with more fragment code. In a review tree it is ordinary editing.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Target model | One review tree that the editor edits, with accepted and proposed content as filtered reads | Keep accepted-first and merge the duplicate paths, or drop only the fragment documents | keep accepted-first |
| What plugins see | Commands and normalizers see the review tree; exports, AI context, find and counts read a filtered copy | Plugins see only accepted content | accepted only |
| Revert of old accepted work | Remove it, and restore earlier content from a saved revision through comparison | Keep selective revert and retained history | keep revert |
| Which views can edit | Only the markup view; accepted and proposed previews are read-only | Keep editable accepted and proposed views | editable previews |
| Moved content | A move is a deletion plus an insertion | Keep moves that keep their identity | keep moves |
| Two people decide one change at the same time | The collaboration merge decides, and a rejection wins | Keep the conflicted state and the resolve step | keep conflicts |
| Saved authored documents from before the change | Refuse them on load, because no published release wrote them | Convert them once on load | convert old docs |
| Typing inside struck text | The new text splits the deletion, in both modes | Move the new text to the end of the deletion | move to end |
| Direct text inside a pending insertion | It follows that insertion's decision and keeps its own author, for text and for blocks | Direct text is always accepted, which splits tables | keep split |
| Stop rule for the first slice | Stop when the rewrite owner needs a branch for one command or plugin, then review the plan again | Stop and keep the current model | keep current on stop |
| Where this run pauses | After the plan panel, before the build | Before the plan panel | pause earlier |

## Evidence

Model: claude-opus-5-5 led the review. The readers read `13956eec` and natamox's branch at `5a183f0d02`; the ledger marks the page stale only because `docs/vision/plate.md`, `docs/vision/plite.md` and `.agents/rules/plate-ui.mdc` changed after it, in lines unrelated to authored changes. Eight Opus readers traced the code, the branch, prior art and the record; their replies are saved verbatim under `docs/plans/artifacts/2026-10-08-authored-review/`.

This review supersedes `2026-10-04-authored-audit` (Stop): the requirement that editing in struck text feels like normal editing is new, and the coordinate-space count, the fix trail and the prior art contradict its conclusion. It retains `2026-10-07-suggestions-editor-input` (Pursue): the editor's single user is unaffected. It takes up the unified content tree that [the loadable-state design](2026-09-12-authored-loadable-state-design.md) deferred as the strongest larger challenger, and it reverses the accepted-roots law in `docs/vision/plite.md` and [the authored ownership decision](../research/decisions/authored-change-ownership.md), which the plan repairs through `best-api repair`.

### Requirements

- Record who suggested what, show it, and accept or reject one change, a batch or one author's changes atomically (`content/docs/(guides)/authored-changes.mdx`).
- Editing inside suggestions and struck text feels like normal editing; the mode changes only how the change is recorded (the message's typed ask).
- Deleted text is editable in normal mode (the message's point 1).
- Direct text typed in a pending table stays in its cell and leaves with the table on reject (the doc's owner rule).
- Exports choose accepted, proposed or review content explicitly (`docs/vision/plate.md`, Authored projection is an option on the ordinary format operation).
- Comments anchor to changes and survive decisions; AI suggestions use the same records (`docs/vision/plate.md`).
- Two collaborators converge on suggestions and decisions (`docs/vision/common.md` Claim Width, collaboration behavior).
- Hard laws: `DocumentChange` stays the sole mutation truth (`VISION.md`); every document a consumer reads is schema-valid; caret and IME claims need native browser proof; hard cuts over compatibility.
- The retained-history job in `docs/vision/plite.md` ("retained author history produces new compensating changes") is cut by this target and needs its law repaired.

### Lanes

1. **Keep the model and merge execution (option 1).** Removes the per-fragment execution class only. Keeps eight coordinate spaces, two full documents, decision replay and the table split. Rejected.
2. **Accepted-first without fragment documents (option 2).** The editor would edit a projected document that holds struck ranges, which is a review tree, while a second authority still syncs and decisions still replay. It adds a hidden-content fact for the table rule. It keeps the costs of both models. Rejected.
3. **One review tree (option 3).** Removes the third coordinate space, the second commit pipeline, decision replay, carriers, the accepted-edit log and the custom collaboration transport. Costs: plugins see marked content, block boundaries need a rule, and the losses in the Defaults. Picked.
4. **Delete native authored and use Yjs suggestion documents.** Every suggestion would need Yjs and a forked document. Upstream y-prosemirror calls its pending-delete view "a best-effort read-only projection" and reverts writes into it. Rejected.
5. **Control: no change.** Keeps the 2026-10-04 Stop. Loses to the fix trail and to every reference editor. Rejected.

### Mechanism counts

- Coordinate spaces and mappers: eight spaces, 41 named mappers in Plite's core and authored layer, at least 13 more in the DOM layer (`how-model/reply.md`).
- Struck-only branches in `packages/plitejs/src/react/editable/` on the branch: 60, of which 42 are new on the branch (`how-edit/struck-branches.tsv`).
- React runs one command per fragment: `mutation-controller.ts:1040-1199` on the branch, verified (`how-edit/reply.md`).
- Decisions replay forward onto accepted or inverted onto projected, with a remove, decide and re-add pass for independent dependants (`decisions.ts:204-242`, `:601-682` on the branch; `how-decide/reply.md`).
- The table split reproduces on the branch and not on the owner checkout, where another author's typing becomes a dependent proposal (`how-edit/table-split-branch-a1.log`, `table-split-owner-a1.log`).

### Fix trail

The branch's plans, decision logs and commits hold 114 fix rows, not 55. The classifier dropped 9 that change no code and read the code change behind each of the other 105 (`branch-fixes/fixes-detail.tsv`). By root cause: 54 map or sync coordinate spaces, 12 replay operations on accept, reject or undo, 4 come from direct text that must exist in the accepted document, and 35 are other work (the paging cursor, grouping, review-card summaries, codec versions and the original-text store the branch later deleted). None is a pure browser defect: each row that looks like one, such as double-click word selection or the caret after IME, traces to struck text being a `contenteditable=false` fragment. 60 rows would not exist in a review tree, 29 partly, and 16 still would. 20 rows fix code that is gone or partly gone at the branch head. The doc's own tally (22 sync, 13 replay, 12 per-fragment execution, 5 browser, 3 product rules) agrees in direction.

### Consumers

Of 28 consumers, 14 work unchanged on a review tree, 13 need an explicit filtered read, and 1, the Yjs binding, is rebuilt onto the ordinary tree path (`how-consumers/consumers.tsv`). Most of the 13 go through core string, point and node reads, so one filtered read serves them; the mutating ones (normalizers, table, list and mark commands) need the rewrite owner's rule for struck content. Two current defects surfaced: Find paints nothing on a markup view with pending changes, and AI sends accepted content for `{editor}` but projected content for `{block}` (`how-consumers/consumer-probe-a1.log`).

### Why accepted-first

The record holds no owner ruling. Agent-written plans chose accepted-first on 2026-09-10 ([the native authored plan](2026-09-10-native-authored-changes-and-suggestions.md), lines 48-51 and 272) one day after research said "Neither representation has won the comparison" ([assessment](../plite/research/2026-09-10-authored-changes/assessment.md), line 129). The woven tree was rejected by argument, never prototyped. Struck text became read-only fragments because typing there "requires an explicit restore/proposal action" (`plan:240`), a rule the code has since dropped. Plate v1's suggestion engine failed mostly through per-command recording behind a global flag, not through the single tree (`how-consumers/reply.md`; `why-git/reply.md`). Linear holds no Plate design record (`why-linear/reply.md`).

### Proof limits

Nothing here is built or measured beyond the saved-shape probe and the readers' headless probes. The fix classification and consumer buckets are agent readings checked against code, not runs. Prior art for Google Docs, Word, CKEditor and Notion comes from vendor docs. The review tree's schema cost, block-boundary rule and performance are unproven; the plan proves them first.

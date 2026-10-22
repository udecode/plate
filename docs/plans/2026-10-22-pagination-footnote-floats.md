---
review_scopes: [pagination]
verdict: defer
review_basis: [2026-10-06-pagination-review]
review_commit: 4864577f3d6fc29a109554bf132ab03fdfb03c34
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, .agents/playbooks/references/architecture.md, .agents/skills/best-api/SKILL.md, docs/plans/topics/pagination.md, docs/plans/topics/footnote.md, docs/plans/2026-10-06-pagination-review.md, docs/plans/2026-10-19-plite-feature-specs-intake.md, docs/plans/2026-05-29-plite-pagination-architecture-review.md, docs/plans/2026-10-17-footnote-review.md, packages/plitejs/src/pagination/index.ts, packages/plitejs/src/pagination/react.tsx, packages/plitejs/test/pagination/page-layout-contract.test.ts, packages/platejs/src/pagination/index.ts, packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts, apps/www/src/registry/examples/pagination-demo.tsx, 'apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx', 'apps/www/src/app/(app)/examples/plite/plite-example-loaders.tsx', 'content/docs/(guides)/pagination.mdx']
review_upstreams: ['../premirror@29b78634d6496206c84015068eb7d66d9cdc312c', '../tiptap-docs@916bd947ce60e7591ff35e4a45f2a7340dcdef4b']
---

# Pagination: hold page footnotes until pages can measure a note

Status: blocked: waiting on t_c8441921, how pages measure container blocks
Topic: pagination
Playbook: verdict

**Defer. Pagination should not add a page float contract until it can measure the note it would place.** Dylan's spec has the engine save room at the bottom of each page for that page's notes, and it says the engine "measures the note with that block's normal fragmentation plan, so Pretext measures the note text like any other text". That premise is false today. A footnote definition is a block container, and the engine measures only blocks whose children are inline. A probe at `4864577f3d` showed that a paged document with one footnote definition refuses to measure without an app plan, refuses a `text` plan, and places the note only at the height the app hands it. A float would reserve that guess. The same gap keeps paged footnotes from working even as endnotes, and Details and columns hit it too. So the question that comes first is whether pagination measures the text inside container blocks, which t_c8441921 asks. The shape the spec's Decisions landed on, a document-level provider of `{ anchor, path }` pairs with no footnote type in Plite, is the right one to come back to in t_4ef72dbd. That renewed verdict also has to answer one native-selection case. A note painted at the bottom of page 1 still sits after the whole body in the DOM, so a drag from body text into it would select every page between them (inferred from DOM range order, not run).

## Brief

### What will change?

Nothing gets built, and footnotes in a paged document stay at the end. First we decide whether pages can measure notes and other boxed blocks, then we come back to notes at the bottom of each page.

### What could go wrong?

A paged document with any footnote still fails to lay out unless the app sizes each note by hand. Anyone who needs Word-style footnotes at the bottom of each page waits for two more decisions.

## Teach

A paged editor cuts the document into pages, like Word's print view. The engine measures each block's lines and stacks them page by page. A footnote is two pieces, a small mark in the text and a note block kept at the end of the document.

Today the engine measures only blocks that hold text directly. A note holds paragraphs inside it, so the app has to guess its height, or the pages fail to draw. The notes then land after the body, like endnotes.

Dylan proposed notes at the bottom of each page. The engine would save room on the page where each mark sits and paint the note there. That needs the note's real height, which the engine cannot measure yet. So the first question is measuring boxed blocks, and page notes come after it.

## Public API

Today an app paginates by giving each non-text block a plan. The spec's Decisions proposed a document-level float provider beside it. The verdict keeps the before.

```tsx before
// content/docs/(guides)/pagination.mdx
<PagedEditorContent
  page={{ margins: 72, preset: 'letter' }}
  fragmentation={fragmentation}
/>;
```

```tsx after
// Dylan's Plite feature specs, spec 1, Decisions question 1; not built, and the spec names no footnote provider export
type PageFloat = Readonly<{ anchor: Path; path: Path }>;

type PageFloatProvider = (context: {
  children: readonly Descendant[];
  root?: NamedRootKey;
}) => readonly PageFloat[];

<PagedEditorContent
  page={{ margins: 72, preset: 'letter' }}
  fragmentation={fragmentation}
  floats={footnoteFloats}
/>;
```

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Notes at the bottom of each page | Wait until pages can measure a note | Plan the float contract now | plan | big |
| What comes first | Decide how pages measure boxed blocks | Build page notes on sizes the app guesses | sized floats | big |
| Further float work | Hold | Review again, or have other models challenge it | again, interrogate | small |
| Where the next question lives | The pagination topic | A topic of its own for boxed blocks | split topic | detail |
| Pagination page link | Keep the new page at https://claude.ai/artifact/FtcGuSe7rGtop8U1oRpswc, published because https://claude.ai/artifact/X2TpUgz6JwrqLGB8ahiEub no longer opened | Drop the new page if you deleted the old one on purpose | drop the new pagination page | detail |

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

### Requirements

- The job the spec names is Word and Google Docs parity in a paged document. Each note shows at the bottom of the page that holds its first reference, and that page's body ends above it. The owner asked for "verdict next", which picked this chip.
- Pages are view-owned derived geometry, and page boundaries never become document authority ([pagination subject](topics/pagination.md), Rules).
- Plite stays unopinionated, and a Plate product concern never goes into Plite core, so Plite holds no footnote type ([VISION.md](../../VISION.md), Plite Essentials and Boundary Law).
- Footnote definitions stay root-level end matter, and the stored shape does not change ([footnote subject](topics/footnote.md); [footnote review](2026-10-17-footnote-review.md), line 16).
- Fragmentation is text, one atomic owner or all direct element children, and the validator checks the engine's output for source order and conservation (`packages/plitejs/src/pagination/index.ts:942-1162`).
- Caret, selection and composition stay on the native browser path ([pagination subject](topics/pagination.md), Rules).
- A target with more concepts than the current design names the job that pays for each one ([common vision](../vision/common.md), Redesign from First Principles, step 4).

### Lanes

1. **A page float contract in Plite pagination, as the spec's Decisions revised it. Deferred.** It adds a `floats` provider to `measurePages` and `PagedEditable`, a `float` field on a layout block, a float placement on its fragment and a validator rule for floats. It keeps footnote types out of Plite and leaves the stored shape alone, and the spec's read of `page-mount-plan.ts` says a placed note mounts beside its page's body. It rests on the engine measuring the note's text, which it cannot do. `isSupportedInlineFlow` rejects a block whose children are blocks (`index.ts:368-374`), `extractBlocks` throws when such a block has no plan (`index.ts:439-451`), and a footnote definition's content is `plugins.blockContent` (`packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts:167`). The probe confirmed all three outcomes. The lane also makes one block's layout depend on another block. Where the anchor's line lands moves the reserved room, and that room can push the line to the next page. It needs a second order rule beside the validator's source-order check (`index.ts:979-985`) and an answer to the native-selection case in the lead. Footnotes are its only consumer.
2. **Keep the current design, so notes stay end matter and paginate after the body. Wins for now.** Endnotes need no new contract. A definition already sits at its root's end, and `extractBlocks` lays out top-level blocks in source order (`index.ts:421`). The lane shares lane 1's gap. The app must size each note's paragraphs through `direct-children` (`index.ts:483-508`), and the guide says a block whose children are blocks makes measurement fail without a plan (`content/docs/(guides)/pagination.mdx`, Fragment non-text blocks). Neither the registry demo nor the Plite example passes a plan for a footnote definition.
3. **Floats that carry their own size, the spec's first draft. Loses.** The app gives each note's height, which drops the measurement premise. The reservation is then only as true as that guess, the same guess `direct-children` takes today, and every app with footnotes writes the sizing.
4. **Strongest deletion: drop the validator's source-order rule and let an app's own engine place notes. Loses.** It adds no Plite noun. But the engine input carries only blocks, a page and settings (`index.ts:190-195`), so an engine cannot see which reference anchors which note, and every app would write its own composer. The rule also guards body order for every engine. Predicted benefit of the cut is one public type fewer than lane 1, which does not pay for the lost guard.
5. **Measure the text inside container blocks first, then judge floats. The next owner, as t_c8441921.** If the engine measures a container's text children, a footnote definition, Details and columns paginate without app guesses, endnotes work with no plan, and a later float reserves a measured height. If the owner keeps container sizes with apps, a float has to carry a size, as in lane 3, or stop.
6. **The rule is wrong: the May review's second-consumer rule. Not the obstacle.** That rule keeps table, media and fragment behavior provider-owned until a second structured-node consumer earns a shared helper ([2026-05-29 review](2026-05-29-plite-pagination-architecture-review.md), line 436). A float is an engine contract that no provider can add, so the rule does not block lane 1. Its point still holds, though, because footnotes are lane 1's only consumer.

**Proof limits.** The probe ran the estimated engine under `bun test`, not Pretext in a browser, and it checked measurement only, with no paint or editing. The native-selection case is inferred from DOM range order, and nothing ran it. Word and Google Docs behavior comes from the spec, and this review did not check it. Of the editors read, none ships page footnotes. Premirror's design proposal plans footnotes after floating boxes, anchored objects and headers, as "constrained area allocation", and Tiptap's Pages limitations list no footnote support. This review read both and ran neither.

### Dependents

- `ui`: unaffected. Its three files reach this scope only through `apps/www/src/app/(app)/examples/plite/plite-example-loaders.tsx`, which lazy-loads the pagination example by path, and a Defer changes no file.
- `apps/www/src/registry/examples/pagination-demo.tsx`, which no scope owns: read and unaffected. It plans only tables, so it shows the gap lane 2 names, and a Defer changes nothing in it.

### History

- This review reopens [2026-10-06-pagination-review](2026-10-06-pagination-review.md), the scope's head, a Pursue that its plan built, at the page float question only, because that review never took floats up. Its `PagedEditorContent` decision stands, and this review reran none of its proof. `lookup` marks it stale, with 47 changed inputs and moved Vision files.
- This review retains the [2026-05-29 architecture review](2026-05-29-plite-pagination-architecture-review.md), because its provider-owned rule does not block floats, as lane 6 says.
- This review retains the [2026-10-17 footnote review](2026-10-17-footnote-review.md), because definitions stay root end matter and every lane keeps that shape.
- This review retains the [2026-10-19 intake](2026-10-19-plite-feature-specs-intake.md), because its item 2 is this question and offered t_c27fe6d2.
- External checkouts read: `../premirror` at `29b78634d6496206c84015068eb7d66d9cdc312c` and `../tiptap-docs` at `916bd947ce60e7591ff35e4a45f2a7340dcdef4b`.

## Close

**Defer.** Page-bottom footnotes wait until pages can measure a note. A footnote definition is a block container, and the engine measures only inline text, so a float would reserve a height the app guesses. The same gap stops paged footnotes from laying out at all without a hand-written plan. t_c8441921 asks whether the engine measures the text inside container blocks, and t_4ef72dbd renews this verdict once that lands.

What landed: this review page and its decision log, and no code. The proof is the probe's log in the run directory, which the decision log cites, plus source reads. Its limits are in Evidence. Counts: the owner's one ask, "verdict next", is done. One question was judged, with verdict Defer, and the run offered two tasks.

## Open work

- t_c8441921 Decide whether pagination measures the text inside container blocks. owner: zbeyens, tracked in the suggested-task ledger. stop: its verdict lands.
- t_4ef72dbd Decide again whether pagination places footnotes on their pages. owner: zbeyens, tracked in the suggested-task ledger. stop: its verdict lands, after t_c8441921.

# Intake: Dylan's Plite feature specs

Status: done: 14 items, 8 chips offered, 2 folded
Page: https://claude.ai/artifact/GAahzqti2FhJArUbJcyV3A
Playbook: verdict

Dylan's five Plite feature specs hold 14 items: 4 bugs, 4 settled, 6 open questions, and nothing to stop or defer. Fix the unnamed pagination editor and the printing defect first, then the questions that split view already makes live; the three new layout features come last. Every chip below waits on the board for a session; this run built nothing.

## Brief

### What will change?

Dylan's 14 points now sit on the chips board: 8 new tasks and 2 added to tasks already there. This run built, planned and started nothing.

### What could go wrong?

The doc's browser and screen-reader results came from scripts nobody else can rerun, so those points start as claims. Printing waits at normal priority until someone reproduces it.

## Pushback

- **Stale chip states.** The doc lists t_f7cbb3b1 as the open Mermaid size task, but the ledger shows it dismissed as done. It calls t_228be4ba carded by another session, but it holds no card. It marks t_ad6feb38 folded, but it is an offered fix with no card.
- **The doc contradicts itself.** Spec 2 ends with two Confidence blocks, and the second still rates Pele without a DOM unknown after Q3 rated it high. Spec 1's closing block keeps the page-mount risk at low after Q4 raised it to high. Spec 4's proposed API hides page chrome with `aria-hidden` alone, while its Decisions require `inert`. The "Decisions win" note at the top covers only specs 1 to 3.
- **One editor already has two views.** Spec 5 Q3 says shared Details open state does no harm "since one editor has one view". Spec 3 shows split view ships today in `find-demo.tsx`, so two views of one document share open state now, not later.
- **Doctrine applied selectively.** Spec 2 keeps diagram sizes out of Plite by the May rule that a provider helper waits for a second consumer. Spec 1 adds a Plite float contract whose only consumer is footnotes, and never says why that rule does not apply.
- **Probes nobody can rerun.** The print PDFs, the accessibility-tree counts and the until-found timings ran from scripts in the author's scratch folder on another machine, against the deployed beta site instead of this branch. None of them is in the repository, so each result is a claim here.
- **A wrong premise, caught late.** Spec 3's proposed `view` prop and `ViewKey` rest on split view not existing. The doc's own Decisions withdraw them, so the spec above its Decisions should not be read as the proposal.

## Items

| # | Item | Outcome | Scope | Strongest reason | Evidence | Next |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Footnote definitions stay root end matter instead of becoming content roots (spec 1, Q2) | Settled | footnote | The footnote review decided it three rounds ago and built the end-matter slice field on it | `docs/plans/2026-10-17-footnote-review.md:16`, `:268` | none |
| 2 | Per-page footnotes: a document-level float provider in Plite pagination, a float rule in the engine's output check, and endnotes as the no-floats case (spec 1, Q1, Q3, Q4) | Open question | pagination | A new page contract with one consumer; the output check refuses any fragment whose block index goes backwards, which every float does | `packages/plitejs/src/pagination/index.ts:979-985`; `docs/plans/2026-05-29-plite-pagination-architecture-review.md:436` | t_c27fe6d2 |
| 3 | Diagram sizes in paged layout and pictures in static pages: Mermaid measured at once through Pele in the copied item, async engines report sizes, static pages draw pictures (spec 2, revised proposal, Q1, Q3) | Open question | drawing | It reverses the drawing review's pick to keep static pages source only, and moves size ownership into the copied renderer item | `docs/plans/2026-10-18-drawing-pele-review.md:113` | t_16b02165 |
| 4 | A remeasure without a document commit is already safe (spec 2, Q2) | Settled | pagination | Font loading already bumps an epoch that remeasures with no commit, and the version guard only rejects a stale editor read | `packages/plitejs/src/pagination/react.tsx:975`, `:1026`, `:1050`, `:1086` | none |
| 5 | Split view of one document already ships, read-only mirror included (spec 3, premise) | Settled | runtime | The doc's own Decisions withdrew the proposal: two `EditorRoot`s on one editor already render as two views | `apps/www/src/registry/examples/find-demo.tsx:23-29` | none |
| 6 | Which state each view of one root owns: its own caret through `selection: 'shared' \| 'own'` backed by anchors, and its own Details open state (spec 3 Q1 and Q2, spec 5 Q3) | Open question | runtime | Vision gives mounted-view presentation its own owner, while the caret cache and Details open state are kept once per editor | `VISION.md:60`; `packages/plitejs/src/react/hooks/root-selection-cache.ts` | t_01e4e980 |
| 7 | A root's saved caret is a clone that edits made outside that root never move (spec 3, Q1 table) | Bug, P2 | runtime | The cache clones on record and on read, records only each commit's own selection, and focusing the root dispatches the clone back; the visible effect was not reproduced | `packages/plitejs/src/react/hooks/root-selection-cache.ts`; `packages/plitejs/src/react/hooks/use-plite-runtime.tsx:470-473`; `packages/plitejs/src/react/editable/root-interaction-controller.ts:1269` | t_f7956c53 |
| 8 | A plugin method called through any view skips the review frame, not only through a named root's view (spec 3, Q3) | Bug, P2 | authored | The frame opens only when the caller is the base editor, so a second view of main skips it too | `packages/plitejs/src/core/plugin-dispatch.ts:90`, `:194` | folded on t_c3104bb1 |
| 9 | What a screen reader gets from a paged editor by default: inert page surfaces, one page announcement, no per-page label in the docs, and the demo opening in complete mode (spec 4, Q1, Q3) | Open question | accessibility | Page attributes carry no hidden flag, both pagination docs pages teach a label on every page, and the demo defaults to virtualized while the library defaults to complete | `packages/plitejs/src/pagination/react.tsx:757-761`, `:968`; `content/docs/(guides)/pagination.mdx:46`; `content/docs/plite/libraries/plite-pagination/index.mdx:42`; `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:121` | t_eba39c28 |
| 10 | The Plite pagination example's editor has no accessible name (spec 4, side finding) | Bug, P2 | accessibility | Its `PagedEditable` passes no label, while the registry pagination demo passes one | `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:976`; `apps/www/src/registry/examples/pagination-demo.tsx:283` | t_53adb7c7 |
| 11 | Printing a paged document prints one page, in both rendering modes (spec 4, Q2) | Bug, P2 | paged-print | The doc's PDF probe is not rerunnable, so it stays P2; the fix it proposes, a static print tree from the page snapshot, is itself a design choice | the doc's spec 4 Q2; no print or `beforeprint` handling found under `packages/plitejs/src/pagination` | t_ad82104c |
| 12 | Hidden content findable by browser find: a plain-text placeholder inside `hidden="until-found"`, on by default for Details (spec 5, Q1) | Open question | large-documents | No boundary renders findable text today, and the risk the doc names, the find highlight pointing at a node React just replaced, is untested | `git grep` finds no `until-found` or `beforematch` under `packages` | t_fd3bbda0 |
| 13 | One reveal step on the coverage session for find, comment, footnote and TOC jumps (spec 5, Q2) | Open question | large-documents | t_a95bb51c asks this exact question, offered with no card | t_a95bb51c's brief | folded on t_a95bb51c |
| 14 | Details open state is view state, not document state (spec 5, Q3) | Settled | callout | The Details hard cut keeps open state transient; the per-view half is item 6 | `docs/plans/2026-08-29-semantic-details-hard-cut.md:53` | none |

## Order

1. Item 10 first, because a missing accessible name is a real defect with a one-line fix.
2. Item 11, because printing is broken today and its fix decides how pages leave the editor before any feature adds to them.
3. Items 6, 9 and 7, because split view already ships and screen readers already read every page surface. Item 6 is P1, since the runtime build in flight may depend on its answer, and item 7's fix waits on it.
4. Items 2, 3 and 12 last. Each adds a feature, and none fixes a defect.

Items 13 and 8 need nothing new. Dylan's evidence now sits on tasks that were already waiting.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Printing's question | Its own question, apart from page layout | Join the page layout question and wait behind footnote floats | merge print | small |
| Caret and open state per view | One question for both | Two questions | split views | small |
| The saved-caret fix | Waits on the per-view question, whose anchor answer would replace the clone | Fix the clone now | fix caret now | small |
| Printing's priority | Normal, until someone reproduces it | Reproduce it now and raise it | rerun print | small |
| Starting the tasks | Leave them offered, with no cards | Card them now | /chips | detail |

## Close

This run landed this page and its decision log, and nothing else. It offered 8 tasks and folded Dylan's evidence into 2 open ones; the owner's "without pursuing" kept it from carding them, running the chips sweep, or starting any fix, plan or build.

Proof and limits come from the decision log. The page check passed, every new chips row is an offer or a fold, and every scope the doc touches has the same review head before and after. This run reran no browser, screen-reader or print result, so items 7, 10 and 11 rest on source reads and items 9, 11 and 12 on the doc's own claims.

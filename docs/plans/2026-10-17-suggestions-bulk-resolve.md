---
review_scopes: [suggestions]
review_basis: [2026-10-12-suggestions-complete]
work_kind: implementation
review_commit: 4f880fc5702db166a0e92e8f8b15d5ab9fa26b0c
review_inputs: [packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/types.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/test/authored-tree-decisions.test.ts, packages/plitejs/test/authored-tree-resolve-laws.slow.ts, packages/plitejs/test/authored-tree-recording-laws.slow.ts, packages/plitejs/test/authored-tree-decide-completion.test.ts, packages/platejs/src/authored/AuthoredPlugin.ts, packages/platejs/src/features/suggestion/BaseSuggestionPlugin.ts, packages/platejs/src/react/features/suggestion/useSuggestion.ts, apps/www/src/registry/components/editor/discussion.tsx, apps/www/src/registry/components/editor/mode-toolbar-button.tsx, apps/www/src/registry/components/editor/mode-toolbar-button.spec.tsx, apps/www/src/registry/components/editor/suggestion-toolbar-button.tsx, apps/www/src/registry/components/editor/floating-toolbar.tsx, apps/www/src/registry/components/editor/plugins.ts, apps/www/src/registry/examples/suggestion-demo.tsx, apps/www/src/app/(app)/examples/plite/_examples/authored-changes.tsx, content/docs/(plugins)/(collaboration)/suggestion.mdx, content/docs/(guides)/authored-changes.mdx, docs/vision/plate.md, docs/vision/plite.md]
review_upstreams: ['../prosemirror-suggest-changes@653fba70ba29ef6ea6af3ad8d60244a58df7281b', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../manuscripts-track-changes-plugin@62f4d19dda4c2d41afa5d9fdecea840fb6bfb0be', '../tiptap-docs@916bd947ce60e7591ff35e4a45f2a7340dcdef4b', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../y-prosemirror@9200946f0ea455c681a7496c364ee998a9f064f7']
---

# Suggestions: Accept all and Reject all from the mode menu

Status: executed: uncommitted on next, waiting on your commit
Playbook: plan

**Pursue, in the copied UI only.** The mode menu that already switches between Editing, Viewing and Suggestion gets Accept all and Reject all, and the Suggestions docs teach the same call. No package API is added. Plite's `update.decide` already takes every pending change in one call and resolves them together, and its laws already prove that one call that applies gives the document that deciding each card in turn gives, and that deciding everything is never blocked. A Plate `acceptAll` would be a second decision command, which `docs/vision/plate.md` forbids Plate to own. A Plite "decide everything" variant would decide changes the caller never read, which breaks Plite's rule that a decision names the changes it read, only to save an eight-line paging loop. The next owner is this plan's build. It answers suggested task `t_5e64f9fa` (finding S19 of the 2026-10-16 suggestions test pass).

## Brief

### What will change?

The Editing mode menu now has Accept all and Reject all, so one click settles every suggestion, like Google Docs. One undo click or one Cmd+Z brings them all back. The packages don't change.

### What could go wrong?

I clicked through only the Radix menu. The Base UI menu passes its type check, but no browser ran it. Nothing tested the error you'd see if your schema rejects the result. Everything stays uncommitted until you commit.

## Teach

Suggestions are edits waiting for review. Each one sits in the document as a mark, and the review UI groups one author's neighboring edits into a card. Today you settle them one card at a time from the discussion popover beside each paragraph.

Some cards hang together. Text one person typed inside another person's insertion goes away if that insertion is rejected, so deciding one card alone can come back "blocked" and ask you to decide the other too. That is why order looked like a risk for "accept all".

The editor already decides a whole set of changes in one step. It works out the final document from every decision at once, so nothing is blocked when the set holds every pending change. Its tests already check that, when it succeeds, this gives the same document as deciding cards one by one in any order. The new menu items just collect every pending change and hand them to that one step.

## Demo

1. Open `/docs/suggestion` and click **Suggestion** in the first demo's toolbar. The menu shows **Accept all suggestions** and **Reject all suggestions** under the three modes.
   ![after](artifacts/2026-10-17-suggestions-bulk-resolve/drive/rebase/1-menu-pending.jpg)
2. Choose **Accept all suggestions**. "collaboratively" stays, "redundant phrase" goes, and the suggestion badges disappear.
   ![before](artifacts/2026-10-17-suggestions-bulk-resolve/drive/rebase/1-menu-pending.jpg) ![after](artifacts/2026-10-17-suggestions-bulk-resolve/drive/rebase/2-accept-all.jpg)
3. Click undo once, or press Cmd+Z right after the menu closes. Both suggestions come back.
   ![after](artifacts/2026-10-17-suggestions-bulk-resolve/drive/rebase/3-cmd-z-undo.jpg)
4. Choose **Reject all suggestions**. "collaboratively" goes and "redundant phrase" stays as plain text.
   ![after](artifacts/2026-10-17-suggestions-bulk-resolve/drive/rebase/4-reject-all.jpg)
5. Open the menu again. Both items are greyed out because nothing is pending. Switch to **Viewing** on a fresh page and they stay greyed out even with suggestions pending.
   ![after](artifacts/2026-10-17-suggestions-bulk-resolve/drive/rebase/6-viewing.jpg)

## Public API

The copied mode menu decides every pending change in one call. No package call changes.

```tsx before
// apps/www/src/registry/components/editor/mode-toolbar-button.tsx
```

```tsx after
// apps/www/src/registry/components/editor/mode-toolbar-button.tsx
const authored = editor.plugin(AuthoredPlugin);
const changes: AuthoredChange[] = [];

for (let cursor: string | undefined; ;) {
  const page = authored.read.changes({ cursor, limit: 200 });

  changes.push(...page.items);
  if (!page.cursor) break;
  ({ cursor } = page);
}

const result = authored.update.decide({ action, changes });
```

## Main changes

- The copied `ModeToolbarButton` (`apps/www/src/registry/components/editor/mode-toolbar-button.tsx`) adds **Accept all suggestions** and **Reject all suggestions** under its modes when `SuggestionPlugin` is installed. Each item pages every pending change through `AuthoredPlugin`'s `read.changes` and decides them in one `update.decide` call, so one undo restores them. Both items are disabled in Viewing mode and when nothing is pending. An `invalid` result shows a `sonner` error and changes nothing.

## What other editors do

Read from local checkouts at the commits in `review_upstreams`, and from the Google Docs and Microsoft Word help pages; Tiptap's and CKEditor's tracked-change engines are commercial and absent, so only their docs were read. Every editor with a full review UI offers both bulk actions, and none of the open implementations proves that a bulk accept matches accepting each change in turn, which Plite's laws do.

| Editor | Bulk accept and reject | How it applies | Where the control sits | Source |
| --- | --- | --- | --- | --- |
| prosemirror-suggest-changes `653fba7` | `applySuggestions`, `revertSuggestions`, plus range variants | One transaction that walks the document, then joins block boundaries | Demo buttons above the editor | `handlewithcarecollective/prosemirror-suggest-changes@653fba7:src/commands.ts:301-460`; `demo/main.ts:153-176` |
| manuscripts track-changes `62f4d19` | No all command; `setChangeStatuses(status, ids)` takes a caller's ID set | One appended transaction, structural changes first, then text sorted by update time | None in the plugin | `Atypon-OpenSource/manuscripts-track-changes-plugin@62f4d19:src/commands.ts:50-66`; `src/changeHelpers/updateChangesStatus.ts:34-109` |
| BlockNote `1e26f1c` | `applyAllSuggestions`, `revertAllSuggestions`, delegated to `@y/prosemirror` | Not in the checkout | No caller found | `TypeCellOS/BlockNote@1e26f1c:packages/core/src/y/extensions/Suggestions.ts:121-132` |
| Tiptap Pro (docs `916bd947`) | `acceptAllSuggestions`, `rejectAllSuggestions`, by user and by range | Not documented | Toolbar and above the suggestion list | `ueberdosis/tiptap-docs@916bd947:src/content/tracked-changes/api-reference/commands.mdx:85-148` |
| CKEditor 5 (docs `14e73cc`) | `acceptAllSuggestions`, `discardAllSuggestions` commands | Not in the checkout | Not confirmed from the checkout | `ckeditor/ckeditor5@14e73cc31b:docs/features/server-side-editor-api.md:227-249` |
| Lexical `dd5c41b` | None; mark primitives only | Not applicable | None | `facebook/lexical@dd5c41b13:packages/lexical-mark/src/index.ts:28-48` |
| Google Docs | Accept all, Reject all | Not disclosed | Review suggested edits box, opened from Tools | [Google Docs Help](https://support.google.com/docs/answer/6033474?hl=en) |
| Microsoft Word | Accept All Changes, Reject All Changes, and the Shown variants per reviewer | Not disclosed | Review tab's Accept and Reject menus | [Microsoft Support](https://support.microsoft.com/en-us/word/training/track-changes-in-word) |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Undo | Accept all or Reject all is one undo step that restores every decided suggestion | Plite's generated history law (`packages/plitejs/test/authored-tree-recording-laws.slow.ts:1618-1636`), and the hand drive in Chromium on `/docs/suggestion` |
| Focus | Choosing an item closes the menu and returns focus to the editor | Hand drive in Chromium on `/docs/suggestion` |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where Accept all lives | In the Editing mode menu, under the three modes (look) | Its own Review button in the toolbar; buttons in each paragraph's discussion popover | review button | big |
| New package call for deciding everything | None; the menu gathers every suggestion and decides them together | A new editor call that decides everything; a new suggestion plugin command | engine api | big |
| What counts as all | Every pending suggestion in the document, from every author | Only your own suggestions; only those in the selection | mine only | small |
| When the items are greyed out | In Viewing mode and when nothing is pending | Always clickable, doing nothing when empty | always on | detail |
| When the document can't take the result | Show an error and change nothing | Try deciding card by card instead | card by card | detail |
| How this review is filed | As part of the open suggestions plan | As a new review of its own | new head | detail |
| Editor tests | Rely on the editor's existing tests for order and undo | Add a test that accepting everything matches the Proposed preview | add law | detail |
| When the menu shows an error | Only when your schema rejects the result, because one click that collects and decides everything can't be blocked or out of date | An error for any result other than applied or unchanged, as the first step said | toast all | detail |
| The next demo's crash in the hand drive | Count the check done with that one page still red, because the Next.js install demo crashes in its own code, which another task covers (look) | Fix that demo here | fix demo | detail |
| Suggestions page link | The new page https://claude.ai/artifact/NKfmSN3HXP15YCC757xRc5, because this account can't open https://claude.ai/artifact/RHmV8unJBZmh4yntdG4wuZ, which may be deleted or shared only with another account | Drop the new page and restore the old link | old page | detail |

## Decisions

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bulk decision | `update.decide` takes many changes and resolves them together | Same | Plite `authored` | One resolution over one action map; the laws below prove order independence and no blocking | None | Existing laws | None | keep |
| Accept all and Reject all control | None | Two items in `ModeToolbarButton`'s menu | Copied registry UI | `docs/vision/plate.md` lines 431-435 give Plate presentation and mode controls, not a decision command set; the mode menu is the one document-level review control and a `suggestions` consumer | Registry consumers re-add `mode-toolbar-button` | `mode-toolbar-button.spec.tsx` case red at base, hand drive | Schema refusal of the decided document | rearchitect |
| Teaching | Suggestions docs teach card decisions only | Docs teach deciding every suggestion in one call, and the menu items | `content/docs` | S19 found no docs path | English and Chinese pages | `plate-docs` checks and preview | None | rearchitect |

## Steps

- [x] Add Accept all and Reject all to `ModeToolbarButton`'s menu, shown only when suggestions are installed, greyed out in Viewing mode and when nothing is pending, deciding every pending change in one `decide` call and toasting a result other than applied or unchanged. Proof: a new case in `apps/www/src/registry/components/editor/mode-toolbar-button.spec.tsx` that fails at the base commit and passes after, run with its log in the run directory. Done: `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/base-spec-a1.log` fails both cases at base, and `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/spec-a4.log` passes all five on the final bytes.
  Built with one change: the menu shows an error only for `invalid`, because one click that reads and decides every change cannot return `blocked` or `stale` (Defaults row "toast all").
- [x] Through `plate-docs`, update `content/docs/(plugins)/(collaboration)/suggestion.mdx` and its Chinese twin: the demo intro and Kit text name the menu items, and a new section shows deciding every suggestion in one call. Proof: the `plate-docs` checks and the rendered page in the preview. Done: `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/link-build-source-a3.log`, `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/link-docs-parity-a3.log` and `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/build-registry-check-a4.log`; `/docs/suggestion` and `/cn/docs/suggestion` render the new section in the hand drive.
- [x] Through `changeset`, add the registry changelog entry for `mode-toolbar-button` and regenerate the registry output. Proof: `pnpm check registry-changelog` and `pnpm --filter www build:registry` logs. Done: `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/registry-changelog-a4.log` and `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/build-registry-a4.log`.
- [x] Hand drive the change through `verify`. Proof: `node tooling/scripts/hand-drive.mjs check` log over the plan's files, with screenshots of the menu and of the document after Accept all, Undo and Reject all on `/docs/suggestion`. Done: `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/hand-drive-a3.log` covers 37 of 38 cells, accepted through the Defaults row "fix demo" for the next demo's existing crash; frames in `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/drive/`.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Base control of the new case | `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/base-spec-a1.log` |
| Blast radius before a public API change | skip: no package API changes; the copied component keeps its props |
| `thermos` per slice | skip: the diff touches one copied registry component, its spec, its registry entry and docs, no code shared across packages or plugins |
| `plate-docs` on changed pages | `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/link-build-source-a3.log`, `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/link-docs-parity-a3.log`, `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/build-registry-check-a4.log` |
| Playtest | skip: `playtest.mjs scope` names no scenario catalog for these files |
| `best-api repair` | skip: no reusable public API changes |
| Registry changelog | `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/registry-changelog-a4.log` |
| Writing passes | deslop, comment-sicko and unslop; the decision log's `writing` row |
| Lint fix | `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/lint-task-a2.log` |
| Hand drive | `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/hand-drive-a3.log`, accepted through "fix demo" |
| Decision-trail review | `docs/plans/artifacts/2026-10-17-suggestions-bulk-resolve/trail/answer.md`, reviewed by codex `gpt-6.1-sol` @xhigh |

## Close

Reversals and deviations come first.

- Step 1 said the menu shows an error for any result other than applied or unchanged. It shows one only for `invalid`, because one click that reads and decides every pending change cannot get `blocked` or `stale` back (Defaults "toast all").
- The hand drive is accepted with one red page. `/blocks/installation-next-demo` already crashes in its server render on a `localStorage` read in `installation-next-04-value-demo.tsx`, which this change does not touch and suggested task `task_f99fb601` covers (Defaults "fix demo").
- After the trail review, the docs and this plan say a bulk decision matches deciding one at a time only when it applies. A schema refusal stops the bulk call whole, while single decisions could apply some first.
- The change moved from `4f880fc570` onto `8f5afd571d`, the owner's later commit on `next`, because both regenerate the same registry files. The registry output was regenerated there, and the spec, docs, registry, lint and `tsc` checks and the whole hand drive ran again on that base. The plan's `docs/vision/plate.md` citations moved 3 lines with it.

What landed, uncommitted on `next` from `docs/plans/artifacts/chips/t_5e64f9fa.patch`:

- `apps/www/src/registry/components/editor/mode-toolbar-button.tsx` adds Accept all suggestions and Reject all suggestions, and its spec gains one case for each.
- `apps/www/src/registry/registry-editor.ts` lists `sonner` for the entry and describes the new items; `content/docs/meta.json` repeats that description.
- `suggestion.mdx` and `suggestion.cn.mdx` name the menu items in the demo intro and add a Decide every suggestion section.
- A registry changelog entry, its generated JSON and the regenerated registry output under `apps/www/public/r` and `apps/www/src/__registry__`.
- `docs/plans/topics/suggestions.md` takes the new page link and this plan's fold.

Proof, from each row's scope:

- Both new spec cases fail at `4f880fc570` because the menu has no such items, and all five mode menu cases pass on the final bytes with the same 3 act warnings the base logs.
- The built-in Chromium browser drove `/docs/suggestion` at 1280 px in light on `www-drive`, on both bases (`drive/rebase/` frames 1 to 6 on `8f5afd571d`, `drive/` frames 1 to 13 before). The menu shows both items, and Accept all and Reject all leave the expected text. One toolbar undo restores both suggestions, and so does one Cmd+Z, because focus returns to the editor. Both items are greyed when nothing is pending and in Viewing mode.
- `hand-drive.mjs check` covers 37 of 38 cells on `8f5afd571d`.
- In the Base UI editor-ai consumer installed from `4f880fc570` plus this change, a full `tsc` reports no error in `mode-toolbar-button.tsx`; its only error is in `dnd.tsx`.
- The registry generation is fresh, the registry changelog check passes, docs parity and `build:source` pass, and lint reports nothing on the 3 linted files.

Limits:

- No browser drove the Base UI variant, and no Base editor-ai consumer builds, because `dnd.tsx` fails its type check there (suggested task `t_f70e26df`).
- The www typecheck stays partial. `editor:check`, `api-reference:check` and both `tsc` projects fail only in files that import nothing this change touches. The run inferred that from imports and ran no base check.
- No test or drive reaches the `invalid` error, which needs a schema that refuses the fully decided document.
- Only Chromium at desktop width was driven.

The review read these inputs at `4f880fc570`: `packages/plitejs/src/authored/authored.ts`, `packages/plitejs/src/authored/types.ts`, `packages/plitejs/src/authored/tree/resolve.ts`, `packages/plitejs/test/authored-tree-decisions.test.ts`, `packages/plitejs/test/authored-tree-resolve-laws.slow.ts`, `packages/plitejs/test/authored-tree-recording-laws.slow.ts`, `packages/plitejs/test/authored-tree-decide-completion.test.ts`, `packages/platejs/src/authored/AuthoredPlugin.ts`, `packages/platejs/src/features/suggestion/BaseSuggestionPlugin.ts`, `packages/platejs/src/react/features/suggestion/useSuggestion.ts`, `apps/www/src/registry/components/editor/discussion.tsx`, `apps/www/src/registry/components/editor/mode-toolbar-button.tsx`, `apps/www/src/registry/components/editor/mode-toolbar-button.spec.tsx`, `apps/www/src/registry/components/editor/suggestion-toolbar-button.tsx`, `apps/www/src/registry/components/editor/floating-toolbar.tsx`, `apps/www/src/registry/components/editor/plugins.ts`, `apps/www/src/registry/examples/suggestion-demo.tsx`, `apps/www/src/app/(app)/examples/plite/_examples/authored-changes.tsx`, `content/docs/(plugins)/(collaboration)/suggestion.mdx`, `content/docs/(guides)/authored-changes.mdx`, `docs/vision/plate.md` and `docs/vision/plite.md`.

Counts over the 4 steps and 11 gates: 9 done, 2 partial and accepted (step 4 and the Hand drive gate), 4 skipped, 0 blocked, 0 open.

Attention, from the decision-trail review:

reviewed by codex `gpt-6.1-sol` @xhigh

- warning: the bulk-equals-sequential claim lacked its success condition. Applied in both docs pages and this plan.
- warning: the www typecheck's base attribution had no base run. The row now says the attribution is inferred.
- warning: the hand drive closed with an open cell. The Defaults row is now a look call, and the redrive logs its own accepted row.
- warning: two previews were still loading in the first drive. Both pages were reloaded until their editors and menu rendered.
- warning: no installed consumer covered the Base dropdown. The create-install run and the Base consumer `tsc` now do, with the build limit above.
- warning: this plan carries no `verdict` front matter. Dismissed: a verdict page naming the open review would become the scope's head and close on this plan's landing, hiding the open review-tree plan (`docs/research/schema.md` lines 138, 150 and 151); "new head" reverses it.
- nit: the Cmd+Z precheck never settled keyboard undo. A control and a Cmd+Z after Accept all now pass.
- nit: the old page may only be unshared. The Defaults row now says this account can't open it.
- nit: `registry-editor.ts` was edited one call before its started row. Recorded; no other task writes it.

## Open work

- The mode menu has no Base UI build or browser proof, because the Base editor-ai consumer fails on `dnd.tsx`'s tooltip. Tracked as suggested task `t_f70e26df` in `docs/plans/suggested-tasks.decisions.tsv`. owner: zbeyens, who starts or drops that task. stop: `pnpm --filter www test:create-install editor-ai` builds both consumers, or the task is dropped.

## Evidence

Model: claude-opus-5-5 at xhigh effort ran this review and plan.

This plan builds under the open `2026-10-12-suggestions-complete` review, which it retains: that plan moves suggestions onto the review tree and does not cover bulk review. Its review question is unchanged by this page, so this page adds no verdict head.

### Requirements

- Job: settle every pending suggestion in one action, accept or reject, as Google Docs and Word allow (S19 in `docs/plans/artifacts/2026-10-16-suggestions-test/results.md`, which the run that wrote it keeps).
- Job: the result matches accepting or rejecting each suggestion in turn (S19's expected result).
- Law: suggested-edit semantics, decisions included, come from Plite's native authored capability; Plate owns presentation, mode controls and discussion composition, never another decision command set ([docs/vision/plate.md](../vision/plate.md), lines 431-436).
- Law: a decision takes the changes it read and refuses one that moved since, and review reads take a place so no render walks every pending change ([docs/vision/plite.md](../vision/plite.md), lines 363-370).
- Law: a decision removes the decided claims and records its verdicts in one transaction, and undo restores them ([docs/vision/plite.md](../vision/plite.md), lines 379-384).

### Lanes

- **Copied UI calls the existing decision (picked).** The mode menu pages every pending change at click time and decides them in one call. It adds no concept and keeps the read-then-decide law.
- **Plite decision over a query.** A `{ action, query }` decision would decide every change matching a query at decide time, which also covers author and range filters. It adds a second way to decide and decides changes nobody read; a caller that collects and decides in one handler gets the same result without it. Rejected; "engine api" reopens it.
- **Plate `acceptAll` on the suggestion plugin.** The strongest deletion is to add nothing to Plate, and it holds, because a Plate decision command contradicts `docs/vision/plate.md` lines 431-435. Rejected.
- **Buttons in the discussion popover.** The popover lists one paragraph's cards, so an all action there reads as "all in this paragraph". Rejected; "review button" moves the control to its own toolbar button instead.
- Proof limits: the order and blocking laws are generated documents from Plite's recorders, not every document an app can load. A schema that refuses the fully decided document makes the whole call `invalid` (`packages/plitejs/test/authored-tree-decide-completion.test.ts`, the `decide-lifted` schema), which the toast reports. No law compares a full decision with the preview projections, so the docs do not claim that.

Order and blocking, from source and tests read at the review commit:

- `decideOn` builds one action map and calls `resolveAuthoredValue` once over the stored value ([authored.ts](../../packages/plitejs/src/authored/authored.ts), lines 1038-1170); both blocking checks skip changes the map holds (lines 1102-1107, 1128-1143), so a decision over every pending change is never `blocked`.
- [authored-tree-decisions.test.ts](../../packages/plitejs/test/authored-tree-decisions.test.ts) lines 133-182 accept together and one at a time in every permutation, growing a blocked step with what it waits on, and require one document.
- [authored-tree-resolve-laws.slow.ts](../../packages/plitejs/test/authored-tree-resolve-laws.slow.ts) lines 272-308 compare accepting everything at once with admissible batches in turn over 1,000 generated documents.
- [authored-tree-recording-laws.slow.ts](../../packages/plitejs/test/authored-tree-recording-laws.slow.ts) lines 2762-2907 compare a batch with rotated single decisions on recorded histories and require accept everything and reject everything to apply; lines 1618-1636 undo and redo a decision over every change in one step.

### Dependents

- `distribution`: unaffected, because its imports (`packages/platejs/src/utils/plugins/ExitBreakPlugin.ts` and others) read suggestion keys, not decisions.
- `editing`: unaffected, for the same reason (`packages/platejs/src/utils/plugins/SingleBlockPlugin.ts`).
- `react`: [useSuggestion.ts](../../packages/platejs/src/react/features/suggestion/useSuggestion.ts), unchanged; the menu reads changes through `AuthoredPlugin` directly.
- `ui`: [floating-toolbar.tsx](../../apps/www/src/registry/components/editor/floating-toolbar.tsx) and [plugins.ts](../../apps/www/src/registry/components/editor/plugins.ts), unchanged; the floating toolbar keeps `SuggestionToolbarButton`, which only toggles the mode.

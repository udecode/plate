# Link upsert: selections across links and code blocks

Status: executed: waiting on your commit
Topic: link
Playbook: bug-fix

The owner's "Do this task here: 'Fix link upsert's expanded-selection branch'" took the link subject's open work item that the links review filed. Linking selected text threw an error when the selection ended inside a link, covered a whole link or sat in a code block, and typing a web address and a space in a code block threw the same error.

## Brief

### What will change?

Linking selected text now works across other links and no longer crashes in a code block, and the link command dropped its two target options, as you picked. The Close lists the reversals.

### What could go wrong?

A link command that gets refused can still drop the selected part of an old link. Only Chromium was tested.

## Teach

Adding a link to selected text is one command, upsert. A selection inside one link updates that link. Otherwise it removes old links in the selection, then wraps it in the new link.

Both steps were broken. The removal handled only one end of the selection, and at the far end it unlinked the wrong piece. A link sitting wholly inside the selection was never removed, so the new link landed around it, which the editor rejects with an error. Nothing asked whether the block can hold a link, so a code block failed the same way.

Now the editor core does both steps. Its unwrap cuts each touched link at the selection's edges and removes only the selected piece. Its wrap asks each block's rules first and skips blocks that can't hold a link. The link command calls the two and reports a link only when the wrap lands. The paste and typing rules drop a refused attempt.

## Demo

1. Run the www dev server with pnpm --filter www dev and open http://localhost:3000/blocks/link-demo. Clear the editor, type three backticks to start a code block, then type https://example.com and a space. The space goes in as text, with no link and no error. ![after](artifacts/2026-10-12-link-upsert/frames/space.png)
2. In that code block, select a word and press Cmd+K. The link form stays closed and the text stays plain. ![after](artifacts/2026-10-12-link-upsert/frames/cmdk.png)
3. In a paragraph, type see https://old.example, a space and tail, so the address becomes a link. Drag-select from "see" to the middle of the link and paste https://new.example. The selected words get the new link, and the rest of the old link keeps the old one. ![after](artifacts/2026-10-12-link-upsert/frames/paste.png)

## Public API

`upsert` drops its two target options, so a caller selects the range it wants linked before calling it.

```ts before
// packages/platejs/src/features/link/lib/BaseLinkPlugin.spec.tsx
editor.update.link.upsert({
  url: 'https://new.example',
  wrapNodesOptions: { at: [0] },
});
```

```ts after
```

## Main changes

- Plite's `tx.nodes.unwrap({ split: true })` splits an inline element that holds text at the range's edges and unwraps the selected piece, and unwraps the whole element at a caret or an explicit point. Before, it lifted nothing from such an element. A block that holds text keeps the old behavior. `tx.nodes.unwrap` returns whether it changed the document, as `tx.nodes.wrap` does.
- Plite's `tx.nodes.wrap` of an inline element over a range, with no `match` or `type`, checks where the wrapper would land before it splits, as `docs/plans/2026-10-12-link-upsert-edges.md` describes. It tests the element that would hold the wrapper against the nodes the wrapper would move, splits and wraps only where that passes, and stages nothing when nowhere does. Before, only the path form checked the schema, and a range wrap threw at commit. One internal schema helper, `canWrap`, now answers this for the range form, the path form and the block toggle.
- `BaseLinkPlugin`'s `unwrap` and `upsert` lose their two hand-written copies of the split logic and call `tx.nodes.unwrap` and `tx.nodes.wrap` on the live selection. Over a selection outside a link, `upsert` returns `true` only when the new link lands, so the paste and typing rules decline a refused attempt and drop its unwrap. Inside one link it updates that link and returns `true`, even when nothing changed, as at `HEAD`.
- The copied `link.tsx` `triggerInsert` asks `editor.read.schema.allowsElementType` whether the selection's block can hold a link, so Cmd+K and the link button keep the form closed in a code block. Plate builds no element without declared content, so this read and the wrap agree for every block type the editor declares. A preserved block of an unknown type keeps the form closed, though a paste there links.
- The link page, its Chinese twin and the transforms page describe the new results.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the fix lives | In the editor core, so link wrap and any other inline wrap get it too (look) | Inside the link plugin only | plugin-only fix | big |
| Selection across a paragraph and a code block | The link lands in the paragraph | Nothing changes and the command reports no change | refuse across blocks | small |
| Cmd+K or the link button in a code block | Nothing opens | The form opens and a submit does nothing | open the form | small |
| Unlink selected text with the cursor inside a link | The whole link is removed | Nothing happens | caret does nothing | detail |
| Add a link over a selection in one block that holds a mention | The link is refused; a pasted address goes in as text | Link the text around the mention | link around mentions | small |
| Paste and Markdown link rules in a code block | They keep naming the code block for now | Switch them to the same block-rules question now | move the rules | detail |
| Browser proof beside the earlier link shortcut fix | The runs served this fix with that uncommitted fix (look) | A run without it, where the shortcut tests fail on the old bug | proof without the shortcut fix | detail |
| Dev lane split across two worktrees | Its steps passed split across two worktrees, because each one's install fails one step (look) | One worktree whose install runs the whole lane | rerun the whole dev lane | detail |
| Where a new link typed at the cursor goes | The link command keeps its insert position option, which the Markdown link rule uses | Cut that option too | cut the insert option | detail |

## Steps

- [x] Reproduce at the model and in Chromium with tests that fail for each defect. Proof: the new and corrected tests fail at the base and the browser probe throws. Done: `docs/plans/artifacts/2026-10-12-link-upsert/red-link-spec-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert/red-browser-a2.log`, `docs/plans/artifacts/2026-10-12-link-upsert/red-toolbar-spec-a1.log`.
- [x] Find the causes with runtime evidence. Proof: probes against the source show each failing shape. Done: `docs/plans/artifacts/2026-10-12-link-upsert/probe-src-probe-a1.log`.
- [x] Pick the design with architect. Proof: three runners and a cross-judge. Done: `docs/plans/artifacts/2026-10-12-link-upsert/architect/design.md`.
- [x] Build the Plite and link changes and the toolbar guard. Proof: the link spec, the link directory, the Plite core partition and both typechecks pass on the base plus this task's patches. Done: `docs/plans/artifacts/2026-10-12-link-upsert/green-link-spec-a2.log`, `docs/plans/artifacts/2026-10-12-link-upsert/plite-core-c-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert/plite-typecheck-c-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert/platejs-typecheck-c-a1.log`.
- [x] Writing passes, then a panel on the diff. Proof: deslop and no-comments rows, the panel's seats row and its findings settled. Done: `docs/plans/artifacts/2026-10-12-link-upsert/comment-sicko/reply.md`, `docs/plans/artifacts/2026-10-12-link-upsert/panel-diff-1/prompt.md`, `docs/plans/artifacts/2026-10-12-link-upsert/panel1-red-specs-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert/panel1-green-specs-a2.log`.
- [x] Re-review the round 1 fixes. Proof: the round 2 seats row and its findings settled. Done: `docs/plans/artifacts/2026-10-12-link-upsert/panel-diff-2/prompt.md`, `docs/plans/artifacts/2026-10-12-link-upsert/panel2-red-specs-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert/panel2-green-specs-a1.log`.
- [x] Re-review the round 2 reverts and fixes, the last diff round. Proof: the round 3 seats row and its findings settled. Done: `docs/plans/artifacts/2026-10-12-link-upsert/panel-diff-3/prompt.md`, `docs/plans/artifacts/2026-10-12-link-upsert/panel3-red-spec-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert/panel3-red-browser-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert/panel3-green-link-dir-a2.log`, `docs/plans/artifacts/2026-10-12-link-upsert/panel3-green-browser-a1.log`.
- [x] Cut the two target options after your answer. Proof: the link directory and the platejs typecheck pass without them, and the API reference drops both. Done: `docs/plans/artifacts/2026-10-12-link-upsert/link-dir-cut-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert/platejs-typecheck-cut-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert/api-reference-cut-a2.log`.
- [x] Panel on the cut's diff, with round 3's edge fix. Proof: the seats row and its findings settled. Done: `docs/plans/artifacts/2026-10-12-link-upsert/panel-diff-4/prompt.md`, `docs/plans/artifacts/2026-10-12-link-upsert/probe-cut-cut-a2.log`, `docs/plans/artifacts/2026-10-12-link-upsert/probe-cut-revert-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert/probe-sol-cut-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert/link-dir-revert-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert/platejs-typecheck-revert-a1.log`.
- [x] Re-review the revert of round 3's edge fix, with the plan of `docs/plans/2026-10-12-link-upsert-edges.md`. Proof: the next seats row and its findings settled. Done: `docs/plans/artifacts/2026-10-12-link-upsert/panel-diff-5/prompt.md`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/probe-edges-v2-a2.log`.
- [x] Final proof on the final bytes, shared with the edges iteration. Proof: five warm Chromium runs of the link URL policy and floating editor specs and the probe's code block, Cmd+K, paste-over-link and drag-to-edge cases, the link directory, the Plite transform fixtures, Plite core, both typechecks and Plite's dev lane. Done: `docs/plans/artifacts/2026-10-12-link-upsert/final-edges-a1-a1.log` to `docs/plans/artifacts/2026-10-12-link-upsert/final-edges-a1-a5.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-wrapnodes-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-link-dir-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-fixtures-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-plite-core-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-plite-typecheck-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-platejs-typecheck-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-plite-dev-lane-a1.log` with `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-plite-smoke-www-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-inlines-line-break-a1.log`.

## Close

Linking selected text works across other links and no longer crashes in a code block, and the link command dropped its two target options, as you picked. Plite's unwrap cuts a link at the selection's edges and removes only the selected piece. Plite's inline wrap skips blocks that cannot hold the link, and over a selection outside a link `upsert` returns `true` only when the link lands. The edges iteration, `docs/plans/2026-10-12-link-upsert-edges.md`, rebuilt where the wrap starts and ends after this plan's two edge fixes failed.

Reversals and deviations come first:

- Round 1 added a pre-check to `upsert` that refused the whole selection when it held an inline a link cannot hold, and an edge rule in Plite's wrap that ignored an inline the range only touches. Round 2 found a critical in each: the pre-check read the live selection for an explicit point target, and the edge rule let a wrap without `split` nest a link. Both were reverted, not patched again.
- Round 1 narrowed the copied toolbar guard to blocks with declared content. Round 2 reverted it, because Plate builds no element without declared content.
- Round 2's revert made a selection dragged up to a link's edge paste the URL as text, where `HEAD` had linked it. Round 3 moved the range off touched edges before the wrap's fit check and splits, as the edge mechanism's one replacement. The cut's panel found that this move, run again after the split, linked text the selection never held, so it was reverted. The mechanism went back to planning as the edges iteration, which rebuilt it as one content range, so text dragged up to a link's edge links again.
- This plan's fit check tested the block against the highest inline elements in the range. The edges iteration replaced it with a check where the wrapper lands, because the old check refused a wrap inside an inline that can hold the wrapper. A wrap with `match` or `type` now gets no fit check.
- The brief asked whether `upsert` should refuse where a link cannot land or the toolbar should stay closed there. Both now hold.
- You picked "Cut both (Recommended)" for the two target options. `insertNodesOptions` stays, because the Markdown link rule uses it, so a link inserted at a caret can still go to another place.

The proof is shared with the edges iteration, whose Close lists it. It ran in worktrees at `d5584ea719` with this task's files, so it did not run other sessions' uncommitted edits to the link plugin. The browser runs also served the earlier Cmd+K fix, as the Defaults row "Browser proof beside the earlier link shortcut fix" records. No single run of Plite's dev lane passed: each worktree failed one step for its install, and every step passed in a worktree that could run it, which the Defaults row "Dev lane split across two worktrees" accepts. Only Chromium ran.

Counts: 11 steps, 11 done, 0 partial, 0 skipped, 0 blocked, 0 open.

Attention, from the decision-trail review, verbatim. The fixes after it are in each log's trail rows.

reviewed by gpt-6.1-sol @xhigh

- Refused direct calls and form submits can still remove old links. Cross-block paste and the inlines Link button retain related loss paths.
- An unchanged existing link can still make `upsert` return `true`; the broad final success claim needs narrowing.
- The 60 Chromium test runs passed with the earlier Cmd+K fix included. A successful complete Plite dev-lane run is not recorded.
- Final-byte performance was not measured. The Benchmark gate remains open; the Claude-only stale-claims hook is non-blocking and received no panel.
- The subject fold was prepared, not executed before this snapshot. Several final claims, open items and review counts need correction.

Open work, moved to the link subject's `## Open work` with the edges iteration's:

- A link command over a selection that holds a link and an inline a link cannot hold, such as a mention, unlinks the selected part of that link and does not relink it, because `upsert` unwraps the selection before the wrap refuses that block. The paste and typing rules drop a refused attempt. A direct call, the link form, and a URL pasted across blocks that links another block keep the unlink. The Plite inlines example's Link button unwraps every link the selection touches, so a refused wrap there removes whole links. `HEAD` threw on the same calls. owner: zbeyens. stop: Plite gains a public placement read that `upsert` can ask per block before it unwraps, or a report of a lost link.
- One Plite-owned public read of whether a wrapper fits a block would also cover four smaller gaps. The copied toolbar keeps the form closed in a preserved block of an unknown type, where a paste links. A path target without `split` or a selector skips the inline fit check, and a wrap with `match` or `type` gets none. `canWrap` checks types but not counts. The paste and Markdown link rules still name the code block. owner: zbeyens. stop: Plite gains a public placement read.
- With `keepSelectedTextOnPaste` off, a URL pasted over a selection that spans blocks links each block that can hold a link and replaces no text, as `HEAD` does for two plain paragraphs. owner: zbeyens. stop: a report, or the next link API review.
- Inside one link, `upsert` returns `true` even when the URL, target and text already match and it changed nothing, as at `HEAD`; the result fix covers only the wrap branch. owner: zbeyens. stop: the next link API review.
- `upsert` still takes `insertNodesOptions`, whose `at` places a link inserted at a caret, and `children`, which it ignores. owner: zbeyens. stop: the next link API review.

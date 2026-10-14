---
review_scopes: [editing]
verdict: pursue
review_basis: [2026-10-04-editing-audit]
work_kind: implementation
review_commit: 6fa1169c5e723eb3e058697189cdcad85be220f9
review_inputs: [packages/plitejs/src/transforms-node/wrap-nodes.ts, packages/plitejs/src/transforms-node/split-nodes.ts, packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts, packages/plitejs/src/dom/plugin/dom-editor.ts, packages/plitejs/src/editor/positions.ts, packages/plitejs/test/transforms/wrapNodes/split-inline/inline-mark.tsx, packages/platejs/src/features/link/lib/BaseLinkPlugin.ts, apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx, apps/www/src/app/(app)/examples/plite/[example]/page.tsx, docs/research/review-records/2026-10-04-editing-audit.json]
---

# Link upsert: selection edges

Status: executed: waiting on your commit
Topic: link
Playbook: bug-fix

**Pursue one content range for Plite's inline wrap, found in one pass before the fit check and the splits, with a per-block content check.** Both failed edge fixes added a second owner of one question, where a range's content starts and ends, and each time the two owners disagreed at some boundary. The cut panel on `docs/plans/2026-10-12-link-upsert.md` found that round 3's edge fix linked text the selection never held, and that plan reverted it. The edge mechanism had already been replaced once, so the panel rule sends it back to planning as this iteration. This is also its second failed fix, so the bug-fix playbook runs a verdict on the owner first. The owner's ask, "Do this task here: 'Fix link upsert's expanded-selection branch'", still needs the mechanism, because without it text dragged up to a link's edge pastes as text, where `HEAD` linked it. The review's first round revised this plan: the content check now runs per block, and the content range no longer steps with `after` and `before`.

## Brief

### What will change?

Linking text you dragged up to a link works again, and selecting only line breaks or empty lines links nothing. Review undid both fixes for read-only items like the example's badge. The Close lists reversals and where proof stops.

### What could go wrong?

A refused link can still drop the selected part of an old link. A read-only item at the edge of the selection stays outside the link. Only Chromium was tested, speed wasn't benchmarked, and the final audit corrected several overstated claims.

## Teach

A selection is two points, a start and an end. A point can sit at the very end of one piece of text or at the very start of the next one. On screen those look the same, but the editor treats them as different places.

The wrap used to split the text at the selection's edges, then nudge each edge one step off such a boundary. One step was not always enough. When the selection held only a line break or an empty paragraph, the nudged edges passed each other, and the wrap grabbed whole pieces of text on both sides.

Now the wrap does not nudge. It looks for the first and last real character, or mention, inside the selection, and wraps from one to the other. If there is none, the wrap changes nothing. Each paragraph also has to hold some of that content, so an empty line never gets a link.

## Demo

1. Run the www dev server with pnpm --filter www dev and open http://localhost:3000/blocks/link-demo. Clear the editor, type see https://old.example, a space and tail, so the address becomes a link. Drag from the start of "see" to the start of the link and paste https://new.example. "see " gets the new link, and the old link stays whole. ![after](artifacts/2026-10-12-link-upsert-edges/frames-final-a1/drag-edge.png)
2. Open http://localhost:3000/examples/plite/inlines. Select from the end of the first paragraph to the start of the second and paste https://example.com/line-break. The address goes in as plain text and joins the two lines, with no link. ![after](artifacts/2026-10-12-link-upsert-edges/frames-final-a1/line-break-after.png)

## Public API

The call stays the same; what it wraps at the range's edges changes.

```ts before
// apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx
tx.nodes.wrap(link, { split: true });
```

```ts after
// apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx
tx.nodes.wrap(link, { split: true });
```

## Main changes

- Plite's `tx.nodes.wrap` with `split`, no `match` or `type`, and an inline element over a range first finds the range's content, the first and the last character or inline void inside the range. One forward walk of the range finds both. A point inside a void covers that void. A read-only inline is not content, so the range stops short of one at either end, though an inline element around it can still move into the wrapper whole. The wrap ignores `voids`, so neither the walk nor the wrap enters a void or read-only element. The range then runs from the start of the first slice to the end of the last. When the range holds no content, the wrap changes nothing and returns `false`.
- A block qualifies for that wrap only when its own part of the range holds content. That check stops at the block's first match. The admission check, the splits and the wrap loop all ask the same question, so a block that holds only an empty text never gets a wrapper.
- An inline wrap with no `match` or `type` checks fit where the wrap loop puts the wrapper. It finds the first and last match the same way, with the same `voids`, and tests the element at their common parent against the wrapper holding the children between them. It used to test the block against the highest inline elements in the range, which refused a wrap inside an inline that can hold it. A wrap with `match` or `type` gets no fit check and keeps `HEAD`'s splits and edge move, because that move can change which nodes it moves. Only nested matches, below, wrap differently.
- When one match holds another, as `mode: 'all'` allows, the common parent is the outer match's parent, so the outer match moves whole, including any text outside the range. `HEAD` threw without `split` and inserted an empty wrapper with it. With a selector and `split`, a wrapper that cannot hold the outer match now throws at commit, like every selector wrap that does not fit.
- Inline wraps with `split` and no `match` or `type` drop the edge move after the split, because the content range's edges already sit on content. Block wraps keep the edge move.

## Evidence

Model: claude-opus-5-5 at xhigh effort for the lead's reads, probes, prototypes and synthesis; the review panel's seats are claude-opus-5-5 @high, gpt-6-astra @xhigh and gpt-6.1-sol @xhigh, each through `cross.mjs` read-only.

### Requirements

- The owner's typed ask: fix link upsert's expanded-selection branch. The task brief adds that the selected part of a link loses the old link and the tail keeps it, that a code block refuses without throwing, and that the wrap branch of `upsert` reports `true` only when a link landed.
- A selection that only touches a link's edge links the selected text and leaves that link whole, as `HEAD` did.
- An inline wrap over a range that holds no characters, or over blocks whose own parts hold none, changes nothing.
- A selection inside one link, even one that holds no characters, updates that whole link, as a caret there does. That branch returns before any wrap, and its result is unchanged.
- A range that crosses an inline void holds it. A point inside a void covers that void, as the clipboard does when it widens a range over a void at each edge ([dom-clipboard-runtime.ts](../../packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts), lines 587-600). Plite's DOM reader keeps a drag that ends on a void outside it ([dom-editor.ts](../../packages/plitejs/src/dom/plugin/dom-editor.ts), lines 2603-2613), so only an API caller sets a point inside one.
- Plite owns substrate behavior and Plate owns policy (`.agents/playbooks/bug-fix.md`, Plan the fix), so the edge rule lives in Plite's wrap ([wrap-nodes.ts](../../packages/plitejs/src/transforms-node/wrap-nodes.ts)), not in `upsert`.

### Lanes

- Delete the edge handling for inline wraps, and wrap exactly the range after splitting at its edges. Rejected: a selection that touches a link splits that link at its edge and counts it, so the drag-to-edge case stays refused.
- One content range, the pick. The first and last content slice in the range, found in one pass each way, set the range before the fit check, and each block must hold content of its own. This deletes the edge move after the split for inline wraps, so one owner answers where content starts and ends.
- Step each edge across touched boundaries with `after` and `before`, the first draft of this plan. Rejected after review: it checked content for the whole range, so a code block, an empty paragraph and a code block still wrapped the empty paragraph and returned `true`, and each step costs a walk that grows with the document ([positions.ts](../../packages/plitejs/src/editor/positions.ts)).
- Guard both existing moves against crossing. Rejected: two owners of one boundary question stay, and the cut panel's cases show they drift apart.
- Compute the content range in `upsert` and pass it as the wrap target. Rejected: the same defect reaches every inline wrap with `split`, such as the Plite inlines example, and the fit check and the splits that need the range live in Plite.

`upsert` unwraps old links before the wrap, deciding overlap on the raw selection, and skips a link the selection only touches, because that overlap is empty. It agrees with the content range on every case below: the touched link stays whole in the drag-to-edge case, and both links stay whole between two links.

The pick predicts:

- The seats' no-content cases change nothing and return `false`: three paragraphs `a`, empty and `b` selected from the end of `a` to the start of `b`, two adjacent paragraphs, two inlines around an empty text, and a code block, an empty paragraph and a code block.
- The drag-to-edge case links only the dragged text.
- A selection that starts right before a mention, or ends right after it, is refused in one block.

A prototype on the round 2 tree held each prediction (`docs/plans/artifacts/2026-10-12-link-upsert-edges/probe-edges-v2-a2.log`), with the Plite transform fixtures at 349 passing and 59 skipped, the link directory at 85 of 85 and Plite core at 1856 of 1856 (`docs/plans/artifacts/2026-10-12-link-upsert-edges/proto2-fixtures-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/proto2-link-dir-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/proto2-plite-core-a1.log`). The Close marks each prediction held or falsified on the built code.

The content search walks the range once forward, as the wrap already does, and each block's check stops at its first match. Inline wraps also stop calling `after` and `before`, whose cost grows with the document. An inline wrap runs once per gesture, such as Cmd+K, a paste or a typed URL. Benchmark's pre-acceptance probe has not run for it, so that gate stays open. A timing check, not a Benchmark receipt, shows no measurable difference. One link wrap over 300 and 1000 selected paragraphs took a median of 500 and 4081 ms on round 1's wrap (blob `1c97b35652`), and 487 and 4140 ms at `HEAD`. The final wrap (blob `991f715567`) was not timed. Each side ran five times, with overlapping ranges, at a load average near 8 on 18 cores (`docs/plans/artifacts/2026-10-12-link-upsert-edges/wrap-timing-final-a2.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/wrap-timing-head-a2.log`). At 100 paragraphs, 145 against 113 ms is inconclusive, because the sides were not alternated. Both sides grow faster than the paragraph count, which is `HEAD`'s wrap, and the limiter was not profiled.

The cases come from the review seats and this run's probes, and no public issue reports them. Only Chromium runs in the final proof.

### Dependents

- [BaseLinkPlugin.ts](../../packages/platejs/src/features/link/lib/BaseLinkPlugin.ts): `upsert` and `wrap` call the inline wrap with `split`.
- `apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx`: the link and button wraps call it with `split`, and its paste and typed-URL handlers fall back to plain text when the wrap refuses. The `ui` scope imports `apps/www/src/app/(app)/examples/plite/[example]/page.tsx`, which loads these examples, so they get the edge rule.
- `distribution`: unaffected, because every export stays and only what an inline wrap with `split` covers changes.
- `plate-api`: unaffected, because no plugin API or type changes.
- Block wraps, such as `BaseBlockPlugins.ts`, `BaseDetailsPlugin.ts` and the list index: unaffected, because block wraps keep today's move.

### Reconciled reviews

- This review reopens `2026-10-04-editing-audit` for one owner, Plite's inline wrap at a range's edges, because two failed fixes there need a design decision. Its Stop on input rule admission stands for the rest of the editing scope.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Pasting a URL over a selected line break | Nothing gets linked, so the paste goes in as text and joins the two lines | Link the text on both sides, as before | link across the break | small |
| A selection that crosses a mention | The mention counts, so the link is refused in that block | Link the text beside the mention | link beside mentions | small |
| Block wraps, such as quotes | Keep their edge behavior | Use the new content range too | block edges too | detail |
| A read-only inline at a selection's edge, such as the inlines example's badge | It stays outside the link, so a selection that ends with the badge links the text before it. No Plate element is read-only, and that badge is the only one in the code (look) | Count it as content and move it into the wrapper whole, as before this change | wrap read-only edges | small |
| Dev lane split across two worktrees | Its steps passed split across two worktrees, because each one's install fails one step (look) | One worktree whose install runs the whole lane | rerun the whole dev lane | detail |
| Where the failed-fix verdict lives | In this plan, recorded as the editing area's latest review (look) | A new review of the whole editing area | ledger review | detail |

## Steps

- [x] Write the failing tests first. Proof: at the code after the cut panel's revert, the link spec's drag-to-edge, line-break and code-block-around-an-empty-line cases and one Plite wrap fixture, two inlines around an empty text, fail for their named defects; the two mention cases, a selection that starts right before a mention and one that ends right after it, pass there and fail with the content search blind to voids. Done: `docs/plans/artifacts/2026-10-12-link-upsert-edges/red-link-spec-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/red-fixture-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/plant-void-blind-a2.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/plant-no-block-check-a2.log`.
- [x] Build the content range and the per-block check in Plite's inline wrap. Proof: the new tests pass, with the link directory, all Plite transform fixtures, Plite core and both typechecks. Done: `docs/plans/artifacts/2026-10-12-link-upsert-edges/green-link-dir-a2.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/green-fixtures-a2.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/green-plite-core-a2.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/green-plite-typecheck-a2.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/green-platejs-typecheck-a2.log`.
- [x] Writing passes, then a panel on the diff. Proof: deslop and no-comments rows, the seats row and its findings settled. Done: six rounds, three before and three after the restart, the last at the cap with every finding settled: `docs/plans/artifacts/2026-10-12-link-upsert-edges/panel-diff-6/prompt.md`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/probe-r6-r6fix-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/r6-green-wrapnodes-a1.log`.
- [x] Restore the docs and changeset wording for a selection that touches a link's edge. Proof: the teaching sweep for the narrowed phrase lists no live hit that still says otherwise. Done: `docs/plans/artifacts/2026-10-12-link-upsert-edges/teaching-sweep-edges-a1.log`.
- [x] Final proof on the final bytes, shared with `docs/plans/2026-10-12-link-upsert.md`. Proof: five warm Chromium runs of the link URL policy and floating editor specs and the probe's code block, Cmd+K, paste-over-link and drag-to-edge cases, the link directory, the Plite transform fixtures, Plite core, both typechecks and Plite's dev lane. Done: `docs/plans/artifacts/2026-10-12-link-upsert/final-edges-a1-a1.log` to `docs/plans/artifacts/2026-10-12-link-upsert/final-edges-a1-a5.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-wrapnodes-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-link-dir-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-fixtures-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-plite-core-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-plite-typecheck-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-platejs-typecheck-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-plite-dev-lane-a1.log` with `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-plite-smoke-www-a1.log`, `docs/plans/artifacts/2026-10-12-link-upsert-edges/final-inlines-line-break-a1.log`.

## Close

Plite's inline wrap with `split` and no `match` or `type` now wraps from the first to the last character or inline void the selection holds, and checks fit where the wrapper lands. Text dragged up to a link's edge links again, and a selection that holds only a line break or empty lines links nothing.

Reversals and deviations come first:

- Round 1 found that the content search skipped a read-only inline and ignored `voids`, so a selection from before the inlines example's badge through the next period linked only the period. Its fix counted a void or read-only inline as content and passed `voids` to the search. Round 2 found two criticals in that fix, and its fixes added a split guard at read-only edges and passed `voids` to the fit check. Round 3 found a critical in each, so all of them were removed. A read-only inline is not content, so the range stops short of one at either edge, though an inline around it can still move into the wrapper whole. That case stays open below.
- Settling round 3 found that a split wrap with `voids` over only a mention threw at commit where `HEAD` wrapped it. The wrap now ignores `voids`, a design change at the cap, so a `built:` row restarted the round count.
- After the restart, round 1 limited the content range to wraps without `match` or `type`. While probing that round's fit-check finding, the lead found that the link-upsert plan's fit check refused a wrap inside an inline that can hold the wrapper, and replaced it with the check where the wrapper lands. Round 2 found that the new check refused a text-match wrap `HEAD` makes. The check had used its one replacement, so wraps with `match` or `type` lost the fit check and run `HEAD`'s path, and the claim narrowed to wraps without them.
- Round 2 also found that nested matches threw, as at `HEAD`. The wrapper now goes around the outer match. Round 3 found that with `split`, that outer match can hold text outside the range. That stays deferred below, and the docs say so.
- Round 1's critical on the inlines example's paste and typing handlers was fixed in the example, which now pastes or types plain text when the wrap refuses.

Predictions:

- The seats' no-content cases change nothing and return `false`. It held. The link spec's line-break and code-block-around-an-empty-paragraph tests, the between-inlines fixture and the inlines example's two line-break browser tests pass.
- The drag-to-edge case links only the dragged text. It held in all five Chromium runs of the upsert probe.
- A selection that starts right before a mention, or ends right after it, is refused in one block. It held. Both mention tests in the link spec pass.

The final proof, shared with the link-upsert plan, ran on the final bytes in two worktrees at `d5584ea719` that hold this task's files and this session's earlier Cmd+K fix, and none of other sessions' uncommitted edits. Five warm Chromium runs with no retries passed 12 of 12 each: the upsert probe's code block, Cmd+K, paste over part of a link and drag-to-edge cases, and the link URL policy and floating editor specs. The wrapNodes contract tests passed 36 of 36, the link directory 89 of 89, the Plite transform fixtures 349 with 59 skipped, Plite core 1864, and both typechecks uncached. Plite's dev lane passed its entrypoint typecheck (99 tasks), app typecheck, entrypoint tests (156 tasks) and contracts (67) in the model worktree. Its browser smoke failed there, because Turbopack refuses that worktree's linked `node_modules`, and passed 3 of 3 in the www worktree under Node 22. The whole lane in the www worktree failed four test partitions, because its offline install skipped Bun's postinstall. No single run of the lane passed, and the Defaults row "Dev lane split across two worktrees" accepts the split. The inlines example's two line-break tests passed there too. Only Chromium ran, and Benchmark's pre-acceptance probe did not run.

The panel ran six diff rounds, three before and three after the restart, with 15 critical rows: 13 found by seats, 1 the lead found while probing, and 1 that reopened round 1's read-only critical after round 3's revert. 12 were applied, though round 3 removed the read-only fixes of rounds 1 and 2, and 3 stay open. The last round, at the cap, found no critical. Its warning is deferred, and its three nits are applied. The stale-claims hook this run added under `/pstack:correct` got no panel; its tests and its replay on past rounds are its proof.

Counts: 5 steps, 5 done, 0 partial, 0 skipped, 0 blocked, 0 open.

Attention, from the decision-trail review, verbatim. The fixes after it are in each log's trail rows.

reviewed by gpt-6.1-sol @xhigh

- Refused direct calls and form submits can still remove old links. Cross-block paste and the inlines Link button retain related loss paths.
- An unchanged existing link can still make `upsert` return `true`; the broad final success claim needs narrowing.
- The 60 Chromium test runs passed with the earlier Cmd+K fix included. A successful complete Plite dev-lane run is not recorded.
- Final-byte performance was not measured. The Benchmark gate remains open; the Claude-only stale-claims hook is non-blocking and received no panel.
- The subject fold was prepared, not executed before this snapshot. Several final claims, open items and review counts need correction.

Open work, moved to the link subject's `## Open work`:

- A refused wrap commits the unwrap before it. `upsert` over a link and a mention in one block returns `undefined` but unlinks the selected part of that link, through a direct call or the link form, and the inlines example's Link button removes whole links when its wrap refuses. `HEAD` threw on the same calls. owner: zbeyens. stop: Plite gains a public read of whether a wrap fits, or a report of a lost link.
- The range stops short of a read-only inline at either edge of the selection, though an inline around it can still move into the wrapper whole, and a wrap with `voids` inside a read-only block refuses where `HEAD` wrapped. No Plate element is read-only, and no caller passes `split` with `voids`. owner: zbeyens. stop: a read-only element type in Plate, a caller that wraps inline with `split` and `voids`, or a report.
- With `split` and `mode: 'all'`, a range inside an inline that the wrapper can hold wraps that whole inline, because the splits ignore `mode`, as they do at `HEAD`. Passing `mode` to the splits, as Slate does, would cut that inline at the range's edges. owner: zbeyens. stop: a caller that wraps with `split` and `mode: 'all'`, or a report.
- `link.wrap` still types and forwards `voids`, which the split wrap ignores. Cutting it is a hard cut. owner: zbeyens. stop: the owner cuts it, or a caller passes it.
- Benchmark's pre-acceptance probe has not run for the content range, and the final wrap was not timed; a timing check on round 1's wrap showed no measurable difference at 300 and 1000 paragraphs. owner: zbeyens. stop: a report of slow linking over a large selection, or the next change to Plite's inline wrap.
- Smaller gaps: block wraps keep an edge move that can flip the range; a backward selection comes back forward; Plite fixtures for touched inlines with text between, an empty middle block and a void at an edge are missing. owner: zbeyens. stop: the next change to Plite's inline wrap, or a report.
- The stale-claims hook runs only in Claude Code; moving the sweep into the shared freeze script is tracked in `docs/plans/topics/correct.md`.

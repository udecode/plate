# Plite blur right after typing

Status: executed; waiting on your commit of the working tree on next, together with the onFocus changes
Page: https://claude.ai/artifact/BKXGBAeV15nyqwNfDYhKGs
Playbook: bug-fix

## Brief

### What will change?

Clicking away right after typing now blurs the editor and runs your onBlur. Blurring right after End, Enter or Backspace no longer snaps focus back. With the onFocus session's change, the tags test needs no waits.

### What could go wrong?

Escape and mod+Enter pass without a wait only with the onFocus session's export change, so commit both together. Only Chromium ran, minus cases already broken on next.

## Teach

When you click away from the editor, the browser fires a blur. Plite passes it to your onBlur and marks the editor unfocused. Each time Plite moves the cursor in the page, it raises a flag for a few frames, so it can ignore the browser's echo of that move.

Until now, every blur in those frames was thrown away. A click away right after typing never reached onBlur, and the editor still thought it had focus. Keys like End or Enter also re-apply the cursor up to 80 ms later. When the editor had just been blurred, that late write pulled focus back.

Now a blur in that window is ignored only while focus stays inside the editor. Those late cursor writes stop once the editor has lost focus. With this fix alone, one gap stays. An edit made inside onBlur can still pull focus back, and the onFocus change closes that gap.

## Main changes

- `applyEditableBlur` ignores a blur during a selection write (`isUpdatingSelection`) only when the related target or the active element is still inside the editable. A blur that takes focus out now reaches the `onBlur` prop and clears `IS_FOCUSED`. The window-blur check, the spacer check and the other related-target exceptions are unchanged.
- A `sync-selection` repair still syncs once at the command, but its microtask, timeout and 80 ms settle re-syncs stop when the editor was focused at the command and is not focused now.
- This run dropped the tags field spec's 300 ms pause before the outside click and kept it before Escape and mod+Enter. The onFocus session then removed those two pauses as well, along with its own uncommitted focus check in the selection export.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A blur while the cursor is being placed | Count it when focus left the editor | Hold it until the cursor write settles, then decide | defer blur | small |
| Late cursor writes after a blur | Stop them once the editor lost focus | Keep them, which pulls focus back | keep resync | small |
| Selection writes into an editor that is not focused | The onFocus work took it; commit both together (look) | Never write one now and update the tests that expect it | export focused | big |
| The tags field's pauses | None, once the onFocus change lands with this fix | Keep the Escape and mod+Enter pauses and commit this fix alone | keep pauses | small |
| A page click within 50 ms of a key that refocuses | Leave it, since a person rarely clicks that fast | Let a click outside cancel the queued refocus now | cancel refocus | detail |

## Close

Reversals and deviations come first.

- You expected the tags spec to drop its 300 ms pause in all three close cases. This run's fix alone drops it only before the outside click. Without the pause, Escape and mod+Enter failed 8 of 10 warm repeats and 7 of 10 fresh runs on the final bytes (`docs/plans/artifacts/2026-10-12-plite-blur-gate/nopause-close-warm-a1.log`, `nopause-close-cold-a1.log` to `-a5.log`). The field's onBlur clears the search. The selection export for that commit writes the selection into the blurred editor, and Chromium refocuses it. Focus checks in that export and in every repair re-sync broke four plitejs React tests that write a selection into an unfocused editor (`wt-plitejs-react-a1.log`). I reverted the export check and left that call to the focus plan (Defaults: export focused). The onFocus session has since taken that call. In this checkout it skips the export and its own deferred focus syncs once the editor is unfocused, updates the tests that wrote into an unfocused editor, and removes the two keyboard pauses from the spec. Those edits are uncommitted, that session owns their proof, and none of this run's proofs include them. Its runs on the combined tree pass the tags spec 14 of 14 in each of five runs with no pause (`docs/plans/artifacts/plite-onfocus/browser-5x-r2-a1.log` to `-a5.log`), so the ask holds once both changes land together.
- The fix goes beyond the blur gate the ask named. The `sync-selection` repair's deferred re-syncs had to stop after a blur too. With the gate change alone, End then Escape ends with the editor focused again.
- Your commit `6fa1169c5e` took an early draft of this run's focus-blur cases and changeset. The working tree replaces both. The committed draft cases fail without the fix.

What landed, in the working tree on next, uncommitted:

- `selection-reconciler.ts` holds the new `applyEditableBlur` gate. It reads `event.currentTarget` and that root's active element, so no lookup runs before the selectable-target check.
- `mutation-controller.ts` wraps the three deferred re-syncs in `resyncUnlessBlurred`.
- `apps/plite/src/app/focus-blur/page.tsx` adds a draft fixture. Its onBlur deletes its text, and Escape blurs it.
- `apps/plite/tests/plite-browser/focus-blur.test.ts` adds three cases with a paused clock. They cover typing then an outside-field click, typing then a page click, and End then Escape.
- In `apps/www/tests/browser/select-editor.spec.ts`, this run kept the pause only in the keyboard branch. The tree now has no pause, after the onFocus session's edit.
- `.changeset/plite-blur-after-typing.md` has two patch bullets for plitejs.
- In `docs/plans/topics/tags.md`, I narrowed the pause item to the keyboard closes, and the onFocus session then removed it along with its export guard. The root-lookup item reached its stop, so I removed it.
- `docs/plans/topics/authored.md`, `react.md`, `pagination.md` and `html.md` each gain an Open work item for browser cases that fail or flake at base.

Proof and its limits. Every run used Chromium in a detached worktree at `6fa1169c5e` with this run's files copied in.

- All three new cases fail at base (`final-attrib-base-a1.log`). With only the gate change, End then Escape still fails (`final-attrib-R-a1.log`). With only the re-sync change, both click cases still fail (`final-attrib-M-a1.log`).
- All 6 focus-blur cases pass in each of five runs, retries 0, with a fresh build per run (`final-focus-blur-a1.log` to `-a5.log`).
- plitejs `test:react` passes 1445 of 1445 with no unhandled error (`final-plitejs-react-a1.log`).
- With the keyboard pause, the tags spec passes 14 of 14, and its close cases pass 15 of 15 over five repeats (`final-www-select-full-a1.log`, `final-www-select-close-a1.log`). The outside click passed all 10 runs without a pause.
- The Plite Chromium sweep over 57 files passes in four segments. The runner stops at its first failing batch, and each new skip set restarts it. Batches 1 to 42 of `final-sweep-a7.log` pass 491 tests, batches 1 to 5 of `final-sweep-rest-a1.log` pass 80, batches 1 to 3 of `final-sweep-rest2-a1.log` pass 47, and `final-sweep-rest3-a1.log` passes all 108 in its 19 batches. Each later segment reruns the files the one before had not finished, so some tests ran twice.
- Twenty-six cases fail at base without either change, so the sweep skips them by title. Every group below failed the same way at base, and each group that also ran on the fix bytes failed identically there.
  - Eleven drag cases throw `getFlatTreeParentElement is not defined`. Two are in embeds and images (`head-drag-attribution-a2.log`), and nine are the Plate block drag cases (`plate-dnd-base-a1.log`, `plate-dnd-RM-a1.log`).
  - Six authored-changes native selection cases select nothing (`authored-exclude-base-a1.log` to `-a3.log`). With those six skipped, the authored spec passes 49 of 49 at base and on the fix bytes (`authored-exclude-RM-a1.log`).
  - Two image drag cases leave no DOM selection once the sweep skips the first drag case (`images-base-a1.log`, `images-RM-a1.log`).
  - Two chip drag cases in `inline-void-drag.spec.ts` wait on the inline void drag fix that is still uncommitted (`inline-void-drag-base-a1.log`).
  - Two richtext cases lose a mark or empty-paragraph styling (`richtext-known-base-a1.log`, `richtext-known-RM-a1.log`), already tracked in the tags subject's Open work.
  - Two decorations-async IME composition cases fail (`decorations-async-base-a1.log`, `decorations-async-RM-a1.log`).
  - One schema descriptor case keeps a YouTube URL in standalone HTML (`schema-descriptors-base-a1.log`).
- The sweep also skips the huge-document downward drag autoscroll case. It failed 2 of 5 runs at base and 1 of 5 on the fix bytes (`autoscroll-base-a2.log` to `-a6.log`, `autoscroll-RM-a2.log` to `-a6.log`).
- Firefox and WebKit did not run.

The run had 17 todo items. 16 are done and 1 is skipped (a PR, which you did not ask for). None are partial, blocked or open. Dropping all three pauses counts as done only with the onFocus session's export guard in the tree. No panel ran, because no reviews-list row applies without a public API change or a PR. `architect` did not run, because the fix adds guards inside two functions and changes no signature or data shape. The decision-trail review and reflect did not run either. This was an attended single request with no workflow correction.

## Open work

- Six native cases in `apps/plite/tests/plite-browser/authored-changes.spec.ts` fail at `6fa1169c5e` without this change. Five of them still fail with the focus reconciler from before the onFocus change, so neither focus fix causes those (`authored-preonfocus-a1.log`). That run stopped before the sixth. Tracked in `docs/plans/topics/authored.md` Open work. owner: zbeyens. stop: the six cases pass at the head of next, or 2026-11-30.
- Two decorations-async IME composition cases fail at base. Tracked in `docs/plans/topics/react.md` Open work. owner: zbeyens. stop: both pass at the head of next, or 2026-11-30.
- The huge-document downward drag autoscroll case flakes at base. Tracked in `docs/plans/topics/pagination.md` Open work. owner: zbeyens. stop: it passes five runs of five at the head of next, or 2026-11-30.
- Two image drag cases in `images.test.ts` leave no DOM selection after the drop when the first drag case is skipped. The inline void drag plan's open item already tracks a null-selection image drag case and the `getFlatTreeParentElement` error on next (`docs/plans/2026-10-12-inline-void-drag.md`). That error also fails the nine Plate block drag cases. owner: zbeyens. stop: the image and Plate block drag cases pass at the head of next, or 2026-11-30.
- One schema descriptor case keeps a YouTube URL in standalone HTML. Tracked in `docs/plans/topics/html.md` Open work. owner: zbeyens. stop: it passes at the head of next, or 2026-11-30.

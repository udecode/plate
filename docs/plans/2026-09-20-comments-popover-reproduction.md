---
review_scopes: [comments]
review_basis: []
work_kind: verification
---

# Comments popover reproduction

Status: In progress

## Outcome and scope

Find stable real-browser reproduction paths for highlighted comments failing to open and outside clicks dismissing the popover without placing the caret at the clicked text. Diagnose only; no product edits or publication.

## Acceptance

- [x] Identify the current served checkout, browser and representative Comments routes.
- [ ] Reproduce the reporter's ordinary existing-comment opening failure with real pointer input; record preconditions, repeated trials and a control. The new-composer transition below is a related defect, not fulfillment of this acceptance.
- [ ] Reproduce the outside-click caret failure; inspect native selection and follow-up typing, repeat and compare a control.
- [ ] Capture and inspect failing visual evidence; map observed behavior to current source without claiming untested causes.
- [ ] Report concise user-replayable steps, actual trial counts and remaining limits.

## Evidence and next action

The user clarified the reporter surface is Playground and reaffirmed diagnosis only on September 21. Existing localhost:3000 listener PID 16581 had cwd apps/www in this checkout. The hydrated /blocks/playground-demo was tested through the persistent dedicated Chrome Dev profile. served-sources.json maps downloaded dev chunks to current Plite, CommentsPlugin and discussion source paths. No product source was edited.

### Related new-composer transition: stable, reporter equivalence unproven

In the starter yellow highlight `comments on many text segments`, click immediately before `text`, press Escape to close the existing discussion, then Shift+ArrowRight five times to select `text ` including its trailing space. Press Meta+Shift+m and wait for the New comment composer to receive focus. Click between `m` and `e` in `segments`. The new composer closes, but the existing discussion does not open.

Six reload-separated trials reproduced this failure, with native and model selection at [3,4] offset 18. Follow-up X typed at that point correctly in all six. open-six-trials.json retains all results. The original failure screenshot open-failure.png was inspected. Six ordinary repeated clicks with no expanded selection/composer transition opened normally. The initial variation clicking offset 5 instead also opened normally.

The pointerdown target is already detached when the diagnostic document listener observes it; mousedown targets the containing text element, and no click follows mouseup. The inactive-selection coordinator clears its decoration in document pointerdown capture (packages/plitejs/src/react/inactive-selection.ts:91), while CommentsPlugin activates only from click (packages/platejs/src/react/features/comments/CommentsPlugin.ts:18). This is the supported opening-failure chain; no fix was attempted.

### Outside-click caret: needs stable reproduction

An initial mixed timing trial clicking [3,4] offset 18 after opening the new composer produced a native selection on the first heading wrapper instead. initial-matrix.json preserves it. It was not captured with model selection and follow-up typing, so it is a lead rather than a completed reproduction. Six settled repeat trials had correct native/model caret and typing. An outside-click matrix from an existing Reply composer had eleven matching model outcomes; one comparison was invalidated by scrolling/stale coordinates and is not counted as a defect. Five further ordinary-text selection/composer cases had correct offsets before that script stopped on an ambiguous selector. The full-document-selection probe did not produce a completed result and cannot support a claim.

## September 21 source investigation and corrected claim

The user rejected treating the new-composer reproduction as their ordinary existing-comment bug. Both original reporter cases remain needs-repro. The latest request is to inspect code for causes, still without a fix. This pass inspected Comments activation, discussion state/anchor/dismissal, actual installed Radix 1.1.14/FocusScope 1.1.7/DismissableLayer 1.1.10, the Base adapter, editor pointer/focus routing, native selection import/export and relevant browser tests.

- Opening candidate: CommentsPlugin.ts:18-36 only opens through click and requires the final target to remain inside a data-comment-id element. inactive-selection.ts:91-111 clears the inactive decoration at document pointerdown capture. editable-text.tsx:483-540 reconstructs decoration wrappers/segment identities when the decoration topology changes; input-router.ts:1731 also rejects disconnected event targets. The earlier event trace supports this defect under the expanded-selection/new-composer precondition. It does not establish that this precondition existed during the reporter's ordinary click. Active-state-only changes have in-place decoration attribute reconciliation in editable-text-flow.tsx:849, so clearing activeIds alone is not proof of DOM replacement.
- Caret candidate: discussion.tsx:1282-1293 cancels the primitive's final-focus behavior and conditionally focuses the editor when activeElement is body/missing/still in the popover. Actual Radix FocusScope invokes this on an unmount timeout. Plite runtime-focus-mouse-events.ts:211-233 exports model selection immediately, in a microtask and in a timeout for programmatic focus. A failed native hit/import before that export can restore an earlier model selection. This remains conditional source reasoning, not a demonstrated race for the reporter.
- Important negative evidence: when an ordinary text click successfully focuses the main editor, Discussion's activeElement guard skips focus. Mouse down also marks nativePointerFocus, suppressing programmatic-focus selection export for ordinary native focus. The code does not support the blanket claim that every close steals the caret. Root interaction mouseup replay additionally checks interaction/document identity. No unconditional conflicting comment/suggestion click handler was found.
- Proof gap: comment.spec.ts:964-970 checks outside dismissal and cleared active attributes but no native/model caret position. Its :1975-1995 case clicks a separate static view and checks returned focus, not a text click's exact insertion position. Mocked click-handler and popover unit tests omit the relevant native event order.

No product code changed and no new browser or passing test claim is made in this source-only pass. Next diagnostic evidence, if pursued: capture whether the failed click is missing or has the wrong target; for the caret capture the clicked point, activeElement and model/native selection before and after finalFocus and queued selection exports. Do not merge the two reports into a shared-root-cause claim without that evidence.

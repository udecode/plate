# Text and block selection scrolling

Status: verified functional behavior; user approved a local commit; scroll performance remains under investigation
Playbook: bug-fix

## Brief

### What will change?

Ordinary text dragging uses the same scrolling speed as block selection. Five repeated browser runs pass. The user confirmed the effect and speed and approved one local commit. Scrolling smoothness is a separate open investigation.

### What could go wrong?

Native word and modifier clicks passed. Manual in-app browser inspection remains unverified because this turn could not initialize its controller. Personal Chrome was not used. Other engines and native OS window-exit behavior were not separately certified.

## Teach

Text selection marks characters, while block selection marks whole blocks. Both already have access to the same edge-scrolling calculation, but ordinary text dragging currently lets the browser choose its own speed.

The repair routes ordinary text drags into the existing text-selection loop. That loop uses the same edge distance and maximum step as block selection and updates the character range after scrolling. Double-clicks, modifier clicks and dragging an existing text selection keep their native handling.

## Scope

User request: "去把Text Selection也改成Block Selection这样的滚动吧，要一样的速度，然后总结你使用了什么，怎么改的".

The user approved one local commit of this functional patch on 2026-10-15. No push or PR is authorized. Do not open the user's Chrome. Preserve the unrelated generated registry changes present at intake. Use one dev server on port 3557 and one Playwright worker. The user additionally asked to watch memory and stop extra services.

## Steps

- [x] Capture the pre-edit corpus. `artifacts/text-selection-scroll-parity/baseline-browser-a1.log` has 14 passing cases and `artifacts/text-selection-scroll-parity/baseline-react-a1.log` has 9 passing root-controller tests.
- [x] Change the speed comparison to start on actual text. `artifacts/text-selection-scroll-parity/parity-red-a2.log` shows the old text drag remaining at zero in the edge band while block selection moves.
- [x] Reuse the text drag owner and shared scrolling calculation. `artifacts/text-selection-scroll-parity/final-corpus-a1.log` records 15 passing affected browser cases.
- [x] Run writing passes, scoped lint and final five-repeat proof. `artifacts/text-selection-scroll-parity/final-repeat-a2.log` records 30 passing cases without retries. `artifacts/text-selection-scroll-parity/lint-a3.log`, `artifacts/text-selection-scroll-parity/final-react-a2.log` and `artifacts/text-selection-scroll-parity/types-a2.log` pass. Screenshots were opened and inspected.
- [x] Stop owned services. `lsof -nP -iTCP:3557 -sTCP:LISTEN` returns no listener and `ps -p 93041` finds no owned dev server. No browser test runner from this task remains. No commit or push ran.
- [ ] Complete hand drive when the built-in browser controller is available. owner: this chat's assistant; stop: a resumed run can drive /blocks/playground without using personal Chrome. Tracked in Open work below.

## Verification

Use the full /blocks/playground fixture. Compare each frame's scroll step at the same distance from the edge, starting inside text for Text Selection and in the margin for Block Selection. Check the center, edge ramp and outside plateau. Check both directions, a stationary pointer, a single move outside, reversal outside, release and subsequent typing. Keep model and DOM selection aligned.

The existing shared speed law is a 48px edge band, capped at half the visible height, and a maximum 28px step per animation frame. This is behavior parity, not a throughput benchmark or a fixed pixels-per-second guarantee.

## Main changes

- `root-interaction-controller.ts` sends ordinary unmodified left-button text gestures to its existing model-selection path. It cancels native mousedown selection for that path so browser autoscroll cannot add another speed.
- Document mousemove tracking starts at mousedown. Only events outside the root use that listener; the existing React handler keeps inside moves. Release outside clears the original pending interaction.
- `pauseDragAutoScroll` cancels a scheduled frame while retaining the gesture. `stopDragAutoScroll` also removes listeners. A sub-threshold move, the center band and an interactive target pause rather than destroy outside tracking.
- A scroll frame without a resolvable text range keeps scrolling while leaving the range unchanged. Release, blur, pointer cancellation, a new gesture, read-only changes and unmount clean up tracking.
- The tests compare real text glyph starts, small movement before a single outside jump, both directions, outside reversal, center pause, release and subsequent typing. Native double-click and Shift-click coverage remains separate.

## Completion Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Same speed and held-pointer behavior | Pass, five warm repeats without retries | final-repeat-a2.log, 30 passed |
| Affected browser corpus | Pass | final-corpus-a1.log, 15 passed |
| Package and static checks | Pass | final-react-a2.log, 9 passed; types-a2.log; lint-a3.log |
| Hand drive | Unverified | hand-drive-status-a2.log |
| Resource cleanup | Pass | port 3557 released; PID 93041 exited |

## Demo

1. In a source-backed dev instance, open /blocks/playground. Drag from actual text past either vertical edge and hold. It scrolls at the same step as a block drag. Return to the center or release to stop.

   ![text selection downward](artifacts/text-selection-scroll-parity/text-down.png)
   ![text selection upward](artifacts/text-selection-scroll-parity/text-up.png)

## Close

The product patch and automated checks are complete. The user authorized one local commit of this functional change, without a push. No public API or new dependency was introduced. Two read-only design candidates compared extending the existing mouse gesture with a pointer-event migration; both preferred the former. Direct review found the small-movement listener loss, which failed first and then passed after pause was separated from stop. No panel or full multi-engine release claim is made.

One repeat was interrupted after page.goto timed out waiting for load before a gesture began. The test now waits for DOMContentLoaded, a visible editor, its installed browser handle and target text. No timeout was raised and no product change was made for that host-readiness failure. The final five-repeat command passed in full.

Resource checks ran during work. Tests used one worker and heavy checks ran serially after the user's resource reminder. The final typecheck heap was capped at 2 GiB. Owned review agents and the dev server were stopped. Unrelated generated registry changes present at intake remain untouched.

## Open work

- Hand drive of the final patch remains unverified. owner: this chat's assistant; stop: the built-in browser controller is available on a resumed run and the playground hand drive passes. Personal Chrome remains forbidden. The current handoff claims automated Chromium proof and inspected automated screenshots only.

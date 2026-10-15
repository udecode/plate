# Block selection outside scrolling

Status: executed
Playbook: figure-it-out

## Brief

### What will change?

Dragging a block selection above or below the page keeps scrolling while the mouse stays held. The user confirmed that the real Chrome gesture also continues outside the macOS window.

### What could go wrong?

Text selection and block dragging share the scrolling code. Their existing checks cover nearby behavior. The speed limit and horizontal boundaries stay unchanged. Exact Notion speed parity and other browser engines are outside this proof.

## Teach

Block selection follows a held mouse pointer and selects the blocks crossed by its rectangle. Each animation frame can scroll and then update the selected blocks.

The scrolling code increases speed near the visible edge and keeps its maximum step above or below that edge. The existing loop continues until release, cancellation or the end of the scrollable content.

## Scope

The user supplied two local videos and requested Notion-like scrolling outside the page. Frame inspection identifies cf43 as Plate at /blocks/playground and a123 as Notion desktop. Gemini transcription could not run because no API key was available. Local AVFoundation decoded both recordings.

The implementation changes one private scrolling function and extends the existing browser journey. Existing DOM tests remain unchanged. The DOM API prose and its unreleased changeset describe the behavior. No API signature or gesture lifecycle changes were needed. Rigor is a failing regression followed by source tests, affected browser checks, five warm repeats without retries, and a hand drive.

## Main changes

- Keep the existing pointer capture, frame loop and selection geometry owner.
- Remove only the vertical distance cutoff in `packages/plitejs/src/dom/plugin/dom-drag-scroll.ts`.
- Keep horizontal scroll ownership and the existing maximum step of 28 pixels per call. This is not a claim of exact Notion velocity or fixed pixels per second.

## Steps

- [x] A. Frame. Pre-edit behavior and affected corpus captured in `artifacts/block-selection-outside-scroll/baseline-browser-a1.log` and `artifacts/block-selection-outside-scroll/baseline-dom-a2.log`.
- [x] B. Design the workflow. Read `dom-editor.ts`, `root-interaction-controller.ts`, `clipboard-input-strategy.ts` and `NodeSelection.tsx`; the design row in `2026-10-15-block-selection-outside-scroll.decisions.tsv` records their shared owner.
- [x] C. Run the loop. The outside checks failed in `artifacts/block-selection-outside-scroll/outside-red-a1.log` and passed after the repair in `artifacts/block-selection-outside-scroll/outside-green-a2.log`.
- [x] D. Keep the audit trail. Decisions and proof limits are in `2026-10-15-block-selection-outside-scroll.decisions.tsv`.
- [x] E. Verify and hand back. Writing passes and focused lint completed. `artifacts/block-selection-outside-scroll/final-browser-a1.log` records 70 passed with five repeats and zero retries. `artifacts/block-selection-outside-scroll/hand-drive-a1.log` records the desktop drive. The user confirmed the native window-exit gesture.

## Demo

1. Open http://localhost:3547/blocks/playground. Drag from the blank margin beside AI-Powered Editing below the viewport and keep holding. Blocks entering view join the selection. Release to stop.

   ![before](artifacts/block-selection-outside-scroll/before-down.png)
   ![after](artifacts/block-selection-outside-scroll/after-down.png)

2. Scroll to Dates and Equations. Drag from its blank margin above the viewport and keep holding. The page scrolls toward its beginning while the selection grows.

   ![before](artifacts/block-selection-outside-scroll/before-up.png)
   ![after](artifacts/block-selection-outside-scroll/after-up.png)

## Verification

- Chromium passed all 14 affected cases five times without retries, 70/70, in `artifacts/block-selection-outside-scroll/final-browser-a1.log`. The exact two outside cases failed before the code change.
- All 14 DOM tests, the DOM partition typecheck and task lint passed in `artifacts/block-selection-outside-scroll/final-dom-a1.log`, `artifacts/block-selection-outside-scroll/typecheck-a1.log` and `artifacts/block-selection-outside-scroll/lint-a1.log`.
- Desktop hand drive passed. The user separately confirmed native Chrome outside-window scrolling. Before and after screenshots were opened and inspected.

Setup is the complete playground fixture, desktop Chromium, editing mode. Start in the blank block-selection margin. Hold the mouse above or below the viewport by more than 48 pixels. Keep it stationary. Scroll position and selected block extent must keep moving in the intended direction with a stable anchor and no native text highlight. Return inside, reverse direction, then release. Scrolling and marquee must stop, and subsequent editing must work.

Existing near-edge speed, nested scroller, clipping, text selection and handle drag checks remain the affected corpus. The shared owner is also checked through its public DOM API. Tests do not imply Safari, mobile or exact Notion speed parity.

The in-app hand drive showed block highlights after release, no marquee or native text selection, and editor focus. Its driver refused an outside-viewport endpoint. On 2026-10-15 the user repeated the actual Chrome window-exit gesture and replied, "可以，实测已持续滚动". This is reporter confirmation, separate from automated viewport proof.

## Gate scope

- The change stays inside a private function body. No signature, architecture or PR-opening trigger requires an architect or panel run.
- The lead applied deslop and unslop. The read-only no-comments reviewer found no added comments or suppressions. No instruction edit, workflow correction or autonomous playbook triggers reflect or a separate trail-review seat.
- The two code files passed `pnpm lint:task`. The DOM partition typecheck and all 14 existing DOM cases passed. The hand-drive check passed for desktop playground.
- Registry generation stays in CI on this branch. The prose edit preserves MDX structure, code and links. The existing plite-drag-visible-scroll changeset is not among the shipped entries in `.changeset/pre.json` and was extended rather than duplicated.
- Scope is this scrolling fix. The repository-wide check, other browser engines, release publication and a new PR were not requested or run.

## Close

All five workflow phases are complete. The two removed cutoffs let block selection continue above or below the visible scroll area, including when the pointer stays still. The browser proof also checks selection growth, a stable anchor, reversal, release and subsequent typing. Existing text selection, nested scrolling and block-drop checks remain green.

The first post-fix run failed only because its follow-up assertion still searched for the original heading name after typing. The assertion uses the existing stable node key and the same scroll fix passed the rerun and final five-repeat corpus. The first DOM command could not find bare Bun on PATH, so the successful runs use the installed binary through pnpm.

The exact native window hold is reporter-confirmed, not agent-observed. No open product issue remains in the requested vertical-exit scope. The horizontal bounds and maximum step remain unchanged. The task leaves other untracked plans untouched.

# Editor Property / Fuzzing Oracles

Question:
Which external editor testing patterns should Slate v2 steal after generated
editing stress is already green?

Scope:
- Source-backed testing/oracle patterns only.
- Repos sampled: ProseMirror view/model/state/transform, CodeMirror view,
  Lexical playground/core, plus current Slate v2 stress/proof helpers.
- Web search is used only as discovery and source registry context; runtime or
  test claims come from local source reads.

Current Verdict:
Slate already owns replayable browser scenario steps, native/model/DOM
selection assertions, generated editing stress, and stress replay artifacts.
The new portable lead was narrower: add a direct DOM-mutation import stress
family that mutates browser DOM like real contenteditable engines do, then
asserts Slate model text, DOM/native selection, follow-up typing, and replay
metadata. CodeMirror and ProseMirror both test this class directly. Slate has
unit-level DOM repair/input-router rows, and this packet adds the matching
route-level generated DOM mutation import family.

Stop Rule:
Stop this packet after one concrete promotion target is named with owner,
proof kind, and verification command, or after all sampled leads are rejected as
duplicates.

Promoted Lead:
- `dom-diff-import:direct-dom-mutation-browser-oracle`
- owner: `slate-browser` / `slate-patch`
- proof kind: generated Playwright stress family
- verification commands:
  `bun --filter slate-browser test:core`
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/stress/generated-editing.test.ts --project=chromium --grep "dom-mutation-import"`
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/stress/generated-editing.test.ts --project=firefox --project=webkit --grep "dom-mutation-import"`

Local Proof Gap Closed:
Current `playwright/stress/generated-editing.test.ts` is strong for replayable
user actions: keyboard, paste, undo, IME, selection, tables, voids, and
huge-document cut. It now also models browser-mutated contenteditable text DOM,
native text repair import, native/model selection agreement, follow-up typing,
history batching, and replay metadata.

Rejected / Duplicate Summary:
- Lexical-style test recorder is mostly already covered by Slate's
  `createScenarioReplay`, stress artifacts, replay command, and selection
  assertions.
- Lexical Safari IME delete-after-composition is kept-existing. Slate has exact
  WebKit rows for Cmd+A Backspace and Shift+ArrowUp Backspace after
  compositionend in `playwright/integration/examples/richtext.test.ts`.
- ProseMirror test-builder is useful fixture ergonomics, not a new browser
  oracle by itself.

Result:
Packet P117 kept the lead by promoting `mutateTextDOM` into `slate-browser`
scenario playback and adding the generated `richtext dom-mutation-import`
stress row.

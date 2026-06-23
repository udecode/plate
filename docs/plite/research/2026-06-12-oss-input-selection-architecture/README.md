# OSS Input And Selection Architecture Research

Question: what portable input, selection, and composition architecture lessons
from mature editors should Plite promote into tests, benchmark proof, or
architecture notes after the huge-document behavior/perf work?

Scope:
- source-inspected input/selection architecture in local editor repositories;
- composition, native selection, DOM mutation, and visual selection invariants;
- only promote into Plite when the lead maps to a current Plite-native proof
  gap.

Exclusions:
- no runtime patch copied from editor internals;
- no raw mobile claim;
- no external issue ledger work;
- no broad pagination or virtualization architecture.

Current verdict:
- CodeMirror has the strongest transferable source signal in this shard:
  composition is tracked as a lifecycle with pending-key and pending-change
  windows, and its tests explicitly cover model changes that overlap, move, or
  avoid active composition.
- Plite already has broad IME coverage: formatted text, empty blocks,
  select-all replacement, active marks, multiple formatted leaves, rapid
  consecutive compositions, cross-paragraph replacement, WebKit compositionend,
  hidden DOM boundaries, and async decoration refresh.
- The missing exact invariants were model changes during active native IME
  composition. Promoted into
  `playwright/integration/examples/richtext.test.ts`.

Kept promotion:
- `richtext-native-ime-model-change-before-composition`: Chromium native IME
  composition starts, a model operation inserts text before it, composition
  commits at the adjusted caret, and model selection remains correct.
- `richtext-native-ime-model-delete-at-composition-point`: Chromium native IME
  composition starts, a model `remove_text` operation deletes text starting at
  the composition point, composition commits at that point, and model selection
  remains correct.

Focused proof:

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "(preserves native IME composition when model text changes before it|keeps native IME composition coherent when model delete starts at composition point)"
```

Result: 2 passed.

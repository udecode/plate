---
date: 2026-04-25
topic: slate-v2-editing-epoch-legacy-timing-recovery-audit
status: active
source_repos:
  - /Users/zbeyens/git/slate
  - /Users/zbeyens/git/slate-v2
---

# Slate v2 Editing Epoch Legacy Timing Recovery Audit

## Verdict

Recover the legacy timing discipline, not the legacy `Editable` monolith.

The legacy file is valuable because event ordering and browser caveats lived in
one coherent control flow. Slate v2 keeps that knowledge, but assigns it to
explicit owners:

```txt
input-router
  -> EditableEditingEpochKernel
  -> selection-controller
  -> mutation-controller
  -> dom-repair-queue
  -> slate-browser generated proof
```

No legacy public state, `Transforms.*` teaching path, or browser-native
structural editing comes back.

## Recovery Matrix

| Legacy timing rule | Legacy location | V2 owner | Status | Evidence |
| --- | --- | --- | --- | --- |
| Attach native `beforeinput`, not React's polyfilled event. | `../slate/packages/slate-react/src/components/editable.tsx` native listener comment around React issue 11211 | `packages/slate-react/src/editable/input-router.ts` and `components/editable.tsx` | Recovered | Native `beforeinput` and `input` listeners are attached directly; richtext generated destructive rows pass cross-browser. |
| Flush queued `selectionchange` before `beforeinput` because IMEs/extensions may set selection immediately before input. | legacy `scheduleOnDOMSelectionChange.flush()` / `onDOMSelectionChange.flush()` before target sync | `components/editable.tsx` beforeinput path | Recovered | Current beforeinput still flushes both queues before resolving native/model ownership. |
| Do not import target ranges for ordinary delete before delete commands decide the deletion range. | legacy delete-target-range comment | `selection-reconciler`, `model-input-strategy`, `editing-epoch-kernel` | Recovered and strengthened | Destructive keydown is model-owned; duplicate beforeinput is skipped inside the epoch; generated destructive gauntlet covers delete after paste and repeated word-delete. |
| Expanded selection plus delete should delete the expanded selection even when the input type looks directional. | legacy expanded delete branch | `getEditableCommandFromBeforeInputType`, `mutation-controller` | Recovered | Backspace/Delete selected-range rows pass cross-browser in richtext proof. |
| Word delete uses editor model commands, not browser DOM mutation as final truth. | legacy `deleteWordBackward` / `deleteWordForward` branches | `keyboard-input-strategy`, `model-input-strategy`, `editing-epoch-kernel` | Recovered and hardened | Persistent native word-delete row, generated destructive gauntlet, and persistent soak are green. |
| Native single-character insert is allowed only for narrow safe text cases. | legacy `native` insertText branch with marks/node-map/link/pre exclusions | `native-input-strategy`, `model-input-strategy`, direct DOM text sync capability | Recovered with narrower capability boundary | Native text remains capability-based; model-owned repair takes over when DOM/model text diverge. |
| Safari composition end can arrive after `beforeinput insertFromComposition`; clear composition before commit. | legacy Safari composition comment | `composition-state.ts` | Recovered | `commitInsertFromComposition` keeps the Safari ordering comment and behavior. |
| Chrome composition `beforeinput` can be wrong; use compositionend fallback. | legacy Chrome composition fallback | `composition-state.ts` | Recovered | `commitChromeCompositionEndFallback` owns the rule and writes inside `editor.update`. |
| Android beforeinput is not cancelable; Android gets its own manager. | legacy Android beforeinput branch | `android-input-manager` | Recovered, scoped | Android manager owns noncancelable beforeinput, pending selection, and mobile paste-like insertText comments; raw mobile device proof remains a separate claim. |
| Selectionchange must ignore internal repair/programmatic selection updates. | legacy `state.isUpdatingSelection` guard | `selection-controller`, `editing-epoch-kernel` | Recovered and strengthened | Repair-induced/programmatic selectionchange stays model-owned and closes the destructive epoch. |
| Chrome can fire selectionchange when inputs/textareas are appended. | legacy INPUT/TEXTAREA filter | `selection-controller` model-selection preference and browser generated proof | Rejected as a literal filter, replaced by ownership gating | The v2 filter is provenance-based rather than tag-based. It refuses repair-induced imports and imports only native-user DOM selection that belongs to the editor. Current generated/internal-control rows cover the real risk. |
| Firefox nested editable focus must be prevented for keyboard navigation. | legacy Firefox focus branch | `input-router`, `selection-controller`, focus owner assertions | Recovered by owner split | Internal-control rows and focus-owner assertions cover focus leakage without centralizing all focus code in `Editable`. |
| Paste without formatting and Safari paste may not produce useful beforeinput data. | legacy React `onPaste` fallback comments | `clipboard-input-strategy`, `mutation-controller` | Recovered and fixed | Plain text paste row is green; DataTransfer insert now enters `editor.update`; generated destructive paste gauntlet and release proof are green. |
| Drag/drop needs global dragend/drop cleanup because Firefox may unmount the dragged element. | legacy global drag lifecycle comment | `input-router`, `clipboard-input-strategy` | Recovered | Global drag listeners remain split from `Editable`; drop command stays model-owned. |
| Selection export must tolerate bridge failures during commits. | legacy defensive selection sync comments | `selection-controller`, `dom-repair-queue` | Recovered | `syncEditableDOMSelectionToEditor` catches transient DOM bridge failures and leaves browser selection unchanged. |

## Rejections

- Do not restore legacy `editor.selection` as public truth. V2 uses live reads,
  transaction target resolution, and selection provenance.
- Do not restore `Transforms.*` as the public editing story. Primitive editor
  methods inside `editor.update` are the runtime contract.
- Do not restore the monolithic `Editable`. The timing rules are assigned to
  explicit owners and enforced by generated browser proof.
- Do not trust browser-native structural delete as final truth. Native delete
  remains model-owned.

## Scoped Defers

- Raw Android/iOS keyboard, clipboard, and IME proof remains outside this local
  environment. Playwright mobile viewport and semantic handles do not satisfy
  raw-device claims.
- Full composition stress on real mobile keyboards remains device-lab work.
- Browser engine proof is strong for the current richtext destructive/paste
  generated rows, but full `test:integration-local` remains the closure sweep,
  not an inner-loop command.

## Required Gates

Current legacy timing recovery is accepted only with these gates:

```bash
bun test ./packages/slate-react/test/editing-epoch-kernel-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run --cwd packages/slate-browser test:core --bail 1
bun --filter slate-browser test:proof
SLATE_BROWSER_SOAK_BASE_URL=http://localhost:3100 SLATE_BROWSER_SOAK_ITERATIONS=5 bun ./scripts/proof/persistent-browser-soak.mjs
PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated destructive paste|generated mixed editing conformance|persistent native word-delete" --workers=4 --retries=0
bun test:release-proof
```


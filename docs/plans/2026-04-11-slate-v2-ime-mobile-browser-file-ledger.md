---
date: 2026-04-11
topic: slate-v2-ime-mobile-browser-file-ledger
status: in_progress
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
  - /Users/zbeyens/git/plate-2
---

# Slate v2 IME / Mobile / Browser File Ledger

> Historical batch/review note.
> Live browser/input scenario-proof truth now lives in
> [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md).
> Live legacy-file closure truth now lives in
> [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md).
> Keep this file for archaeology and batch history, not as the active proof
> authority.

## Purpose

Historical batch/review record for the reopened IME/mobile/browser RC lane.

Use the same blunt rule as the other ledgers:

- `[x]` reviewed
- `[ ]` still needs deep review

Do not use this file as passive archaeology.
Every behavior-bearing legacy file must map to one or more scenario rows.

## Ground Rules

- missing proof on a behavior-bearing row blocks by default
- only engine-internal helpers with no user-visible browser/input behavior may
  be omitted
- older “better-cut” language in release docs does not close this lane by
  itself

## Bootstrap Seed

Pinned `slate-v2` diff command result:

```sh
git -C /Users/zbeyens/git/slate-v2 diff --name-status --diff-filter=ACDMRTUXB origin/main...HEAD -- \
  packages/slate-react \
  packages/slate-dom \
  packages/slate-browser \
  playwright/integration/examples \
  site/examples/ts
```

Current result:

- `EMPTY`

Read:

- there are no still-unreviewed browser/input rows hiding in the current
  `origin/main...HEAD` diff for those target directories
- the seed therefore comes from the live proof lanes plus the legacy
  behavior-bearing patch files themselves

## Dual-Axis Behavior / Parity Ledger

| Review | Scenario | Legacy file(s) | Current owner / equivalent | Proof lane | Browser scope | Expected outcome | Actual outcome | Artifact links | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [x] | placeholder IME | `packages/slate-react/src/components/editable.tsx`, `packages/slate-react/src/components/string.tsx` | `Editable`, `EditableText`, placeholder example | `placeholder-ime.test.ts`, `firefox-direct-ime.test.ts`, `webkit-direct-ime-ceiling.test.ts`, `ime-proxy.test.ts`, `proof:agent-browser:ios:placeholder-input:local`, `proof:appium:ios:placeholder-input:local`, `proof:appium:android:placeholder-input:local` | `automated-direct: chromium + firefox + Android Chrome emulator`, `automated-proxy: webkit-desktop`, plus `setup-green / behavior-red: iOS Simulator Safari` | empty placeholder composition behaves safely enough to support the strong RC claim | Chromium direct proof is green on the FEFF-backed placeholder path, Firefox now has a stronger direct composition lane via Playwright `keyboard.insertText`, desktop WebKit has an explicit direct-input ceiling probe showing that `insertText` commits cleanly but does not expose composition-specific input events there, Android direct typing proof is green, and direct Appium iOS Safari setup is green. Current iOS behavior proof remains red through Appium/XCUITest `value` (`blockTexts: ""`, repeated `input:undefined:[null]`, `slateSelection: 0.0:0|0.0:0`), and native-context coordinate tapping still fails to surface an iPhone keyboard. The current `agent-browser` iOS provider is also not trustworthy on these routes because it often exposes only the Next shell without the editor node | [placeholder-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/placeholder-ime.test.ts), [firefox-direct-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/firefox-direct-ime.test.ts), [webkit-direct-ime-ceiling.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/webkit-direct-ime-ceiling.test.ts), [ime-proxy.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/ime-proxy.test.ts), [2026-04-03-jsdom-contenteditable-composition-is-not-a-trustworthy-ime-proof.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-jsdom-contenteditable-composition-is-not-a-trustworthy-ime-proof.md), [2026-04-12-appium-ios-safari-loads-local-slate-routes-but-xcuitest-value-does-not-drive-contenteditable.md](/Users/zbeyens/git/plate-2/docs/solutions/integration-issues/2026-04-12-appium-ios-safari-loads-local-slate-routes-but-xcuitest-value-does-not-drive-contenteditable.md), [package.json](/Users/zbeyens/git/slate-v2/package.json) | `playwright + site/examples + browser-mobile transports` | `open` |
| [x] | no-FEFF placeholder IME | `packages/slate-react/src/components/editable.tsx`, `packages/slate-react/src/components/string.tsx` | `Editable`, `EditableText`, `placeholder-no-feff` example | `placeholder-ime.test.ts`, `firefox-direct-ime.test.ts`, `ime-proxy.test.ts`, `proof:agent-browser:ios:placeholder-no-feff-input:local`, `proof:appium:ios:placeholder-no-feff-input:local`, `proof:appium:android:placeholder-no-feff-input:local` | `automated-direct: chromium + firefox + Android Chrome emulator`, `automated-proxy: webkit-desktop`, plus `setup-green / behavior-red: iOS Simulator Safari` | no-FEFF empty placeholder path composes like the relied-on legacy path or is explicitly justified as a changed contract | Chromium composition proof is green on the line-break no-FEFF path, Chromium delayed per-key typing is now also green, Firefox has direct composition proof on the same surface via Playwright `keyboard.insertText`, desktop WebKit keeps the proxy lane, and Android direct no-FEFF typing proof is green. Direct Appium iOS Safari setup is green on the route, but typing remains red with the same XCUITest `value` no-op shape as FEFF (`blockTexts: ""`, repeated `input:undefined:[null]`, `slateSelection: 0.0:0|0.0:0`). The current `agent-browser` iOS provider is route-shell-broken here, so it should not be treated as behavior evidence | [placeholder-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/placeholder-ime.test.ts), [firefox-direct-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/firefox-direct-ime.test.ts), [ime-proxy.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/ime-proxy.test.ts), [2026-04-12-appium-ios-safari-loads-local-slate-routes-but-xcuitest-value-does-not-drive-contenteditable.md](/Users/zbeyens/git/plate-2/docs/solutions/integration-issues/2026-04-12-appium-ios-safari-loads-local-slate-routes-but-xcuitest-value-does-not-drive-contenteditable.md), [package.json](/Users/zbeyens/git/slate-v2/package.json) | `playwright + site/examples + browser-mobile transports` | `open` |
| [x] | inline-edge IME | `packages/slate-react/src/components/editable.tsx`, `packages/slate-react/src/components/string.tsx` | `Editable`, `EditableText`, inline-edge example | `inline-edge-ime.test.ts`, `firefox-direct-ime.test.ts`, `webkit-direct-ime-ceiling.test.ts`, `ime-proxy.test.ts`, `proof:agent-browser:ios:inline-edge-input:local`, `proof:appium:android:inline-edge-input:local` | `automated-direct: chromium + firefox + iOS Simulator Safari + Android Chrome emulator`, `automated-proxy: webkit-desktop`, plus `direct-input ceiling: webkit-desktop` | inline-edge composition lands on the intended text leaf with legacy-equivalent behavior | Chromium direct proof is green after semantic selection setup, Firefox now has a stronger direct composition lane via Playwright `keyboard.insertText`, desktop WebKit has an explicit direct-input ceiling probe showing that `insertText` commits cleanly but stays below composition-specific proof, and the packaged iOS Simulator/Appium edge-input lanes are green once the runner collapses DOM selection onto the leading zero-width text leaf before typing | [inline-edge-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/inline-edge-ime.test.ts), [firefox-direct-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/firefox-direct-ime.test.ts), [webkit-direct-ime-ceiling.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/webkit-direct-ime-ceiling.test.ts), [ime-proxy.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/ime-proxy.test.ts), [2026-04-04-inline-edge-ime-proofs-should-set-selection-semantically-before-composition.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-inline-edge-ime-proofs-should-set-selection-semantically-before-composition.md), [package.json](/Users/zbeyens/git/slate-v2/package.json) | `playwright + site/examples + browser-mobile transports` | `open` |
| [x] | void-edge IME | `packages/slate-react/src/components/editable.tsx`, `packages/slate-react/src/components/string.tsx` | `Editable`, `EditableText`, void-edge example | `void-edge-ime.test.ts`, `firefox-direct-ime.test.ts`, `webkit-direct-ime-ceiling.test.ts`, `ime-proxy.test.ts`, `proof:agent-browser:ios:void-edge-input:local`, `proof:appium:android:void-edge-input:local` | `automated-direct: chromium + firefox + iOS Simulator Safari + Android Chrome emulator`, `automated-proxy: webkit-desktop`, plus `direct-input ceiling: webkit-desktop` | void-like IME behavior matches the relied-on spacer semantics | Chromium direct proof is green on the real spacer structure, Firefox now has a stronger direct composition lane via Playwright `keyboard.insertText`, desktop WebKit keeps an explicit direct-input ceiling probe instead of fake direct composition proof, and the packaged iOS Simulator/Appium edge-input lanes are green with the same zero-width selection-collapse primitive used before typing | [void-edge-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/void-edge-ime.test.ts), [firefox-direct-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/firefox-direct-ime.test.ts), [webkit-direct-ime-ceiling.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/webkit-direct-ime-ceiling.test.ts), [ime-proxy.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/ime-proxy.test.ts), [2026-04-04-void-like-zero-width-ime-proofs-need-the-real-void-spacer-structure.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-void-like-zero-width-ime-proofs-need-the-real-void-spacer-structure.md), [package.json](/Users/zbeyens/git/slate-v2/package.json) | `playwright + site/examples + browser-mobile transports` | `open` |
| [x] | blur/focus selection recovery | `packages/slate-react/src/components/editable.tsx`, `packages/slate-react/test/react-editor.spec.tsx` | `Editable`, `ReactEditor`, `rich-inline` reset/refocus flow | `surface-contract.tsx`, `rich-inline.test.ts`, `test:slate-browser:desktop-parity:local` | `headless + automated-direct: chromium, firefox, webkit-desktop` | focus restore behaves at least as safely as legacy across the required browser matrix | current focus init and mid-transform safety are green in headless proof, and the rich-inline blur/focus reset row is now green on Chromium, Firefox, and desktop WebKit; real iOS Safari remains unproved | [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx), [rich-inline.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/rich-inline.test.ts), [package.json](/Users/zbeyens/git/slate-v2/package.json) | `packages/slate-react + playwright` | `open` |
| [x] | transient DOM-point gap / mutation-repair / fail-closed focus restore | `packages/slate-react/src/components/restore-dom/restore-dom.tsx`, `packages/slate-react/src/components/restore-dom/restore-dom-manager.ts`, `packages/slate-react/src/components/editable.tsx` | mounted `Editable`, `ReactEditor`, `DOMBridge` | `surface-contract.tsx`, main IME/browser rows, structural split/join row | `headless`, `automated-direct: chromium, firefox, android emulator`, plus `automated-proxy: webkit-desktop` | transient DOM bridge gaps fail closed without hidden runtime errors and without regressing user-visible behavior | current focus-time transient DOM-point failure is covered and fails closed; main IME rows are green without `restore-dom`; structural Enter/Backspace churn is now green on Chromium and Android through editor-owned keydown paths; the deleted restore-dom family is now treated as a rerender-era guard that is no longer a standalone current blocker | [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx), [2026-04-09-slate-react-focus-restore-must-fail-closed-on-transient-dom-point-gaps.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-09-slate-react-focus-restore-must-fail-closed-on-transient-dom-point-gaps.md), [2026-04-12-restore-dom-was-a-rerender-era-guard-not-a-current-v2-runtime-need.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-12-restore-dom-was-a-rerender-era-guard-not-a-current-v2-runtime-need.md), [2026-04-12-structured-enter-and-backspace-need-editor-owned-keydown-paths.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-12-structured-enter-and-backspace-need-editor-owned-keydown-paths.md) | `packages/slate-react + packages/slate-dom` | `closed` |
| [x] | zero-width selection normalization | `packages/slate-react/src/components/string.tsx`, `packages/slate-react/src/components/editable.tsx` | `DOMBridge`, `slate-browser` selection helpers, zero-width matrix example | `zero-width-matrix.test.ts`, `bridge.ts` tests, `test:slate-browser:desktop-parity:local` | `automated-direct: chromium, firefox, webkit-desktop` plus headless bridge proof | DOM/Slate round-trip around zero-width leaves stays normalized instead of leaking sentinel offsets | current bridge proof is green, and the zero-width matrix row is now green on Chromium, Firefox, and desktop WebKit; real iOS Safari remains unproved | [zero-width-matrix.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/zero-width-matrix.test.ts), [2026-04-03-zero-width-dom-selection-bridges-must-normalize-both-directions.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-zero-width-dom-selection-bridges-must-normalize-both-directions.md), [2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md), [package.json](/Users/zbeyens/git/slate-v2/package.json) | `packages/slate-dom + slate-browser` | `open` |
| [x] | post-composition undo / redo | `packages/slate-react/src/components/editable.tsx` | `withHistory(createEditor())`, browser/history proof stack, IME proof surfaces | `placeholder-ime.test.ts`, `inline-edge-ime.test.ts`, `void-edge-ime.test.ts`, `test:slate-browser:ime:local` | `automated-direct: chromium` | undo and redo immediately after composition are directly proved on the placeholder/inline-edge/void-edge rows | dedicated IME history proof now exists on the FEFF placeholder path, no-FEFF placeholder path, inline-edge path, and void-edge path in Chromium; broader platform/browser IME parity is still blocked elsewhere | [placeholder-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/placeholder-ime.test.ts), [inline-edge-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/inline-edge-ime.test.ts), [void-edge-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/void-edge-ime.test.ts), [package.json](/Users/zbeyens/git/slate-v2/package.json) | `packages/slate-history + playwright` | `open` |
| [x] | Android composition / diff / flush | `packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`, `packages/slate-react/src/hooks/android-input-manager/use-android-input-manager.ts`, `packages/slate-react/src/components/editable.tsx` | missing direct equivalent; current owner hypothesis is mounted `Editable` plus browser proof lanes | `android-tests.test.ts`, `test:slate-browser:android-proxy:local`, `proof:appium:android:local`, `proof:appium:android:placeholder-input:local`, `proof:appium:android:inline-edge-input:local`, `proof:appium:android:void-edge-input:local`, `proof:appium:android:split-join:local`, `proof:appium:android:empty-rebuild:local`, `proof:appium:android:remove-range:local`, `android-split-join.test.ts`, `android-empty-rebuild.test.ts`, `android-remove-range.test.ts`, `android-special-structural.test.ts` | `automated-proxy: mobile Chromium`, `automated-direct: Android Chrome emulator IME rows plus split/join, empty/delete-rebuild, remove-range, and special structural rows`, plus `remaining-android-specific: autocorrect / glide / voice` | Android-specific composition/diff/flush behavior is directly proved or explicitly justified as engine-internal | the Android hub exists, the mobile Playwright proxy lane is green on placeholder/inline-edge/void-edge plus IME undo/redo, Appium now has direct green packaged rows for placeholder, inline-edge, void-edge, split/join, empty/delete-rebuild, and remove-range on Android Chrome emulator, and the matching Chromium rows for split/join, empty, remove, and the structural `special` subcases are also green. The remaining Android-specific open slice is now the keyboard-feature lane only. Direct local probes can show `keyboardShown: true` and switch to `NATIVE_APP`, but expose zero Gboard candidate nodes, and hardware keycodes only yield literal `cant ` insertion, so autocorrect / glide / voice are explicitly tooling-blocked on the current local stack | [android-tests.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/android-tests.test.ts), [android-split-join.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/android-split-join.test.ts), [android-empty-rebuild.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/android-empty-rebuild.test.ts), [android-remove-range.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/android-remove-range.test.ts), [android-special-structural.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/android-special-structural.test.ts), [package.json](/Users/zbeyens/git/slate-v2/package.json), [2026-04-11-appium-android-setup-proof.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-appium-android-setup-proof.md), [2026-04-12-structured-enter-and-backspace-need-editor-owned-keydown-paths.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-12-structured-enter-and-backspace-need-editor-owned-keydown-paths.md), [2026-04-12-structural-break-proof-rows-need-selection-sync-before-follow-up-typing.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-12-structural-break-proof-rows-need-selection-sync-before-follow-up-typing.md), [2026-04-12-appium-android-chrome-can-show-keyboard-state-without-exposing-gboard-candidates.md](/Users/zbeyens/git/plate-2/docs/solutions/integration-issues/2026-04-12-appium-android-chrome-can-show-keyboard-state-without-exposing-gboard-candidates.md), [packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts](/Users/zbeyens/git/slate/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts) | `platform parity lane` | `tooling-blocked / external` |
| [x] | iOS Safari / WebKit composition / focus | `packages/slate-react/src/components/editable.tsx` | `Editable`, `ReactEditor`, `DOMBridge` | desktop parity lane, explicit WebKit direct-input ceiling lane, composition proxy lane, `proof:agent-browser:ios:local`, `proof:agent-browser:ios:placeholder-input:local`, `proof:agent-browser:ios:inline-edge-input:local`, `proof:agent-browser:ios:void-edge-input:local`, plus missing real-device lane | `automated-direct: webkit-desktop` for focus/selection, `direct-input ceiling: webkit-desktop`, `automated-proxy: webkit-desktop` for composition, `automated-direct: mixed iOS Simulator Safari rows`, `tooling-blocked: broader iOS Safari composition/focus` | iOS Safari / WebKit composition and focus behavior is directly proved or explicitly justified as non-behavioral | desktop WebKit has direct proof for zero-width normalization and blur/focus recovery, an explicit direct-input ceiling probe showing that Playwright `insertText` does not expose composition-specific input events there, and a green browser-level proxy composition lane on the IME surfaces. On iOS Simulator Safari, direct Appium route/setup is green, inline-edge and void-edge have direct green packaged rows, but placeholder and no-FEFF placeholder typing remain behavior-red through XCUITest `value`. Broader iOS Safari composition/focus remains tooling-blocked, and the external plan now lives in [2026-04-12-ios-safari-broader-composition-focus-external-evidence-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-ios-safari-broader-composition-focus-external-evidence-plan.md) | [rich-inline.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/rich-inline.test.ts), [zero-width-matrix.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/zero-width-matrix.test.ts), [webkit-direct-ime-ceiling.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/webkit-direct-ime-ceiling.test.ts), [ime-proxy.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/ime-proxy.test.ts), [2026-04-11-slate-browser-agent-browser-ios-setup-proof.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-browser-agent-browser-ios-setup-proof.md), [2026-04-12-appium-ios-safari-loads-local-slate-routes-but-xcuitest-value-does-not-drive-contenteditable.md](/Users/zbeyens/git/plate-2/docs/solutions/integration-issues/2026-04-12-appium-ios-safari-loads-local-slate-routes-but-xcuitest-value-does-not-drive-contenteditable.md), [package.json](/Users/zbeyens/git/slate-v2/package.json) | `platform parity lane` | `tooling-blocked / non-RC` |
| [x] | Firefox composition / selection recovery | `packages/slate-react/src/components/editable.tsx` | `Editable`, `EditableBlocks`, `ReactEditor`, `DOMBridge`, drag/drop cleanup example, table multi-range example, nested-editable focus example | desktop parity lane plus direct composition lane plus proxy backstop plus dedicated drag/drop, table multi-range, and nested-editable lanes | `automated-direct: firefox` for selection recovery, IME composition, dragged-node-unmount cleanup, table multi-range preservation, and nested-editable focus bounce, `automated-proxy: firefox + webkit-desktop` backstop | Firefox composition, selection recovery, dragged-node-unmount cleanup, table multi-range preservation, and nested-editable focus bounce are directly proved or explicitly justified as non-behavioral | Firefox now has direct browser proof for blur/focus selection recovery, zero-width normalization, direct composition on placeholder, no-FEFF placeholder, inline-edge, and void-edge via Playwright `keyboard.insertText`, plus dedicated drag/drop, multi-range table, and nested-editable focus lanes. Local Firefox/browser parity is exhausted; the remaining work is external Android keyboard-feature evidence and broader iOS evidence, not another Firefox hole | [rich-inline.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/rich-inline.test.ts), [zero-width-matrix.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/zero-width-matrix.test.ts), [firefox-direct-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/firefox-direct-ime.test.ts), [drag-drop-cleanup.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/drag-drop-cleanup.test.ts), [table-multi-range-firefox.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/table-multi-range-firefox.test.ts), [firefox-nested-editable-focus.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/firefox-nested-editable-focus.test.ts), [ime-proxy.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/ime-proxy.test.ts), [package.json](/Users/zbeyens/git/slate-v2/package.json), [2026-04-12-firefox-drag-drop-proof-needs-example-owned-drop-mutation-and-document-level-drag-cleanup.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-12-firefox-drag-drop-proof-needs-example-owned-drop-mutation-and-document-level-drag-cleanup.md), [2026-04-12-firefox-table-multi-range-proof-needs-native-table-selection-and-a-multi-range-sync-guard.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-12-firefox-table-multi-range-proof-needs-native-table-selection-and-a-multi-range-sync-guard.md), [2026-04-12-firefox-nested-editable-focus-proof-needs-a-real-nested-contenteditable-surface.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-12-firefox-nested-editable-focus-proof-needs-a-real-nested-contenteditable-surface.md) | `platform parity lane` | `local-closed` |

## Legacy Slate React High-Risk Files

- [x] [packages/slate-react/src/components/editable.tsx](/Users/zbeyens/git/slate/packages/slate-react/src/components/editable.tsx)
  Note: old browser/input complexity center, including Android manager wiring,
  restore-dom, Firefox/Safari compat, and history/browser event policy.
- [x] [packages/slate-react/src/components/string.tsx](/Users/zbeyens/git/slate/packages/slate-react/src/components/string.tsx)
  Note: zero-width, void spacer, and placeholder DOM semantics live here.
- [x] [packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts](/Users/zbeyens/git/slate/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts)
  Note: explicit Android composition/diff/flush subsystem.
- [x] [packages/slate-react/src/hooks/android-input-manager/use-android-input-manager.ts](/Users/zbeyens/git/slate/packages/slate-react/src/hooks/android-input-manager/use-android-input-manager.ts)
  Note: Android-only hook integration seam.
- [x] [packages/slate-react/src/components/restore-dom/restore-dom.tsx](/Users/zbeyens/git/slate/packages/slate-react/src/components/restore-dom/restore-dom.tsx)
  Note: mutation-observer restore seam used on Android and weird DOM drift.
- [x] [packages/slate-react/src/components/restore-dom/restore-dom-manager.ts](/Users/zbeyens/git/slate/packages/slate-react/src/components/restore-dom/restore-dom-manager.ts)
  Note: buffered mutation restore logic during composition-sensitive phases.
- [x] [packages/slate-react/test/react-editor.spec.tsx](/Users/zbeyens/git/slate/packages/slate-react/test/react-editor.spec.tsx)
  Note: direct legacy focus/selection recovery proof rows.

## Current Slate v2 Runtime Files

- [x] [packages/slate-react/src/components/editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx)
  Note: current mounted bridge, selection sync, DOM commit, focus recovery.
- [x] [packages/slate-react/src/plugin/react-editor.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/plugin/react-editor.ts)
  Note: reviewed; current owner of focus/blur, target detection, window/root
  lookup, and DOM selection restore. It does not carry legacy Android/Safari/
  Firefox composition-specialist machinery.
- [x] [packages/slate-dom/src/bridge.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/src/bridge.ts)
  Note: reviewed; current owner of DOM point/range translation and zero-width
  normalization. It carries the browser boundary seam, but not platform-specific
  IME orchestration.
- [x] [packages/slate-react/test/surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx)
  Note: current direct focus/runtime owner file for the mounted bridge.
- [x] [packages/slate-react/test/runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
  Note: broad runtime contract owner, but not yet the IME/mobile/browser parity
  authority by itself.

## Current Browser Proof Files

- [x] [playwright/integration/examples/placeholder-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/placeholder-ime.test.ts)
- [x] [playwright/integration/examples/inline-edge-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/inline-edge-ime.test.ts)
- [x] [playwright/integration/examples/void-edge-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/void-edge-ime.test.ts)
- [x] [playwright/integration/examples/ime-proxy.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/ime-proxy.test.ts)
  Note: browser-level proxy composition owner for Firefox and desktop WebKit.
- [x] [playwright/integration/examples/zero-width-matrix.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/zero-width-matrix.test.ts)
- [x] [playwright/integration/examples/rich-inline.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/rich-inline.test.ts)
  Note: owns the current browser blur/focus reset proof row.
- [x] [playwright/integration/examples/android-tests.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/android-tests.test.ts)
  Note: hub smoke test is now also the entrypoint for manual-device debug
  overlays, but still not real Android parity proof by itself.
- [x] [packages/slate-browser/src/playwright/ime.ts](/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/ime.ts)
  Note: Chromium uses CDP composition; Firefox and desktop WebKit now also have
  a browser-level proxy composition path that drives the v2
  `compositionstart`/`compositionend` plus DOM-commit seam.
- [x] [site/examples/ts/components/ime-history-controls.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/components/ime-history-controls.tsx)
  Note: manual-device debug overlay now exposes Slate selection, DOM selection,
  placeholder shape, event flow, and HTML snapshots on the IME surfaces through
  `?debug=1`.
- [x] [site/examples/ts/android-tests.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/android-tests.tsx)
  Note: hub now routes to the IME surfaces with debug overlays enabled.
- [x] direct iOS Appium lanes exist, but they are mixed:
  placeholder and no-FEFF placeholder stay setup-green / behavior-red, while
  inline-edge and void-edge are direct-green; broader iOS Safari
  composition/focus remains tooling-blocked
- [x] direct Firefox parity lane exists for the main IME surfaces through
  `firefox-direct-ime.test.ts`
- [x] direct Android parity lanes exist for placeholder, inline-edge, void-edge,
  split/join, empty/delete-rebuild, remove-range, and structural `special`

## Current Docs / Risk Framing Files

- [x] [docs/slate-v2/release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [x] [docs/slate-v2/replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- [x] [docs/slate-v2/release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [x] [docs/slate-v2/true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [x] [docs/solutions/logic-errors/2026-04-03-jsdom-contenteditable-composition-is-not-a-trustworthy-ime-proof.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-jsdom-contenteditable-composition-is-not-a-trustworthy-ime-proof.md)
- [x] [docs/solutions/logic-errors/2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md)
- [x] [docs/solutions/logic-errors/2026-04-04-void-like-zero-width-ime-proofs-need-the-real-void-spacer-structure.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-void-like-zero-width-ime-proofs-need-the-real-void-spacer-structure.md)
- [x] [docs/solutions/logic-errors/2026-04-09-slate-react-focus-restore-must-fail-closed-on-transient-dom-point-gaps.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-09-slate-react-focus-restore-must-fail-closed-on-transient-dom-point-gaps.md)
- [x] [docs/solutions/logic-errors/2026-04-03-zero-width-dom-selection-bridges-must-normalize-both-directions.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-zero-width-dom-selection-bridges-must-normalize-both-directions.md)
- [x] [docs/solutions/logic-errors/2026-04-04-inline-edge-ime-proofs-should-set-selection-semantically-before-composition.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-inline-edge-ime-proofs-should-set-selection-semantically-before-composition.md)

## Current Read

- Chromium IME/browser proof is real and worth keeping
- the strong zero-regression RC claim is still blocked by platform/browser proof
  holes
- the remaining behavior-bearing rows are now:
  - Android keyboard-feature behavior beyond ordinary typing and structural rows
  - broader iOS Safari / WebKit composition/focus beyond the currently green
    packaged lanes
- the local Firefox/browser lane is exhausted
- all three now have a cleaner manual-device path because the IME surfaces emit
  debug JSON and HTML dumps through `?debug=1`
- `ReactEditor` and `DOMBridge` are now reviewed as current owners
- the remaining red is external/tooling-limited platform proof, not unread core
  owner files
- row-specific manual capture scaffolds now exist under:
  - [android-keyboard-features](/Users/zbeyens/git/plate-2/.omx/artifacts/ime-mobile-browser/android-keyboard-features/README.md)
  - [ios-safari-composition-focus](/Users/zbeyens/git/plate-2/.omx/artifacts/ime-mobile-browser/ios-safari-composition-focus/README.md)

## Exact Legacy Compat Behaviors Still Unproved

### Android

- `beforeinput` is non-cancelable on Android, so legacy routed it through the
  Android input manager instead of the normal DOM path
- Android IMEs can re-apply their own selection after Slate sets one, which is
  why legacy forced selection twice across animation-frame and timeout phases
- Gboard spellchecker state needed an extra forced selection change after the
  animation-frame selection update
- the current local Appium + Chrome stack can prove keyboard visibility but not
  expose or accept Gboard candidates, so autocorrect / glide / voice remain
  external-evidence rows

Primary legacy evidence:

- [packages/slate-react/src/components/editable.tsx](/Users/zbeyens/git/slate/packages/slate-react/src/components/editable.tsx)
- [packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts](/Users/zbeyens/git/slate/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts)

### Safari / WebKit

- Shadow-root selectionchange in WebKit needed the odd `execCommand('indent')`
  / deselect workaround path
- Safari can dispatch `beforeinput(insertFromComposition)` before
  `compositionend`, so composition state had to be cleared early
- Safari blur could leave selection ranges behind even after the editable lost
  focus
- Safari paste `InputEvent`s could miss the Slate fragment payload, requiring
  the clipboard fallback path

Primary legacy evidence:

- [packages/slate-react/src/components/editable.tsx](/Users/zbeyens/git/slate/packages/slate-react/src/components/editable.tsx)

### Firefox

- Firefox selection reads needed special handling because the “normal selection
  way” could lie
- nested editable focus had to be bounced back to the main editor to avoid
  keyboard-navigation breakage
- Firefox multi-range table selection could be broken by calling
  `setDomSelection`
- Firefox drop flows needed global `dragend` listening because dragged nodes
  could unmount before their own `dragend`

Primary legacy evidence:

- [packages/slate-react/src/components/editable.tsx](/Users/zbeyens/git/slate/packages/slate-react/src/components/editable.tsx)

# Wordgard: input and IME

## Visual-line deletion

- **Visual-line deletion.** `test/webtest-commands.ts` lines 27-35 at b5ad0d0 pin that deleting a visual line stops at the soft-wrap boundary and never consumes the next block. Plite covers hard and soft line deletion in `packages/plitejs/test/react/model-input-strategy-contract.test.ts`, in imported unit-line fixtures, and in Chromium, WebKit and plaintext browser rows (`apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts`) (report.md:107).

## Composition

- **Composition.** `test/webtest-composition.ts` lines 95-187 at b5ad0d0 pin IME composition in empty, start, end, replacement, marked, nested-wrapper and pending-mark positions without losing the live DOM selection. They also pin a target-range fallback for Safari, which lacks the needed constructor. Plite's rich-text browser tests (`apps/plite/tests/plite-browser/donor/examples/richtext.test.ts`) cover composition when empty, marked, in a cursor wrapper, in Korean, across blocks, consecutively, under model interference and on WebKit. Plite owns target-range detection and fallback in `packages/plitejs/src/react/editable/dom-input-event.ts` and `selection-reconciler.ts`, with `packages/plitejs/test/react/selection-reconciler-contract.ts` (report.md:108).

## DOM mutation import

- **Mutation import.** `test/webtest-dom-changes.ts` lines 51-148 at b5ad0d0 pin that later input targets and DOM-to-model coordinates stay current through stacked native mutations, edits in earlier or adjacent hosts, intervening model commits, command reinterpretation and newly created text nodes; randomized mixed edits never use stale positions. Plite's `packages/plitejs/test/react/input-router-contract.test.tsx` proves same-host coalescing, cross-host preservation, model and native interleaving, stale-target rejection and retargeting. Its `selection-reconciler-contract.test.tsx` and rich-text browser rows (nested-mark mutations and a generated mixed-editing gauntlet) cover the rest. Plite does not expose Wordgard's private ledger of integer positions (report.md:115).

## Mobile default-action routing

- At Wordgard revision `01eb2b5eae509509677345fd603acad001827dff`, the July 27 audit identified a mobile Enter/Backspace bypass in `src/editor/input.ts:710-714` that lets native beforeinput own those actions. Its useful hypothesis was preservation of virtual-keyboard capitalization and semantic word deletion. Its platform guard also bypassed custom mobile key bindings, including modified or hardware-keyboard input, so the audit rejected copying that guard wholesale. The change added no regression test, and the audit had no physical-device receipt. Source: `docs/plans/2026-07-25-multi-editor-full-architecture-audit.md:625-640`; this is historical source evidence, not certification of mobile behavior.

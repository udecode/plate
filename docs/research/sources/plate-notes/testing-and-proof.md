---
title: Testing and browser proof
type: source
status: partial
source_refs:
  - 52625e8502:docs/solutions/logic-errors
  - 52625e8502:docs/solutions/developer-experience
  - 52625e8502:docs/solutions/test-failures
  - 52625e8502:docs/plite/reference/public-docs/general
updated: 2026-10-06
---

# Testing and browser proof

These lessons come from retired solution notes and Plite references, and no rule in `verify`, Vision file or public doc states them. A reader checked each one against the current tree on 2026-10-06. Each source is a path under `docs/` at commit `52625e8502`; read it with `git show 52625e8502:docs/<path>`.

## Harness traps

- **`clipboard.assert.*` copies again.** The harness's `editor.clipboard.assert.*` calls `copyPayload`, which presses ControlOrMeta+C, so after a cut it re-copies the post-cut selection and changes state; read the clipboard with `readText` or `readHtml` instead. A cut proof uses the real ControlOrMeta+X, because a synthetic `ClipboardEvent('cut')` reaches only the React handler, and asserts the payload, the remaining text and a collapsed selection at the cut start. The cut handler returns a delete-fragment command plus a caret repair; Firefox lost the restored selection until cut became a model-owned repair. Code: `packages/test/src/playwright/harness-input.ts:166`, `:180`, `packages/plitejs/src/react/editable/clipboard-input-strategy.ts:388`. Sources: `solutions/logic-errors/2026-04-22-plite-react-cut-proof-must-use-real-shortcut-and-assert-selection.md`, `solutions/logic-errors/2026-04-22-plite-react-internal-controls-must-be-native-owned.md`.
- **Typing helpers need usable keyboard focus.** A DOM selection inside the root is not enough: an app checkbox or button can hold focus while an old editor selection is still contained. Under shadow DOM, read the selection through `ShadowRoot.getSelection` when available and accept only selections inside the editor root; a document-level range outside the shadow editor is not editor selection. Checklist and WebKit shadow-DOM rows failed until these were split. Code: `packages/test/src/playwright/root-focus.ts:5`, `:32`. Source: `solutions/logic-errors/2026-04-24-plite-browser-proof-must-separate-model-owned-handles-root-selection-and-usable-focus.md`.
- **Stress families need a real `Editable`.** The generated stress runner opens every route with `ready: { editor: 'visible' }`, so a stress family needs a route that renders a real `Editable` and publishes the browser handle; selector-only demos stay contract rows. A row pointed at a selector-only route timed out on the textbox and stopped every later family. Set up stress cases through the smallest example control the contract needs, such as a seed button, and budget app-owned control rerenders apart from node churn. Code: `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts:1345`. Sources: `solutions/test-failures/2026-04-28-plite-browser-generated-stress-rows-need-real-editable-harnesses.md`, `solutions/test-failures/2026-05-18-plite-read-only-selection-tests-need-selector-owned-dom-selection.md`.
- **WebKit computed lengths carry float noise.** A cross-browser row parses CSS lengths and compares them within a tolerance; exact string assertions failed only on WebKit while the layout was right. Source: `solutions/test-failures/2026-05-20-plite-integration-local-editor-stacking-and-project-scope-failures.md`.

- **`Locator.evaluate` passes the element first.** A paste test that wrote `navigator.clipboard` from `locator.evaluate((text) => ...)` put `[object HTMLDivElement]` into the document, because Playwright passes the locator's element as the first argument; write `(_element, text)` and pass the value second. Source: `docs/plite/research/2026-06-12-oss-clipboard-paste-architecture/README.md:74-78`.

## Ownership and type checks

- **The React editable root's static inventory is grandfathered.** `kernel-authority-audit-contract.ts` records per-file call counts with owner, next step and rationale through `expectAuthorityInventory` and `expectSourceOwnershipInventory`. It reads source text, so it is a baselined `plate/no-source-text-test` finding; update it only when a patch moves a counted call such as selection import, event frames, trace or repair, and do not extend the pattern. A helper extraction that shrinks a file proves no change of owner, and browser rows are the durable proof of the timing and DOM-authority bugs a count cannot see. Code: `packages/plitejs/test/react/kernel-authority-audit-contract.ts:89`, `:210`, `tooling/oxlint/plate-baseline.json`. Source: `solutions/developer-experience/2026-04-27-plite-react-runtime-owner-cuts-need-static-inventories-and-browser-proof.md`.
- **Check the app typecheck's file list for `dist`.** To prove the app typecheck stays on package source, inspect the program's files, not its errors: `pnpm --dir apps/www exec tsc --noEmit -p tsconfig.json --listFilesOnly | rg '/packages/.*/dist/'` prints nothing when it does. Once source and dist declarations mix in one program, errors turn into long editor and plugin incompatibility chains that move when dist is rebuilt; do not chase them in package source. The include `../../packages/*/src/**/*.d.ts` exists because a source-graph program needs the packages' ambient declarations, such as `code-drawing/viz.d.ts`. Code: `apps/www/tsconfig.json`, `tooling/entrypoints/workspace-source-paths.mjs`. Source: `solutions/developer-experience/2026-03-12-typescript-workspace-subpath-aliases-in-apps-www.md`.

## Where the core claims are tested

- **Core runtime.** In `packages/plitejs/test/`, `content-slice-laws.test.ts` and `slice-fit-content-contract.test.ts` test ContentSlice laws and detached fitting, and `schema-definition.test.ts` and `schema-compiler.test.ts` test schema compilation. `plugin-configuration.test.ts` tests atomic plugin-slot migration, with `history/history-persistence-contract.spec.ts` for schema-identity rejection. `document-state-contract.ts` tests the document shape (children, roots and meta), and `state-tx-public-api-contract.ts` the read and update lifecycle. Source: `plite/reference/public-docs/general/docs-proof-map.mdx`.
- **React, DOM and browser.** External text has `packages/plitejs/test/react/external-text-contract.test.tsx`, `apps/plite/tests/plite-browser/donor/examples/external-text.test.ts` and the benchmark `benchmarks/editor/benchmarks/plite-external-text-browser.mjs`. The void shell has `packages/plitejs/test/react/plite-void-shell-contract.test.tsx`, the huge document `apps/plite/tests/plite-browser/donor/examples/huge-document.test.ts`, stress replay `apps/plite/tests/plite-browser/donor/stress/replay.test.ts`, and pagination `packages/plitejs/test/pagination/page-layout-contract.test.ts`. Source: `plite/reference/public-docs/general/docs-proof-map.mdx`.

## Open lead

- **61 legacy fixtures are skipped on a premise current law reverses.** `packages/plitejs/test/fixture-claim-overrides.ts` turns 61 legacy fixtures into `it.skip` (`index.slow.ts:78-83`) because adjacent-text and spacer cleanup was explicit-only. `docs/vision/plite.md` now says finalization merges equal adjacent text and removes redundant empty leaves while keeping required inline caret spacers. Run those rows unskipped and classify each as copied, improved or rejected instead of trusting the blanket skip. Source: `solutions/developer-experience/2026-04-19-plite-explicit-normalization-cuts-should-live-in-one-fixture-override-registry.md`.

## Harvesting other editors

- **Classify a harvested test by its body, not its file name.** Four Lexical files are misnamed:
  - `LexicalElementHelpers.test.ts` tests only the DOM class-name helpers `addClassNamesToElement` and `removeClassNamesFromElement` (`facebook/lexical@dd5c41b1:packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:9-64`);
  - `1384-insert-nodes.spec.mjs` tests code-block paste;
  - `LexicalNormalization.test.tsx` tests selection endpoint normalization, not tree repair;
  - `7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs` tests paste into an image caption.

  Routed by its name, each row would land on the wrong owner, so read the test before assigning one. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:870`, `:883`, `:886`, `:890`.

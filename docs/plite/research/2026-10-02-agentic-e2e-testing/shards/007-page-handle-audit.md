# Shard: Plite page handle `__pliteBrowserHandle`

Scope: read-only research over `/Users/zbeyens/git/plate-2` at worktree `cf15725603` on 2026-10-02. Measurements ran in this scratch directory on copies of `packages/plitejs/dist` (built 2026-10-02 01:33, newer than `browser-handle.ts`, mtime 2026-09-28). No repository file was edited. Line numbers are 1-based.

## Summary

- Every mounted `Editable` attaches a 42-method handle (19 reads, 23 writes) as the expando `__pliteBrowserHandle` on its root, with no environment gate (`packages/plitejs/src/react/editable/browser-handle.ts:74-150,924-930`; `runtime-browser-handle-events.ts:42-74`; `runtime-event-engine.ts:193-207`).
- The only runtime reader outside tests is `apps/plite/src/app/mobile-lab/client.tsx:14-23,145-147,195-215`, a proof-only route that reads eight methods and writes none. No product package or www page reads or writes the handle.
- Measured cost in a production-minified bundle of a minimal plaintext `Editable` is 10,525 B minified, 2,982 B gzip and 1,725 to 2,012 B brotli, or 0.78% of that bundle's gzip size. It does not tree-shake: the minified bundle still holds `__pliteBrowserHandle` three times. The read half alone costs at most 4,990 B minified and about 1,470 to 1,500 B gzip.
- The kernel trace ring buffer (200 entries per editor) is filled on every traced event in production. Its only shipped reader is the handle's `getKernelTrace`. With the handle stubbed, `getEditableKernelTrace` disappears from the bundle (0 references), so the buffer becomes write-only.
- The handle opens no new trust boundary for a page script, because React DOM's production build already puts `__reactFiber$` and `__reactProps$` on DOM nodes. It does make a stable, undocumented page API out of internals, and its writes skip every DOM-level app handler.
- Recommendation: option (d). Move attachment behind an explicit installer exported from the existing `plitejs/testing` entry, and have the proof apps call it. Reject (b), because the main Plite browser suite runs against a `next build` static export, so a `NODE_ENV` gate would fail every `openExample` ready gate.

## 1. Consumers

### Attachment

- `attachPliteBrowserHandle` builds the handle object and assigns `element.__pliteBrowserHandle = handle`. Cleanup clears it only if it is still the same object (`browser-handle.ts:220-249,369,924-930`).
- `useRuntimeBrowserHandle` calls it from a layout effect with 12 dependencies (`runtime-browser-handle-events.ts:42-74`). `useRuntimeEventEngine` calls the hook for every editable (`runtime-event-engine.ts:193-207`). Neither file checks `NODE_ENV`.
- The test-side key constant is `BROWSER_HANDLE_KEY = '__pliteBrowserHandle'` (`packages/test/src/playwright/constants.ts:2`).
- The source itself labels the handle test-only. The kernel authority audit calls it "The test-only browser handle" and "explicit test/proof traces" (`packages/plitejs/test/react/kernel-authority-audit-contract.ts:962-991`).

### Reference counts by consumer group

Counts come from `git grep -c --untracked -E '__pliteBrowserHandle|BROWSER_HANDLE_KEY'` per directory, excluding `.tmp/` and `docs/plans/artifacts/`. They count raw references, so treat them as approximate.

| Group | Files | Refs | Role |
| --- | --- | --- | --- |
| `packages/test/src` (`@platejs/test`, published, version `54.0.0-beta.0`) | 15 | 58 | Harness reads and writes |
| `packages/test/test` | 2 | 19 | Harness proof tests with fake handles |
| `packages/plitejs/test` | 3 | 42 | Handle contract and kernel tests |
| `apps/plite/tests` | 21 | 75 | Plite Playwright specs, direct calls outside the harness |
| `apps/www/tests` | 12 | 54 | www Playwright specs, direct calls |
| `apps/www/scripts` | 1 | 12 | `run-homepage-input-perf.mts` |
| `apps/plite/src` | 1 | 2 | `mobile-lab` proof route, reads only |
| `benchmarks` | 4 | 41 | Browser benchmarks |
| `packages/platejs/scripts`, `packages/plitejs/benchmarks` | 2 | 4 | Text-flow browser matrices |
| `tooling` | 1 | 2 | `tooling/e2e/node-selection.test.ts` reads `getModelSelection` |
| `.agents` | 0 | 0 | Skills name it in prose only |

### `@platejs/test` reads

- Model: `get.modelText`, `modelBlockText`, `modelBlockTexts` and `modelValue` call `getText`, `getBlockText`, `getBlockTexts` and `getValue` through `evaluateHarnessHandle` (`harness.ts:134-155`; `handle.ts:28-61`).
- Trace and commit: `get.kernelTrace`, `history` and `lastCommit` call `getKernelTrace`, `getHistory` and `getLastCommit` (`harness.ts:166-192`). `snapshot()` bundles them (`harness.ts:420-432`).
- Selection: `selection-snapshots.ts` reads `getSelection`, `getDOMSelection`, `getInputState` and `getKernelTrace` while it waits for selection sync and when it builds failure messages (`selection-snapshots.ts:88-110,214-229,325-352`). `displayed-selection.ts:16-23` reads `getViewSelection`.
- Identity: the scenario runner reads `getNodeKey` and `getPathByNodeKey` (`harness-scenario.ts:393-401,579-595`).
- Readiness: `waitForReady` polls `hasSelectionHandle`, which checks that `selectRange` exists (`ready.ts:23-30`; `selection-handle.ts:7-14`). `openExample` defaults to `ready: { editor: 'visible' }` (`packages/test/src/playwright/index.ts:251-256`). Every `openExample` call therefore needs the handle.
- Focus owner needs no handle. It reads `activeElement` from the DOM (`selection-geometry.ts:115-140`).

### `@platejs/test` writes

- `harness.insertText`, `insertBreak`, `deleteFragment`, `deleteBackward`, `deleteForward`, `undo` and `redo` call the handle, not the browser (`harness.ts:528-548`). Scenario steps `insertText`, `deleteBackward` and `deleteForward` route through them (`harness-scenario.ts:616-623,710-712`).
- `selection.select` writes `selectRange` first, then mirrors the selection to the DOM and dispatches a synthetic `selectionchange` (`harness.ts:211-262`; `selection-handle.ts:108-130`). `selectDOM` calls `importDOMSelection` up to three times and falls back to `selectRange` (`harness.ts:264-335`). `focus` calls the handle's `focus()` first (`harness.ts:433-475`; `selection-handle.ts:147-160`).
- `setDOMSelection` tries `setNativeDOMSelection` before its own DOM code (`selection-actions.ts:130-140`).
- Paste fallback. `pasteText` and `pasteHtml` call `insertTextThroughHandle` or `insertDataThroughHandle` when the clipboard write throws or the native paste changed nothing (`harness-input.ts:114-176`; `dom-text.ts:58-73`; `clipboard.ts:395-422`). `pastePayloadThroughEvent` calls `insertData` when a synthetic paste event changed nothing (`clipboard.ts:331-392`).
- IME fallback. `commitSyntheticCompositionText` calls `setNativeDOMSelection`, then calls `deleteFragment` and `insertText` instead of the composition path when the model did not change (`ime.ts:89-99,118-120,203-245`). `packages/test/test/proof/playwright-ime.test.ts:281` pins "uses semantic fallback for mobile synthetic composition when a Plite handle is available".
- Waiting can also write. `waitForPendingNativeTextInputRepair` calls `clearSettledPendingNativeTextInputRepair` on every poll (`dom-text-actions.ts:622-697`), and that call clears internal input state (`browser-handle.ts:430-494`).
- Range anchors, materialization and scenario setup also write. They use `createRangeAnchor`, `resolveRangeAnchor`, `releaseRangeAnchor` with `selectRange` (`selection-anchors.ts:31-153`), `scrollPathIntoView` (`materialization.ts:26-32`), and `applyChange` and `applyValueChange` (`harness-scenario.ts:144-207`).

### Specs, tooling, benchmarks and docs

- Direct spec calls skip the harness. A method census over consumer files found, for example, `insertData` behind a local helper used about 40 times in `apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts:118-130,367-1572`, `insertTextAt` and `deleteTextAt` in `authored-changes.spec.ts`, `richtext.test.ts` and several www specs, and `applyValueChange` with `undo`/`redo` in `apps/www/tests/browser/excalidraw.spec.ts`.
- `apps/plite/tests/plite-browser/plite-examples.spec.ts:45-58` asserts that every example exposes the handle (`typeof __pliteBrowserHandle === 'object'`).
- The `benchmarks/slate-v2/donor/browser/react/huge-document-browser-trace.mjs` trace driver uses 13 methods, including `selectRange`, `undo` and `scrollPathIntoView`.
- Agent skills name the stand-ins in prose, not by key. `verify.mdc:264-267` warns that paste can fall back to editor handles. `references/commands.md:199-200` says semantic mobile handles never prove a raw device. `references/editor-proof.md:82-88` scopes semantic-handle mobile proof. `benchmark/references/methodology.md:126-129` forces a rebuild when injected browser-handle code changes.
- Agent probes read the handle against local dev servers. One example is `docs/research/raw/2026-09-22-media-arrow-browser-observation.md:3` (`http://localhost:3000`). No recorded probe read it on platejs.org (searched `docs/research`, `docs/solutions` and `docs/plans`).
- Public docs teach `@platejs/test/playwright` to users (`docs/plite/reference/public-docs/concepts/15-editing-behavior.mdx:19,38,154`). External users' suites therefore get the handle for free today.

### Production code paths

- No product package and no www source file reads or writes the handle. A `git ls-files` sweep of every `src/` path matching the handle names returns only `plitejs` itself, `@platejs/test` and `apps/plite/src/app/mobile-lab/client.tsx`.
- Product kernel code does branch on handle provenance. The `'browser-handle'` origin and preference reason are read in `input-router.ts:1425-1429`, `selection-controller.ts:631-633,704-706,834-838`, `dom-input-runtime.ts:439-442` and `editing-kernel.ts:570-575`. In the minified bundle the string `"browser-handle"` appears 16 times with the handle and 6 times with it stubbed (measured). Those 6 are product branches that only a handle write can trigger.

## 2. Write methods and the stand-in problem

### What each write does

| Method | Mechanism | Native path skipped | Class |
| --- | --- | --- | --- |
| `insertText`, `insertBreak`, `insertData`, `deleteBackward`, `deleteForward`, `deleteFragment`, `selectAll` | `runCommand` (`browser-handle.ts:279-367`) flushes pending native input, forces model-owned selection preference with reason `'browser-handle'`, opens a `'repair'` event frame, calls `applyEditableCommand`, exports the DOM selection, refocuses on microtask and timeout, and records a trace with `nativeAllowed: false` | keydown, beforeinput, input, DOM mutation, composition, clipboard events, Android repair, app `onKeyDown`/`onDOMBeforeInput` | Input stand-in |
| `undo`, `redo` | `dispatchHistory` directly, then force render and refocus (`:745-754,899-908`) | Mod+Z keydown, `historyUndo` beforeinput | Input stand-in |
| `applyChange`, `applyValueChange`, `insertTextAt`, `deleteTextAt` | `editor.update` with an optional caller policy, then `forceRender` (`:370-397,420-429,735-744`) | All input; no event frame | Fixture write |
| `selectRange` | writes runtime selection, clears view selection, sets preference reason `'browser-handle'`, focuses, exports the DOM selection now, on microtask and on timeout (`:764-825`) | click, drag, keyboard selection, native `selectionchange` import | Selection stand-in |
| `focus` | sets the same preference, writes the start point when no selection exists, focuses, exports the DOM selection (`:495-533`) | pointer or Tab focus | Selection stand-in |
| `setNativeDOMSelection` | writes the real `Selection` through `addRange`/`extend` and dispatches a synthetic `selectionchange` (`:826-882`) | the gesture; the import path does run | Closest to native, still programmatic |
| `importDOMSelection` | forces a DOM-to-model import outside the editor's own `selectionchange` handling (`:666-712`) | the editor's own import trigger | Can mask an import bug |
| `setViewSelection` | writes the projection selection (`:885-898`) | everything | Fixture write |
| `scrollPathIntoView` | programmatic viewport scroll (`:883-884`) | wheel, scrollbar, keyboard scroll | Stand-in |
| `createRangeAnchor`, `resolveRangeAnchor`, `releaseRangeAnchor` | test bookkeeping on `editor.anchor` (`:398-410,755-760,909-921`) | none | Test bookkeeping |
| `clearSettledPendingNativeTextInputRepair` | clears `pendingNativeTextInputRepairPathKey` and its offset when model and DOM agree (`:430-494`) | the product's own clear (`dom-repair-queue.ts:928`, `input-router.ts:1414,1440`) | Internal state write |

### How the stand-ins leak into green tests

- Input. Every harness `insertText`, `deleteBackward`, `undo` and similar call takes the kernel path with no browser event (`harness.ts:528-548`).
- Paste and IME. The harness falls back silently to handle writes when the native path changed nothing (`harness-input.ts:114-176`; `ime.ts:203-245`). The proof review already selected "make stand-ins fail loud" for this (`docs/research/review-records/2026-10-02-proof-agentic-e2e-review.json:34`).
- Setup changes the code path that a later native step runs. `selectRange` leaves `modelSelectionPreference.reason = 'browser-handle'`. `isEditableModelSelectionPreferredForInput` returns true for `insertText` under that reason (`selection-controller.ts:683-712`), and the `selectionchange` that the harness dispatches next keeps the guard (`selection-controller.ts:834-838`; pinned by `packages/plitejs/test/react/selection-controller-contract.ts:1560-1582`). So after `editor.selection.select(...)`, a following `page.keyboard.type` runs as model-owned input. A real user who clicks gets reason `'native-selection'` instead (`selection-controller.ts:659-660`). This is inferred from source and was not run. A cheap probe is to read `getInputState().modelSelectionPreference.reason` after `selection.select` and after a real click.
- Waits. The repair wait clears the pending flag itself (`dom-text-actions.ts:650`). That can hide a product path that never clears it, and `editable-text-flow.tsx:71-80` renders from that flag. This is inferred and not run.

### Reads the proof oracle needs

Doctrine asks for "model, DOM, selection/caret where observable, focus owner, legal trace, replayability, and follow-up typing" (`VISION.md:110`), plus "commit metadata when mutating" (`docs/vision/plite.md:434-436`). The regression oracles also need `runtime-owner: pass` and `mutation-owner: pass`, so the oracle must show who owned publication (`.agents/rules/verify/references/regression-oracles.md:70-82`).

| Oracle part | Handle reads | Can DOM alone serve it? |
| --- | --- | --- |
| Model | `getValue`, `getText`, `getBlockText`, `getBlockTexts` | No. Virtualized or hidden content is not in the DOM |
| Selection | `getSelection`, `getModelSelection`, `getViewSelection`, `getDOMSelection` (DOM selection resolved to model points) | Partly. Raw DOM selection plus `data-editor-path` gives paths for plain text, not projections |
| Focus owner | none | Yes (`selection-geometry.ts:115-140`) |
| Legal trace and mutation owner | `getKernelTrace` | No |
| Commit metadata | `getLastCommit` | No |
| Replayability | `getHistory`, plus fixture writes `applyChange`/`applyValueChange` for setup | No |
| Identity | `getNodeKey`, `getPathByNodeKey`, `getElementByPath`, `resolveDOMPoint` | No |
| Diagnostics | `getInputState`, `getDOMPhaseSchedulerDiagnostics`, `getExternalTextMetrics`, `getProjectedNativeAffordanceMatrix` | No; used in failure messages and specific specs |

The oracle needs about 15 read methods and no input write. Fixture writes (`applyValueChange`, `applyChange`) are legitimate setup. The input and selection writes are the stand-ins.

## 3. Production cost (measured)

### Method

The measurement used esbuild 0.28.0 from `node_modules/.pnpm`, with minification, `format: esm`, `jsx: automatic` and `process.env.NODE_ENV` defined as `"production"`. The entry renders the plaintext example (`useEditor` with `history()`, `EditorRoot`, `Editable`) through `react-dom/client`. Two external modes ran. "plite-only" leaves every non-Plite package external. "with-deps" leaves only React external. The scripts are `measure/build.mjs`, `measure/stub.mjs` and `measure/split.mjs` in this scratch directory.

- `real-dist` is an unmodified copy of `packages/plitejs/dist`.
- `stub-dist` replaces the `runtime-browser-handle-events.ts` region in `editable-text-blocks-Bkky5Q4K.js` with `const useRuntimeBrowserHandle = (_options) => {};` and leaves `browser-handle.ts` in place for the minifier to drop.
- `reads-dist` deletes the 23 write properties from the handle object with acorn and keeps the 19 reads.

### Results

| Mode | Variant | Min B | Gzip B | Brotli B | `__pliteBrowserHandle` hits |
| --- | --- | --- | --- | --- | --- |
| plite-only | real | 1,251,180 | 381,562 | 312,092 | 3 |
| plite-only | reads only | 1,245,645 | 380,052 | 311,001 | 3 |
| plite-only | stub | 1,240,655 | 378,580 | 310,367 | 0 |
| with-deps | real | 1,258,845 | 384,696 | 314,522 | 3 |
| with-deps | reads only | 1,253,310 | 383,214 | 313,462 | 3 |
| with-deps | stub | 1,248,320 | 381,714 | 312,510 | 0 |

- Full handle: 10,525 B minified, 2,982 B gzip, 1,725 B (plite-only) to 2,012 B (with-deps) brotli. That is 0.78% of the gzip bundle.
- Read half: 4,990 B minified and 1,472 to 1,500 B gzip. This is an upper bound, because the minifier may keep now-unused local helpers such as `runCommand`.
- Unminified source of the `browser-handle.ts` region in dist: 19,164 B.
- Tree shaking does not happen today. The real bundle keeps three `__pliteBrowserHandle` references. The call sits inside `Editable`'s event engine, so `"sideEffects": false` (`packages/plitejs/package.json:29`) cannot help.
- Code reachable only through the handle disappears with the stub, measured by identifier counts in an unminified build: `attachPliteBrowserHandle`, `createBrowserHandleDataTransfer`, `getPublicDocumentChangeRoots`, `getProjectedNativeAffordanceMatrix` and `getEditableKernelTrace` all drop to 0.
- For context, the minimal `Editable` app is already 1.25 MB minified and 382 KB gzip. That is why the handle's share is small in percent and still about 3 KB gzip in absolute bytes.

### Runtime work when no test reads it

- Per mount, and per rerun of the 12-dependency layout effect, the handle allocates one object with 42 closures plus its helpers, sets the expando, and clears it on cleanup (`browser-handle.ts:220-930`; `runtime-browser-handle-events.ts:42-74`). It registers no listener or timer until a method is called. How often the effect reruns was not measured.
- Kernel trace, per traced event. `recordEditableKernelTrace` builds an entry and pushes it into `DOMInputRuntime.traces`. Once the buffer holds 200 entries, every push also runs `splice(0, 1)`, an O(200) front shift (`editing-kernel.ts:495-513`; `dom-input-runtime.ts:346,951-966`). Each entry retains a frame and selection objects. Keydown, input, selectionchange and repair all record entries (`runtime-kernel-trace.ts:147,200,314`; `runtime-selection-engine.ts:274`; `dom-repair-queue.ts:692`). Building the entry is partly product work, since `closeEditableEditingEpochAfterTrace` consumes its fields (`editing-kernel.ts:504-510`). The push and the retention exist only for readers, and the handle is the only shipped reader. The per-event cost was not measured.
- A side finding for whoever writes a gate. The transition assertion gate is `globalThis.process?.env?.NODE_ENV !== 'production'` (`editing-kernel.ts:554-556`). esbuild leaves it intact in the production bundle (measured, one hit), and it evaluates true in any page without a `process` global. `editable-rendered-element.tsx:27-37` uses a different runtime check. Neither pattern folds at build time, so copying either one for a handle gate would not remove any bytes.

## 4. Risk

- The handle opens no new trust boundary for main-world scripts. React DOM's production client sets `__reactFiber$` and `__reactProps$` on host nodes (`node_modules/.pnpm/react-dom@19.2.8_react@19.2.8/node_modules/react-dom/cjs/react-dom-client.production.js`, one hit each). A same-origin script can walk the fiber tree to the editor and call `editor.update` with the same power. Browser extensions' content scripts run in an isolated world and do not see page-set expandos without main-world injection. That last point is known platform behavior and was not tested here.
- What it does lower is the cost. One stable expando replaces a fiber walk, and nothing marks it as private. Third parties such as writing assistants, autofill tools or analytics can couple to the method names (Hyrum's law), and every internal rename then breaks them. Doctrine already rejects this. "Do not make proof handles a production extension API" (`docs/plans/2026-04-22-plite-editing-kernel-hard-cut-rewrite-plan.md:2091`). "This is not app API" (`docs/plans/2026-04-22-plite-editable-browser-kernel-refactor-plan.md:246-248`).
- These writes go beyond what synthetic DOM events can do:
  - `applyChange`, `applyValueChange`, `insertTextAt` and `deleteTextAt` take any update policy. The canonical tags include `skip-collab`, `history-skip`, `historic` and `collaboration` (`packages/plitejs/src/interfaces/editor.ts:826-853`). A script can make a local edit that never reaches collaborators, that cannot be undone, or that claims remote or historic origin. Plugin update groups extend the policy (`editor.ts:1766,1836-1839`).
  - The kernel command writes skip every DOM-level app handler, including `Editable`'s `onKeyDown` and `onDOMBeforeInput` props. Untrusted synthetic events do reach those handlers, so a filter that an app implements there can be bypassed. Plite's `isTrusted` check covers only single-character native text decisions (`native-input-strategy.ts:173-180`).
  - Read-only still holds, inferred and not run. View updates and commands throw "Cannot update a read-only editor view" (`editor-runtime-view.ts:1121-1124`; `core/command-registry.ts:188-190`), and `Editable` sets read-only through `setEditorReadOnly` (`runtime-root-engine.ts:160`).
- These reads expose private state:
  - `getHistory` returns full undo and redo `DocumentChange` JSON, which includes text the user deleted (`browser-handle.ts:538-567`).
  - `getKernelTrace` returns the last 200 selections and event frames.
  - `getInputState`, `getDOMPhaseSchedulerDiagnostics` and `getExternalTextMetrics` expose controller internals.
  - `getValue` returns content that virtualization keeps out of the DOM.
  All of these are reachable through fibers anyway, so the severity is low. They are still easier to reach, through a stable shape.
- The handle also bends product code. Six handle-provenance branches stay in the kernel (section 1). Handle-driven tests exercise those branches, not the paths a user hits.

## 5. Options

| Option | Production bytes | Proof suites | Deployed previews, real devices, reporter routes | Stand-ins | Verdict |
| --- | --- | --- | --- | --- | --- |
| (a) Keep as is | 10.5 KB min / 3.0 KB gzip in every consumer, plus the write-only trace buffer | unchanged | readable anywhere | unchanged; product branches stay | Rejected: every downstream app pays for our proof tooling and inherits an implicit API |
| (b) Attach only when `process.env.NODE_ENV !== 'production'` | 0 in production builds, if written as a statically foldable `process.env.NODE_ENV` check | breaks the Plite suite. `apps/plite/playwright.config.ts:114-120` runs `pnpm build && pnpm serve`; `pnpm build` is `next build` (`apps/plite/package.json:6`), served from the static `out` export (`scripts/serve.mjs:13`). With no handle, `openExample` fails its default ready gate (`index.ts:251-256` then `ready.ts:23-30`). www specs run on `next dev` (`apps/www/playwright.config.ts:42-48`; `apps/www/package.json:19`) and survive | lost on every production build: previews, `mobile-lab` on a production export, the planned real-device lane, and the Plite benchmarks that drive built apps | unchanged in dev | Rejected: it gates on the wrong axis, because we deliberately test production artifacts |
| (c) Always ship reads; gate writes | about 5.0 KB min / 1.5 KB gzip of reads plus the trace buffer stay in every consumer | reads unchanged; writes need the same gate as (d) | reads survive everywhere | writes become opt-in | Rejected as primary: it pays for a production-read job no evidence shows and still needs (d)'s mechanism |
| (d) Explicit opt-in installer, for example `installBrowserHandle()` from the existing `plitejs/testing` entry (`packages/plitejs/package.json:94-98`), with a module-level hook that `useRuntimeBrowserHandle` reads | about 0 for consumers that do not import it (a small hook remains, not measured) | apps/plite and www import it once at their client root; the plitejs contract test imports it; `@platejs/test` keeps its ready gate and fails with "handle not installed" | each app decides. www can install it unconditionally, so previews and platejs.org stay readable for reporter routes, or only outside production deploys (for example on `NEXT_PUBLIC_VERCEL_ENV`; inferred, www does not use that variable today). External `@platejs/test` users add one import in their test build | labeling and rejection still belong in the harness (review-selected "fail loud") | Recommended |
| (d') Lazy opt-in: a tiny stub that dynamically imports the handle when a page flag such as `window.__PLITE_PROOF__` is set before load | a stub plus an async chunk | harness sets the flag with `addInitScript` | readable on any build that ships the chunk | unchanged | Fallback, only if the owner needs reads on platejs.org without installing in www |

### Prior decisions

- Origin. `Editable` gained the handle for selection and range-ref helpers (`docs/plans/2026-04-19-plite-dom-react-tranche-5-6-execution.md:696-697`). It then grew `getText`, `insertText` and `undo` for model proof (`docs/plans/2026-04-21-plite-full-core-editing-coverage-plan.md:144-187`).
- Intent was always test-only:
  - "test-only browser handle plumbing" and "Owns test/proof-only semantic control surface. This is not app API." (`docs/plans/2026-04-22-plite-editable-browser-kernel-refactor-plan.md:121,244-248`)
  - "browser handle is isolated as test/proof plumbing" (same plan, `:784`)
  - "browser handle for proof only" (`docs/plans/2026-04-22-plite-authoritative-editing-kernel-perfect-architecture-plan.md:403`)
  - "Do not make proof handles a production extension API" (`docs/plans/2026-04-22-plite-editing-kernel-hard-cut-rewrite-plan.md:2091`)
  - "do not add another browser handle escape hatch" (`docs/plans/2026-04-22-plite-authoritative-command-kernel-architecture-plan.md:1900`)
- Stand-in debt was named early. "native transport debt is currently hidden by semantic handle paths" and "do not call semantic handle proof native proof" (`docs/plans/2026-04-22-plite-core-api-runtime-perfection-plan.md:403,424`).
- Kernel traces were added to the handle in `docs/plans/2026-04-22-plite-editing-kernel-hard-cut-rewrite-plan.md:1010-1011`.
- Still open. The 2026-10-02 proof review says "whether production builds should keep it is not settled here" (`docs/research/review-records/2026-10-02-proof-agentic-e2e-review.json:39`), and it selected "Make stand-ins fail loud" (`:34`). A search of `docs/plans`, `docs/research` and `docs/solutions` for the handle near production, `NODE_ENV`, bundle, tree-shake, opt-in, dev-only or strip found no decision on gating.

## 6. Recommendation

Take option (d), with these parts:

1. Move attachment behind `installBrowserHandle()` in `plitejs/testing`. `useRuntimeBrowserHandle` calls a module-level installer only when one is registered. The proof apps register it at their client root: apps/plite, which also covers `mobile-lab`, and www. The plitejs handle contract test registers it too.
   - Who it serves. Every downstream app stops paying about 3 KB gzip and stops exposing a write-capable page API.
   - What it costs. Our proof apps keep the handle on every build mode, including the `next build` export that `check:plite` drives.
   - Reporter routes. If www installs it unconditionally, platejs.org stays readable. That is a choice for www to make, not for every consumer.
2. Put trace retention behind the same installer. Build the trace entry as today, because the epoch logic needs it. Push into the 200-entry buffer only when a handle or other trace reader is installed.
3. Keep one handle with reads and writes. Do not split it, because once it is opt-in, a split buys no production safety. Stand-in control belongs in `@platejs/test`, per the review's selected direction:
   - paste without a native effect fails unless the call opts into the handle;
   - IME fallback and handle setters are labeled in the trace;
   - proof assertions reject labeled steps.
4. Candidate follow-up, for the owner to decide and not verified. Delete the `'browser-handle'` origin and preference reason and route handle selection through the existing programmatic origins (`'programmatic-export'` or `'model-command'`). That deletes six product branches, and handle-set selections would then run the same path that app-programmatic selection runs. It needs browser proof, because `selection-controller-contract.ts:1560-1582,2000-2060` pins today's behavior.
5. Do not gate on `NODE_ENV` anywhere in this change. That gate breaks the production-artifact proof lane. The repository's existing runtime env checks do not fold at build time (`editing-kernel.ts:554-556`).

Adoption cost:

- one import in apps/plite and in www;
- one in the plitejs contract test;
- a clear error in `@platejs/test`'s ready gate;
- one line in the public `@platejs/test` docs (`15-editing-behavior.mdx:154`);
- a changeset for `plitejs` and `@platejs/test`.

The proof runs `plite-examples.spec.ts:45-58`, the existing handle-presence assertion, plus `pnpm check:plite` on the production export, plus the bundle measurement in `measure/build.mjs` against the new dist, where `__pliteBrowserHandle` should have 0 hits.

## Limits

- The size numbers come from one minimal entry on the current dist and do not cover Plate's packaging. The read-half number is an upper bound.
- No browser run. The `'browser-handle'` preference leak, the read-only enforcement and the effect rerun frequency are inferred from source.
- Per-event trace cost was not benchmarked.
- The claims about extension isolated worlds and about Next's `process` global are platform knowledge, not checked here.
- Reference counts are raw `git grep -c` totals.

# Existing Plate/Plite harness evidence

**observed:** Read-only source inspection of `/Users/zbeyens/git/plate-2`, branch `next`, HEAD `b1e70bb257`. This records working-tree source, including discoverable untracked files, rather than certifying that all source matches HEAD. No repository tests, builds, servers, installs or mutations were run. Paths below are repository-relative unless explicitly marked scratch or sibling.

**observed:** Discovery used `git ls-files --cached --others --exclude-standard` and `git grep --untracked`. `.tmp/`, `docs/plans/artifacts/`, `dist/`, `.next/` and `node_modules/` were excluded. File counts are static discovery counts, not executed cases or passing coverage. `inventory.txt` is the filtered discovery list in scratch.

## 1. Test layers today

**observed:** Commands come from root/package `package.json`, `.agents/rules/verify/references/commands.md`, and the runner configs named below. CI membership comes from `.github/workflows/ci.yml`, `.github/workflows/plite-ci.yml`, `tooling/scripts/check.mjs`, package Turbo dependencies and runner dispatch. “Yes” means configured invocation, not a verified recent successful CI run. Conditional skips, capabilities and Turbo/proof reuse can narrow execution.

| Status | Runner / rough files | Command from repository root | Browser/device | In `pnpm check` / CI | What the runner observes |
| --- | --- | --- | --- | --- | --- |
| observed | Root fast aggregate: approximately 217 candidate files, including 59 Node-routed files and 158 Bun files | `pnpm test` → `bun tooling/scripts/test-suite.mjs fast` | Bun + happy-dom; Node contracts separately | Yes / yes, ordinary CI | Values, transforms, serializers, React rendering, emulated DOM, harness contracts; not real layout or platform input |
| observed | Root slow aggregate: approximately 92 candidate files | `pnpm test:slow` → `bun tooling/scripts/test-suite.mjs slow` | Bun/happy-dom and routed Node slow contracts | Yes / yes | Slow deterministic contracts and integration/measurement checks; native capability depends on a particular imported harness |
| observed | Plate package partitions: 285 `.spec`, 1 `.test`; 31 `.slow` separately | `pnpm --filter platejs test`; `pnpm --filter platejs test:partition:<partition>` | Bun/happy-dom | Yes, `plite:test` / yes | Real plugin/model wiring and emulated rendered React; no browser layout or native selection paint |
| observed | Plite package Bun contracts: approximately 156 `.spec`/`.test` outside React; 9 `.slow` separately | `pnpm plite:test`; focused `pnpm --filter plitejs test:partition:<partition>`; package `test:bun` | Bun/happy-dom | Yes / yes | Core document, changes, history, schema, DOM bridge and input contracts; browser state is emulated |
| observed | Plite React contracts: 92 files | `pnpm --filter plitejs test:react` → `vitest run --config ./vitest.config.mjs` | jsdom | Yes through Plite partitions / yes | Mounted React behavior, effects, providers, stores, synthetic composition/selection and DOM mutation; no actual layout or OS input |
| observed | Shared browser helper tests: 4 files | `pnpm --filter @platejs/test test:dom`; narrow `pnpm plite:browser:test:selection` | Vitest browser mode, headless Chromium via Playwright | Yes through `@platejs/test` browser partition / yes | Actual DOM selection, browser keyboard, native event trace and zero-width behavior; no OS IME |
| observed | Shared non-browser helper contracts: 18 files under `packages/test/test` | `pnpm --filter @platejs/test test`; `test:node`, `test:react`, `test:proof` are focused scripts | Bun/happy-dom | Yes / yes | Harness behavior and proof/receipt validation; receipt-validator tests do not perform device input |
| observed | CLI tests: 6 `.test` files | `pnpm --filter @platejs/cli test` → `bun test src test`; separate `test:performance` | Bun/Node subprocesses, no browser | Yes / yes | Generated files, migration/dependency behavior, subprocess outputs; not editor interaction |
| observed | www app browser suite: 68 spec files | `pnpm --filter www test:www-browser:chromium` / `:firefox` / `:webkit` | Desktop Chromium, Firefox, Playwright WebKit | No / no configured app-suite CI invocation found | Actual layout, DOM selection, browser keyboard, focus, clipboard, pointer/DnD, scroll and errors; synthetic/CDP composition only |
| observed | Plite app browser suite: 58 spec/test files; donor subset 48 | `pnpm --filter plite test:plite-browser`; narrow `:chromium <file>` or `:project -- <project>`; root `pnpm check:plite:browser-matrix` | Chromium, Firefox, Pixel 5 Chromium emulation; Darwin adds desktop WebKit and iPhone 13 WebKit proxy | No / yes Chromium when affected planner selects browser proof; others manual-dispatch CI only | Actual layout, native DOM selection, browser keyboard, focus, clipboard, pointer/DnD, scroll, errors; emulated touch and composition proxies |
| observed | Legacy/root e2e: 10 files | `pnpm e2e` → Playwright `tooling/config/playwright.config.ts` | Desktop Chromium, Firefox, WebKit; mobile projects commented out | No / no; `ci.yml` e2e step commented out | Browser interactions, layout, selection, keyboard, DnD and errors where asserted; two retries in CI config |
| observed | Native desktop IME: 1 file, parameterized anchors, repeatEach 5 | `pnpm --filter www exec playwright test --config playwright.native-ime.config.ts` | Native Chrome on macOS with OS Simplified Pinyin input source | No / no configured invocation found | Trusted OS keys/composition, native/model/view selection, screen capture and caret-paint classifier; scoped to homepage and named input method |
| observed | Android device lane: 7 `.device.ts` files, repeatEach default 5 | `node tooling/device/android.mjs setup`, `calibrate`, `doctor`, then `pnpm --filter plite exec playwright test --config playwright.device.config.ts` | Connected Android serials, Chrome and actual Gboard touches; documented evidence uses emulator | No / no configured invocation found | Touch, soft keyboard, actual English/Korean composition/autocorrect, selection and event witnesses; rejects DevTools input replays |
| observed | Raw Android/iOS release proof validator: 1 executable, 16 scenario definitions | `pnpm test:mobile-device-proof`; required receipts `pnpm test:mobile-device-proof:raw` | Reads externally produced Android/iOS direct-Appium receipt bundle; does not launch an iOS input runner | No / no configured invocation found | Validates commit-bound receipts, video/screenshot hashes and claimed scenario scope; default mode explicitly reports narrower proof |
| observed | Browser perf specs: 4 files, already included in app totals | Plite `:chromium authored-performance.spec.ts` / `authored-mounted-performance.spec.ts`; www `test:www-browser:chromium tests/browser/runtime-read-performance.spec.ts` / `suggestion-performance.spec.ts` | App Playwright projects, with individual capability/engine gates | Plite no/check, yes affected Chromium CI; www no/no | Mounted work, renders, reads, latency and browser state under the specific assertion; not all native user journeys |
| observed | www Puppeteer perf: 3 runner scripts | `pnpm --filter www perf:editor`, `perf:editor:public`, `perf:table`, `perf:homepage-input` | Puppeteer Chrome browser; homepage/table launch headless | No / no configured invocation found | Browser mount/input/selection timings, DOM counts, heap/render/trace data and workload correctness; not real OS IME or device input |
| observed | Canonical benchmark target runner: 54 target definitions | `pnpm bench:targets:list`; `pnpm bench:targets:run <target-id>`; root aliases `plite:bench:targets:*` | Target-specific Bun/Node, React contracts, browser traces and replay | Inventory/report checks yes; measurements not wholesale CI | Target-specific model correctness, timing, heap, render breadth, native browser typing/paint boundaries where implemented |
| observed | Separate `benchmarks/editor` npm project | `pnpm bench:editor:check`, `bench:editor:fuzz`, `bench:editor:bench`, `bench:editor:full`, `bench:editor:startup`, `bench:editor:package` | Node model/fuzz/package checks, plus separate browser benchmark scripts | No full-project gate / no configured full-project invocation found | Model fuzz, normalization/query/transform costs, import/package size; selected separate browser benchmark scripts |

**observed:** Root preload is `bunfig.toml` → `config/plite-source-aliases.ts` and `tooling/config/bunTestSetup.ts`. The latter registers happy-dom before React loads, disables script/child-frame loads, and provides emulated DOM/testing globals. `config/plite-source-test-setup.ts` additionally installs source aliases and JSX setup. Plite React's `packages/plitejs/vitest.config.mjs` selects jsdom and `test/react/vitest-setup.ts`. These are different environments, not two real-browser lanes.

**observed:** `tooling/config/test-suites.mjs` excludes app Playwright suites from the root aggregate and excludes Plate/Plite packages from the fast aggregate; package partitions supply those tests. Node routing covers `.agents/rules`, `tooling/scripts`, app runner contracts, Oxlint's RuleTester and two benchmark measurement contracts. Example Node test: `tooling/scripts/check-plite.test.mjs`. Root Bun example: `apps/www/src/__tests__/package-integration/ai-utils/aiCommentToRange.spec.tsx`. Package representatives: `packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.spec.tsx`, `packages/plitejs/test/slice-fit-contract.test.ts`, `packages/plitejs/test/react/android-input-manager-contract.test.ts`, `packages/test/test/browser/selection.browser.test.ts`, `packages/test/test/proof/raw-mobile-proof.test.ts`, `packages/cli/test/generate.test.ts`.

**observed:** Browser representatives are `apps/www/tests/browser/selection-edge-scroll.spec.ts`, `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts`, `tooling/e2e/homepage-dnd.test.ts`, `apps/www/tests/native/homepage-ime.native.ts`, and `apps/plite/tests/device/korean-placeholder.device.ts`. Performance representatives are `apps/plite/tests/plite-browser/authored-mounted-performance.spec.ts`, `apps/www/tests/browser/runtime-read-performance.spec.ts`, `apps/www/scripts/run-homepage-input-perf.mts`, `benchmarks/editor/benchmarks/plite-command-dispatch-benchmark.test.ts`, and `benchmarks/editor/test/fuzz/core-fuzz.mjs`.

**observed:** `packages/test/turbo.json` test depends on `test:partition:browser`; `tooling/scripts/run-entrypoint-task.mjs` dispatches that partition to Vitest Chromium and `entrypoint-turbo.mjs` selects `.test`/`.spec` files under its browser owner. This contradicts `tooling/scripts/check.mjs`'s manual-only description saying no CI job runs `plite:browser:test:selection`. The selection alias is not itself invoked, but the same file belongs to the configured browser partition.

| Status | Surface | Existing observation and limit |
| --- | --- | --- |
| observed | Real layout / scroll | App Playwright, Vitest Chromium and Puppeteer can read actual boxes/offsets. `selection-edge-scroll.spec.ts` and `selection-drag-scroll.spec.ts` target live scroll behavior. happy-dom/jsdom do not establish real layout. |
| observed | Real DOM selection | Browser helpers and app suites inspect `window.getSelection()`, native endpoints, direction and model agreement. Some tests seed selection programmatically; only the actually driven gesture is native proof. |
| observed | Native keyboard | Desktop Playwright keys reach the browser input path. Native macOS IME uses OS key delivery. Android uses Gboard touches. `page.keyboard.type` on an emulated phone is not a phone soft-keyboard test. |
| observed | Real IME | Native macOS Pinyin and local Android Gboard lanes exist. `homepage-ime.spec.ts` uses Chromium CDP; mobile WebKit proxy constructs `InputEvent`; neither proves OS candidate UI. |
| observed | Touch | Pixel 5 and iPhone 13 projects provide emulation; only Android device cases drive the actual documented soft-keyboard/touch path. |
| observed | Clipboard | Chromium/Firefox app projects use harness transport `native`; WebKit/mobile use `event`. www `clipboard.spec.ts` has distinct native/synthetic cases. The transport annotation matters. |
| observed | Drag image | www `dnd.spec.ts` wraps `DataTransfer.prototype.setDragImage` and asserts DOM preview text, child count, nonzero size and source-relative top while held. This reads the supplied image element, not screen pixels of the OS ghost. |
| inferred | Actual ghost paint | No reviewed runner captures/classifies the OS-composited drag ghost itself. DOM preview correctness alone can miss its paint or offset. This is a bounded negative finding, not proof about every unreviewed test body. |

**observed:** `apps/plite/playwright.config.ts` limits iPhone WebKit to `mobile-input-proxy.test.ts`; it is not the whole suite on iOS. `.github/workflows/plite-ci.yml` runs Firefox/mobile Linux and WebKit/mobile-WebKit macOS jobs only on `workflow_dispatch`. Normal affected changes fan out Chromium four ways. All app configs above except legacy e2e set retries to zero.

**observed:** Soak scripts under `tooling/plite/donor/proof/yjs-*.mjs` are explicitly manual-only in `commands.md`, only when requested. They are not root/CI acceptance gates. Benchmark inventory checks are not benchmark execution; no measurements were produced here.

## 2. Verify skill and proof ownership

**observed:** `.agents/rules/verify/SKILL.md` is absent from the discovered source set. The actual generated skill is `.agents/skills/verify/SKILL.md`, whose metadata names `.agents/rules/verify.mdc` as source. Its references exist under `.agents/rules/verify/references/` and mirrored skill references. The skill and all nine rule references were read across bounded calls: `commands.md`, `testing.md`, `testing-audit.md`, `test-packages.md`, `editor-proof.md`, `regression-oracles.md`, `hand-drive.md`, `cli.md`, `potion-yjs.md`.

| Status | Claim | Assigned proof owner / required evidence |
| --- | --- | --- |
| observed | Caret | Native browser on exact route; model + native DOM selection + focus + next valid edit. Visible caret is independent paint evidence. Click-caret paint also needs immediate click-to-pixel capture before another input, with positive/absent/duplicate classifier controls. Exact Chrome binary for geometry/paint claims. |
| observed | Selection | Package/model contract plus real browser layer. Native text, direction/endpoints where stable, model/view agreement, focus, no double highlight, follow-up edit and undo/redo selection. Vertical extension includes reverse movement and an independent oracle; complete/virtualized parity alone is insufficient. |
| observed | IME | Composition lifecycle, beforeinput/input data, target ranges where exposed, native selection and kernel trace. Real OS/device/deterministic platform-IME lane for raw claims. CDP, synthetic composition and Firefox direct-insert composition have explicitly narrower scope. |
| observed | Mobile | Emulation owns viewport and semantic/touch proxy claims. `apps/plite/tests/device` owns scoped Android Chrome/Gboard proof. Raw release Android/iOS requires exact-source receipts and device/OS artifacts; local device proof does not satisfy the direct-Appium raw gate. |
| observed | Clipboard | The native transport and actual rendered outcome; native Chrome/profile for clipboard-specific interactive QA. Chromium/Firefox `native`, WebKit/mobile `event`; model `insertData` is not native copy/paste. |
| observed | Drag / pointer / scroll | Actual event target, held-button state and pointer phase; cursor/preview/model/native selection are separate oracles. Boundary autoscroll needs actual boundary exit, liveness through missing range, stable scroll owner, visible movement and release/blur cleanup. Final drop state alone does not prove held behavior. |

**observed:** The completion boundary says model tests, detached transforms, alternate routes, synthetic clicks and model-set selections can diagnose without proving native input, mounted focus consumer, paint or event ordering. A demo/block/docs wrapper cannot certify the reporter's named route. Fake-runtime contracts cannot certify native browser behavior. jsdom does not establish visibility, inert/modal/slot behavior, layout or scrolling (`commands.md`).

**observed:** `hand-drive.md` requires an agent hand drive for every browser-visible change even after green Playwright. Screenshots must be opened and inspected. A drive-found drift closes with a test that fails on old code and passes on the fix. `hand-drive.mjs check` records freshness, width/theme and reported errors; it cannot verify someone looked, cannot prove native input, and does not itself read drift rows. Its default checked cells are desktop light; phone/narrow preview/dark evidence is separate.

**observed:** Native/lifecycle/selection/focus/DnD/device proof requires five warm runs without retries, one failure retaining the case. Serving-source identity, actual route and uncached execution matter. These are existing closure rules, not evidence that every historical fix followed them.

## 3. P1: Plite examples versus Slate

**observed:** Both apps expose exactly these route-file owners: `apps/plite/src/app/examples/plite/page.tsx`, `apps/plite/src/app/examples/plite/[example]/page.tsx`, `apps/www/src/app/(app)/examples/plite/page.tsx`, and `apps/www/src/app/(app)/examples/plite/[example]/page.tsx`. Both index pages redirect to `/examples/plite/richtext`. Both dynamic pages validate against the shared registry and generate static params. `apps/plite` imports www example owners; it is not a second independent implementation.

**observed:** Shared registry: `apps/www/src/app/(app)/examples/plite/plite-example-registry.ts`. Its 44 registered paths, each reachable as `/examples/plite/<path>` through both route owners, are:

| Status | Route suffix (both apps) | Registry classification | Navigation |
| --- | --- | --- | --- |
| observed | `android-tests` | upstream | hidden |
| observed | `decorations-async` | new | hidden |
| observed | `authored-changes` | new | visible |
| observed | `check-lists` | upstream | visible |
| observed | `code-highlighting` | upstream | visible |
| observed | `collaboration-demo` | new | hidden |
| observed | `comment-mode` | new | visible |
| observed | `content-completion` | new | hidden |
| observed | `cross-editor-drag` | new | hidden |
| observed | `custom-placeholder` | upstream | visible |
| observed | `document-state` | new | visible |
| observed | `dom-coverage-boundaries` | new | hidden |
| observed | `editable-voids` | upstream | visible |
| observed | `embeds` | upstream | visible |
| observed | `external-text` | new | visible |
| observed | `forced-layout` | upstream | visible |
| observed | `hidden-content-blocks` | new | visible |
| observed | `hovering-toolbar` | upstream | visible |
| observed | `huge-document` | upstream | visible |
| observed | `images` | upstream | visible |
| observed | `inline-void-drag` | new | hidden |
| observed | `inlines` | upstream | visible |
| observed | `linting` | new | visible |
| observed | `markdown-preview` | upstream | visible |
| observed | `markdown-shortcuts` | upstream | visible |
| observed | `mentions` | upstream | visible |
| observed | `multi-root-document` | new | visible |
| observed | `persistent-annotation-anchors` | new | hidden |
| observed | `pagination` | experimental | visible |
| observed | `paste-html` | upstream | visible |
| observed | `plate-dnd-cross-editor` | new | hidden |
| observed | `plate-schema-descriptors` | new | hidden |
| observed | `plaintext` | upstream | visible |
| observed | `read-only` | upstream | visible |
| observed | `iframe` | upstream | visible |
| observed | `richtext` | upstream | visible |
| observed | `schema-reconfiguration` | new | hidden |
| observed | `search-highlighting` | upstream | visible |
| observed | `shadow-dom` | upstream | visible |
| observed | `styling` | upstream | visible |
| observed | `synced-blocks` | new | visible |
| observed | `tables` | upstream | visible |
| observed | `yjs-collaboration` | new | visible |
| observed | `yjs-hocuspocus` | new | visible |

**observed:** The registry's 23 `UPSTREAM_PLITE_EXAMPLE_PATHS` are `android-tests`, `check-lists`, `code-highlighting`, `custom-placeholder`, `editable-voids`, `embeds`, `forced-layout`, `hovering-toolbar`, `huge-document`, `images`, `inlines`, `markdown-preview`, `markdown-shortcuts`, `mentions`, `paste-html`, `plaintext`, `read-only`, `iframe`, `richtext`, `search-highlighting`, `shadow-dom`, `styling`, `tables`. `getPliteExampleStatus` returns experimental for pagination first, otherwise new for a slug absent from that array. `plite-examples-shell.tsx:182` renders a `bg-blue-500` round dot with `data-editor-example-new-dot` and title New only for new entries. Hidden entries stay registered but are removed from navigation. `donor/examples/example-navigation.test.ts` asserts ten visible new-dot slugs; pagination has a separate experimental badge.

**observed:** The donor directory has 46 example `.test.ts` files plus `stress/generated-editing.test.ts` and `stress/replay.test.ts`, a stress helper and tsconfig. It contains local Playwright behavior assertions, including plain typing, formatting, selection/caret, native input traces, HTML paste/copy, IME proxies, void/inline/root boundaries, shadow/iframe, hidden/materialized DOM, table navigation, DnD, huge-document virtualization, collaboration and seeded stress/replay. It has grown beyond Slate-equivalent examples.

**observed:** Twenty-two upstream-marked example slugs have direct namesake donor files, except custom-placeholder is `placeholder.test.ts`. `android-tests` has query-control coverage in `query-controls.test.ts`, and device behavior is in the separate device lane. The remaining 24 example files cover Plite/Plate additions or cross-cutting proof: async decorations, collaboration-demo, comment-mode, cross-editor drag, document state, DOM boundaries/integrity, example navigation, external text, hidden content, linting, mobile proxy, multi-root, bidi, pagination, persistent anchors, Plate DnD/schema descriptors, query controls, schema reconfiguration, synced blocks, visual native selection, Yjs and Hocuspocus.

**inferred:** These are ports/extensions of the Slate example behavior surface, not a live differential oracle. The reviewed bodies navigate local `/examples/plite/...`, then assert literal expected text, structure, selection, geometry, traces or parity between local modes. Search found no donor navigation to a Slate reference URL or invocation of `../slate` as a comparison peer. A literal expectation is not evidence that somebody recorded the corresponding upstream result. The verification rules permit live/captured Slate reference evidence when behavior is disputed, but that is a manual proof recipe.

**observed:** Representative tests: `plaintext.test.ts` asserts typed text in DOM and model, native input trace shape and selection behavior; `example-navigation.test.ts` asserts narrow viewport overflow and registry markings; generated stress uses seeded cases, model/commit/native/render assertions and emitted replay artifacts; replay explicitly skips without `STRESS_REPLAY`. These do not launch Slate alongside Plite.

**observed:** Sibling `/Users/zbeyens/git/slate` exists. `git ls-files --cached --others --exclude-standard site/examples` lists 24 example basenames in both JS and TS: `android-tests`, `check-lists`, `code-highlighting`, `custom-placeholder`, `editable-voids`, `embeds`, `forced-layout`, `hovering-toolbar`, `huge-document`, `iframe`, `images`, `inlines`, `markdown-preview`, `markdown-shortcuts`, `mentions`, `paste-html`, `plaintext`, `read-only`, `richtext`, `scroll-into-view`, `search-highlighting`, `shadow-dom`, `styling`, `tables`. Also present: `Readme.md`, JS/TS `components/index`, `utils/environment`, `utils/normalize-tokens`, and TS `custom-types.d.ts`. `scroll-into-view` is absent from the 23-entry upstream registry array. Only sibling inventory was read, not example implementations.


**observed:** Donor file map below is derived from local route literals and initial titles, not a full body/skip audit. Prefix for every file is `apps/plite/tests/plite-browser/donor/`. Parameterized routes can extend the literal list.

| Status | File | Literal local example routes | Representative title/family |
| --- | --- | --- | --- |
| observed | `examples/check-lists.test.ts` | check-lists | checks the bullet when clicked |
| observed | `examples/code-highlighting.test.ts` | code-highlighting | code highlighting |
| observed | `examples/collaboration-demo.test.ts` | collaboration-demo, plaintext | proves independent peers, cursors, reconnect, history, schema, and teardown |
| observed | `examples/comment-mode.test.ts` | dynamic/shared helper route | allows real pointer selection to add a comment in the read-only editor |
| observed | `examples/cross-editor-drag.test.ts` | cross-editor-drag | cross-editor selected-text drag |
| observed | `examples/decorations-async.test.ts` | dynamic/shared helper route | async decorations |
| observed | `examples/document-state.test.ts` | dynamic/shared helper route | keeps focus in the title input while writing a state field |
| observed | `examples/dom-coverage-boundaries.test.ts` | dynamic/shared helper route | keeps hidden content out of native find until materialized |
| observed | `examples/dom-integrity.test.ts` | dynamic/shared helper route | external DOM corruption is repaired from the model without moving selection |
| observed | `examples/editable-voids.test.ts` | editable-voids | editable voids |
| observed | `examples/embeds.test.ts` | embeds | contains embeded |
| observed | `examples/example-navigation.test.ts` | richtext | example navigation metadata |
| observed | `examples/external-text.test.ts` | external-text | external text |
| observed | `examples/forced-layout.test.ts` | forced-layout | checks for the elements |
| observed | `examples/hidden-content-blocks.test.ts` | dynamic/shared helper route | keeps active tab panel spacing stable when switching tabs |
| observed | `examples/hovering-toolbar.test.ts` | hovering-toolbar | hovering toolbar appears |
| observed | `examples/huge-document.test.ts` | dynamic/shared helper route | renders huge document without child-count chunking |
| observed | `examples/iframe.test.ts` | iframe | iframe editor |
| observed | `examples/images.test.ts` | images | contains image |
| observed | `examples/inlines.test.ts` | inlines | contains link |
| observed | `examples/linting.test.ts` | dynamic/shared helper route | linting |
| observed | `examples/markdown-preview.test.ts` | dynamic/shared helper route | markdown preview |
| observed | `examples/markdown-shortcuts.test.ts` | markdown-shortcuts | contains quote |
| observed | `examples/mentions.test.ts` | mentions | renders mention element |
| observed | `examples/mobile-input-proxy.test.ts` | plaintext | synthetic mobile beforeinput proxy |
| observed | `examples/multi-root-document.test.ts` | dynamic/shared helper route | keeps shifted body bindings and follow-up typing rooted after a prefix split |
| observed | `examples/navigation-bidi.test.ts` | plaintext, richtext | browser-native mixed-bidi caret proof |
| observed | `examples/pagination.test.ts` | dynamic/shared helper route | keeps page chrome separate and switches one editable host between complete and virtualized pages |
| observed | `examples/paste-html.test.ts` | paste-html | pasted bold text uses <strong> |
| observed | `examples/persistent-annotation-anchors.test.ts` | dynamic/shared helper route | keeps the annotation anchor attached across fragment insert, text insert, and clear |
| observed | `examples/placeholder.test.ts` | custom-placeholder | renders custom placeholder |
| observed | `examples/plaintext.test.ts` | plaintext | inserts text when typed |
| observed | `examples/plate-dnd-cross-editor.test.ts` | plate-dnd-cross-editor | Plate cross-editor block drag |
| observed | `examples/plate-schema-descriptors.test.ts` | dynamic/shared helper route | compiles Plate element and mark descriptors into HTML parsing, rendering, and Markdown clipboard bindings |
| observed | `examples/query-controls.test.ts` | dynamic/shared helper route | stores search highlighting control state in the URL |
| observed | `examples/read-only.test.ts` | read-only | readonly editor |
| observed | `examples/richtext.test.ts` | plaintext, richtext | renders rich text |
| observed | `examples/schema-reconfiguration.test.ts` | dynamic/shared helper route | publishes schema-only behavior atomically across primary, named, and projected roots |
| observed | `examples/search-highlighting.test.ts` | dynamic/shared helper route | search highlighting |
| observed | `examples/shadow-dom.test.ts` | shadow-dom | renders Plite editor inside nested shadow |
| observed | `examples/styling.test.ts` | styling | applies styles to editor from style prop |
| observed | `examples/synced-blocks.test.ts` | dynamic/shared helper route | smoke renders synced copies around normal paragraphs |
| observed | `examples/tables.test.ts` | tables | table tag rendered |
| observed | `examples/visual-native-selection-smoke.test.ts` | dynamic/shared helper route | visual native selection smoke |
| observed | `examples/yjs-collaboration.test.ts` | yjs-collaboration | maps Plite history across offline and remote edits |
| observed | `examples/yjs-hocuspocus.test.ts` | plaintext, yjs-hocuspocus | owns transport lifetime while the binding preserves admitted offline work |
| observed | `stress/generated-editing.test.ts` | dynamic/shared helper route | ${stressCase.route} ${stressCase.family} |
| observed | `stress/replay.test.ts` | dynamic/shared helper route | replays a generated browser stress artifact |

## 4. P2: stable docs examples versus beta

**observed:** Beta source is `content/docs` through Fumadocs (`apps/www/src/lib/source.ts`, generated `collections/server`). Source-to-route normalization removes parenthesized groups and `.cn`, mapped by `apps/www/src/lib/docs-routes.ts`. Docs `doc-page.tsx` also generates `/docs/examples/<name-without-demo>` from `registryExamples`, selecting actual registry components and previews. Registry source combines `examples`, `demoExamples` and `internalExamples` in `apps/www/src/registry/registry-examples.ts`; actual demo sources and values live in `apps/www/src/registry/examples/`.

| Status | Denominator | Static count / meaning |
| --- | --- | --- |
| observed | All docs MDX | 327 source files across English and Chinese, not all example pages |
| observed | `content/docs/examples` | 14 MDX files, seven English/Chinese pairs: collaboration-example, editable-voids, export, huge-document, hundreds-editors, preview-markdown, version-history |
| observed | Example navigation | 49 entries in `content/docs/meta.json` → `_plate.categoryGroups.example`; index renders `NavItemsGrid category="example"` |
| observed | Active registry example items | 82 unique names after excluding the commented `exit-break-text-demo` entry; each is used in docs static params, including internal examples |
| observed | Registry example `.tsx` files | 158 including values and other support; not 158 pages |
| inferred | Union of source-defined English example routes | 86: 82 normalized registry slugs + MDX-only collaboration-example/export + app-only html-export/server-side; huge-document overlaps. This is a static union, not an HTTP/rendered reachability audit. |

**observed:** Custom English app pages are `/docs/examples`, `/docs/examples/html-export`, `/docs/examples/huge-document`, `/docs/examples/server-side`; Chinese custom pages are index/html-export/server-side. Docs source parity explicitly accounts for app-only routes. A custom route can override MDX, so counting only MDX misses pages and counting both can duplicate them.

**observed:** `html-export` is current: `apps/www/src/app/(app)/docs/examples/html-export/page.tsx` renders `BlockDisplay` for registry example `html-export`; corresponding Chinese page exists. Implementation: `apps/www/src/registry/blocks/html-export/page.tsx`, `components/editor/html-export.tsx`, `html-export-kit.ts`, `html-export-schema-kit.ts`; unit test `blocks/html-export/html-export-kit.test.ts`. Verify says this block reads `public/tailwind.css`, and its download needs Chrome plus saved-file inspection.

**observed:** No current discoverable file path contains `slate-to-html`; repository-wide bounded text search found only `docs/plans/2026-05-23-shadcn-docs-restart-comparison.md:1044`, describing an older `blocks/slate-to-html`/Plite-to-HTML special page. That historical note does not establish a current route alias or verified rename chain.

**observed:** Search across app tests/scripts and tooling found release metadata stable/beta comparisons, but no stable docs URL versus beta docs URL replay test. `check-docs-source-parity.mts` checks local source/generated registry/routes/links; `tooling/scripts/plate-doc-examples.test.mjs` executes local static/Markdown snippets. Neither compares stable editor behavior with beta behavior.

**inferred:** P2 currently has local correctness and source-parity checks, not a paired stable/beta behavior harness. P1 has the analogous gap for Slate versus Plite. Performance targets can compare Slate workloads; that is not whole-example behavior comparison.

## 5. Existing manual-testing aids and bug-to-test path

**observed:** `docs/editor-behavior/` currently contains `markdown-editing-spec.md` and `current-evidence.md`. The latter preserves links to retired matrices at `c70bacbd4a` and distinguishes current proof from matrix-era tested/specifed/partial/deferred labels. A replacement owner does not inherit historical tested status. It records current gaps and limits, including native OS caret paint and touch drag as unverified; those are documentation statements, not fresh execution findings here.

**observed:** `markdown-editing-spec.md`'s Required Scenario Shape requires block family, nesting, selection shape, trigger, structural result, cursor result, parse/serialize and streaming effects where relevant. Its TDD Rule forbids locking a rule without mapping or adding a test; tests use stable spec IDs and proof ownership links. This is a scenario/spec aid rather than a single runnable human acceptance checklist.

**observed:** `editor-proof.md` has a scenario generator with topology, viewport/rendering, gesture, assertion, native-parity and selection-direction axes. Concrete manual actions include paragraph/cell/margin/corner clicks, bursts of typing/Enter, double-click, cross-line/page drag selection, undo/redo, copy/paste/select-all, scroll away/back and resumed typing. Selection scenarios preserve model/native/visible state and next edits, including reverse movement and sibling topology.

**observed:** `docs/editor-test-harvester/` has inventory/report/test-index corpora for Lexical, Meowdown, Portable Text, ProseKit, ProseMirror, Slate, TipTap, Wordgard and Yjs collaboration. Portable Text additionally has source routing; TipTap has portable-mixed routing; Wordgard has refresh/inventory scripts and receipt. Reports extract portable behavior families, classify harness/product policy versus substrate, assign Plite/Plate owners, and name proof layers and focused commands. For example ProseMirror PM-13 says DOM coordinates/wrapped lines/bidi require real-browser proof; PM-10 separates composition/runtime contracts from browser/IME transport; PM-11 separates clipboard round trips from browser copy/paste. These are research/mapping artifacts, not evidence all cases run today. Several rows still cite old `packages/plite-*` owners, so current commands need owner resolution.

**observed:** `.agents/rules/maintainer/references/issue-draft.md` owns Beta intake. It accepts text, one failure video, or main/next comparison videos; records exact route/action, expected authority, actual result, known environment/build and unknown facts. Two-video branch assignment uses verified labels or explicitly inferred behavior mapping. It preserves both videos, timestamps, caveats and duplicate checks, writes a local title/body first, and uses `[Beta]: ` on `udecode/plate`. Publication occurs only within existing user authorization and includes attachment/issue readback.

**observed:** `.agents/playbooks/bug-fix.md` treats recordings/screenshots as the report, routes public issues through Maintainer, reproduces on the matching route, and uses a detached main baseline for a regression-vs-main claim. It diagnoses the owning invariant, requires same-surface verification and hand drive, and lands a first-written regression test together with its fix. The owner commits; a PR is opened only when asked. Its failed-fix recovery revokes prior green claims, freezes bytes, attributes product/transport/host/oracle failure and repairs the escape mechanism before another attempt.

**observed:** The documented human-find path is: report/evidence → Maintainer draft/triage when public → exact route repro and baseline → owning invariant diagnosis → regression at the smallest boundary that can observe it → repair → same reporter interaction, browser proof where required, five stability runs for native risk, and hand drive → test and fix land together with applicable changeset. A hand-drive drift specifically needs old-code red and final-code green logs. These documents define the path; this lane did not inspect landed regression commits or prove historical compliance.

### Three largest uncovered surfaces

1. **inferred:** Physical iOS/Safari editing and the broader mobile input surface remain outside the executable local lane found here: real software keyboard candidate UI, native selection handles, touch-drag/autoscroll and device clipboard. **observed:** The local device implementation is Android; iPhone WebKit is one synthetic proxy suite; raw iOS support is a receipt validator requiring an external producer. Android proof is explicitly scoped to recorded emulator/Gboard versions and does not establish OEM/physical-phone coverage (`editor-proof.md`, device config, raw proof script).
2. **inferred:** OS-composited drag-image paint is unobserved by the reviewed automated proof. **observed:** `dnd.spec.ts` reads `setDragImage` input DOM/geometry, not the ghost pixels; it cannot alone establish the actual ghost's position, clipping or paint. Native DnD itself does have tests, so this gap is specifically the drag image's screen appearance.
3. **inferred:** Paired reference behavior across complete examples is unobserved: Slate versus Plite and stable Plate docs versus beta. **observed:** Donor tests assert local expectations; local docs parity validates source/route relationships; no paired reference-page interaction runner was found in the searched tests/scripts. A changed expectation can therefore stay green while diverging from the intended comparison target. This negative finding is bounded by the partial test-body coverage below.

### Coverage / limits of this evidence read

**observed:** `package.json` root/apps/plite/apps/www and relevant package runner scripts: fully read or script objects extracted in full; preloads/configs/test-suites and `check.mjs`: fully read. `.agents/skills/verify/SKILL.md` and all nine rule references: fully read across calls; nonexistent rules `SKILL.md`: not read because discovery found the skill/source instead. `.github/workflows/ci.yml` and `plite-ci.yml`: fully read; other workflows: partly, runner/command grep and file inventory only, because the lane concerns test invocation.

**observed:** `apps/www/tests` and `apps/plite/tests`: fully inventoried, partly read (configs, native/device/proxy setup and representative assertions). `donor/`: all file names, line counts, route strings and initial test-title extracts inspected; representative plaintext setup, navigation and replay bodies inspected, but large richtext/paste/void/selection/stress/helper bodies not fully read. Therefore no claim of assertion-by-assertion coverage or all skips audited. Perf suites: script/target inventories, commands and representative launch/measurement definitions partly read; 54 target bodies and every correctness runner not audited. No runner executed.

**observed:** Both P1 route directories: all route page files fully read; registry fully read; shell blue-dot branch read; example implementations/loaders mostly not read because the lane maps routes and comparator ownership. `../slate/site/examples`: full tracked/untracked file inventory read, implementations not read. P2 `content/docs`/registry: full file inventory, registry name extraction and route generation read; relevant MDX frontmatter/preview sections and custom html-export page read; all docs/example implementations not read. The 86 union is inferred from source, not rendered proof.

**observed:** `docs/editor-behavior`: partly read (scenario shape, statuses, proof map/gaps, heading/family inventory and TDD rule); the 4,097-line spec and every long evidence row were not fully read. `docs/editor-test-harvester`: partly read (all corpus file inventories/headings, selected classification/proof/matrix/routing sections and Slate report); large test indices and every donor source body not read because they are research corpora rather than current runners. `issue-draft.md` and `bug-fix.md`: fully read across calls. No prior session, live issue or landed-fix history read; this lane maps the documented present workflow only.

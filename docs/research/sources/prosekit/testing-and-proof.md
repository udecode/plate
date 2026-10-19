# ProseKit: testing and proof

## What ProseKit's tests are good for

- **Donor, not oracle.** ProseKit (`prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e`, harvested 2026-08-21) is a donor for Plate API ergonomics and headless UI. It is not an oracle for core editing behavior; most of its tests belong to Plate features. Worth taking: its one strong test shape, the lifecycle of a blurred selection around nested editables; the habit of browser-testing headless UI against real editor state; and its extension ergonomics as pressure on call sites. Not Plite requirements: ProseMirror positions, transactions, plugins, NodeViews, MIME formats and gap-cursor machinery, framework-adapter multiplication, or a staged Mod-A default (`docs/editor-test-harvester/prosekit/report.md:10-15`, 175-187).

## Harvest preconditions

- **License.** ProseKit is MIT-licensed at `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:LICENSE` (Copyright (c) 2023 ocavue), and the package.json files of its core, extensions and web packages declare `"license": "MIT"`, for example `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/core/package.json` at line 11. A test copied or adapted from ProseKit keeps that copyright and permission notice (`docs/editor-test-harvester/prosekit/report.md:5-6`, 48-56).

## Browser and device limits

- **Chromium only.** ProseKit's shared Vitest browser config, `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/config-vitest/src/config-vitest.js` (lines 30 and 40), runs Chromium with `hasTouch: true`, which adds synthetic touch to that Chromium context. Its suite is therefore no proof for Firefox, WebKit, iOS or real devices, and the Safari and WebKit comments in its autocomplete, resizable, block-handle and inline-popover source are leads, not tested claims. Plite's own lanes cover what it cannot: `apps/plite/playwright.config.ts` runs Chromium, Firefox and a Pixel 5 mobile project, plus on macOS WebKit and an iPhone 13 WebKit project for the mobile input proxy test; `apps/plite/playwright.device.config.ts` drives attached Android devices; and `packages/test/README.md` holds the Appium receipt gate for real Android and iOS devices. The harvest read source and tests at that revision and did not run ProseKit's suite (`docs/editor-test-harvester/prosekit/report.md:58-69`, 189-196).

## Tests with no portable behavior

- **Skip these.** Some ProseKit tests carry no editing invariant: 4 generic TypeScript helper specs, such as `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/core/src/types/simplify-union.spec.ts`, which only compares compile-time union shapes; 11 generic runtime utility specs, such as `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/core/src/utils/merge-objects.spec.ts`, which only merges plain objects; 27 harness and helper contracts, such as `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:registry/test/rtl.test.ts`, which only delegates to story consistency; and 4 product-shell smoke tests, such as `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:registry/test/full.test.ts` (`docs/editor-test-harvester/prosekit/report.md:164-171`).

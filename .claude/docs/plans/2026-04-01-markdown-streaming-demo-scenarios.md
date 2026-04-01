# Markdown Streaming Demo Scenarios

## Goal

Expand the markdown streaming demo with more preset chunk scenarios that exercise both markdown and MDX streaming boundaries.

## Scope

- Move preset scenario data out of `apps/www/src/registry/examples/markdown-streaming-demo.tsx`
- Add several new markdown and MDX chunk sets with intentionally awkward chunk boundaries
- Collapse the preset registry into one combined scenario for faster end-to-end coverage
- Add small regression tests around the scenario registry and transform smoke coverage
- Verify the new scenarios in the browser on `/blocks/markdown-streaming-demo`

## Findings

- The demo currently hardcodes `testScenarios` inside the page component file.
- The existing data file already owns playback config and the live article seed, so it is the natural place for scenario data.
- The markdown joiner already includes `MDX_TAG_PATTERN`, so MDX component-tag scenarios are part of the intended surface.
- Docs-site MDX components such as `<Steps>` and uppercase `<Callout>` are not the same contract as the editor markdown parser.
- The editor markdown parser supports Plate custom MDX tags such as `<callout>`, `<column>`, and `<column_group>`.
- `<callout type="...">` must deserialize the MDX `type` attribute into `variant`; otherwise the attribute clobbers the Slate node type.

## Plan

| Phase | Status | Notes |
| --- | --- | --- |
| Move preset scenarios into shared data | complete | Demo now imports a shared scenario registry from the data layer |
| Add markdown and MDX stress scenarios | complete | Added markdown-heavy and MDX-heavy presets with jittery chunk boundaries |
| Merge all preset content into one combined scenario | complete | Registry now exposes a single `All Scenarios Combined` preset that concatenates every scenario into one replay stream |
| Trim duplicate element coverage inside the combined scenario | complete | The merged preset now keeps one representative instance per special element type instead of replaying repeated callout/column/code/table/media sections |
| Add targeted tests | complete | Added registry + transform smoke coverage in `markdown-streaming-demo-data.spec.ts` |
| Verify with build/typecheck/lint/browser | complete | Targeted tests, `apps/www` build/typecheck/lint, and browser proof all passed for the merged single-preset version |

## Progress Log

- 2026-04-01: Moved preset scenario ownership into `apps/www/src/registry/lib/markdown-streaming-demo-data.ts` so the demo page no longer hardcodes the registry in the component file.
- 2026-04-01: Added five new presets: `Markdown Dense Mixed Content`, `Markdown HTML Details`, `MDX Callout And Steps`, `MDX Import Export And Callout`, and `MDX Fence And Checklist`.
- 2026-04-01: Added smoke coverage proving every preset transforms back to the same joined markdown text and that the registry includes both markdown and MDX scenarios.
- 2026-04-01: Verified in the persistent browser that the new options appear in the scenario dropdown and that all five new presets jump to the end state without a runtime overlay.
- 2026-04-01: An earlier `apps/www` build attempt hit an external Google Fonts fetch problem, but the later reruns for the merged scenario completed successfully.
- 2026-04-01: Added a failing regression test that deserializes the rich MDX presets with the demo editor kit and proves the broken presets were landing as plain paragraphs instead of structured nodes.
- 2026-04-01: Replaced the broken docs-site MDX examples with editor-supported custom tags and added a parser fix so `<callout type="warning">` deserializes to `type: "callout"` plus `variant: "warning"`.
- 2026-04-01: Re-verified in the persistent browser that the repaired MDX presets now produce `callout`, `column_group`, and `code_block` nodes in `Editor tree` with no literal `<Callout>` or `<Steps>` left in the output.
- 2026-04-01: Collapsed the scenario registry to one `All Scenarios Combined` preset by stitching every markdown and MDX section into one long replay stream.
- 2026-04-01: Tightened the merged-scenario spec back to parser-level guarantees after the first draft overfit brittle leaf text that was not part of the actual deserializer contract.
- 2026-04-01: Re-ran the merged single-preset checks: targeted Bun specs passed, `corepack pnpm turbo build --filter=./apps/www` passed, `corepack pnpm turbo typecheck --filter=./apps/www` passed, `corepack pnpm lint:fix` passed, and browser proof confirmed the page now exposes only `All Scenarios Combined`.
- 2026-04-01: Trimmed the combined scenario down to one representative instance per special element type and updated the spec to assert exact counts for `callout`, `column_group`, `code_block`, `table`, `file`, `audio`, `video`, `toc`, `date`, and the single markdown link/image pair.

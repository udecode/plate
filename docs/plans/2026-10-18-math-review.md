---
review_scopes: [math]
verdict: pursue
review_basis: [2026-10-04-math-audit]
work_kind: implementation
review_commit: c83502bc25dc6df9a89fe753c17563aa71b9b926
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, .agents/rules/plate-plugins/references/package-host.md, tooling/entrypoints/entrypoint-dag.mjs, packages/platejs/package.json, packages/platejs/src/math/lib/BaseEquationPlugin.ts, packages/platejs/src/math/lib/BaseEquationPlugin.spec.tsx, apps/www/src/registry/components/editor/math-static.tsx, apps/www/src/registry/components/editor/math.tsx, apps/www/src/registry/registry-features.ts, apps/www/scripts/registry-package-dependencies.mts, apps/www/scripts/registry-package-dependencies.spec.mts, tooling/scripts/check-plite-release-artifacts.mjs, tooling/scripts/check-plite-release-artifacts.test.mjs, tooling/scripts/check-package-build-artifacts.test.mjs, 'content/docs/(plugins)/(elements)/equation.mdx', 'content/docs/(plugins)/(elements)/equation.cn.mdx', docs/plans/2026-10-10-html-word-owns-word.md, packages/platejs/src/docx/export/lib/docxStaticComponents.tsx, packages/platejs/src/docx/export/lib/exportDocx.spec.ts, packages/platejs/src/utils/plate-keys.ts, packages/platejs/src/internal/plugin/markdownParagraph.ts, packages/platejs/src/utils/index.ts, packages/platejs/src/utils/plugins/ExitBreakPlugin.ts, packages/platejs/src/utils/plugins/SingleBlockPlugin.ts, packages/platejs/src/utils/plugins/SingleLinePlugin.ts, apps/www/src/registry/components/editor/fixed-toolbar.tsx, apps/www/src/registry/components/editor/floating-toolbar.tsx, apps/www/src/registry/components/editor/plugins-static.ts]
review_upstreams: ['../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da']
---

# Math: keep KaTeX out of the math plugins

Status: executed: KaTeX left the math plugins and landed on next
Topic: math
Playbook: plan

**Pursue, planned.** `platejs/math` stops importing KaTeX. One seven-line wrapper, `getEquationHtml`, makes the math entrypoint import `katex` at its top. So code that needs only the equation plugins, for Markdown, a server or a test, must install KaTeX. An unbundled import of `platejs/math` fails without it, inferred from that import. A default bundle of just the two plugins also carries KaTeX, 271201 of its 458401 bytes. An app can drop those bytes today with a bundler setting, so the size alone does not pick this target. The install, the false optional peer and the second way to draw do. The 2026-10-04 audit reached the same Pursue from reading the source, and no plan adopted it. Since 2026-10-10, Word export calls the wrapper too, to turn TeX into the MathML its converter maps to Word math. So the plan gives KaTeX to the two places that draw with it. The copied components import `katex` and its stylesheet directly, as the copied editor already does for `katex.render`. `platejs/docx/export` imports `katex` itself and owns the optional peer. `getEquationHtml`, the `platejs/math/katex.css` export and the math entrypoint's `katex` peer go. Saved documents, the plugins, `MathRules`, static HTML and Word output stay the same. The Build playbook executes it.

## Brief

### What will change?

Apps that only use the equation plugins, say for Markdown, a server or tests, don't need KaTeX anymore. Bundling just the two plugins now takes 187 kB instead of 458 kB, and none of it is KaTeX. The equation components you copy and Word export load KaTeX themselves. Nine test equations come out exactly the same as before, both on the page and in Word.

### What could go wrong?

Apps coming from the old math package that call its KaTeX helper have to install KaTeX 0.16.22 and call KaTeX themselves. The release note shows how. One release check still fails on a list of package sizes, the same way it failed before this change, so fixing that list is its own task. The pages were checked by hand in one browser only.

## Teach

An equation in Plate is a small void node that keeps its TeX source as text. The math plugins define it: the block and inline nodes, their Markdown mapping and the dollar-sign shortcuts.

Today the same file also holds a one-line helper that hands the source to KaTeX, the library that draws math. Because the helper sits beside the plugins, anything that imports the plugins loads all of KaTeX, even code that never draws an equation.

The change moves KaTeX to the two places that draw. The copied components that show equations import it, and so does Word export, which asks KaTeX for MathML to build Word equations. The plugins stay as they are, and saved documents don't change.

## Public API

The copied static element calls KaTeX itself, like the copied editor's `katex.render`.

```tsx before
// apps/www/src/registry/components/editor/math-static.tsx
import 'platejs/math/katex.css';
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  getEquationHtml,
} from 'platejs/math';

const html = getEquationHtml({
  element,
  options: {
    displayMode: true,
    errorColor: '#cc0000',
    fleqn: false,
    leqno: false,
    macros: { '\\f': '#1f(#2)' },
    output: 'htmlAndMathml',
    strict: 'warn',
    throwOnError: false,
    trust: false,
  },
});
```

```tsx after
// apps/www/src/registry/components/editor/math-static.tsx
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from 'platejs/math';

const html = katex.renderToString(element.latex, {
  displayMode: true,
  errorColor: '#cc0000',
  fleqn: false,
  leqno: false,
  macros: { '\\f': '#1f(#2)' },
  output: 'htmlAndMathml',
  strict: 'warn',
  throwOnError: false,
  trust: false,
});
```

The copied editor imports KaTeX's own stylesheet instead of the package's one-line copy.

```tsx before
// apps/www/src/registry/components/editor/math.tsx
import 'platejs/math/katex.css';
import katex, { type KatexOptions } from 'katex';
import { MathRules } from 'platejs/math';
```

```tsx after
// apps/www/src/registry/components/editor/math.tsx
import 'katex/dist/katex.min.css';
import katex, { type KatexOptions } from 'katex';
import { MathRules } from 'platejs/math';
```

Word export asks KaTeX for MathML itself.

```tsx before
// packages/platejs/src/docx/export/lib/docxStaticComponents.tsx
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  type EquationElement,
  getEquationHtml,
} from '../../../math';

return getEquationHtml({
  element,
  options: {
    displayMode,
    output: 'mathml',
    throwOnError: true,
    trust: false,
  },
});
```

```tsx after
// packages/platejs/src/docx/export/lib/docxStaticComponents.tsx
import katex from 'katex';

import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  type EquationElement,
} from '../../../math';

return katex.renderToString(element.latex, {
  displayMode,
  output: 'mathml',
  throwOnError: true,
  trust: false,
});
```

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| KaTeX HTML for static equations | Plate | copied UI, the `math-static` registry item | Drawing an equation is presentation, and copied UI owns presentation. |
| KaTeX stylesheet | Plate | copied UI, the `math` and `math-static` registry items | KaTeX ships its own stylesheet, so the package needs no copy. |
| TeX to Word MathML | Plate | `platejs/docx/export` | The Word converter maps KaTeX's own MathML, so Word export calls KaTeX itself. |
| `katex` optional peer | Plate | `platejs/docx/export` in `tooling/entrypoints/entrypoint-dag.mjs` | An optional peer belongs to the entrypoint that imports it. |
| `katex@0.16.22` install pin | Plate | the `math` and `math-static` registry items | A direct import of `katex` infers no version. |

## Hard cuts and app migration

The cut deletes:

- `getEquationHtml` from `platejs/math`.
- The `platejs/math/katex.css` export, its file and its type stub, and the path aliases that point at it.
- The `katex` optional peer on the `platejs/math` entrypoint. The package keeps `katex` as an optional peer, owned by `platejs/docx/export`.
- The copied `EquationElementDocx` and `InlineEquationElementDocx` in `math-static.tsx`, which nothing renders.

No release shipped `platejs/math`. The published `platejs@54.0.0-beta.1` exports only `.`, `./react` and `./static`. The one released name this cut removes is `getEquationHtml` from `@platejs/math`, up to its 54.0.0-beta.0. An app moving from that package adds `katex` to its own dependencies, because `@platejs/math` brought it in as a dependency, and calls `katex.renderToString(element.latex, options)` instead. Its release note says both. The stylesheet path never shipped, so no app imports it.

In this repository the cut breaks the copied `math-static.tsx` and `math.tsx` and Word export's `docxStaticComponents.tsx`, and the Public API pairs above show each edit. An app that adds the copied components through the registry gets both edits and `katex@0.16.22`. Word export still needs `katex` installed, as it does today. Saved documents do not change, because an equation node stores only its type, `latex` and children.

## Main changes

- `packages/platejs/src/math/lib/BaseEquationPlugin.ts` drops `getEquationHtml` and its `katex` import, so `platejs/math` and `platejs/math/react` load no KaTeX.
- `packages/platejs/math/katex.css` and its `./math/katex.css` export go, and the package's `sideEffects` becomes `false`. `tooling/entrypoints/workspace-source-paths.mjs` drops the stylesheet alias, and `pnpm entrypoint:turbo:generate` drops it from the six tsconfig files.
- `tooling/entrypoints/entrypoint-dag.mjs` moves the optional `katex` peer from `math` to `docx/export`, which imports `katex` directly. `packages/platejs/tsdown.config.mts` makes the build refuse `katex` in the built `dist/math/index.js` and `dist/math/react/index.js`, with the check plitejs uses to keep React out of its core.
- The copied `math-static.tsx` drops `EquationElementDocx` and `InlineEquationElementDocx`, which no app path renders since Word export writes Word math itself.
- Every rule that let a package file live outside the build output goes, because the stylesheet was its only use: the branch of `apps/www/scripts/registry-package-dependencies.mts` that accepted package exports outside the entrypoint graph, the stylesheet exemption from `./dist` in `tooling/scripts/check-package-build-artifacts.mjs`, and the stylesheet `sideEffects` list in `tooling/scripts/check-plite-release-artifacts.mjs`.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where KaTeX lives | In the copied components and Word export, so the math plugins load without it (look) | Keep KaTeX in the math plugins; or move the helper to its own KaTeX subpath | keep katex | big |
| KaTeX stylesheet | Copied components import KaTeX's own stylesheet | Keep the package's one-line stylesheet path | keep stylesheet | small |
| Word export's equations | Word export calls KaTeX itself and lists it as a package it needs | Let the app hand Word export a MathML function | mathml option | small |
| Copied Word equation components | Delete the two that print TeX as plain text, since nothing renders them | Keep them for apps that want TeX text in Word | keep docx components | detail |
| Guard against KaTeX coming back | The package build refuses KaTeX in the built math plugins, the check the core editor package already uses to keep React out | A test on the entrypoint graph; or a refusal in the published package check | packed guard | small |
| KaTeX version for copied components | Written as 0.16.22, like the registry's other pinned packages, with a test that it matches the package's KaTeX version | Read it from the docs app's version; or take it from the package's peer range for every item | version from app | detail |
| Rules for package files outside the build output | Delete them all, since only the removed stylesheet used them | Keep them for a later stylesheet or asset export | keep asset rule | detail |
| KaTeX stylesheet in the copied HTML export block | Leave its CDN link at 0.16.18 for a separate task | Move it to 0.16.22 in this change | fix html export | detail |
| Next step | Build now, since the panel reviewed the plan (look) | Hold at the plan | hold | detail |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TeX to HTML helper | `getEquationHtml` in `platejs/math` wraps `katex.renderToString` | deleted; copied static components call `katex.renderToString` | copied UI | One wrapper makes every plugin import load KaTeX. | `math-static.tsx`, `equation.mdx`, the math changeset | identity probe, lint control | apps moving from `@platejs/math` change one call | cut |
| KaTeX stylesheet | `platejs/math/katex.css` re-exports KaTeX's stylesheet | deleted; copied UI imports `katex/dist/katex.min.css` | copied UI | It is a second path to KaTeX's own file. | `math.tsx`, `math-static.tsx`, `equation.mdx`, six tsconfig files, `workspace-source-paths.mjs`, `verify.mdc` | `build:registry --check`, typecheck, grep | none; it never shipped | cut |
| `katex` optional peer | on `platejs/math` | on `platejs/docx/export` | entrypoint graph | A peer belongs to the entrypoint that imports it. | DAG; the manifest keeps `katex` | lint control, packed proof | none; Word export already needs `katex` | move |
| Word MathML | `docxStaticComponents.tsx` calls `getEquationHtml` from `platejs/math` | it calls `katex.renderToString` with the same options | `platejs/docx/export` | The converter maps KaTeX's own MathML. | `docxStaticComponents.tsx`, `docx.mdx` and its twin | identity probe, `exportDocx.spec.ts` | none | keep |
| Registry KaTeX version | derived from the math entrypoint's peer | `katex@0.16.22` written on `math` and `math-static` | registry items | A direct import infers no version. | `registry-features.ts`, `registry.test.ts` | a `registry.test.ts` case that `math` and `math-static` pin the package's `katex` version and the toolbar and slash items carry none | the literal drifts, which the test catches | move |
| Package files outside the build output | the registry inference, the build-artifact check and the release check each accept a stylesheet outside `./dist` | deleted; the build-artifact check refuses a stylesheet export outside `./dist`, and the release check refuses a stylesheet `sideEffects` list | `registry-package-dependencies.mts`, `check-package-build-artifacts.mjs`, `check-plite-release-artifacts.mjs` | Their only use was `./math/katex.css`. | the three scripts and their tests | two refusal cases that fail at base, `build:registry --check`, `pnpm plite:release:packages` | a later asset export needs them back | cut |
| Copied Word equation components | `EquationElementDocx` and `InlineEquationElementDocx` in `math-static.tsx` | deleted | copied UI | Nothing renders them; Word export has its own. | `math-static.tsx`, `equation.mdx` | grep, `build:registry --check` | an app's own copy keeps working | cut |
| KaTeX guard | the source lint checks each import against the graph | the platejs build also refuses `katex` in the built `dist/math/index.js` and `dist/math/react/index.js` | `packages/platejs/tsdown.config.mts` | The build check follows the built files and their shared chunks, and plitejs already uses it for React. It stops at a bare import such as `plitejs`, so the source lint covers a route through another package. | the platejs build config | a base build with the boundary fails, the head build passes | none | gate |

## Steps

One phase. The cut lands in one change, because a partial cut leaves docs and copied components teaching a removed export. Execution: the Build playbook, under the owner's "Verdict next", "Yes" and "So here", which run this review through its build and landing. A `pstack:poteto-agent-high` delegate writes the code of steps 1 to 4 on its own branch from `delegate-brief-b1.md` in the run directory. The lead writes the docs, release notes, agent text and registry output, merges the delegate's commits, and runs every proof.

- [x] 1. Move KaTeX out of `platejs/math`. Delete `getEquationHtml` and its `katex` import from `BaseEquationPlugin.ts`, and its test from `BaseEquationPlugin.spec.tsx`. `docxStaticComponents.tsx` imports `katex` and calls `katex.renderToString` with the same options and catch branch. The DAG drops the math peer and adds `katex` to `docx/export`. Proof: `pnpm exec oxlint` over both source files passes, where the base control with only the peer moved fails at `BaseEquationPlugin.ts:1`; `exportDocx.spec.ts` and `BaseEquationPlugin.spec.tsx` pass; `node --test tooling/scripts/entrypoint-dag-plugin.test.mjs` still passes, which checks the graph's optional peers against the manifest.
- [x] 2. Remove the stylesheet export. Delete `packages/platejs/math/katex.css` and `katex.css.d.ts`; drop `math/**/*` from `files` and the `./math/katex.css` export, and set `sideEffects` to `false`. Delete the stylesheet case in `workspace-source-paths.mjs` and run `pnpm entrypoint:turbo:generate`, which rewrites the six tsconfig files. Delete the stylesheet exceptions: `isPublicStylesheet` in `check-package-build-artifacts.mjs`, which keeps reading `.css` targets so a stylesheet export outside `./dist` is refused instead of skipped, and the stylesheet `sideEffects` list in `check-plite-release-artifacts.mjs`. The stylesheet test in `check-package-build-artifacts.test.mjs` becomes a refusal of a `./style.css` export, and `check-plite-release-artifacts.test.mjs` gains a case that refuses a stylesheet `sideEffects` list beside its fixtures that pass with `false`. Proof: both refusal cases fail at base, which accepts both, and pass at head; `node --test` over those two files and `entrypoint-turbo.test.mjs`; `pnpm entrypoint:turbo:check`; the platejs partition typechecks; and a `git grep` for `math/katex.css` that finds only history.
- [x] 3. Move KaTeX into the copied components. `math-static.tsx` imports `katex` and `katex/dist/katex.min.css`, calls `katex.renderToString` with its current options, and drops the two dead Word components; `math.tsx` imports `katex/dist/katex.min.css`; `registry-features.ts` writes `katex@0.16.22` on `math` and `math-static`; a `registry.test.ts` case asserts that `math` and `math-static` pin the `katex` version of `packages/platejs/package.json` and that `equation-toolbar-button`, `insert-toolbar-button` and `slash` carry no `katex`; delete the package-export branch of `registry-package-dependencies.mts` and its test; run `pnpm --filter www build:registry`; add a registry changelog entry. Proof: the identity probe at head writes `rows` equal byte for byte to the base capture's 18 rows; the new registry case fails at base on the toolbar and slash items and passes at head; `math.json` and `math-static.json` list `katex@0.16.22` and `export-toolbar-button` keeps `katex`; the registry dependency spec, `math.spec.tsx`, `math.lifecycle.spec.tsx`, `math-base-kit.slow.tsx` and `docx-export.spec.tsx` pass.
- [x] 4. Guard the build. Pass `runtimeImportBoundaries` to the platejs build config in `packages/platejs/tsdown.config.mts`, forbidding `katex` for `dist/math/index.js` and `dist/math/react/index.js`, as `packages/plitejs/tsdown.config.mts` forbids React. Proof: a platejs build at base with only the boundary added fails at `dist/math/index.js` reaching `katex`; the head build passes while `dist/docx/export` still imports `katex`; `pnpm plite:release:packages` passes.
- [x] 5. Docs. Run `plate-docs` on `equation.mdx` and `equation.cn.mdx`, whose install line becomes `npm install platejs katex@0.16.22`. In `docx.mdx` and `docx.cn.mdx`, the install line adds `katex@0.16.22` and drops `@tanstack/react-virtual`, which Word export never reaches. Then rerun `pnpm --filter www build:registry`, because the docs registry embeds `equation.mdx`. Proof: `pnpm --filter www build:source`, `pnpm --filter www check:docs`, `pnpm --filter www build:registry --check`; a read of the built `math.json` and `math-static.json` that finds the stylesheet import in each item's file; and a hand drive of the equation docs page in English and Chinese where `.katex-mathml` is clipped and the `KaTeX_Main` font loaded. The page loads both copied files, so the drive fails only when neither imports the stylesheet, and the item reads cover each file alone.
- [x] 6. Release notes and agent text. Amend `.changeset/math-transaction-transforms.md`: drop the stylesheet path, the stale `equation-node` item and the static KaTeX rendering claim, and add the migration for `@platejs/math` users, who add `katex` to their dependencies and call `katex.renderToString`. Add the `katex@0.16.22` install to the Word export note in `.changeset/platejs-static-presentation.md`. Edit `.agents/rules/verify.mdc` and the CSS asset line of `.agents/rules/verify/references/commands.md`, and run `pnpm run prepare`. Fix the KaTeX route in `docs/plans/topics/documents.md`. The close folds this plan into `docs/plans/topics/math.md`, which drops both names. Proof: `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`, and after the fold a `git grep` for both removed names that finds only history.
- [x] 7. Measure. Rerun the bundle probe on the two plugins and record the size against 271201 B of KaTeX at base. This is a size reading; steps 1 and 4 prove the claim.

## Completion gates

| Gate | Proof | Status |
| --- | --- | --- |
| Blast radius | `pstack:blast-radius` on the removed names before the delegate starts | `blast-radius-a1.md` |
| Source guard | oxlint fails at base with only the peer moved and passes at head | `control-move-peer-a1-a1.log` fails at base; `head-oxlint-guard-a1.log` passes |
| Build guard | a platejs build at base with the `katex` boundary fails, and the head build passes | `control-boundary-b1-a1.log` fails at base at `dist/math/index.js -> dist/math/lib/BaseEquationPlugin.js -> katex`; `head-build-a1.log` passes and `head-dist-katex-a1.log` finds `katex` only in `dist/docx/export` |
| Output identity | identity probe `rows` at head equal the `rows` of `identity-base-a2.json` | `identity-compare-a1.log`: 18 rows equal byte for byte |
| Packed release check | `pnpm plite:release:packages` passes | partial: `release-packages-a1.log` passes the pack, export, peer, NodeNext, Bundler, Node import, SSR and DCE proofs and fails only the entrypoint size receipt, whose 30 deltas match `base-release-packages-a1.log` at c83502bc25; the receipt update is Open work |
| Registry installs | `build:registry --check`, the new `registry.test.ts` case and the six items' `katex` entries | `build-registry-check-b2-a1.log`, `head-registry-tests-a1.log` (37 pass), `base-registry-test-a1.log` fails the new case at base, `read-items-a1.log` |
| Types and tests | platejs partition typechecks, www typecheck, `exportDocx.spec.ts`, `BaseEquationPlugin.spec.tsx`, `math.spec.tsx`, `math.lifecycle.spec.tsx`, `math-base-kit.slow.tsx`, `docx-export.spec.tsx`, the registry dependency spec, `entrypoint-dag-plugin.test.mjs`, `entrypoint-turbo.test.mjs`, `pnpm entrypoint:turbo:check`, and the build-artifact and release-check tests | `head-platejs-specs-a1.log` (66 pass), `head-node-tests-a1.log` (83 pass), `head-turbo-check-a1.log`, `head-math-spec-a1.log`, `head-math-lifecycle-a1.log`, `head-math-base-kit-a1.log`, `head-docx-export-spec-a1.log`; `typecheck-root-continue-a1.log`, `typecheck-platejs-specs-a1.log` and `typecheck-www-b4-a1.log` report only errors that match base |
| Docs | `build:source`, `check:docs`, the stylesheet import in each built item, and the hand drive's clipped MathML and loaded font | `typecheck-www-b4-a1.log` runs `build:source`, `check-docs-b2-a1.log`, `read-items-a1.log`, `drive-b2.md` |
| Docs coverage | `plate-docs` on the four pages with its example coverage audit | Evidence's Docs coverage |
| Hand drive | `verify`'s Hand drive after the last page edit, with `pnpm lint:task`, and the log of `node tooling/scripts/hand-drive.mjs check` on the plan's files | `hand-drive-check-b2-a1.log` covers 73 cells, `lint-task-b2-a1.log`, `drive-b2.md` |
| Playtest | `node tooling/scripts/playtest.mjs scope` on the plan's files | skip: `playtest-scope-a1.log` names no scenario catalog |
| Slice review | `pstack:thermos` on each slice | skip: the api-build and push rows owe a panel on the diff |
| Type-aware lint | `pnpm exec oxlint --type-aware --format=default` on the task's files before the diff panel | `oxlint-type-aware-a1.log`: 0 warnings and 0 errors on 16 files |
| Release notes | the two changesets and the registry entry `2026-10-18-math-katex-import.mdx`, with `generate-ui-changelog-entries.mjs --check` | `changelog-check-c1-a1.log` |
| Agent text | `pnpm run prepare`, then `sync-resources.mjs --check` | `prepare-c1-a1.log`, `sync-resources-check-c1-a1.log` |
| Public API repair | `best-api repair` before the close | `teaching-sweep-a1.log`, `forward-test-a1.md`, the fold into `docs/plans/topics/math.md` and `removed-names-c1-a1.log` |
| Bundle size | `benchmark` loaded, then the bundle probe after the last panel fix | `katex-probe-head-schema-m1-a2.log` and `-m2-a2.log`: 186754 B with 0 B of KaTeX; `katex-probe-base-schema-m-a1.log` at c83502bc25: 458401 B with 271201 B of KaTeX |
| Diff panel | api-build and push rows, before land | `seat-astra-d1.md`, `seat-sol-d1.md`, `seat-opus-d1r.md`: no critical |
| Feature check | `check-plate-feature.mjs` | skip: an architecture cut, not a feature-delivery plan |
| Ledger check | `node tooling/scripts/review-ledger.mjs check` on this plan | `review-ledger-check-c1-a1.log` |

## Claims

This plan narrows two claims the verdict made. The verdict said a bundle of the plugins pays for KaTeX. It does by default, but a bundler setting or the helper in its own file also removes KaTeX. So the size is a measured benefit, not the reason for the change. The verdict's risk also named apps that import the stylesheet path. No release shipped that path, so only callers of `@platejs/math`'s `getEquationHtml` change.

## Open work

- The copied HTML export block loads KaTeX's stylesheet from a CDN at 0.16.18 (`apps/www/src/registry/blocks/html-export/page.tsx:109`), while the equations it exports come from KaTeX 0.16.22. This plan does not change that link. owner: zbeyens, through a suggested task. stop: that task moves the link and its integrity hash to 0.16.22, or the owner drops it.
- The copied export toolbar imports `platejs/docx/export` at its top, so an editor with that toolbar loads Word export, and KaTeX with it, before anyone exports. This plan keeps that load as it is today. owner: zbeyens, through a suggested task. stop: that task loads Word export on demand, or the owner drops it.
- Most feature pages still list `@tanstack/react-virtual` in their install line, which only the virtualized editor needs. This plan fixes only the equation and Word export lines it edits. owner: zbeyens, through a suggested task. stop: that task fixes the other install lines, or the owner drops it.
- `equation.cn.mdx` has no Ownership, Rendering or Markdown section, so Chinese readers miss the layer owners, the KaTeX options and the Markdown mapping. owner: zbeyens, through a suggested task. stop: that task brings the Chinese page level with `equation.mdx`, or the owner drops it.
- The equation page's manual install line omits `react-textarea-autosize` and `lucide-react`, which the copied components import, and the forward test found older errors on the equation, Markdown and Node pages: an escaped `\\\\int` example, Markdown math credited to `platejs/markdown`, an undefined `EditorKit`, and inline equations drawn in display mode. All predate c83502bc25 (`forward-test-a1.md`). owner: zbeyens, through a suggested task. stop: that task fixes each item, or the owner drops it.
- `pnpm plite:release:packages` fails its entrypoint size receipt on 30 deltas that fail the same way at c83502bc25, and the receipt lists no math entry. owner: zbeyens, through a suggested task. stop: that task reviews each delta and rewrites the receipt, or the owner drops it.
- A copied registry item that imports `katex` later gets an unpinned range, because only `math` and `math-static` write `katex@0.16.22`. owner: zbeyens, through a suggested task. stop: that task pins every `katex` importer from one owner, or the owner drops it.

## Close

Reversals and deviations come first. No step reversed. The packed release check, which the plan expected to pass, fails at head on its entrypoint size receipt. The same 30 deltas fail at c83502bc25, the receipt lists no math entry, and every other stage of that check passes, so the gate is partial and the receipt update is Open work. The build kept two regenerated files the request did not name: `packages/platejs/turbo.json`, whose base copy fails `pnpm entrypoint:turbo:check`, and `apps/www/src/generated/api-reference-manifest.json`. The land message names both on its `Beyond the ask:` line. At the close the bundle probe gained a check that its output holds the plugins, and its base side ran again in a clean worktree at c83502bc25. Neither changed a number.

What landed. `platejs/math` and `platejs/math/react` import no KaTeX. `getEquationHtml`, the `platejs/math/katex.css` export and the math entrypoint's `katex` peer are gone, and `platejs/docx/export` owns the optional peer and calls `katex.renderToString` itself. The copied `math` and `math-static` components import `katex` and `katex/dist/katex.min.css`, and the registry installs `katex@0.16.22` with them and with no other equation item. The platejs build refuses `katex` in the built math entrypoints. The equation and Word export pages, both changesets, the registry changelog, `verify.mdc`, `commands.md` and `documents.md` say where KaTeX lives now. The build ran as five commits on `math-verdict`, 3effac7af8 through 8f9e6a845e. `land.mjs` squashes them with the docs, release notes, agent text, registry output and this plan into one commit on `next`, whose `Plan:` line names this plan.

The proof, from each row's own scope:

- Source guard. With only the peer moved, oxlint fails at c83502bc25 at `BaseEquationPlugin.ts:1:42`, and at head it passes on both source files.
- Build guard. A platejs build at c83502bc25 with only the boundary added fails at `dist/math/index.js -> dist/math/lib/BaseEquationPlugin.js -> katex`. The head build passes, and only `dist/docx/export/lib/docxStaticComponents.js` imports `katex`.
- Output identity. `identity.probe.tsx` renders nine TeX sources, block and inline, through `EditorStatic` with the copied `BaseMathKit` and through `exportDocx`. Its 18 rows at 8f9e6a845e equal the base capture byte for byte.
- Packed proofs. `pnpm plite:release:packages` installs `platejs/math` and `platejs/math/react` from the packed tarballs with only their required optional packages and imports them in Node with `katex` absent.
- Registry. The built `math.json` and `math-static.json` list `katex@0.16.22` and import the stylesheet. `equation-toolbar-button`, `insert-toolbar-button` and `slash` list no `katex`, and `export-toolbar-button` keeps it. The new registry case fails at c83502bc25 on those three items and passes at head.
- Tests and types. The focused specs and node tests pass at head, and each new refusal case fails at c83502bc25. The root, platejs spec and www typechecks report only errors that also appear at base, none in a file this change touches.
- Docs and drive. `check:docs`, `build:registry --check` and lint pass on the final docs. On a dev server from this worktree, `/docs/equation` draws five KaTeX formulas with the stylesheet and `KaTeX_Main` loaded, an edit to the demo's inline equation renders and stores `E=mc^2+1`, and 73 pages load with no console errors.
- Bundle. An esbuild bundle of the two plugins from `packages/platejs/src`, minified, with every bare import external except `katex`, falls from 458401 B with 271201 B of KaTeX at c83502bc25 to 186754 B with none at head. Two head runs match, and the no-math control is 185804 B on both sides. The plan predicted about 187 kB, and that held.
- Forward test. A fresh agent that read only the docs and copied components installed no KaTeX for a plugin-only server, installed `katex@0.16.22` for Word export and named no removed name.
- Diff panel. claude-opus-5-5, gpt-6-astra and gpt-6.1-sol at xhigh found no critical. The lead applied or dismissed each of Opus's warnings and nits, with its reason in the log.

Limits. The hand drive ran in the desktop app's built-in browser at 1280 by 900 in the light theme; Safari, Firefox and phone widths did not run. The bundle probe ran esbuild alone, so webpack and Rollup did not run, and no app bundle was measured. Output identity covers nine sources. The packed size receipt stays red, as it was at base.

Counts. The owner's four asks, "Verdict next", "Yes", "So here" and "continue", are done. Of the 20 completion gates, 16 pass, the packed release check is partial, and Playtest, Slice review and Feature check skip with their reasons. Two plan panel rounds found one critical, which was applied, and the diff round found none.

Open work is the list above, each item with its owner and its stop. The fold moves it into `docs/plans/topics/math.md`.

Review inputs. The verdict read the law in `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `.agents/rules/plate-plugins/references/package-host.md` and `docs/plans/2026-10-10-html-word-owns-word.md`. The build changed `tooling/entrypoints/entrypoint-dag.mjs`, `packages/platejs/package.json`, `packages/platejs/src/math/lib/BaseEquationPlugin.ts`, `packages/platejs/src/math/lib/BaseEquationPlugin.spec.tsx`, `apps/www/src/registry/components/editor/math-static.tsx`, `apps/www/src/registry/components/editor/math.tsx`, `apps/www/src/registry/registry-features.ts`, `apps/www/scripts/registry-package-dependencies.mts`, `apps/www/scripts/registry-package-dependencies.spec.mts`, `tooling/scripts/check-plite-release-artifacts.mjs`, `tooling/scripts/check-plite-release-artifacts.test.mjs`, `tooling/scripts/check-package-build-artifacts.test.mjs`, `content/docs/(plugins)/(elements)/equation.mdx`, `content/docs/(plugins)/(elements)/equation.cn.mdx` and `packages/platejs/src/docx/export/lib/docxStaticComponents.tsx`. `packages/platejs/src/docx/export/lib/exportDocx.spec.ts` passes unchanged. The dependents `packages/platejs/src/utils/plate-keys.ts`, `packages/platejs/src/internal/plugin/markdownParagraph.ts`, `packages/platejs/src/utils/index.ts`, `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`, `packages/platejs/src/utils/plugins/SingleBlockPlugin.ts`, `packages/platejs/src/utils/plugins/SingleLinePlugin.ts`, `apps/www/src/registry/components/editor/fixed-toolbar.tsx`, `apps/www/src/registry/components/editor/floating-toolbar.tsx` and `apps/www/src/registry/components/editor/plugins-static.ts` import only the plugin keys or the copied kit, and stay unchanged.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

Prior work. `node tooling/scripts/review-ledger.mjs lookup math` names the [2026-10-04 audit](../research/review-records/2026-10-04-math-audit.json) as the head, a Pursue that no plan adopted. It is stale because `math.tsx`, `BaseEquationPlugin.spec.tsx` and `packages/platejs/src/math/` changed since, and `VISION.md` and `docs/vision/common.md` moved. Its plans are `2026-04-10-math-trigger-execution.md`, which built the dollar-sign input rules, `2026-07-12-plate-next-list-markdown-math-package-reviews.md`, which kept `getEquationHtml` in the old `@platejs/math` package, and `2026-09-07-full-plate-ui-extraction-audit.md`. A search of `docs/plans` for `katex` and `getEquationHtml` also finds `2026-10-10-html-word-owns-word.md`, the Word plan that made Word export a second caller. The ledger's status before this review: 0 unreviewed scopes, 1 fork, 13 Pursue verdicts no plan has adopted, 1 deferred, 55 closed and 84 unowned paths.

### Requirements

- Store block and inline TeX as a flat `latex` string on void elements, round-trip Markdown `math` and `inlineMath`, keep the `$...$` and `$$` rules out of code blocks and equations, and edit an inline equation through a local draft that commits once. The 2026-10-04 audit set these, and `BaseEquationPlugin.spec.tsx`, `math.spec.tsx` and `math.lifecycle.spec.tsx` prove them today.
- The rendering engine and its stylesheet are presentation that copied UI owns, as the 2026-10-04 audit's requirements say. [plate.md](../vision/plate.md) gives the copied renderer trivial presentation and prefers a feature's scoped API over helper exports.
- An optional peer belongs to the entrypoint that imports it, and a feature page lists only the optional peers its taught entrypoints need (`.agents/rules/plate-plugins/references/package-host.md`, plate.md line 139).
- Word export writes real Word equations, through a converter written against KaTeX's own MathML ([2026-10-10 Word plan](2026-10-10-html-word-owns-word.md), its Main changes).
- Next is a redesign with hard cuts over compatibility ([VISION.md](../../VISION.md), Next beta and Invariants).

### Bundle probe

`docs/plans/artifacts/2026-10-18-math-review/katex-probe.mjs` bundles one export statement from `packages/platejs/src` with esbuild 0.28.0, ESM, minified, tree-shaken, every bare import external except `katex`, and reads KaTeX's bytes from the metafile.

| Bundle | Output | KaTeX in it | Gzip |
| --- | --- | --- | --- |
| The two equation plugins | 458401 B | 271201 B | 136426 B |
| `getEquationHtml` alone | 459031 B | 271804 B | 136700 B |
| Core's paragraph plugin, the control | 185804 B | 0 B | 59070 B |

Tree shaking keeps 99.8% of KaTeX in a bundle that never calls it, because KaTeX 0.16.22 declares no `sideEffects`. Logs: `katex-probe-schema-a1.log`, `katex-probe-helper-a1.log` and `katex-probe-control-a1.log` in the run directory. Two controls remove it without this plan. Marking KaTeX free of side effects in the bundler gives 186754 B with 0 B of KaTeX, measured by the Opus and Astra runners and again by the cross-judge. Moving the helper into its own file under the package's side-effect rule gives the same 186754 B, measured by the cross-judge. The probe ran esbuild only; webpack and Rollup did not run. Inferred from line 1 of `BaseEquationPlugin.ts`, not run: importing `platejs/math` without KaTeX installed fails, so its optional peer is not optional in practice; `pnpm plite:release:packages` runs the target side.

### Lanes

1. **Keep the current design. Loses.** Every import of the plugins needs KaTeX installed and, by default, bundles 271201 B of it for one wrapper around `katex.renderToString`.
2. **Strongest deletion: delete `getEquationHtml`, the stylesheet export and the math peer, and let the two drawing sites import KaTeX. Wins.** The copied editor already calls `katex.render` this way. Predicted benefit: a bundle of the plugins drops to about 187 kB with no KaTeX, and step 7 reruns the probe to mark it held or falsified.
3. **Move the helper to a `platejs/math/katex` subpath. Loses.** The 2026-10-04 audit rejected it. It keeps a published one-line wrapper and a second import path for one call.
4. **Word export takes a MathML function from the app. Loses.** It adds an option every Word export app must wire, and the converter maps KaTeX's own MathML, so another engine's output would not convert the same.
5. **Keep the helper in its own file. Loses.** It fixes the default bundle, as the control above shows, but keeps a published wrapper and the `katex` peer on `platejs/math`. platejs builds unbundled, so the `platejs/math` index still loads the helper's file and its `katex` import whenever it runs unbundled, in Node, on a server or in a test. Inferred from the build config and the re-export, not run.
6. **The rule is wrong. Not a lane.** No rule blocks the target.

### Architect

The plan changes a public API, so `pstack:architect` ran its arena (reviews: api-plan). The runners were claude-opus-5-5, gpt-6-astra and gpt-6.1-sol, each at xhigh, on one brief and one grounding file. All three reached the same shape: delete the helper and the stylesheet export, let copied UI and Word export import KaTeX, and move the peer to `docx/export`. A blind claude-opus-5-5 cross-judge at xhigh scored them 23 for Sol, 22 for Opus and 23 for Astra, out of 24, on outcome, surface, ownership, migration, proof and reader load. The plan takes Sol's candidate as its base, for the most complete migration and the fewest wrong claims. It grafts Opus's proof order, where lint fails first and the bundle probe is a size check, and Opus's deletion of the registry package-export branch. It puts the packed KaTeX refusal on the public-export peer proofs, because the judge found that `math/react` also depends on `math` (`entrypoint-dag.mjs:366-368`), which a headless-only refusal would miss. One deviation from the base is the registry pin. The plan writes it as a literal `katex@0.16.22`, as the registry's other pins are, where Sol read it from the docs app's `package.json`. The judge corrected two premises. No release shipped `platejs/math`, and `equation.cn.mdx` names none of the removed names. Answers: `architect-{opus,astra,sol}-a1.md`, `architect-judge-a1.md` in the run directory.

### Panel

Two rounds reviewed the plan, with claude-opus-5-5, gpt-6-astra and gpt-6.1-sol at xhigh.

- Round 1 found one critical, from Sol: the Word export docs would install the latest KaTeX, 0.19.0, against the package's 0.16.22. Every install line now names 0.16.22. Opus's ten warnings and five nits swapped proofs that could not fail for ones that can, cut the build and release checks' stylesheet rules with the registry's, added a registry test for the KaTeX pin, the migration's KaTeX install and the stale subject and changeset lines, and moved the HTML export block's old stylesheet to Open work.
- Round 2 found no critical. All three seats showed that deleting the build check's stylesheet read would skip a stylesheet export instead of refusing it, and that the docs page loads both copied files, so the drive cannot see one missing import. Opus showed that the packed check cannot fail at base and that the platejs build already has an import boundary, which replaced the graph test.

Round 2 applied no critical, so no third round ran. Answers: `seat-{opus,astra,sol}-p{1,2}.md` in the run directory.

### Base controls

- Moving only the `katex` peer from `math` to `docx/export` makes oxlint fail at `BaseEquationPlugin.ts:1:42` with "platejs/math cannot import optional peer katex", while `docxStaticComponents.tsx` passes. Run in a base worktree at `c83502bc25`; log `control-move-peer-a1-a1.log`.
- `identity.probe.tsx` renders nine TeX sources, block and inline, through `EditorStatic` with the copied `BaseMathKit` and through `exportDocx`, and saves the static HTML and `word/document.xml` of each. Its sources include a macro, malformed TeX, `\raisebox`, `\href`, text-only and empty equations. It ran in a base worktree at `c83502bc25` and wrote 18 rows to `identity-base-a2.json`, with KaTeX markup in every non-empty static row and Word math in every non-empty Word row. Step 3 reruns it at head and compares bytes.

- Adding only the `katex` boundary to the platejs build config makes the base build fail with "Runtime import boundary violation from dist/math/index.js: dist/math/index.js -> dist/math/lib/BaseEquationPlugin.js -> katex". Run in a base worktree at `c83502bc25`; log `control-boundary-b1-a1.log`.

Proof limits: the plan read source, ran the bundle probe, the lint control and the base identity capture. No browser drive ran, and no app bundle was measured.

### Docs coverage

`plate-docs` audited `equation.mdx` for the tasks this change touches. Each has a home:

- Add equations with the kit: Fast path, with the `math` source and the demo preview.
- Use your own components: Manual setup, whose install line names `katex@0.16.22` and whose stylesheet line names `katex/dist/katex.min.css`.
- Render read-only output: Add static rendering, with the `math-static` source.
- Use the plugins without KaTeX, such as for Markdown on a server: the Ownership note says `platejs/math` and `platejs/math/react` load no KaTeX and names the three importers.
- Export equations to Word: a new Ownership row links the DOCX page, whose Word export install line names `katex@0.16.22`.

`equation.cn.mdx` lags the English page. It has no Ownership, Rendering or Markdown section, so only its install line and one KaTeX sentence changed.

### Dependents

- `documents`: affected. `packages/platejs/src/docx/export/lib/docxStaticComponents.tsx` calls `getEquationHtml`; the target imports `katex` there and moves the peer to `docx/export`. `exportDocx.spec.ts` covers its Word math.
- `ui`: affected through the copied static kit. `apps/www/src/registry/components/editor/plugins-static.ts` installs `BaseMathKit` from `math-static.tsx`, which changes its imports. `floating-toolbar.tsx` and `fixed-toolbar.tsx` reach math through the equation and insert toolbar buttons, which import only the plugins and stay unaffected.
- `distribution`: unaffected. `markdownParagraph.ts`, `utils/index.ts` and `ExitBreakPlugin.ts` import only the `PLUGINS` key table from `utils/plate-keys.ts`, which does not change.
- `editing`: unaffected. `ExitBreakPlugin.ts`, `SingleBlockPlugin.ts` and `SingleLinePlugin.ts` import only the `PLUGINS` key table.

### History

- This review supersedes the [2026-10-04 audit](../research/review-records/2026-10-04-math-audit.json) for rendering ownership, because its claim that the copied static element is the wrapper's only consumer no longer holds. It retains that audit's verdicts on the stored shape, the Markdown mappings, the input rules and the inline draft.
- It retains the [2026-10-10 Word plan](2026-10-10-html-word-owns-word.md)'s converter and its Word output. It reopens only that plan's route to KaTeX through `platejs/math`.
- External checkouts read on 2026-10-18: `../tiptap` at `91c51be53c`, `../BlockNote` at `1e26f1c5e1`, `../milkdown` at `6a4db480b0`, `../lexical` at `dd5c41b131` and `../ckeditor5` at `14e73cc31b`.

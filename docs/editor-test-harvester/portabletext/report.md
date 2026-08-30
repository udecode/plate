# Editor Test Harvest: Portable Text

status: done
score: 0.94
license_mode: permissive
license_evidence: `../portabletext/LICENSE`
output_mode: durable
versioned_copy_policy: normal plus no source-body copying
target: `../portabletext`
report_dir: `docs/editor-test-harvester/portabletext`
generated: 2026-05-29
skill: `.agents/skills/editor-test-harvester/SKILL.md`

## Verdict

Portable Text is worth harvesting for raw Plite, but only if we steal behavior pressure, not its document schema or behavior API shape.

Best raw Plite steals: projected selection across nested roots, selection slicing at object/text boundaries, delete/insert matrices around voids, drag/drop self-drop suppression, IME boundary transport, and remote selection/history rebasing.

Best Plate steals: schema-gated content, annotations/decorators, list policy, HTML/markdown serializers, renderer definitions, behavior-plugin ergonomics, toolbar/plugin examples, and Sanity bridge integration.

No Plate repo root implementation, Plate package, example, or build file was edited in this harvest.

## Inventory

- target: `../portabletext`
- test files found: 502
- classified: 502
- runnable rows: 321
- portable: 94
- portable-mixed: 106
- plate-owned: 100
- skip: 14
- harness: 188
- product-shell: 0
- uncertain: 0
- portable/portable-mixed indexed runnable files: 200
- portable/portable-mixed test-name anchors: 1944
- rerun delta: 0 new rows, 0 removed rows

Inventory command:

```bash
rg --files ../portabletext \
  | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec)\.[cm]?[jt]sx?$' \
  | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)'
```

Linked appendices:

- [Full inventory appendix](./inventory.md): all 502 inventory rows.
- [Portable test-name index](./test-index.md): all 200 runnable portable/portable-mixed files with 1944 extracted line/name anchors.
- [Source routing](./source-routing.md): all 200 portable/portable-mixed files routed to a behavior family, owner, target, and verification command.

## License Gate

| Field | Value |
| ----- | ----- |
| License mode | permissive |
| Evidence files | `../portabletext/LICENSE` says MIT License; package metadata read from `../portabletext/package.json` |
| Output directory | `docs/editor-test-harvester/portabletext` |
| Output mode | durable |
| Versioned copy policy | normal for permissive source, but this harvest still records invariants and line/name provenance rather than source bodies |

## Confidence Score

| Dimension | Score | Evidence | Cap hit |
| --------- | ----: | -------- | ------- |
| Inventory completeness | 0.98 | Exact command rerun; 502/502 rows classified; unresolved uncertain rows: 0; full inventory linked. | none |
| Behavior extraction depth | 0.94 | 200 runnable portable/portable-mixed files have extracted test names with 1944 line/name anchors; every portable/mixed file is routed in source-routing.md. | no source bodies copied; behavior families keep the report readable |
| Skip precision and negative controls | 0.92 | 188 harness, 100 Plate-owned, 14 skip rows; negative controls read for converters, renderer types, behavior API, and test helpers. | none |
| Plite/Plate coverage mapping accuracy | 0.92 | Current Plate repo root scripts/tests searched; Plate package/docs/example owners searched; matrix records exact owner surfaces and commands. | no implementation tests executed because this is report-only |
| Actionability of copy/refactor/create plan | 0.93 | Every behavior family names action, target owner, proof kind, and focused verification or Plate backlog command; source-routing maps each portable/mixed file to those families. | browser rows still require execution in an apply pass |
| Provenance and reproducibility | 0.95 | Local license evidence, exact inventory command, stable appendices, rerun delta, source refs, and line/name anchors recorded. | none |
| Weighted total | 0.94 | Passes >= 0.92 and no dimension below 0.85. | none |

## Pass-State Ledger

| Pass | Status | Evidence added | Report delta | Open issues | Next owner |
| ---- | ------ | -------------- | ------------ | ----------- | ---------- |
| Intake and boundary | complete | Target `../portabletext`; MIT license; existing artifacts read; report-only boundary confirmed. | Updated report metadata and license gate. | none | done |
| Inventory | complete | Exact inventory command rerun: 502 rows. | inventory.md rewritten with 502 rows and rerun delta. | none | done |
| Test-name extraction | complete | 200 runnable portable/portable-mixed files indexed with 1944 line/name anchors. | test-index.md rewritten with test names, not only line anchors. | none | done |
| Classification pressure | complete | Skips challenged; converters/renderers/behavior API/test helpers re-routed more honestly. | Counts and reasons updated; uncertain remains 0. | none | done |
| Behavior extraction | complete | 14 behavior/product families extracted with fresh invariants. | Matrix now discharges all portable/mixed files via source-routing.md. | none | done |
| Plite/Plate coverage mapping | complete | Current Plate repo root scripts/tests and current Plate package/docs/example owners searched. | Owner coverage and commands recorded per family. | none | done |
| Action planning | complete | Every family has action, target, proof kind, and command/backlog owner. | source-routing.md maps all portable/mixed source rows to actionable families. | none | done |
| Ecosystem synthesis | complete | Steal/reject/Plate-owner decisions recorded in verdict and synthesis. | Added synthesis section below. | none | done |
| Closure review | complete | Score 0.94; report, inventory, test-index, source-routing verified. | status set to done. | none | done |

## Plite And Plate Search Evidence

Raw Plite searches used:

```bash
rg --files packages/plite/test packages/plite-react/test packages/test/test Plate repo root/playwright \
  | rg '(selection|fragment|insert|delete|paste|clipboard|history|collab|composition|ime|drag|drop|void|root|schema|operation|transform)'
rg -n "selection|delete|insert|paste|undo|redo|composition|drag|drop|focus|keyboard|mutation|container|inline|block object|history|fragment|normalization|schema|annotation|decorator" \
  packages/plite/test packages/plite-react/test packages/test/test Plate repo root/playwright
node -e "const p=require('./Plate repo root/package.json'); console.log(JSON.stringify({scripts:p.scripts,packageManager:p.packageManager},null,2))"
```

Plate owner searches used:

```bash
rg --files packages apps/www/src/registry docs \
  | rg '(link|list|markdown|serializer|html|docx|collab|yjs|toolbar|mention|emoji|comment|annotation|media|schema|plugin|void|editable-voids|version-history|collaboration)'
rg -n "IME|composition|clipboard|paste|selection|mobile|browser|root|void|history|undo|multi-root|content-root|projection" docs/solutions/developer-experience docs/solutions/ui-bugs docs/solutions/runtime-errors docs/solutions/best-practices
```

## Matrix

| Source ref | Test ref | Tag | Behavior invariant | Proof kind | Owner coverage | Action | Target | Verification | Inventory coverage | Example source refs |
| ---------- | -------- | --- | ------------------ | ---------- | -------------- | ------ | ------ | ------------ | ------------------ | ------------------- |
| PT-H01 | Selection boundary and projection | selection-dom-mapping | Logical selections must compare, project, slice, and export consistently across text boundaries, inline objects, block objects, and nested roots. | unit plus browser for DOM projection | Plate repo root packages/plite selection-rebase and operations contracts; slate-react projections/view-selection/root-interaction tests; multi-root Playwright examples | refactor-existing/create-new for exact root/object endpoint gaps | packages/plite/test/selection-rebase-contract.ts; packages/plite-react/test/projections-and-selection-contract.test.tsx; apps/www/tests/plite-browser/donor/examples/multi-root-document.test.ts | cd Plate repo root && bun test ./packages/plite/test/selection-rebase-contract.ts ./packages/plite-react/test/projections-and-selection-contract.test.tsx ./packages/plite-react/test/view-selection-contract.test.ts | 24 files; 178 anchors; portable:24 | packages/editor/gherkin-tests/selection-adjustment.test.ts<br>packages/editor/gherkin-tests/selection.test.ts<br>packages/editor/src/editor/get-selection-state.test.ts<br>packages/editor/src/editor/validate-selection-machine.test.ts<br>packages/editor/src/engine/editor/unhang-range.test.ts<br>packages/editor/src/engine/point/transform-point.test.ts<br>packages/editor/src/engine/range/ranges-overlap.test.ts<br>packages/editor/src/internal-utils/__tests__/ranges.test.ts |
| PT-H02 | Content roots and containers | structured-blocks | Nested editable roots must keep stable root order, selection ownership, normalization boundaries, and DOM projection without importing schema-specific policy. | unit plus browser where native selection crosses roots | Plate repo root slate-react content-root navigation, runtime provider, root interaction, projected clipboard, and multi-root browser tests | split raw root behavior from schema policy | packages/plite-react/test/content-root-navigation-contract.test.ts; packages/plite-react/test/root-interaction-resolver.test.ts; apps/www/tests/plite-browser/donor/examples/multi-root-document.test.ts | cd Plate repo root && bun test ./packages/plite-react/test/content-root-navigation-contract.test.ts ./packages/plite-react/test/root-interaction-resolver.test.ts | 30 files; 241 anchors; portable-mixed:30 | packages/editor/src/schema/get-block-object-schema.test.ts<br>packages/editor/src/schema/resolve-containers.test.ts<br>packages/editor/src/selectors/selector.get-applicable-schema.test.ts<br>packages/editor/src/traversal/get-path-sub-schema.test.ts<br>packages/editor/src/traversal/get-union-schema.test.ts<br>packages/editor/tests/backspace-before-container.test.tsx<br>packages/editor/tests/block-selectors-container.test.tsx<br>packages/editor/tests/child-selectors-container.test.tsx |
| PT-H03 | Void and object boundary editing | void-atom | Block voids, inline voids, and object wrappers must stay selectable/editable as atoms without hidden spacer nodes intercepting text movement, delete, paste, or drag. | unit plus browser for native caret/selection | Plate repo root slate void fixtures, slate-react slate-void-shell tests, editable-voids browser example, generated stress rows | refactor-existing plus create exact object-boundary browser rows for gaps | packages/plite-react/test/slate-void-shell-contract.test.tsx; apps/www/tests/plite-browser/donor/examples/editable-voids.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts | cd Plate repo root && bun test ./packages/plite-react/test/slate-void-shell-contract.test.tsx && PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium | 8 files; 75 anchors; portable:8 | packages/editor/gherkin-tests/block-objects.test.ts<br>packages/editor/gherkin-tests/inline-objects.test.ts<br>packages/editor/src/engine/node/is-void-node.test.ts<br>packages/editor/src/node-traversal/get-highest-object-node.test.ts<br>packages/editor/tests/define-leaf-block-object-wrapper.test.tsx<br>packages/editor/tests/define-leaf-inline-object-spacer.test.tsx<br>packages/editor/tests/inline-object-contenteditable.test.tsx<br>packages/editor/tests/inline-objects.test.tsx |
| PT-H04 | Insert, split, and break placement | insert-fragment | Insertions at text starts, middles, ends, empty blocks, selected objects, and explicit locations must choose a stable model position and final selection. | unit, browser only for native event transport | Plate repo root slate transforms insertNodes/insertText/splitNodes fixtures and transforms-contract.ts | refactor-existing into a compact placement matrix before adding duplicates | packages/plite/test/transforms-contract.ts and existing transform fixture directories | cd Plate repo root && bun test ./packages/plite/test/transforms-contract.ts | 17 files; 236 anchors; portable:17 | packages/editor/gherkin-tests/insert.block.test.ts<br>packages/editor/gherkin-tests/insert.blocks.test.ts<br>packages/editor/gherkin-tests/insert.break.test.ts<br>packages/editor/gherkin-tests/insert.child.test.ts<br>packages/editor/gherkin-tests/insert.text.test.ts<br>packages/editor/gherkin-tests/splitting-blocks.test.ts<br>packages/editor/src/behaviors/fit-blocks-to-destination.test.ts<br>packages/editor/src/utils/util.block-offset.test.ts |
| PT-H05 | Delete and backspace matrix | delete-backspace | Collapsed, expanded, word, line, block, void-edge, object-to-object, and root-boundary deletion must remove exactly the intended content and leave a valid selection. | unit plus browser for native beforeinput/delete transport | Plate repo root slate transform delete fixtures, operations-contract, slate-react beforeinput/browser rows | refactor-existing and fill object/root boundary gaps | packages/plite/test/transforms/delete; packages/plite/test/operations-contract.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts | cd Plate repo root && bun test ./packages/plite/test/operations-contract.ts ./packages/plite/test/transforms-contract.ts | 8 files; 84 anchors; portable:8 | packages/editor/gherkin-tests/delete.test.ts<br>packages/editor/gherkin-tests/removing-blocks.test.ts<br>packages/editor/tests/event.delete.backward.test.tsx<br>packages/editor/tests/event.delete.block.test.tsx<br>packages/editor/tests/event.delete.forward.test.tsx<br>packages/editor/tests/event.delete.matrix.test.tsx<br>packages/editor/tests/event.delete.test.tsx<br>packages/editor/tests/withEditableAPIDelete.test.tsx |
| PT-H06 | Clipboard and fragment serialization | clipboard-paste | Clipboard import/export must preserve fragment shape, object boundaries, selection endpoints, and undo grouping while leaving serializer policy to the product layer. | unit plus real browser clipboard/paste rows | Plate repo root slate-react projected clipboard contract; plite-dom clipboard boundary tests; paste-html Playwright example | split raw fragment/selection proof from Plate serializers and matchers | packages/plite-react/test/projected-clipboard-contract.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; Plate serializer packages | cd Plate repo root && bun test ./packages/plite-react/test/projected-clipboard-contract.test.ts && PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/paste-html.test.ts --project=chromium | 3 files; 15 anchors; portable-mixed:3 | packages/editor/gherkin-tests/paste.test.ts<br>packages/editor/tests/event.paste.test.tsx<br>packages/editor/tests/upload-images-on-paste.test.tsx |
| PT-H07 | Drag/drop and drop target resolution | drag-drop | Dragging inside the active selection should drag the selected range, dragging outside should select the dragged atom, and self-drop into the origin range should be suppressed. | browser for native drag/drop, unit for path resolver | Plate repo root root-interaction resolver and browser selection examples; weaker exact drag/drop coverage | create-new browser rows after unit resolver gap check | packages/plite-react/test/root-interaction-resolver.test.ts; apps/www/tests/plite-browser/donor examples or stress generated editing | cd Plate repo root && bun test ./packages/plite-react/test/root-interaction-resolver.test.ts | 4 files; 33 anchors; portable-mixed:4 | packages/editor/src/editor/resolve-element-drop-position.test.ts<br>packages/editor/src/selectors/drag-selection.test.ts<br>packages/editor/tests/event.drag.drop.self-drop.test.tsx<br>packages/editor/tests/event.drag.drop.test.tsx |
| PT-H08 | History and remote collaboration rebasing | collaboration-remote | Remote inserts, deletes, splits, and local undo/redo must rebase local selection once, avoid duplicate selection emission, and preserve local undo semantics. | unit, browser only for provider-specific integration | Plate repo root collab selection stress, collab document state, projected collab substrate, collab-history runtime contract | refactor-existing/create-new remote selection matrix | packages/plite/test/collab-selection-stress-contract.ts; packages/plite/test/collab-history-runtime-contract.ts; packages/plite-react/test/projected-collab-substrate-contract.test.ts | cd Plate repo root && bun test ./packages/plite/test/collab-selection-stress-contract.ts ./packages/plite/test/collab-history-runtime-contract.ts ./packages/plite-react/test/projected-collab-substrate-contract.test.ts | 6 files; 54 anchors; portable:6 | packages/editor/gherkin-tests/undo-redo.test.tsx<br>packages/editor/tests/collaborative-editing.test.tsx<br>packages/editor/tests/selection-after-remote-patches.test.tsx<br>packages/editor/tests/selection-emit-dedup.test.tsx<br>packages/editor/tests/selection-emit-stability.test.tsx<br>packages/editor/tests/undo-redo-collaboration.test.tsx |
| PT-H09 | IME and composition transport | ime-composition | Composition commit, cancel, replacement, and boundary-crossing must keep DOM selection, model selection, marks, and history coherent. | honest browser DOM composition; raw device only for mobile claims | Plate repo root plite-browser IME helper/tests, slate-react composition-state contract, generated stress IME rows | covered/refactor-existing; create only exact missing boundary rows | packages/test/test/proof/playwright-ime.test.ts; packages/plite-react/test/composition-state-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts | cd Plate repo root && bun test ./packages/plite-browser/test/core/playwright-ime.test.ts ./packages/plite-react/test/composition-state-contract.test.ts | 1 files; 25 anchors; portable:1 | packages/editor/tests/composition.test.ts |
| PT-H10 | Focus, keyboard, and event authority | accessibility-keyboard | Focus and keyboard events must import the correct DOM selection before model-owned commands and must keep event/default-action authority explicit. | unit plus browser for DOM selection/focus | Plate repo root selection-controller, runtime provider, selection side-effect policy, plite-dom hotkeys, browser selection tests | split raw focus/event authority from Portable Text behavior API names | packages/plite-react/test/selection-controller-contract.test.ts; packages/plite-react/test/selection-side-effect-policy-contract.test.ts; packages/plite-dom/test/hotkeys.ts | cd Plate repo root && bun test ./packages/plite-react/test/selection-controller-contract.test.ts ./packages/plite-react/test/selection-side-effect-policy-contract.test.ts ./packages/plite-dom/test/hotkeys.ts | 0 files; 0 anchors; none | No direct file rows |
| PT-H11 | Path, point, range, and operation core | normalization-schema | Path, point, range, operation inversion, traversal, dirty-path, and patch translation helpers must be root-aware and deterministic. | unit | Plate repo root operation/root-location/rooted-operation/generic-operation contracts and legacy transform fixtures | covered/refactor-existing unless a root-aware variant is missing | packages/plite/test/root-location-contract.ts; packages/plite/test/rooted-operation-contract.ts; packages/plite/test/generic-operation-contract.ts; packages/plite/test/operations-contract.ts | cd Plate repo root && bun test ./packages/plite/test/root-location-contract.ts ./packages/plite/test/rooted-operation-contract.ts ./packages/plite/test/generic-operation-contract.ts ./packages/plite/test/operations-contract.ts | 30 files; 374 anchors; portable:30 | packages/editor/src/engine/operation/inverse-operation.test.ts<br>packages/editor/src/engine/path/compare-paths.test.ts<br>packages/editor/src/engine/path/parent-path.test.ts<br>packages/editor/src/engine/path/path-levels.test.ts<br>packages/editor/src/engine/path/sibling-path.test.ts<br>packages/editor/src/internal-utils/__tests__/values.test.ts<br>packages/editor/src/internal-utils/build-index-maps.test.ts<br>packages/editor/src/internal-utils/get-unwrap-target.test.ts |
| PT-H12 | Behavior pipeline and extension ordering | beforeinput-input | Command/event pipeline hooks should have explicit forwarding, raising, execution, and side-effect boundaries without hiding native input ownership. | unit plus browser for native input handoff | Plate repo root transaction/update contracts cover raw sequencing; Plate owns plugin ergonomics | plate-owned/refactor-existing only if raw transaction effect hook is accepted | Plate plugin API backlog; optional Plate repo root packages/plite/test/transaction-contract.ts for raw commit/effect ordering | cd Plate repo root && bun test ./packages/plite/test/transaction-contract.ts | 69 files; 629 anchors; portable-mixed:69 | packages/editor/src/plugins/plugin.internal.auto-close-brackets.test.tsx<br>packages/editor/src/priority/priority.sort.test.ts<br>packages/editor/src/renderers/renderer.types.test.tsx<br>packages/editor/src/selectors/selector.get-fragment.test.ts<br>packages/editor/src/selectors/selector.get-selected-blocks.test.ts<br>packages/editor/src/selectors/selector.get-selected-spans.test.ts<br>packages/editor/src/selectors/selector.get-selected-text-blocks.test.ts<br>packages/editor/src/selectors/selector.get-selected-value.test.ts |
| PT-P01 | Schema, renderers, annotations, decorators, and lists | structured-blocks | Schema-specific allowed content, mark state, annotations, decorators, renderer definitions, and lists are product/plugin policy. | Plate package tests and examples | Plate registry kits, list/link/comment/basic-marks/schema/docs owners | plate-owned | apps/www/src/registry/components/editor/plugins/* kits; Plate list/link/comment/basic marks packages/docs | pnpm turbo typecheck --filter=./packages/* only when a later Plate implementation slice touches those packages | 29 files; 187 anchors; plate-owned:29 | packages/editor/gherkin-tests/annotations-collaboration.test.ts<br>packages/editor/gherkin-tests/annotations.test.ts<br>packages/editor/gherkin-tests/decorators.test.ts<br>packages/editor/gherkin-tests/lists.test.ts<br>packages/editor/gherkin-tests/plugin.comment-annotations.test.tsx<br>packages/editor/gherkin-tests/plugin.structured-lists.test.tsx<br>packages/editor/src/selectors/selector.get-active-annotations.test.ts<br>packages/editor/src/selectors/selector.get-active-decorators.test.ts |
| PT-P02 | Serializers, toolbar, plugins, and product packages | serialization-parsing | HTML, markdown, toolbar, plugin, media, and Sanity bridge behavior belongs to Plate product packages and docs. | Plate package tests/examples/docs | Plate markdown/docx/html/media/toolbar/registry examples found in package search | plate-owned | packages/media, markdown/docx/html registry examples, toolbar UI, plugin kits, docs/editor-behavior | focused Plate package tests only when a later Plate implementation slice touches those owners | 71 files; 1007 anchors; plate-owned:71 | packages/block-tools/test/html-to-blocks/schema.test.ts<br>packages/block-tools/test/tests/util/normalizeBlock.test.ts<br>packages/block-tools/test/tests/util/randomKey.test.ts<br>packages/editor/src/converters/converter.portable-text.deserialize.test.ts<br>packages/editor/src/converters/converter.text-html.deserialize.test.ts<br>packages/editor/src/converters/converter.text-html.serialize.test.ts<br>packages/editor/src/converters/converter.text-plain.test.ts<br>packages/editor/src/utils/parse-blocks.test.ts |

## Skips

| Source | Reason | Negative-control evidence |
| ------ | ------ | ------------------------- |
| Harness/support files (188) | Fixture, setup, generated test helper, or upstream helper test with no portable editor behavior assertion. | Read editor src/test and test-utils examples; textspec helpers prove upstream harness notation, not editor behavior. |
| Plate-owned policy files (100) | Schema, serializer, renderer, annotation/decorator, list, toolbar, plugin, bridge, or product behavior belongs to Plate. | Read converter.text-html.deserialize.test.ts, renderer.types.test.tsx, and behavior-api.test.tsx as routing pressure. |
| Product shell rows (0) | Examples/docs/apps are product proof, not raw Plite substrate. | Plate package/docs search records registry examples and docs owners. |
| Non-editor skip rows (14) | No portable editor behavior after classification. | Full inventory appendix records exact reason per row. |

## Next Slice

1. Raw Plite first: apply PT-H01, PT-H02, PT-H03, PT-H05, and PT-H08 as focused regression packs for the recent root/selection/object-boundary failures.
2. Browser proof second: apply PT-H07 only with real browser drag/drop rows; do not claim it from pure model tests.
3. IME proof third: apply PT-H09 only through the plite-browser honest DOM composition lane; do not promote synthetic jsdom rows to mobile/IME claims.
4. Plate backlog: route PT-P01 and PT-P02 into Plate list/schema/mark/serializer/plugin/docs work, not raw Plite.
5. Behavior API: treat PT-H12 as API pressure only. Do not rename Plite tx/update around Portable Text execute/raise/forward/effect without a separate architecture decision.

## Ecosystem Synthesis

Steal:

- matrix-style object boundary coverage for insert/delete/paste/drag;
- source-level tests for root/container selection projection;
- remote patch selection rebasing and selection event dedup rows;
- composition cases around replacement, cancellation, and formatting boundaries;
- full-path drop target checks, especially same-key nested roots.

Reject:

- Portable Text key path format as raw Plite API;
- schema-gated content as a raw Plite requirement;
- annotations/decorators/list policy in raw Plite;
- behavior plugin names as public Plite transaction API;
- serializer expected output as raw editor law.

Plate should own:

- schema/category admissibility, annotations, decorators, comments, lists, serializers, toolbar/plugin behavior, and renderer definitions;
- any Portable Text adapter that wants to expose PT-like schema semantics on top of Plite/Plate.

Raw Plite should own:

- root-aware path/point/range operations, projection graph behavior, object boundary selection, native input transport, clipboard fragment mechanics, and collaboration/history rebasing.

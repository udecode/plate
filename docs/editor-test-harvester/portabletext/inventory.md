# Portable Text Full Inventory Appendix

Source: `../portabletext`
Generated: 2026-05-29
Inventory rows: 502

Inventory command:

```bash
rg --files ../portabletext \
  | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec)\.[cm]?[jt]sx?$' \
  | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)'
```

Rerun delta against the previous appendix: 0 new rows, 0 removed rows.

| # | Source | Runnable | Category | Family | Reason |
| ---: | --- | --- | --- | --- | --- |
| 1 | `packages/block-tools/test/html-to-blocks/schema.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 2 | `packages/block-tools/test/test-key-generator.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 3 | `packages/block-tools/test/tests/util/normalizeBlock.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 4 | `packages/block-tools/test/tests/util/randomKey.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 5 | `packages/editor/gherkin-tests/annotations-collaboration.test.ts` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 6 | `packages/editor/gherkin-tests/annotations.test.ts` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 7 | `packages/editor/gherkin-tests/block-objects.test.ts` | yes | portable | PT-H03 | void/object boundary invariant |
| 8 | `packages/editor/gherkin-tests/decorators.test.ts` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 9 | `packages/editor/gherkin-tests/delete.test.ts` | yes | portable | PT-H05 | delete/backspace editing invariant |
| 10 | `packages/editor/gherkin-tests/inline-objects.test.ts` | yes | portable | PT-H03 | void/object boundary invariant |
| 11 | `packages/editor/gherkin-tests/insert.block.test.ts` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 12 | `packages/editor/gherkin-tests/insert.blocks.test.ts` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 13 | `packages/editor/gherkin-tests/insert.break.test.ts` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 14 | `packages/editor/gherkin-tests/insert.child.test.ts` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 15 | `packages/editor/gherkin-tests/insert.text.test.ts` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 16 | `packages/editor/gherkin-tests/lists.test.ts` | yes | plate-owned | PT-P01 | list indentation/rendering policy belongs to Plate lists |
| 17 | `packages/editor/gherkin-tests/paste.test.ts` | yes | portable-mixed | PT-H06 | raw fragment clipboard behavior mixed with serializer/matcher policy |
| 18 | `packages/editor/gherkin-tests/plugin.comment-annotations.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 19 | `packages/editor/gherkin-tests/plugin.structured-lists.test.tsx` | yes | plate-owned | PT-P01 | list indentation/rendering policy belongs to Plate lists |
| 20 | `packages/editor/gherkin-tests/removing-blocks.test.ts` | yes | portable | PT-H05 | delete/backspace editing invariant |
| 21 | `packages/editor/gherkin-tests/selection-adjustment.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 22 | `packages/editor/gherkin-tests/selection.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 23 | `packages/editor/gherkin-tests/splitting-blocks.test.ts` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 24 | `packages/editor/gherkin-tests/undo-redo.test.tsx` | yes | portable | PT-H08 | collaboration/history/remote selection invariant |
| 25 | `packages/editor/src/behaviors/fit-blocks-to-destination.test.ts` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 26 | `packages/editor/src/converters/converter.portable-text.deserialize.test.ts` | yes | plate-owned | PT-P02 | parser/serializer policy belongs to Plate serializers; raw Plite owns only fragment insertion |
| 27 | `packages/editor/src/converters/converter.text-html.deserialize.test.ts` | yes | plate-owned | PT-P02 | parser/serializer policy belongs to Plate serializers; raw Plite owns only fragment insertion |
| 28 | `packages/editor/src/converters/converter.text-html.serialize.test.ts` | yes | plate-owned | PT-P02 | parser/serializer policy belongs to Plate serializers; raw Plite owns only fragment insertion |
| 29 | `packages/editor/src/converters/converter.text-plain.test.ts` | yes | plate-owned | PT-P02 | parser/serializer policy belongs to Plate serializers; raw Plite owns only fragment insertion |
| 30 | `packages/editor/src/editor/get-selection-state.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 31 | `packages/editor/src/editor/resolve-element-drop-position.test.ts` | yes | portable-mixed | PT-H07 | native drag/drop substrate mixed with product drag handles and schema objects |
| 32 | `packages/editor/src/editor/validate-selection-machine.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 33 | `packages/editor/src/engine/editor/unhang-range.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 34 | `packages/editor/src/engine/node/is-void-node.test.ts` | yes | portable | PT-H03 | void/object boundary invariant |
| 35 | `packages/editor/src/engine/operation/inverse-operation.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 36 | `packages/editor/src/engine/path/compare-paths.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 37 | `packages/editor/src/engine/path/parent-path.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 38 | `packages/editor/src/engine/path/path-levels.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 39 | `packages/editor/src/engine/path/sibling-path.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 40 | `packages/editor/src/engine/point/transform-point.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 41 | `packages/editor/src/engine/range/ranges-overlap.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 42 | `packages/editor/src/internal-utils/__tests__/ranges.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 43 | `packages/editor/src/internal-utils/__tests__/values.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 44 | `packages/editor/src/internal-utils/apply-selection.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 45 | `packages/editor/src/internal-utils/build-index-maps.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 46 | `packages/editor/src/internal-utils/get-unwrap-target.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 47 | `packages/editor/src/internal-utils/is-hotkey.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 48 | `packages/editor/src/internal-utils/operation-to-patches.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 49 | `packages/editor/src/internal-utils/transform-operation.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 50 | `packages/editor/src/internal-utils/values.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 51 | `packages/editor/src/node-traversal/get-ancestor.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 52 | `packages/editor/src/node-traversal/get-ancestors-positional-same-type.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 53 | `packages/editor/src/node-traversal/get-ancestors.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 54 | `packages/editor/src/node-traversal/get-children-positional-same-type.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 55 | `packages/editor/src/node-traversal/get-children.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 56 | `packages/editor/src/node-traversal/get-first-child.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 57 | `packages/editor/src/node-traversal/get-highest-object-node.test.ts` | yes | portable | PT-H03 | void/object boundary invariant |
| 58 | `packages/editor/src/node-traversal/get-last-child.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 59 | `packages/editor/src/node-traversal/get-leaf.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 60 | `packages/editor/src/node-traversal/get-node.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 61 | `packages/editor/src/node-traversal/get-nodes.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 62 | `packages/editor/src/node-traversal/get-parent.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 63 | `packages/editor/src/node-traversal/get-sibling.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 64 | `packages/editor/src/node-traversal/get-text.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 65 | `packages/editor/src/node-traversal/get-value.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 66 | `packages/editor/src/node-traversal/has-node.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 67 | `packages/editor/src/paths/get-dirty-paths.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 68 | `packages/editor/src/paths/serialize-path.test.ts` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 69 | `packages/editor/src/plugins/plugin.internal.auto-close-brackets.test.tsx` | yes | portable-mixed | PT-H12 | raw event/command pressure mixed with Plate plugin or renderer API policy |
| 70 | `packages/editor/src/priority/priority.sort.test.ts` | yes | portable-mixed | PT-H12 | raw event/command pressure mixed with Plate plugin or renderer API policy |
| 71 | `packages/editor/src/renderers/renderer.types.test.tsx` | yes | portable-mixed | PT-H12 | raw event/command pressure mixed with Plate plugin or renderer API policy |
| 72 | `packages/editor/src/schema/get-block-object-schema.test.ts` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 73 | `packages/editor/src/schema/resolve-containers.test.ts` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 74 | `packages/editor/src/selectors/drag-selection.test.ts` | yes | portable-mixed | PT-H07 | native drag/drop substrate mixed with product drag handles and schema objects |
| 75 | `packages/editor/src/selectors/selector.get-active-annotations.test.ts` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 76 | `packages/editor/src/selectors/selector.get-active-decorators.test.ts` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 77 | `packages/editor/src/selectors/selector.get-applicable-schema.test.ts` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 78 | `packages/editor/src/selectors/selector.get-caret-word-selection.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 79 | `packages/editor/src/selectors/selector.get-default-style.test.ts` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 80 | `packages/editor/src/selectors/selector.get-fragment.test.ts` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 81 | `packages/editor/src/selectors/selector.get-mark-state.test.ts` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 82 | `packages/editor/src/selectors/selector.get-selected-blocks.test.ts` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 83 | `packages/editor/src/selectors/selector.get-selected-spans.test.ts` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 84 | `packages/editor/src/selectors/selector.get-selected-text-blocks.test.ts` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 85 | `packages/editor/src/selectors/selector.get-selected-value.test.ts` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 86 | `packages/editor/src/selectors/selector.get-selection-text.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 87 | `packages/editor/src/selectors/selector.is-active-annotation.test.ts` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 88 | `packages/editor/src/selectors/selector.is-active-decorator.test.ts` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 89 | `packages/editor/src/selectors/selector.is-overlapping-selection.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 90 | `packages/editor/src/selectors/selector.is-point-relative-to-selection.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 91 | `packages/editor/src/selectors/selector.is-selection-expanded.test.ts` | yes | portable | PT-H01 | selection/focus projection invariant |
| 92 | `packages/editor/src/test/_exports/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 93 | `packages/editor/src/test/gherkin-parameter-types.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 94 | `packages/editor/src/test/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 95 | `packages/editor/src/test/vitest/_exports/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 96 | `packages/editor/src/test/vitest/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 97 | `packages/editor/src/test/vitest/step-context.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 98 | `packages/editor/src/test/vitest/step-definitions.tsx` | yes | harness | none | upstream test harness/helper proof, not product/editor behavior |
| 99 | `packages/editor/src/test/vitest/test-editor.tsx` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 100 | `packages/editor/src/traversal/get-path-sub-schema.test.ts` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 101 | `packages/editor/src/traversal/get-union-schema.test.ts` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 102 | `packages/editor/src/utils/parse-blocks.test.ts` | yes | plate-owned | PT-P02 | parser/serializer policy belongs to Plate serializers; raw Plite owns only fragment insertion |
| 103 | `packages/editor/src/utils/util.block-offset.test.ts` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 104 | `packages/editor/src/utils/util.slice-text-block.test.ts` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 105 | `packages/editor/test-utils/boundary-equivalent.test.ts` | yes | portable | PT-H01 | generic selection helper invariant |
| 106 | `packages/editor/test-utils/editor-selection.test.ts` | yes | harness | none | upstream test harness/helper proof, not product/editor behavior |
| 107 | `packages/editor/test-utils/from-textspec.test.ts` | yes | harness | none | upstream test harness/helper proof, not product/editor behavior |
| 108 | `packages/editor/test-utils/selection-text.test.ts` | yes | portable | PT-H01 | generic selection helper invariant |
| 109 | `packages/editor/test-utils/string-overlap.test.ts` | yes | portable | PT-H01 | generic selection helper invariant |
| 110 | `packages/editor/test-utils/text-block-key.test.ts` | yes | harness | none | upstream test harness/helper proof, not product/editor behavior |
| 111 | `packages/editor/test-utils/text-marks.test.ts` | yes | harness | none | upstream test harness/helper proof, not product/editor behavior |
| 112 | `packages/editor/test-utils/text-selection.test.ts` | yes | harness | none | upstream test harness/helper proof, not product/editor behavior |
| 113 | `packages/editor/test-utils/to-textspec.test.ts` | yes | harness | none | upstream test harness/helper proof, not product/editor behavior |
| 114 | `packages/editor/tests/PortableTextEditor.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 115 | `packages/editor/tests/backspace-before-container.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 116 | `packages/editor/tests/behavior-api.test.tsx` | yes | portable-mixed | PT-H12 | raw event/command pressure mixed with Plate plugin or renderer API policy |
| 117 | `packages/editor/tests/behavior.snapshot-leak.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 118 | `packages/editor/tests/block-selectors-container.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 119 | `packages/editor/tests/child-selectors-container.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 120 | `packages/editor/tests/click-lonely-block-object-container.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 121 | `packages/editor/tests/code-block-registration.test.tsx` | yes | portable-mixed | PT-H12 | raw event/command pressure mixed with Plate plugin or renderer API policy |
| 122 | `packages/editor/tests/code-block.navigation.test.tsx` | yes | portable-mixed | PT-H12 | raw event/command pressure mixed with Plate plugin or renderer API policy |
| 123 | `packages/editor/tests/code-block.test.tsx` | yes | portable-mixed | PT-H12 | raw event/command pressure mixed with Plate plugin or renderer API policy |
| 124 | `packages/editor/tests/collaborative-editing.test.tsx` | yes | portable | PT-H08 | collaboration/history/remote selection invariant |
| 125 | `packages/editor/tests/composition.test.ts` | yes | portable | PT-H09 | IME/composition transport invariant |
| 126 | `packages/editor/tests/container-dual-type.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 127 | `packages/editor/tests/container-enter-escape.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 128 | `packages/editor/tests/container-insert-block.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 129 | `packages/editor/tests/container-normalization.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 130 | `packages/editor/tests/container-permutations.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 131 | `packages/editor/tests/container-render-focused-selected.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 132 | `packages/editor/tests/container-rendering.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 133 | `packages/editor/tests/container-resolution-rules.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 134 | `packages/editor/tests/container-typing.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 135 | `packages/editor/tests/cross-container-range-delete.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 136 | `packages/editor/tests/data-path.test.tsx` | yes | portable | PT-H11 | core path/operation/traversal invariant |
| 137 | `packages/editor/tests/define-container-leaf-conflict.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 138 | `packages/editor/tests/define-leaf-block-object-wrapper.test.tsx` | yes | portable | PT-H03 | void/object boundary invariant |
| 139 | `packages/editor/tests/define-leaf-inline-object-spacer.test.tsx` | yes | portable | PT-H03 | void/object boundary invariant |
| 140 | `packages/editor/tests/define-textblock.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 141 | `packages/editor/tests/delete-empty-container.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 142 | `packages/editor/tests/dom-structure.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 143 | `packages/editor/tests/edge-selectors-container.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 144 | `packages/editor/tests/editable-api.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 145 | `packages/editor/tests/editor-snapshot.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 146 | `packages/editor/tests/event.annotation.add.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 147 | `packages/editor/tests/event.annotation.remove.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 148 | `packages/editor/tests/event.annotation.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 149 | `packages/editor/tests/event.annotation.toggle.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 150 | `packages/editor/tests/event.block.set.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 151 | `packages/editor/tests/event.block.unset.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 152 | `packages/editor/tests/event.child.set.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 153 | `packages/editor/tests/event.child.unset.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 154 | `packages/editor/tests/event.decorator.add.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 155 | `packages/editor/tests/event.decorator.remove.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 156 | `packages/editor/tests/event.decorator.toggle.shortcut.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 157 | `packages/editor/tests/event.decorator.toggle.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 158 | `packages/editor/tests/event.delete.backward.test.tsx` | yes | portable | PT-H05 | delete/backspace editing invariant |
| 159 | `packages/editor/tests/event.delete.block.test.tsx` | yes | portable | PT-H05 | delete/backspace editing invariant |
| 160 | `packages/editor/tests/event.delete.forward.test.tsx` | yes | portable | PT-H05 | delete/backspace editing invariant |
| 161 | `packages/editor/tests/event.delete.matrix.test.tsx` | yes | portable | PT-H05 | delete/backspace editing invariant |
| 162 | `packages/editor/tests/event.delete.test.tsx` | yes | portable | PT-H05 | delete/backspace editing invariant |
| 163 | `packages/editor/tests/event.drag.drop.self-drop.test.tsx` | yes | portable-mixed | PT-H07 | native drag/drop substrate mixed with product drag handles and schema objects |
| 164 | `packages/editor/tests/event.drag.drop.test.tsx` | yes | portable-mixed | PT-H07 | native drag/drop substrate mixed with product drag handles and schema objects |
| 165 | `packages/editor/tests/event.focus.test.tsx` | yes | portable | PT-H01 | selection/focus projection invariant |
| 166 | `packages/editor/tests/event.history.redo.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 167 | `packages/editor/tests/event.history.undo.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 168 | `packages/editor/tests/event.input.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 169 | `packages/editor/tests/event.insert.block.test.tsx` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 170 | `packages/editor/tests/event.insert.blocks.test.tsx` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 171 | `packages/editor/tests/event.insert.child.test.tsx` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 172 | `packages/editor/tests/event.insert.inline-object.test.tsx` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 173 | `packages/editor/tests/event.insert.span.test.tsx` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 174 | `packages/editor/tests/event.insert.test.tsx` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 175 | `packages/editor/tests/event.insert.text.test.tsx` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 176 | `packages/editor/tests/event.keyboard.keydown.test.tsx` | yes | portable-mixed | PT-H12 | raw event/command pressure mixed with Plate plugin or renderer API policy |
| 177 | `packages/editor/tests/event.list-item.add.test.tsx` | yes | plate-owned | PT-P01 | list indentation/rendering policy belongs to Plate lists |
| 178 | `packages/editor/tests/event.move.block.cross-container.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 179 | `packages/editor/tests/event.move.block.selection.test.tsx` | yes | portable | PT-H01 | selection/focus projection invariant |
| 180 | `packages/editor/tests/event.move.block.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 181 | `packages/editor/tests/event.mutation.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 182 | `packages/editor/tests/event.paste.test.tsx` | yes | portable-mixed | PT-H06 | raw fragment clipboard behavior mixed with serializer/matcher policy |
| 183 | `packages/editor/tests/event.patch.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 184 | `packages/editor/tests/event.patches.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 185 | `packages/editor/tests/event.ready.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 186 | `packages/editor/tests/event.remove.text.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 187 | `packages/editor/tests/event.select.block.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 188 | `packages/editor/tests/event.select.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 189 | `packages/editor/tests/event.set.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 190 | `packages/editor/tests/event.split.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 191 | `packages/editor/tests/event.unset.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 192 | `packages/editor/tests/event.update-value.container.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 193 | `packages/editor/tests/event.update-value.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 194 | `packages/editor/tests/event.value-changed.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 195 | `packages/editor/tests/focus.test.tsx` | yes | portable | PT-H01 | selection/focus projection invariant |
| 196 | `packages/editor/tests/history.preserving-keys.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 197 | `packages/editor/tests/initial-render-registration.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 198 | `packages/editor/tests/inline-object-contenteditable.test.tsx` | yes | portable | PT-H03 | void/object boundary invariant |
| 199 | `packages/editor/tests/inline-objects.test.tsx` | yes | portable | PT-H03 | void/object boundary invariant |
| 200 | `packages/editor/tests/inline-pipeline-mode-inheritance.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 201 | `packages/editor/tests/insert-block.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 202 | `packages/editor/tests/insert-respects-sub-schema.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 203 | `packages/editor/tests/legacy-suppression.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 204 | `packages/editor/tests/list-index.test.tsx` | yes | plate-owned | PT-P01 | list indentation/rendering policy belongs to Plate lists |
| 205 | `packages/editor/tests/mark-state-selectors-container.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 206 | `packages/editor/tests/normalization.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 207 | `packages/editor/tests/overlapping-annotations.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 208 | `packages/editor/tests/performance.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 209 | `packages/editor/tests/placeholder-block.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 210 | `packages/editor/tests/plugin.document-title.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 211 | `packages/editor/tests/portable-text-editor.add-annotation.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 212 | `packages/editor/tests/positional-override-block-level.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 213 | `packages/editor/tests/positional-override-cross-scope.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 214 | `packages/editor/tests/positional-override-inline-level.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 215 | `packages/editor/tests/positional-override-isolation.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 216 | `packages/editor/tests/positional-override-negative.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 217 | `packages/editor/tests/pteWarningsSelfSolving.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 218 | `packages/editor/tests/range-decorations.test.tsx` | yes | portable | PT-H01 | selection/focus projection invariant |
| 219 | `packages/editor/tests/range-selectors-container.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 220 | `packages/editor/tests/recursive-list-cross-plugin-code-block.test.tsx` | yes | plate-owned | PT-P01 | list indentation/rendering policy belongs to Plate lists |
| 221 | `packages/editor/tests/recursive-schema.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 222 | `packages/editor/tests/register-node-clean-dom.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 223 | `packages/editor/tests/render-annotation.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 224 | `packages/editor/tests/render-block.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 225 | `packages/editor/tests/render-child.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 226 | `packages/editor/tests/render-count-regression.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 227 | `packages/editor/tests/render-decorator.test.tsx` | yes | plate-owned | PT-P01 | Portable Text marks, annotations, comments, or decorators are Plate product policy |
| 228 | `packages/editor/tests/render-default-prop.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 229 | `packages/editor/tests/schema-no-intermediate-row.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 230 | `packages/editor/tests/selection-after-remote-patches.test.tsx` | yes | portable | PT-H08 | collaboration/history/remote selection invariant |
| 231 | `packages/editor/tests/selection-emit-dedup.test.tsx` | yes | portable | PT-H08 | collaboration/history/remote selection invariant |
| 232 | `packages/editor/tests/selection-emit-stability.test.tsx` | yes | portable | PT-H08 | collaboration/history/remote selection invariant |
| 233 | `packages/editor/tests/self-solving.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 234 | `packages/editor/tests/serialize-deserialize.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 235 | `packages/editor/tests/setup.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 236 | `packages/editor/tests/tables.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 237 | `packages/editor/tests/test-editor.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 238 | `packages/editor/tests/text-edge-selectors-container.test.tsx` | yes | portable-mixed | PT-H02 | content-root behavior pressures Plite while schema/render policy belongs to Plate |
| 239 | `packages/editor/tests/text-plain-paste.test.tsx` | yes | plate-owned | PT-P02 | parser/serializer policy belongs to Plate serializers; raw Plite owns only fragment insertion |
| 240 | `packages/editor/tests/to-engine-range.test.tsx` | yes | portable | PT-H01 | selection/focus projection invariant |
| 241 | `packages/editor/tests/undo-merge-blocks.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 242 | `packages/editor/tests/undo-redo-collaboration.test.tsx` | yes | portable | PT-H08 | collaboration/history/remote selection invariant |
| 243 | `packages/editor/tests/unique-sibling-keys.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 244 | `packages/editor/tests/upload-images-on-paste.test.tsx` | yes | portable-mixed | PT-H06 | raw fragment clipboard behavior mixed with serializer/matcher policy |
| 245 | `packages/editor/tests/validation.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 246 | `packages/editor/tests/valueNormalization.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 247 | `packages/editor/tests/withEditableAPIDelete.test.tsx` | yes | portable | PT-H05 | delete/backspace editing invariant |
| 248 | `packages/editor/tests/withEditableAPIGetFragment.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 249 | `packages/editor/tests/withEditableAPIInsert.test.tsx` | yes | portable | PT-H04 | insert/split/break placement invariant |
| 250 | `packages/editor/tests/withEditableAPISelectionsOverlapping.test.tsx` | yes | portable | PT-H01 | selection/focus projection invariant |
| 251 | `packages/editor/tests/withPortableTextLists.test.tsx` | yes | plate-owned | PT-P01 | list indentation/rendering policy belongs to Plate lists |
| 252 | `packages/editor/tests/withPortableTextMarkModel.test.tsx` | yes | portable-mixed | PT-H12 | editor behavior with framework policy mixed in |
| 253 | `packages/editor/tests/withPortableTextSelections.test.tsx` | yes | portable | PT-H01 | selection/focus projection invariant |
| 254 | `packages/html/src/tests/fixtures/customFeatures.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 255 | `packages/html/src/tests/fixtures/defaultSchema.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 256 | `packages/html/src/tests/html-to-portable-text/app-sdk-quickstart-guide.gdocs.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 257 | `packages/html/src/tests/html-to-portable-text/app-sdk-quickstart-guide.terse-pt.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 258 | `packages/html/src/tests/html-to-portable-text/app-sdk-quickstart-guide.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 259 | `packages/html/src/tests/html-to-portable-text/app-sdk-quickstart-guide.word-online.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 260 | `packages/html/src/tests/html-to-portable-text/app-sdk-quickstart-guide.word-online.windows.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 261 | `packages/html/src/tests/html-to-portable-text/app-sdk-quickstart-guide.word.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 262 | `packages/html/src/tests/html-to-portable-text/app-sdk-quickstart-guide.word.windows.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 263 | `packages/html/src/tests/html-to-portable-text/blockquote.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 264 | `packages/html/src/tests/html-to-portable-text/custom-table-rule.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 265 | `packages/html/src/tests/html-to-portable-text/decorators.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 266 | `packages/html/src/tests/html-to-portable-text/flatten-nested-blocks.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 267 | `packages/html/src/tests/html-to-portable-text/flatten-tables.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 268 | `packages/html/src/tests/html-to-portable-text/from-the-wild-3.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 269 | `packages/html/src/tests/html-to-portable-text/from-the-wild-5.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 270 | `packages/html/src/tests/html-to-portable-text/from-the-wild-5.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 271 | `packages/html/src/tests/html-to-portable-text/from-the-wild-5.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 272 | `packages/html/src/tests/html-to-portable-text/gdocs-whitespace-normalize.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 273 | `packages/html/src/tests/html-to-portable-text/gdocs-whitespace-normalize.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 274 | `packages/html/src/tests/html-to-portable-text/gdocs-whitespace-normalize.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 275 | `packages/html/src/tests/html-to-portable-text/google-docs.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 276 | `packages/html/src/tests/html-to-portable-text/list.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 277 | `packages/html/src/tests/html-to-portable-text/lists.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 278 | `packages/html/src/tests/html-to-portable-text/lists.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 279 | `packages/html/src/tests/html-to-portable-text/lists.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 280 | `packages/html/src/tests/html-to-portable-text/nested-containers.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 281 | `packages/html/src/tests/html-to-portable-text/nested-containers.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 282 | `packages/html/src/tests/html-to-portable-text/nested-containers.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 283 | `packages/html/src/tests/html-to-portable-text/schema.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 284 | `packages/html/src/tests/html-to-portable-text/span.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 285 | `packages/html/src/tests/html-to-portable-text/tables.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 286 | `packages/html/src/tests/html-to-portable-text/test-utils.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 287 | `packages/html/src/tests/html-to-portable-text/whitespace-1.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 288 | `packages/html/src/tests/html-to-portable-text/whitespace-1.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 289 | `packages/html/src/tests/html-to-portable-text/whitespace-1.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 290 | `packages/html/src/tests/html-to-portable-text/whitespace.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 291 | `packages/html/src/tests/html-to-portable-text/word-online.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 292 | `packages/html/src/tests/html-to-portable-text/word.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 293 | `packages/html/src/tests/snapshot-tests/annotations/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 294 | `packages/html/src/tests/snapshot-tests/annotations/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 295 | `packages/html/src/tests/snapshot-tests/annotations/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 296 | `packages/html/src/tests/snapshot-tests/blockTags/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 297 | `packages/html/src/tests/snapshot-tests/blockTags/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 298 | `packages/html/src/tests/snapshot-tests/blockTags/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 299 | `packages/html/src/tests/snapshot-tests/codeBlock/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 300 | `packages/html/src/tests/snapshot-tests/codeBlock/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 301 | `packages/html/src/tests/snapshot-tests/codeBlock/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 302 | `packages/html/src/tests/snapshot-tests/complex/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 303 | `packages/html/src/tests/snapshot-tests/complex/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 304 | `packages/html/src/tests/snapshot-tests/complex/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 305 | `packages/html/src/tests/snapshot-tests/customRules/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 306 | `packages/html/src/tests/snapshot-tests/customRules/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 307 | `packages/html/src/tests/snapshot-tests/customRules/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 308 | `packages/html/src/tests/snapshot-tests/customSchema/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 309 | `packages/html/src/tests/snapshot-tests/customSchema/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 310 | `packages/html/src/tests/snapshot-tests/customSchema/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 311 | `packages/html/src/tests/snapshot-tests/decorators/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 312 | `packages/html/src/tests/snapshot-tests/decorators/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 313 | `packages/html/src/tests/snapshot-tests/decorators/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 314 | `packages/html/src/tests/snapshot-tests/fromTheWild1/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 315 | `packages/html/src/tests/snapshot-tests/fromTheWild1/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 316 | `packages/html/src/tests/snapshot-tests/fromTheWild1/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 317 | `packages/html/src/tests/snapshot-tests/fromTheWild2/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 318 | `packages/html/src/tests/snapshot-tests/fromTheWild2/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 319 | `packages/html/src/tests/snapshot-tests/fromTheWild2/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 320 | `packages/html/src/tests/snapshot-tests/fromTheWild4/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 321 | `packages/html/src/tests/snapshot-tests/fromTheWild4/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 322 | `packages/html/src/tests/snapshot-tests/fromTheWild4/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 323 | `packages/html/src/tests/snapshot-tests/gdocs/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 324 | `packages/html/src/tests/snapshot-tests/gdocs/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 325 | `packages/html/src/tests/snapshot-tests/gdocs/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 326 | `packages/html/src/tests/snapshot-tests/gdocsFirefox/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 327 | `packages/html/src/tests/snapshot-tests/gdocsFirefox/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 328 | `packages/html/src/tests/snapshot-tests/gdocsFirefox/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 329 | `packages/html/src/tests/snapshot-tests/gdocsLists/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 330 | `packages/html/src/tests/snapshot-tests/gdocsLists/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 331 | `packages/html/src/tests/snapshot-tests/gdocsLists/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 332 | `packages/html/src/tests/snapshot-tests/gdocsStrikethroughLink/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 333 | `packages/html/src/tests/snapshot-tests/gdocsStrikethroughLink/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 334 | `packages/html/src/tests/snapshot-tests/gdocsStrikethroughLink/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 335 | `packages/html/src/tests/snapshot-tests/gdocsWhitespaceRemove/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 336 | `packages/html/src/tests/snapshot-tests/gdocsWhitespaceRemove/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 337 | `packages/html/src/tests/snapshot-tests/gdocsWhitespaceRemove/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 338 | `packages/html/src/tests/snapshot-tests/gdocsWhitespaceRemoveFirefox/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 339 | `packages/html/src/tests/snapshot-tests/gdocsWhitespaceRemoveFirefox/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 340 | `packages/html/src/tests/snapshot-tests/gdocsWhitespaceRemoveFirefox/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 341 | `packages/html/src/tests/snapshot-tests/githubIssue/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 342 | `packages/html/src/tests/snapshot-tests/githubIssue/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 343 | `packages/html/src/tests/snapshot-tests/githubIssue/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 344 | `packages/html/src/tests/snapshot-tests/index.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 345 | `packages/html/src/tests/snapshot-tests/simple/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 346 | `packages/html/src/tests/snapshot-tests/simple/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 347 | `packages/html/src/tests/snapshot-tests/simple/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 348 | `packages/html/src/tests/snapshot-tests/stegaUnicodeCleaner/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 349 | `packages/html/src/tests/snapshot-tests/stegaUnicodeCleaner/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 350 | `packages/html/src/tests/snapshot-tests/stegaUnicodeCleaner/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 351 | `packages/html/src/tests/snapshot-tests/types.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 352 | `packages/html/src/tests/snapshot-tests/whitespace2/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 353 | `packages/html/src/tests/snapshot-tests/whitespace2/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 354 | `packages/html/src/tests/snapshot-tests/whitespace2/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 355 | `packages/html/src/tests/snapshot-tests/whitespace3/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 356 | `packages/html/src/tests/snapshot-tests/whitespace3/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 357 | `packages/html/src/tests/snapshot-tests/whitespace3/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 358 | `packages/html/src/tests/snapshot-tests/whitespaceInPreTags/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 359 | `packages/html/src/tests/snapshot-tests/whitespaceInPreTags/input.html` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 360 | `packages/html/src/tests/snapshot-tests/whitespaceInPreTags/output.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 361 | `packages/html/src/tests/test-key-generator.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 362 | `packages/keyboard-shortcuts/src/is-keyboard-shortcut.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 363 | `packages/markdown/src/escape.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 364 | `packages/markdown/src/example-document.advanced.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 365 | `packages/markdown/src/example-document.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 366 | `packages/markdown/src/markdown-to-portable-text.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 367 | `packages/markdown/src/portable-text-to-markdown.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 368 | `packages/patches/src/apply-patch.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 369 | `packages/plugin-character-pair-decorator/src/regex.character-pair.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 370 | `packages/plugin-character-pair-decorator/src/sub-schema.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 371 | `packages/plugin-emoji-picker/src/emoji-picker.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 372 | `packages/plugin-input-rule/src/edge-cases.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 373 | `packages/plugin-input-rule/src/emoji-picker-rules.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 374 | `packages/plugin-input-rule/src/flag-preservation.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 375 | `packages/plugin-input-rule/src/rule.stock-ticker.container.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 376 | `packages/plugin-input-rule/src/rule.stock-ticker.sub-schema.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 377 | `packages/plugin-input-rule/src/rule.stock-ticker.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 378 | `packages/plugin-markdown-shortcuts/src/behavior.markdown.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 379 | `packages/plugin-markdown-shortcuts/src/rule.markdown-link.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 380 | `packages/plugin-markdown-shortcuts/src/sub-schema.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 381 | `packages/plugin-paste-link/src/looks-like-url.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 382 | `packages/plugin-paste-link/src/paste-link.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 383 | `packages/plugin-sdk-value/src/plugin.sdk-value.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 384 | `packages/plugin-sdk-value/src/plugin.value-sync.browser.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 385 | `packages/plugin-typeahead-picker/src/emoji-picker.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 386 | `packages/plugin-typeahead-picker/src/mention-picker.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 387 | `packages/plugin-typeahead-picker/src/on-dismiss.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 388 | `packages/plugin-typeahead-picker/src/pattern-edge-cases.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 389 | `packages/plugin-typeahead-picker/src/slash-command-picker.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 390 | `packages/plugin-typeahead-picker/src/trigger-guard.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 391 | `packages/plugin-typeahead-picker/src/typeahead-picker.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 392 | `packages/plugin-typeahead-picker/src/use-typeahead-picker.regression.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 393 | `packages/plugin-typography/src/disallow-in-code.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 394 | `packages/plugin-typography/src/input-rule.ellipsis.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 395 | `packages/plugin-typography/src/input-rule.em-dash.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 396 | `packages/plugin-typography/src/input-rule.multiplication.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 397 | `packages/plugin-typography/src/input-rule.smart-quotes.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 398 | `packages/racejar/example-playwright/playwright-homepage.test.ts` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |
| 399 | `packages/racejar/example/vitest.hello-herman.test.ts` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |
| 400 | `packages/racejar/example/vitest.hooks.test.ts` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |
| 401 | `packages/racejar/src/playwright/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 402 | `packages/racejar/src/playwright/playwright-gherkin-driver.ts` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |
| 403 | `packages/sanity-bridge/src/same-name-objects.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 404 | `packages/sanity-bridge/src/sanity-schema-to-portable-text-schema.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 405 | `packages/schema/src/compile-schema.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 406 | `packages/schema/src/get-sub-schema.test.ts` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 407 | `packages/test/CHANGELOG.md` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 408 | `packages/test/README.md` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 409 | `packages/test/package.config.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 410 | `packages/test/package.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 411 | `packages/test/src/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 412 | `packages/test/src/terse-pt.test.ts` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |
| 413 | `packages/test/src/terse-pt.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 414 | `packages/test/src/test-key-generator.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 415 | `packages/test/tsconfig.dist.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 416 | `packages/test/tsconfig.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 417 | `packages/test/tsconfig.settings.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 418 | `packages/toolbar/src/use-toolbar-schema.test.tsx` | yes | plate-owned | PT-P02 | serializer, schema, plugin, toolbar, bridge, or product package belongs to Plate/docs |
| 419 | `react-portabletext/test/components.test.tsx` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |
| 420 | `react-portabletext/test/fixtures/001-empty-block.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 421 | `react-portabletext/test/fixtures/002-single-span.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 422 | `react-portabletext/test/fixtures/003-multiple-spans.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 423 | `react-portabletext/test/fixtures/004-basic-mark-single-span.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 424 | `react-portabletext/test/fixtures/005-basic-mark-multiple-adjacent-spans.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 425 | `react-portabletext/test/fixtures/006-basic-mark-nested-marks.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 426 | `react-portabletext/test/fixtures/007-link-mark-def.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 427 | `react-portabletext/test/fixtures/008-plain-header-block.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 428 | `react-portabletext/test/fixtures/009-messy-link-text.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 429 | `react-portabletext/test/fixtures/010-basic-bullet-list.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 430 | `react-portabletext/test/fixtures/011-basic-numbered-list.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 431 | `react-portabletext/test/fixtures/014-nested-lists.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 432 | `react-portabletext/test/fixtures/015-all-basic-marks.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 433 | `react-portabletext/test/fixtures/016-deep-weird-lists.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 434 | `react-portabletext/test/fixtures/017-all-default-block-styles.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 435 | `react-portabletext/test/fixtures/018-marks-all-the-way-down.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 436 | `react-portabletext/test/fixtures/019-keyless.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 437 | `react-portabletext/test/fixtures/020-empty-array.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 438 | `react-portabletext/test/fixtures/021-list-without-level.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 439 | `react-portabletext/test/fixtures/022-inline-nodes.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 440 | `react-portabletext/test/fixtures/023-hard-breaks.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 441 | `react-portabletext/test/fixtures/024-inline-objects.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 442 | `react-portabletext/test/fixtures/026-inline-block-with-text.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 443 | `react-portabletext/test/fixtures/027-styled-list-items.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 444 | `react-portabletext/test/fixtures/028-custom-list-item-type.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 445 | `react-portabletext/test/fixtures/050-custom-block-type.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 446 | `react-portabletext/test/fixtures/052-custom-marks.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 447 | `react-portabletext/test/fixtures/053-override-default-marks.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 448 | `react-portabletext/test/fixtures/060-list-issue.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 449 | `react-portabletext/test/fixtures/061-missing-mark-component.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 450 | `react-portabletext/test/fixtures/062-custom-block-type-with-children.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 451 | `react-portabletext/test/fixtures/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 452 | `react-portabletext/test/mutations.test.tsx` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |
| 453 | `react-portabletext/test/portable-text.test.tsx` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |
| 454 | `react-portabletext/test/toPlainText.test.ts` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |
| 455 | `react-portabletext/test/typegen/sanity.cli.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 456 | `react-portabletext/test/typegen/sanity.config.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 457 | `react-portabletext/test/typegen/sanity.types.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 458 | `react-portabletext/test/typegen/schema.json` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 459 | `react-portabletext/test/typegen/typegen.test-d.tsx` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |
| 460 | `to-html/test/escaping.test.ts` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |
| 461 | `to-html/test/fixtures/001-empty-block.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 462 | `to-html/test/fixtures/002-single-span.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 463 | `to-html/test/fixtures/003-multiple-spans.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 464 | `to-html/test/fixtures/004-basic-mark-single-span.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 465 | `to-html/test/fixtures/005-basic-mark-multiple-adjacent-spans.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 466 | `to-html/test/fixtures/006-basic-mark-nested-marks.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 467 | `to-html/test/fixtures/007-link-mark-def.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 468 | `to-html/test/fixtures/008-plain-header-block.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 469 | `to-html/test/fixtures/009-messy-link-text.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 470 | `to-html/test/fixtures/010-basic-bullet-list.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 471 | `to-html/test/fixtures/011-basic-numbered-list.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 472 | `to-html/test/fixtures/012-image-support.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 473 | `to-html/test/fixtures/013-materialized-image-support.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 474 | `to-html/test/fixtures/014-nested-lists.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 475 | `to-html/test/fixtures/015-all-basic-marks.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 476 | `to-html/test/fixtures/016-deep-weird-lists.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 477 | `to-html/test/fixtures/017-all-default-block-styles.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 478 | `to-html/test/fixtures/018-marks-all-the-way-down.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 479 | `to-html/test/fixtures/019-keyless.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 480 | `to-html/test/fixtures/020-empty-array.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 481 | `to-html/test/fixtures/021-list-without-level.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 482 | `to-html/test/fixtures/022-inline-nodes.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 483 | `to-html/test/fixtures/023-hard-breaks.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 484 | `to-html/test/fixtures/024-inline-images.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 485 | `to-html/test/fixtures/025-image-with-hotspot.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 486 | `to-html/test/fixtures/026-inline-block-with-text.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 487 | `to-html/test/fixtures/027-styled-list-items.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 488 | `to-html/test/fixtures/028-custom-list-item-type.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 489 | `to-html/test/fixtures/029-lists-with-numbering.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 490 | `to-html/test/fixtures/040-injection-link-href.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 491 | `to-html/test/fixtures/050-custom-block-type.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 492 | `to-html/test/fixtures/051-override-defaults.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 493 | `to-html/test/fixtures/052-custom-marks.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 494 | `to-html/test/fixtures/053-override-default-marks.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 495 | `to-html/test/fixtures/060-list-issue.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 496 | `to-html/test/fixtures/061-missing-mark-serializer.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 497 | `to-html/test/fixtures/062-multiple-spaces.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 498 | `to-html/test/fixtures/063-custom-escape-html.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 499 | `to-html/test/fixtures/index.ts` | no | harness | none | support file discovered by inventory path but no test/scenario call |
| 500 | `to-html/test/mutations.test.ts` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |
| 501 | `to-html/test/portable-text.test.ts` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |
| 502 | `to-html/test/serializers.test.ts` | yes | skip | none | non-editor package row with no Plite/Plate harvest value |

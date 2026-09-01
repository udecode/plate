# Component prop type audit

## Verdict

Local component prop aliases were pure navigation tax. The final authored tree
has zero named component prop contracts without an actual cross-file consumer
or published entrypoint owner.

## Coverage

- Roots: `apps/**`, `benchmarks/**`, `docs/**`, `packages/**`, `tooling/**`
- Reviewed source files: 3,634
- Reviewed TSX files: 1,809
- Files with component-shaped declarations: 519
- Component-shaped declarations: 1,693
- Stable baseline candidates: 125 in 84 files
- Stable baseline violations: 109 in 72 files
- Final retained contracts: 20 in 16 files
- Final violations: 0
- Live cleanup operations: 117 local declarations inlined. The stable
  baseline comparison below records 110 declaration identities; the extra
  operations were recursive aliases exposed by the first expansion pass.
- Deferred: 0

The machine-readable final manifest is
`docs/plans/artifacts/inline-component-prop-types/component-prop-ledger.json`.
The audit excludes dependency trees, `.next`, `.turbo`, build, coverage, and
`dist` output; generated registry output; `apps/www/src/generated/**`; and
`templates/**`. Their authored sources or generators are the owners.

## Decision law

1. Inline a prop shape owned by one component, including same-file reuse.
2. Keep a named type only when another file actually consumes the export or a
   published package entrypoint exposes the contract to external consumers.
3. Keep honest state, domain, and descriptor contracts inside inline
   `Pick`/`Omit` expressions. Do not duplicate those models into prop bags.
4. An internal barrel reexport without a consumer or package entrypoint does
   not earn an alias.

## Candidate matrix

| Rank | Candidate | Evidence | Decision | Navigation effect |
|---:|---|---|---|---|
| 1 | App/docs-local `*Props` | One component owner; no external import | inline | Removes one declaration jump per component |
| 2 | Copied registry primitive props | Registry file owns both component and type | inline | Source remains readable after copy/install |
| 3 | Generic Plate/Plite renderer bags | Alias only restated the component signature | inline | Generics are visible at the call owner |
| 4 | Same-file shared prop aliases | Repetition stayed inside one file | inline | One owner, no fake reuse boundary |
| 5 | Export with a real importing consumer | Import graph proves another file needs the exact type | keep | Public/private boundary becomes explicit |
| 6 | Published entrypoint contract | Package source entrypoint is reachable from `exports` | keep | External TypeScript contract stays named |
| 7 | State/domain/descriptor model | Independent semantic owner selected by inline props | keep | Avoids duplicating a real model |

No split or new component layer was justified. The accepted action was
delete-and-inline; extraction would have recreated the problem.

## Agent navigation score

| Measure | Before | After |
|---|---:|---:|
| Invalid named prop contracts | 109 | 0 |
| Files holding invalid contracts | 72 | 0 |
| Files containing retained named contracts | 84 candidate files total | 16 |
| Declaration jump for local props | Required | Removed |
| Proof owner | Manual search | One deterministic lint audit |
| Public/private decision | Alias name implied reuse | Import/entrypoint graph proves reuse |

## Complete stable-baseline localized list

- `apps/www/src/app/(app)/docs/layout.tsx`: `DocsLayoutProps`
- `apps/www/src/app/(app)/docs/releases/[major]/page.tsx`: `ReleaseMajorPageProps`
- `apps/www/src/app/(app)/examples/plite/_examples/android-tests.tsx`: `AndroidTestCase`
- `apps/www/src/app/(app)/examples/plite/_examples/code-highlighting.tsx`: `LanguageSelectProps`
- `apps/www/src/app/(app)/examples/plite/_examples/components/index.tsx`: `ButtonProps`, `IconProps`, `DivProps`
- `apps/www/src/app/(app)/examples/plite/_examples/embeds.tsx`: `UrlInputProps`
- `apps/www/src/app/(app)/examples/plite/_examples/hovering-toolbar.tsx`: `FormatButtonProps`
- `apps/www/src/app/(app)/examples/plite/_examples/iframe.tsx`: `MarkButtonProps`, `IFrameProps`
- `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx`: `PaginationElementProps`, `PaginationPageViewProps`
- `apps/www/src/app/(app)/examples/plite/_examples/paste-html.tsx`: `SafeLinkProps`
- `apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx`: `BlockButtonProps`, `MarkButtonProps`
- `apps/www/src/app/(app)/examples/plite/_examples/search-highlighting.tsx`: `SearchLeafProps`
- `apps/www/src/app/(app)/examples/plite/plite-examples-shell.tsx`: `PliteExamplesShellProps`, `PliteExamplesNavLinksProps`
- `apps/www/src/app/layout.tsx`: `RootLayoutProps`
- `apps/www/src/components/api-list.tsx`: `Item`, `APIListProps`
- `apps/www/src/components/block-display.tsx`: `BlockDisplayProps`
- `apps/www/src/components/cards.tsx`: `CardProps`
- `apps/www/src/components/code-block-command.tsx`: `CodeBlockCommandProps`
- `apps/www/src/components/code-block-wrapper.tsx`: `CodeBlockProps`
- `apps/www/src/components/component-example.tsx`: `ComponentExampleProps`
- `apps/www/src/components/component-installation.tsx`: `ComponentInstallationProps`
- `apps/www/src/components/component-preview-pro.tsx`: `ComponentPreviewProps`
- `apps/www/src/components/component-preview.tsx`: `ComponentPreviewProps`
- `apps/www/src/components/component-source.tsx`: `ComponentSourceProps`
- `apps/www/src/components/copy-button.tsx`: `CopyNpmCommandButtonProps`, `CopyWithClassNamesProps`, `CopyButtonProps`
- `apps/www/src/components/counting-numbers.tsx`: `CountingNumbersProps`
- `apps/www/src/components/framework-docs.tsx`: `FrameworkDocsProps`
- `apps/www/src/components/mobile-nav.tsx`: `MobileLinkProps`
- `apps/www/src/components/themed-syntax-highlighter.tsx`: `ThemedSyntaxHighlighterProps`
- `apps/www/src/components/tree-icon.tsx`: `TreeIconProps`
- `apps/www/src/components/ui/codeblock.tsx`: `Props`
- `apps/www/src/components/ui/native-select.tsx`: `NativeSelectProps`
- `apps/www/src/lib/block-preview-page.tsx`: `BlockPreviewPageProps`
- `apps/www/src/registry/bases/base/context-menu.tsx`: `ContextMenuProps`, `ContextMenuContentProps`, `ContextMenuTriggerProps`
- `apps/www/src/registry/bases/base/dropdown-menu.tsx`: `DropdownMenuContentProps`, `DropdownMenuTriggerProps`
- `apps/www/src/registry/bases/base/floating-popover.tsx`: `FloatingPopoverProps`, `FloatingPopoverContentProps`
- `apps/www/src/registry/bases/base/toolbar.tsx`: `ToolbarButtonProps`, `ToolbarSplitButtonPrimaryProps`
- `apps/www/src/registry/bases/radix/context-menu.tsx`: `ContextMenuProps`, `ContextMenuContentProps`, `ContextMenuTriggerProps`
- `apps/www/src/registry/bases/radix/dropdown-menu.tsx`: `DropdownMenuContentProps`, `DropdownMenuTriggerProps`
- `apps/www/src/registry/bases/radix/floating-popover.tsx`: `FloatingPopoverProps`, `FloatingPopoverContentProps`
- `apps/www/src/registry/bases/radix/toolbar.tsx`: `ToolbarButtonProps`, `ToolbarSplitButtonPrimaryProps`
- `apps/www/src/registry/blocks/fumadocs/mdx-plate-components.tsx`: `Item`, `APIListProps`
- `apps/www/src/registry/components/editor/block-list-static.tsx`: `BlockListProps`
- `apps/www/src/registry/components/editor/block-list.tsx`: `ListWrapperProps`
- `apps/www/src/registry/components/editor/code-block-static.tsx`: `CodeBlockElementStaticProps`
- `apps/www/src/registry/components/editor/code-block.tsx`: `CodeBlockElementProps`
- `apps/www/src/registry/components/editor/dnd.tsx`: `DraggableProps`
- `apps/www/src/registry/components/editor/editor.tsx`: `EditorProps`
- `apps/www/src/registry/components/editor/floating-toolbar.tsx`: `FloatingToolbarProps`
- `apps/www/src/registry/components/editor/heading-static.tsx`: `HeadingProps`
- `apps/www/src/registry/components/editor/inline-combobox.tsx`: `InlineComboboxProps`
- `apps/www/src/registry/components/editor/mark-toolbar-button.tsx`: `MarkToolbarButtonProps`
- `apps/www/src/registry/components/editor/select-command.tsx`: `InputProps`, `ItemProps`, `ListProps`, `LoadingProps`, `SeparatorProps`, `CommandProps`, `DialogProps`, `EmptyProps`, `GroupProps`
- `apps/www/src/registry/examples/version-history-demo.tsx`: `DiffProps`
- `docs/transplant/slate-v2/archive/site/components/ComponentLoader.tsx`: `LoaderProps`
- `docs/transplant/slate-v2/archive/site/components/ExampleLayout.tsx`: `ExampleLayoutProps`
- `packages/platejs/src/dnd/react/DndScroller.tsx`: `ScrollAreaProps`
- `packages/platejs/src/react/components/plate-nodes.tsx`: `PlateElementComponentProps`, `PlateTextComponentProps`, `PlateLeafComponentProps`
- `packages/platejs/src/react/stores/element/useElementStore.spec.tsx`: `ConsumerProps`
- `packages/platejs/src/react/utils/pluginRenderElement.tsx`: `PlateElementRenderProps`
- `packages/platejs/src/static/components/plite-nodes.tsx`: `PliteElementComponentProps`, `PliteTextComponentProps`, `PliteLeafComponentProps`
- `packages/platejs/test/react/PlateTest.tsx`: `PlateTestProps`
- `packages/platejs/test/yjs/react-contract.spec.tsx`: `EditorProbeProps`
- `packages/plitejs/src/page-layout/react.tsx`: `PagedEditableProps`
- `packages/plitejs/src/react/components/dom-coverage-boundary.tsx`: `DOMCoverageBoundaryBaseProps`, `DOMCoverageBoundaryRangeProps`
- `packages/plitejs/src/react/components/editable-dom-commit-fence.tsx`: `EditableDOMCommitFenceProps`, `EditableDOMCommitFenceStateProps`
- `packages/plitejs/src/react/components/editable-text.tsx`: `EditableTextProps`, `RenderEditableTextProps`
- `packages/plitejs/src/react/components/editable.tsx`: `EditableDOMRootProps`, `RenderPlaceholderProps`
- `packages/plitejs/src/react/components/plite-element.tsx`: `PliteElementProps`
- `packages/plitejs/src/react/components/plite-placeholder.tsx`: `PlitePlaceholderProps`
- `packages/plitejs/src/react/components/plite.tsx`: `PliteRuntimeViewProps`, `PliteSingleEditorProps`
- `packages/plitejs/test/react/dom-strategy-and-scroll.tsx`: `TestEditorSurfaceProps`
- `packages/plitejs/test/react/dom-strategy-page-virtualization.test.tsx`: `TestEditorSurfaceProps`

`PagedEditableProps` is localized at the retired `page-layout` path and kept at
the canonical published `pagination/react` owner. That is a move, not a public
contract deletion.

## Complete survivor list

| Contract | Evidence |
|---|---|
| `DocPageProps` | Imported by two localized route files |
| `EmojiPickerOptions` | Imported by `emoji-toolbar-button.tsx` |
| `DndScrollerOptions` | Imported by the DnD store plugin and published |
| `NodeSelectionDragProps` | Published from `platejs/react` |
| `NodeSelectionHighlightProps` | Published from `platejs/react` |
| `PlateNodeProps` | Four package consumers and `platejs/react` |
| `PlateHTMLProps` | Published from `platejs/react` |
| `PlateProps` | Two current repo consumers and `platejs/react` |
| `PlateContentProps` | One current repo consumer and `platejs/react` |
| `PlateViewProps` | Published from `platejs/react` |
| `ResizableProps` | Published from `platejs/resizable/react` |
| `ResizeHandleProps` | Published from `platejs/resizable/react` |
| `PlateStaticProps` | Three current repo consumers and `platejs/static` |
| `PliteNodeProps` | Published from `platejs/static` |
| `PliteHTMLProps` | Published from `platejs/static` |
| `PagedEditableProps` | Published from `plitejs/pagination/react` |
| `EditableProps` | Three current repo consumers and `plitejs/react` |
| `PliteProps` | Published from `plitejs/react` |
| `PliteRuntimeProps` | Published from `plitejs/react` |
| `PlateTestProps` | Published from `@platejs/test` |

## Enforcement and scale

`node tooling/scripts/check-inline-component-props.mjs` parses each authored
source once, builds the import/reexport graph, discovers package entrypoints,
and fails on an unjustified local contract. Root `pnpm lint` invokes it.

The first implementation walked a whole AST once per imported type and took
13.70s median over three runs. One identifier-use walk per file reduced the
warm median to 4.72s, a 2.9x speedup and 65.5% reduction, while preserving the
same 1,809-file result. Product runtime scale is N/A: types erase and the audit
runs only in developer/CI lint.

## Release and proof classification

- Package changeset: N/A. No published package entrypoint symbol was removed;
  retained public contracts keep their names, and emitted runtime is unchanged.
- Barrels: N/A. No public export or exported file layout changed.
- Registry changelog: `2026-08-31-inline-component-props` records the copied
  source contract. The generated changelog index and registry payloads pass
  their owning generators.
- Browser: N/A. The edits only move erased TypeScript annotations; a browser
  cannot observe them.
- Runtime benchmark: N/A. No runtime code, subscription, store, or render work
  was added.

## Agent-native capability map

| Action | Route | Source owner | Mirror/doc | Proof | Status |
|---|---|---|---|---|---|
| Author component props | `plate-ui` | `.agents/rules/plate-ui*` | generated `plate-ui` skill | audit command | pass |
| Judge API locality | `best-api` | `.agents/rules/best-api.mdc` | generated `best-api` skill | source/mirror search | pass |
| Enforce repo-wide | `pnpm lint` | `tooling/scripts/check-inline-component-props.mjs` | `package.json` | 10 focused tests + full audit | pass |
| Audit future migration | `plate-next` doctrine 134 | Plate Next version registry | generated `plate-next` skill | version validation | pass |

No agent-native gap remains. The source rules, generated mirrors, discoverable
root command, deterministic artifact, and package proof all have one owner.

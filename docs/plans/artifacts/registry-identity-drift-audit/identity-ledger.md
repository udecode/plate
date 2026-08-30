# Registry identity audit ledger

Scope: `apps/www/src/registry/**/*.{ts,tsx}`.

Classification law:

- capability configuration/action: `PLUGINS.*` or an exact descriptor;
- runtime element/property identity: `editor.plugin(reference).type` / `.key`;
- copied value, fixture, serialized payload, or local schema declaration:
  explicit persisted literal;
- stable feature-owned document property: its owning typed field/literal, not a
  global identity catalogue.

## Migration-owner files

| Class | Files | Verdict |
|---|---:|---|
| Capability-keyed override records | 3 | Repair bare keys in DOCX, Suggestion, and Tabbable kits with computed `PLUGINS.*` keys. |
| Runtime node queries/comparisons | 7 | Repair table/cell queries, chat table detection, block-selection exclusions, suggestion type labelling, and inline-equation detection with editor portals. |
| Runtime mark/property access | 3 | Repair Markdown plain marks, AI comment/suggestion marks, and comment insertion with exact plugin keys. |
| Capability action/menu maps | 11 | Keep `PLUGINS.*`; replace any newly bare capability keys with computed names. |
| Feature-owned persisted properties | 10 | Keep typed `listStyleType`, `textAlign`, `cssText`, media subtype, and basic mark fields; do not recreate a global property bag. |
| Copied values, fixtures, local schema values, and type declarations | 14 | Keep explicit persisted literals; package descriptors would create false runtime coupling. |

## Known repair rows

| Path / surface | Class | Current drift | Final owner |
|---|---|---|---|
| `components/editor/plugins/markdown-kit.tsx` | property key | raw `suggestion` / `comment` serializer keys | configured Suggestion and Comment descriptor portals |
| `components/editor/plugins/docx-export-kit.tsx` | capability map | bare override component keys | `PLUGINS.*` |
| `components/editor/plugins/suggestion-kit.tsx` | capability map and mark key | bare trailing-block override key and CSS selector derived from capability name | `PLUGINS.trailingBlock` and suggestion portal key |
| `components/editor/plugins/tabbable-kit.tsx` | capability map | bare indent override key | `PLUGINS.indent` |
| `app/api/ai/command/utils.ts` | runtime element type | raw table and table-cell matchers | editor portals |
| `components/editor/use-chat.ts` | runtime element/property identity | raw table/cell and comment identities | editor portals |
| `ui/table-toolbar-button.tsx` | runtime element type | raw table matcher | Table portal |
| `ui/ai-menu.tsx` | runtime property key | raw suggestion/comment reads | Suggestion/Comment portals |
| `lib/block-discussion-index.ts` | runtime element type | raw type-indexed label map and inline-equation comparison | editor-derived type resolver |
| `ui/block-selection.tsx` | runtime element type | raw table/table-row comparisons | editor portals |
| `ui/suggestion-node.tsx` | runtime element type | raw column-group comparison | editor portal at the render owner |

## File classification

The migration manifest contains 33 files that removed `KEYS` or `NODES`, plus
three same-class runtime files found by the follow-up sweep: 36/36 classified.

| Path | Classification | Verdict |
|---|---|---|
| `components/editor/plate-types.ts` | persisted TypeScript AST contract | keep explicit type literals |
| `components/editor/plugins/docx-export-kit.tsx` | capability-keyed component overrides | fixed with `PLUGINS.*` |
| `components/editor/plugins/list-base-kit.tsx` | capability targets plus feature-owned `listStyleType` | keep split ownership |
| `components/editor/plugins/list-kit.tsx` | capability targets plus feature-owned `listStyleType` | keep split ownership |
| `components/editor/plugins/markdown-kit.tsx` | runtime property keys | fixed with name-latest portals; custom-key regression added |
| `components/editor/plugins/suggestion-kit.tsx` | capability override/targets; capability CSS class | fixed override; keep `name` for the render class |
| `components/editor/plugins/tabbable-kit.tsx` | capability override plus runtime element types | fixed override; keep portals |
| `components/editor/transforms.ts` | capability actions plus runtime element types | fixed action-map keys; keep portals |
| `components/editor/transforms.ts` | capability/list-style actions plus runtime element types | fixed action-map keys; keep portals and feature-owned list values |
| `components/editor/use-chat.ts` | runtime table types/comment key plus copied comment value | fixed runtime identities; keep persisted comment paragraph literal |
| `examples/markdown-streaming-demo.tsx` | copied initial value plus runtime AI mark key | keep literal value and portal key |
| `lib/block-discussion-index.ts` | runtime type-indexed labels | fixed with editor-derived type resolver |
| `ui/ai-menu.slow.tsx` | test fixture | keep explicit persisted literal |
| `ui/ai-menu.tsx` | runtime suggestion/comment keys | fixed with exact feature portals |
| `ui/block-context-menu.tsx` | capability actions | keep `PLUGINS.*` |
| `ui/block-draggable.tsx` | runtime element types plus feature-owned list property | keep portals and typed property |
| `ui/comment.tsx` | type was irrelevant to `NodeApi.string` | removed it |
| `ui/fixed-toolbar.tsx` | capability props | keep `PLUGINS.*` |
| `ui/insert-toolbar-button.tsx` | capability actions plus list-style values | keep split ownership |
| `ui/insert-toolbar-button.tsx` | capability actions | keep `PLUGINS.*` |
| `ui/list-toolbar-button.tsx` | capability-keyed presentation map | fixed with computed `PLUGINS.*` keys |
| `ui/media-placeholder-node.tsx` | persisted media subtype resolved to capability UI config | fixed with editor portal resolution |
| `ui/media-toolbar-button.tsx` | capability-keyed presentation map | fixed with computed `PLUGINS.*` keys |
| `ui/mention-node-static.tsx` | static persisted mark properties | keep typed fields; no editor exists |
| `ui/mention-node.tsx` | typed persisted mark properties | keep feature-owned fields |
| `ui/more-toolbar-button.tsx` | runtime mark key | keep portal key |
| `ui/select-editor.tsx` | copied local editor value | keep explicit persisted literals |
| `ui/slash-node.tsx` | capability actions plus list-style values | keep split ownership |
| `ui/suggestion-node.tsx` | runtime column-group type | fixed at render owner with portal type |
| `ui/table-node.tsx` | capability selectors | keep `PLUGINS.*` names |
| `ui/table-toolbar-button.tsx` | runtime table matcher | fixed with Table portal type |
| `ui/turn-into-toolbar-button.tsx` | capability actions mapped to runtime types | keep capability values and portal resolution |
| `ui/turn-into-toolbar-button.tsx` | capability actions mapped to runtime types | keep capability values and portal resolution |
| `app/api/ai/command/utils.ts` | runtime generic table matchers | fixed with name-latest portals |
| `ui/block-selection.tsx` | runtime table/table-row comparisons | fixed against `element.type` with name-latest portals; never read `.type` from the render-contribution plugin |
| `ui/column-node.tsx` | DnD element type | fixed with the exact Column portal type |

## Post-fix counts

- manifest rows: expected 36, actual 36, missing 0, extra 0;
- remaining `KEYS` / `NODES` / `STYLE_KEYS` registry files: 0;
- raw production `match.type` string literals: 0;
- raw production node/element/plugin type comparisons: 0 (two test-only
  matches remain: one explicit fixture type and one `typeof ... === 'string'`);
- bare direct keys under registry `override.components` / `override.plugins`:
  0;
- raw registry `plainMarks` string arrays: 0;
- adoption checker: full 4,220-file source/documentation audit passes;
- copied registry UI/editor-context boundaries using host `MyEditor`: 0 after a
  13-file follow-up repair. Standalone copied UI and `use-chat` surfaces infer
  from their smallest locally owned `PlateEditor<Value, readonly [...]>` plugin
  tuple; examples that deliberately compose `EditorKit` retain `MyEditor`.

## Copied registry type-boundary follow-up

The first review caught host-editor coupling in `ai-menu.tsx` and
`table-node.tsx`. The same-class sweep found 11 more copied surfaces:
`use-chat.ts`, the three media nodes, the align/line-height/font-size controls,
block suggestion, footnote, import, and export controls. All 13 now own a
minimal local plugin tuple. The checker rejects `MyEditor` imports in
`registry/ui/**` and `components/editor/use-chat.{ts,tsx}` while allowing
examples that intentionally compose the complete editor kit.

## Runtime proof

`/blocks/playground-demo` rendered the full editor and opened the Table menu
after the repair. The earlier `Plate plugin "blockPlaceholder" does not own an
element type` exception is absent. Remaining console output is unrelated:
browser-extension DOM/style mutation plus the existing server/client table-cell
ID hydration mismatch.

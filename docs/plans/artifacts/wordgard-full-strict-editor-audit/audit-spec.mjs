const concept = (id, lane, title, referenceEvidence) =>
  Object.freeze({ id, lane, referenceEvidence, title });

export const concepts = Object.freeze([
  concept(
    'WG-META-001',
    'meta',
    'Public package and subpath entrypoints',
    '../wordgard/package.json:1-37; ../wordgard/src/doc/index.ts:1-67'
  ),
  concept(
    'WG-META-002',
    'meta',
    'SWC and Rollup build with bundled declarations',
    '../wordgard/bin/build.ts:1-354; ../wordgard/bin/packages.ts:1-34'
  ),
  concept(
    'WG-META-003',
    'meta',
    'Headless and browser proof runners',
    '../wordgard/bin/test-headless.ts:1-65; ../wordgard/bin/testserver.ts:1-71'
  ),
  concept(
    'WG-META-004',
    'meta',
    'Demo and teaching surface',
    '../wordgard/README.md:1-25; ../wordgard/demo/demo.ts:1-16'
  ),
  concept(
    'WG-META-005',
    'meta',
    'Dead-code and mass-change maintenance tooling',
    '../wordgard/bin/test-dead-code.ts:1-47; ../wordgard/bin/mass-change.ts:1-23'
  ),

  concept(
    'WG-CMD-001',
    'command',
    'Function-identity commands and ordered handler interception',
    '../wordgard/src/command/command.ts:4-97'
  ),
  concept(
    'WG-CMD-002',
    'command',
    'Pure command specs and DOM-dependent imperative commands',
    '../wordgard/src/command/commands.ts:20-580'
  ),
  concept(
    'WG-CMD-003A',
    'command',
    'Text insertion, deletion, splitting, and joining commands',
    '../wordgard/src/command/commands.ts:20-161; ../wordgard/src/command/helper.ts:7-352'
  ),
  concept(
    'WG-CMD-003B',
    'command',
    'Block typing, wrapping, unwrapping, alignment, and direction commands',
    '../wordgard/src/command/commands.ts:162-302; ../wordgard/src/command/helper.ts:353-595'
  ),
  concept(
    'WG-CMD-003C',
    'command',
    'List toggling and list-join commands',
    '../wordgard/src/command/commands.ts:303-431; ../wordgard/src/command/helper.ts:162-185'
  ),
  concept(
    'WG-CMD-003D',
    'command',
    'Mark toggling and mark-range eligibility',
    '../wordgard/src/command/commands.ts:223-260; ../wordgard/src/command/helper.ts:596-609'
  ),
  concept(
    'WG-CMD-003E',
    'command',
    'Selection and cursor movement commands',
    '../wordgard/src/command/commands.ts:432-576'
  ),
  concept(
    'WG-CMD-004',
    'command',
    'Declarative command menu descriptions and bindings',
    '../wordgard/src/command/menu.ts:10-489'
  ),

  concept(
    'WG-COLLAB-001',
    'collaboration',
    'Authority-versioned client queue, acknowledgement, and receive loop',
    '../wordgard/src/collab/collab.ts:23-244'
  ),
  concept(
    'WG-COLLAB-002',
    'collaboration',
    'OT transforms, shared effects, corrections, and server helper',
    '../wordgard/src/collab/collab.ts:127-208; ../wordgard/src/collab/collab.ts:245-274'
  ),

  concept(
    'WG-DOC-001',
    'document',
    'Nominal node objects and privileged document root',
    '../wordgard/src/doc/node.ts:25-98; ../wordgard/src/doc/node.ts:325-930'
  ),
  concept(
    'WG-DOC-002',
    'document',
    'Node types, tags, groups, roles, and flags',
    '../wordgard/src/doc/node.ts:12-323'
  ),
  concept(
    'WG-DOC-003',
    'document',
    'Ranked marks and immutable set algebra',
    '../wordgard/src/doc/mark.ts:7-276'
  ),
  concept(
    'WG-DOC-004',
    'document',
    'Schema compilation, lookups, containment, and wrapping cache',
    '../wordgard/src/doc/schema.ts:11-392'
  ),
  concept(
    'WG-DOC-005',
    'document',
    'Construction, defaults, equality, and adjacent-text canonicalization',
    '../wordgard/src/doc/schema.ts:39-182; ../wordgard/src/doc/node.ts:929-992'
  ),
  concept(
    'WG-DOC-006',
    'document',
    'Global token positions and resolution',
    '../wordgard/src/doc/pos.ts:7-267'
  ),
  concept(
    'WG-DOC-007',
    'document',
    'Strong document position-array cache',
    '../wordgard/src/doc/pos.ts:268-324'
  ),
  concept(
    'WG-DOC-008',
    'document',
    'Open token slices and structural context',
    '../wordgard/src/doc/slice.ts:9-148'
  ),
  concept(
    'WG-DOC-009',
    'document',
    'Compact immutable ChangeSet representation and apply',
    '../wordgard/src/doc/change.ts:109-260; ../wordgard/src/doc/change.ts:499-622'
  ),
  concept(
    'WG-DOC-010',
    'document',
    'Change composition, pairwise transform, and inversion',
    '../wordgard/src/doc/change.ts:261-329; ../wordgard/src/doc/change.ts:727-885'
  ),
  concept(
    'WG-DOC-011',
    'document',
    'Position mapping, changed ranges, padding, and clipping',
    '../wordgard/src/doc/change.ts:330-498'
  ),
  concept(
    'WG-DOC-012',
    'document',
    'Schema-aware replacement and deletion fitting',
    '../wordgard/src/doc/change.ts:623-726; ../wordgard/src/doc/change.ts:886-1387'
  ),
  concept(
    'WG-DOC-013',
    'document',
    'Node, mark, slice, and change JSON validation',
    '../wordgard/src/doc/node.ts:88-95; ../wordgard/src/doc/schema.ts:281-324; ../wordgard/src/doc/change.ts:209-253'
  ),
  concept(
    'WG-DOC-014',
    'codec',
    'DOM and HTML shape intermediate representation',
    '../wordgard/src/doc/shape.ts:18-470'
  ),
  concept(
    'WG-DOC-015',
    'codec',
    'Schema-compiled DOM parser and fitted parse output',
    '../wordgard/src/doc/parse.ts:13-557'
  ),
  concept(
    'WG-DOC-016',
    'codec',
    'DOM and HTML serializer',
    '../wordgard/src/doc/serialize.ts:21-200'
  ),
  concept(
    'WG-DOC-017',
    'document',
    'Deep equality, validation helpers, and typed errors',
    '../wordgard/src/doc/helper.ts:1-36; ../wordgard/src/doc/error.ts:1-7'
  ),
  concept(
    'WG-DOC-018',
    'document',
    'Node traversal and text projection',
    '../wordgard/src/doc/node.ts:545-629; ../wordgard/src/doc/text.ts:3-24'
  ),

  concept(
    'WG-HIST-001',
    'history',
    'Undo branches, grouping, selection restore, and effect inversion',
    '../wordgard/src/history/history.ts:6-170; ../wordgard/src/history/history.ts:261-380'
  ),
  concept(
    'WG-HIST-002',
    'history',
    'Lazy mapping and rebasing of skipped changes',
    '../wordgard/src/history/history.ts:171-259'
  ),
  concept(
    'WG-HIST-003',
    'history',
    'History JSON persistence',
    '../wordgard/src/history/history.ts:71-95; ../wordgard/src/history/history.ts:113-143'
  ),

  concept(
    'WG-PRODUCT-001A',
    'product',
    'Standard document, block, and inline node types',
    '../wordgard/src/types/schema.ts:7-191'
  ),
  concept(
    'WG-PRODUCT-001B',
    'product',
    'Standard mark types',
    '../wordgard/src/types/schema.ts:205-299'
  ),
  concept(
    'WG-PRODUCT-001C',
    'product',
    'Standard image and figure types',
    '../wordgard/src/types/schema.ts:300-344'
  ),
  concept(
    'WG-PRODUCT-001D',
    'product',
    'Standard table and cell types',
    '../wordgard/src/types/schema.ts:345-405'
  ),
  concept(
    'WG-PRODUCT-002',
    'product',
    'Feature bundles and schema composition',
    '../wordgard/src/schema/bundle.ts:12-55'
  ),
  concept(
    'WG-PRODUCT-003A',
    'product',
    'Block, heading, code, alignment, direction, quote, and rule behavior',
    '../wordgard/src/schema/block.ts:12-365'
  ),
  concept(
    'WG-PRODUCT-003B',
    'product',
    'Mark and color behavior',
    '../wordgard/src/schema/mark.ts:10-188; ../wordgard/src/schema/color.ts:276-327'
  ),
  concept(
    'WG-PRODUCT-003C',
    'product',
    'List behavior',
    '../wordgard/src/schema/list.ts:10-71'
  ),
  concept(
    'WG-PRODUCT-003D',
    'product',
    'Link editing and hover behavior',
    '../wordgard/src/schema/link.ts:8-173'
  ),
  concept(
    'WG-PRODUCT-003E',
    'product',
    'Image and figure editing behavior',
    '../wordgard/src/schema/image.ts:9-230'
  ),
  concept(
    'WG-PRODUCT-004A',
    'product',
    'Image upload and insertion dialog policy',
    '../wordgard/src/schema/imagedialog.ts:9-281'
  ),
  concept(
    'WG-PRODUCT-004B',
    'product',
    'Image resizing state and interaction',
    '../wordgard/src/schema/image.ts:34-174'
  ),
  concept(
    'WG-PRODUCT-004C',
    'product',
    'Color picker control',
    '../wordgard/src/schema/color.ts:38-275'
  ),

  concept(
    'WG-PROOF-001',
    'proof',
    'Document, change, schema, and property tests',
    '../wordgard/test/test-change.ts:1-575; ../wordgard/test/test-prop.ts:1-102'
  ),
  concept(
    'WG-PROOF-002',
    'proof',
    'State, selection, command, correction, history, and collaboration tests',
    '../wordgard/test/test-state.ts:1-127; ../wordgard/test/test-history.ts:1-582; ../wordgard/test/test-collab.ts:1-369'
  ),
  concept(
    'WG-PROOF-003',
    'proof',
    'Table behavior tests',
    '../wordgard/test/test-cellselection.ts:1-180; ../wordgard/test/test-table-paste.ts:1-125'
  ),
  concept(
    'WG-PROOF-004',
    'proof',
    'Browser editor, DOM, selection, input, and composition tests',
    '../wordgard/test/webtest-dom-changes.ts:1-149; ../wordgard/test/webtest-composition.ts:1-188'
  ),

  concept(
    'WG-STATE-001',
    'state',
    'Immutable editor state and atomic publication',
    '../wordgard/src/state/state.ts:49-293'
  ),
  concept(
    'WG-STATE-002',
    'state',
    'Typed state fields and value persistence',
    '../wordgard/src/state/state.ts:323-442'
  ),
  concept(
    'WG-STATE-003',
    'state',
    'Facets and runtime-tracked dynamic dependencies',
    '../wordgard/src/state/state.ts:443-595; ../wordgard/src/state/state.ts:904-1070'
  ),
  concept(
    'WG-STATE-004',
    'state',
    'Nested extension flattening, precedence bands, and identity dedupe',
    '../wordgard/src/state/state.ts:596-785; ../wordgard/src/state/state.ts:883-903'
  ),
  concept(
    'WG-STATE-005',
    'state',
    'Compartments and atomic configuration revision',
    '../wordgard/src/state/state.ts:786-817'
  ),
  concept(
    'WG-STATE-006',
    'state',
    'Transaction specs, sequential merge, and publication',
    '../wordgard/src/state/transaction.ts:12-137; ../wordgard/src/state/transaction.ts:359-417'
  ),
  concept(
    'WG-STATE-007',
    'state',
    'Universal transaction extenders and appenders',
    '../wordgard/src/state/transaction.ts:138-195'
  ),
  concept(
    'WG-STATE-008',
    'state',
    'Event-scoped changed-region correction',
    '../wordgard/src/state/correction.ts:13-190'
  ),
  concept(
    'WG-STATE-009',
    'selection',
    'Registered selection classes and tagged JSON',
    '../wordgard/src/state/selection.ts:8-199; ../wordgard/src/state/selection.ts:200-433'
  ),
  concept(
    'WG-STATE-010',
    'selection',
    'Selection ranges, mapping, affinity, active marks, and replacement',
    '../wordgard/src/state/selection.ts:35-199; ../wordgard/src/state/selection.ts:200-433'
  ),
  concept(
    'WG-STATE-011',
    'selection',
    'Textblock projection and grapheme, word, and logical motion',
    '../wordgard/src/state/textblock.ts:23-229; ../wordgard/src/state/selection.ts:435-576'
  ),
  concept(
    'WG-STATE-012',
    'state',
    'Typed phrase sets and localization overrides',
    '../wordgard/src/phrases/phraseset.ts:3-86; ../wordgard/src/phrases/phrases.ts:1-105'
  ),
  concept(
    'WG-STATE-013',
    'selection',
    'Custom bidi span computation and visual motion',
    '../wordgard/src/state/bidi.ts:65-410'
  ),
  concept(
    'WG-STATE-014',
    'selection',
    'Goal-column vertical and page motion',
    '../wordgard/src/command/commands.ts:494-560; ../wordgard/src/editor/editor.ts:406-430'
  ),
  concept(
    'WG-STATE-015',
    'state',
    'Typed annotations, mapped effects, and effect inversion hooks',
    '../wordgard/src/state/transaction.ts:197-356'
  ),

  concept(
    'WG-TABLE-001',
    'table',
    'Table schema and extension bundle',
    '../wordgard/src/table/table.ts:9-97'
  ),
  concept(
    'WG-TABLE-002',
    'table',
    'Table map, cache, and geometry diagnostics',
    '../wordgard/src/table/tablemap.ts:15-234'
  ),
  concept(
    'WG-TABLE-003',
    'table',
    'Table rectangularity correction',
    '../wordgard/src/table/correct.ts:10-70'
  ),
  concept(
    'WG-TABLE-004',
    'table',
    'Cell selection, mapping, normalization, and DOM projection',
    '../wordgard/src/table/cellselection.ts:19-243'
  ),
  concept(
    'WG-TABLE-005',
    'table',
    'Row, column, header, merge, and split commands',
    '../wordgard/src/table/tablecommands.ts:9-290'
  ),
  concept(
    'WG-TABLE-006',
    'table',
    'Rectangular table paste, growth, clipping, and span isolation',
    '../wordgard/src/table/tablepaste.ts:10-267'
  ),
  concept(
    'WG-TABLE-007',
    'table',
    'Table menu and dimension picker',
    '../wordgard/src/table/menu.ts:13-265'
  ),

  concept(
    'WG-VIEW-001',
    'view',
    'Imperative editor and plugin lifecycle',
    '../wordgard/src/editor/editor.ts:28-190; ../wordgard/src/editor/editor.ts:840-1073'
  ),
  concept(
    'WG-VIEW-002',
    'view',
    'Bounded DOM phase scheduler and flush diagnostics',
    '../wordgard/src/editor/editor.ts:182-245; ../wordgard/src/editor/editor.ts:364-380'
  ),
  concept(
    'WG-VIEW-003',
    'view',
    'View-state projection and invalidation',
    '../wordgard/src/editor/viewstate.ts:15-115; ../wordgard/src/editor/editor.ts:271-316'
  ),
  concept(
    'WG-VIEW-004',
    'view',
    'Tile renderer, reuse, and composition preservation',
    '../wordgard/src/editor/tile.ts:13-1220'
  ),
  concept(
    'WG-VIEW-005A',
    'view',
    'Widget and decoration public model',
    '../wordgard/src/editor/decoration.ts:10-579'
  ),
  concept(
    'WG-VIEW-005B',
    'view',
    'Mapped point and range stores',
    '../wordgard/src/editor/decoration.ts:580-972'
  ),
  concept(
    'WG-VIEW-005C',
    'view',
    'Decoration invalidation and heap-merged iteration',
    '../wordgard/src/editor/decoration.ts:973-1429'
  ),
  concept(
    'WG-VIEW-006A',
    'view',
    'DOM-to-model and model-to-DOM position mapping',
    '../wordgard/src/editor/editor.ts:431-459; ../wordgard/src/editor/tile.ts:34-152'
  ),
  concept(
    'WG-VIEW-006B',
    'view',
    'Geometry and coordinate mapping',
    '../wordgard/src/editor/coords.ts:7-64; ../wordgard/src/editor/editor.ts:460-488'
  ),
  concept(
    'WG-VIEW-007',
    'view',
    'DOM selection import, export, focus, and replay',
    '../wordgard/src/editor/selection.ts:1-149; ../wordgard/src/editor/editor.ts:490-508'
  ),
  concept(
    'WG-VIEW-008A',
    'view',
    'MutationObserver ownership and DOM repair',
    '../wordgard/src/editor/domobserver.ts:16-258'
  ),
  concept(
    'WG-VIEW-008B',
    'view',
    'Resize, scroll, and viewport observation',
    '../wordgard/src/editor/dom.ts:90-210; ../wordgard/src/editor/editor.ts:247-270'
  ),
  concept(
    'WG-VIEW-009',
    'input',
    'Beforeinput command routing and native DOM delta reconciliation',
    '../wordgard/src/editor/input.ts:41-325; ../wordgard/src/editor/input.ts:649-900'
  ),
  concept(
    'WG-VIEW-010A',
    'input',
    'Composition lifecycle and composition DOM preservation',
    '../wordgard/src/editor/input.ts:619-679; ../wordgard/src/editor/tile.ts:875-914'
  ),
  concept(
    'WG-VIEW-010B',
    'input',
    'Keyboard and pointer selection routing',
    '../wordgard/src/editor/input.ts:339-567; ../wordgard/src/editor/input.ts:710-860'
  ),
  concept(
    'WG-VIEW-010C',
    'input',
    'Drag, drop, copy, cut, and paste routing',
    '../wordgard/src/editor/input.ts:487-618'
  ),
  concept(
    'WG-VIEW-011',
    'codec',
    'Clipboard slice context and browser HTML wire format',
    '../wordgard/src/editor/clipboard.ts:5-167'
  ),
  concept(
    'WG-VIEW-012A',
    'input',
    'Key binding compilation and precedence',
    '../wordgard/src/editor/keymap.ts:1-380'
  ),
  concept(
    'WG-VIEW-012B',
    'input',
    'Input rule matching and transaction appending',
    '../wordgard/src/editor/inputrule.ts:1-214'
  ),
  concept(
    'WG-VIEW-012C',
    'input',
    'Generic DOM event handlers and observers',
    '../wordgard/src/editor/input.ts:18-40; ../wordgard/src/editor/editor.ts:599-618'
  ),
  concept(
    'WG-VIEW-013',
    'view',
    'Theme modules and editor/content attributes',
    '../wordgard/src/editor/theme.ts:1-196; ../wordgard/src/editor/editor.ts:509-518'
  ),
  concept(
    'WG-VIEW-014A',
    'product-ui',
    'Panels and dialogs',
    '../wordgard/src/editor/panel.ts:14-206; ../wordgard/src/editor/dialog.ts:8-186'
  ),
  concept(
    'WG-VIEW-014B',
    'product-ui',
    'Menus and custom controls',
    '../wordgard/src/editor/menubar.ts:20-563'
  ),
  concept(
    'WG-VIEW-014C',
    'product-ui',
    'Tooltips and hover lifecycle',
    '../wordgard/src/editor/tooltip.ts:21-838'
  ),
  concept(
    'WG-VIEW-015',
    'product-ui',
    'Placeholder, drawn cursor, and drop cursor',
    '../wordgard/src/editor/placeholder.ts:1-42; ../wordgard/src/editor/drawcursor.ts:1-85; ../wordgard/src/editor/dropcursor.ts:1-95'
  ),
  concept(
    'WG-VIEW-016',
    'view',
    'Optional plugin fault isolation and error sinks',
    '../wordgard/src/editor/editor.ts:633-657; ../wordgard/src/editor/editor.ts:1078-1159'
  ),
]);

const owner = (conceptId, from = 1) => Object.freeze({ conceptId, from });

export const sourceOwners = Object.freeze({
  'src/collab/collab.ts': [owner('WG-COLLAB-001'), owner('WG-COLLAB-002', 245)],
  'src/collab/index.ts': [owner('WG-META-001')],
  'src/command/command.ts': [owner('WG-CMD-001')],
  'src/command/commands.ts': [
    owner('WG-CMD-002'),
    owner('WG-CMD-003A', 20),
    owner('WG-CMD-003B', 162),
    owner('WG-CMD-003D', 223),
    owner('WG-CMD-003B', 263),
    owner('WG-CMD-003C', 303),
    owner('WG-CMD-003E', 432),
    owner('WG-HIST-001', 577),
  ],
  'src/command/helper.ts': [
    owner('WG-CMD-003A'),
    owner('WG-CMD-003C', 162),
    owner('WG-CMD-003A', 186),
    owner('WG-CMD-003B', 353),
    owner('WG-CMD-003D', 596),
    owner('WG-CMD-003B', 610),
  ],
  'src/command/index.ts': [owner('WG-META-001')],
  'src/command/menu.ts': [owner('WG-CMD-004')],
  'src/doc/change.ts': [
    owner('WG-DOC-009'),
    owner('WG-DOC-010', 261),
    owner('WG-DOC-011', 330),
    owner('WG-DOC-009', 499),
    owner('WG-DOC-012', 623),
    owner('WG-DOC-010', 727),
    owner('WG-DOC-012', 886),
  ],
  'src/doc/error.ts': [owner('WG-DOC-017')],
  'src/doc/helper.ts': [owner('WG-DOC-017')],
  'src/doc/index.ts': [owner('WG-META-001')],
  'src/doc/mark.ts': [owner('WG-DOC-003'), owner('WG-DOC-014', 277)],
  'src/doc/node.ts': [
    owner('WG-DOC-002'),
    owner('WG-DOC-001', 25),
    owner('WG-DOC-018', 545),
    owner('WG-DOC-013', 621),
    owner('WG-DOC-001', 659),
    owner('WG-DOC-002', 938),
    owner('WG-DOC-005', 973),
  ],
  'src/doc/parse.ts': [owner('WG-DOC-015')],
  'src/doc/pos.ts': [owner('WG-DOC-006'), owner('WG-DOC-007', 268)],
  'src/doc/schema.ts': [
    owner('WG-DOC-004'),
    owner('WG-DOC-005', 39),
    owner('WG-DOC-004', 184),
    owner('WG-DOC-013', 281),
    owner('WG-DOC-004', 325),
  ],
  'src/doc/serialize.ts': [owner('WG-DOC-016')],
  'src/doc/shape.ts': [owner('WG-DOC-014')],
  'src/doc/slice.ts': [owner('WG-DOC-008')],
  'src/doc/text.ts': [owner('WG-DOC-018')],
  'src/editor/browser.ts': [owner('WG-VIEW-010B')],
  'src/editor/clipboard.ts': [owner('WG-VIEW-011')],
  'src/editor/coords.ts': [owner('WG-VIEW-006B')],
  'src/editor/decoration.ts': [
    owner('WG-VIEW-005A'),
    owner('WG-VIEW-005B', 580),
    owner('WG-VIEW-005C', 973),
  ],
  'src/editor/dialog.ts': [owner('WG-VIEW-014A')],
  'src/editor/dom.ts': [
    owner('WG-VIEW-006A'),
    owner('WG-VIEW-008B', 90),
    owner('WG-VIEW-007', 211),
    owner('WG-VIEW-006B', 244),
    owner('WG-VIEW-006A', 268),
  ],
  'src/editor/domobserver.ts': [owner('WG-VIEW-008A')],
  'src/editor/drawcursor.ts': [owner('WG-VIEW-015')],
  'src/editor/dropcursor.ts': [owner('WG-VIEW-015')],
  'src/editor/editor.ts': [
    owner('WG-VIEW-001'),
    owner('WG-VIEW-002', 182),
    owner('WG-VIEW-008B', 247),
    owner('WG-VIEW-003', 271),
    owner('WG-VIEW-002', 364),
    owner('WG-VIEW-001', 386),
    owner('WG-STATE-014', 406),
    owner('WG-VIEW-006A', 431),
    owner('WG-VIEW-006B', 460),
    owner('WG-VIEW-007', 490),
    owner('WG-VIEW-013', 509),
    owner('WG-VIEW-012C', 599),
    owner('WG-VIEW-008B', 623),
    owner('WG-VIEW-016', 633),
    owner('WG-VIEW-013', 715),
    owner('WG-VIEW-003', 800),
    owner('WG-VIEW-001', 840),
    owner('WG-VIEW-016', 1078),
  ],
  'src/editor/index.ts': [owner('WG-META-001')],
  'src/editor/input.ts': [
    owner('WG-VIEW-012C'),
    owner('WG-VIEW-009', 41),
    owner('WG-VIEW-012C', 326),
    owner('WG-VIEW-010B', 339),
    owner('WG-VIEW-010C', 487),
    owner('WG-VIEW-010A', 619),
    owner('WG-VIEW-009', 680),
    owner('WG-VIEW-010B', 710),
    owner('WG-VIEW-012C', 861),
  ],
  'src/editor/inputrule.ts': [owner('WG-VIEW-012B')],
  'src/editor/keymap.ts': [owner('WG-VIEW-012A')],
  'src/editor/menubar.ts': [owner('WG-VIEW-014B')],
  'src/editor/panel.ts': [owner('WG-VIEW-014A')],
  'src/editor/placeholder.ts': [owner('WG-VIEW-015')],
  'src/editor/selection.ts': [owner('WG-VIEW-007')],
  'src/editor/theme.ts': [owner('WG-VIEW-013')],
  'src/editor/tile.ts': [
    owner('WG-VIEW-004'),
    owner('WG-VIEW-006B', 34),
    owner('WG-VIEW-006A', 45),
    owner('WG-VIEW-004', 153),
    owner('WG-VIEW-006A', 289),
    owner('WG-VIEW-004', 299),
  ],
  'src/editor/tooltip.ts': [owner('WG-VIEW-014C')],
  'src/editor/util.ts': [owner('WG-VIEW-016')],
  'src/editor/viewstate.ts': [owner('WG-VIEW-003')],
  'src/history/history.ts': [
    owner('WG-HIST-001'),
    owner('WG-HIST-003', 71),
    owner('WG-HIST-001', 98),
    owner('WG-HIST-002', 171),
    owner('WG-HIST-001', 261),
  ],
  'src/history/index.ts': [owner('WG-META-001')],
  'src/phrases/index.ts': [owner('WG-META-001')],
  'src/phrases/phrases.ts': [owner('WG-STATE-012')],
  'src/phrases/phraseset.ts': [owner('WG-STATE-012')],
  'src/schema/block.ts': [owner('WG-PRODUCT-003A')],
  'src/schema/bundle.ts': [owner('WG-PRODUCT-002')],
  'src/schema/color.ts': [
    owner('WG-PRODUCT-004C'),
    owner('WG-PRODUCT-003B', 276),
  ],
  'src/schema/image.ts': [
    owner('WG-PRODUCT-003E'),
    owner('WG-PRODUCT-004B', 34),
    owner('WG-PRODUCT-003E', 175),
  ],
  'src/schema/imagedialog.ts': [owner('WG-PRODUCT-004A')],
  'src/schema/index.ts': [owner('WG-META-001')],
  'src/schema/link.ts': [owner('WG-PRODUCT-003D')],
  'src/schema/list.ts': [owner('WG-PRODUCT-003C')],
  'src/schema/mark.ts': [owner('WG-PRODUCT-003B')],
  'src/state/bidi.ts': [owner('WG-STATE-013')],
  'src/state/correction.ts': [owner('WG-STATE-008')],
  'src/state/index.ts': [owner('WG-META-001')],
  'src/state/selection.ts': [
    owner('WG-STATE-009'),
    owner('WG-STATE-010', 35),
    owner('WG-STATE-009', 108),
    owner('WG-STATE-010', 127),
    owner('WG-STATE-011', 435),
  ],
  'src/state/state.ts': [
    owner('WG-STATE-001'),
    owner('WG-STATE-002', 323),
    owner('WG-STATE-003', 443),
    owner('WG-STATE-004', 596),
    owner('WG-STATE-005', 786),
    owner('WG-STATE-001', 818),
    owner('WG-STATE-004', 883),
    owner('WG-STATE-003', 904),
    owner('WG-STATE-005', 1075),
  ],
  'src/state/textblock.ts': [owner('WG-STATE-011')],
  'src/state/transaction.ts': [
    owner('WG-STATE-006'),
    owner('WG-STATE-007', 138),
    owner('WG-STATE-015', 197),
    owner('WG-STATE-006', 359),
  ],
  'src/table/cellselection.ts': [owner('WG-TABLE-004')],
  'src/table/correct.ts': [owner('WG-TABLE-003')],
  'src/table/index.ts': [owner('WG-META-001')],
  'src/table/menu.ts': [owner('WG-TABLE-007')],
  'src/table/table.ts': [owner('WG-TABLE-001')],
  'src/table/tablecommands.ts': [owner('WG-TABLE-005')],
  'src/table/tablemap.ts': [owner('WG-TABLE-002')],
  'src/table/tablepaste.ts': [owner('WG-TABLE-006')],
  'src/types/index.ts': [owner('WG-META-001')],
  'src/types/schema.ts': [
    owner('WG-PRODUCT-001A'),
    owner('WG-PRODUCT-001B', 205),
    owner('WG-PRODUCT-001C', 300),
    owner('WG-PRODUCT-001D', 345),
  ],
});

export const explicitFileOwners = Object.freeze({
  'README.md': 'WG-META-004',
  'bin/build.ts': 'WG-META-002',
  'bin/mass-change.ts': 'WG-META-005',
  'bin/packages.ts': 'WG-META-002',
  'bin/run-tests.js': 'WG-META-003',
  'bin/run-testserver.ts': 'WG-META-003',
  'bin/test-dead-code.ts': 'WG-META-005',
  'bin/test-headless.ts': 'WG-META-003',
  'bin/testserver.ts': 'WG-META-003',
  'demo/demo.ts': 'WG-META-004',
  'demo/index.html': 'WG-META-004',
  'package.json': 'WG-META-001',
  'test/generate.ts': 'WG-PROOF-001',
  'test/schema.ts': 'WG-PROOF-001',
  'test/tempview.ts': 'WG-PROOF-004',
  'test/test-cellselection.ts': 'WG-PROOF-003',
  'test/test-change.ts': 'WG-PROOF-001',
  'test/test-collab.ts': 'WG-PROOF-002',
  'test/test-commands.ts': 'WG-PROOF-002',
  'test/test-correction.ts': 'WG-PROOF-002',
  'test/test-facet.ts': 'WG-PROOF-002',
  'test/test-history.ts': 'WG-PROOF-002',
  'test/test-node.ts': 'WG-PROOF-001',
  'test/test-pos.ts': 'WG-PROOF-001',
  'test/test-prop.ts': 'WG-PROOF-001',
  'test/test-schema.ts': 'WG-PROOF-001',
  'test/test-selection.ts': 'WG-PROOF-002',
  'test/test-state.ts': 'WG-PROOF-002',
  'test/test-table-commands.ts': 'WG-PROOF-003',
  'test/test-table-correction.ts': 'WG-PROOF-003',
  'test/test-table-paste.ts': 'WG-PROOF-003',
  'test/webtest-commands.ts': 'WG-PROOF-004',
  'test/webtest-composition.ts': 'WG-PROOF-004',
  'test/webtest-content.ts': 'WG-PROOF-004',
  'test/webtest-coords.ts': 'WG-PROOF-004',
  'test/webtest-dom-changes.ts': 'WG-PROOF-004',
  'test/webtest-editor.ts': 'WG-PROOF-004',
  'test/webtest-resolve-dom.ts': 'WG-PROOF-004',
  'test/webtest-serialize.ts': 'WG-PROOF-004',
  'tsconfig.json': 'WG-META-002',
});

export const exclusions = Object.freeze({
  '.gitignore':
    'Repository ignore metadata; no runtime, public API, architecture, or proof contract.',
  'CHANGELOG.md':
    'Historical release prose is not current-source architecture authority.',
  LICENSE:
    'Legal provenance is recorded separately; the license text owns no editor mechanism.',
  'bin/release.ts':
    'Version, tag, and publication automation owns no editor or package architecture mechanism.',
  'bin/tsconfig.json':
    'Build-script compiler plumbing has no independent runtime or public contract.',
  'demo/flower.jpg':
    'Binary demo fixture has no independent architecture mechanism.',
});

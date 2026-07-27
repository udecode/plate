import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@babel/parser';

const artifactDirectory = dirname(fileURLToPath(import.meta.url));
const plateRepository = join(artifactDirectory, '../../../..');
const repository = join(plateRepository, '../wordgard');
const outputPath = join(artifactDirectory, 'wordgard-source-manifest.json');
const expectedHead = '8fd8880d1a16bc6306b1e59f8649b1d9021e3d1e';

const runGitBuffer = (...args) =>
  execFileSync('git', ['-C', repository, ...args], {
    encoding: 'buffer',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
const runGit = (...args) =>
  runGitBuffer(...args)
    .toString()
    .trimEnd();
const nulList = (...args) =>
  runGitBuffer(...args)
    .toString()
    .split('\0')
    .filter(Boolean);

const concepts = [
  ['WG-META-001', 'meta', 'Package entrypoints and export topology'],
  ['WG-META-002', 'meta', 'Build, declaration, release, and dead-code tooling'],
  ['WG-META-003', 'meta', 'Headless and browser proof runners'],
  ['WG-META-004', 'meta', 'Teaching demo and package application surface'],
  [
    'WG-DOC-001',
    'document',
    'Nominal node classes and privileged document root',
  ],
  [
    'WG-DOC-002',
    'document',
    'Node types, tags, groups, roles, and behavior flags',
  ],
  ['WG-DOC-003', 'document', 'Ranked marks and immutable set algebra'],
  [
    'WG-DOC-004',
    'document',
    'Schema compilation, lookup, validation, and weak cache',
  ],
  [
    'WG-DOC-005',
    'document',
    'Node creation, defaults, equality, and text canonicalization',
  ],
  [
    'WG-DOC-006',
    'document',
    'Global token positions, resolution, traversal, and cache',
  ],
  ['WG-DOC-007', 'document', 'Text projection and document traversal'],
  ['WG-DOC-008', 'document', 'Open token slices and structural context'],
  [
    'WG-DOC-009',
    'document',
    'Compact immutable ChangeSet representation and apply',
  ],
  [
    'WG-DOC-010',
    'document',
    'Change composition, pairwise transform, and inversion',
  ],
  [
    'WG-DOC-011',
    'document',
    'Position mapping, changed ranges, padding, and clipping',
  ],
  [
    'WG-DOC-012',
    'document',
    'Schema-aware change fitting and structural correction',
  ],
  [
    'WG-DOC-013',
    'document',
    'Validated document, slice, mark, and change JSON',
  ],
  ['WG-DOC-014', 'codec', 'DOM element shape intermediate representation'],
  [
    'WG-DOC-015',
    'codec',
    'Schema-linked DOM parse-rule compiler and slice parser',
  ],
  ['WG-DOC-016', 'codec', 'Schema-linked DOM and HTML serializer'],
  [
    'WG-DOC-017',
    'document',
    'Shared validation, equality, and error primitives',
  ],
  ['WG-STATE-001', 'state', 'Immutable editor state snapshots and publication'],
  ['WG-STATE-002', 'state', 'Typed fields, annotations, and mappable effects'],
  ['WG-STATE-003', 'state', 'Lazy facets and automatic dependency tracking'],
  [
    'WG-STATE-004',
    'state',
    'Extension flattening, precedence, and identity deduplication',
  ],
  [
    'WG-STATE-005',
    'state',
    'Transactional compartments and configuration revisions',
  ],
  [
    'WG-STATE-006',
    'state',
    'Transaction specs, merge, sequential changes, and publication',
  ],
  ['WG-STATE-007', 'state', 'Transaction extenders and appenders'],
  [
    'WG-STATE-008',
    'state',
    'Changed-region correction registration and scanning',
  ],
  [
    'WG-STATE-009',
    'selection',
    'Extensible registered selection classes and JSON',
  ],
  [
    'WG-STATE-010',
    'selection',
    'Selection mapping, affinity, goal column, and active marks',
  ],
  [
    'WG-STATE-011',
    'selection',
    'Textblock projection, grapheme movement, and bidi order',
  ],
  [
    'WG-STATE-012',
    'state',
    'Phrase sets and transactional localization overrides',
  ],
  [
    'WG-VIEW-001',
    'view',
    'Imperative editor lifecycle and extension plugin runtime',
  ],
  [
    'WG-VIEW-002',
    'view',
    'Bounded DOM read/write scheduler and flush lifecycle',
  ],
  [
    'WG-VIEW-003',
    'view',
    'View-state projection and changed-range invalidation',
  ],
  [
    'WG-VIEW-004',
    'view',
    'Incremental tile renderer, reuse, and composition preservation',
  ],
  [
    'WG-VIEW-005',
    'view',
    'Point/range decorations, widgets, mapping, and invalidation',
  ],
  ['WG-VIEW-006', 'view', 'DOM/model coordinate and position mapping'],
  ['WG-VIEW-007', 'view', 'DOM selection import, export, and focus handling'],
  [
    'WG-VIEW-008',
    'view',
    'Mutation, selection, resize, scroll, and theme observation',
  ],
  [
    'WG-VIEW-009',
    'input',
    'Native beforeinput/input reconciliation and DOM change mapping',
  ],
  [
    'WG-VIEW-010',
    'input',
    'Composition, keyboard, mouse, drag, drop, and paste handling',
  ],
  [
    'WG-VIEW-011',
    'codec',
    'Clipboard slice transport and browser HTML workarounds',
  ],
  ['WG-VIEW-012', 'input', 'Keymaps, input rules, and ordered event handlers'],
  ['WG-VIEW-013', 'view', 'Theme compilation and editor attributes'],
  ['WG-VIEW-014', 'view', 'Panels, dialogs, menus, tooltips, and controls'],
  [
    'WG-VIEW-015',
    'view',
    'Placeholder, drawn cursor, and drop cursor projections',
  ],
  ['WG-VIEW-016', 'view', 'Optional plugin fault isolation and error sinks'],
  [
    'WG-CMD-001',
    'command',
    'Function-identity commands and ordered handler interception',
  ],
  [
    'WG-CMD-002',
    'command',
    'Pure command specs and DOM-dependent imperative commands',
  ],
  [
    'WG-CMD-003',
    'command',
    'Structural editing, join, wrap, list, and mark helpers',
  ],
  [
    'WG-CMD-004',
    'command',
    'Declarative command menu descriptions and bindings',
  ],
  [
    'WG-HIST-001',
    'history',
    'History branches, grouping, inversion, selection, and effects',
  ],
  ['WG-HIST-002', 'history', 'Lazy skipped-change mapping and rebasing'],
  ['WG-HIST-003', 'history', 'History JSON persistence'],
  [
    'WG-COLLAB-001',
    'collaboration',
    'Authority-versioned collaboration queue and acknowledgement',
  ],
  [
    'WG-COLLAB-002',
    'collaboration',
    'OT transform, shared effects, corrections, and history exclusion',
  ],
  [
    'WG-PRODUCT-001',
    'product',
    'Standard schema nodes, marks, roles, and DOM bindings',
  ],
  [
    'WG-PRODUCT-002',
    'product',
    'Feature extension bundles and schema composition',
  ],
  [
    'WG-PRODUCT-003',
    'product',
    'Block, mark, list, link, media, and color feature behavior',
  ],
  [
    'WG-PRODUCT-004',
    'product',
    'Application-facing feature UI and upload/resizing policy',
  ],
  ['WG-TABLE-001', 'table', 'Table schema and extension bundle'],
  [
    'WG-TABLE-002',
    'table',
    'Persistent-node table map cache and rectangle diagnostics',
  ],
  ['WG-TABLE-003', 'table', 'Table correction and rectangularity invariants'],
  [
    'WG-TABLE-004',
    'table',
    'Registered cell selection, mapping, normalization, and DOM projection',
  ],
  [
    'WG-TABLE-005',
    'table',
    'Table row, column, cell merge, split, and header commands',
  ],
  [
    'WG-TABLE-006',
    'table',
    'Fitted table paste, growth, clipping, and span isolation',
  ],
  ['WG-TABLE-007', 'table', 'Table insertion menu and dimension picker'],
  ['WG-PROOF-001', 'proof', 'Document/change/schema/property test corpus'],
  [
    'WG-PROOF-002',
    'proof',
    'State/selection/configuration/correction/history/collaboration corpus',
  ],
  [
    'WG-PROOF-003',
    'proof',
    'Table map, correction, selection, command, and paste corpus',
  ],
  [
    'WG-PROOF-004',
    'proof',
    'Browser DOM, rendering, input, composition, clipboard, and geometry corpus',
  ],
];

const conceptById = new Map(
  concepts.map(([id, lane, title]) => [id, { id, lane, title }])
);

const byPath = {
  'README.md': ['WG-META-001', 'WG-META-004'],
  'package.json': ['WG-META-001', 'WG-META-002', 'WG-META-003'],
  'tsconfig.json': ['WG-META-002'],
  'bin/build.ts': ['WG-META-001', 'WG-META-002'],
  'bin/mass-change.ts': ['WG-META-002'],
  'bin/packages.ts': ['WG-META-001', 'WG-META-002'],
  'bin/run-tests.js': ['WG-META-003'],
  'bin/run-testserver.ts': ['WG-META-003'],
  'bin/test-dead-code.ts': ['WG-META-002'],
  'bin/test-headless.ts': ['WG-META-003'],
  'bin/testserver.ts': ['WG-META-003'],
  'demo/demo.ts': ['WG-META-004'],
  'demo/index.html': ['WG-META-004'],

  'src/doc/change.ts': [
    'WG-DOC-008',
    'WG-DOC-009',
    'WG-DOC-010',
    'WG-DOC-011',
    'WG-DOC-012',
    'WG-DOC-013',
  ],
  'src/doc/error.ts': ['WG-DOC-017'],
  'src/doc/helper.ts': ['WG-DOC-005', 'WG-DOC-017'],
  'src/doc/index.ts': [
    'WG-META-001',
    'WG-DOC-001',
    'WG-DOC-003',
    'WG-DOC-004',
    'WG-DOC-006',
    'WG-DOC-008',
    'WG-DOC-009',
    'WG-DOC-014',
    'WG-DOC-015',
    'WG-DOC-016',
  ],
  'src/doc/mark.ts': [
    'WG-DOC-002',
    'WG-DOC-003',
    'WG-DOC-005',
    'WG-DOC-013',
    'WG-DOC-014',
  ],
  'src/doc/node.ts': [
    'WG-DOC-001',
    'WG-DOC-002',
    'WG-DOC-005',
    'WG-DOC-007',
    'WG-DOC-008',
    'WG-DOC-013',
  ],
  'src/doc/parse.ts': [
    'WG-DOC-004',
    'WG-DOC-008',
    'WG-DOC-012',
    'WG-DOC-014',
    'WG-DOC-015',
  ],
  'src/doc/pos.ts': ['WG-DOC-001', 'WG-DOC-006', 'WG-DOC-007'],
  'src/doc/schema.ts': [
    'WG-DOC-002',
    'WG-DOC-004',
    'WG-DOC-005',
    'WG-DOC-012',
    'WG-DOC-013',
  ],
  'src/doc/serialize.ts': ['WG-DOC-008', 'WG-DOC-014', 'WG-DOC-016'],
  'src/doc/shape.ts': ['WG-DOC-014', 'WG-DOC-015', 'WG-DOC-016'],
  'src/doc/slice.ts': ['WG-DOC-005', 'WG-DOC-008', 'WG-DOC-013'],
  'src/doc/text.ts': ['WG-DOC-007'],

  'src/state/bidi.ts': ['WG-STATE-011'],
  'src/state/correction.ts': [
    'WG-DOC-012',
    'WG-STATE-006',
    'WG-STATE-007',
    'WG-STATE-008',
  ],
  'src/state/index.ts': [
    'WG-META-001',
    'WG-STATE-001',
    'WG-STATE-002',
    'WG-STATE-006',
    'WG-STATE-008',
    'WG-STATE-009',
    'WG-STATE-011',
  ],
  'src/state/selection.ts': ['WG-STATE-009', 'WG-STATE-010', 'WG-STATE-011'],
  'src/state/state.ts': [
    'WG-STATE-001',
    'WG-STATE-002',
    'WG-STATE-003',
    'WG-STATE-004',
    'WG-STATE-005',
    'WG-STATE-009',
  ],
  'src/state/textblock.ts': ['WG-DOC-006', 'WG-STATE-010', 'WG-STATE-011'],
  'src/state/transaction.ts': [
    'WG-DOC-009',
    'WG-STATE-001',
    'WG-STATE-002',
    'WG-STATE-005',
    'WG-STATE-006',
    'WG-STATE-007',
  ],

  'src/editor/browser.ts': ['WG-VIEW-008', 'WG-VIEW-009', 'WG-VIEW-010'],
  'src/editor/clipboard.ts': [
    'WG-DOC-008',
    'WG-DOC-015',
    'WG-DOC-016',
    'WG-VIEW-010',
    'WG-VIEW-011',
  ],
  'src/editor/coords.ts': ['WG-VIEW-006'],
  'src/editor/decoration.ts': ['WG-VIEW-003', 'WG-VIEW-004', 'WG-VIEW-005'],
  'src/editor/dialog.ts': ['WG-VIEW-014'],
  'src/editor/dom.ts': [
    'WG-VIEW-006',
    'WG-VIEW-007',
    'WG-VIEW-008',
    'WG-VIEW-013',
  ],
  'src/editor/domobserver.ts': ['WG-VIEW-007', 'WG-VIEW-008', 'WG-VIEW-009'],
  'src/editor/drawcursor.ts': ['WG-VIEW-005', 'WG-VIEW-015'],
  'src/editor/dropcursor.ts': ['WG-VIEW-005', 'WG-VIEW-010', 'WG-VIEW-015'],
  'src/editor/editor.ts': [
    'WG-VIEW-001',
    'WG-VIEW-002',
    'WG-VIEW-003',
    'WG-VIEW-006',
    'WG-VIEW-007',
    'WG-VIEW-008',
    'WG-VIEW-013',
    'WG-VIEW-016',
  ],
  'src/editor/index.ts': [
    'WG-META-001',
    'WG-VIEW-001',
    'WG-VIEW-005',
    'WG-VIEW-006',
    'WG-VIEW-010',
    'WG-VIEW-012',
    'WG-VIEW-014',
    'WG-VIEW-015',
  ],
  'src/editor/input.ts': [
    'WG-VIEW-007',
    'WG-VIEW-008',
    'WG-VIEW-009',
    'WG-VIEW-010',
    'WG-VIEW-012',
  ],
  'src/editor/inputrule.ts': ['WG-VIEW-009', 'WG-VIEW-012'],
  'src/editor/keymap.ts': ['WG-CMD-001', 'WG-VIEW-010', 'WG-VIEW-012'],
  'src/editor/menubar.ts': ['WG-CMD-004', 'WG-VIEW-013', 'WG-VIEW-014'],
  'src/editor/panel.ts': ['WG-VIEW-013', 'WG-VIEW-014'],
  'src/editor/placeholder.ts': ['WG-VIEW-005', 'WG-VIEW-015'],
  'src/editor/selection.ts': ['WG-VIEW-006', 'WG-VIEW-007'],
  'src/editor/theme.ts': ['WG-VIEW-013', 'WG-VIEW-014'],
  'src/editor/tile.ts': [
    'WG-VIEW-003',
    'WG-VIEW-004',
    'WG-VIEW-005',
    'WG-VIEW-006',
    'WG-VIEW-007',
    'WG-VIEW-009',
    'WG-VIEW-010',
  ],
  'src/editor/tooltip.ts': ['WG-VIEW-005', 'WG-VIEW-006', 'WG-VIEW-014'],
  'src/editor/util.ts': ['WG-VIEW-001', 'WG-VIEW-016'],
  'src/editor/viewstate.ts': ['WG-VIEW-002', 'WG-VIEW-003', 'WG-VIEW-006'],

  'src/command/command.ts': ['WG-STATE-003', 'WG-CMD-001', 'WG-CMD-002'],
  'src/command/commands.ts': [
    'WG-CMD-002',
    'WG-CMD-003',
    'WG-STATE-010',
    'WG-VIEW-006',
  ],
  'src/command/helper.ts': [
    'WG-DOC-009',
    'WG-DOC-012',
    'WG-CMD-002',
    'WG-CMD-003',
  ],
  'src/command/index.ts': [
    'WG-META-001',
    'WG-CMD-001',
    'WG-CMD-002',
    'WG-CMD-003',
    'WG-CMD-004',
  ],
  'src/command/menu.ts': ['WG-CMD-001', 'WG-CMD-004', 'WG-VIEW-014'],

  'src/history/history.ts': [
    'WG-STATE-002',
    'WG-STATE-006',
    'WG-HIST-001',
    'WG-HIST-002',
    'WG-HIST-003',
  ],
  'src/history/index.ts': [
    'WG-META-001',
    'WG-HIST-001',
    'WG-HIST-002',
    'WG-HIST-003',
  ],
  'src/collab/collab.ts': [
    'WG-DOC-010',
    'WG-STATE-002',
    'WG-STATE-008',
    'WG-COLLAB-001',
    'WG-COLLAB-002',
  ],
  'src/collab/index.ts': ['WG-META-001', 'WG-COLLAB-001', 'WG-COLLAB-002'],
  'src/phrases/index.ts': ['WG-META-001', 'WG-STATE-012'],
  'src/phrases/phrases.ts': ['WG-STATE-012'],
  'src/phrases/phraseset.ts': ['WG-STATE-003', 'WG-STATE-004', 'WG-STATE-012'],
  'src/types/index.ts': ['WG-META-001', 'WG-PRODUCT-001'],
  'src/types/schema.ts': [
    'WG-DOC-002',
    'WG-DOC-004',
    'WG-DOC-014',
    'WG-DOC-015',
    'WG-DOC-016',
    'WG-PRODUCT-001',
    'WG-TABLE-001',
  ],

  'src/schema/block.ts': [
    'WG-CMD-002',
    'WG-CMD-004',
    'WG-PRODUCT-002',
    'WG-PRODUCT-003',
  ],
  'src/schema/bundle.ts': ['WG-PRODUCT-001', 'WG-PRODUCT-002'],
  'src/schema/color.ts': [
    'WG-CMD-004',
    'WG-PRODUCT-002',
    'WG-PRODUCT-003',
    'WG-PRODUCT-004',
    'WG-VIEW-014',
  ],
  'src/schema/image.ts': [
    'WG-PRODUCT-002',
    'WG-PRODUCT-003',
    'WG-PRODUCT-004',
    'WG-VIEW-005',
    'WG-VIEW-010',
  ],
  'src/schema/imagedialog.ts': [
    'WG-CMD-002',
    'WG-PRODUCT-003',
    'WG-PRODUCT-004',
    'WG-VIEW-014',
  ],
  'src/schema/index.ts': [
    'WG-META-001',
    'WG-PRODUCT-001',
    'WG-PRODUCT-002',
    'WG-PRODUCT-003',
    'WG-PRODUCT-004',
  ],
  'src/schema/link.ts': [
    'WG-CMD-002',
    'WG-PRODUCT-002',
    'WG-PRODUCT-003',
    'WG-PRODUCT-004',
    'WG-VIEW-014',
  ],
  'src/schema/list.ts': [
    'WG-CMD-002',
    'WG-CMD-004',
    'WG-PRODUCT-002',
    'WG-PRODUCT-003',
  ],
  'src/schema/mark.ts': [
    'WG-CMD-002',
    'WG-CMD-004',
    'WG-PRODUCT-002',
    'WG-PRODUCT-003',
  ],

  'src/table/cellselection.ts': [
    'WG-STATE-009',
    'WG-STATE-010',
    'WG-TABLE-002',
    'WG-TABLE-004',
  ],
  'src/table/correct.ts': ['WG-STATE-008', 'WG-TABLE-002', 'WG-TABLE-003'],
  'src/table/index.ts': [
    'WG-META-001',
    'WG-TABLE-001',
    'WG-TABLE-004',
    'WG-TABLE-005',
    'WG-TABLE-006',
  ],
  'src/table/menu.ts': [
    'WG-CMD-004',
    'WG-TABLE-005',
    'WG-TABLE-007',
    'WG-VIEW-014',
  ],
  'src/table/table.ts': [
    'WG-PRODUCT-002',
    'WG-TABLE-001',
    'WG-TABLE-003',
    'WG-TABLE-004',
    'WG-TABLE-006',
    'WG-TABLE-007',
  ],
  'src/table/tablecommands.ts': [
    'WG-CMD-002',
    'WG-CMD-003',
    'WG-TABLE-002',
    'WG-TABLE-005',
  ],
  'src/table/tablemap.ts': ['WG-TABLE-002', 'WG-TABLE-003', 'WG-TABLE-005'],
  'src/table/tablepaste.ts': [
    'WG-DOC-008',
    'WG-DOC-012',
    'WG-TABLE-002',
    'WG-TABLE-003',
    'WG-TABLE-006',
  ],
};

const exclusions = {
  '.gitignore':
    'Repository ignore metadata; no runtime, public API, architecture, or proof contract.',
  'CHANGELOG.md':
    'Historical release prose is not current-source architecture authority.',
  LICENSE:
    'Legal provenance is recorded separately; the license text has no editor mechanism.',
  'bin/release.ts':
    'Package version/tag/publication automation has no editor or package architecture mechanism.',
  'bin/tsconfig.json':
    'Build-script compiler plumbing has no independent runtime or public package contract.',
  'demo/flower.jpg':
    'Binary demo fixture has no independent architecture mechanism.',
};

const testConceptIds = (path) => {
  if (path === 'test/generate.ts') return ['WG-META-003', 'WG-PROOF-001'];
  if (path === 'test/schema.ts') return ['WG-PRODUCT-001', 'WG-PROOF-001'];
  if (path === 'test/tempview.ts')
    return ['WG-META-003', 'WG-VIEW-001', 'WG-PROOF-004'];
  if (
    path === 'test/test-cellselection.ts' ||
    path.startsWith('test/test-table')
  )
    return [
      'WG-TABLE-001',
      'WG-TABLE-002',
      'WG-TABLE-003',
      'WG-TABLE-004',
      'WG-TABLE-005',
      'WG-TABLE-006',
      'WG-PROOF-003',
    ];
  if (path.startsWith('test/webtest-')) {
    const browserIds = [
      'WG-VIEW-001',
      'WG-VIEW-003',
      'WG-VIEW-004',
      'WG-VIEW-006',
      'WG-VIEW-007',
      'WG-VIEW-008',
      'WG-VIEW-009',
      'WG-VIEW-010',
      'WG-PROOF-004',
    ];
    if (path === 'test/webtest-serialize.ts')
      browserIds.push(
        'WG-DOC-008',
        'WG-DOC-013',
        'WG-DOC-015',
        'WG-DOC-016',
        'WG-VIEW-011'
      );
    if (path === 'test/webtest-commands.ts')
      browserIds.push('WG-CMD-001', 'WG-CMD-002', 'WG-CMD-003');
    return browserIds;
  }
  if (path === 'test/test-change.ts')
    return [
      'WG-DOC-009',
      'WG-DOC-010',
      'WG-DOC-011',
      'WG-DOC-012',
      'WG-PROOF-001',
    ];
  if (/test-(node|pos|prop|schema)\.ts$/.test(path))
    return [
      'WG-DOC-001',
      'WG-DOC-003',
      'WG-DOC-004',
      'WG-DOC-006',
      'WG-DOC-013',
      'WG-DOC-015',
      'WG-DOC-016',
      'WG-PROOF-001',
    ];
  if (path === 'test/test-collab.ts')
    return ['WG-COLLAB-001', 'WG-COLLAB-002', 'WG-PROOF-002'];
  if (path === 'test/test-history.ts')
    return ['WG-HIST-001', 'WG-HIST-002', 'WG-HIST-003', 'WG-PROOF-002'];
  if (/test-(state|facet|correction|selection)\.ts$/.test(path))
    return [
      'WG-STATE-001',
      'WG-STATE-002',
      'WG-STATE-003',
      'WG-STATE-006',
      'WG-STATE-008',
      'WG-STATE-009',
      'WG-STATE-010',
      'WG-PROOF-002',
    ];
  if (path === 'test/test-commands.ts')
    return ['WG-CMD-001', 'WG-CMD-002', 'WG-CMD-003', 'WG-PROOF-002'];
  return ['WG-META-003'];
};

const conceptsForPath = (path) => {
  if (byPath[path]) return byPath[path];
  if (path.startsWith('test/') && path.endsWith('.ts'))
    return testConceptIds(path);
  return [];
};

const hash = (value) => createHash('sha256').update(value).digest('hex');
const keyName = (node) => {
  if (!node) return '<anonymous>';
  if (node.type === 'Identifier' || node.type === 'PrivateName')
    return node.name ?? node.id?.name ?? '<private>';
  if (node.type === 'StringLiteral' || node.type === 'NumericLiteral')
    return String(node.value);
  if (node.type === 'TSQualifiedName')
    return `${keyName(node.left)}.${keyName(node.right)}`;
  return '<computed>';
};
const bindingNames = (node) => {
  if (!node) return ['<anonymous>'];
  if (node.type === 'Identifier') return [node.name];
  if (node.type === 'ObjectPattern')
    return node.properties.flatMap((property) =>
      property.type === 'RestElement'
        ? bindingNames(property.argument)
        : bindingNames(property.value)
    );
  if (node.type === 'ArrayPattern')
    return node.elements.flatMap((element) => bindingNames(element));
  if (node.type === 'RestElement' || node.type === 'AssignmentPattern')
    return bindingNames(node.argument ?? node.left);
  return ['<pattern>'];
};
const isPrivateMember = (member) =>
  member.accessibility === 'private' ||
  member.accessibility === 'protected' ||
  member.key?.type === 'PrivateName';

const collectDeclarations = (program) => {
  const items = [];
  const add = ({ exported, kind, line, name, owner = null }) => {
    items.push({
      exported,
      kind,
      line: line ?? 1,
      name: owner ? `${owner}.${name}` : name,
    });
  };

  const walkStatements = (
    statements,
    { exportedScope = false, owner = null } = {}
  ) => {
    for (const original of statements) {
      let node = original;
      let exported = exportedScope;

      if (
        node.type === 'ExportNamedDeclaration' ||
        node.type === 'ExportDefaultDeclaration'
      ) {
        exported = true;
        if (!node.declaration) {
          for (const specifier of node.specifiers ?? []) {
            add({
              exported: true,
              kind: node.source ? 're-export' : 'export',
              line: specifier.loc?.start.line ?? node.loc?.start.line,
              name: keyName(specifier.exported ?? specifier.local),
              owner,
            });
          }
          continue;
        }
        node = node.declaration;
      } else if (node.type === 'ExportAllDeclaration') {
        add({
          exported: true,
          kind: 'export-all',
          line: node.loc?.start.line,
          name: node.source.value,
          owner,
        });
        continue;
      }

      if (node.type === 'VariableDeclaration') {
        for (const declaration of node.declarations) {
          for (const name of bindingNames(declaration.id))
            add({
              exported,
              kind: 'variable',
              line: declaration.loc?.start.line ?? node.loc?.start.line,
              name,
              owner,
            });
        }
      } else if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'TSDeclareFunction'
      ) {
        add({
          exported,
          kind: 'function',
          line: node.loc?.start.line,
          name: keyName(node.id),
          owner,
        });
      } else if (
        node.type === 'ClassDeclaration' ||
        node.type === 'ClassExpression'
      ) {
        const className = keyName(node.id);
        const fullOwner = owner ? `${owner}.${className}` : className;
        add({
          exported,
          kind: 'class',
          line: node.loc?.start.line,
          name: className,
          owner,
        });
        for (const member of node.body.body) {
          const memberName =
            member.kind === 'constructor' ? 'constructor' : keyName(member.key);
          const memberKind =
            member.type === 'ClassMethod' ||
            member.type === 'ClassPrivateMethod' ||
            member.type === 'TSDeclareMethod'
              ? member.kind === 'get' || member.kind === 'set'
                ? member.kind
                : 'method'
              : member.type === 'StaticBlock'
                ? 'static-block'
                : 'property';
          add({
            exported: exported && !isPrivateMember(member),
            kind: memberKind,
            line: member.loc?.start.line,
            name: memberName,
            owner: fullOwner,
          });
        }
      } else if (node.type === 'TSInterfaceDeclaration') {
        const name = keyName(node.id);
        const fullOwner = owner ? `${owner}.${name}` : name;
        add({
          exported,
          kind: 'interface',
          line: node.loc?.start.line,
          name,
          owner,
        });
        for (const member of node.body.body) {
          add({
            exported,
            kind: member.type
              .replace(/^TS/, '')
              .replace(/Signature$/, '')
              .toLowerCase(),
            line: member.loc?.start.line,
            name: keyName(member.key),
            owner: fullOwner,
          });
        }
      } else if (node.type === 'TSTypeAliasDeclaration') {
        add({
          exported,
          kind: 'type',
          line: node.loc?.start.line,
          name: keyName(node.id),
          owner,
        });
      } else if (node.type === 'TSEnumDeclaration') {
        const name = keyName(node.id);
        const fullOwner = owner ? `${owner}.${name}` : name;
        add({
          exported,
          kind: 'enum',
          line: node.loc?.start.line,
          name,
          owner,
        });
        for (const member of node.members)
          add({
            exported,
            kind: 'enum-member',
            line: member.loc?.start.line,
            name: keyName(member.id),
            owner: fullOwner,
          });
      } else if (node.type === 'TSModuleDeclaration') {
        const name = keyName(node.id);
        const fullOwner = owner ? `${owner}.${name}` : name;
        add({
          exported,
          kind: 'namespace',
          line: node.loc?.start.line,
          name,
          owner,
        });
        let body = node.body;
        while (body?.type === 'TSModuleDeclaration') body = body.body;
        if (body?.type === 'TSModuleBlock')
          walkStatements(body.body, {
            exportedScope: false,
            owner: fullOwner,
          });
      }
    }
  };

  walkStatements(program.body);
  return items;
};

const head = runGit('rev-parse', '--verify', 'HEAD');
const branch = runGit('branch', '--show-current');
const upstream = runGit(
  'rev-parse',
  '--abbrev-ref',
  '--symbolic-full-name',
  '@{upstream}'
);
const origin = runGit('remote', 'get-url', 'origin');
const porcelain = runGit('status', '--porcelain', '--untracked-files=normal');
const trackedPaths = nulList('ls-files', '-z').sort();

if (head !== expectedHead)
  throw new Error(`Wordgard HEAD ${head} does not match ${expectedHead}`);
if (porcelain !== '')
  throw new Error(`Wordgard checkout is dirty:\n${porcelain}`);

const files = [];
for (const path of trackedPaths) {
  const bytes = readFileSync(join(repository, path));
  const text = bytes.toString('utf8');
  const extension = extname(path);
  const exclusionReason = exclusions[path];
  const conceptIds = conceptsForPath(path);
  const isSource = ['.js', '.mjs', '.ts', '.tsx'].includes(extension);
  let declarationItems = [];

  if (isSource) {
    const ast = parse(text, {
      errorRecovery: false,
      plugins: ['typescript', 'jsx'],
      sourceType: 'module',
    });
    declarationItems = collectDeclarations(ast.program);
  }

  if (!exclusionReason && conceptIds.length === 0)
    throw new Error(`No semantic concept mapping for ${path}`);

  for (const conceptId of conceptIds) {
    if (!conceptById.has(conceptId))
      throw new Error(`Unknown concept ${conceptId} in ${path}`);
  }

  const items = declarationItems.map((item, index) => ({
    atomicConceptId: `WG-SOURCE-${hash(
      `${path}:${item.line}:${item.kind}:${item.name}:${index}`
    ).slice(0, 16)}`,
    conceptIds,
    evidence: `${path}:${item.line}`,
    kind: item.kind,
    line: item.line,
    name: item.name,
    status: exclusionReason ? 'excluded' : 'mapped',
    visibility: item.exported ? 'public' : 'private',
    ...(exclusionReason ? { exclusionReason } : {}),
  }));

  files.push({
    bytes: bytes.length,
    conceptIds,
    declarationItems: items,
    evidence: `${path}:1-${Math.max(1, text.split('\n').length)}`,
    lineCount: text.split('\n').length,
    path,
    sha256: hash(bytes),
    status: exclusionReason ? 'excluded' : 'mapped',
    ...(exclusionReason ? { exclusionReason } : {}),
  });
}

const mappedFiles = files.filter((file) => file.status === 'mapped');
const excludedFiles = files.filter((file) => file.status === 'excluded');
const declarationItems = files.flatMap((file) => file.declarationItems);
const publicItems = declarationItems.filter(
  (item) => item.visibility === 'public'
);
const privateItems = declarationItems.filter(
  (item) => item.visibility === 'private'
);
const referencedConceptIds = new Set(
  mappedFiles.flatMap((file) => file.conceptIds)
);
const unreferencedConceptIds = [...conceptById.keys()].filter(
  (conceptId) => !referencedConceptIds.has(conceptId)
);

if (unreferencedConceptIds.length)
  throw new Error(
    `Semantic concepts lack source mappings: ${unreferencedConceptIds.join(
      ', '
    )}`
  );

const laneCounts = {};
for (const conceptId of referencedConceptIds) {
  const lane = conceptById.get(conceptId).lane;
  laneCounts[lane] = (laneCounts[lane] ?? 0) + 1;
}

const manifest = {
  schemaVersion: 1,
  kind: 'editor-audit-source-manifest',
  generatedAt: new Date().toISOString(),
  authority: {
    branch,
    clean: porcelain === '',
    commit: head,
    license: {
      file: 'LICENSE',
      packageDeclaration: 'MIT',
      sha256: hash(readFileSync(join(repository, 'LICENSE'))),
      spdx: 'MIT',
    },
    origin,
    repository,
    upstream,
  },
  policy: {
    atomicConcept:
      'Every TypeScript/JavaScript declaration, exported member, class member, interface member, namespace member, and re-export is an immutable source-derived atomic concept.',
    semanticConcept:
      'Atomic source concepts map to the smallest practical file-owner mechanism set. Trivial forwarding declarations remain mapped to their owner rather than creating architectural recommendations.',
    files:
      'Every tracked file is mapped or has an exact exclusion. Build output and dependencies are absent from git inventory.',
    conclusions:
      'This manifest proves source coverage only. Cross-editor classifications and P0-P3 proposals belong to the parent decision audit.',
  },
  summary: {
    trackedFiles: files.length,
    mappedFiles: mappedFiles.length,
    excludedFiles: excludedFiles.length,
    unmappedFiles: 0,
    declarationItems: declarationItems.length,
    mappedDeclarationItems: declarationItems.filter(
      (item) => item.status === 'mapped'
    ).length,
    excludedDeclarationItems: declarationItems.filter(
      (item) => item.status === 'excluded'
    ).length,
    unmappedDeclarationItems: 0,
    publicDeclarationItems: publicItems.length,
    privateDeclarationItems: privateItems.length,
    semanticConcepts: referencedConceptIds.size,
    laneCounts: Object.fromEntries(
      Object.entries(laneCounts).sort(([left], [right]) =>
        left.localeCompare(right)
      )
    ),
  },
  validation: {
    exactHead: head === expectedHead,
    cleanCheckout: porcelain === '',
    trackedFileCountMatches: files.length === trackedPaths.length,
    zeroUnmappedFiles: files.every(
      (file) => file.status === 'excluded' || file.conceptIds.length > 0
    ),
    zeroUnmappedDeclarationItems: declarationItems.every(
      (item) => item.status === 'excluded' || item.conceptIds.length > 0
    ),
    zeroUnreferencedSemanticConcepts: unreferencedConceptIds.length === 0,
  },
  concepts: [...referencedConceptIds]
    .sort()
    .map((conceptId) => conceptById.get(conceptId)),
  files,
};

writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(manifest.summary)}\n`);

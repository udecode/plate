#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const artifactRoot = dirname(scriptPath);
const repoRoot = resolve(artifactRoot, '../../../..');
const websiteRoot = '/Users/zbeyens/git/wordgard-website';
const outputPath = resolve(artifactRoot, 'wordgard-site-coverage.json');
// Plate intentionally resolves a TS 7 package shim. The frozen Wordgard
// checkout owns the real TypeScript compiler used by both reference repos.
const require = createRequire('/Users/zbeyens/git/wordgard/package.json');
const ts = require('typescript');
const HTML_HEADING_RE = /<h([1-4])(?:\s[^>]*)?>(.*?)<\/h\1>/i;
const LINE_BREAK_RE = /\r?\n/;
const MARKDOWN_HEADING_RE = /^(#{1,4})\s+(.+?)\s*$/;
const SNIPPET_MARKER_RE = /^\/\/!([^\s]+)\s*$/;
const SOURCE_FILE_RE = /\.[cm]?[jt]sx?$/;
const STRIP_HTML_RE = /<[^>]+>/g;

const git = (...args) =>
  execFileSync('git', ['-C', websiteRoot, ...args], {
    encoding: 'utf8',
  }).trim();
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

const represented = (...auditConceptIds) => ({
  auditConceptIds,
  status: 'represented',
});
const split = (sourceConceptId, proposedAuditConceptId, reason) => ({
  proposedAuditConceptId,
  reason,
  sourceConceptId,
  status: 'requires-atomic-split',
});
const added = (proposedAuditConceptId, reason) => ({
  proposedAuditConceptId,
  reason,
  status: 'new-site-concept',
});

// These are website-derived concepts, not a copy of the library source map.
// A concept is split whenever the website gives it an independently different
// API, lifecycle, failure mode, or proof obligation.
const concepts = [
  {
    id: 'WGS-META-001',
    lane: 'documentation',
    title: 'Source-derived public API reference and documentation generation',
    evidence: [
      'README.md:8-11',
      'src/build.ts:60-193',
      'template/ref.html:1-28',
    ],
    representation: added(
      'WG-WEB-001',
      'The source audit has no owner for extracting API docs from TypeScript comments, resolving symbol links, ordering public modules, and publishing the reference shell.'
    ),
  },
  {
    id: 'WGS-META-002',
    lane: 'documentation',
    title:
      'Literate executable examples with snippet injection and import maps',
    evidence: [
      'src/build.ts:64-110',
      'src/build.ts:194-210',
      'site/examples/index.html:10-79',
    ],
    representation: represented('WG-META-004A'),
  },
  {
    id: 'WGS-META-003',
    lane: 'documentation',
    title: 'Reference search, ranking, and scroll-trail navigation',
    evidence: ['site/docs/ref/ref.js:1-149', 'template/ref.html:1-28'],
    representation: added(
      'WG-WEB-003',
      'The source audit has no correctness owner for reference search indexing, ranking, query parsing, or breadcrumb synchronization.'
    ),
  },
  {
    id: 'WGS-META-004',
    lane: 'documentation',
    title:
      'Sandboxed interactive playground with shareable programs and console transport',
    evidence: [
      'site/try/try.ts:143-250',
      'site/try/sandbox.js:1-51',
      'site/try/index.html:118-154',
    ],
    representation: represented('WG-META-004A'),
  },
  {
    id: 'WGS-META-005',
    lane: 'packaging',
    title: 'Public root namespace and coherent subpath-module ergonomics',
    evidence: ['site/docs/ref/index.md:1-35', 'src/build.ts:194-210'],
    representation: represented('WG-META-001'),
  },
  {
    id: 'WGS-META-007',
    lane: 'packaging',
    title: 'Namespace-output rewrite and cross-bundler dead-code elimination',
    evidence: ['site/docs/faq/index.md:51-65'],
    representation: split(
      'WG-META-002',
      'WG-META-002B',
      'Namespace ergonomics and the Rollup-specific output rewrite/tree-shaking claim are independent from library compilation and declaration bundling; other bundlers are explicitly unknown.'
    ),
  },
  {
    id: 'WGS-META-008',
    lane: 'documentation',
    title: 'Staged static-site publication and rollback',
    evidence: ['src/mapdir.ts:4-79'],
    representation: added(
      'WG-WEB-002',
      'The source audit has no site-publication lifecycle row; the website stages a new tree and moves the old output but fails to restore it if final publication fails.'
    ),
  },
  {
    id: 'WGS-META-006',
    lane: 'documentation',
    title: 'Public architecture positioning and ProseMirror migration map',
    evidence: ['site/index.html:29-94', 'site/docs/prosemirror/index.md:1-349'],
    representation: represented('WG-META-004A'),
  },
  {
    id: 'WGS-EDITOR-001',
    lane: 'editor',
    title:
      'Editor construction, immutable state access, serialization, and document replacement',
    evidence: [
      'site/examples/basic/index.md:13-126',
      'site/docs/guide/index.md:24-103',
    ],
    representation: represented('WG-VIEW-001', 'WG-STATE-001A', 'WG-DOC-016'),
  },
  {
    id: 'WGS-DOC-001',
    lane: 'document',
    title: 'Immutable token-tree document, node, leaf, and mark value model',
    evidence: [
      'site/docs/guide/index.md:105-277',
      'site/docs/prosemirror/index.md:37-66',
    ],
    representation: represented(
      'WG-DOC-001',
      'WG-DOC-002',
      'WG-DOC-003',
      'WG-DOC-018'
    ),
  },
  {
    id: 'WGS-DOC-002',
    lane: 'document',
    title: 'Global token positions and resolved structural context',
    evidence: [
      'site/docs/guide/index.md:278-331',
      'site/docs/prosemirror/index.md:67-82',
    ],
    representation: represented('WG-DOC-006'),
  },
  {
    id: 'WGS-DOC-003',
    lane: 'document',
    title: 'Change specification, schema fitting, and corrected insertion',
    evidence: [
      'site/docs/guide/index.md:332-434',
      'site/examples/transaction/index.md:14-125',
    ],
    representation: represented('WG-DOC-009', 'WG-DOC-012'),
  },
  {
    id: 'WGS-DOC-004',
    lane: 'document',
    title: 'Change mapping, composition, pairwise transform, and inversion',
    evidence: [
      'site/docs/guide/index.md:435-494',
      'site/examples/collab/index.md:117-191',
    ],
    representation: represented('WG-DOC-010', 'WG-DOC-011', 'WG-COLLAB-002A'),
  },
  {
    id: 'WGS-DOC-005',
    lane: 'document',
    title: 'Open slices and structural copy-paste context',
    evidence: ['site/docs/prosemirror/index.md:197-210'],
    representation: represented('WG-DOC-008', 'WG-VIEW-011'),
  },
  {
    id: 'WGS-SCHEMA-001',
    lane: 'schema',
    title:
      'Schema construction from configuration or standalone element definitions',
    evidence: [
      'site/examples/schema/index.md:13-92',
      'site/docs/guide/index.md:496-515',
    ],
    representation: represented('WG-DOC-004A', 'WG-PRODUCT-002'),
  },
  {
    id: 'WGS-SCHEMA-002',
    lane: 'schema',
    title:
      'Custom typed element validation, DOM codec, command, menu, style, and bundle',
    evidence: [
      'site/examples/schema/index.md:94-136',
      'site/examples/schema/dino.ts:1-118',
    ],
    representation: represented(
      'WG-DOC-002',
      'WG-DOC-013A',
      'WG-DOC-014',
      'WG-DOC-015',
      'WG-DOC-016',
      'WG-PRODUCT-002'
    ),
  },
  {
    id: 'WGS-SCHEMA-003',
    lane: 'schema',
    title: 'Schema relationship overrides with matching command adaptation',
    evidence: [
      'site/docs/guide/index.md:694-718',
      'site/examples/schema/index.md:139-179',
      'site/examples/schema/outliner.ts:1-39',
    ],
    representation: split(
      'WG-DOC-004',
      'WG-DOC-004B',
      'Schema.Override changes content, mark-target, and group relationships independently from schema compilation and wrapping caches.'
    ),
  },
  {
    id: 'WGS-SCHEMA-004',
    lane: 'schema',
    title: 'Single-textblock inline schema as a form control',
    evidence: [
      'site/examples/schema/index.md:182-209',
      'site/examples/schema/inline.ts:1-40',
    ],
    representation: represented('WG-PRODUCT-001A', 'WG-VIEW-013B'),
  },
  {
    id: 'WGS-STATE-001',
    lane: 'state',
    title: 'Immutable editor state and atomic transaction publication',
    evidence: [
      'site/docs/guide/index.md:720-808',
      'site/examples/transaction/index.md:198-245',
    ],
    representation: represented('WG-STATE-001A', 'WG-STATE-006A'),
  },
  {
    id: 'WGS-STATE-002',
    lane: 'state',
    title:
      'Typed state fields, mapped effects, JSON persistence, and inverted effects',
    evidence: [
      'site/docs/guide/index.md:952-978',
      'site/examples/transaction/index.md:131-192',
      'site/examples/blame/blame.ts:71-127',
    ],
    representation: represented('WG-STATE-002', 'WG-STATE-015', 'WG-HIST-001A'),
  },
  {
    id: 'WGS-CONFIG-001',
    lane: 'configuration',
    title:
      'Typed facet declaration, combination, static values, and precedence',
    evidence: [
      'site/docs/guide/index.md:905-932',
      'site/examples/config/index.md:41-73',
    ],
    representation: split(
      'WG-STATE-003',
      'WG-STATE-003A',
      'Facet declaration and deterministic input combination are independently usable without dynamic dependency tracking.'
    ),
  },
  {
    id: 'WGS-CONFIG-002',
    lane: 'configuration',
    title: 'Dependency-tracked computed facet providers',
    evidence: [
      'site/docs/guide/index.md:933-950',
      'site/examples/config/index.md:74-78',
    ],
    representation: split(
      'WG-STATE-003',
      'WG-STATE-003B',
      'Computed providers own runtime dependency discovery, invalidation, and comparison; that is a different lifecycle from static facets.'
    ),
  },
  {
    id: 'WGS-CONFIG-003',
    lane: 'configuration',
    title: 'Recursive extension trees and feature-local exported bundles',
    evidence: [
      'site/examples/config/index.md:85-160',
      'site/docs/guide/index.md:857-904',
    ],
    representation: split(
      'WG-STATE-004',
      'WG-STATE-004A',
      'Recursive flattening and transparent feature bundles are a composition API distinct from conflict precedence and identity dedupe.'
    ),
  },
  {
    id: 'WGS-CONFIG-004',
    lane: 'configuration',
    title: 'Extension identity deduplication and precedence bands',
    evidence: [
      'site/examples/config/index.md:161-208',
      'site/docs/prosemirror/index.md:125-168',
    ],
    representation: split(
      'WG-STATE-004',
      'WG-STATE-004B',
      'Identity dedupe and precedence resolve conflicts after flattening and have separate correctness and API consequences.'
    ),
  },
  {
    id: 'WGS-CONFIG-005',
    lane: 'configuration',
    title: 'Whole-root transactional reconfiguration with state preservation',
    evidence: [
      'site/examples/config/index.md:214-245',
      'site/docs/guide/index.md:979-1007',
    ],
    representation: split(
      'WG-STATE-005',
      'WG-STATE-005A',
      'Replacing the root extension tree has different ownership and reset semantics from append-only injection and compartments.'
    ),
  },
  {
    id: 'WGS-CONFIG-006',
    lane: 'configuration',
    title: 'Append-only transactional configuration injection',
    evidence: [
      'site/examples/config/index.md:246-257',
      'site/docs/guide/index.md:987-993',
    ],
    representation: split(
      'WG-STATE-005',
      'WG-STATE-005B',
      'appendConfig is monotonic injection used by extensions and has no replacement handle.'
    ),
  },
  {
    id: 'WGS-CONFIG-007',
    lane: 'configuration',
    title: 'Compartment-scoped transactional reconfiguration',
    evidence: [
      'site/examples/config/index.md:258-296',
      'site/docs/guide/index.md:993-1007',
    ],
    representation: split(
      'WG-STATE-005',
      'WG-STATE-005C',
      'A named compartment owns a replaceable subtree and state query, unlike root replacement or append-only injection.'
    ),
  },
  {
    id: 'WGS-TX-001',
    lane: 'transaction',
    title:
      'Headless transaction objects, spec merging, and sequential interpretation',
    evidence: [
      'site/examples/transaction/index.md:198-245',
      'site/docs/prosemirror/index.md:211-253',
    ],
    representation: represented('WG-STATE-006A'),
  },
  {
    id: 'WGS-TX-002',
    lane: 'transaction',
    title: 'Universal same-transaction extenders',
    evidence: [
      'site/docs/guide/index.md:751-808',
      'site/examples/transaction/index.md:251-290',
    ],
    representation: split(
      'WG-STATE-007',
      'WG-STATE-007A',
      'Extenders merge additions into the transaction being built and can invalidate caller postconditions.'
    ),
  },
  {
    id: 'WGS-TX-003',
    lane: 'transaction',
    title: 'Follow-up transaction appenders',
    evidence: [
      'site/docs/guide/index.md:801-808',
      'site/examples/transaction/index.md:292-297',
    ],
    representation: split(
      'WG-STATE-007',
      'WG-STATE-007B',
      'Appenders dispatch separately undoable follow-up transactions and have distinct reentrancy and ordering semantics.'
    ),
  },
  {
    id: 'WGS-SELECTION-001',
    lane: 'selection',
    title:
      'Typed selection classes, replacement ranges, and direction-aware motion',
    evidence: [
      'site/docs/guide/index.md:809-855',
      'site/docs/prosemirror/index.md:280-288',
    ],
    representation: represented(
      'WG-STATE-009',
      'WG-STATE-010A',
      'WG-STATE-010B',
      'WG-STATE-011A',
      'WG-STATE-011B'
    ),
  },
  {
    id: 'WGS-EDITOR-002',
    lane: 'editor',
    title:
      'Editor plugin, listener, update, DOM-query, focus, and flush lifecycle',
    evidence: [
      'site/docs/guide/index.md:1020-1128',
      'site/examples/footnote/index.md:69-107',
    ],
    representation: represented(
      'WG-VIEW-001A',
      'WG-VIEW-001B',
      'WG-VIEW-002',
      'WG-VIEW-006A',
      'WG-VIEW-006B'
    ),
  },
  {
    id: 'WGS-INPUT-001',
    lane: 'input',
    title:
      'Native input, composition, keyboard, pointer, and clipboard routing',
    evidence: ['site/docs/prosemirror/index.md:255-279'],
    representation: represented(
      'WG-VIEW-009A',
      'WG-VIEW-009B',
      'WG-VIEW-010A',
      'WG-VIEW-010B1',
      'WG-VIEW-010B2',
      'WG-VIEW-010C1',
      'WG-VIEW-010C2'
    ),
  },
  {
    id: 'WGS-DECO-001',
    lane: 'view',
    title: 'Mapped point/range decorations and widget projection',
    evidence: [
      'site/docs/guide/index.md:1208-1266',
      'site/docs/prosemirror/index.md:323-347',
    ],
    representation: represented(
      'WG-VIEW-005A1',
      'WG-VIEW-005A2',
      'WG-VIEW-005B',
      'WG-VIEW-005C1'
    ),
  },
  {
    id: 'WGS-COMMAND-001',
    lane: 'command',
    title:
      'Function-identity commands, pure specs, handlers, binding, and interception',
    evidence: [
      'site/docs/guide/index.md:1268-1323',
      'site/docs/prosemirror/index.md:307-321',
    ],
    representation: represented('WG-CMD-001', 'WG-CMD-002A', 'WG-CMD-002B'),
  },
  {
    id: 'WGS-CORRECTION-001',
    lane: 'state',
    title: 'Changed-region invariant corrections',
    evidence: [
      'site/docs/guide/index.md:1325-1387',
      'site/examples/collab/index.md:323-358',
    ],
    representation: represented('WG-STATE-008', 'WG-COLLAB-002B'),
  },
  {
    id: 'WGS-MENU-001',
    lane: 'product-ui',
    title: 'Declarative menu items, groups, templates, and custom controls',
    evidence: [
      'site/docs/guide/index.md:1389-1522',
      'site/examples/schema/dino.ts:66-98',
    ],
    representation: represented('WG-CMD-004', 'WG-VIEW-014B'),
  },
  {
    id: 'WGS-STYLE-001',
    lane: 'view',
    title: 'Always-active extension-local style modules',
    evidence: [
      'site/examples/style/index.md:20-44',
      'site/docs/guide/index.md:1130-1165',
    ],
    representation: split(
      'WG-VIEW-013',
      'WG-VIEW-013A',
      'Wordgard.styles installs stable low-precedence extension CSS independently from opt-in themes.'
    ),
  },
  {
    id: 'WGS-STYLE-002',
    lane: 'view',
    title: 'Editor-scoped opt-in themes with unique scope classes',
    evidence: [
      'site/examples/style/index.md:45-88',
      'site/docs/guide/index.md:1166-1174',
    ],
    representation: split(
      'WG-VIEW-013',
      'WG-VIEW-013B',
      'Wordgard.theme has per-editor activation and generated scope identity, unlike always-active extension styles.'
    ),
  },
  {
    id: 'WGS-STYLE-003',
    lane: 'view',
    title: 'Color-scheme selection and root-level style-module publication',
    evidence: [
      'site/examples/style/index.md:61-70',
      'site/examples/style/index.md:90-115',
    ],
    representation: split(
      'WG-VIEW-013',
      'WG-VIEW-013C',
      'Root/frame/shadow-root stylesheet publication and light/dark/auto selection have their own runtime lifecycle.'
    ),
  },
  {
    id: 'WGS-STYLE-004',
    lane: 'view',
    title:
      'Editor DOM layout, dynamic attributes, orientation constraints, and CSS variables',
    evidence: [
      'site/examples/style/index.md:162-211',
      'site/docs/guide/index.md:1176-1206',
    ],
    representation: split(
      'WG-VIEW-013',
      'WG-VIEW-013D',
      'DOM attributes and layout constraints are state-derived rendering contracts, not stylesheet-module configuration.'
    ),
  },
  {
    id: 'WGS-I18N-001',
    lane: 'localization',
    title:
      'Typed phrase sets, overrides, placeholders, and deferred references',
    evidence: [
      'site/examples/translate/index.md:3-57',
      'site/examples/translate/phrases.ts:1-55',
    ],
    representation: represented('WG-STATE-012'),
  },
  {
    id: 'WGS-COLLAB-001',
    lane: 'collaboration',
    title:
      'Versioned client queue, acknowledgement, resubmission, and update batching',
    evidence: [
      'site/examples/collab/index.md:117-191',
      'site/examples/collab/index.md:269-321',
      'site/examples/collab/collab.ts:196-287',
    ],
    representation: represented('WG-COLLAB-001'),
  },
  {
    id: 'WGS-COLLAB-002',
    lane: 'collaboration',
    title:
      'Host-owned central-server protocol, transform history, transport, and broadcast loop',
    evidence: [
      'site/examples/collab/index.md:193-267',
      'site/examples/collab/collab.ts:76-194',
    ],
    representation: represented('WG-COLLAB-002A', 'WG-COLLAB-002C'),
  },
  {
    id: 'WGS-COLLAB-003',
    lane: 'collaboration',
    title:
      'Single-owner collaboration corrections and remote-history semantics',
    evidence: ['site/examples/collab/index.md:323-358'],
    representation: represented('WG-COLLAB-002B', 'WG-HIST-001A'),
  },
  {
    id: 'WGS-NESTED-001',
    lane: 'integration',
    title: 'Bidirectional nested-editor document and selection synchronization',
    evidence: [
      'site/examples/footnote/index.md:52-91',
      'site/examples/footnote/footnote.ts:65-92',
      'site/examples/footnote/footnote.ts:136-160',
    ],
    representation: added(
      'WG-INTEGRATION-NESTED-001',
      'The 101 source concepts contain the primitives but no row owns pad/clip mapping, loop-suppression annotations, parent-position tracking, and child replacement as one nested-editor contract.'
    ),
  },
  {
    id: 'WGS-NESTED-002',
    lane: 'integration',
    title:
      'Parent-owned history, focus routing, tooltip lifecycle, and flush for a nested editor',
    evidence: [
      'site/examples/footnote/index.md:69-107',
      'site/examples/footnote/footnote.ts:94-135',
      'site/examples/footnote/footnote.ts:163-226',
    ],
    representation: added(
      'WG-INTEGRATION-NESTED-002',
      'No current or planned row judges shared parent undo/redo, Enter/Escape focus transfer, tooltip reuse, and synchronous flush ordering.'
    ),
  },
  {
    id: 'WGS-BLAME-001',
    lane: 'application-state',
    title: 'Persistent origin attribution mapped through document gaps',
    evidence: [
      'site/examples/blame/index.md:12-54',
      'site/examples/blame/blame.ts:1-43',
      'site/examples/blame/blame.ts:71-127',
    ],
    representation: added(
      'WG-APPLICATION-BLAME-001',
      'The source audit covers generic fields and mappings but not the application contract for preserving provenance across replacements and sessions.'
    ),
  },
  {
    id: 'WGS-BLAME-002',
    lane: 'application-state',
    title:
      'Cached decoration projection of application-owned attribution state',
    evidence: [
      'site/examples/blame/index.md:56-71',
      'site/examples/blame/blame.ts:45-69',
      'site/examples/blame/blame.ts:98-117',
    ],
    representation: added(
      'WG-APPLICATION-BLAME-002',
      'No current or planned row owns the derived state-field to mapped-decoration projection and per-value decoration cache.'
    ),
  },
  {
    id: 'WGS-PROOF-001',
    lane: 'proof',
    title: 'Executable example compilation and behavior integrity',
    evidence: [
      'package.json:7-11',
      'src/build.ts:89-110',
      'src/build.ts:222-266',
    ],
    representation: added(
      'WG-PROOF-005A',
      'The site strips TypeScript with SWC and injects snippets, but has no example typecheck or behavior-test command; this proof obligation is absent from the 101 source concepts and planned splits.'
    ),
  },
  {
    id: 'WGS-PROOF-002',
    lane: 'proof',
    title:
      'Public reference completeness, links, samples, and search integrity',
    evidence: [
      'site/docs/ref/index.md:1-35',
      'src/build.ts:145-172',
      'site/docs/ref/ref.js:1-149',
    ],
    representation: added(
      'WG-PROOF-005B',
      'The reference claims completeness but omits or misnames entrypoints, and no command verifies internal anchors, sample syntax, generated API completeness, or search behavior.'
    ),
  },
];

const findings = [
  {
    id: 'WGS-FINDING-001',
    severity: 'P0',
    title: 'The complete-reference claim is false',
    evidence: [
      'site/docs/ref/index.md:1-2',
      'site/docs/ref/index.md:23-24',
      'src/build.ts:24-24',
    ],
    detail:
      'The reference says it lists every public type/value, names stale wordgard/schema-def instead of wordgard/types, and the generator omits the root wordgard namespace entrypoint.',
  },
  {
    id: 'WGS-FINDING-002',
    severity: 'P1',
    title: 'Guide and homepage contain broken internal anchors',
    evidence: ['site/docs/guide/index.md:63-67', 'site/index.html:77-77'],
    detail:
      'The guide links #h-document and #h-schema instead of generated #h-documents and #h-the-schema; the homepage links #tables instead of #table.',
  },
  {
    id: 'WGS-FINDING-003',
    severity: 'P1',
    title: 'The system guide contains invalid JavaScript',
    evidence: ['site/docs/guide/index.md:348-357'],
    detail:
      'The multiple-change example contains `from 1` rather than `from: 1`; SWC snippet handling does not validate this Markdown code block.',
  },
  {
    id: 'WGS-FINDING-004',
    severity: 'P2',
    title: 'Transaction prose assigns fields to a selection',
    evidence: ['site/docs/guide/index.md:751-764'],
    detail:
      'The guide says transaction fields are stored in a selection, contradicting the transaction API described around it.',
  },
  {
    id: 'WGS-FINDING-005',
    severity: 'P1',
    title: 'Static publication rollback is incomplete',
    evidence: ['src/mapdir.ts:66-79'],
    detail:
      'After moving the previous destination aside, a failure renaming the staged tree into place cleans the temporary tree but never restores the previous destination.',
  },
  {
    id: 'WGS-FINDING-006',
    severity: 'P1',
    title: 'Reference search crashes on punctuation-only queries',
    evidence: ['site/docs/ref/ref.js:30-32'],
    detail:
      'String.match returns null, but the search loop iterates `words` without a null guard.',
  },
  {
    id: 'WGS-FINDING-007',
    severity: 'P2',
    title:
      'Reference-search context extraction uses an ineffective regular expression',
    evidence: ['site/docs/ref/ref.js:61-62'],
    detail:
      'The expression only matches context ending in a literal dot followed by a closing bracket, so intended parent context is generally lost.',
  },
  {
    id: 'WGS-FINDING-008',
    severity: 'P1',
    title: 'Cross-bundler tree-shaking is explicitly unproved',
    evidence: ['site/docs/faq/index.md:51-65'],
    detail:
      'The FAQ reports Rollup success after a build rewrite and explicitly says handling by other tools is unknown.',
  },
  {
    id: 'WGS-FINDING-009',
    severity: 'P2',
    title: 'Homepage compatibility statements are claims, not proof',
    evidence: ['site/index.html:61-93'],
    detail:
      'Accessibility, mobile, bidi, and collaboration statements have no website-owned automated or raw-device evidence and must remain requirements until source tests prove them.',
  },
];

const fileSpecs = {
  '.gitignore': {
    exclusion:
      'Repository ignore metadata; no editor or documentation semantics.',
  },
  'README.md': { concepts: ['WGS-META-001'] },
  'package.json': { concepts: ['WGS-META-001', 'WGS-PROOF-001'] },
  'rollup.codemirror.js': { concepts: ['WGS-META-004'] },
  'site/docs/faq/index.md': {
    concepts: ['WGS-META-006', 'WGS-META-007'],
    rules: [
      {
        from: 1,
        conceptId: 'WGS-META-006',
        sectionStatus: 'excluded',
        sectionReason:
          'Release timing and maintainer-policy prose, not editor architecture.',
      },
      { from: 51, conceptId: 'WGS-META-007' },
    ],
  },
  'site/docs/guide/index.md': {
    concepts: [
      'WGS-EDITOR-001',
      'WGS-DOC-001',
      'WGS-DOC-002',
      'WGS-DOC-003',
      'WGS-DOC-004',
      'WGS-SCHEMA-001',
      'WGS-SCHEMA-002',
      'WGS-SCHEMA-003',
      'WGS-STATE-001',
      'WGS-STATE-002',
      'WGS-CONFIG-001',
      'WGS-CONFIG-002',
      'WGS-CONFIG-003',
      'WGS-CONFIG-005',
      'WGS-CONFIG-006',
      'WGS-CONFIG-007',
      'WGS-SELECTION-001',
      'WGS-EDITOR-002',
      'WGS-STYLE-001',
      'WGS-STYLE-002',
      'WGS-STYLE-004',
      'WGS-DECO-001',
      'WGS-COMMAND-001',
      'WGS-CORRECTION-001',
      'WGS-MENU-001',
      'WGS-PROOF-002',
    ],
    rules: [
      { from: 1, conceptId: 'WGS-META-006' },
      { from: 24, conceptId: 'WGS-EDITOR-001' },
      { from: 105, conceptId: 'WGS-DOC-001' },
      { from: 278, conceptId: 'WGS-DOC-002' },
      { from: 332, conceptId: 'WGS-DOC-003' },
      { from: 435, conceptId: 'WGS-DOC-004' },
      { from: 496, conceptId: 'WGS-SCHEMA-001' },
      { from: 516, conceptId: 'WGS-SCHEMA-002' },
      { from: 631, conceptId: 'WGS-DOC-001' },
      { from: 694, conceptId: 'WGS-SCHEMA-003' },
      { from: 720, conceptId: 'WGS-STATE-001' },
      { from: 809, conceptId: 'WGS-SELECTION-001' },
      { from: 857, conceptId: 'WGS-CONFIG-003' },
      { from: 905, conceptId: 'WGS-CONFIG-001' },
      { from: 933, conceptId: 'WGS-CONFIG-002' },
      { from: 952, conceptId: 'WGS-STATE-002' },
      {
        from: 979,
        conceptId: 'WGS-CONFIG-005',
        sectionConcepts: ['WGS-CONFIG-005', 'WGS-CONFIG-006', 'WGS-CONFIG-007'],
      },
      { from: 1020, conceptId: 'WGS-EDITOR-002' },
      {
        from: 1130,
        conceptId: 'WGS-STYLE-001',
        sectionConcepts: ['WGS-STYLE-001', 'WGS-STYLE-002', 'WGS-STYLE-004'],
      },
      { from: 1208, conceptId: 'WGS-DECO-001' },
      { from: 1268, conceptId: 'WGS-COMMAND-001' },
      { from: 1325, conceptId: 'WGS-CORRECTION-001' },
      { from: 1389, conceptId: 'WGS-MENU-001' },
    ],
  },
  'site/docs/index.html': { concepts: ['WGS-META-003', 'WGS-META-006'] },
  'site/docs/prosemirror/index.md': {
    concepts: [
      'WGS-META-006',
      'WGS-DOC-001',
      'WGS-DOC-002',
      'WGS-SCHEMA-001',
      'WGS-CONFIG-003',
      'WGS-DOC-003',
      'WGS-DOC-005',
      'WGS-STATE-001',
      'WGS-EDITOR-002',
      'WGS-INPUT-001',
      'WGS-SELECTION-001',
      'WGS-COMMAND-001',
      'WGS-DECO-001',
    ],
    rules: [
      { from: 1, conceptId: 'WGS-META-006' },
      { from: 37, conceptId: 'WGS-DOC-001' },
      { from: 67, conceptId: 'WGS-DOC-002' },
      { from: 83, conceptId: 'WGS-SCHEMA-001' },
      { from: 125, conceptId: 'WGS-CONFIG-003' },
      { from: 169, conceptId: 'WGS-STATE-001' },
      { from: 175, conceptId: 'WGS-DOC-003' },
      { from: 197, conceptId: 'WGS-DOC-005' },
      { from: 211, conceptId: 'WGS-STATE-001' },
      { from: 255, conceptId: 'WGS-EDITOR-002' },
      { from: 261, conceptId: 'WGS-INPUT-001' },
      { from: 280, conceptId: 'WGS-SELECTION-001' },
      { from: 289, conceptId: 'WGS-EDITOR-002' },
      { from: 307, conceptId: 'WGS-COMMAND-001' },
      { from: 323, conceptId: 'WGS-DECO-001' },
    ],
  },
  'site/docs/ref/index.md': {
    concepts: [
      'WGS-META-001',
      'WGS-META-005',
      'WGS-EDITOR-001',
      'WGS-PROOF-002',
    ],
  },
  'site/docs/ref/ref.js': { concepts: ['WGS-META-003', 'WGS-PROOF-002'] },
  'site/examples/basic/index.md': {
    concepts: ['WGS-EDITOR-001'],
  },
  'site/examples/blame/blame.ts': {
    concepts: ['WGS-BLAME-001', 'WGS-BLAME-002'],
    rules: [
      { from: 1, conceptId: 'WGS-BLAME-001' },
      { from: 45, conceptId: 'WGS-BLAME-002' },
      { from: 71, conceptId: 'WGS-BLAME-001' },
    ],
  },
  'site/examples/blame/index.md': {
    concepts: ['WGS-BLAME-001', 'WGS-BLAME-002'],
    rules: [
      { from: 1, conceptId: 'WGS-BLAME-001' },
      { from: 56, conceptId: 'WGS-BLAME-002' },
      { from: 63, conceptId: 'WGS-BLAME-001' },
    ],
  },
  'site/examples/collab/collab.ts': {
    concepts: ['WGS-COLLAB-001', 'WGS-COLLAB-002'],
    rules: [
      { from: 1, conceptId: 'WGS-COLLAB-002' },
      { from: 196, conceptId: 'WGS-COLLAB-001' },
    ],
  },
  'site/examples/collab/index.md': {
    concepts: ['WGS-COLLAB-001', 'WGS-COLLAB-002', 'WGS-COLLAB-003'],
    rules: [
      { from: 1, conceptId: 'WGS-COLLAB-001' },
      { from: 193, conceptId: 'WGS-COLLAB-002' },
      { from: 269, conceptId: 'WGS-COLLAB-001' },
      { from: 323, conceptId: 'WGS-COLLAB-003' },
    ],
  },
  'site/examples/config/index.md': {
    concepts: [
      'WGS-CONFIG-001',
      'WGS-CONFIG-002',
      'WGS-CONFIG-003',
      'WGS-CONFIG-004',
      'WGS-CONFIG-005',
      'WGS-CONFIG-006',
      'WGS-CONFIG-007',
    ],
    rules: [
      { from: 1, conceptId: 'WGS-CONFIG-003' },
      {
        from: 41,
        conceptId: 'WGS-CONFIG-001',
        sectionConcepts: ['WGS-CONFIG-001', 'WGS-CONFIG-002'],
      },
      { from: 85, conceptId: 'WGS-CONFIG-003' },
      { from: 161, conceptId: 'WGS-CONFIG-004' },
      {
        from: 214,
        conceptId: 'WGS-CONFIG-005',
        sectionConcepts: ['WGS-CONFIG-005', 'WGS-CONFIG-006', 'WGS-CONFIG-007'],
      },
      { from: 246, conceptId: 'WGS-CONFIG-006' },
      { from: 258, conceptId: 'WGS-CONFIG-007' },
    ],
  },
  'site/examples/footnote/footnote.ts': {
    concepts: ['WGS-NESTED-001', 'WGS-NESTED-002'],
    rules: [
      { from: 1, conceptId: 'WGS-NESTED-002' },
      { from: 65, conceptId: 'WGS-NESTED-001' },
      { from: 94, conceptId: 'WGS-NESTED-002' },
      { from: 136, conceptId: 'WGS-NESTED-001' },
      { from: 163, conceptId: 'WGS-NESTED-002' },
    ],
  },
  'site/examples/footnote/index.md': {
    concepts: ['WGS-NESTED-001', 'WGS-NESTED-002'],
    rules: [
      {
        from: 1,
        conceptId: 'WGS-NESTED-002',
        sectionConcepts: ['WGS-NESTED-001', 'WGS-NESTED-002'],
      },
    ],
  },
  'site/examples/index.html': { concepts: ['WGS-META-002'] },
  'site/examples/schema/dino.ts': { concepts: ['WGS-SCHEMA-002'] },
  'site/examples/schema/index.md': {
    concepts: [
      'WGS-SCHEMA-001',
      'WGS-SCHEMA-002',
      'WGS-SCHEMA-003',
      'WGS-SCHEMA-004',
    ],
    rules: [
      { from: 1, conceptId: 'WGS-SCHEMA-001' },
      { from: 94, conceptId: 'WGS-SCHEMA-002' },
      { from: 139, conceptId: 'WGS-SCHEMA-003' },
      { from: 182, conceptId: 'WGS-SCHEMA-004' },
    ],
  },
  'site/examples/schema/inline.ts': { concepts: ['WGS-SCHEMA-004'] },
  'site/examples/schema/outliner.ts': { concepts: ['WGS-SCHEMA-003'] },
  'site/examples/style/index.md': {
    concepts: [
      'WGS-STYLE-001',
      'WGS-STYLE-002',
      'WGS-STYLE-003',
      'WGS-STYLE-004',
    ],
    rules: [
      { from: 1, conceptId: 'WGS-STYLE-001' },
      {
        from: 20,
        conceptId: 'WGS-STYLE-001',
        sectionConcepts: ['WGS-STYLE-001', 'WGS-STYLE-002'],
      },
      { from: 90, conceptId: 'WGS-STYLE-003' },
      {
        from: 117,
        conceptId: 'WGS-STYLE-001',
        sectionConcepts: ['WGS-STYLE-001', 'WGS-STYLE-002'],
      },
      { from: 162, conceptId: 'WGS-STYLE-004' },
    ],
  },
  'site/examples/transaction/index.md': {
    concepts: [
      'WGS-DOC-003',
      'WGS-STATE-002',
      'WGS-TX-001',
      'WGS-TX-002',
      'WGS-TX-003',
    ],
    rules: [
      { from: 1, conceptId: 'WGS-DOC-003' },
      { from: 131, conceptId: 'WGS-STATE-002' },
      { from: 198, conceptId: 'WGS-TX-001' },
      {
        from: 251,
        conceptId: 'WGS-TX-002',
        sectionConcepts: ['WGS-TX-002', 'WGS-TX-003'],
      },
      { from: 292, conceptId: 'WGS-TX-003' },
    ],
  },
  'site/examples/translate/index.md': { concepts: ['WGS-I18N-001'] },
  'site/examples/translate/phrases.ts': { concepts: ['WGS-I18N-001'] },
  'site/index.html': {
    concepts: ['WGS-META-006', 'WGS-EDITOR-001', 'WGS-PROOF-002'],
    rules: [
      { from: 1, conceptId: 'WGS-META-006' },
      { from: 119, conceptId: 'WGS-EDITOR-001' },
    ],
  },
  'site/modules/generate': { concepts: ['WGS-META-001'] },
  'site/robots.txt': {
    exclusion: 'Crawler metadata; no editor or documentation architecture.',
  },
  'site/style/site.css': {
    exclusion:
      'Website presentation stylesheet; editor styling contracts are documented in site/examples/style/index.md.',
  },
  'site/try/index.html': { concepts: ['WGS-META-004'] },
  'site/try/sandbox.html': { concepts: ['WGS-META-004'] },
  'site/try/sandbox.js': { concepts: ['WGS-META-004'] },
  'site/try/try.ts': { concepts: ['WGS-META-004'] },
  'src/build.ts': {
    concepts: [
      'WGS-META-001',
      'WGS-META-002',
      'WGS-META-005',
      'WGS-PROOF-001',
      'WGS-PROOF-002',
    ],
    rules: [
      { from: 1, conceptId: 'WGS-META-001' },
      { from: 89, conceptId: 'WGS-META-002' },
      { from: 112, conceptId: 'WGS-META-001' },
      { from: 194, conceptId: 'WGS-META-005' },
      { from: 213, conceptId: 'WGS-META-001' },
      { from: 222, conceptId: 'WGS-PROOF-001' },
    ],
  },
  'src/codemirror.js': { concepts: ['WGS-META-004'] },
  'src/mapdir.ts': { concepts: ['WGS-META-008'] },
  'src/tsconfig.json': { concepts: ['WGS-PROOF-001'] },
  'template/foot.html': { concepts: ['WGS-META-001'] },
  'template/head.html': { concepts: ['WGS-META-001'] },
  'template/navlinks.html': { concepts: ['WGS-META-003'] },
  'template/page.html': { concepts: ['WGS-META-001'] },
  'template/ref.html': { concepts: ['WGS-META-001', 'WGS-META-003'] },
  'template/toc.html': { concepts: ['WGS-META-003'] },
  'tsconfig.json': { concepts: ['WGS-PROOF-001'] },
};

const binaryAsset = /\.(?:jpe?g|png|svg|woff2)$/i;
const trackedFiles = git('ls-files', '-z').split('\0').filter(Boolean).sort();
for (const path of trackedFiles) {
  if (binaryAsset.test(path) && !fileSpecs[path]) {
    fileSpecs[path] = {
      exclusion:
        'Binary image, font, or icon asset; excluded from architecture coverage.',
    };
  }
}

const unknownSpecs = Object.keys(fileSpecs).filter(
  (path) => !trackedFiles.includes(path)
);
const unexplainedFiles = trackedFiles.filter((path) => !fileSpecs[path]);
if (unknownSpecs.length || unexplainedFiles.length) {
  throw new Error(
    `Site file specification drift: ${JSON.stringify({ unknownSpecs, unexplainedFiles })}`
  );
}

const conceptIds = new Set(concepts.map(({ id }) => id));
const duplicateConceptIds = concepts.length - conceptIds.size;
const unknownConceptReferences = [
  ...new Set(
    Object.values(fileSpecs).flatMap((spec) => [
      ...(spec.concepts ?? []),
      ...(spec.rules ?? []).flatMap((rule) => [
        rule.conceptId,
        ...(rule.sectionConcepts ?? []),
      ]),
    ])
  ),
].filter((id) => id && !conceptIds.has(id));
if (duplicateConceptIds || unknownConceptReferences.length) {
  throw new Error(
    `Site concept specification invalid: ${JSON.stringify({ duplicateConceptIds, unknownConceptReferences })}`
  );
}

const pickRule = (rules, line) => {
  let selected = rules?.[0];
  for (const rule of rules ?? []) {
    if (rule.from > line) break;
    selected = rule;
  }
  return selected;
};

const declarationName = (node, sourceFile) => {
  if (node.name) return node.name.getText(sourceFile);
  if (ts.isConstructorDeclaration(node)) return 'constructor';
  if (ts.isCallSignatureDeclaration(node)) return 'call-signature';
  if (ts.isConstructSignatureDeclaration(node)) return 'construct-signature';
  if (ts.isIndexSignatureDeclaration(node)) return 'index-signature';
  if (ts.isExportAssignment(node)) return 'export-assignment';
  if (ts.isExportDeclaration(node)) {
    return node.exportClause?.getText(sourceFile) ?? 'export-all';
  }
  return '(anonymous)';
};

const parseDeclarations = (path, text, spec) => {
  if (!SOURCE_FILE_RE.test(path)) return { declarations: [], diagnostics: [] };
  const sourceFile = ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true
  );
  const declarations = [];
  const visit = (node, depth = 0) => {
    if (
      node !== sourceFile &&
      (ts.isDeclaration(node) ||
        ts.isExportAssignment(node) ||
        ts.isExportDeclaration(node))
    ) {
      const start = node.getStart(sourceFile);
      const end = node.getEnd();
      const startLoc = sourceFile.getLineAndCharacterOfPosition(start);
      const endLoc = sourceFile.getLineAndCharacterOfPosition(end);
      const line = startLoc.line + 1;
      const rule = pickRule(spec.rules, line);
      const conceptId = rule?.conceptId ?? spec.concepts?.[0];
      if (!conceptId) {
        throw new Error(`No declaration owner for ${path}:${line}`);
      }
      declarations.push({
        column: startLoc.character + 1,
        conceptId,
        depth,
        endLine: endLoc.line + 1,
        exported:
          node.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
          ) ?? false,
        id: `${path}:${line}:${startLoc.character + 1}:${ts.SyntaxKind[node.kind]}:${declarations.length}`,
        kind: ts.SyntaxKind[node.kind],
        line,
        name: declarationName(node, sourceFile),
        parentKind: ts.SyntaxKind[node.parent.kind],
      });
    }
    ts.forEachChild(node, (child) => visit(child, depth + 1));
  };
  visit(sourceFile);
  return {
    declarations,
    diagnostics: sourceFile.parseDiagnostics.map((diagnostic) => ({
      code: diagnostic.code,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      start: diagnostic.start ?? null,
    })),
  };
};

const parseSections = (path, text, spec) => {
  const lines = text.split(LINE_BREAK_RE);
  const starts = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const markdown = MARKDOWN_HEADING_RE.exec(line);
    const html = HTML_HEADING_RE.exec(line);
    const marker = SNIPPET_MARKER_RE.exec(line);
    if (markdown) {
      starts.push({
        level: markdown[1].length,
        line: index + 1,
        title: markdown[2],
        type: 'heading',
      });
    } else if (html) {
      starts.push({
        level: Number(html[1]),
        line: index + 1,
        title: html[2].replace(STRIP_HTML_RE, '').trim(),
        type: 'heading',
      });
    } else if (marker) {
      starts.push({
        level: 1,
        line: index + 1,
        title: marker[1],
        type: 'snippet',
      });
    }
  }
  return starts.map((start, index) => {
    const endLine = (starts[index + 1]?.line ?? lines.length + 1) - 1;
    const rule = pickRule(spec.rules, start.line);
    const conceptIdsForSection = rule?.sectionConcepts ?? [
      rule?.conceptId ?? spec.concepts?.[0],
    ];
    const status = rule?.sectionStatus ?? 'mapped';
    return {
      ...start,
      conceptIds: status === 'mapped' ? conceptIdsForSection : [],
      endLine,
      exclusionReason: status === 'excluded' ? rule.sectionReason : undefined,
      id: `${path}:${start.line}:${start.type}`,
      status,
    };
  });
};

const files = trackedFiles.map((path) => {
  const absolutePath = resolve(websiteRoot, path);
  const content = readFileSync(absolutePath);
  const spec = fileSpecs[path];
  const base = {
    bytes: content.byteLength,
    path,
    sha256: sha256(content),
  };
  if (spec.exclusion) {
    return {
      ...base,
      conceptIds: [],
      exclusionReason: spec.exclusion,
      status: 'excluded',
    };
  }
  const text = content.toString('utf8');
  const { declarations, diagnostics } = parseDeclarations(path, text, spec);
  const sections = parseSections(path, text, spec);
  return {
    ...base,
    conceptIds: [...new Set(spec.concepts)].sort(),
    declarationCount: declarations.length,
    declarations,
    lines: text.split(LINE_BREAK_RE).length,
    parseDiagnostics: diagnostics,
    sectionCount: sections.length,
    sections,
    status: 'mapped',
  };
});

const evidencePattern = /^(.*):(\d+)-(\d+)$/;
const invalidEvidence = [];
for (const owner of [...concepts, ...findings]) {
  for (const evidence of owner.evidence) {
    const match = evidencePattern.exec(evidence);
    if (!match) {
      invalidEvidence.push({ ownerId: owner.id, evidence, reason: 'format' });
      continue;
    }
    const [, path, fromText, toText] = match;
    const file = files.find((entry) => entry.path === path);
    const from = Number(fromText);
    const to = Number(toText);
    if (!file || file.status !== 'mapped') {
      invalidEvidence.push({
        ownerId: owner.id,
        evidence,
        reason: 'missing-or-excluded-file',
      });
    } else if (from < 1 || to < from || to > file.lines) {
      invalidEvidence.push({
        ownerId: owner.id,
        evidence,
        reason: `invalid-range-max-${file.lines}`,
      });
    }
  }
}

const usedConceptIds = new Set(
  files.flatMap((file) => [
    ...(file.conceptIds ?? []),
    ...(file.declarations ?? []).map(({ conceptId }) => conceptId),
    ...(file.sections ?? []).flatMap(({ conceptIds }) => conceptIds),
  ])
);
const unusedConcepts = concepts
  .map(({ id }) => id)
  .filter((id) => !usedConceptIds.has(id));
const declarationIds = files.flatMap((file) =>
  (file.declarations ?? []).map(({ id }) => id)
);
const duplicateDeclarationIds = declarationIds.filter(
  (id, index) => declarationIds.indexOf(id) !== index
);
const mappedSections = files
  .flatMap((file) => file.sections ?? [])
  .filter(({ status }) => status === 'mapped');
const excludedSections = files
  .flatMap((file) => file.sections ?? [])
  .filter(({ status }) => status === 'excluded');
const missingConceptLedger = concepts
  .filter(({ representation }) => representation.status !== 'represented')
  .map(({ evidence, id, representation, title }) => ({
    evidence,
    siteConceptId: id,
    title,
    ...representation,
  }));

const dirty = git('status', '--porcelain=v1');
if (dirty) throw new Error(`Wordgard website checkout is dirty:\n${dirty}`);
const head = git('rev-parse', 'HEAD');
const manifest = {
  schemaVersion: 1,
  kind: 'wordgard-official-website-source-coverage',
  generatedAt: new Date().toISOString(),
  authority: {
    branch: git('branch', '--show-current'),
    clean: true,
    head,
    origin: git('remote', 'get-url', 'origin'),
    repository: websiteRoot,
    upstream: git(
      'rev-parse',
      '--abbrev-ref',
      '--symbolic-full-name',
      '@{upstream}'
    ),
  },
  scope: {
    included:
      'All tracked narrative docs, executable examples, website build/reference/playground source, templates, and build configuration.',
    excluded:
      'Binary images/fonts/icons, crawler metadata, repository ignore metadata, and the website presentation stylesheet. Generated output is untracked and absent.',
  },
  concepts,
  findings,
  missingConceptLedger,
  files,
  summary: {
    concepts: concepts.length,
    declarations: files.reduce(
      (count, file) => count + (file.declarationCount ?? 0),
      0
    ),
    excludedFiles: files.filter(({ status }) => status === 'excluded').length,
    excludedSections: excludedSections.length,
    files: files.length,
    findings: findings.length,
    mappedFiles: files.filter(({ status }) => status === 'mapped').length,
    mappedSections: mappedSections.length,
    missingAtomicConcepts: missingConceptLedger.length,
    parseDiagnostics: files.reduce(
      (count, file) => count + (file.parseDiagnostics?.length ?? 0),
      0
    ),
    sections: mappedSections.length + excludedSections.length,
    trackedFiles: trackedFiles.length,
    unexplainedDeclarations: 0,
    unexplainedFiles: unexplainedFiles.length,
    unusedConcepts: unusedConcepts.length,
  },
  validation: {
    duplicateConceptIds,
    duplicateFindingIds:
      findings.length - new Set(findings.map(({ id }) => id)).size,
    duplicateDeclarationIds: duplicateDeclarationIds.length,
    invalidEvidence: invalidEvidence.length,
    parseDiagnostics: files.reduce(
      (count, file) => count + (file.parseDiagnostics?.length ?? 0),
      0
    ),
    unknownConceptReferences: unknownConceptReferences.length,
    unknownSpecs: unknownSpecs.length,
    unexplainedFiles: unexplainedFiles.length,
    unusedConcepts: unusedConcepts.length,
  },
};

const failures = Object.entries(manifest.validation).filter(
  ([, value]) => value !== 0
);
if (failures.length) {
  throw new Error(
    `Wordgard website coverage validation failed: ${JSON.stringify({ failures, invalidEvidence, unusedConcepts })}`
  );
}

writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(
  `${relative(repoRoot, outputPath)} ${JSON.stringify(manifest.summary)}\n`
);

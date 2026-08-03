#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { matrixTruth } from './matrix-truth.mjs';

const forumOrigin = 'https://discuss.wordgard.net';
const artifactRoot = dirname(fileURLToPath(import.meta.url));
const inventoryPath = resolve(artifactRoot, 'wordgard-forum-inventory.json');
const coverageJsonPath = resolve(artifactRoot, 'wordgard-forum-coverage.json');
const coverageMarkdownPath = resolve(
  artifactRoot,
  'wordgard-forum-coverage.md'
);
const CATEGORY_TOPIC_ID_RE = /\/(\d+)(?:\?.*)?$/;
const WHITESPACE_RE = /\s+/;

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

// These hashes bind the human claim review below to the exact cooked post
// bodies retrieved on 2026-08-01. A changed or newly visible post forces a
// deliberate re-review instead of silently inheriting an old classification.
const reviewedPostHashes = {
  1: 'e27c964a4e60c4cc962d041a5182103f0834304c5f273927d7b7f37cea3cb558',
  3: 'c405e31cad47384106336cd781c577f1692b2d28faeb21d93b3593cdd7147d48',
  6: '1764e4d3062a223bbde9a947d7900cace60050abab1ca19f2f11ee7ff6f962af',
  9: '8f10d829ff907cffcca1709249acfdc5e304e4bd2f2c8f13e63b54eb93aee2f4',
  10: '31e24e788f48df7b1f0e470fc8238fc1957a500ed3e4646ecf227817a1ce3473',
  11: 'd4f03675f233918c2823b2db4b44c96bad5cb5ff3269773d2914f3efcb99bcd4',
  13: '7e625ec20ac9d756aa2c07dcc59c8f4f8fe15349b1cdca60645e53212b444de4',
  20: 'e438dc53fb1a648ff799d757a9417720af7116beba9ec21ef18418814290f0ed',
  21: 'b826dbd511f5a66b5f46e5a88d6f4f202912dcf29965d678dc8010d284cc0c56',
  22: 'f9c074cce93585c7643ba51792e84b7afc7921f6b905a369da5ab226e5939859',
  23: '2778892dcc4ba2389494fc6dacd6040a8388615987bbd40c614cc2644a2998f5',
  24: 'ce2e579da1737172c8cc65f2a627bc28d8d72ed137b3806930ce359610488fde',
  25: '75a71e4a2a2db4615de21dee6dc8821b4698ed69969c986c89e7160824a39530',
  26: 'e90b64e13d44f211320c9b5ef5d26aa98e8f62cab363ee112d130ec3108e98d1',
  27: '466f538859bb5a499a5fc485adeb84fac3c8fc796eefc2e78bb1a836d2125ee0',
  28: '54d30dbc4eafc8e00071e534be3629cc6269316d9a4afeb9b58119d3399621c6',
  29: '27c9aab2df54bed7442ab781688f66902c130abe92ff99d768d1bd5c804926e7',
  30: '5b277fee524fac27cb3179888a5fd0b6f1e5274b718a45ab22dfa03a67557ecf',
  31: '97e02e0edd33cc573327703be7ae7b742726a08a01c0e54a8621f2e72ca9c586',
  32: 'a1132c233f3cdf30fe72e271b3f5c3d3b9ce6083745c125897cec6128307a807',
  34: 'ec581aaefe532f61c26596c77f3d555e539746d1b5fc42be7efe0f483f71d51b',
  35: '667d0ca18658b950a5eb7dc396605cf0781af1bc9739f20703fb2b3c5dd637f2',
  38: '46993741fd7ed777dcec5f4dd072cc079883e6ded93e353fa0123ba034e0ecfa',
  39: '57b4063bb2e553a0a2b014c4bcdbb63e1ec09ec9c58b53d7e64e959ecce164ba',
  40: '0062677d2afe7533b2c51a3d5e2e49df041e2442c38c805d10bc7ca10745dd92',
  41: '86c20f7cd8d790e329fec3a9f5a91b64d5ffa661420a6c7448e116d14e9e7287',
  48: 'd84a45ace8f5b991ff15247c13bd0044f54072f42d5e806828b93cbfade97af6',
  50: 'ffd1a0f92538426557051b173b172cf3c3f279ee770eeb2691dc470b8b8ea345',
  51: '16df6e1b191357996ee8d892965234dcf5592725c478a22d6ab0e3ed271f9e75',
  52: 'f3b04c9c6270572db0a6bd9575a838ddd8462757e4621f485ab0f63f5ea6fc22',
  54: '6df447e8846672471f416c7f885576f0be134287109746a8f43feaf259c07df6',
  55: '01625f5be87037e89cd7a3bd48d529636eef5fc40ec74372bc587aeebfcca4b5',
  56: 'fef09314a10072ac49951de77d9c5e3d45359bb8ac1099e4cd834aa650eeabb5',
  58: 'e741add83a5aa4cde5c8dfe6ec1d076806704bb345bd38f99a570c3cf97154d3',
  59: 'b26781c74c8ea34185abda554fa71640846cd7ec59baf7f1762c69b78e75755e',
  60: '745e9e92bead6f93fdcf7565c878636fc828fed3001360752ca2c76a42878c6e',
  61: '596cdeed64f880c35513765eacbfb20cc82ea898cb28001a2b8f1efb43441710',
  62: 'b04f564796ddde27d1ba12e41e1492223fd97f3a8325bbad6b03eb6251f550da',
  63: 'afcbfd21551a5fd02df5bcf83440360c3ad10ed6d14f82f7ab8766ed38cf5071',
  65: 'ab5332acc9cb43b3176a369e2bc3791be4a5394ca9e785a2d8ca449a3039fd5a',
  66: '010518cb147b4576fde46f6294e25090714580b33cb6f5b71173587da15e4961',
  67: 'eea9d47e05358b8c439fce8460650807ab3dc4d8dec1b58a807b1577436fbc48',
  68: 'e5cf794c75f4b9c88b45a9f07c4f32404bd942f8dd43283270e2c9e8734075e9',
  69: '55a3ad9a1ff1c50abf9abd17cca48a887cea6c8a65d7a94b99f20bf3b40a44ca',
  70: '92bdc50c1c619ebf773a2826a58dcb265c96d218ec6fda0dc05fa0f21269dd42',
  71: '73617a346fdb239cfd5fb7e6f0326825a6e5df3de6b785391e9c25803db432e2',
  72: '5aab860ca6cf91b7bf2543fa5281c472028bc2cc829dc9502d26f1731a74539b',
  73: '9b359b1c5a0828dcd9848ef67589cd79d6a3f6a545f9f9bd17c014f93b92ff04',
};

const excludedPosts = {
  1: {
    scope: 'category-description',
    reason: 'Discourse category boilerplate; no editor requirement.',
  },
  3: {
    scope: 'category-description',
    reason: 'Discourse category boilerplate; no editor requirement.',
  },
  6: {
    scope: 'project-process',
    reason:
      'Forum conduct and issue-routing policy, not an editor architecture claim.',
  },
  11: {
    scope: 'context-only',
    reason:
      'Clarifies a CodeMirror package link; no Wordgard capability claim.',
  },
  13: {
    scope: 'context-only',
    reason: 'Corrects the CodeMirror/Wordgard mix-up; no architecture claim.',
  },
  22: {
    scope: 'social',
    reason: 'Agreement about AI companies and pull requests; no editor claim.',
  },
  25: {
    scope: 'social',
    reason: 'Website praise; no editor requirement.',
  },
  26: {
    scope: 'documentation-request',
    reason:
      'Requests a competitor table but does not assert an editor capability.',
  },
  38: {
    scope: 'question-only',
    reason: 'Asks about AI and motivation without asserting architecture.',
  },
  39: {
    scope: 'tooling-policy',
    reason:
      'Maintainer opinion on AI-assisted development, not editor architecture.',
  },
  40: {
    scope: 'question-only',
    reason: 'Asks about motivation without adding an atomic claim.',
  },
  48: {
    scope: 'documentation-translation',
    reason:
      'Community opinion on translated docs; peripheral to editor design.',
  },
  52: {
    scope: 'documentation-translation',
    reason:
      'Describes a translated-site workflow; no editor architecture claim.',
  },
  54: {
    scope: 'documentation-translation',
    reason:
      'Maintainer accepts maintained translated docs; no editor architecture claim.',
  },
  58: {
    scope: 'documentation-translation',
    reason: 'Encourages translation; no editor architecture claim.',
  },
  73: {
    scope: 'social',
    reason: 'Acknowledges the vertical-writing answer; no new requirement.',
  },
};

const proposedMatrixRows = [
  {
    classification: 'insufficient evidence',
    dimensionWinners: {
      api: 'insufficient evidence',
      correctness: 'insufficient evidence',
      data: 'insufficient evidence',
      ownership: 'insufficient evidence',
      proof: 'insufficient evidence',
      runtime: 'insufficient evidence',
    },
    forumLocators: [
      `${forumOrigin}/t/any-plans-for-vertical-writing-mode-support/27/1`,
      `${forumOrigin}/t/any-plans-for-vertical-writing-mode-support/27/2`,
      `${forumOrigin}/t/any-plans-for-vertical-writing-mode-support/27/3`,
      `${forumOrigin}/t/any-plans-for-vertical-writing-mode-support/27/4`,
    ],
    id: 'LOCAL-VERTICAL-WRITING-LAYOUT',
    localDebt: 'insufficient evidence',
    mechanism:
      'Project vertical-rl/vertical-lr lines, ruby, tate-chu-yoko, and mixed-orientation runs into visual geometry and navigation.',
    preferred: 'insufficient evidence',
    priority: '—',
    proofAdaptation: 'defer',
    referenceAdaptation: 'defer',
    sourceLocators: {
      plate: ['docs/plite/selection-navigation-coverage.md:198-201'],
      plite: [
        'packages/plite-dom/src/plugin/dom-geometry.ts:65-105',
        'packages/plite-dom/src/plugin/dom-geometry.ts:1041-1085',
        'packages/plite-dom/src/plugin/dom-geometry.ts:1185-1217',
        'docs/plite/selection-navigation-coverage.md:198-201',
      ],
      wordgard: [
        '../wordgard/src/state/textblock.ts:29-48',
        '../wordgard/src/state/textblock.ts:141-175',
      ],
    },
    status: { plate: 'absent', plite: 'absent', wordgard: 'absent' },
    title:
      'CSS vertical-rl/lr layout, ruby, mixed orientation, geometry, and navigation',
    verdict: 'defer',
    whyNew:
      'CSS vertical layout, ruby, tate-chu-yoko, and horizontal runs inside vertical lines are not the same concept as bidi text direction or ordinary geometry mapping.',
  },
  {
    classification: 'insufficient evidence',
    dimensionWinners: {
      api: 'insufficient evidence',
      correctness: 'insufficient evidence',
      data: 'insufficient evidence',
      ownership: 'insufficient evidence',
      proof: 'insufficient evidence',
      runtime: 'insufficient evidence',
    },
    forumLocators: [
      `${forumOrigin}/t/any-plans-for-vertical-writing-mode-support/27/1`,
      `${forumOrigin}/t/any-plans-for-vertical-writing-mode-support/27/2`,
      `${forumOrigin}/t/any-plans-for-vertical-writing-mode-support/27/3`,
      `${forumOrigin}/t/any-plans-for-vertical-writing-mode-support/27/4`,
    ],
    id: 'LOCAL-VERTICAL-WRITING-INPUT',
    localDebt: 'insufficient evidence',
    mechanism:
      'Route vertical-writing caret motion, selection, keyboard intent, composition, and IME reconciliation independently from horizontal bidi input.',
    preferred: 'insufficient evidence',
    priority: '—',
    proofAdaptation: 'defer',
    referenceAdaptation: 'defer',
    sourceLocators: {
      plate: ['docs/plite/selection-navigation-coverage.md:198-201'],
      plite: [
        'packages/plite-react/src/editable/keyboard-input-strategy.ts:90-158',
        'packages/plite-react/src/editable/keyboard-input-strategy.ts:625-648',
        'packages/plite-react/src/editable/keyboard-input-strategy.ts:882-896',
        'docs/plite/selection-navigation-coverage.md:198-201',
      ],
      wordgard: [
        '../wordgard/src/state/textblock.ts:29-48',
        '../wordgard/src/state/textblock.ts:141-175',
      ],
    },
    status: { plate: 'absent', plite: 'absent', wordgard: 'absent' },
    title:
      'Vertical-mode caret, selection, key routing, composition, and IME reconciliation',
    verdict: 'defer',
    whyNew:
      'Caret motion and composition in vertical writing have independent browser failure modes and proof obligations from layout projection.',
  },
  {
    classification: 'Plate stronger',
    dimensionWinners: {
      api: 'Plate stronger',
      correctness: 'Plate stronger',
      data: 'Plate stronger',
      ownership: 'Plate stronger',
      proof: 'Plate stronger',
      runtime: 'insufficient evidence',
    },
    forumLocators: [
      `${forumOrigin}/t/offline-collaborative-editing/31/1`,
      `${forumOrigin}/t/offline-collaborative-editing/31/2`,
      `${forumOrigin}/t/offline-collaborative-editing/31/3`,
    ],
    id: 'LOCAL-OFFLINE-MERGE-REVIEW',
    localDebt: 'insufficient evidence',
    mechanism:
      'Expose offline divergence as attributed changes that a user can review, accept, reject, and adjust after convergence.',
    preferred: 'Plate',
    priority: '—',
    proofAdaptation: 'defer',
    referenceAdaptation: 'not-applicable',
    sourceLocators: {
      plate: [
        'packages/yjs/test/canonical-change-contract.spec.ts:97-290',
        'packages/suggestion/src/lib/BaseSuggestionPlugin.ts:1204-1303',
        'packages/suggestion/src/lib/BaseSuggestionPlugin.ts:1392-1425',
        'packages/suggestion/src/lib/BaseSuggestionPlugin.spec.tsx:1882-1915',
        'packages/suggestion/src/lib/BaseSuggestionPlugin.spec.tsx:2572-2617',
      ],
      plite: [
        'packages/yjs/test/canonical-change-contract.spec.ts:97-290',
        'packages/yjs/test/insert-fragment-contract.spec.ts:76-102',
      ],
      wordgard: [
        '../wordgard/src/collab/collab.ts:23-37',
        '../wordgard/src/collab/collab.ts:64-82',
        '../wordgard/src/collab/collab.ts:122-230',
      ],
    },
    status: { plate: 'partial', plite: 'partial', wordgard: 'absent' },
    title:
      'User-visible offline change attribution, review, and adjustment atop convergence',
    verdict: 'defer',
    whyNew:
      'Offline reconciliation is a user-visible review workflow, not merely the existing real-time OT or Yjs transport loop.',
  },
  {
    classification: 'Plite/Plate stack stronger',
    dimensionWinners: {
      api: 'Plite/Plate stack stronger',
      correctness: 'insufficient evidence',
      data: 'Plite/Plate stack stronger',
      ownership: 'Plite/Plate stack stronger',
      proof: 'Plite/Plate stack stronger',
      runtime: 'insufficient evidence',
    },
    forumLocators: [
      `${forumOrigin}/t/any-plan-to-render-angular-components-inside-the-editor/8/1`,
      `${forumOrigin}/t/any-plan-to-render-angular-components-inside-the-editor/8/2`,
      `${forumOrigin}/t/porting-to-other-languages-environments/18/1`,
      `${forumOrigin}/t/porting-to-other-languages-environments/18/2`,
      `${forumOrigin}/t/virtualization-windowing-occlusion-culling-support/29/2`,
      `${forumOrigin}/t/any-plans-for-vertical-writing-mode-support/27/4`,
    ],
    id: 'LOCAL-HOST-EDITOR-CAPABILITY',
    localDebt: 'none',
    mechanism:
      'Define a typed headless editor capability that DOM, React, virtualized, native, and canvas hosts can consume without depending on a specific view class.',
    preferred: 'Plite/Plate stack',
    priority: '—',
    proofAdaptation: 'keep-local',
    referenceAdaptation: 'keep-local',
    sourceLocators: {
      plate: [
        'packages/core/src/react/editor/PlateEditor.ts:24-70',
        'packages/core/src/react/editor/TPlateEditorCore.spec.ts:55-90',
      ],
      plite: [
        'packages/plite/src/interfaces/editor.ts:120-180',
        'packages/plite/src/interfaces/editor.ts:1285-1311',
        'packages/plite-dom/src/index.ts:23-55',
        'packages/plite-react/src/index.ts:35-85',
      ],
      wordgard: [
        '../wordgard/src/editor/editor.ts:26-79',
        '../wordgard/src/command/command.ts:19-55',
        '../wordgard/src/state/state.ts:41-79',
      ],
    },
    status: { plate: 'partial', plite: 'partial', wordgard: 'partial' },
    title:
      'Typed headless editor capability across DOM, React, virtualized, native, and canvas hosts',
    verdict: 'keep',
    whyNew:
      'A command-capable editor interface shared by DOM, native, canvas, React, and virtualized views is more specific than package entrypoints or one imperative DOM view lifecycle.',
  },
  {
    classification: 'Plate stronger',
    dimensionWinners: {
      api: 'Plate stronger',
      correctness: 'Plate stronger',
      data: 'Plate stronger',
      ownership: 'Plate stronger',
      proof: 'Plate stronger',
      runtime: 'insufficient evidence',
    },
    forumLocators: [
      `${forumOrigin}/t/wordgard-markdown/16/1`,
      `${forumOrigin}/t/wordgard-markdown/16/2`,
    ],
    id: 'LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY',
    localDebt: 'none',
    mechanism:
      'Own Markdown parsing and serialization in a separate package that integrates with the editor through host codecs.',
    preferred: 'Plate',
    priority: '—',
    proofAdaptation: 'keep-local',
    referenceAdaptation: 'not-applicable',
    sourceLocators: {
      plate: [
        'packages/markdown/package.json:2-29',
        'packages/markdown/src/lib/MarkdownPlugin.ts:47-122',
        'packages/markdown/src/lib/MarkdownPlugin.spec.ts:152-185',
        'packages/markdown/src/lib/MarkdownPlugin.spec.ts:304-434',
      ],
      plite: [
        'packages/plite-dom/test/host-codec.test.ts:163-239',
        'packages/plite-dom/test/host-codec.test.ts:356-411',
      ],
      wordgard: [],
    },
    status: { plate: 'exact', plite: 'partial', wordgard: 'absent' },
    title:
      'Separately owned Markdown parse/serialize module integrated through host codecs',
    verdict: 'keep',
    whyNew:
      'Markdown parsing and serialization ownership is absent from the current matrix and is independent from the DOM/HTML codec.',
  },
  {
    classification: 'Plite/Plate stack stronger',
    dimensionWinners: {
      api: 'Plite/Plate stack stronger',
      correctness: 'insufficient evidence',
      data: 'Plite/Plate stack stronger',
      ownership: 'Plite/Plate stack stronger',
      proof: 'Plite/Plate stack stronger',
      runtime: 'insufficient evidence',
    },
    forumLocators: [
      `${forumOrigin}/t/strongly-referencing-document-positions/19/1`,
      `${forumOrigin}/t/strongly-referencing-document-positions/19/2`,
      `${forumOrigin}/t/strongly-referencing-document-positions/19/3`,
      `${forumOrigin}/t/offline-collaborative-editing/31/3`,
    ],
    id: 'LOCAL-EXTERNAL-MODEL-SYNC',
    localDebt: 'none',
    mechanism:
      'Observe committed editor transactions and snapshots for outbound synchronization and apply inbound external-model transactions through the editor update boundary.',
    preferred: 'Plite/Plate stack',
    priority: '—',
    proofAdaptation: 'keep-local',
    referenceAdaptation: 'keep-local',
    sourceLocators: {
      plate: [
        'packages/core/src/react/components/Plate.tsx:34-53',
        'packages/core/src/react/components/Plate.tsx:111-175',
        'packages/core/src/react/components/PlateContent.spec.tsx:209-280',
        'packages/core/src/react/components/PlateContent.spec.tsx:282-373',
      ],
      plite: [
        'packages/plite/src/interfaces/editor.ts:1285-1311',
        'packages/plite/src/interfaces/editor.ts:3491-3508',
        'packages/plite/src/core/listener-state.ts:105-118',
        'packages/plite/test/transaction-extension-contract.ts:19-79',
      ],
      wordgard: [
        '../wordgard/src/editor/editor.ts:170-190',
        '../wordgard/src/editor/editor.ts:240-243',
        '../wordgard/src/editor/editor.ts:635-658',
        '../wordgard/src/editor/editor.ts:1015-1039',
      ],
    },
    status: { plate: 'partial', plite: 'partial', wordgard: 'partial' },
    title:
      'Bidirectional external-model synchronization over committed editor transactions',
    verdict: 'keep',
    whyNew:
      'Observing editor transactions and applying external database changes is a distinct integration contract from state fields, commit impact queries, or collaboration transport.',
  },
];

const claim = (
  id,
  postId,
  kind,
  statement,
  existingRowIds,
  proposedRowIds = []
) => ({
  existingRowIds,
  id,
  implementationProof: false,
  kind,
  postId,
  proposedRowIds,
  statement,
});

// Forum statements are mapped as intent, requirements, reports, or status
// claims. Even a maintainer statement never upgrades a source/runtime proof.
const claims = [
  claim(
    'WGF-001',
    50,
    'community-requirement',
    'A production editor for Japanese and other CJK content needs vertical writing, including editor-owned caret behavior where contenteditable is unreliable.',
    ['WG-STATE-013', 'WG-STATE-011B', 'WG-VIEW-006B', 'WG-VIEW-010A'],
    ['LOCAL-VERTICAL-WRITING-LAYOUT', 'LOCAL-VERTICAL-WRITING-INPUT']
  ),
  claim(
    'WGF-002',
    51,
    'maintainer-intent',
    'Vertical writing had not received serious design work because the maintainer did not know there was concrete demand.',
    ['WG-STATE-013', 'WG-VIEW-006B'],
    ['LOCAL-VERTICAL-WRITING-LAYOUT', 'LOCAL-VERTICAL-WRITING-INPUT']
  ),
  claim(
    'WGF-003',
    60,
    'community-requirement',
    'Modern Japanese vertical writing requires mixed-orientation text, ruby, tate-chu-yoko, reliable IME, and browser-independent caret behavior.',
    ['WG-STATE-013', 'WG-STATE-011B', 'WG-VIEW-006B', 'WG-VIEW-010A'],
    ['LOCAL-VERTICAL-WRITING-LAYOUT', 'LOCAL-VERTICAL-WRITING-INPUT']
  ),
  claim(
    'WGF-004',
    61,
    'maintainer-non-goal',
    'Vertical writing is outside the maintained core; a custom editor component or fork may reuse Wordgard data structures.',
    ['WG-VIEW-001A', 'WG-STATE-013', 'WG-VIEW-006B'],
    [
      'LOCAL-VERTICAL-WRITING-LAYOUT',
      'LOCAL-VERTICAL-WRITING-INPUT',
      'LOCAL-HOST-EDITOR-CAPABILITY',
    ]
  ),
  claim(
    'WGF-005',
    62,
    'community-requirement',
    "Offline collaborative editing needs durable reconciliation beyond Wordgard's real-time central-authority transform loop.",
    ['WG-COLLAB-001', 'WG-COLLAB-002A', 'LOCAL-YJS', 'LOCAL-ANCHORS'],
    ['LOCAL-OFFLINE-MERGE-REVIEW']
  ),
  claim(
    'WGF-006',
    66,
    'maintainer-design-position',
    'Offline automatic merging is primarily a change-review and adjustment UI problem, not just a merge-algorithm problem.',
    ['WG-APPLICATION-BLAME-001', 'WG-APPLICATION-BLAME-002'],
    ['LOCAL-OFFLINE-MERGE-REVIEW']
  ),
  claim(
    'WGF-007',
    66,
    'maintainer-design-position',
    'Fractional indices do not provide stable document addressing by themselves; durable addressing requires element IDs and tombstones, which often cost more than they return.',
    ['LOCAL-ANCHORS', 'LOCAL-YJS', 'WG-DOC-007', 'WG-DOC-011'],
    []
  ),
  claim(
    'WGF-008',
    72,
    'community-proposal',
    'Candidate offline designs include a causal transaction oplog with snapshots or SQL tables using ordered IDs and fractional insertion positions.',
    ['WG-COLLAB-001', 'WG-COLLAB-002A', 'LOCAL-YJS'],
    ['LOCAL-OFFLINE-MERGE-REVIEW', 'LOCAL-EXTERNAL-MODEL-SYNC']
  ),
  claim(
    'WGF-009',
    59,
    'maintainer-status',
    'Building the footnote example exposed and triggered fixes for block nodes that behave as atoms.',
    ['WG-DOC-002D', 'WG-INTEGRATION-NESTED-001', 'WG-PROOF-005A2'],
    []
  ),
  claim(
    'WGF-010',
    59,
    'maintainer-status',
    'A collaborative-editing example and accompanying explanation were published.',
    ['WG-COLLAB-001', 'WG-COLLAB-002A', 'WG-PROOF-005A2'],
    []
  ),
  claim(
    'WGF-011',
    65,
    'community-bug-report',
    'Switching between footnotes in Firefox could display stale nested content unless selection state changed.',
    ['WG-INTEGRATION-NESTED-001', 'WG-VIEW-007B2', 'WG-PROOF-005A2'],
    []
  ),
  claim(
    'WGF-012',
    67,
    'maintainer-status',
    'The maintainer reported pushing a patch for the stale-footnote-content report.',
    ['WG-PROOF-005A2'],
    []
  ),
  claim(
    'WGF-013',
    68,
    'community-bug-report',
    'The first footnote patch introduced a runtime crash because contentEq was unavailable.',
    ['WG-DOC-005B', 'WG-VIEW-016A', 'WG-PROOF-005A2'],
    []
  ),
  claim(
    'WGF-014',
    69,
    'maintainer-cause-claim',
    "The crash came from example code using an unpublished method absent from the website's installed library version.",
    ['WG-PROOF-005A1A', 'WG-PROOF-005A2', 'WG-PROOF-005B1'],
    []
  ),
  claim(
    'WGF-015',
    70,
    'community-status-report',
    'A user reported that the corrected footnote example worked.',
    ['WG-PROOF-005A2'],
    []
  ),
  claim(
    'WGF-016',
    71,
    'maintainer-intent',
    'Porting realistic ProseMirror examples is intentionally used to discover missing Wordgard behavior, with more examples planned.',
    ['WG-META-004B', 'WG-PROOF-005A2'],
    []
  ),
  claim(
    'WGF-017',
    24,
    'community-requirement',
    'An external SQL model may need bidirectional conversion between editor transactions and database transactions.',
    [
      'WG-STATE-006A',
      'LOCAL-COMMIT-IMPACT-METADATA',
      'LOCAL-COMMIT-IMPACT-SUBSCRIPTIONS',
    ],
    ['LOCAL-EXTERNAL-MODEL-SYNC']
  ),
  claim(
    'WGF-018',
    24,
    'community-requirement',
    'Stable per-word identity and large-document performance create tension between node-per-word DOM rendering and compact text projection.',
    ['LOCAL-ANCHORS', 'WG-VIEW-004A3', 'WG-VIEW-004A1'],
    []
  ),
  claim(
    'WGF-019',
    30,
    'maintainer-capability-claim',
    'An update listener can observe editor activity for outbound synchronization, while external changes can be pushed into the editor.',
    [
      'WG-STATE-006A',
      'LOCAL-COMMIT-IMPACT-METADATA',
      'LOCAL-COMMIT-IMPACT-SUBSCRIPTIONS',
    ],
    ['LOCAL-EXTERNAL-MODEL-SYNC']
  ),
  claim(
    'WGF-020',
    30,
    'maintainer-design-option',
    'Mapped range metadata can keep information about document spans outside the document, while schema nodes may be simpler when identity is structural.',
    ['WG-VIEW-005B2', 'WG-DOC-011', 'LOCAL-ANCHORS'],
    []
  ),
  claim(
    'WGF-021',
    63,
    'community-requirement',
    'Database transaction mapping and virtualization remain linked requirements for large documents with stable external identities.',
    ['WG-VIEW-004A3', 'LOCAL-ANCHORS'],
    ['LOCAL-EXTERNAL-MODEL-SYNC']
  ),
  claim(
    'WGF-022',
    41,
    'maintainer-design-position',
    'Wordgard exists to revisit and improve unresolved design problems in ProseMirror rather than preserve that architecture unchanged.',
    ['WG-META-004D'],
    []
  ),
  claim(
    'WGF-023',
    29,
    'maintainer-design-position',
    'Wordgard deliberately prefers functional algebraic state design and facets over Lexical-style imperative composition.',
    ['WG-STATE-001A', 'WG-STATE-003A', 'WG-STATE-003B', 'WG-STATE-004A'],
    []
  ),
  claim(
    'WGF-024',
    55,
    'community-requirement',
    'Large documents and expensive node views motivate bounded DOM mounting, but nested variable-height content makes naïve list windowing insufficient.',
    [
      'WG-VIEW-004A3',
      'LOCAL-REACT-HOST',
      'LOCAL-LAYOUT-PLAN',
      'LOCAL-LAYOUT-GEOMETRY',
    ],
    []
  ),
  claim(
    'WGF-025',
    56,
    'maintainer-non-goal',
    'Core virtualization is intentionally excluded because its code and API complexity impose a tax on most users.',
    ['WG-VIEW-004A3'],
    []
  ),
  claim(
    'WGF-026',
    56,
    'maintainer-intent',
    'Wordgard data structures are intended for reuse by canvas, native, React, or virtualizing editor components, but the host abstractions still need real adopters and refinement.',
    [
      'WG-META-001',
      'WG-VIEW-001A',
      'LOCAL-REACT-HOST',
      'LOCAL-LAYOUT-PLAN',
      'LOCAL-LAYOUT-GEOMETRY',
    ],
    ['LOCAL-HOST-EDITOR-CAPABILITY']
  ),
  claim(
    'WGF-027',
    21,
    'community-api-analysis',
    'Native ESM namespaces could avoid TypeScript namespace declaration problems and improve tree shaking, but lose callable-class-plus-namespace ergonomics.',
    ['WG-META-002B', 'LOCAL-RUNTIME-API-TREESHAKING'],
    []
  ),
  claim(
    'WGF-028',
    28,
    'maintainer-design-position',
    'TypeScript namespaces were selected to support nested classes; an ESM alternative was considered.',
    ['WG-META-002B', 'LOCAL-RUNTIME-API-TREESHAKING'],
    []
  ),
  claim(
    'WGF-029',
    32,
    'maintainer-design-position',
    'Splitting every nested API into ESM modules creates awkward ownership and cycles, so Wordgard keeps namespaces and rewrites build output for tree shaking.',
    ['WG-META-002B', 'LOCAL-RUNTIME-API-TREESHAKING'],
    []
  ),
  claim(
    'WGF-030',
    34,
    'community-bug-report',
    'A Vite consumer observed the link namespace missing at runtime.',
    ['WG-META-002B'],
    []
  ),
  claim(
    'WGF-031',
    35,
    'maintainer-cause-claim',
    'The missing link API was attributed to a namespace-mangling build bug that let dead-code elimination drop a live namespace.',
    ['WG-META-002B', 'WG-META-005A'],
    []
  ),
  claim(
    'WGF-032',
    23,
    'community-requirement',
    'A non-browser Rust port needs the document and command substrate to be separable from DOM layout and selection.',
    ['WG-META-001', 'WG-VIEW-001A'],
    ['LOCAL-HOST-EDITOR-CAPABILITY']
  ),
  claim(
    'WGF-033',
    31,
    'maintainer-intent',
    'Host independence was a deliberate design goal, but it remains unproven until another host drives a generic subset of the editor interface.',
    ['WG-META-001', 'WG-VIEW-001A'],
    ['LOCAL-HOST-EDITOR-CAPABILITY']
  ),
  claim(
    'WGF-034',
    20,
    'community-requirement',
    'Users want a Wordgard Markdown parser and serializer equivalent to the ProseMirror module.',
    ['WG-META-001', 'WG-DOC-016'],
    ['LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY']
  ),
  claim(
    'WGF-035',
    27,
    'maintainer-intent',
    'Markdown serialization is not a core priority and is expected to live in a separate module.',
    ['WG-META-001', 'WG-DOC-016'],
    ['LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY']
  ),
  claim(
    'WGF-036',
    9,
    'community-requirement',
    'Framework users need to render Angular-owned components inside editor content.',
    ['WG-VIEW-005A2'],
    ['LOCAL-HOST-EDITOR-CAPABILITY']
  ),
  claim(
    'WGF-037',
    10,
    'maintainer-boundary',
    'Core widgets may host custom DOM, while Angular and other framework adapters stay outside the core library.',
    ['WG-VIEW-005A2', 'WG-META-001'],
    ['LOCAL-HOST-EDITOR-CAPABILITY']
  ),
];

const fetchJson = async (path) => {
  const url = new URL(path, forumOrigin);
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'plate-wordgard-architecture-audit/1.0',
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }

  return response.json();
};

const collectPaged = async (initialPath, listKey, nextKey) => {
  const pages = [];
  let path = initialPath;
  while (path) {
    const page = await fetchJson(path);
    pages.push(page);
    path = page[nextKey] ?? page.topic_list?.[nextKey] ?? null;
  }

  return {
    items: pages.flatMap(
      (page) => listKey.reduce((value, key) => value?.[key], page) ?? []
    ),
    pages: pages.length,
  };
};

const decodeHtml = (value) =>
  value
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, code) =>
      String.fromCodePoint(
        code.toLowerCase().startsWith('x')
          ? Number.parseInt(code.slice(1), 16)
          : Number.parseInt(code, 10)
      )
    )
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&hellip;', '…')
    .replaceAll('&mdash;', '—')
    .replaceAll('&ndash;', '–')
    .replaceAll('&rsquo;', '’')
    .replaceAll('&lsquo;', '‘')
    .replaceAll('&rdquo;', '”')
    .replaceAll('&ldquo;', '“');

const textFromCooked = (cooked) =>
  decodeHtml(
    cooked
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<(?:br|\/p|\/li|\/blockquote|\/h[1-6]|\/pre)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const linksFromCooked = (cooked) => [
  ...new Set(
    [...cooked.matchAll(/\shref="([^"]+)"/g)].map(
      ([, href]) => new URL(decodeHtml(href), forumOrigin).href
    )
  ),
];

const escapeCell = (value) =>
  String(value ?? '—')
    .replaceAll('|', '\\|')
    .replaceAll('\n', '<br>');

const markdownTable = (headers, rows) => [
  `| ${headers.join(' | ')} |`,
  `| ${headers.map(() => '---').join(' | ')} |`,
  ...rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`),
];

const about = await fetchJson('/about.json');
const categoriesResponse = await fetchJson('/categories.json');
const categories = categoriesResponse.category_list.categories;
const latest = await collectPaged(
  '/latest.json',
  ['topic_list', 'topics'],
  'more_topics_url'
);
const globalPosts = await collectPaged(
  '/posts.json',
  ['latest_posts'],
  'load_more_posts'
);
const categoryIndexes = [];
for (const category of categories) {
  const page = await collectPaged(
    `/c/${category.slug}/${category.id}.json`,
    ['topic_list', 'topics'],
    'more_topics_url'
  );
  categoryIndexes.push({
    categoryId: category.id,
    pages: page.pages,
    topicIds: page.items.map(({ id }) => id),
  });
}

const categoryDescriptionTopicIds = categories
  .map(({ topic_url: topicUrl }) => topicUrl?.match(CATEGORY_TOPIC_ID_RE)?.[1])
  .filter(Boolean)
  .map(Number);
const publicTopicIds = [
  ...new Set([
    ...latest.items.map(({ id }) => id),
    ...categoryIndexes.flatMap(({ topicIds }) => topicIds),
    ...categoryDescriptionTopicIds,
    ...globalPosts.items.map(({ topic_id: topicId }) => topicId),
  ]),
].sort((a, b) => a - b);

const topicResponses = [];
for (const topicId of publicTopicIds) {
  const topic = await fetchJson(`/t/${topicId}.json`);
  const loadedById = new Map(
    topic.post_stream.posts.map((post) => [post.id, post])
  );
  const unloadedIds = topic.post_stream.stream.filter(
    (postId) => !loadedById.has(postId)
  );
  for (let offset = 0; offset < unloadedIds.length; offset += 20) {
    const query = new URLSearchParams();
    for (const postId of unloadedIds.slice(offset, offset + 20)) {
      query.append('post_ids[]', String(postId));
    }
    const chunk = await fetchJson(`/t/${topicId}/posts.json?${query}`);
    for (const post of chunk.post_stream.posts) loadedById.set(post.id, post);
  }
  topicResponses.push({
    ...topic,
    post_stream: {
      ...topic.post_stream,
      posts: topic.post_stream.stream.map((postId) => loadedById.get(postId)),
    },
  });
}

const allPosts = topicResponses
  .flatMap((topic) =>
    topic.post_stream.posts.map((post) => ({ ...post, topic }))
  )
  .sort((a, b) => a.id - b.id);
const fetchedPostIds = allPosts.map(({ id }) => id);
const fetchedPostIdSet = new Set(fetchedPostIds);
const reviewedPostIds = Object.keys(reviewedPostHashes).map(Number);
const changedPostIds = allPosts
  .filter(({ cooked, id }) => sha256(cooked) !== reviewedPostHashes[id])
  .map(({ id }) => id);
const unreviewedPostIds = fetchedPostIds.filter(
  (postId) => !(postId in reviewedPostHashes)
);
const missingReviewedPostIds = reviewedPostIds.filter(
  (postId) => !fetchedPostIdSet.has(postId)
);
const existingMatrixIds = new Set(matrixTruth.map(({ id }) => id));
const proposedMatrixIds = new Set(proposedMatrixRows.map(({ id }) => id));
const unknownExistingRowIds = [
  ...new Set(
    claims
      .flatMap(({ existingRowIds }) => existingRowIds)
      .filter((rowId) => !existingMatrixIds.has(rowId))
  ),
];
const unknownProposedRowIds = [
  ...new Set(
    claims
      .flatMap(({ proposedRowIds }) => proposedRowIds)
      .filter((rowId) => !proposedMatrixIds.has(rowId))
  ),
];
const claimsByPost = Map.groupBy(claims, ({ postId }) => postId);
const uncategorizedPostIds = fetchedPostIds.filter(
  (postId) => !claimsByPost.has(postId) && !(postId in excludedPosts)
);
const staleExcludedPostIds = Object.keys(excludedPosts)
  .map(Number)
  .filter((postId) => !fetchedPostIdSet.has(postId));
const claimIds = claims.map(({ id }) => id);
const duplicateClaimIds = claimIds.filter(
  (claimId, index) => claimIds.indexOf(claimId) !== index
);
const unmappedClaimIds = claims
  .filter(
    ({ existingRowIds, proposedRowIds }) =>
      existingRowIds.length === 0 && proposedRowIds.length === 0
  )
  .map(({ id }) => id);

const maintainer = about.users.find(({ username }) => username === 'marijn');
if (!maintainer || maintainer.id !== 1 || maintainer.title !== 'Maintainer') {
  throw new Error('Could not verify Marijn as the forum maintainer');
}

const authorityFor = (username) =>
  username === 'marijn'
    ? 'maintainer'
    : username === 'system'
      ? 'system'
      : 'community';
const reviewedClaims = claims.map((forumClaim) => {
  const post = allPosts.find(({ id }) => id === forumClaim.postId);
  if (!post)
    throw new Error(`Claim ${forumClaim.id} references a missing post`);

  return {
    ...forumClaim,
    author: post.username,
    authorAuthority: authorityFor(post.username),
    postNumber: post.post_number,
    topicId: post.topic.id,
    topicTitle: post.topic.title,
    url: `${forumOrigin}/t/${post.topic.slug}/${post.topic.id}/${post.post_number}`,
  };
});

const topicInventory = topicResponses
  .map((topic) => {
    const posts = topic.post_stream.posts;
    const visiblePostNumbers = posts.map(({ post_number: number }) => number);
    const missingPostNumbers = Array.from(
      { length: topic.highest_post_number },
      (_, index) => index + 1
    ).filter((number) => !visiblePostNumbers.includes(number));

    return {
      archived: topic.archived,
      categoryId: topic.category_id,
      closed: topic.closed,
      createdAt: topic.created_at,
      highestPostNumber: topic.highest_post_number,
      id: topic.id,
      lastPostedAt: topic.last_posted_at,
      missingPublicPostNumbers: missingPostNumbers,
      posts: posts.map((post) => {
        const plainText = textFromCooked(post.cooked);
        const plainTextWords = plainText ? plainText.split(WHITESPACE_RE) : [];
        const postClaims = reviewedClaims.filter(
          ({ postId }) => postId === post.id
        );
        return {
          author: post.username,
          authorAuthority: authorityFor(post.username),
          claimIds: postClaims.map(({ id }) => id),
          cookedHtmlSha256: sha256(post.cooked),
          createdAt: post.created_at,
          excerpt: `${plainTextWords.slice(0, 20).join(' ')}${plainTextWords.length > 20 ? '…' : ''}`,
          id: post.id,
          links: linksFromCooked(post.cooked),
          postNumber: post.post_number,
          plainTextCharacters: plainText.length,
          plainTextSha256: sha256(plainText),
          plainTextWords: plainTextWords.length,
          replyToPostNumber: post.reply_to_post_number,
          review:
            postClaims.length > 0
              ? { disposition: 'material', reason: null }
              : {
                  disposition: 'excluded',
                  ...excludedPosts[post.id],
                },
          updatedAt: post.updated_at,
          url: `${forumOrigin}/t/${topic.slug}/${topic.id}/${post.post_number}`,
        };
      }),
      postsCount: topic.posts_count,
      slug: topic.slug,
      title: topic.title,
      url: `${forumOrigin}/t/${topic.slug}/${topic.id}`,
      views: topic.views,
    };
  })
  .sort((a, b) => a.id - b.id);

const globalPostIds = globalPosts.items
  .map(({ id }) => id)
  .sort((a, b) => a - b);
const topicPostIds = topicInventory
  .flatMap(({ posts }) => posts.map(({ id }) => id))
  .sort((a, b) => a - b);
const globalPostIndexMismatch = [
  ...new Set([
    ...globalPostIds.filter((postId) => !topicPostIds.includes(postId)),
    ...topicPostIds.filter((postId) => !globalPostIds.includes(postId)),
  ]),
];
const latestTopicIds = latest.items.map(({ id }) => id).sort((a, b) => a - b);
const categoryRegularTopicIds = [
  ...new Set(categoryIndexes.flatMap(({ topicIds }) => topicIds)),
]
  .filter((topicId) => !categoryDescriptionTopicIds.includes(topicId))
  .sort((a, b) => a - b);
const latestCategoryTopicMismatch = [
  ...new Set([
    ...latestTopicIds.filter(
      (topicId) => !categoryRegularTopicIds.includes(topicId)
    ),
    ...categoryRegularTopicIds.filter(
      (topicId) => !latestTopicIds.includes(topicId)
    ),
  ]),
];
const categoryTopicCount = categories.reduce(
  (sum, { topic_count: count }) => sum + count,
  0
);
const categoryPostCount = categories.reduce(
  (sum, { post_count: count }) => sum + count,
  0
);
const visiblePostCount = topicInventory.reduce(
  (sum, { postsCount }) => sum + postsCount,
  0
);
const visiblePostNumberGaps = topicInventory.reduce(
  (sum, { missingPublicPostNumbers }) => sum + missingPublicPostNumbers.length,
  0
);
const materialPostIds = [
  ...new Set(reviewedClaims.map(({ postId }) => postId)),
];
const unexplainedVisibleTopicIds = topicInventory
  .filter(({ posts }) =>
    posts.some(({ id }) => uncategorizedPostIds.includes(id))
  )
  .map(({ id }) => id);
const existingRowMappings = Object.entries(
  Object.groupBy(
    reviewedClaims.flatMap((forumClaim) =>
      forumClaim.existingRowIds.map((rowId) => ({ forumClaim, rowId }))
    ),
    ({ rowId }) => rowId
  )
)
  .map(([rowId, entries]) => ({
    claimIds: entries.map(({ forumClaim }) => forumClaim.id),
    rowId,
    title: matrixTruth.find(({ id }) => id === rowId)?.title,
  }))
  .sort((a, b) => a.rowId.localeCompare(b.rowId));
const proposedRowMappings = proposedMatrixRows.map((row) => ({
  ...row,
  claimIds: reviewedClaims
    .filter(({ proposedRowIds }) => proposedRowIds.includes(row.id))
    .map(({ id }) => id),
}));
const retrievedAt = new Date().toISOString();
const publicCorpusHash = sha256(
  allPosts
    .map(({ cooked, id }) => `${id}:${sha256(cooked)}`)
    .sort()
    .join('\n')
);

const validation = {
  allVisiblePostsExplained: uncategorizedPostIds.length === 0,
  allVisibleTopicsExplained: unexplainedVisibleTopicIds.length === 0,
  categoryPostCountMatchesRegularTopics:
    categoryPostCount === visiblePostCount - categoryDescriptionTopicIds.length,
  categoryTopicCountMatchesIndexes:
    categoryTopicCount === categoryRegularTopicIds.length,
  changedPostIds,
  duplicateClaimIds,
  globalPostIndexMismatch,
  latestCategoryTopicMismatch,
  missingReviewedPostIds,
  postStreamsComplete: topicResponses.every(
    (topic) =>
      topic.post_stream.posts.length === topic.post_stream.stream.length &&
      topic.posts_count === topic.post_stream.stream.length
  ),
  staleExcludedPostIds,
  uncategorizedPostIds,
  unknownExistingRowIds,
  unknownProposedRowIds,
  unmappedClaimIds,
  unreviewedPostIds,
};

const failures = Object.entries(validation).filter(([, value]) =>
  Array.isArray(value) ? value.length > 0 : value !== true
);
if (failures.length > 0) {
  throw new Error(
    `Wordgard forum coverage validation failed:\n${JSON.stringify(failures, null, 2)}`
  );
}

const instanceTopics = about.about.stats.topics_count;
const instancePosts = about.about.stats.posts_count;
const inventory = {
  schemaVersion: 1,
  kind: 'wordgard-public-forum-inventory',
  retrievedAt,
  authority: {
    aboutUrl: `${forumOrigin}/about.json`,
    categoriesUrl: `${forumOrigin}/categories.json`,
    forum: forumOrigin,
    locale: about.about.locale,
    maintainer: {
      id: maintainer.id,
      name: maintainer.name,
      title: maintainer.title,
      username: maintainer.username,
    },
    publicCorpusHash,
    siteCreatedAt: about.about.site_creation_date,
    title: about.about.title,
    version: about.about.version,
  },
  completeness: {
    anonymousBoundary:
      'Every topic and post reachable through anonymous latest, category, category-description, and global-post Discourse JSON endpoints. Instance totals may include private, deleted, or otherwise anonymous-inaccessible records.',
    categoryDescriptionTopicIds,
    categoryRegularPostCount: categoryPostCount,
    categoryRegularTopicCount: categoryTopicCount,
    globalPostIndexPages: globalPosts.pages,
    indexedPublicPostCount: globalPostIds.length,
    instancePostCount: instancePosts,
    anonymousInaccessibleGap: {
      posts: instancePosts - visiblePostCount,
      topics: instanceTopics - publicTopicIds.length,
    },
    instanceRecordsNotAnonymousRetrievable: {
      posts: instancePosts - visiblePostCount,
      topics: instanceTopics - publicTopicIds.length,
    },
    instanceTopicCount: instanceTopics,
    latestPages: latest.pages,
    publicTopicCount: publicTopicIds.length,
    unexplainedVisibleCorpus: {
      posts: uncategorizedPostIds.length,
      topics: unexplainedVisibleTopicIds.length,
    },
    visiblePostCount,
    visiblePostNumberGaps,
  },
  categories: categories.map((category) => ({
    id: category.id,
    name: category.name,
    postCount: category.post_count,
    slug: category.slug,
    topicCount: category.topic_count,
    topicUrl: category.topic_url
      ? new URL(category.topic_url, forumOrigin).href
      : null,
  })),
  categoryIndexes,
  topics: topicInventory,
  validation,
};

const coverage = {
  schemaVersion: 1,
  kind: 'wordgard-public-forum-claim-coverage',
  retrievedAt,
  completeness: inventory.completeness,
  corpus: {
    inventory: 'wordgard-forum-inventory.json',
    publicCorpusHash,
  },
  evidenceLaw: {
    forumClaimsAreImplementationProof: false,
    maintainerPosts:
      'Authoritative for maintainer intent, boundaries, plans, explanations, and status claims only.',
    communityPosts:
      'Requirements, proposals, observations, and bug reports only; never source or runtime proof.',
  },
  claims: reviewedClaims,
  mappings: {
    existingMatrixRows: existingRowMappings,
    proposedMatrixRows: proposedRowMappings,
  },
  excludedPosts: Object.entries(excludedPosts)
    .map(([postId, exclusion]) => ({
      ...exclusion,
      postId: Number(postId),
    }))
    .sort((a, b) => a.postId - b.postId),
  summary: {
    claims: reviewedClaims.length,
    communityClaims: reviewedClaims.filter(
      ({ authorAuthority }) => authorAuthority === 'community'
    ).length,
    communityPosts: allPosts.filter(
      ({ username }) => authorityFor(username) === 'community'
    ).length,
    excludedPosts: Object.keys(excludedPosts).length,
    existingMatrixRowsReferenced: existingRowMappings.length,
    maintainerClaims: reviewedClaims.filter(
      ({ authorAuthority }) => authorAuthority === 'maintainer'
    ).length,
    maintainerPosts: allPosts.filter(
      ({ username }) => authorityFor(username) === 'maintainer'
    ).length,
    materialPosts: materialPostIds.length,
    proposedMatrixRows: proposedMatrixRows.length,
    publicTopics: publicTopicIds.length,
    systemPosts: allPosts.filter(
      ({ username }) => authorityFor(username) === 'system'
    ).length,
    unexplainedVisiblePosts: uncategorizedPostIds.length,
    unexplainedVisibleTopics: unexplainedVisibleTopicIds.length,
    visiblePosts: visiblePostCount,
  },
  validation,
};

const topicRows = topicInventory.map((topic) => {
  const topicClaims = reviewedClaims.filter(
    ({ topicId }) => topicId === topic.id
  );
  return [
    topic.id,
    `[${topic.title}](${topic.url})`,
    topic.postsCount,
    topic.posts.filter(
      ({ authorAuthority }) => authorAuthority === 'maintainer'
    ).length,
    topic.posts.filter(({ authorAuthority }) => authorAuthority === 'community')
      .length,
    topic.missingPublicPostNumbers.join(', ') || '—',
    topicClaims.map(({ id }) => id).join(', ') || '—',
  ];
});
const claimRows = reviewedClaims.map((forumClaim) => [
  forumClaim.id,
  `[${forumClaim.topicId}#${forumClaim.postNumber}](${forumClaim.url})`,
  `${forumClaim.author} (${forumClaim.authorAuthority})`,
  forumClaim.kind,
  forumClaim.statement,
  [...forumClaim.existingRowIds, ...forumClaim.proposedRowIds].join(', '),
]);
const proposedRows = proposedRowMappings.map((row) => [
  row.id,
  row.title,
  row.whyNew,
  row.claimIds.join(', '),
]);
const proposedDecisionRows = proposedRowMappings.map((row) => [
  row.id,
  row.mechanism,
  `${row.status.wordgard}/${row.status.plite}/${row.status.plate}`,
  Object.entries(row.dimensionWinners)
    .map(([dimension, winner]) => `${dimension}: ${winner}`)
    .join('<br>'),
  `${row.classification} / ${row.preferred}`,
  `${row.verdict}; reference ${row.referenceAdaptation}; proof ${row.proofAdaptation}; debt ${row.localDebt}; priority ${row.priority}`,
]);
const proposedEvidenceRows = proposedRowMappings.flatMap((row) => [
  [row.id, 'forum intent/coverage only', row.forumLocators.join('<br>')],
  [
    row.id,
    'Wordgard current source',
    row.sourceLocators.wordgard.join('<br>') || '—',
  ],
  [
    row.id,
    'Plite current source',
    row.sourceLocators.plite.join('<br>') || '—',
  ],
  [
    row.id,
    'Plate current source',
    row.sourceLocators.plate.join('<br>') || '—',
  ],
]);
const excludedRows = coverage.excludedPosts.map((post) => {
  const forumPost = allPosts.find(({ id }) => id === post.postId);
  return [post.postId, forumPost?.username, post.scope, post.reason];
});

const markdown = [
  '# Wordgard public forum coverage',
  '',
  `Frozen at \`${retrievedAt}\` from the official [Wordgard forum](${forumOrigin}).`,
  '',
  '> Forum content is intent and requirements evidence only. Marijn posts establish maintainer intent, boundaries, explanations, and claimed status. Community posts establish demand, proposals, observations, or bug reports. Neither is implementation or runtime proof.',
  '',
  '## Completeness boundary',
  '',
  ...markdownTable(
    ['Measure', 'Count'],
    [
      ['Discourse categories', categories.length],
      ['Regular public topics', categoryTopicCount],
      [
        'Category-description topics omitted by latest',
        categoryDescriptionTopicIds.length,
      ],
      ['All anonymously retrievable topics', publicTopicIds.length],
      ['All anonymously retrievable posts', visiblePostCount],
      ['Marijn posts', coverage.summary.maintainerPosts],
      ['Community posts', coverage.summary.communityPosts],
      ['System posts', coverage.summary.systemPosts],
      ['Visible post-number gaps', visiblePostNumberGaps],
      ['Instance topic count from about.json', instanceTopics],
      ['Instance post count from about.json', instancePosts],
      [
        'Instance records not anonymously retrievable',
        `${instanceTopics - publicTopicIds.length} topics / ${instancePosts - visiblePostCount} posts`,
      ],
      [
        'Unexplained records inside the visible corpus',
        `${unexplainedVisibleTopicIds.length} topics / ${uncategorizedPostIds.length} posts`,
      ],
    ]
  ),
  '',
  'The anonymous corpus is the union of paginated `/latest.json`, every category index, category-description `topic_url` records, and paginated `/posts.json`, followed by each complete topic post stream. Every record inside that visible corpus is explained. Separately, the 17/71 instance totals leave an anonymous-inaccessible gap that may contain private, deleted, or internal records; this audit does not guess their content.',
  '',
  '## Topics',
  '',
  ...markdownTable(
    [
      'ID',
      'Topic',
      'Posts',
      'Marijn',
      'Community',
      'Missing public numbers',
      'Claims',
    ],
    topicRows
  ),
  '',
  '## Material claims',
  '',
  ...markdownTable(
    [
      'Claim',
      'Post',
      'Speaker',
      'Kind',
      'Paraphrased statement',
      'Matrix mapping',
    ],
    claimRows
  ),
  '',
  '## Genuinely new atomic rows proposed',
  '',
  ...markdownTable(
    ['Proposed row', 'Title', 'Why distinct', 'Claims'],
    proposedRows
  ),
  '',
  ...markdownTable(
    [
      'Proposed row',
      'Mechanism',
      'W/P/P status',
      'Six dimension winners',
      'Overall / preferred',
      'Disposition',
    ],
    proposedDecisionRows
  ),
  '',
  ...markdownTable(
    ['Proposed row', 'Evidence role', 'Locators'],
    proposedEvidenceRows
  ),
  '',
  'These are proposals for the parent audit to accept, merge, or reject. Their presence here does not mutate the matrix.',
  '',
  '## Reviewed non-material posts',
  '',
  ...markdownTable(['Post', 'Author', 'Scope', 'Reason'], excludedRows),
  '',
  '## Validation',
  '',
  `- Exact cooked-body hashes matched for ${visiblePostCount}/${visiblePostCount} visible posts.`,
  `- Every visible post is either material (${materialPostIds.length}) or explicitly excluded (${Object.keys(excludedPosts).length}).`,
  `- Unexplained visible corpus: ${unexplainedVisibleTopicIds.length} topics / ${uncategorizedPostIds.length} posts.`,
  `- ${reviewedClaims.length} claims map to ${existingRowMappings.length} existing matrix rows and ${proposedMatrixRows.length} proposed rows.`,
  '- Every material claim has at least one existing or proposed atomic row mapping.',
  '- The global post index, topic post streams, latest index, and category indexes agree.',
  '',
];

writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`);
writeFileSync(coverageJsonPath, `${JSON.stringify(coverage, null, 2)}\n`);
writeFileSync(coverageMarkdownPath, `${markdown.join('\n')}\n`);

process.stdout.write(
  `${JSON.stringify({
    claims: coverage.summary.claims,
    communityPosts: coverage.summary.communityPosts,
    excludedPosts: coverage.summary.excludedPosts,
    maintainerPosts: coverage.summary.maintainerPosts,
    materialPosts: coverage.summary.materialPosts,
    proposedRows: coverage.summary.proposedMatrixRows,
    publicTopics: coverage.summary.publicTopics,
    visiblePosts: coverage.summary.visiblePosts,
  })}\n`
);

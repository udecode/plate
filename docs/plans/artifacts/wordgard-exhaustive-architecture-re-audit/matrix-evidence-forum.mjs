/**
 * Direct comparison evidence for the six atomic rows discovered by the
 * complete anonymous Wordgard forum audit.
 *
 * Forum records are deliberately isolated under `forum`: they establish
 * maintainer intent, boundaries, and community demand only. No dimension may
 * cite `forum`, `intentCoverage`, or `coverage` as implementation or proof.
 *
 * Dimension array order is correctness, API, data, ownership, runtime, proof.
 */

const forum = (locators) =>
  Object.freeze({
    implementationProof: false,
    locators: Object.freeze(locators),
    role: 'intent/coverage-only',
  });

const sourceCoverage = Object.freeze({
  plate:
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
  plite:
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
  wordgard:
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json:1-24',
});

export const contractEvidence = Object.freeze({
  'LOCAL-VERTICAL-WRITING-LAYOUT': {
    forum: forum([
      'https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/1',
      'https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/2',
      'https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/3',
      'https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/4',
    ]),
    plate: { coverage: [sourceCoverage.plate] },
    plite: {
      coverage: [
        sourceCoverage.plite,
        'docs/plite/selection-navigation-coverage.md:198-201',
      ],
    },
    wordgard: { coverage: [sourceCoverage.wordgard] },
  },
  'LOCAL-VERTICAL-WRITING-INPUT': {
    forum: forum([
      'https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/1',
      'https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/2',
      'https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/3',
      'https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/4',
    ]),
    plate: { coverage: [sourceCoverage.plate] },
    plite: {
      coverage: [
        sourceCoverage.plite,
        'docs/plite/selection-navigation-coverage.md:198-201',
      ],
    },
    wordgard: { coverage: [sourceCoverage.wordgard] },
  },
  'LOCAL-OFFLINE-MERGE-REVIEW': {
    forum: forum([
      'https://discuss.wordgard.net/t/offline-collaborative-editing/31/1',
      'https://discuss.wordgard.net/t/offline-collaborative-editing/31/2',
      'https://discuss.wordgard.net/t/offline-collaborative-editing/31/3',
    ]),
    plate: {
      covers: [
        'packages/yjs/src/core/extension.ts:17-222',
        'packages/suggestion/src/lib/BaseSuggestionPlugin.ts:1204-1303',
        'packages/suggestion/src/lib/BaseSuggestionPlugin.ts:1392-1425',
      ],
      missingEvidence: [sourceCoverage.plate],
      proof: [
        'packages/yjs/test/canonical-change-contract.spec.ts:97-290',
        'packages/suggestion/src/lib/BaseSuggestionPlugin.spec.tsx:1882-1915',
        'packages/suggestion/src/lib/BaseSuggestionPlugin.spec.tsx:2572-2617',
      ],
    },
    plite: {
      covers: ['packages/yjs/src/core/extension.ts:17-222'],
      missingEvidence: [sourceCoverage.plite],
      proof: [
        'packages/yjs/test/canonical-change-contract.spec.ts:97-290',
        'packages/yjs/test/insert-fragment-contract.spec.ts:76-102',
      ],
    },
    wordgard: {
      coverage: [
        sourceCoverage.wordgard,
        '../wordgard/src/collab/collab.ts:23-37',
        '../wordgard/src/collab/collab.ts:64-82',
        '../wordgard/src/collab/collab.ts:122-230',
      ],
    },
  },
  'LOCAL-HOST-EDITOR-CAPABILITY': {
    forum: forum([
      'https://discuss.wordgard.net/t/any-plan-to-render-angular-components-inside-the-editor/8/1',
      'https://discuss.wordgard.net/t/any-plan-to-render-angular-components-inside-the-editor/8/2',
      'https://discuss.wordgard.net/t/porting-to-other-languages-environments/18/1',
      'https://discuss.wordgard.net/t/porting-to-other-languages-environments/18/2',
      'https://discuss.wordgard.net/t/virtualization-windowing-occlusion-culling-support/29/2',
      'https://discuss.wordgard.net/t/any-plans-for-vertical-writing-mode-support/27/4',
    ]),
    plate: {
      covers: [
        'packages/core/src/react/editor/PlateEditor.ts:24-70',
        'packages/core/src/react/editor/withPlate.ts:147-218',
      ],
      missingEvidence: [sourceCoverage.plate],
      proof: ['packages/core/src/react/editor/TPlateEditorCore.spec.ts:55-90'],
    },
    plite: {
      covers: [
        'packages/plite/src/interfaces/editor.ts:120-180',
        'packages/plite/src/interfaces/editor.ts:1285-1311',
        'packages/plite-dom/src/index.ts:23-55',
        'packages/plite-react/src/index.ts:35-85',
      ],
      missingEvidence: [sourceCoverage.plite],
      proof: [
        'packages/plite-dom/test/generic-dom-contract.ts:1-105',
        'packages/plite-react/test/react-editor-contract.tsx:130-214',
        'packages/plite/test/public-package-types-smoke.ts:1-115',
      ],
    },
    wordgard: {
      covers: [
        '../wordgard/src/editor/editor.ts:26-79',
        '../wordgard/src/command/command.ts:19-55',
        '../wordgard/src/state/state.ts:41-79',
      ],
      missingEvidence: [sourceCoverage.wordgard],
    },
  },
  'LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY': {
    forum: forum([
      'https://discuss.wordgard.net/t/wordgard-markdown/16/1',
      'https://discuss.wordgard.net/t/wordgard-markdown/16/2',
    ]),
    plate: {
      consumers: ['packages/markdown/src/lib/MarkdownPlugin.spec.ts:152-185'],
      lifecycle: ['packages/markdown/src/lib/MarkdownPlugin.ts:69-122'],
      owner: [
        'packages/markdown/package.json:2-29',
        'packages/markdown/src/lib/MarkdownPlugin.ts:69-122',
      ],
      proof: ['packages/markdown/src/lib/MarkdownPlugin.spec.ts:304-434'],
      public: ['packages/markdown/src/lib/MarkdownPlugin.ts:47-57'],
    },
    plite: {
      covers: [
        'packages/plite-dom/src/plugin/host-codec.ts:118-180',
        'packages/plite-dom/src/plugin/host-codec.ts:547-560',
      ],
      missingEvidence: [sourceCoverage.plite],
      proof: [
        'packages/plite-dom/test/host-codec.test.ts:163-239',
        'packages/plite-dom/test/host-codec.test.ts:356-411',
      ],
    },
    wordgard: { coverage: [sourceCoverage.wordgard] },
  },
  'LOCAL-EXTERNAL-MODEL-SYNC': {
    forum: forum([
      'https://discuss.wordgard.net/t/strongly-referencing-document-positions/19/1',
      'https://discuss.wordgard.net/t/strongly-referencing-document-positions/19/2',
      'https://discuss.wordgard.net/t/strongly-referencing-document-positions/19/3',
      'https://discuss.wordgard.net/t/offline-collaborative-editing/31/3',
    ]),
    plate: {
      covers: [
        'packages/core/src/react/components/Plate.tsx:34-53',
        'packages/core/src/react/components/Plate.tsx:111-175',
      ],
      missingEvidence: [sourceCoverage.plate],
      proof: [
        'packages/core/src/react/components/PlateContent.spec.tsx:209-280',
        'packages/core/src/react/components/PlateContent.spec.tsx:282-373',
      ],
    },
    plite: {
      covers: [
        'packages/plite/src/interfaces/editor.ts:1285-1311',
        'packages/plite/src/interfaces/editor.ts:3491-3508',
        'packages/plite/src/core/listener-state.ts:105-118',
      ],
      missingEvidence: [sourceCoverage.plite],
      proof: ['packages/plite/test/transaction-extension-contract.ts:19-79'],
    },
    wordgard: {
      covers: [
        '../wordgard/src/editor/editor.ts:170-190',
        '../wordgard/src/editor/editor.ts:240-243',
        '../wordgard/src/editor/editor.ts:635-658',
        '../wordgard/src/editor/editor.ts:1015-1039',
      ],
      missingEvidence: [sourceCoverage.wordgard],
    },
  },
});

export const dimensionEvidenceKeys = Object.freeze({
  'LOCAL-VERTICAL-WRITING-LAYOUT': [[], [], [], [], [], []],
  'LOCAL-VERTICAL-WRITING-INPUT': [[], [], [], [], [], []],
  'LOCAL-OFFLINE-MERGE-REVIEW': [
    ['plate.proof'],
    ['plate.covers'],
    ['plate.covers'],
    ['plate.covers'],
    [],
    ['plate.proof'],
  ],
  'LOCAL-HOST-EDITOR-CAPABILITY': [
    [],
    ['plite.covers', 'plate.covers'],
    ['plite.covers', 'plate.covers'],
    ['plite.covers', 'plate.covers'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY': [
    ['plate.proof'],
    ['plate.public'],
    ['plate.consumers'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'LOCAL-EXTERNAL-MODEL-SYNC': [
    [],
    ['plite.covers', 'plate.covers'],
    ['plite.covers', 'plate.covers'],
    ['plite.covers', 'plate.covers'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
});

const rowIds = Object.keys(contractEvidence);
if (
  rowIds.length !== 6 ||
  rowIds.some((id) => dimensionEvidenceKeys[id]?.length !== 6)
) {
  throw new Error('Forum evidence must contain six rows with six dimensions');
}
for (const [id, dimensions] of Object.entries(dimensionEvidenceKeys)) {
  for (const keys of dimensions) {
    if (
      keys.some(
        (key) =>
          key.includes('forum') ||
          key.includes('intent') ||
          key.includes('coverage')
      )
    ) {
      throw new Error(`${id} treats forum or coverage evidence as direct`);
    }
  }
}

/**
 * Direct comparison evidence for nested integration, application-state, and
 * local architecture rows.
 *
 * Dimension array order is correctness, API, data, ownership, runtime, proof.
 * Empty arrays are intentional for not-applicable and insufficient dimensions.
 * Runtime stays empty: none of these rows has a comparable cross-editor probe.
 */

const exact = ({
  consumers,
  lifecycle,
  owner,
  proof,
  public: publicEvidence,
}) =>
  Object.freeze({
    consumers: Array.isArray(consumers) ? consumers : [consumers],
    lifecycle: Array.isArray(lifecycle) ? lifecycle : [lifecycle],
    owner: Array.isArray(owner) ? owner : [owner],
    proof: Array.isArray(proof) ? proof : [proof],
    public: Array.isArray(publicEvidence) ? publicEvidence : [publicEvidence],
  });

const partial = ({ covers, missingEvidence, proof }) =>
  Object.freeze({
    covers: Array.isArray(covers) ? covers : [covers],
    missingEvidence: Array.isArray(missingEvidence)
      ? missingEvidence
      : [missingEvidence],
    proof: Array.isArray(proof) ? proof : [proof],
  });

const sourceCoverage = Object.freeze({
  plate:
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
  plite:
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
  wordgard:
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json:1-24',
});

const wordgardNestedContent = exact({
  public: [
    '../wordgard-website/site/examples/footnote/index.md:5-12',
    '../wordgard-website/site/examples/footnote/index.md:37-55',
  ],
  owner: '../wordgard-website/site/examples/footnote/footnote.ts:69-92',
  consumers: '../wordgard-website/site/examples/footnote/footnote.ts:216-242',
  lifecycle: [
    '../wordgard-website/site/examples/footnote/footnote.ts:101-160',
    '../wordgard-website/site/examples/footnote/footnote.ts:165-182',
  ],
  proof: [
    '../wordgard-website/site/examples/footnote/footnote.ts:234-242',
    '../wordgard-website/site/examples/footnote/index.md:51-91',
  ],
});

const pliteNestedContent = exact({
  public: 'packages/plite-react/src/hooks/use-plite-content-root.ts:12-54',
  owner: [
    'packages/plite-react/src/hooks/use-plite-runtime.tsx:420-566',
    'packages/plite-react/src/components/editable-text-blocks.tsx:370-465',
  ],
  consumers:
    'packages/plite-react/src/components/editable-text-blocks.tsx:370-545',
  lifecycle: [
    'packages/plite-react/src/hooks/use-plite-runtime.tsx:451-566',
    'packages/plite-react/src/components/editable-text-blocks.tsx:443-542',
  ],
  proof: [
    'packages/plite-react/test/content-root-navigation-contract.test.ts:751-890',
    'packages/plite-react/test/projected-clipboard-contract.test.ts:429-544',
  ],
});

const plateNestedContent = partial({
  covers: [
    'packages/core/src/lib/types/RenderElementProps.ts:6-42',
    'packages/core/type-tests/content-root-slots-contracts.ts:8-53',
    'packages/core/src/react/components/PlateContent.spec.tsx:282-350',
  ],
  missingEvidence: sourceCoverage.plate,
  proof: [
    'packages/core/type-tests/content-root-slots-contracts.ts:26-53',
    'packages/core/src/static/components/PlateStatic.spec.tsx:303-362',
  ],
});

const wordgardNestedHistory = exact({
  public: '../wordgard-website/site/examples/footnote/index.md:69-107',
  owner: '../wordgard-website/site/examples/footnote/footnote.ts:101-130',
  consumers: '../wordgard-website/site/examples/footnote/footnote.ts:165-182',
  lifecycle: [
    '../wordgard-website/site/examples/footnote/footnote.ts:138-160',
    '../wordgard-website/site/examples/footnote/footnote.ts:189-207',
  ],
  proof: [
    '../wordgard-website/site/examples/footnote/footnote.ts:234-242',
    '../wordgard-website/site/examples/footnote/index.md:69-107',
  ],
});

const pliteNestedHistory = exact({
  public: 'packages/plite-react/src/hooks/use-plite-history.ts:146-176',
  owner: [
    'packages/plite-react/src/editable/history-focus.ts:6-62',
    'packages/plite-react/src/hooks/use-plite-runtime.tsx:524-566',
  ],
  consumers:
    'packages/plite-react/src/components/editable-text-blocks.tsx:443-476',
  lifecycle: 'packages/plite-react/src/hooks/use-plite-history.ts:181-300',
  proof: [
    'packages/plite-react/test/content-root-navigation-contract.test.ts:751-890',
    'packages/plite-react/test/use-plite-history.test.tsx:159-299',
  ],
});

const wordgardNestedTooltipFlush = exact({
  public: '../wordgard-website/site/examples/footnote/index.md:78-107',
  owner: '../wordgard-website/site/examples/footnote/footnote.ts:138-160',
  consumers: '../wordgard-website/site/examples/footnote/footnote.ts:189-207',
  lifecycle: [
    '../wordgard-website/site/examples/footnote/footnote.ts:138-160',
    '../wordgard-website/site/examples/footnote/footnote.ts:189-207',
  ],
  proof: '../wordgard-website/site/examples/footnote/index.md:78-107',
});

const wordgardPersistentBlame = exact({
  public: '../wordgard-website/site/examples/blame/index.md:12-54',
  owner: '../wordgard-website/site/examples/blame/blame.ts:5-43',
  consumers: '../wordgard-website/site/examples/blame/blame.ts:121-150',
  lifecycle: '../wordgard-website/site/examples/blame/blame.ts:73-127',
  proof: [
    '../wordgard-website/site/examples/blame/blame.ts:137-150',
    '../wordgard-website/site/examples/blame/index.md:24-54',
  ],
});

const pliteStateFieldPrimitive = partial({
  covers: 'packages/plite/src/core/state-field.ts:14-148',
  missingEvidence: sourceCoverage.plite,
  proof: 'packages/plite/test/field-facet-contract.test.ts:20-152',
});

const plateSuggestionAttribution = partial({
  covers: [
    'packages/suggestion/src/lib/BaseSuggestionPlugin.ts:57-148',
    'packages/suggestion/src/lib/BaseSuggestionPlugin.ts:189-273',
  ],
  missingEvidence: sourceCoverage.plate,
  proof: [
    'packages/suggestion/src/lib/BaseSuggestionPlugin.spec.tsx:511-537',
    'packages/suggestion/src/lib/BaseSuggestionPlugin.spec.tsx:907-1004',
  ],
});

const wordgardBlameDecorations = exact({
  public: '../wordgard-website/site/examples/blame/index.md:33-61',
  owner: '../wordgard-website/site/examples/blame/blame.ts:47-69',
  consumers: '../wordgard-website/site/examples/blame/blame.ts:98-117',
  lifecycle: '../wordgard-website/site/examples/blame/blame.ts:77-117',
  proof: [
    '../wordgard-website/site/examples/blame/blame.ts:47-69',
    '../wordgard-website/site/examples/blame/index.md:56-61',
  ],
});

const pliteDecorationPrimitive = partial({
  covers: [
    'packages/plite/src/core/state-field.ts:14-148',
    'packages/plite-react/src/decoration-source.ts:22-88',
    'packages/plite-react/src/decoration-source.ts:165-245',
  ],
  missingEvidence: sourceCoverage.plite,
  proof:
    'packages/plite-react/test/projections-and-selection-contract.tsx:562-596',
});

const plateCompletionLifecycle = partial({
  covers: [
    'packages/ai/src/react/CopilotPlugin.tsx:41-148',
    'packages/ai/src/react/CopilotPlugin.tsx:150-229',
    'packages/ai/src/react/CopilotPlugin.tsx:231-511',
    'packages/combobox/src/react/useComboboxInput.ts:14-162',
    'packages/combobox/src/lib/triggerCombobox.ts:13-88',
  ],
  missingEvidence: sourceCoverage.plate,
  proof: [
    'packages/ai/src/react/CopilotPlugin.spec.ts:1-110',
    'packages/combobox/src/react/useComboboxInput.spec.tsx:28-195',
    'packages/combobox/src/lib/triggerCombobox.spec.tsx:125-335',
  ],
});

const wordgardExtensionCapabilities = partial({
  covers: [
    '../wordgard/src/state/state.ts:426-592',
    '../wordgard/src/state/state.ts:594-679',
    '../wordgard/src/state/state.ts:708-810',
  ],
  missingEvidence: sourceCoverage.wordgard,
  proof: '../wordgard/test/test-facet.ts:15-170',
});

const pliteExtensionCapabilities = exact({
  public: [
    'packages/plite/src/interfaces/editor.ts:1883-1890',
    'packages/plite/src/interfaces/editor.ts:2026-2160',
  ],
  owner: [
    'packages/plite/src/core/editor-extension.ts:662-719',
    'packages/plite/src/core/editor-extension.ts:1274-1449',
  ],
  consumers: 'packages/plite/test/generic-extension-install-contract.ts:29-235',
  lifecycle: 'packages/plite/src/core/editor-extension.ts:1274-1449',
  proof: [
    'packages/plite/test/generic-extension-install-contract.ts:29-176',
    'packages/plite/test/generic-extension-install-contract.ts:237-433',
  ],
});

const plateExtensionCapabilities = exact({
  public: 'packages/core/src/lib/plugin/defineBasePlugin.ts:529-760',
  owner: [
    'packages/core/src/lib/editor/pluginRuntimeTypes.ts:686-763',
    'packages/core/src/lib/editor/pluginRuntimeTypes.ts:839-900',
  ],
  consumers: 'packages/core/src/lib/plugin/defineBasePlugin.spec.ts:9-165',
  lifecycle: 'packages/core/src/lib/plugin/defineBasePlugin.ts:762-780',
  proof: 'packages/core/src/lib/plugin/defineBasePlugin.spec.ts:9-165',
});

const pliteReactHost = exact({
  public: [
    'packages/plite-react/src/components/plite.tsx:240-390',
    'packages/plite-react/src/hooks/use-editor.tsx:5-29',
  ],
  owner: 'packages/plite-react/src/components/plite.tsx:855-971',
  consumers: 'packages/plite-react/test/provider-hooks-contract.tsx:71-119',
  lifecycle: 'packages/plite-react/src/components/plite.tsx:855-898',
  proof: [
    'packages/plite-react/test/provider-hooks-contract.tsx:71-119',
    'packages/plite-react/test/provider-hooks-contract.tsx:166-226',
    'packages/plite-react/test/react-editor-contract.tsx:17-125',
  ],
});

const plateReactHost = exact({
  public: [
    'packages/core/src/react/components/Plate.tsx:28-212',
    'packages/core/src/react/components/PlateContent.tsx:24-214',
    'packages/core/src/react/editor/usePlateEditor.ts:64-99',
    'packages/core/src/react/stores/plate/useEditorPlugin.ts:20-56',
  ],
  owner: 'packages/core/src/react/components/Plate.tsx:28-212',
  consumers: 'packages/core/src/react/components/PlateContent.tsx:70-214',
  lifecycle: 'packages/core/src/react/components/Plate.tsx:111-176',
  proof: [
    'packages/core/src/react/components/Plate.slow.tsx:27-165',
    'packages/core/src/react/stores/plate/useEditorPlugin.spec.tsx:1-94',
  ],
});

const wordgardTileLayout = partial({
  covers: [
    '../wordgard/src/editor/tile.ts:13-150',
    '../wordgard/src/editor/tile.ts:781-913',
  ],
  missingEvidence: sourceCoverage.wordgard,
  proof: '../wordgard/test/webtest-content.ts:50-220',
});

const pliteLayoutPlan = exact({
  public: [
    'packages/plite-layout/src/index.ts:116-425',
    'packages/plite-layout/src/page-mount-plan.ts:15-84',
  ],
  owner: [
    'packages/plite-layout/src/index.ts:2881-3058',
    'packages/plite-layout/src/index.ts:3059-3105',
    'packages/plite-layout/src/page-mount-plan.ts:36-217',
  ],
  consumers: 'packages/plite-layout/src/react.tsx:474-890',
  lifecycle: 'packages/plite-layout/src/index.ts:3059-3105',
  proof: [
    'packages/plite-layout/test/page-layout-contract.test.ts:1893-2050',
    'packages/plite-layout/test/page-layout-contract.test.ts:2287-2518',
  ],
});

const pliteLayoutGeometry = exact({
  public: 'packages/plite-layout/src/index.ts:108-139',
  owner: [
    'packages/plite-layout/src/index.ts:952-1031',
    'packages/plite-layout/src/index.ts:1077-1160',
  ],
  consumers: 'packages/plite-layout/src/react.tsx:474-890',
  lifecycle: 'packages/plite-layout/src/react.tsx:120-230',
  proof: 'packages/plite-layout/test/page-layout-contract.test.ts:2252-2518',
});

const pliteAnnouncements = exact({
  public: 'packages/plite/src/core/screen-reader-announcement.ts:4-28',
  owner: [
    'packages/plite-react/src/components/editor-announcement-live-region.tsx:28-95',
    'packages/plite-react/src/components/plite.tsx:952-970',
  ],
  consumers: 'packages/plite-react/src/components/plite.tsx:952-970',
  lifecycle:
    'packages/plite-react/src/components/editor-announcement-live-region.tsx:51-80',
  proof: [
    'packages/plite/test/screen-reader-announcement-contract.ts:12-48',
    'packages/plite-react/test/screen-reader-announcement.test.tsx:20-158',
  ],
});

const pliteDomCoverage = exact({
  public: [
    'packages/plite-dom/src/plugin/dom-coverage.ts:32-164',
    'packages/plite-react/src/components/editable-text-blocks.tsx:148-220',
  ],
  owner: [
    'packages/plite-dom/src/plugin/dom-coverage.ts:166-210',
    'packages/plite-dom/src/plugin/dom-coverage.ts:570-680',
    'packages/plite-react/src/components/dom-coverage-boundary.tsx:44-225',
  ],
  consumers:
    'packages/plite-react/src/components/editable-text-blocks.tsx:235-330',
  lifecycle:
    'packages/plite-react/src/components/dom-coverage-boundary.tsx:97-127',
  proof: [
    'packages/plite-react/test/dom-coverage-boundary-contract.tsx:416-477',
    'packages/plite-react/test/dom-coverage-boundary-contract.tsx:543-708',
    'packages/plite-react/test/dom-strategy-and-scroll.tsx:415-496',
  ],
});

const plateDomCoverage = partial({
  covers: [
    'packages/core/src/lib/types/EditableProps.ts:12-38',
    'packages/core/src/react/components/PlateContent.tsx:127-214',
  ],
  missingEvidence: sourceCoverage.plate,
  proof: 'apps/www/src/registry/examples/huge-document-demo.tsx:521-551',
});

const wordgardHyperscript = partial({
  covers: [
    '../wordgard/test/schema.ts:8-34',
    '../wordgard/test/schema.ts:36-103',
    '../wordgard/test/schema.ts:105-172',
  ],
  missingEvidence: sourceCoverage.wordgard,
  proof: '../wordgard/test/generate.ts:1-99',
});

const pliteHyperscript = exact({
  public: 'packages/plite-hyperscript/src/index.ts:1-17',
  owner: [
    'packages/plite-hyperscript/src/creators.ts:27-105',
    'packages/plite-hyperscript/src/creators.ts:112-246',
    'packages/plite-hyperscript/src/creators.ts:248-341',
  ],
  consumers: 'packages/test-utils/src/jsx.ts:1-33',
  lifecycle: 'packages/plite-hyperscript/src/creators.ts:248-341',
  proof: 'packages/plite-hyperscript/test/smoke-contract.ts:15-89',
});

const plateHyperscript = partial({
  covers: [
    'packages/test-utils/src/jsx.ts:1-33',
    'packages/test-utils/src/jsx.ts:35-151',
    'packages/test-utils/src/jsx.ts:153-222',
  ],
  missingEvidence: sourceCoverage.plate,
  proof: 'packages/test-utils/src/jsx.spec.ts:16-66',
});

export const contractEvidence = Object.freeze({
  'WG-INTEGRATION-NESTED-001': {
    wordgard: wordgardNestedContent,
    plite: pliteNestedContent,
    plate: plateNestedContent,
  },
  'WG-INTEGRATION-NESTED-002A': {
    wordgard: wordgardNestedHistory,
    plite: pliteNestedHistory,
  },
  'WG-INTEGRATION-NESTED-002B': {
    wordgard: wordgardNestedTooltipFlush,
  },
  'WG-APPLICATION-BLAME-001': {
    wordgard: wordgardPersistentBlame,
    plite: pliteStateFieldPrimitive,
    plate: plateSuggestionAttribution,
  },
  'WG-APPLICATION-BLAME-002': {
    wordgard: wordgardBlameDecorations,
    plite: pliteDecorationPrimitive,
  },
  'LOCAL-COMPLETION-LIFECYCLE': { plate: plateCompletionLifecycle },
  'LOCAL-EXTENSION-CAPABILITIES': {
    wordgard: wordgardExtensionCapabilities,
    plite: pliteExtensionCapabilities,
    plate: plateExtensionCapabilities,
  },
  'LOCAL-REACT-HOST': {
    plite: pliteReactHost,
    plate: plateReactHost,
  },
  'LOCAL-LAYOUT-PLAN': {
    wordgard: wordgardTileLayout,
    plite: pliteLayoutPlan,
  },
  'LOCAL-LAYOUT-GEOMETRY': {
    wordgard: wordgardTileLayout,
    plite: pliteLayoutGeometry,
  },
  'LOCAL-A11Y-ANNOUNCEMENTS': { plite: pliteAnnouncements },
  'LOCAL-A11Y-DOM-COVERAGE': {
    plite: pliteDomCoverage,
    plate: plateDomCoverage,
  },
  'LOCAL-HYPERSCRIPT': {
    wordgard: wordgardHyperscript,
    plite: pliteHyperscript,
    plate: plateHyperscript,
  },
});

export const dimensionEvidenceKeys = Object.freeze({
  'WG-INTEGRATION-NESTED-001': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-INTEGRATION-NESTED-002A': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-INTEGRATION-NESTED-002B': [
    ['wordgard.owner', 'wordgard.lifecycle'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-APPLICATION-BLAME-001': [
    ['wordgard.owner'],
    ['wordgard.public'],
    ['wordgard.lifecycle'],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-APPLICATION-BLAME-002': [
    ['wordgard.owner', 'wordgard.lifecycle'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'LOCAL-COMPLETION-LIFECYCLE': [
    ['plate.proof'],
    ['plate.covers'],
    [],
    ['plate.covers'],
    [],
    ['plate.proof'],
  ],
  'LOCAL-EXTENSION-CAPABILITIES': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    [],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'LOCAL-REACT-HOST': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    [],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'LOCAL-LAYOUT-PLAN': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'LOCAL-LAYOUT-GEOMETRY': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'LOCAL-A11Y-ANNOUNCEMENTS': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.lifecycle'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'LOCAL-A11Y-DOM-COVERAGE': [
    ['plite.proof'],
    ['plite.public', 'plate.covers'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'LOCAL-HYPERSCRIPT': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
});

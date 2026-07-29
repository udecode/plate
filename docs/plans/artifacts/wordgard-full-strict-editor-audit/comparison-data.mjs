import { concepts } from './audit-spec.mjs';

const byId = new Map(concepts.map((item) => [item.id, item]));
const rows = [];

const mapping = (status, evidence, reason) =>
  Object.freeze({ evidence, reason, status });

const NA_PLATE = mapping(
  'not-applicable',
  null,
  'Plate product code does not own this substrate responsibility'
);
const NA_PLITE = mapping(
  'not-applicable',
  null,
  'Plite substrate does not own this product or application responsibility'
);

const plite = Object.freeze({
  build: mapping(
    'partial',
    '`package.json:1`; `tooling/scripts/check-plite.mjs:1`',
    'the workspace build and proof graph covers Plite packages'
  ),
  change: mapping(
    'exact',
    '`packages/plite/src/core/change/document-change.ts:634`; `packages/plite/src/core/change/root-change.ts:1`',
    'DocumentChange and RootChange own the canonical change algebra'
  ),
  clipboard: mapping(
    'exact',
    '`packages/plite-dom/src/plugin/dom-clipboard-runtime.ts:1`; `packages/plite-dom/src/plugin/host-codec.ts:98`',
    'DOM clipboard runtime and host codecs own the browser wire boundary'
  ),
  codec: mapping(
    'partial',
    '`packages/plite-dom/src/plugin/host-codec.ts:98`; `packages/plite-dom/src/plugin/dom-html.ts:1`',
    'host codecs own DOM parse and serialization outside core'
  ),
  collab: mapping(
    'partial',
    '`packages/yjs/src/core/extension.ts:92`; `packages/yjs/src/core/change-bridge.ts:37`',
    'Yjs owns synchronization while canonical changes bridge local state'
  ),
  command: mapping(
    'exact',
    '`packages/plite/src/core/command-definition.ts:77`; `packages/plite/src/core/command-registry.ts:153`',
    'named command descriptors and typed handlers own dispatch'
  ),
  correction: mapping(
    'exact',
    '`packages/plite/src/core/correction.ts:1`; `packages/plite/src/core/change-events.ts:1`',
    'changed-target correction worklists own invariant repair'
  ),
  decoration: mapping(
    'exact',
    '`packages/plite-react/src/decoration-source.ts:17`; `packages/plite-react/src/mapped-view-store.ts:28`',
    'typed view sources share a mapped store kernel'
  ),
  dom: mapping(
    'exact',
    '`packages/plite-dom/src/plugin/dom-editor.ts:112`; `packages/plite-dom/src/plugin/dom-root-runtime.ts:185`',
    'root-aware DOM capability and runtime owners perform the same job'
  ),
  effects: mapping(
    'exact',
    '`packages/plite/src/core/transaction-values.ts:38`; `packages/plite/src/core/value-codec.ts:382`',
    'typed effects, annotations, mapping, codecs, history, and collaboration policy are explicit'
  ),
  extension: mapping(
    'exact',
    '`packages/plite/src/core/editor-extension.ts:633`; `packages/plite/src/core/extension-registry.ts:701`',
    'named extensions compile and publish through one registry'
  ),
  facet: mapping(
    'exact',
    '`packages/plite/src/core/facet.ts:203`; `packages/plite/src/interfaces/editor.ts:327`',
    'facets use declared document, field, selection, or facet dependencies'
  ),
  fault: mapping(
    'exact',
    '`packages/plite-react/src/mapped-view-store.ts:149`; `packages/plite/src/core/editor-extension.ts:1033`',
    'view sources isolate faults and extension lifecycle rolls back or deactivates deterministically'
  ),
  history: mapping(
    'exact',
    '`packages/plite-history/src/history-extension.ts:613`; `packages/plite-history/src/history.ts:40`',
    'the history extension owns batching, mapping, effects, selection, and persistence'
  ),
  input: mapping(
    'exact',
    '`packages/plite-react/src/editable/editing-kernel.ts:50`; `packages/plite-react/src/editable/input-router.ts:1`',
    'the editing kernel and input router assign event ownership explicitly'
  ),
  locations: mapping(
    'exact',
    '`packages/plite/src/interfaces/location.ts:1`; `packages/plite/src/core/change/document-index.ts:1`',
    'root-aware paths, points, ranges, and indexes own location resolution'
  ),
  nodes: mapping(
    'exact',
    '`packages/plite/src/interfaces/node.ts:1`; `packages/plite/src/interfaces/editor.ts:151`',
    'plain structural JSON nodes and multi-root values own document representation'
  ),
  package: mapping(
    'exact',
    '`packages/plite/package.json:1`; `packages/plite-react/package.json:1`',
    'independent substrate, host, React, history, and collaboration entrypoints are explicit'
  ),
  proof: mapping(
    'exact',
    '`packages/browser/src/core/first-party-browser-contracts.ts:1`; `tooling/scripts/check-plite.mjs:1`',
    'owner-local suites and the browser/release graph cover this responsibility'
  ),
  query: mapping(
    'exact',
    '`packages/plite/src/core/editor-query-runtime.ts:142`; `packages/plite/src/editor/nodes.ts:1`',
    'immutable root-aware read APIs and indexes own traversal'
  ),
  react: mapping(
    'exact',
    '`packages/plite-react/src/components/editable.tsx:1`; `packages/plite-react/src/editable/editable-dom-runtime.ts:184`',
    'React rendering and mounted DOM runtime own the interactive view'
  ),
  scheduler: mapping(
    'exact',
    '`packages/plite-dom/src/plugin/dom-phase-scheduler.ts:109`; `packages/plite-dom/src/plugin/dom-phase-scheduler.ts:484`',
    'one mounted-root scheduler orders model, read, write, and repair phases'
  ),
  schema: mapping(
    'exact',
    '`packages/plite/src/core/schema-compiler.ts:280`; `packages/plite/src/interfaces/schema.ts:243`',
    'the compiled structural schema owns identity, defaults, validation, and wrapping'
  ),
  selection: mapping(
    'exact',
    '`packages/plite/src/core/selection-protocol.ts:52`; `packages/plite/src/interfaces/selection.ts:1`',
    'structural selection descriptors own mapping, validation, and versioned persistence'
  ),
  slice: mapping(
    'exact',
    '`packages/plite/src/core/content-slice.ts:15`; `packages/plite/src/core/slice-fit/compiled-slice-fitter.ts:227`',
    'ContentSlice preserves open context and the compiled fitter validates insertion once'
  ),
  snapshot: mapping(
    'exact',
    '`packages/plite/src/core/snapshot-index.ts:1`; `packages/plite/src/core/change/document-index.ts:1`',
    'snapshot-local lazy indexes replace global retained position arrays'
  ),
  state: mapping(
    'exact',
    '`packages/plite/src/core/public-state.ts:1`; `packages/plite/src/core/editor-lifecycle-api.ts:318`',
    'immutable state views and atomic update publication own the lifecycle'
  ),
  stateField: mapping(
    'exact',
    '`packages/plite/src/core/state-field.ts:20`; `packages/plite/src/core/value-codec.ts:299`',
    'named fields define transitions and versionable persistence codecs'
  ),
  text: mapping(
    'exact',
    '`packages/plite/src/text-units.ts:1`; `packages/plite-react/src/editable/caret-engine.ts:49`',
    'Unicode text units and host-aware caret movement own motion'
  ),
  transaction: mapping(
    'exact',
    '`packages/plite/src/interfaces/editor.ts:1093`; `packages/plite/src/core/editor-lifecycle-api.ts:318`',
    'pure transaction specs build before one atomic publication'
  ),
  viewProjection: mapping(
    'exact',
    '`packages/plite-react/src/projection-store.ts:31`; `packages/plite-react/src/projection-graph.ts:331`',
    'projection stores and graphs own invalidation and partial-view mapping'
  ),
});

const plate = Object.freeze({
  block: mapping(
    'exact',
    '`packages/core/src/lib/plugins/paragraph/BaseParagraphPlugin.ts:1`; `packages/basic-nodes/src/index.ts:1`',
    'Plate feature plugins own block and mark policy'
  ),
  build: mapping(
    'partial',
    '`package.json:1`; `packages/plate/package.json:1`',
    'the workspace publishes independent product packages and validates them together'
  ),
  codec: mapping(
    'exact',
    '`packages/core/src/internal/plugin/compilePlateCodecs.ts:1`; `packages/core/src/lib/plugins/html/HtmlPlugin.ts:1`',
    'compiled product codecs own MIME and HTML claims'
  ),
  command: mapping(
    'partial',
    '`packages/core/src/lib/plugin/getEditorPlugin.ts:126`; `packages/core/src/lib/plugin/pluginAuthoringContext.ts:8`',
    'plugin transaction groups and host APIs bind semantic commands to product behavior'
  ),
  docs: mapping(
    'exact',
    '`content/docs/(guides)/feature-kits.mdx:18`; `apps/www/src/registry/components/editor/editor-kit.tsx:1`',
    'current docs and copied registry kits teach complete product composition'
  ),
  event: mapping(
    'exact',
    '`packages/core/src/react/components/EditorShortcutDispatcher.tsx:1`; `packages/core/src/react/plugin/PlatePlugin.ts:893`',
    'React host plugins own shortcut and DOM event routing'
  ),
  inputRule: mapping(
    'exact',
    '`packages/core/src/lib/plugins/input-rules/InputRulesPlugin.ts:20`; `packages/core/src/internal/plugin/resolvePlugins.ts:1108`',
    'Plate compiles product input rules with stable local ordering'
  ),
  link: mapping(
    'exact',
    '`packages/link/src/lib/BaseLinkPlugin.ts:137`; `packages/link/src/react/LinkPlugin.tsx:1`',
    'the link package owns link schema, editing, floating UI, and React behavior'
  ),
  list: mapping(
    'exact',
    '`packages/list/src/lib/BaseListPlugin.tsx:175`; `packages/list/src/react/ListPlugin.tsx:1`',
    'the list package owns flat-list semantics and UI'
  ),
  media: mapping(
    'exact',
    '`packages/media/src/lib/media/MediaPlugin.internal.ts:1`; `packages/resizable/src/index.ts:1`',
    'media, upload, caption, and resize packages own product policy'
  ),
  package: mapping(
    'exact',
    '`packages/plate/package.json:1`; `packages/core/package.json:1`',
    'public product packages and the umbrella package expose explicit entrypoints'
  ),
  proof: mapping(
    'exact',
    '`packages/test-utils/src/index.ts:1`; `apps/www/src/__tests__/package-integration/autoformat/current-kit.slow.tsx:1`',
    'owner-local and product integration tests cover Plate behavior'
  ),
  react: mapping(
    'exact',
    '`packages/core/src/react/components/Plate.tsx:193`; `packages/core/src/react/components/PlateContent.tsx:19`',
    'Plate owns product context, editable presentation, and React render slots'
  ),
  schema: mapping(
    'exact',
    '`packages/core/src/internal/plugin/compilePlateModel.ts:60`; `packages/core/src/lib/plugin/PluginConfig.ts:396`',
    'plugin schema declarations compile into one Plite model'
  ),
  table: mapping(
    'exact',
    '`packages/table/src/lib/BaseTablePlugin.ts:495`; `packages/table/src/lib/internal/mutation.ts:1`',
    'the table package owns grid, paste, selection, correction, commands, and UI'
  ),
  ui: mapping(
    'exact',
    '`apps/www/src/registry/ui/toolbar.tsx:1`; `packages/floating/src/index.ts:1`',
    'copy-owned React controls and floating primitives own product UI'
  ),
});

const comparisonProfiles = Object.freeze({
  equivalent: {
    classification: 'equivalent',
    dimensions: {
      api: [
        'equivalent',
        'both expose the small mechanism without caller friction',
      ],
      correctness: ['equivalent', 'the same invariant is enforced'],
      data: [
        'equivalent',
        'neither changes the document or collaboration model',
      ],
      ownership: [
        'equivalent',
        'the helper remains private to its owning package',
      ],
      proof: ['equivalent', 'ordinary owner-local tests are sufficient'],
      runtime: ['equivalent', 'cost is negligible beside editor work'],
    },
    preferred: 'tie',
  },
  plate: {
    classification: 'Plate stronger',
    dimensions: {
      api: [
        'Plate stronger',
        'typed plugin descriptors compose with copied React UI',
      ],
      correctness: [
        'Plate stronger',
        'the product owner covers more applicable behavior',
      ],
      data: [
        'Plate stronger',
        'plain JSON and Plite transactions remain canonical',
      ],
      ownership: [
        'Plate stronger',
        'feature policy stays in its dedicated product package',
      ],
      proof: [
        'Plate stronger',
        'package, integration, and browser rows cover the product surface',
      ],
      runtime: [
        'Plate stronger',
        'compiled plugin caches and targeted updates avoid a monolithic view owner',
      ],
    },
    preferred: 'Plate',
  },
  plite: {
    classification: 'Plite stronger',
    dimensions: {
      api: [
        'Plite stronger',
        'structural types and named descriptors infer callers without nominal identity',
      ],
      correctness: [
        'Plite stronger',
        'canonical root-aware invariants cover the applicable local constraints',
      ],
      data: [
        'Plite stronger',
        'JSON-native multi-root data composes with versioned persistence and Yjs',
      ],
      ownership: [
        'Plite stronger',
        'substrate, host, React, history, and collaboration owners remain explicit',
      ],
      proof: [
        'Plite stronger',
        'owner-local, property, browser, and release contracts are broader',
      ],
      runtime: [
        'Plite stronger',
        'changed-scope indexes and atomic publication avoid global retained state',
      ],
    },
    preferred: 'Plite',
  },
  reference: {
    classification: 'reference stronger',
    dimensions: {
      api: [
        'reference stronger',
        'typed phrase references and partial translations form one compact API',
      ],
      correctness: [
        'reference stronger',
        'one phrase owner prevents label drift across built-in controls',
      ],
      data: [
        'equivalent',
        'localized strings do not alter editor document semantics',
      ],
      ownership: [
        'reference stronger',
        'the reference has a named localization owner while Plate relies on copied app UI',
      ],
      proof: [
        'insufficient evidence',
        'neither side has a dedicated localization conformance suite',
      ],
      runtime: ['equivalent', 'lookup and merge costs are immaterial'],
    },
    preferred: 'reference',
  },
  stack: {
    classification: 'Plite/Plate stack stronger',
    dimensions: {
      api: [
        'Plite/Plate stack stronger',
        'host-neutral substrate APIs and product descriptors stay typed separately',
      ],
      correctness: [
        'Plite/Plate stack stronger',
        'the combined owners cover broader editor and product constraints',
      ],
      data: [
        'Plite/Plate stack stronger',
        'JSON-native multi-root changes remain canonical through product behavior',
      ],
      ownership: [
        'Plite/Plate stack stronger',
        'substrate, host, and product responsibilities have independent owners',
      ],
      proof: [
        'Plite/Plate stack stronger',
        'package, integration, browser, and release proof cover both layers',
      ],
      runtime: [
        'Plite/Plate stack stronger',
        'compiled registries and changed-scope updates avoid one universal runtime',
      ],
    },
    preferred: 'Plite/Plate stack',
  },
  tradeoff: {
    classification: 'different tradeoff',
    dimensions: {
      api: [
        'different tradeoff',
        'compact single-package APIs trade breadth for fewer boundaries',
      ],
      correctness: [
        'different tradeoff',
        'each implementation is sound inside a different host contract',
      ],
      data: [
        'Plite stronger',
        'the local stack retains structural multi-root JSON',
      ],
      ownership: [
        'different tradeoff',
        'one integrated owner is simpler while local boundaries support more hosts',
      ],
      proof: [
        'Plite/Plate stack stronger',
        'the local stack tests more hosts and integration boundaries',
      ],
      runtime: [
        'insufficient evidence',
        'no common benchmark isolates the architectural choice',
      ],
    },
    preferred: 'different tradeoff',
  },
  unknownRenderer: {
    classification: 'insufficient evidence',
    dimensions: {
      api: [
        'different tradeoff',
        'imperative tiles and React components serve different consumers',
      ],
      correctness: [
        'different tradeoff',
        'both preserve composition and mounted identity under different render contracts',
      ],
      data: [
        'Plite stronger',
        'the React owner remains root-aware over structural JSON',
      ],
      ownership: [
        'Plite/Plate stack stronger',
        'React and product rendering do not duplicate model ownership',
      ],
      proof: [
        'Plite/Plate stack stronger',
        'local browser and integration proof is broader',
      ],
      runtime: [
        'insufficient evidence',
        'no shared huge-document benchmark compares tile reuse with current virtualization',
      ],
    },
    preferred: 'insufficient evidence',
  },
  bidiTradeoff: {
    classification: 'different tradeoff',
    dimensions: {
      api: [
        'Plite stronger',
        'logical units and host caret policy do not expose a custom bidi engine',
      ],
      correctness: [
        'different tradeoff',
        'deterministic spans and browser geometry cover different bidi edge cases',
      ],
      data: [
        'equivalent',
        'both keep bidi state outside serialized document data',
      ],
      ownership: [
        'Plite stronger',
        'platform geometry stays in the DOM and React host',
      ],
      proof: [
        'Plite stronger',
        'browser contracts cover native caret behavior across engines',
      ],
      runtime: [
        'insufficient evidence',
        'custom span computation and browser geometry lack a common benchmark',
      ],
    },
    preferred: 'different tradeoff',
  },
});

const add = (
  ids,
  {
    plateMapping,
    pliteMapping,
    priority = '—',
    profile,
    verdict = 'keep',
    verdictReason,
    dimensions,
  }
) => {
  for (const id of ids) {
    const definition = byId.get(id);
    if (!definition) throw new Error(`unknown comparison concept ${id}`);
    const selected = comparisonProfiles[profile];

    rows.push({
      ...definition,
      classification: selected.classification,
      dimensions: { ...selected.dimensions, ...dimensions },
      plate: plateMapping,
      plite: pliteMapping,
      preferred: selected.preferred,
      priority,
      verdict,
      verdictReason:
        verdictReason ??
        (verdict === 'keep'
          ? 'the local owner already covers the applicable job'
          : 'the reference mechanism does not justify local adoption'),
    });
  }
};

add(['WG-META-001'], {
  plateMapping: plate.package,
  pliteMapping: plite.package,
  profile: 'tradeoff',
});
add(['WG-META-002', 'WG-META-003', 'WG-META-005'], {
  plateMapping: plate.build,
  pliteMapping: plite.build,
  profile: 'stack',
});
add(['WG-META-004'], {
  plateMapping: plate.docs,
  pliteMapping: mapping(
    'partial',
    '`apps/plite/src/app/page.tsx:1`; `docs/plite/agent-start.md:1`',
    'the Plite app and docs teach substrate behavior'
  ),
  profile: 'plate',
});

add(['WG-CMD-001'], {
  plateMapping: plate.command,
  pliteMapping: plite.command,
  profile: 'plite',
  verdict: 'reject',
  verdictReason:
    'keep named descriptors; reject callable identity and bypassable interception',
});
add(['WG-CMD-002'], {
  plateMapping: plate.command,
  pliteMapping: plite.command,
  profile: 'stack',
});
add(['WG-CMD-003A', 'WG-CMD-003E'], {
  plateMapping: mapping(
    'partial',
    '`packages/core/src/lib/editor/withPlite.ts:1`',
    'Plate binds generic edits to the product editor'
  ),
  pliteMapping: mapping(
    'exact',
    '`packages/plite/src/core/editor-commands.ts:1`; `packages/plite/src/transforms-text/delete-text.ts:1`',
    'core command and text-transform owners implement the same operations'
  ),
  profile: 'plite',
});
add(['WG-CMD-003B', 'WG-CMD-003D'], {
  plateMapping: plate.block,
  pliteMapping: mapping(
    'partial',
    '`packages/plite/src/transforms-node/wrap-nodes.ts:1`; `packages/plite/src/editor/toggle-mark.ts:1`',
    'generic structural and mark transactions provide the substrate operations'
  ),
  profile: 'stack',
});
add(['WG-CMD-003C'], {
  plateMapping: plate.list,
  pliteMapping: mapping(
    'partial',
    '`packages/plite/src/transforms-node/wrap-nodes.ts:1`; `packages/plite/src/transforms-node/unwrap-nodes.ts:1`',
    'generic transforms support list policy without owning it'
  ),
  profile: 'plate',
});
add(['WG-CMD-004'], {
  plateMapping: plate.ui,
  pliteMapping: mapping(
    'partial',
    '`packages/plite/src/core/command-definition.ts:77`',
    'command metadata exists but product menus remain outside Plite'
  ),
  profile: 'plate',
});

add(['WG-COLLAB-001', 'WG-COLLAB-002'], {
  plateMapping: NA_PLATE,
  pliteMapping: plite.collab,
  profile: 'plite',
  verdict: 'reject',
  verdictReason:
    'keep canonical changes plus Yjs; reject a second central-authority OT protocol',
});

add(['WG-DOC-001', 'WG-DOC-002'], {
  plateMapping: mapping(
    'partial',
    '`packages/core/src/lib/plugin/PluginConfig.ts:396`',
    'Plate contributes product schema vocabulary'
  ),
  pliteMapping: plite.nodes,
  profile: 'plite',
  verdict: 'reject',
  verdictReason:
    'keep structural JSON and reject nominal node or root identity',
});
add(['WG-DOC-003'], {
  plateMapping: plate.block,
  pliteMapping: mapping(
    'exact',
    '`packages/plite/src/editor/marks.ts:1`; `packages/plite/src/editor/toggle-mark.ts:1`',
    'structural text properties and mark transforms own the same semantics'
  ),
  profile: 'stack',
});
add(['WG-DOC-004', 'WG-DOC-005'], {
  plateMapping: plate.schema,
  pliteMapping: plite.schema,
  profile: 'stack',
});
add(['WG-DOC-006'], {
  plateMapping: NA_PLATE,
  pliteMapping: plite.locations,
  profile: 'plite',
  verdict: 'reject',
  verdictReason:
    'keep root-aware structural locations and reject public global token offsets',
});
add(['WG-DOC-007'], {
  plateMapping: NA_PLATE,
  pliteMapping: plite.snapshot,
  profile: 'plite',
  dimensions: {
    runtime: [
      'insufficient evidence',
      'snapshot indexes avoid retention risk but no common position-resolution benchmark exists',
    ],
  },
  verdict: 'reject',
  verdictReason:
    'keep snapshot-local indexes; reject a strong global document cache without benchmark proof',
});
add(['WG-DOC-008', 'WG-DOC-012'], {
  plateMapping: mapping(
    'partial',
    '`packages/core/src/internal/plugin/compilePlateModel.ts:60`',
    'Plate supplies product schema and codec inputs to fitting'
  ),
  pliteMapping: plite.slice,
  profile: 'stack',
});
add(['WG-DOC-009', 'WG-DOC-010', 'WG-DOC-011'], {
  plateMapping: NA_PLATE,
  pliteMapping: plite.change,
  profile: 'plite',
});
add(['WG-DOC-013'], {
  plateMapping: plate.schema,
  pliteMapping: mapping(
    'exact',
    '`packages/plite/src/core/schema-validation.ts:1`; `packages/plite/src/core/change/document-change.ts:1155`',
    'structural validators and versioned canonical JSON own persistence'
  ),
  profile: 'stack',
});
add(['WG-DOC-014', 'WG-DOC-015', 'WG-DOC-016'], {
  plateMapping: plate.codec,
  pliteMapping: plite.codec,
  profile: 'stack',
  verdict: 'reject',
  verdictReason:
    'keep host-owned compiled codecs and reject DOM types in Plite core',
});
add(['WG-DOC-017'], {
  plateMapping: NA_PLATE,
  pliteMapping: mapping(
    'exact',
    '`packages/plite/src/utils/deep-equal.ts:1`; `packages/plite/src/core/schema-validation.ts:1`',
    'small private equality and validation helpers perform the same job'
  ),
  profile: 'equivalent',
});
add(['WG-DOC-018'], {
  plateMapping: NA_PLATE,
  pliteMapping: plite.query,
  profile: 'plite',
});

add(['WG-HIST-001', 'WG-HIST-002', 'WG-HIST-003'], {
  plateMapping: mapping(
    'partial',
    '`packages/core/src/lib/plugins/HistoryPlugin.ts:5`',
    'Plate installs and exposes the history extension'
  ),
  pliteMapping: plite.history,
  profile: 'plite',
});

add(
  [
    'WG-PRODUCT-001A',
    'WG-PRODUCT-001B',
    'WG-PRODUCT-002',
    'WG-PRODUCT-003A',
    'WG-PRODUCT-003B',
  ],
  {
    plateMapping: plate.block,
    pliteMapping: plite.schema,
    profile: 'plate',
  }
);
add(
  ['WG-PRODUCT-001C', 'WG-PRODUCT-003E', 'WG-PRODUCT-004A', 'WG-PRODUCT-004B'],
  {
    plateMapping: plate.media,
    pliteMapping: plite.schema,
    profile: 'plate',
  }
);
add(['WG-PRODUCT-001D'], {
  plateMapping: plate.table,
  pliteMapping: plite.schema,
  profile: 'plate',
});
add(['WG-PRODUCT-003C'], {
  plateMapping: plate.list,
  pliteMapping: plite.schema,
  profile: 'plate',
});
add(['WG-PRODUCT-003D'], {
  plateMapping: plate.link,
  pliteMapping: plite.schema,
  profile: 'plate',
});
add(['WG-PRODUCT-004C'], {
  plateMapping: plate.ui,
  pliteMapping: NA_PLITE,
  profile: 'plate',
});

add(['WG-PROOF-001', 'WG-PROOF-002'], {
  plateMapping: plate.proof,
  pliteMapping: plite.proof,
  profile: 'plite',
});
add(['WG-PROOF-003'], {
  plateMapping: plate.proof,
  pliteMapping: mapping(
    'partial',
    '`packages/plite/test/document-change-laws.test.ts:1`',
    'generic schema, selection, fitting, and change tests support table behavior'
  ),
  profile: 'plate',
});
add(['WG-PROOF-004'], {
  plateMapping: plate.proof,
  pliteMapping: plite.proof,
  priority: 'P2',
  profile: 'stack',
  dimensions: {
    proof: [
      'insufficient evidence',
      'browser coverage is broad but raw-device iOS swipe and Android Enter or Backspace traces remain absent',
    ],
  },
  verdictReason:
    'keep the local browser graph and add the named raw-device phase proof',
});

add(['WG-STATE-001'], {
  plateMapping: mapping(
    'partial',
    '`packages/core/src/internal/plugin/compilePlateModel.ts:60`',
    'Plate publishes the compiled product model through Plite'
  ),
  pliteMapping: plite.state,
  profile: 'plite',
});
add(['WG-STATE-002'], {
  plateMapping: mapping(
    'partial',
    '`packages/core/src/lib/plugin/BasePlugin.ts:854`',
    'Plate plugins install typed state and transaction groups'
  ),
  pliteMapping: plite.stateField,
  profile: 'plite',
});
add(['WG-STATE-003'], {
  plateMapping: NA_PLATE,
  pliteMapping: plite.facet,
  profile: 'plite',
  verdict: 'reject',
  verdictReason:
    'keep declared dependencies and reject runtime access discovery',
});
add(['WG-STATE-004', 'WG-STATE-005'], {
  plateMapping: plate.schema,
  pliteMapping: plite.extension,
  profile: 'stack',
  verdict: 'reject',
  verdictReason:
    'keep named conflicts and atomic slots; reject identity dedupe and shared priority bands',
});
add(['WG-STATE-006'], {
  plateMapping: plate.command,
  pliteMapping: plite.transaction,
  profile: 'plite',
});
add(['WG-STATE-007'], {
  plateMapping: plate.command,
  pliteMapping: plite.extension,
  profile: 'plite',
  verdict: 'reject',
  verdictReason:
    'keep typed command, correction, and lifecycle owners; reject universal post-hoc transaction hooks',
});
add(['WG-STATE-008'], {
  plateMapping: mapping(
    'partial',
    '`packages/core/src/internal/plugin/compilePlateModel.ts:60`',
    'Plate contributes product correction descriptors'
  ),
  pliteMapping: plite.correction,
  profile: 'plite',
});
add(['WG-STATE-009', 'WG-STATE-010'], {
  plateMapping: mapping(
    'partial',
    '`packages/selection/src/react/BlockSelectionPlugin.tsx:136`; `packages/table/src/lib/BaseTablePlugin.ts:495`',
    'Plate installs block and cell selection kinds'
  ),
  pliteMapping: plite.selection,
  profile: 'plite',
});
add(['WG-STATE-011', 'WG-STATE-014'], {
  plateMapping: NA_PLATE,
  pliteMapping: plite.text,
  profile: 'plite',
});
add(['WG-STATE-012'], {
  plateMapping: mapping(
    'partial',
    '`apps/www/src/registry/registry.ts:1`',
    'copied product controls own their labels without one typed phrase registry'
  ),
  pliteMapping: NA_PLITE,
  profile: 'reference',
  verdict: 'reject',
  verdictReason:
    'the reference API is better in isolation, but reusable product localization belongs to copied app UI, not Plite or Plate core',
});
add(['WG-STATE-013'], {
  plateMapping: NA_PLATE,
  pliteMapping: plite.text,
  profile: 'bidiTradeoff',
  verdict: 'defer',
  verdictReason:
    'keep platform-backed caret ownership; reopen custom bidi only with failing browser cases and a benchmark',
});
add(['WG-STATE-015'], {
  plateMapping: mapping(
    'partial',
    '`packages/core/src/lib/plugin/BasePlugin.ts:854`',
    'Plate plugins declare effect and transaction policy'
  ),
  pliteMapping: plite.effects,
  profile: 'plite',
});

add(
  [
    'WG-TABLE-001',
    'WG-TABLE-002',
    'WG-TABLE-003',
    'WG-TABLE-004',
    'WG-TABLE-005',
  ],
  {
    plateMapping: plate.table,
    pliteMapping: mapping(
      'partial',
      '`packages/plite/src/core/schema-compiler.ts:280`; `packages/plite/src/core/selection-protocol.ts:52`',
      'generic schema, correction, and selection protocols support the table owner'
    ),
    profile: 'plate',
  }
);
add(['WG-TABLE-006'], {
  plateMapping: plate.table,
  pliteMapping: plite.slice,
  profile: 'stack',
});
add(['WG-TABLE-007'], {
  plateMapping: plate.ui,
  pliteMapping: NA_PLITE,
  profile: 'plate',
});

add(['WG-VIEW-001'], {
  plateMapping: plate.react,
  pliteMapping: plite.react,
  profile: 'stack',
});
add(['WG-VIEW-002'], {
  plateMapping: NA_PLATE,
  pliteMapping: plite.scheduler,
  profile: 'plite',
});
add(['WG-VIEW-003'], {
  plateMapping: mapping(
    'partial',
    '`packages/core/src/react/components/Plate.tsx:193`',
    'Plate consumes commit-derived React projections'
  ),
  pliteMapping: plite.viewProjection,
  profile: 'plite',
});
add(['WG-VIEW-004'], {
  plateMapping: plate.react,
  pliteMapping: plite.react,
  profile: 'unknownRenderer',
  verdict: 'defer',
  verdictReason:
    'do not add a second renderer without a non-React consumer and comparative benchmark',
});
add(['WG-VIEW-005A', 'WG-VIEW-005B', 'WG-VIEW-005C'], {
  plateMapping: mapping(
    'partial',
    '`packages/core/src/react/utils/pluginRenderElement.tsx:1`',
    'Plate plugins supply product decorations and wrappers'
  ),
  pliteMapping: plite.decoration,
  profile: 'plite',
});
add(
  [
    'WG-VIEW-006A',
    'WG-VIEW-006B',
    'WG-VIEW-007',
    'WG-VIEW-008A',
    'WG-VIEW-008B',
  ],
  {
    plateMapping: mapping(
      'partial',
      '`packages/core/src/lib/plugins/dom/DOMPlugin.ts:37`',
      'Plate exposes host DOM capability to product plugins'
    ),
    pliteMapping: plite.dom,
    profile: 'plite',
  }
);
add(['WG-VIEW-009'], {
  plateMapping: mapping(
    'partial',
    '`packages/core/src/react/components/PlateContent.tsx:19`',
    'Plate installs the editable host'
  ),
  pliteMapping: plite.input,
  priority: 'P2',
  profile: 'plite',
  dimensions: {
    proof: [
      'insufficient evidence',
      'desktop and viewport rows are broad but raw-device virtual-keyboard phase traces remain absent',
    ],
  },
  verdictReason:
    'keep the local editing kernel and close the raw-device phase proof',
});
add(['WG-VIEW-010A'], {
  plateMapping: mapping(
    'partial',
    '`packages/core/src/react/components/PlateContent.tsx:19`',
    'Plate mounts the React editable host'
  ),
  pliteMapping: plite.input,
  profile: 'plite',
});
add(['WG-VIEW-010B'], {
  plateMapping: plate.event,
  pliteMapping: plite.input,
  priority: 'P2',
  profile: 'stack',
  dimensions: {
    proof: [
      'insufficient evidence',
      'no raw-device trace proves selective keydown versus beforeinput routing for iOS swipe and Android virtual keys',
    ],
  },
  verdictReason:
    'keep selective event ownership and add exactly-once raw-device proof',
});
add(['WG-VIEW-010C'], {
  plateMapping: mapping(
    'exact',
    '`packages/dnd/src/DndPlugin.tsx:45`; `packages/core/src/react/components/PlateContent.tsx:19`',
    'Plate owns product drag and drop while the host owns clipboard events'
  ),
  pliteMapping: plite.input,
  profile: 'stack',
});
add(['WG-VIEW-011'], {
  dimensions: {
    proof: [
      'insufficient evidence',
      'package tests pass, but the strict clipboard benchmark currently fails because its initial codec callback expects unavailable getOptions context',
    ],
  },
  plateMapping: plate.codec,
  pliteMapping: plite.clipboard,
  priority: 'P1',
  profile: 'stack',
  verdictReason:
    'keep the local clipboard architecture and repair the stale strict benchmark contract',
});
add(['WG-VIEW-012A'], {
  plateMapping: plate.event,
  pliteMapping: mapping(
    'partial',
    '`packages/plite-dom/src/utils/hotkeys.ts:1`; `packages/plite-react/src/editable/runtime-keyboard-events.ts:1`',
    'host hotkey matching and keyboard runtime support product shortcuts'
  ),
  profile: 'stack',
});
add(['WG-VIEW-012B'], {
  plateMapping: plate.inputRule,
  pliteMapping: mapping(
    'partial',
    '`packages/plite/src/core/command-definition.ts:77`',
    'pure command construction supports input-rule results'
  ),
  profile: 'plate',
});
add(['WG-VIEW-012C'], {
  plateMapping: plate.event,
  pliteMapping: mapping(
    'partial',
    '`packages/plite-react/src/editable/runtime-event-engine.ts:69`',
    'the host event engine provides generic event ownership'
  ),
  profile: 'stack',
});
add(['WG-VIEW-013'], {
  plateMapping: plate.react,
  pliteMapping: mapping(
    'partial',
    '`packages/plite-react/src/components/editable.tsx:1`',
    'the React editable accepts host attributes and presentation'
  ),
  profile: 'plate',
});
add(['WG-VIEW-014A', 'WG-VIEW-014B', 'WG-VIEW-014C', 'WG-VIEW-015'], {
  plateMapping: plate.ui,
  pliteMapping: NA_PLITE,
  profile: 'plate',
});
add(['WG-VIEW-016'], {
  plateMapping: mapping(
    'partial',
    '`packages/core/src/lib/plugins/debug/DebugPlugin.ts:1`',
    'Plate exposes product diagnostics'
  ),
  pliteMapping: plite.fault,
  profile: 'plite',
});

const duplicates = rows
  .map(({ id }) => id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);
const missing = concepts
  .map(({ id }) => id)
  .filter((id) => !rows.some((row) => row.id === id));

if (duplicates.length > 0 || missing.length > 0) {
  throw new Error(
    `comparison coverage failed: duplicates=${duplicates.join(
      ','
    )} missing=${missing.join(',')}`
  );
}

export const comparisonRows = Object.freeze(rows);

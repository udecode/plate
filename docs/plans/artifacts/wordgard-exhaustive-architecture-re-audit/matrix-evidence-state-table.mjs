/**
 * Direct comparison evidence for the state, history, table, and collaboration
 * audit lanes. Partial contracts name the direct covered surface and retain a
 * separate coverage-only locator for the unmatched surface.
 */
export const contractEvidence = Object.freeze({
  'WG-COLLAB-001': {
    wordgard: {
      public: ['../wordgard/src/collab/collab.ts:7-80'],
      owner: ['../wordgard/src/collab/collab.ts:81-160'],
      consumers: ['../wordgard/test/test-collab.ts:1-120'],
      lifecycle: ['../wordgard/src/collab/collab.ts:161-243'],
      proof: ['../wordgard/test/test-collab.ts:1-120'],
    },
    plite: {
      public: ['packages/yjs/src/core/extension.ts:17-80'],
      owner: ['packages/yjs/src/core/extension.ts:81-160'],
      consumers: ['packages/yjs/test/schema-identity-contract.spec.ts:1-120'],
      lifecycle: ['packages/yjs/src/core/extension.ts:161-222'],
      proof: [
        'packages/yjs/test/schema-identity-contract.spec.ts:1-120',
        'packages/plite/test/collab-document-state-contract.ts:76-140',
      ],
    },
  },
  'WG-COLLAB-002A': {
    wordgard: {
      public: ['../wordgard/src/doc/change.ts:245-274'],
      owner: ['../wordgard/src/doc/change.ts:541-545'],
      consumers: ['../wordgard/test/test-change.ts:366-451'],
      lifecycle: ['../wordgard/src/doc/change.ts:727-790'],
      proof: ['../wordgard/test/test-change.ts:366-451'],
    },
    plite: {
      public: ['packages/plite/src/core/change/document-change.ts:901-978'],
      owner: ['packages/plite/src/core/change/root-change.ts:1649-1656'],
      consumers: ['packages/plite/test/document-change-laws.test.ts:655-770'],
      lifecycle: ['packages/plite/src/core/change/root-change.ts:1835-1922'],
      proof: [
        'packages/plite/test/document-change-laws.test.ts:431-435',
        'packages/plite/test/document-change-laws.test.ts:655-770',
      ],
    },
  },
  'WG-COLLAB-002B': {
    wordgard: {
      public: ['../wordgard/src/state/transaction.ts:283-356'],
      owner: ['../wordgard/src/collab/collab.ts:127-208'],
      consumers: ['../wordgard/test/test-collab.ts:221-368'],
      lifecycle: ['../wordgard/src/collab/collab.ts:127-208'],
      proof: ['../wordgard/test/test-collab.ts:221-368'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:266-321'],
      owner: ['packages/plite/src/editor/correct-document.ts:166-207'],
      consumers: [
        'packages/plite/test/document-state-effect-contract.ts:30-243',
      ],
      lifecycle: ['packages/plite/src/editor/correct-document.ts:343-429'],
      proof: [
        'packages/plite/test/collab-document-state-contract.ts:76-140',
        'packages/plite/test/normalization-contract.ts:141-278',
      ],
    },
  },
  'WG-COLLAB-002C': {
    wordgard: {
      public: ['../wordgard/src/collab/collab.ts:245-274'],
      owner: ['../wordgard/src/collab/collab.ts:245-274'],
      consumers: ['../wordgard/test/test-collab.ts:120-220'],
      lifecycle: ['../wordgard/src/collab/collab.ts:245-274'],
      proof: ['../wordgard/test/test-collab.ts:120-220'],
    },
    plite: {
      covers: [
        'packages/yjs/src/core/extension.ts:17-222',
        'packages/plite/src/core/change/transform.ts:1-160',
      ],
      proof: ['packages/plite/test/collab-document-state-contract.ts:76-140'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
    },
  },
  'WG-HIST-001A': {
    wordgard: {
      public: ['../wordgard/src/history/history.ts:102-169'],
      owner: ['../wordgard/src/history/history.ts:10-101'],
      consumers: ['../wordgard/test/test-history.ts:93-405'],
      lifecycle: ['../wordgard/src/history/history.ts:261-358'],
      proof: ['../wordgard/test/test-history.ts:93-405'],
    },
    plite: {
      public: ['packages/plite-history/src/history-extension.ts:62-130'],
      owner: ['packages/plite-history/src/history-extension.ts:418-630'],
      consumers: ['packages/plite-history/test/history-contract.ts:295-1130'],
      lifecycle: ['packages/plite-history/src/history-extension.ts:540-627'],
      proof: [
        'packages/plite-history/test/history-contract.ts:295-1130',
        'benchmarks/slate-v2/donor/core/compare/history.mjs:1-220',
      ],
    },
  },
  'WG-HIST-002': {
    wordgard: {
      public: ['../wordgard/src/history/history.ts:113-145'],
      owner: ['../wordgard/src/history/history.ts:173-293'],
      consumers: ['../wordgard/test/test-history.ts:365-405'],
      lifecycle: ['../wordgard/src/history/history.ts:297-358'],
      proof: ['../wordgard/test/test-history.ts:365-405'],
    },
    plite: {
      public: ['packages/plite-history/src/history-extension.ts:62-130'],
      owner: ['packages/plite-history/src/history-state.ts:205-340'],
      consumers: [
        'packages/plite-history/test/history-branch-contract.spec.ts:39-146',
      ],
      lifecycle: ['packages/plite-history/src/history-state.ts:227-340'],
      proof: [
        'packages/plite-history/test/history-branch-contract.spec.ts:39-146',
        'benchmarks/editor/benchmarks/plite-history-depth-benchmark.ts:1-109',
      ],
    },
  },
  'WG-HIST-003': {
    wordgard: {
      public: ['../wordgard/src/history/history.ts:113-145'],
      owner: ['../wordgard/src/history/history.ts:71-96'],
      consumers: ['../wordgard/test/test-history.ts:552-575'],
      lifecycle: ['../wordgard/src/history/history.ts:71-96'],
      proof: ['../wordgard/test/test-history.ts:552-575'],
    },
    plite: {
      public: ['packages/plite-history/src/history-codec.ts:212-263'],
      owner: ['packages/plite-history/src/history-codec.ts:25-204'],
      consumers: [
        'packages/plite-history/test/history-persistence-contract.spec.ts:130-269',
      ],
      lifecycle: ['packages/plite-history/src/history-codec.ts:212-263'],
      proof: [
        'packages/plite-history/test/history-persistence-contract.spec.ts:130-269',
        'packages/plite-history/test/history-persistence-contract.spec.ts:445-810',
      ],
    },
  },
  'LOCAL-HISTORY-IDLE-GROUP': {
    wordgard: {
      public: ['../wordgard/src/history/history.ts:102-126'],
      owner: ['../wordgard/src/history/history.ts:10-35'],
      consumers: ['../wordgard/test/test-history.ts:93-103'],
      lifecycle: ['../wordgard/src/history/history.ts:295-334'],
      proof: ['../wordgard/test/test-history.ts:93-103'],
    },
  },
  'WG-STATE-001A': {
    wordgard: {
      covers: ['../wordgard/src/state/state.ts:49-293'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-value-purity-probe.json:5-89',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json:1-24',
      ],
    },
    plite: {
      public: [
        'packages/plite/src/interfaces/editor.ts:1078-1160',
        'packages/plite/src/interfaces/editor.ts:1418-1470',
      ],
      owner: ['packages/plite/src/core/public-state.ts:6350-6850'],
      consumers: ['packages/plite/test/transaction-contract.ts:133-243'],
      lifecycle: ['packages/plite/src/core/public-state.ts:6502-6850'],
      proof: [
        'packages/plite/test/transaction-contract.ts:133-243',
        'packages/plite/test/snapshot-contract.ts:6865-6955',
      ],
    },
  },
  'WG-STATE-001B': {
    wordgard: {
      covers: [
        '../wordgard/src/collab/collab.ts:23-37',
        '../wordgard/src/collab/collab.ts:211-225',
        '../wordgard/src/history/history.ts:71-96',
      ],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-state-purity-probe.json:5-14',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json:1-24',
      ],
    },
    plite: {
      public: ['packages/plite/src/core/public-state.ts:2963-3005'],
      owner: ['packages/plite/src/core/public-state.ts:740-790'],
      consumers: ['packages/plite/test/snapshot-contract.ts:6865-6898'],
      lifecycle: ['packages/plite/src/core/public-state.ts:5290-5385'],
      proof: ['packages/plite/test/snapshot-contract.ts:6865-6898'],
    },
  },
  'WG-STATE-002A': {
    wordgard: {
      public: ['../wordgard/src/state/state.ts:323-422'],
      owner: ['../wordgard/src/state/state.ts:350-410'],
      consumers: ['../wordgard/test/test-history.ts:421-549'],
      lifecycle: ['../wordgard/src/state/state.ts:350-410'],
      proof: ['../wordgard/test/test-history.ts:421-549'],
    },
    plite: {
      public: ['packages/plite/src/core/state-field.ts:17-79'],
      owner: ['packages/plite/src/core/state-field.ts:80-145'],
      consumers: ['packages/plite/test/field-facet-contract.test.ts:21-150'],
      lifecycle: ['packages/plite/src/core/state-fields.ts:10-86'],
      proof: [
        'packages/plite/test/field-facet-contract.test.ts:21-150',
        'packages/plite/test/transaction-extension-contract.ts:20-60',
      ],
    },
  },
  'WG-STATE-002B': {
    wordgard: {
      covers: [
        '../wordgard/src/state/state.ts:415-422',
        '../wordgard/src/state/state.ts:219-250',
      ],
      proof: ['../wordgard/test/test-history.ts:552-575'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json:1-24',
      ],
    },
    plite: {
      public: ['packages/plite/src/core/state-field.ts:20-79'],
      owner: ['packages/plite/src/core/value-codec.ts:283-375'],
      consumers: ['packages/plite/test/value-codec.test.ts:56-125'],
      lifecycle: ['packages/plite/src/core/state-field.ts:80-145'],
      proof: ['packages/plite/test/value-codec.test.ts:56-125'],
    },
  },
  'WG-STATE-003A': {
    wordgard: {
      public: ['../wordgard/src/state/state.ts:443-568'],
      owner: ['../wordgard/src/state/state.ts:937-1058'],
      consumers: ['../wordgard-website/site/examples/config/index.md:1-120'],
      lifecycle: ['../wordgard/src/state/state.ts:997-1058'],
      proof: ['../wordgard-website/site/examples/config/index.md:1-120'],
    },
    plite: {
      public: ['packages/plite/src/core/facet.ts:17-45'],
      owner: ['packages/plite/src/core/facet.ts:203-359'],
      consumers: [
        'packages/plite/test/transaction-extension-contract.ts:81-168',
      ],
      lifecycle: ['packages/plite/src/core/facet.ts:235-359'],
      proof: [
        'packages/plite/test/transaction-extension-contract.ts:81-168',
        'packages/plite/test/field-facet-contract.test.ts:21-150',
      ],
    },
  },
  'WG-STATE-003B': {
    wordgard: {
      public: ['../wordgard/src/state/state.ts:486-527'],
      owner: ['../wordgard/src/state/state.ts:919-1058'],
      consumers: ['../wordgard-website/site/examples/config/index.md:1-120'],
      lifecycle: ['../wordgard/src/state/state.ts:997-1058'],
      proof: ['../wordgard-website/site/examples/config/index.md:1-120'],
    },
    plite: {
      public: ['packages/plite/src/core/facet.ts:17-45'],
      owner: ['packages/plite/src/core/facet.ts:181-359'],
      consumers: [
        'packages/plite/test/transaction-extension-contract.ts:106-263',
      ],
      lifecycle: ['packages/plite/src/core/facet.ts:263-359'],
      proof: [
        'packages/plite/test/transaction-extension-contract.ts:106-263',
        'packages/plite/test/field-facet-contract.test.ts:21-150',
      ],
    },
  },
  'WG-STATE-004A': {
    wordgard: {
      public: ['../wordgard/src/state/state.ts:830-882'],
      owner: ['../wordgard/src/state/state.ts:596-780'],
      consumers: ['../wordgard-website/site/examples/config/index.md:1-120'],
      lifecycle: ['../wordgard/src/state/state.ts:708-780'],
      proof: ['../wordgard-website/site/examples/config/index.md:1-120'],
    },
    plite: {
      public: ['packages/plite/src/core/editor-extension.ts:470-687'],
      owner: ['packages/plite/src/core/editor-extension.ts:834-1139'],
      consumers: [
        'packages/plite/test/extension-configuration.test.ts:1681-1785',
      ],
      lifecycle: ['packages/plite/src/core/editor-extension.ts:834-1139'],
      proof: ['packages/plite/test/extension-configuration.test.ts:1681-1785'],
    },
    plate: {
      public: ['packages/core/src/lib/plugin/defineBasePlugin.ts:592-780'],
      owner: ['packages/core/src/internal/plugin/resolvePlugins.ts:1364-1536'],
      consumers: [
        'packages/core/src/internal/plugin/resolvePlugins.spec.tsx:46-69',
      ],
      lifecycle: [
        'packages/core/src/internal/plugin/resolvePlugins.ts:1859-2000',
      ],
      proof: [
        'packages/core/src/internal/plugin/resolvePlugins.spec.tsx:492-620',
      ],
    },
  },
  'WG-STATE-004B': {
    wordgard: {
      public: ['../wordgard/src/state/state.ts:830-882'],
      owner: ['../wordgard/src/state/state.ts:708-780'],
      consumers: ['../wordgard-website/site/examples/config/index.md:1-120'],
      lifecycle: ['../wordgard/src/state/state.ts:708-780'],
      proof: ['../wordgard-website/site/examples/config/index.md:1-120'],
    },
    plite: {
      public: ['packages/plite/src/core/editor-extension.ts:662-687'],
      owner: ['packages/plite/src/core/editor-extension.ts:798-920'],
      consumers: [
        'packages/plite/test/extension-configuration.test.ts:1926-1982',
      ],
      lifecycle: ['packages/plite/src/core/editor-extension.ts:1491-1572'],
      proof: [
        'packages/plite/test/extension-configuration.test.ts:1575-1720',
        'packages/plite/test/extension-configuration.test.ts:1926-1982',
      ],
    },
    plate: {
      public: ['packages/core/src/lib/plugin/BasePlugin.ts:168-210'],
      owner: ['packages/core/src/internal/plugin/resolvePlugins.ts:1364-1536'],
      consumers: [
        'packages/core/src/internal/plugin/resolvePlugins.spec.tsx:470-491',
      ],
      lifecycle: [
        'packages/core/src/internal/plugin/resolvePlugins.ts:1859-2000',
      ],
      proof: [
        'packages/core/src/internal/plugin/resolvePlugins.spec.tsx:492-620',
        'packages/core/src/internal/plugin/resolvePlugins.spec.tsx:748-833',
      ],
    },
  },
  'WG-STATE-005A': {
    wordgard: {
      public: ['../wordgard/src/state/state.ts:596-706'],
      owner: ['../wordgard/src/state/state.ts:146-194'],
      consumers: ['../wordgard-website/site/examples/config/index.md:1-120'],
      lifecycle: ['../wordgard/src/state/state.ts:163-194'],
      proof: ['../wordgard-website/site/examples/config/index.md:1-120'],
    },
    plite: {
      covers: [
        'packages/plite/src/core/editor-extension.ts:1573-2175',
        'packages/plite/src/interfaces/editor.ts:379-399',
      ],
      proof: ['packages/plite/test/extension-configuration.test.ts:466-798'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:376-430',
      ],
      proof: [
        'packages/core/src/internal/plugin/plateModelPublication.spec.ts:488-512',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
    },
  },
  'WG-STATE-005B': {
    wordgard: {
      public: ['../wordgard/src/state/state.ts:781-809'],
      owner: ['../wordgard/src/state/state.ts:626-780'],
      consumers: ['../wordgard-website/site/examples/config/index.md:1-120'],
      lifecycle: ['../wordgard/src/state/state.ts:163-194'],
      proof: ['../wordgard-website/site/examples/config/index.md:1-120'],
    },
    plite: {
      covers: [
        'packages/plite/src/interfaces/editor.ts:379-399',
        'packages/plite/src/core/public-state.ts:3537-3548',
      ],
      proof: ['packages/plite/test/transaction-extension-contract.ts:266-312'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
    },
  },
  'WG-STATE-005C': {
    wordgard: {
      public: ['../wordgard/src/state/state.ts:781-809'],
      owner: ['../wordgard/src/state/state.ts:626-673'],
      consumers: ['../wordgard-website/site/examples/config/index.md:1-120'],
      lifecycle: ['../wordgard/src/state/state.ts:163-194'],
      proof: ['../wordgard-website/site/examples/config/index.md:1-120'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:379-399'],
      owner: ['packages/plite/src/core/public-state.ts:3537-3548'],
      consumers: [
        'packages/plite/test/transaction-extension-contract.ts:266-312',
      ],
      lifecycle: [
        'packages/plite/test/extension-configuration.test.ts:1280-1344',
      ],
      proof: [
        'packages/plite/test/extension-configuration.test.ts:1280-1344',
        'packages/plite/test/transaction-extension-contract.ts:266-312',
      ],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:376-430',
      ],
      proof: [
        'packages/core/src/internal/plugin/plateModelPublication.spec.ts:488-512',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
    },
  },
  'WG-STATE-006A': {
    wordgard: {
      public: ['../wordgard/src/state/transaction.ts:93-170'],
      owner: ['../wordgard/src/state/transaction.ts:12-195'],
      consumers: ['../wordgard/test/test-state.ts:17-124'],
      lifecycle: ['../wordgard/src/state/transaction.ts:133-195'],
      proof: ['../wordgard/test/test-state.ts:17-124'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:1078-1160'],
      owner: ['packages/plite/src/core/public-state.ts:4150-4543'],
      consumers: ['packages/plite/test/transaction-contract.ts:133-380'],
      lifecycle: ['packages/plite/src/core/public-state.ts:6502-6850'],
      proof: ['packages/plite/test/transaction-contract.ts:133-380'],
    },
    plate: {
      covers: ['packages/core/src/lib/plugin/BasePlugin.ts:900-1025'],
      proof: [
        'packages/core/src/internal/plugin/resolvePlugins.spec.tsx:492-620',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
    },
  },
  'WG-STATE-006B': {
    wordgard: {
      covers: [
        '../wordgard/src/state/state.ts:89-99',
        '../wordgard/src/state/state.ts:1060-1069',
      ],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-value-purity-probe.json:91-110',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json:1-24',
      ],
    },
    plite: {
      public: ['packages/plite/src/core/public-state.ts:6502-6681'],
      owner: ['packages/plite/src/core/public-state.ts:6502-6850'],
      consumers: ['packages/plite/test/transaction-contract.ts:669-693'],
      lifecycle: ['packages/plite/src/core/public-state.ts:6651-6850'],
      proof: [
        'packages/plite/test/transaction-contract.ts:669-693',
        'packages/plite/test/facet-draft-contract.test.ts:142-184',
      ],
    },
  },
  'WG-STATE-007A': {
    wordgard: {
      public: ['../wordgard/src/state/transaction.ts:93-195'],
      owner: ['../wordgard/src/state/transaction.ts:133-195'],
      consumers: ['../wordgard/test/test-history.ts:406-420'],
      lifecycle: ['../wordgard/src/state/transaction.ts:133-195'],
      proof: ['../wordgard/test/test-history.ts:406-420'],
    },
    plite: {
      covers: [
        'packages/plite/src/editor/correct-document.ts:166-207',
        'packages/plite/src/core/public-state.ts:6557-6600',
      ],
      proof: ['packages/plite/test/normalization-contract.ts:141-278'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
    },
  },
  'WG-STATE-007B': {
    wordgard: {
      public: ['../wordgard/src/state/transaction.ts:139-195'],
      owner: ['../wordgard/src/state/transaction.ts:174-195'],
      consumers: ['../wordgard/test/test-history.ts:406-420'],
      lifecycle: ['../wordgard/src/state/transaction.ts:174-195'],
      proof: ['../wordgard/test/test-history.ts:406-420'],
    },
    plite: {
      covers: [
        'packages/plite/src/core/public-state.ts:2980-3000',
        'packages/plite/src/core/public-state.ts:6807-6846',
      ],
      proof: ['packages/plite/test/extension-configuration.test.ts:2354-2416'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
    },
  },
  'WG-STATE-008': {
    wordgard: {
      public: ['../wordgard/src/state/correction.ts:91-188'],
      owner: ['../wordgard/src/state/correction.ts:13-188'],
      consumers: ['../wordgard/test/test-correction.ts:1-85'],
      lifecycle: ['../wordgard/src/state/correction.ts:13-188'],
      proof: ['../wordgard/test/test-correction.ts:1-85'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:1990-2078'],
      owner: ['packages/plite/src/editor/correct-document.ts:166-454'],
      consumers: ['packages/plite/test/normalization-contract.ts:141-278'],
      lifecycle: ['packages/plite/src/editor/correct-document.ts:177-454'],
      proof: [
        'packages/plite/test/normalization-contract.ts:447-785',
        'packages/plite/test/normalization-contract.ts:934-1418',
      ],
    },
  },
  'WG-STATE-009A': {
    wordgard: {
      covers: [
        '../wordgard/src/state/selection.ts:8-15',
        '../wordgard/src/state/selection.ts:93-123',
        '../wordgard/src/state/selection.ts:200-212',
        '../wordgard/src/table/cellselection.ts:222-241',
      ],
      proof: ['../wordgard/test/test-cellselection.ts:1-179'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json:1-24',
      ],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:2415-2465'],
      owner: ['packages/plite/src/core/selection-protocol.ts:172-281'],
      consumers: ['packages/plite/test/selection-protocol.test.ts:23-155'],
      lifecycle: ['packages/plite/src/core/selection-protocol.ts:615-784'],
      proof: [
        'packages/plite/test/selection-protocol.test.ts:217-245',
        'packages/plite/test/selection-protocol.test.ts:397-478',
      ],
    },
  },
  'WG-STATE-009B': {
    wordgard: {
      covers: [
        '../wordgard/src/state/selection.ts:105-123',
        '../wordgard/src/state/selection.ts:298-323',
        '../wordgard/src/state/selection.ts:356-368',
      ],
      proof: ['../wordgard/test/test-selection.ts:1-84'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json:1-24',
      ],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:210-233'],
      owner: ['packages/plite/src/core/selection-protocol.ts:195-281'],
      consumers: ['packages/plite/test/selection-protocol.test.ts:397-478'],
      lifecycle: ['packages/plite/src/core/selection-protocol.ts:615-784'],
      proof: ['packages/plite/test/selection-protocol.test.ts:397-478'],
    },
  },
  'WG-STATE-010A': {
    wordgard: {
      public: ['../wordgard/src/state/selection.ts:17-193'],
      owner: ['../wordgard/src/state/selection.ts:219-368'],
      consumers: ['../wordgard/test/test-selection.ts:1-219'],
      lifecycle: ['../wordgard/src/state/selection.ts:89-123'],
      proof: ['../wordgard/test/test-selection.ts:1-219'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:2415-2465'],
      owner: ['packages/plite/src/core/selection-protocol.ts:283-548'],
      consumers: ['packages/plite/test/selection-rebase-contract.ts:1-220'],
      lifecycle: ['packages/plite/src/core/selection-protocol.ts:615-784'],
      proof: [
        'packages/plite/test/selection-protocol.test.ts:217-559',
        'packages/plite/test/selection-rebase-contract.ts:1-220',
      ],
    },
  },
  'WG-STATE-010B': {
    wordgard: {
      public: ['../wordgard/src/state/selection.ts:46-55'],
      owner: ['../wordgard/src/state/selection.ts:219-323'],
      consumers: ['../wordgard/test/test-commands.ts:81-85'],
      lifecycle: ['../wordgard/src/state/selection.ts:249-323'],
      proof: ['../wordgard/test/test-commands.ts:822-842'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:3426-3433'],
      owner: ['packages/plite/src/core/selection-protocol.ts:551-699'],
      consumers: ['packages/plite/test/transforms-contract.ts:391-471'],
      lifecycle: ['packages/plite/src/core/selection-protocol.ts:615-699'],
      proof: [
        'packages/plite/test/selection-protocol.test.ts:529-558',
        'packages/plite/test/transforms-contract.ts:391-471',
      ],
    },
  },
  'WG-STATE-011A': {
    wordgard: {
      public: ['../wordgard/src/state/textblock.ts:18-62'],
      owner: ['../wordgard/src/state/textblock.ts:64-139'],
      consumers: ['../wordgard/src/state/selection.ts:155-193'],
      lifecycle: ['../wordgard/src/state/textblock.ts:51-97'],
      proof: ['../wordgard/test/test-selection.ts:61-100'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:3375-3395'],
      owner: ['packages/plite/src/editor/positions.ts:199-342'],
      consumers: ['packages/plite/src/editor/positions.ts:401-608'],
      lifecycle: ['packages/plite/src/editor/positions.ts:199-342'],
      proof: ['packages/plite/test/text-units-contract.ts:173-304'],
    },
  },
  'WG-STATE-011B': {
    wordgard: {
      public: ['../wordgard/src/state/selection.ts:141-170'],
      owner: ['../wordgard/src/state/textblock.ts:141-228'],
      consumers: ['../wordgard/src/command/commands.ts:484-491'],
      lifecycle: ['../wordgard/src/state/selection.ts:141-170'],
      proof: ['../wordgard/test/test-selection.ts:85-219'],
    },
    plite: {
      public: ['packages/plite/src/transforms-selection/move.ts:13-58'],
      owner: [
        'packages/plite/src/editor/positions.ts:401-608',
        'packages/plite/src/utils/string.ts:236-347',
      ],
      consumers: ['packages/plite/src/transforms-selection/move.ts:13-67'],
      lifecycle: ['packages/plite/src/utils/string.ts:409-560'],
      proof: [
        'packages/plite/test/text-units-contract.ts:279-549',
        'packages/plite/test/word-boundary-proof.test.ts:29-358',
      ],
    },
  },
  'WG-STATE-012': {
    wordgard: {
      public: ['../wordgard/src/phrases/phraseset.ts:18-75'],
      owner: ['../wordgard/src/phrases/phraseset.ts:18-75'],
      consumers: ['../wordgard-website/site/examples/translate/index.md:1-63'],
      lifecycle: ['../wordgard/src/phrases/phraseset.ts:38-75'],
      proof: ['../wordgard-website/site/examples/translate/index.md:1-63'],
    },
    plate: {
      covers: ['apps/www/src/i18n/getI18nValues.ts:92-186'],
      proof: ['apps/www/src/i18n/getI18nValues.ts:92-186'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
    },
  },
  'WG-STATE-013': {
    wordgard: {
      public: ['../wordgard/src/state/textblock.ts:43-49'],
      owner: ['../wordgard/src/state/bidi.ts:71-409'],
      consumers: ['../wordgard/src/state/selection.ts:141-170'],
      lifecycle: ['../wordgard/src/state/textblock.ts:141-176'],
      proof: ['../wordgard/test/test-selection.ts:102-158'],
    },
    plite: {
      covers: [
        'packages/plite/src/transforms-selection/move.ts:13-58',
        'packages/plite-react/src/editable/caret-engine.ts:677-843',
      ],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/navigation-bidi.test.ts:93-197',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
    },
  },
  'WG-STATE-014A': {
    wordgard: {
      public: ['../wordgard/src/editor/editor.ts:404-425'],
      owner: ['../wordgard/src/editor/selection.ts:39-130'],
      consumers: [
        '../wordgard/src/command/commands.ts:494-516',
        '../wordgard/src/editor/keymap.ts:181-204',
      ],
      lifecycle: ['../wordgard/src/editor/selection.ts:39-130'],
      proof: ['../wordgard/test/webtest-coords.ts:109-176'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:3375-3395'],
      owner: [
        'packages/plite-react/src/editable/runtime-keyboard-events.ts:286-498',
      ],
      consumers: [
        'packages/plite-react/src/editable/editable-dom-runtime.ts:249-253',
      ],
      lifecycle: [
        'packages/plite-react/src/editable/editable-dom-runtime.ts:562-571',
        'packages/plite-react/src/editable/editable-dom-runtime.ts:693-710',
        'packages/plite-react/src/editable/editable-dom-runtime.ts:808-838',
      ],
      proof: [
        'packages/plite-react/test/projected-command-contract.test.ts:1697-1769',
      ],
    },
  },
  'WG-STATE-014B': {
    wordgard: {
      covers: [
        '../wordgard/src/command/commands.ts:518-536',
        '../wordgard/src/editor/keymap.ts:197-204',
        '../wordgard/src/editor/selection.ts:39-83',
      ],
      proof: ['../wordgard/src/command/commands.ts:518-536'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json:1-24',
      ],
    },
  },
  'WG-STATE-015A': {
    wordgard: {
      public: ['../wordgard/src/state/transaction.ts:197-227'],
      owner: ['../wordgard/src/state/transaction.ts:197-282'],
      consumers: ['../wordgard/test/test-history.ts:21-35'],
      lifecycle: ['../wordgard/src/state/transaction.ts:359-404'],
      proof: ['../wordgard/test/test-history.ts:350-380'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:316-319'],
      owner: ['packages/plite/src/core/transaction-values.ts:116-130'],
      consumers: [
        'packages/plite/test/transaction-extension-contract.ts:62-78',
      ],
      lifecycle: ['packages/plite/src/core/public-state.ts:3469-3498'],
      proof: [
        'packages/plite/test/transaction-extension-contract.ts:62-78',
        'packages/plite/test/commit-metadata-contract.ts:281-293',
      ],
    },
    plate: {
      covers: ['packages/core/src/lib/plugin/BasePlugin.ts:900-1025'],
      proof: [
        'packages/core/src/internal/plugin/resolvePlugins.spec.tsx:492-620',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
    },
  },
  'WG-STATE-015B': {
    wordgard: {
      public: ['../wordgard/src/state/transaction.ts:283-356'],
      owner: ['../wordgard/src/state/transaction.ts:283-356'],
      consumers: [
        '../wordgard/test/test-history.ts:421-549',
        '../wordgard/test/test-collab.ts:274-317',
      ],
      lifecycle: ['../wordgard/src/state/transaction.ts:359-404'],
      proof: [
        '../wordgard/test/test-history.ts:421-549',
        '../wordgard/test/test-collab.ts:274-317',
      ],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:265-314'],
      owner: ['packages/plite/src/core/transaction-values.ts:8-114'],
      consumers: [
        'packages/plite/test/document-state-effect-contract.ts:30-252',
      ],
      lifecycle: [
        'packages/plite/src/core/public-state.ts:1363-1418',
        'packages/plite/src/core/public-state.ts:4440-4445',
      ],
      proof: [
        'packages/plite/test/document-state-effect-contract.ts:84-252',
        'packages/plite-history/test/document-state-history-contract.ts:496-558',
        'packages/plite/test/collab-document-state-contract.ts:77-140',
      ],
    },
  },
  'WG-TABLE-001': {
    wordgard: {
      public: ['../wordgard/src/table/table.ts:15-83'],
      owner: ['../wordgard/src/table/table.ts:45-83'],
      consumers: ['../wordgard/test/test-table-correction.ts:1-41'],
      lifecycle: ['../wordgard/src/table/table.ts:45-83'],
      proof: ['../wordgard/test/test-table-correction.ts:1-41'],
    },
    plate: {
      public: ['packages/table/src/lib/BaseTablePlugin.ts:326-449'],
      owner: ['packages/table/src/lib/BaseTablePlugin.ts:326-716'],
      consumers: [
        'packages/table/src/lib/BaseTablePlugin.schema.spec.ts:1-207',
      ],
      lifecycle: ['packages/table/src/lib/BaseTablePlugin.ts:654-716'],
      proof: [
        'packages/table/src/lib/BaseTablePlugin.schema.spec.ts:1-207',
        'packages/table/src/lib/BaseTablePlugin.normalize.spec.tsx:1-496',
      ],
    },
  },
  'WG-TABLE-002': {
    wordgard: {
      public: ['../wordgard/src/table/tablemap.ts:15-164'],
      owner: ['../wordgard/src/table/tablemap.ts:44-233'],
      consumers: ['../wordgard/src/table/tablecommands.ts:9-22'],
      lifecycle: ['../wordgard/src/table/tablemap.ts:164-233'],
      proof: ['../wordgard/test/test-table-commands.ts:1-212'],
    },
    plate: {
      public: ['packages/table/src/lib/BaseTablePlugin.ts:521-557'],
      owner: [
        'packages/table/src/lib/BaseTablePlugin.ts:903-1051',
        'packages/table/src/lib/internal/grid.ts:1-294',
      ],
      consumers: ['packages/table/src/lib/BaseTablePlugin.grid.spec.tsx:1-469'],
      lifecycle: ['packages/table/src/lib/internal/grid.ts:111-294'],
      proof: [
        'packages/table/src/lib/BaseTablePlugin.grid.spec.tsx:1-469',
        'packages/table/src/lib/internal/grid.spec.ts:1-219',
      ],
    },
  },
  'WG-TABLE-003': {
    wordgard: {
      public: ['../wordgard/src/table/correct.ts:10-69'],
      owner: ['../wordgard/src/table/correct.ts:10-69'],
      consumers: ['../wordgard/test/test-table-correction.ts:1-41'],
      lifecycle: ['../wordgard/src/table/correct.ts:10-69'],
      proof: ['../wordgard/test/test-table-correction.ts:1-41'],
    },
    plate: {
      public: ['packages/table/src/lib/BaseTablePlugin.ts:2610-2684'],
      owner: [
        'packages/table/src/lib/BaseTablePlugin.ts:2610-2684',
        'packages/table/src/lib/internal/mutation.ts:1-1420',
      ],
      consumers: [
        'packages/table/src/lib/BaseTablePlugin.normalize.spec.tsx:1-496',
      ],
      lifecycle: ['packages/table/src/lib/BaseTablePlugin.ts:2610-2684'],
      proof: [
        'packages/table/src/lib/BaseTablePlugin.normalize.spec.tsx:1-496',
        'packages/table/src/lib/internal/mutation.spec.ts:1-628',
      ],
    },
  },
  'WG-TABLE-004A': {
    wordgard: {
      public: ['../wordgard/src/table/cellselection.ts:100-190'],
      owner: ['../wordgard/src/table/cellselection.ts:100-241'],
      consumers: ['../wordgard/src/table/tablecommands.ts:9-22'],
      lifecycle: ['../wordgard/src/table/cellselection.ts:165-241'],
      proof: ['../wordgard/test/test-cellselection.ts:1-179'],
    },
    plate: {
      public: ['packages/table/src/lib/BaseTablePlugin.ts:2744-2844'],
      owner: [
        'packages/table/src/lib/BaseTablePlugin.ts:2744-2844',
        'packages/table/src/lib/internal/selection.ts:1-395',
      ],
      consumers: [
        'packages/table/src/lib/BaseTablePlugin.selection.spec.tsx:1-1066',
      ],
      lifecycle: ['packages/table/src/lib/BaseTablePlugin.ts:2773-2843'],
      proof: [
        'packages/table/src/lib/BaseTablePlugin.selection.spec.tsx:1-1066',
      ],
    },
  },
  'WG-TABLE-004B': {
    wordgard: {
      covers: [
        '../wordgard/src/table/cellselection.ts:9-27',
        '../wordgard/src/table/cellselection.ts:223-241',
      ],
      proof: ['../wordgard/test/test-cellselection.ts:1-179'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json:1-24',
      ],
    },
    plate: {
      public: ['packages/table/src/react/useTableElement.ts:99-174'],
      owner: ['packages/table/src/react/useTableElement.ts:146-225'],
      consumers: ['apps/www/src/registry/ui/table-node.tsx:650-666'],
      lifecycle: ['packages/table/src/react/useTableElement.ts:176-225'],
      proof: ['packages/table/src/react/useTableElement.spec.tsx:1-151'],
    },
  },
  'WG-TABLE-005': {
    wordgard: {
      public: ['../wordgard/src/table/tablecommands.ts:25-289'],
      owner: ['../wordgard/src/table/tablecommands.ts:37-289'],
      consumers: ['../wordgard/src/table/menu.ts:170-263'],
      lifecycle: ['../wordgard/src/table/tablecommands.ts:68-289'],
      proof: ['../wordgard/test/test-table-commands.ts:1-212'],
    },
    plate: {
      public: ['packages/table/src/lib/BaseTablePlugin.ts:1603-2020'],
      owner: [
        'packages/table/src/lib/BaseTablePlugin.ts:1603-2512',
        'packages/table/src/lib/internal/mutation.ts:1-1420',
      ],
      consumers: ['apps/www/src/registry/ui/table-toolbar-button.tsx:85-232'],
      lifecycle: ['packages/table/src/lib/BaseTablePlugin.ts:2021-2512'],
      proof: [
        'packages/table/src/lib/BaseTablePlugin.insert.spec.tsx:1-255',
        'packages/table/src/lib/BaseTablePlugin.remove.spec.tsx:1-512',
        'packages/table/src/lib/BaseTablePlugin.merge.spec.tsx:1-392',
        'packages/table/src/lib/BaseTablePlugin.apply.spec.tsx:1-478',
      ],
    },
  },
  'WG-TABLE-006': {
    wordgard: {
      public: ['../wordgard/src/table/tablepaste.ts:169-266'],
      owner: ['../wordgard/src/table/tablepaste.ts:10-266'],
      consumers: ['../wordgard/test/test-table-paste.ts:1-124'],
      lifecycle: ['../wordgard/src/table/tablepaste.ts:169-266'],
      proof: ['../wordgard/test/test-table-paste.ts:1-124'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:1014-1052'],
      owner: ['packages/plite/src/core/content-slice.ts:139-464'],
      consumers: ['packages/plite/test/slice-public-api-contract.test.ts:1-96'],
      lifecycle: ['packages/plite/src/core/content-slice.ts:361-464'],
      proof: [
        'packages/plite/test/slice-public-api-contract.test.ts:1-96',
        'packages/plite/test/slice-fit-laws.test.ts:286-612',
      ],
    },
    plate: {
      public: ['packages/table/src/lib/BaseTablePlugin.ts:2962-3070'],
      owner: [
        'packages/table/src/lib/BaseTablePlugin.ts:2513-2608',
        'packages/table/src/lib/internal/paste.ts:1-1424',
      ],
      consumers: [
        'packages/table/src/lib/BaseTablePlugin.paste.spec.tsx:1-322',
      ],
      lifecycle: ['packages/table/src/lib/BaseTablePlugin.ts:2962-3070'],
      proof: [
        'packages/table/src/lib/BaseTablePlugin.paste.spec.tsx:1-322',
        'packages/table/src/lib/internal/paste.spec.ts:1-569',
      ],
    },
  },
  'WG-TABLE-007A': {
    wordgard: {
      public: ['../wordgard/src/table/menu.ts:143-157'],
      owner: ['../wordgard/src/table/menu.ts:17-120'],
      consumers: ['../wordgard/src/table/menu.ts:128-136'],
      lifecycle: ['../wordgard/src/table/menu.ts:27-92'],
      proof: ['../wordgard/src/table/menu.ts:27-120'],
    },
    plate: {
      public: ['apps/www/src/registry/ui/table-toolbar-button.tsx:46-83'],
      owner: ['apps/www/src/registry/ui/table-toolbar-button.tsx:241-374'],
      consumers: ['apps/www/src/registry/ui/fixed-toolbar-buttons.tsx:157-157'],
      lifecycle: ['apps/www/src/registry/ui/table-toolbar-button.tsx:241-374'],
      proof: ['apps/www/src/registry/ui/table-toolbar-button.tsx:241-374'],
    },
  },
  'WG-TABLE-007B': {
    wordgard: {
      public: ['../wordgard/src/table/menu.ts:128-168'],
      owner: ['../wordgard/src/table/menu.ts:159-264'],
      consumers: ['../wordgard/src/table/menu.ts:128-136'],
      lifecycle: ['../wordgard/src/table/menu.ts:159-168'],
      proof: ['../wordgard/src/table/menu.ts:159-264'],
    },
    plate: {
      public: ['apps/www/src/registry/ui/table-toolbar-button.tsx:46-237'],
      owner: [
        'apps/www/src/registry/ui/table-toolbar-button.tsx:85-232',
        'apps/www/src/registry/ui/table-node.tsx:827-930',
      ],
      consumers: ['apps/www/src/registry/ui/fixed-toolbar-buttons.tsx:157-157'],
      lifecycle: ['apps/www/src/registry/ui/table-node.tsx:827-930'],
      proof: ['apps/www/src/registry/ui/table-node.tsx:827-930'],
    },
  },
  'LOCAL-COMMIT-IMPACT-METADATA': {
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:2803-2900'],
      owner: ['packages/plite/src/core/commit.ts:860-1020'],
      consumers: [
        'packages/plite-react/src/editable/root-selector-sources.ts:122-177',
      ],
      lifecycle: ['packages/plite/src/core/commit.ts:947-1020'],
      proof: [
        'packages/plite/test/commit-metadata-contract.ts:44-121',
        'packages/plite/test/commit-metadata-contract.ts:322-434',
        'packages/plite/test/transaction-contract.ts:481-576',
      ],
    },
  },
  'LOCAL-COMMIT-IMPACT-SUBSCRIPTIONS': {
    plite: {
      public: ['packages/plite-react/src/hooks/use-editor-selector.tsx:29-172'],
      owner: [
        'packages/plite-react/src/hooks/use-editor-selector.tsx:101-172',
        'packages/plite-react/src/editable/root-selector-sources.ts:122-200',
      ],
      consumers: [
        'packages/plite-react/test/provider-hooks-contract.tsx:720-843',
      ],
      lifecycle: ['packages/plite-react/src/projection-store.ts:640-700'],
      proof: [
        'packages/plite-react/test/provider-hooks-contract.tsx:720-843',
        'packages/plite-react/test/projections-and-selection-contract.tsx:1130-1225',
      ],
    },
  },
  'LOCAL-YJS': {
    plite: {
      public: ['packages/yjs/src/core/extension.ts:17-80'],
      owner: [
        'packages/yjs/src/core/extension.ts:63-222',
        'packages/yjs/src/core/attributes.ts:1-112',
      ],
      consumers: ['packages/yjs/test/provider-contract.spec.ts:1-973'],
      lifecycle: ['packages/yjs/src/core/extension.ts:79-219'],
      proof: [
        'packages/yjs/test/schema-identity-contract.spec.ts:1-638',
        'packages/yjs/test/awareness-contract.spec.ts:1-315',
        'packages/yjs/test/selection-contract.spec.ts:1-206',
        'packages/yjs/test/provider-contract.spec.ts:1-973',
      ],
    },
  },
  'LOCAL-LIFECYCLE-PHASE': {
    wordgard: {
      covers: [
        '../wordgard/src/editor/editor.ts:1078-1158',
        '../wordgard/src/state/state.ts:89-99',
        '../wordgard/src/state/state.ts:1060-1069',
      ],
      proof: ['../wordgard/src/editor/editor.ts:1095-1155'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json:1-24',
      ],
    },
    plite: {
      covers: [
        'packages/plite/src/core/editor-extension.ts:1150-1219',
        'packages/plite/src/core/editor-extension.ts:2099-2159',
      ],
      proof: [
        'packages/plite/test/extension-configuration.test.ts:1346-1448',
        'packages/plite/test/extension-configuration.test.ts:1511-1573',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
    },
    plate: {
      covers: ['packages/core/src/internal/plugin/resolvePlugins.ts:1023-1046'],
      proof: [
        'packages/core/src/internal/plugin/plateModelPublication.spec.ts:488-512',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
    },
  },
});

/**
 * Evidence keys are ordered: correctness, API, data, ownership, runtime, proof.
 * Empty runtime arrays are intentional where no direct comparison or benchmark
 * establishes the requested superiority claim.
 */
export const dimensionEvidenceKeys = Object.freeze({
  'WG-COLLAB-001': [
    ['wordgard.proof', 'plite.proof'],
    ['plite.public'],
    ['wordgard.public', 'plite.public'],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-COLLAB-002A': [
    ['plite.proof'],
    ['wordgard.public', 'plite.public'],
    ['plite.public'],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-COLLAB-002B': [
    ['plite.proof'],
    ['wordgard.public', 'plite.public'],
    [],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-COLLAB-002C': [
    ['wordgard.proof'],
    ['wordgard.public'],
    ['wordgard.public', 'plite.covers'],
    ['wordgard.owner'],
    [],
    ['wordgard.proof'],
  ],
  'WG-HIST-001A': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-HIST-002': [
    ['wordgard.proof', 'plite.proof'],
    ['plite.public'],
    ['wordgard.public', 'plite.public'],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-HIST-003': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'LOCAL-HISTORY-IDLE-GROUP': [
    ['wordgard.proof'],
    ['wordgard.public'],
    ['wordgard.public'],
    ['wordgard.owner'],
    [],
    ['wordgard.proof'],
  ],
  'WG-STATE-001A': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-001B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    [],
  ],
  'WG-STATE-002A': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-002B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-003A': [
    ['wordgard.proof', 'plite.proof'],
    ['plite.public'],
    ['wordgard.public', 'plite.public'],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-003B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-004A': [
    ['wordgard.proof', 'plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['wordgard.public', 'plite.public', 'plate.public'],
    ['wordgard.owner', 'plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-STATE-004B': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['wordgard.public', 'plite.public', 'plate.public'],
    ['wordgard.owner', 'plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-STATE-005A': [
    ['wordgard.proof'],
    ['plite.covers'],
    ['plite.covers'],
    ['wordgard.owner', 'plite.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-005B': [
    ['plite.proof'],
    ['plite.covers'],
    ['plite.covers'],
    ['plite.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-005C': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-006A': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-006B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-007A': [
    ['wordgard.proof', 'plite.proof'],
    ['plite.covers'],
    ['plite.covers'],
    ['wordgard.owner', 'plite.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-007B': [
    ['wordgard.proof'],
    ['wordgard.public'],
    ['wordgard.public', 'plite.covers'],
    ['wordgard.owner', 'plite.covers'],
    [],
    ['wordgard.proof'],
  ],
  'WG-STATE-008': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-009A': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-009B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-010A': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-010B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-011A': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-011B': [
    ['plite.proof'],
    ['plite.public'],
    ['wordgard.public', 'plite.public'],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-012': [
    ['wordgard.proof'],
    ['wordgard.public'],
    [],
    ['wordgard.owner', 'plate.covers'],
    [],
    [],
  ],
  'WG-STATE-013': [
    ['wordgard.proof'],
    ['plite.covers'],
    ['plite.covers'],
    ['plite.covers'],
    [],
    ['wordgard.proof'],
  ],
  'WG-STATE-014A': [
    ['wordgard.proof', 'plite.proof'],
    ['wordgard.public', 'plite.public'],
    [],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-014B': [
    ['wordgard.proof'],
    ['wordgard.covers'],
    [],
    ['wordgard.covers'],
    [],
    [],
  ],
  'WG-STATE-015A': [
    ['plite.proof'],
    ['plite.public'],
    ['wordgard.public', 'plite.public'],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-015B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-TABLE-001': [
    ['plate.proof'],
    ['plate.public'],
    ['plate.public'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-TABLE-002': [
    ['plate.proof'],
    ['plate.public'],
    ['plate.public'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-TABLE-003': [
    ['plate.proof'],
    ['plate.public'],
    ['plate.public'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-TABLE-004A': [
    ['plate.proof'],
    ['plate.public'],
    ['plate.public'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-TABLE-004B': [
    ['plate.proof'],
    ['plate.public'],
    ['plate.public'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-TABLE-005': [
    ['plate.proof'],
    ['plate.public'],
    ['plate.public'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-TABLE-006': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['plite.public', 'plate.public'],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-TABLE-007A': [
    ['wordgard.proof', 'plate.proof'],
    ['wordgard.public', 'plate.public'],
    ['wordgard.public', 'plate.public'],
    ['wordgard.owner', 'plate.owner'],
    [],
    [],
  ],
  'WG-TABLE-007B': [
    ['wordgard.proof', 'plate.proof'],
    ['wordgard.public', 'plate.public'],
    ['wordgard.public', 'plate.public'],
    ['wordgard.owner', 'plate.owner'],
    [],
    [],
  ],
  'LOCAL-COMMIT-IMPACT-METADATA': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    ['plite.proof'],
    ['plite.proof'],
  ],
  'LOCAL-COMMIT-IMPACT-SUBSCRIPTIONS': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    ['plite.proof'],
    ['plite.proof'],
  ],
  'LOCAL-YJS': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'LOCAL-LIFECYCLE-PHASE': [
    ['wordgard.proof', 'plite.proof', 'plate.proof'],
    ['wordgard.covers', 'plite.covers', 'plate.covers'],
    [],
    ['wordgard.covers', 'plite.covers', 'plate.covers'],
    [],
    [],
  ],
});

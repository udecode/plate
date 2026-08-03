/**
 * Direct comparison evidence for document, schema, and identity rows.
 *
 * Dimension array order is correctness, API, data, ownership, runtime, proof.
 * Runtime entries are intentionally empty where no comparable benchmark exists.
 */

export const contractEvidence = Object.freeze({
  'WG-DOC-004': {
    plite: {
      public: ['packages/plite/src/interfaces/schema.ts:353-380'],
      owner: ['packages/plite/src/core/schema-compiler.ts:3689-3768'],
      consumers: ['packages/plite/test/schema-contract.ts:1059-1105'],
      lifecycle: [
        'packages/plite/src/core/schema-contribution-registry.ts:1-86',
      ],
      proof: ['packages/plite/test/schema-contract.ts:1175-1235'],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:316-359',
        'packages/core/src/lib/editor/withPlite.ts:194-253',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
      ],
      proof: [
        'packages/core/src/internal/plugin/compilePlateModel.spec.ts:711-721',
      ],
    },
  },
  'WG-DOC-006': {
    plite: {
      covers: [
        'packages/plite/src/core/resolved-token-cursor.ts:95-196',
        'packages/plite/src/interfaces/editor.ts:620-685',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
      proof: ['packages/plite/test/resolved-token-cursor.test.ts:1-132'],
    },
  },
  'WG-DOC-007': {
    plite: {
      covers: [
        'packages/plite/src/core/snapshot-index.ts:107-180',
        'packages/plite/src/core/snapshot-index.ts:1201-1325',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
      proof: ['packages/plite/test/snapshot-contract.ts:1836-2032'],
    },
  },
  'WG-DOC-008': {
    plite: {
      public: ['packages/plite/src/core/content-slice.ts:15-112'],
      owner: [
        'packages/plite/src/core/slice-fit/compiled-slice-fitter.ts:120-222',
      ],
      consumers: ['packages/plite/test/schema-contract.ts:1237-1337'],
      lifecycle: ['packages/plite/src/core/get-content-slice.ts:1-98'],
      proof: ['packages/plite/test/schema-contract.ts:1338-1447'],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:316-359',
        'packages/core/src/lib/editor/withPlite.ts:194-253',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
      ],
      proof: ['packages/core/src/lib/editor/withPlite.slow.ts:382-405'],
    },
  },
  'WG-DOC-009': {
    plite: {
      public: ['packages/plite/src/core/change/document-change.ts:24-70'],
      owner: ['packages/plite/src/core/change/builder.ts:41-110'],
      consumers: ['packages/plite/test/document-change.test.ts:1-120'],
      lifecycle: ['packages/plite/src/core/change/document-change.ts:634-760'],
      proof: ['packages/plite/test/document-change-laws.test.ts:433-525'],
    },
  },
  'WG-DOC-010': {
    plite: {
      public: ['packages/plite/src/core/change/document-change.ts:904-1028'],
      owner: ['packages/plite/src/core/change/root-change.ts:1649-1825'],
      consumers: ['packages/plite/test/document-change-laws.test.ts:700-770'],
      lifecycle: [
        'packages/plite/src/core/change/document-change.ts:1109-1135',
      ],
      proof: ['packages/plite/test/document-change-laws.test.ts:771-801'],
    },
  },
  'WG-DOC-011': {
    plite: {
      public: ['packages/plite/src/core/change/document-change.ts:1086-1108'],
      owner: ['packages/plite/src/core/change/mapping.ts:17-110'],
      consumers: [
        'packages/plite/test/document-change-relocation.test.ts:1-104',
      ],
      lifecycle: ['packages/plite/src/core/snapshot-index.ts:604-665'],
      proof: ['packages/plite/test/document-change-relocation.slow.ts:1-67'],
    },
  },
  'WG-DOC-012': {
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:838-866'],
      owner: [
        'packages/plite/src/core/slice-fit/compiled-slice-fitter.ts:120-222',
      ],
      consumers: ['packages/plite/test/schema-contract.ts:1237-1337'],
      lifecycle: ['packages/plite/src/core/editor-schema.ts:2892-3065'],
      proof: ['packages/plite/test/schema-contract.ts:1338-1447'],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:316-359',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
      ],
      proof: ['packages/core/src/lib/editor/withPlite.slow.ts:382-405'],
    },
  },
  'WG-DOC-013': {
    plite: {
      public: ['packages/plite/src/interfaces/schema-validation.ts:1-44'],
      owner: ['packages/plite/src/core/schema-validation.ts:1-126'],
      consumers: ['packages/plite-history/src/history-codec.ts:1-100'],
      lifecycle: ['packages/yjs/src/core/schema-metadata.ts:1-86'],
      proof: ['packages/plite/test/schema-contract.ts:1466-1509'],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:316-359',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
      ],
      proof: [
        'packages/core/src/internal/plugin/compilePlateModel.spec.ts:711-721',
      ],
    },
  },
  'WG-DOC-016': {
    plite: {
      public: ['packages/plite-dom/src/plugin/host-codec.ts:63-125'],
      owner: ['packages/plite-dom/src/plugin/host-codec.ts:496-596'],
      consumers: ['packages/plite-dom/test/host-codec.test.ts:1-160'],
      lifecycle: ['packages/plite-dom/src/plugin/with-dom.ts:159-230'],
      proof: ['packages/plite-dom/test/clipboard-boundary.ts:541-738'],
    },
    plate: {
      public: ['packages/core/src/static/renderStaticHtml.tsx:29-76'],
      owner: [
        'packages/core/src/internal/plugin/compilePlateCodecs.ts:213-365',
        'packages/core/src/lib/plugins/html/HtmlPlugin.ts:191-192',
      ],
      consumers: [
        'packages/core/src/static/components/PlateStatic.tsx:280-360',
      ],
      lifecycle: ['packages/core/src/static/editor/withStatic.tsx:1-51'],
      proof: ['packages/core/src/static/components/PlateStatic.spec.tsx:1-180'],
    },
  },
  'WG-DOC-018': {
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:620-685'],
      owner: ['packages/plite/src/editor/nodes.ts:1-122'],
      consumers: [
        'apps/plite/tests/plite-browser/donor/examples/query-controls.test.ts:1-170',
      ],
      lifecycle: ['packages/plite/src/core/snapshot-index.ts:107-180'],
      proof: ['packages/plite/test/transforms-contract.ts:688-835'],
    },
  },

  'WG-DOC-001B': {
    wordgard: {
      covers: [
        '../wordgard/src/doc/node.ts:63-69',
        '../wordgard/src/doc/node.ts:483-509',
        '../wordgard/src/doc/slice.ts:26-35',
      ],
      missingEvidence: [
        '../wordgard/src/doc/node.ts:665-688',
        '../wordgard/src/doc/node.ts:973-992',
      ],
      proof: ['../wordgard/test/test-node.ts:1-120'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:124-168'],
      owner: ['packages/plite/src/core/clone.ts:1-18'],
      consumers: ['packages/plite/test/write-boundary-contract.ts:1-110'],
      lifecycle: ['packages/plite/src/core/initial-value.ts:1-100'],
      proof: ['packages/plite/test/snapshot-contract.ts:2482-2521'],
    },
    plate: {
      covers: ['packages/core/src/lib/editor/withPlite.ts:106-155'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
      ],
      proof: ['packages/core/src/lib/editor/withPlite.slow.ts:382-405'],
    },
  },
  'WG-DOC-001A': {
    plite: {
      covers: [
        'packages/plite/src/interfaces/element.ts:11-44',
        'packages/plite/src/interfaces/text.ts:23-75',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
      proof: ['packages/plite/test/schema-definition.test.ts:1-140'],
    },
  },
  'WG-DOC-001C': {
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:140-168'],
      owner: ['packages/plite/src/core/element-owned-root-index.ts:236-340'],
      consumers: [
        'packages/plite/test/content-root-lifecycle-contract.test.ts:75-167',
      ],
      lifecycle: [
        'packages/plite/test/content-root-lifecycle-contract.test.ts:197-228',
      ],
      proof: ['packages/plite/test/schema-contract.ts:362-496'],
    },
  },
  'WG-DOC-002A': {
    plite: {
      covers: [
        'packages/plite/src/interfaces/schema.ts:292-345',
        'packages/plite/src/core/editor-schema.ts:543-620',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
      proof: ['packages/plite/test/schema-contract.ts:1059-1174'],
    },
  },
  'WG-DOC-002B': {
    plite: {
      public: ['packages/plite/src/interfaces/schema.ts:187-245'],
      owner: ['packages/plite/src/core/schema-compiler.ts:3759-3868'],
      consumers: ['packages/plite/test/schema-contract.ts:499-565'],
      lifecycle: ['packages/plite/src/core/editor-schema.ts:543-620'],
      proof: ['packages/plite/test/schema-contract.ts:1175-1235'],
    },
    plate: {
      covers: ['packages/core/src/internal/plugin/compilePlateModel.ts:78-191'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
      ],
      proof: [
        'apps/www/src/__tests__/package-integration/schema/plate-block-content.slow.ts:1-101',
      ],
    },
  },
  'WG-DOC-002C': {
    plate: {
      public: ['packages/basic-nodes/src/lib/BaseBlockPlugins.ts:12-86'],
      owner: ['packages/core/src/internal/plugin/compilePlateModel.ts:192-315'],
      consumers: [
        'apps/www/src/registry/components/editor/plugins/basic-blocks-base-kit.tsx:1-42',
      ],
      lifecycle: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:316-359',
      ],
      proof: ['packages/basic-nodes/src/lib/BaseBlockPlugins.spec.tsx:1-180'],
    },
  },
  'WG-DOC-002D': {
    wordgard: {
      public: ['../wordgard/src/doc/node.ts:268-323'],
      owner: ['../wordgard/src/state/state.ts:872-880'],
      consumers: ['../wordgard/test/webtest-content.ts:439-499'],
      lifecycle: ['../wordgard/src/editor/decoration.ts:117-177'],
      proof: ['../wordgard/test/webtest-content.ts:500-560'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/schema.ts:292-345'],
      owner: ['packages/plite/src/core/editor-schema.ts:543-620'],
      consumers: ['packages/plite/test/schema-contract.ts:1059-1174'],
      lifecycle: [
        'packages/plite-react/test/schema-runtime-invalidation-contract.test.ts:1-160',
      ],
      proof: ['packages/plite/test/schema-contract.ts:1175-1235'],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:192-359',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
      ],
      proof: [
        'packages/core/src/internal/plugin/compilePlateModel.spec.ts:711-721',
      ],
    },
  },
  'WG-DOC-003A': {
    plite: {
      covers: [
        'packages/plite/src/interfaces/schema.ts:46-136',
        'packages/plite/src/interfaces/editor.ts:533-566',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
      proof: ['packages/plite/test/schema-contract.ts:694-832'],
    },
    plate: {
      public: ['packages/basic-nodes/src/lib/BaseMarkPlugins.ts:1-72'],
      owner: ['packages/core/src/internal/plugin/compilePlateModel.ts:192-315'],
      consumers: [
        'apps/www/src/registry/components/editor/plugins/basic-marks-base-kit.tsx:1-38',
      ],
      lifecycle: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:316-359',
      ],
      proof: [
        'apps/www/src/__tests__/package-integration/core-static-html/serialize-html.marks.slow.ts:1-180',
      ],
    },
  },
  'WG-DOC-003B': {
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:533-566'],
      owner: ['packages/plite/src/internal/range-text-marks.ts:1-53'],
      consumers: ['packages/plite/test/snapshot-contract.ts:2607-2807'],
      lifecycle: ['packages/plite/src/editor/toggle-mark.ts:1-74'],
      proof: ['packages/plite/test/snapshot-contract.ts:2808-2877'],
    },
  },
  'WG-DOC-005A': {
    wordgard: {
      public: ['../wordgard/src/doc/schema.ts:131-156'],
      owner: ['../wordgard/src/doc/change.ts:1057-1125'],
      consumers: ['../wordgard/test/test-schema.ts:23-26'],
      lifecycle: ['../wordgard/src/doc/change.ts:1237-1239'],
      proof: ['../wordgard/test/test-schema.ts:23-58'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/schema.ts:195-218'],
      owner: ['packages/plite/src/core/editor-schema.ts:1304-1383'],
      consumers: ['packages/plite/test/schema-contract.ts:566-613'],
      lifecycle: ['packages/plite/src/core/editor-schema.ts:1384-1446'],
      proof: ['packages/plite/test/schema-contract.ts:1059-1105'],
    },
    plate: {
      covers: ['packages/core/src/lib/editor/withPlite.ts:194-213'],
      missingEvidence: [
        'packages/core/src/lib/plugins/override/OverridePlugin.ts:39-75',
      ],
      proof: ['packages/core/src/lib/editor/withPlite.slow.ts:382-405'],
    },
  },
  'WG-DOC-005B': {
    plite: {
      public: ['packages/plite/src/interfaces/text.ts:75-105'],
      owner: ['packages/plite/src/interfaces/text.ts:129-158'],
      consumers: ['packages/plite/test/document-state-contract.ts:1-120'],
      lifecycle: ['packages/plite/src/core/representation.ts:560-650'],
      proof: ['packages/plite/test/snapshot-contract.ts:2569-2606'],
    },
  },
  'WG-DOC-005C': {
    plite: {
      public: ['packages/plite/src/interfaces/text.ts:23-75'],
      owner: ['packages/plite/src/core/correction.ts:1-42'],
      consumers: ['packages/plite/test/snapshot-contract.ts:1086-1129'],
      lifecycle: ['packages/plite/src/core/representation.ts:560-650'],
      proof: ['packages/plite/test/snapshot-contract.ts:3004-3034'],
    },
  },
  'WG-DOC-017A': {
    wordgard: {
      public: ['../wordgard/src/doc/helper.ts:1-19'],
      owner: ['../wordgard/src/doc/helper.ts:20-26'],
      consumers: ['../wordgard/test/schema.ts:1-80'],
      lifecycle: ['../wordgard/src/doc/node.ts:63-98'],
      proof: ['../wordgard/test/test-prop.ts:13-47'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/text.ts:75-105'],
      owner: ['packages/plite/src/interfaces/text.ts:129-158'],
      consumers: ['packages/plite/test/document-state-contract.ts:1-120'],
      lifecycle: ['packages/plite/src/core/representation.ts:560-650'],
      proof: ['packages/plite/test/snapshot-contract.ts:2569-2606'],
    },
  },
  'WG-DOC-017B': {
    wordgard: {
      public: ['../wordgard/src/doc/error.ts:1-7'],
      owner: ['../wordgard/src/doc/helper.ts:27-36'],
      consumers: ['../wordgard/test/test-schema.ts:23-58'],
      lifecycle: ['../wordgard/src/doc/schema.ts:281-324'],
      proof: ['../wordgard/test/test-schema.ts:60-77'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/schema-validation.ts:1-44'],
      owner: ['packages/plite/src/core/schema-validation.ts:92-140'],
      consumers: ['packages/plite/test/schema-contract.ts:1448-1509'],
      lifecycle: ['packages/plite/src/core/editor-schema.ts:2165-2218'],
      proof: ['packages/plite/test/schema-definition.test.ts:1-140'],
    },
  },
  'WG-DOC-014A': {
    plite: {
      covers: ['packages/plite-dom/src/plugin/dom-html.ts:13-96'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
      proof: ['packages/plite-dom/test/host-codec.test.ts:1-160'],
    },
    plate: {
      covers: ['packages/core/src/lib/plugins/html/htmlDom.ts:63-120'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
      ],
      proof: [
        'apps/www/src/__tests__/package-integration/core-html/HtmlPlugin.slow.tsx:1-180',
      ],
    },
  },
  'WG-DOC-014B': {
    plite: {
      covers: ['packages/plite-dom/src/plugin/host-codec.ts:97-168'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
      ],
      proof: ['packages/plite-dom/test/host-codec.test.ts:160-360'],
    },
    plate: {
      covers: ['packages/core/src/lib/plugin/BasePlugin.ts:684-840'],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
      ],
      proof: ['packages/core/src/lib/plugins/ProductCodecs.spec.ts:1-180'],
    },
  },
  'WG-DOC-015A': {
    plite: {
      public: ['packages/plite-dom/src/plugin/host-codec.ts:97-168'],
      owner: ['packages/plite-dom/src/plugin/host-codec.ts:429-596'],
      consumers: ['packages/plite-dom/test/host-codec.test.ts:160-360'],
      lifecycle: ['packages/plite-dom/src/plugin/with-dom.ts:159-230'],
      proof: ['packages/plite-dom/test/host-codec.test.ts:360-560'],
    },
    plate: {
      public: ['packages/core/src/lib/plugin/BasePlugin.ts:684-840'],
      owner: [
        'packages/core/src/internal/plugin/compilePlateCodecs.ts:213-365',
      ],
      consumers: ['packages/core/src/lib/plugins/html/HtmlPlugin.ts:489-620'],
      lifecycle: [
        'packages/core/src/internal/plugin/compilePlateCodecs.ts:314-371',
      ],
      proof: ['packages/core/src/lib/plugins/ProductCodecs.spec.ts:1-180'],
    },
  },
  'WG-DOC-015B': {
    plite: {
      public: ['packages/plite-dom/src/plugin/dom-html.ts:82-96'],
      owner: ['packages/plite-dom/src/plugin/host-codec.ts:637-717'],
      consumers: ['packages/plite-dom/test/clipboard-boundary.ts:541-738'],
      lifecycle: ['packages/plite-dom/src/plugin/with-dom.ts:159-230'],
      proof: ['packages/plite-dom/test/host-codec.test.ts:560-760'],
    },
    plate: {
      public: ['packages/core/src/lib/plugins/html/HtmlPlugin.ts:489-560'],
      owner: [
        'packages/core/src/internal/plugin/compilePlateCodecs.ts:213-313',
      ],
      consumers: [
        'apps/www/src/registry/components/editor/plate-to-html.tsx:39-113',
      ],
      lifecycle: ['packages/core/src/lib/editor/withPlite.ts:194-253'],
      proof: [
        'apps/www/src/__tests__/package-integration/core-html/HtmlPlugin.slow.tsx:1-180',
      ],
    },
  },
  'WG-DOC-015C': {
    plite: {
      public: ['packages/plite/src/core/content-slice.ts:15-112'],
      owner: [
        'packages/plite/src/core/slice-fit/compiled-slice-fitter.ts:120-222',
      ],
      consumers: ['packages/plite-dom/src/plugin/host-codec.ts:637-717'],
      lifecycle: ['packages/plite/src/core/editor-schema.ts:1421-1455'],
      proof: ['packages/plite/test/schema-contract.ts:1338-1447'],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateCodecs.ts:213-365',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
      ],
      proof: ['packages/core/src/lib/plugins/ProductCodecs.spec.ts:180-360'],
    },
  },
  'WG-DOC-004B1': {
    wordgard: {
      public: ['../wordgard/src/doc/schema.ts:344-390'],
      owner: ['../wordgard-website/site/examples/schema/outliner.ts:1-38'],
      consumers: ['../wordgard-website/site/examples/schema/index.md:139-172'],
      lifecycle: ['../wordgard/src/doc/schema.ts:307-343'],
      proof: ['../wordgard/test/test-schema.ts:38-58'],
    },
    plite: {
      covers: ['packages/plite/src/core/schema-compiler.ts:2760-2780'],
      missingEvidence: ['packages/plite/src/core/schema-compiler.ts:2781-2825'],
      proof: ['packages/plite/test/schema-contract.ts:1603-1621'],
    },
    plate: {
      covers: ['packages/core/src/internal/plugin/resolvePlugins.ts:1513-1536'],
      missingEvidence: [
        'packages/core/src/lib/plugin/defineBasePlugin.ts:228-280',
      ],
      proof: ['packages/core/src/internal/plugin/resolvePlugins.spec.tsx:1-80'],
    },
  },
  'WG-DOC-004B2': {
    wordgard: {
      public: ['../wordgard-website/site/examples/schema/index.md:139-172'],
      owner: ['../wordgard-website/site/examples/schema/outliner.ts:1-38'],
      consumers: ['../wordgard-website/site/examples/schema/index.md:173-210'],
      lifecycle: ['../wordgard/src/doc/schema.ts:307-343'],
      proof: ['../wordgard/test/test-schema.ts:38-58'],
    },
    plite: {
      covers: ['packages/plite/src/core/schema-compiler.ts:2760-2780'],
      missingEvidence: ['packages/plite/src/core/schema-compiler.ts:2781-2825'],
      proof: ['packages/plite/test/schema-contract.ts:1603-1621'],
    },
    plate: {
      covers: ['packages/core/src/internal/plugin/resolvePlugins.ts:1513-1536'],
      missingEvidence: [
        'packages/core/src/lib/plugin/defineBasePlugin.ts:228-280',
      ],
      proof: ['packages/core/src/internal/plugin/resolvePlugins.spec.tsx:1-80'],
    },
  },

  'LOCAL-DOC-ROOTS': {
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:140-168'],
      owner: ['packages/plite/src/interfaces/schema.ts:220-246'],
      consumers: [
        'packages/plite/test/content-root-lifecycle-contract.test.ts:75-167',
      ],
      lifecycle: [
        'packages/plite/test/content-root-lifecycle-contract.test.ts:197-228',
      ],
      proof: ['packages/plite/test/schema-contract.ts:362-496'],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:316-359',
      ],
      missingEvidence: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
      ],
      proof: [
        'packages/core/src/internal/plugin/compilePlateModel.spec.ts:84-103',
      ],
    },
  },
  'LOCAL-ANCHORS': {
    plite: {
      public: ['packages/plite/src/core/anchor.ts:36-60'],
      owner: ['packages/plite/src/core/anchor.ts:180-260'],
      consumers: ['packages/plite/test/anchor-contract.ts:1-100'],
      lifecycle: ['packages/plite/src/core/anchor-state.ts:210-275'],
      proof: ['packages/plite/test/anchor-mapping-contract.ts:1-180'],
    },
  },
  'LOCAL-SCHEMA-IDENTITY': {
    wordgard: {
      covers: ['../wordgard/src/doc/schema.ts:192-274'],
      missingEvidence: ['../wordgard/src/doc/schema.ts:281-324'],
      proof: ['../wordgard/test/test-schema.ts:23-58'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/schema.ts:353-380'],
      owner: ['packages/plite/src/core/schema-compiler.ts:1292-1427'],
      consumers: ['packages/plite/test/schema-contract.ts:1059-1105'],
      lifecycle: ['packages/plite-history/src/history-codec.ts:26-92'],
      proof: ['packages/plite/test/schema-contract.ts:906-1058'],
    },
    plate: {
      public: ['packages/core/src/lib/editor/withPlite.ts:194-253'],
      owner: ['packages/core/src/internal/plugin/compilePlateModel.ts:316-359'],
      consumers: [
        'packages/core/src/internal/plugin/compilePlateModel.spec.ts:84-103',
      ],
      lifecycle: ['packages/core/src/lib/editor/withPlite.ts:670-715'],
      proof: ['packages/core/src/lib/editor/withPlite.slow.ts:582-606'],
    },
  },
  'PLATE-PLUGIN-IDENTITY': {
    wordgard: {
      covers: [
        '../wordgard/src/doc/node.ts:25-61',
        '../wordgard/src/doc/schema.ts:207-239',
      ],
      missingEvidence: ['../wordgard/src/doc/schema.ts:307-323'],
      proof: ['../wordgard/test/test-schema.ts:23-58'],
    },
    plite: {
      public: ['packages/plite/src/core/editor-extension.ts:662-687'],
      owner: ['packages/plite/src/core/editor-extension.ts:1827-1905'],
      consumers: ['packages/plite/src/interfaces/editor.ts:2363-2402'],
      lifecycle: ['packages/plite/src/core/editor-extension.ts:2099-2159'],
      proof: ['packages/plite/test/extension-namespace-contract.ts:1-80'],
    },
    plate: {
      covers: [
        'packages/core/src/lib/plugin/defineBasePlugin.ts:592-780',
        'packages/core/src/lib/plugin/BasePlugin.ts:1225-1262',
      ],
      missingEvidence: ['packages/core/src/lib/plugin/BasePlugin.ts:1239-1255'],
      proof: ['packages/core/src/lib/plugin/defineBasePlugin.spec.ts:20-90'],
    },
  },
  'PLATE-HEADING-ONTOLOGY': {
    wordgard: {
      public: ['../wordgard/src/types/schema.ts:14-35'],
      owner: ['../wordgard/src/schema/block.ts:57-114'],
      consumers: ['../wordgard/test/test-commands.ts:513-555'],
      lifecycle: ['../wordgard/src/schema/block.ts:115-170'],
      proof: ['../wordgard/test/test-commands.ts:556-620'],
    },
    plate: {
      public: ['packages/basic-nodes/src/lib/BaseHeadingPlugins.ts:21-68'],
      owner: ['packages/basic-nodes/src/lib/BaseHeadingPlugins.ts:70-243'],
      consumers: [
        'packages/basic-nodes/src/lib/BaseHeadingPlugins.spec.tsx:38-106',
      ],
      lifecycle: [
        'packages/basic-nodes/src/lib/BaseHeadingPlugins.spec.tsx:107-176',
      ],
      proof: [
        'packages/basic-nodes/src/lib/BaseHeadingPlugins.spec.tsx:179-255',
      ],
    },
  },
  'LOCAL-SCHEMA-DEFAULT-SIDECHANNEL': {
    wordgard: {
      public: ['../wordgard/src/doc/schema.ts:131-156'],
      owner: ['../wordgard/src/doc/schema.ts:192-274'],
      consumers: ['../wordgard/test/test-schema.ts:23-26'],
      lifecycle: ['../wordgard/src/state/state.ts:26-36'],
      proof: ['../wordgard/test/test-schema.ts:23-58'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/schema.ts:187-218'],
      owner: ['packages/plite/src/core/editor-schema.ts:1304-1383'],
      consumers: ['packages/plite/test/schema-contract.ts:566-613'],
      lifecycle: ['packages/plite/src/core/editor-schema.ts:85-101'],
      proof: ['packages/plite/test/schema-contract.ts:1059-1105'],
    },
    plate: {
      covers: [
        'packages/core/src/lib/editor/withPlite.ts:670-675',
        'packages/core/src/lib/plugins/override/OverridePlugin.ts:39-75',
      ],
      missingEvidence: ['packages/core/src/lib/editor/withPlite.ts:194-213'],
      proof: ['packages/core/src/lib/editor/withPlite.slow.ts:382-405'],
    },
  },
});

export const dimensionEvidenceKeys = Object.freeze({
  'WG-DOC-004': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.covers'],
    ['plite.consumers', 'plate.covers'],
    ['plite.owner', 'plate.covers'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-DOC-006': [
    ['plite.proof'],
    ['plite.covers'],
    ['plite.covers'],
    ['plite.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-007': [
    ['plite.proof'],
    ['plite.covers'],
    ['plite.covers'],
    ['plite.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-008': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.covers'],
    ['plite.consumers', 'plate.covers'],
    ['plite.owner', 'plate.covers'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-DOC-009': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-010': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-011': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-012': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.covers'],
    ['plite.consumers', 'plate.covers'],
    ['plite.owner', 'plate.covers'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-DOC-013': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.covers'],
    ['plite.consumers', 'plate.covers'],
    ['plite.owner', 'plate.covers'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-DOC-016': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['plite.consumers', 'plate.consumers'],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-DOC-018': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-001B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-001A': [
    ['plite.proof'],
    ['plite.covers'],
    ['plite.covers'],
    ['plite.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-001C': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-002A': [
    ['plite.proof'],
    ['plite.covers'],
    ['plite.covers'],
    ['plite.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-002B': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.covers'],
    ['plite.consumers', 'plate.covers'],
    ['plite.owner', 'plate.covers'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-DOC-002C': [
    ['plate.proof'],
    ['plate.public'],
    ['plate.consumers'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-DOC-002D': [
    ['plite.proof'],
    ['plite.public'],
    ['wordgard.public', 'plite.public', 'plate.covers'],
    ['wordgard.owner', 'plite.owner', 'plate.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-003A': [
    ['plite.proof', 'plate.proof'],
    ['plite.covers', 'plate.public'],
    ['plite.covers', 'plate.consumers'],
    ['plite.covers', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-DOC-003B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-005A': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-005B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-005C': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-017A': [
    ['wordgard.proof', 'plite.proof'],
    ['wordgard.public', 'plite.public'],
    ['wordgard.consumers', 'plite.consumers'],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['wordgard.proof', 'plite.proof'],
  ],
  'WG-DOC-017B': [
    ['wordgard.proof', 'plite.proof'],
    ['wordgard.public', 'plite.public'],
    ['wordgard.consumers', 'plite.consumers'],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['wordgard.proof', 'plite.proof'],
  ],
  'WG-DOC-014A': [
    ['plite.proof', 'plate.proof'],
    ['plite.covers', 'plate.covers'],
    ['plite.covers', 'plate.covers'],
    ['plite.covers', 'plate.covers'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-DOC-014B': [
    ['plite.proof', 'plate.proof'],
    ['plite.covers', 'plate.covers'],
    ['plite.covers', 'plate.covers'],
    ['plite.covers', 'plate.covers'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-DOC-015A': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['plite.consumers', 'plate.consumers'],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-DOC-015B': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['plite.consumers', 'plate.consumers'],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-DOC-015C': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.covers'],
    ['plite.consumers', 'plate.covers'],
    ['plite.owner', 'plate.covers'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-DOC-004B1': [
    ['wordgard.proof'],
    ['wordgard.public'],
    ['wordgard.consumers'],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-DOC-004B2': [[], [], [], [], [], []],
  'LOCAL-DOC-ROOTS': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'LOCAL-ANCHORS': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'LOCAL-SCHEMA-IDENTITY': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'PLATE-PLUGIN-IDENTITY': [
    [],
    ['wordgard.covers', 'plite.public', 'plate.covers'],
    ['wordgard.covers', 'plite.consumers', 'plate.covers'],
    ['wordgard.covers', 'plite.owner', 'plate.covers'],
    [],
    [],
  ],
  'PLATE-HEADING-ONTOLOGY': [
    ['plate.proof'],
    ['plate.public'],
    ['wordgard.public', 'plate.public'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'LOCAL-SCHEMA-DEFAULT-SIDECHANNEL': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['wordgard.owner'],
    [],
    ['plite.proof'],
  ],
});

/**
 * Direct comparison evidence for meta, website, command, and proof rows.
 *
 * Dimension array order is correctness, API, data, ownership, runtime, proof.
 * Empty arrays are intentional for not-applicable and insufficient dimensions.
 * Runtime stays empty unless the cited artifacts measure comparable behavior.
 */

export const contractEvidence = Object.freeze({
  'WG-META-001': {
    wordgard: {
      covers: [
        '../wordgard/package.json:6-28',
        '../wordgard/bin/packages.ts:8-33',
      ],
      public: ['../wordgard/package.json:6-28'],
      owner: ['../wordgard/bin/packages.ts:8-33'],
      consumers: ['../wordgard-website/site/docs/ref/index.md:1-35'],
      lifecycle: ['../wordgard/bin/build.ts:265-314'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-published-package-probe.json:1-18',
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-published-package-probe.json:142-187',
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-published-package-probe.json:443-447',
      ],
    },
    plite: {
      covers: ['packages/plite/package.json:35-63'],
      public: ['packages/plite/package.json:35-55'],
      owner: ['packages/plite/src/index.ts:1-70'],
      consumers: [
        'packages/plite/test/public-package-import-smoke.test.ts:43-83',
      ],
      lifecycle: ['tooling/scripts/check-plite-release-artifacts.mjs:582-623'],
      proof: ['tooling/scripts/check-plite-release-artifacts.test.mjs:217-239'],
    },
    plate: {
      covers: ['packages/core/package.json:25-67'],
      public: ['packages/core/package.json:25-55'],
      owner: ['packages/core/src/index.ts:1-100'],
      consumers: ['packages/plate/src/type.spec.ts:1-11'],
      lifecycle: ['tooling/scripts/check-plite-release-artifacts.mjs:602-623'],
      proof: [
        'tooling/scripts/check-plite-release-artifacts.slow.test.mjs:15-99',
      ],
    },
  },
  'WG-META-002': {
    wordgard: {
      covers: [
        '../wordgard/bin/build.ts:13-84',
        '../wordgard/bin/build.ts:265-326',
      ],
      public: ['../wordgard/package.json:20-28'],
      owner: ['../wordgard/bin/build.ts:13-84'],
      consumers: ['../wordgard/package.json:6-18'],
      lifecycle: ['../wordgard/bin/build.ts:265-326'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-published-package-probe.json:16-140',
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-published-package-probe.json:443-447',
      ],
    },
    plite: {
      covers: ['packages/plite/package.json:35-63'],
      public: ['packages/plite/package.json:37-63'],
      owner: ['tooling/config/tsdown.config.ts:1-137'],
      consumers: ['tooling/scripts/check-plite-release-artifacts.mjs:297-345'],
      lifecycle: ['tooling/scripts/check-plite-release-artifacts.mjs:582-623'],
      proof: ['tooling/scripts/check-package-build-artifacts.test.mjs:1-195'],
    },
    plate: {
      covers: ['packages/core/package.json:25-67'],
      public: ['packages/core/package.json:25-67'],
      owner: ['tooling/config/tsdown.config.ts:1-137'],
      consumers: ['tooling/scripts/check-plite-release-artifacts.mjs:346-579'],
      lifecycle: ['tooling/scripts/check-plite-release-artifacts.mjs:582-623'],
      proof: [
        'tooling/scripts/check-plite-release-artifacts.slow.test.mjs:15-99',
      ],
    },
  },
  'WG-META-003': {
    wordgard: {
      covers: ['../wordgard/package.json:20-26'],
      public: ['../wordgard/package.json:20-26'],
      owner: ['../wordgard/bin/test-headless.ts:1-64'],
      consumers: ['../wordgard/bin/run-testserver.ts:1-5'],
      lifecycle: ['../wordgard/bin/test-headless.ts:1-64'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:115-180',
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1320-1400',
      ],
    },
    plite: {
      covers: ['tooling/scripts/check-plite.mjs:240-448'],
      public: ['package.json:42-47'],
      owner: ['tooling/scripts/check-plite.mjs:240-448'],
      consumers: ['tooling/scripts/check-plite.mjs:474-558'],
      lifecycle: ['tooling/scripts/check-plite.mjs:625-680'],
      proof: ['tooling/scripts/check-plite.test.mjs:43-123'],
    },
    plate: {
      covers: ['tooling/scripts/check-plite.mjs:330-354'],
      public: ['package.json:42-47'],
      owner: ['tooling/scripts/check-plite.mjs:330-354'],
      consumers: ['tooling/scripts/check-plite.mjs:419-447'],
      lifecycle: ['tooling/scripts/check-plite.mjs:495-558'],
      proof: ['tooling/scripts/check-plite.test.mjs:521-584'],
    },
  },
  'WG-META-004A': {
    wordgard: {
      public: ['../wordgard/README.md:1-24'],
      owner: ['../wordgard/demo/demo.ts:1-15'],
      consumers: ['../wordgard/README.md:1-24'],
      lifecycle: ['../wordgard/demo/demo.ts:1-15'],
      proof: ['../wordgard/demo/demo.ts:1-15'],
    },
    plite: {
      public: ['apps/plite/src/app/page.tsx:1-20'],
      owner: ['apps/plite/src/app/page.tsx:1-20'],
      consumers: [
        'apps/plite/tests/plite-browser/donor/examples/example-navigation.test.ts:16-62',
      ],
      lifecycle: ['apps/plite/src/app/page.tsx:1-20'],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/example-navigation.test.ts:16-62',
      ],
    },
    plate: {
      public: ['apps/www/src/registry/registry-examples.ts:1-160'],
      owner: ['apps/www/src/registry/registry-examples.ts:160-360'],
      consumers: ['content/docs/(guides)/feature-kits.mdx:1-137'],
      lifecycle: ['apps/www/src/registry/registry-examples.ts:360-560'],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:640-760',
      ],
    },
  },
  'WG-META-004B': {
    wordgard: {
      public: ['../wordgard-website/site/examples/index.html:1-84'],
      owner: ['../wordgard-website/src/build.ts:64-110'],
      consumers: ['../wordgard-website/site/examples/index.html:1-84'],
      lifecycle: ['../wordgard-website/src/build.ts:194-210'],
      proof: ['../wordgard-website/src/build.ts:89-109'],
    },
    plite: {
      covers: ['apps/plite/src/app/page.tsx:1-20'],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/example-navigation.test.ts:16-62',
      ],
    },
    plate: {
      covers: [
        'apps/www/src/registry/registry-examples.ts:1-160',
        'content/docs/(guides)/feature-kits.mdx:1-137',
      ],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:640-760',
      ],
    },
  },
  'WG-META-004C': {
    wordgard: {
      public: ['../wordgard-website/site/try/index.html:1-154'],
      owner: ['../wordgard-website/site/try/try.ts:143-250'],
      consumers: ['../wordgard-website/site/try/index.html:120-154'],
      lifecycle: ['../wordgard-website/site/try/sandbox.js:1-51'],
      proof: ['../wordgard-website/site/try/try.ts:190-237'],
    },
  },
  'WG-META-004D': {
    wordgard: {
      public: ['../wordgard-website/site/docs/prosemirror/index.md:1-349'],
      owner: ['../wordgard-website/site/docs/prosemirror/index.md:1-120'],
      consumers: ['../wordgard-website/site/docs/prosemirror/index.md:121-260'],
      lifecycle: ['../wordgard-website/site/docs/prosemirror/index.md:261-349'],
      proof: ['../wordgard-website/site/docs/prosemirror/index.md:1-349'],
    },
    plate: {
      covers: ['content/docs/plite/migration.mdx:1-220'],
      proof: ['content/docs/plite/migration.mdx:220-420'],
    },
  },
  'WG-META-005A': {
    wordgard: {
      covers: ['../wordgard/bin/test-dead-code.ts:1-46'],
      proof: ['../wordgard/bin/test-dead-code.ts:18-46'],
    },
    plite: {
      covers: ['tooling/scripts/check-plite-release-artifacts.mjs:297-345'],
      public: ['tooling/scripts/check-plite-release-artifacts.mjs:297-345'],
      owner: ['tooling/scripts/check-plite-release-artifacts.mjs:582-623'],
      consumers: ['tooling/scripts/check-plite-release-artifacts.mjs:629-673'],
      lifecycle: [
        'tooling/scripts/check-plite-release-artifacts.mjs:1036-1080',
      ],
      proof: ['tooling/scripts/check-plite-release-artifacts.test.mjs:217-239'],
    },
    plate: {
      covers: ['tooling/scripts/check-plite-release-artifacts.mjs:79-104'],
      public: ['tooling/scripts/check-plite-release-artifacts.mjs:79-104'],
      owner: ['tooling/scripts/check-plite-release-artifacts.mjs:582-623'],
      consumers: ['tooling/scripts/check-plite-release-artifacts.mjs:629-673'],
      lifecycle: [
        'tooling/scripts/check-plite-release-artifacts.mjs:1036-1080',
      ],
      proof: [
        'tooling/scripts/check-plite-release-artifacts.slow.test.mjs:15-99',
      ],
    },
  },
  'WG-META-005B': {
    wordgard: {
      covers: ['../wordgard/bin/mass-change.ts:1-22'],
      public: ['../wordgard/bin/mass-change.ts:5-8'],
      owner: ['../wordgard/bin/mass-change.ts:11-22'],
      consumers: ['../wordgard/bin/mass-change.ts:5-8'],
      lifecycle: ['../wordgard/bin/mass-change.ts:13-22'],
      proof: ['../wordgard/bin/mass-change.ts:13-22'],
    },
  },
  'WG-META-002B': {
    wordgard: {
      covers: ['../wordgard/bin/build.ts:129-263'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-namespace-bundle-probe.json:1-93',
      ],
    },
    plite: {
      covers: [
        'packages/plite/package.json:35-55',
        'tooling/scripts/check-plite-release-artifacts.mjs:297-345',
      ],
      proof: [
        'tooling/scripts/check-plite-release-artifacts.test.mjs:217-239',
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/runtime-api-bundle-probe.json:1-38',
      ],
    },
    plate: {
      covers: [
        'packages/core/package.json:25-55',
        'tooling/scripts/check-plite-release-artifacts.mjs:79-104',
      ],
      proof: [
        'tooling/scripts/check-plite-release-artifacts.slow.test.mjs:15-99',
      ],
    },
  },
  'WG-WEB-001': {
    wordgard: {
      covers: [
        '../wordgard-website/src/build.ts:145-171',
        '../wordgard-website/src/build.ts:222-237',
        '../wordgard-website/template/ref.html:1-28',
        '../wordgard-website/site/docs/ref/index.md:1-32',
        '../wordgard/package.json:6-18',
        '../wordgard/bin/build.ts:276-279',
      ],
    },
  },
  'WG-WEB-002': {
    wordgard: {
      covers: ['../wordgard-website/src/mapdir.ts:39-78'],
      proof: ['../wordgard-website/src/mapdir.ts:65-76'],
    },
  },
  'WG-WEB-003': {
    wordgard: {
      covers: ['../wordgard-website/site/docs/ref/ref.js:1-149'],
      proof: ['../wordgard-website/site/docs/ref/ref.js:15-40'],
    },
    plate: {
      public: ['apps/www/src/app/api/search/route.ts:33-195'],
      owner: ['apps/www/src/app/api/search/route.ts:93-195'],
      consumers: ['apps/www/src/components/command-menu-dialog.tsx:317-421'],
      lifecycle: [
        'apps/www/src/components/docs-toc.tsx:51-124',
        'apps/www/src/app/(app)/docs/[[...slug]]/doc-breadcrumb.tsx:49-163',
      ],
      proof: [
        'apps/www/src/app/api/search/route.test.ts:25-99',
        'apps/www/src/lib/search-result-groups.test.ts:8-62',
        'apps/www/src/components/command-menu-dialog.test.tsx:56-205',
      ],
    },
  },

  'WG-CMD-001A': {
    wordgard: {
      public: ['../wordgard/src/command/command.ts:19-55'],
      owner: ['../wordgard/src/command/command.ts:4-17'],
      consumers: ['../wordgard/src/command/command.ts:78-96'],
      lifecycle: ['../wordgard/src/command/command.ts:57-76'],
      proof: ['../wordgard/test/test-commands.ts:200-240'],
    },
    plite: {
      covers: ['packages/plite/src/core/command-definition.ts:50-110'],
      public: ['packages/plite/src/core/command-definition.ts:73-110'],
      owner: ['packages/plite/src/core/command-registry.ts:47-121'],
      consumers: ['packages/plite/src/core/editor-commands.ts:492-513'],
      lifecycle: ['packages/plite/src/core/command-registry.ts:133-218'],
      proof: ['packages/plite/test/command-spec.test.ts:100-180'],
    },
    plate: {
      covers: ['packages/core/src/lib/plugin/BasePlugin.ts:1697-1732'],
      proof: ['packages/core/src/internal/plugin/resolvePlugins.spec.tsx:1-80'],
    },
  },
  'WG-CMD-001B': {
    wordgard: {
      public: ['../wordgard/src/command/command.ts:36-43'],
      owner: ['../wordgard/src/command/command.ts:4-17'],
      consumers: ['../wordgard/src/command/command.ts:78-96'],
      lifecycle: ['../wordgard/src/command/command.ts:57-61'],
      proof: ['../wordgard/test/test-commands.ts:200-240'],
    },
    plite: {
      public: ['packages/plite/src/core/command-definition.ts:50-70'],
      owner: ['packages/plite/src/core/command-registry.ts:58-121'],
      consumers: ['packages/plite/src/core/command-registry.ts:133-218'],
      lifecycle: ['packages/plite/src/core/command-registry.ts:133-218'],
      proof: ['packages/plite/test/command-spec.test.ts:1064-1394'],
    },
    plate: {
      covers: ['packages/list/src/lib/BaseListPlugin.ts:1080-1170'],
      proof: ['packages/list/src/lib/BaseListPlugin.spec.tsx:1080-1241'],
    },
  },
  'WG-CMD-002A': {
    wordgard: {
      public: ['../wordgard/src/command/command.ts:43-55'],
      owner: ['../wordgard/src/command/commands.ts:13-108'],
      consumers: ['../wordgard/src/command/command.ts:83-96'],
      lifecycle: ['../wordgard/src/command/commands.ts:20-108'],
      proof: ['../wordgard/test/test-commands.ts:200-240'],
    },
    plite: {
      public: ['packages/plite/src/core/command-definition.ts:73-110'],
      owner: ['packages/plite/src/core/editor-commands.ts:492-738'],
      consumers: ['packages/plite/src/core/command-registry.ts:133-218'],
      lifecycle: ['packages/plite/src/core/command-registry.ts:219-316'],
      proof: ['packages/plite/test/command-spec.test.ts:502-576'],
    },
    plate: {
      covers: ['packages/list/src/lib/BaseListPlugin.ts:1080-1170'],
      proof: ['packages/list/src/lib/BaseListPlugin.spec.tsx:1080-1241'],
    },
  },
  'WG-CMD-002B': {
    wordgard: {
      public: ['../wordgard/src/command/command.ts:19-43'],
      owner: ['../wordgard/src/command/commands.ts:111-141'],
      consumers: ['../wordgard/src/editor/keymap.ts:168-223'],
      lifecycle: ['../wordgard/src/command/command.ts:81-96'],
      proof: ['../wordgard/test/webtest-content.ts:1-120'],
    },
    plite: {
      covers: [
        'packages/plite-react/src/editable/keyboard-input-strategy.ts:147-220',
      ],
      proof: [
        'packages/plite-react/test/keyboard-input-strategy-contract.test.ts:1-180',
      ],
    },
    plate: {
      public: ['packages/core/src/react/editor/PlateEditor.ts:1-70'],
      owner: [
        'packages/core/src/react/components/EditorShortcutDispatcher.tsx:1-160',
      ],
      consumers: ['packages/core/src/react/components/Plate.tsx:1-160'],
      lifecycle: [
        'packages/core/src/react/components/EditorShortcutDispatcher.tsx:1-160',
      ],
      proof: [
        'packages/core/src/react/components/EditorShortcutDispatcher.spec.tsx:71-220',
      ],
    },
  },
  'WG-CMD-003A1': {
    wordgard: {
      public: ['../wordgard/src/command/commands.ts:13-33'],
      owner: ['../wordgard/src/command/commands.ts:20-33'],
      consumers: ['../wordgard/src/editor/input.ts:680-708'],
      lifecycle: ['../wordgard/src/command/command.ts:43-96'],
      proof: ['../wordgard/test/webtest-content.ts:110-123'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:3788-3811'],
      owner: ['packages/plite/src/core/editor-commands.ts:644-669'],
      consumers: ['packages/plite/src/interfaces/editor.ts:3887-3915'],
      lifecycle: ['packages/plite/src/core/command-registry.ts:133-218'],
      proof: ['packages/plite/test/command-spec.test.ts:733-815'],
    },
    plate: {
      covers: [
        'packages/core/src/lib/plugins/input-rules/InputRulesPlugin.ts:234-308',
      ],
      proof: ['packages/core/src/react/utils/inputRules.spec.tsx:73-167'],
    },
  },
  'WG-CMD-003A2': {
    wordgard: {
      public: ['../wordgard/src/command/commands.ts:85-120'],
      owner: ['../wordgard/src/command/helper.ts:223-350'],
      consumers: ['../wordgard/src/editor/input.ts:680-708'],
      lifecycle: ['../wordgard/src/command/command.ts:43-96'],
      proof: ['../wordgard/test/test-commands.ts:258-286'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:3750-3787'],
      owner: ['packages/plite/src/core/editor-commands.ts:522-632'],
      consumers: ['packages/plite/src/interfaces/editor.ts:3841-3886'],
      lifecycle: ['packages/plite/src/core/command-registry.ts:133-218'],
      proof: ['packages/plite/test/command-spec.test.ts:599-731'],
    },
    plate: {
      covers: ['packages/list/src/lib/BaseListPlugin.ts:1087-1118'],
      proof: ['packages/list/src/lib/BaseListPlugin.spec.tsx:639-742'],
    },
  },
  'WG-CMD-003A3': {
    wordgard: {
      public: ['../wordgard/src/command/commands.ts:59-108'],
      owner: ['../wordgard/src/command/helper.ts:120-221'],
      consumers: ['../wordgard/src/editor/input.ts:680-708'],
      lifecycle: ['../wordgard/src/command/command.ts:43-96'],
      proof: ['../wordgard/test/test-commands.ts:200-397'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:3812-3840'],
      owner: ['packages/plite/src/core/editor-commands.ts:634-643'],
      consumers: ['packages/plite/src/interfaces/editor.ts:3916-3956'],
      lifecycle: ['packages/plite/src/core/command-registry.ts:133-218'],
      proof: ['packages/plite/test/command-spec.test.ts:641-731'],
    },
    plate: {
      covers: ['packages/list/src/lib/BaseListPlugin.ts:1119-1182'],
      proof: ['packages/list/src/lib/BaseListPlugin.spec.tsx:639-742'],
    },
  },
  'WG-CMD-003B1A': {
    wordgard: {
      public: ['../wordgard/src/command/commands.ts:160-173'],
      owner: ['../wordgard/src/command/commands.ts:162-173'],
      consumers: ['../wordgard/src/schema/block.ts:120-240'],
      lifecycle: ['../wordgard/src/command/helper.ts:608-641'],
      proof: ['../wordgard/test/test-commands.ts:515-554'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/transforms/node.ts:156-212'],
      owner: ['packages/plite/src/core/public-state.ts:3138-3208'],
      consumers: ['packages/plite/src/interfaces/editor.ts:3950-4008'],
      lifecycle: ['packages/plite/src/core/editor-commands.ts:686-738'],
      proof: ['packages/plite/test/transforms-contract.ts:817-882'],
    },
    plate: {
      public: ['packages/basic-nodes/src/lib/BaseBlockPlugins.ts:68-78'],
      owner: ['packages/basic-nodes/src/lib/BaseBlockPlugins.ts:117-199'],
      consumers: [
        'packages/basic-nodes/src/lib/BaseBlockPlugins.spec.tsx:52-90',
      ],
      lifecycle: ['packages/basic-nodes/src/lib/BaseBlockPlugins.ts:162-198'],
      proof: ['packages/basic-nodes/src/lib/BaseBlockPlugins.spec.tsx:52-90'],
    },
  },
  'WG-CMD-003B1B': {
    wordgard: {
      public: ['../wordgard/src/command/commands.ts:198-217'],
      owner: ['../wordgard/src/command/commands.ts:200-211'],
      consumers: ['../wordgard/src/schema/block.ts:120-240'],
      lifecycle: ['../wordgard/src/command/helper.ts:608-641'],
      proof: ['../wordgard/test/test-commands.ts:556-590'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/transforms/node.ts:232-248'],
      owner: ['packages/plite/src/transforms-node/wrap-nodes.ts:25-112'],
      consumers: ['packages/plite/src/core/public-state.ts:3670-3677'],
      lifecycle: ['packages/plite/src/transforms-node/wrap-nodes.ts:185-251'],
      proof: ['packages/plite/test/transforms-contract.ts:1331-1406'],
    },
    plate: {
      public: ['packages/basic-nodes/src/lib/BaseBlockPlugins.ts:68-78'],
      owner: ['packages/basic-nodes/src/lib/BaseBlockPlugins.ts:117-199'],
      consumers: [
        'packages/basic-nodes/src/lib/BaseBlockPlugins.spec.tsx:52-90',
      ],
      lifecycle: ['packages/basic-nodes/src/lib/BaseBlockPlugins.ts:162-198'],
      proof: ['packages/basic-nodes/src/lib/BaseBlockPlugins.spec.tsx:52-90'],
    },
  },
  'WG-CMD-003B1C': {
    wordgard: {
      public: ['../wordgard/src/command/commands.ts:175-196'],
      owner: ['../wordgard/src/command/commands.ts:178-196'],
      consumers: ['../wordgard/src/schema/block.ts:120-240'],
      lifecycle: ['../wordgard/src/command/helper.ts:608-641'],
      proof: ['../wordgard/test/test-commands.ts:592-658'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/transforms/node.ts:214-231'],
      owner: ['packages/plite/src/transforms-node/unwrap-nodes.ts:88-177'],
      consumers: ['packages/plite/src/core/public-state.ts:3665-3673'],
      lifecycle: ['packages/plite/src/transforms-node/unwrap-nodes.ts:177-271'],
      proof: ['packages/plite/test/transforms-contract.ts:1408-1465'],
    },
    plate: {
      public: ['packages/basic-nodes/src/lib/BaseBlockPlugins.ts:68-78'],
      owner: ['packages/basic-nodes/src/lib/BaseBlockPlugins.ts:117-199'],
      consumers: [
        'packages/basic-nodes/src/lib/BaseBlockPlugins.spec.tsx:129-187',
      ],
      lifecycle: ['packages/basic-nodes/src/lib/BaseBlockPlugins.ts:162-198'],
      proof: ['packages/basic-nodes/src/lib/BaseBlockPlugins.spec.tsx:129-187'],
    },
  },
  'WG-CMD-003B2A': {
    wordgard: {
      public: ['../wordgard/src/command/commands.ts:259-279'],
      owner: ['../wordgard/src/command/commands.ts:263-279'],
      consumers: ['../wordgard/src/schema/block.ts:120-240'],
      lifecycle: ['../wordgard/src/command/commands.ts:263-279'],
      proof: ['../wordgard/test/test-commands.ts:515-555'],
    },
    plate: {
      public: ['packages/basic-styles/src/lib/BaseStylePlugins.ts:386-430'],
      owner: ['packages/basic-styles/src/lib/BaseStylePlugins.ts:386-534'],
      consumers: [
        'packages/basic-styles/src/lib/BaseStylePlugins.spec.ts:450-550',
      ],
      lifecycle: ['packages/basic-styles/src/lib/BaseStylePlugins.ts:386-534'],
      proof: ['packages/basic-styles/src/lib/BaseStylePlugins.spec.ts:502-580'],
    },
  },
  'WG-CMD-003B2B': {
    wordgard: {
      public: ['../wordgard/src/command/commands.ts:281-299'],
      owner: ['../wordgard/src/command/commands.ts:285-299'],
      consumers: ['../wordgard/src/schema/block.ts:120-240'],
      lifecycle: ['../wordgard/src/command/commands.ts:285-299'],
      proof: ['../wordgard/src/command/commands.ts:285-299'],
    },
  },
  'WG-CMD-003C1': {
    wordgard: {
      public: ['../wordgard/src/command/commands.ts:301-317'],
      owner: ['../wordgard/src/command/commands.ts:303-317'],
      consumers: ['../wordgard/src/schema/block.ts:240-332'],
      lifecycle: ['../wordgard/src/command/commands.ts:329-420'],
      proof: ['../wordgard/test/test-commands.ts:660-805'],
    },
    plite: {
      covers: ['packages/plite/src/core/editor-commands.ts:725-738'],
      proof: ['packages/plite/test/command-spec.test.ts:816-859'],
    },
    plate: {
      public: ['packages/list/src/lib/BaseListPlugin.ts:699-721'],
      owner: ['packages/list/src/lib/BaseListPlugin.ts:722-1008'],
      consumers: ['packages/list/src/lib/BaseListPlugin.spec.tsx:148-176'],
      lifecycle: ['packages/list/src/lib/BaseListPlugin.ts:760-1008'],
      proof: ['packages/list/src/lib/BaseListPlugin.spec.tsx:148-176'],
    },
  },
  'WG-CMD-003C2': {
    wordgard: {
      public: ['../wordgard/src/command/index.ts:88-112'],
      owner: ['../wordgard/src/command/helper.ts:108-221'],
      consumers: ['../wordgard/src/command/commands.ts:85-108'],
      lifecycle: ['../wordgard/src/command/helper.ts:108-221'],
      proof: ['../wordgard/test/test-commands.ts:288-397'],
    },
    plite: {
      covers: [
        'packages/plite/src/core/editor-commands.ts:522-643',
        'packages/plite/src/core/editor-commands.ts:725-738',
      ],
      proof: ['packages/plite/test/command-spec.test.ts:599-731'],
    },
    plate: {
      public: ['packages/list/src/lib/BaseListPlugin.ts:722-760'],
      owner: ['packages/list/src/lib/BaseListPlugin.ts:1087-1182'],
      consumers: ['packages/list/src/lib/BaseListPlugin.spec.tsx:639-742'],
      lifecycle: ['packages/list/src/lib/BaseListPlugin.ts:1087-1182'],
      proof: ['packages/list/src/lib/BaseListPlugin.spec.tsx:639-742'],
    },
  },
  'WG-CMD-003D1': {
    wordgard: {
      public: ['../wordgard/src/command/commands.ts:219-257'],
      owner: ['../wordgard/src/command/commands.ts:223-245'],
      consumers: ['../wordgard/src/command/menu.ts:125-151'],
      lifecycle: ['../wordgard/src/command/commands.ts:223-245'],
      proof: ['../wordgard/test/test-commands.ts:807-863'],
    },
    plite: {
      covers: [
        'packages/plite/src/core/editor-commands.ts:481-485',
        'packages/plite/src/core/editor-commands.ts:712-724',
      ],
      proof: ['packages/plite/test/command-spec.test.ts:816-914'],
    },
    plate: {
      public: ['packages/basic-nodes/src/lib/BaseMarkPlugins.ts:100-145'],
      owner: ['packages/basic-nodes/src/lib/BaseMarkPlugins.ts:100-433'],
      consumers: [
        'packages/basic-nodes/src/lib/BaseMarkPlugins.spec.tsx:1-180',
      ],
      lifecycle: ['packages/basic-nodes/src/lib/BaseMarkPlugins.ts:128-145'],
      proof: ['packages/basic-nodes/src/lib/BaseMarkPlugins.spec.tsx:180-360'],
    },
  },
  'WG-CMD-003D2': {
    wordgard: {
      public: ['../wordgard/src/command/index.ts:88-112'],
      owner: ['../wordgard/src/command/helper.ts:593-605'],
      consumers: [
        '../wordgard/src/command/commands.ts:223-242',
        '../wordgard/src/command/menu.ts:125-149',
      ],
      lifecycle: ['../wordgard/src/command/helper.ts:593-605'],
    },
    plite: {
      covers: ['packages/plite/src/editor/add-mark.ts:24-83'],
      proof: ['packages/plite/test/transaction-contract.ts:695-780'],
    },
    plate: {
      covers: ['packages/basic-nodes/src/lib/BaseMarkPlugins.ts:100-250'],
      proof: ['packages/basic-nodes/src/lib/BaseMarkPlugins.spec.tsx:65-270'],
    },
  },
  'WG-CMD-003E1': {
    wordgard: {
      public: ['../wordgard/src/command/commands.ts:432-487'],
      owner: ['../wordgard/src/command/commands.ts:432-487'],
      consumers: ['../wordgard/src/editor/keymap.ts:240-330'],
      lifecycle: ['../wordgard/src/command/commands.ts:432-487'],
      proof: ['../wordgard/test/test-selection.ts:1-180'],
    },
    plite: {
      public: ['packages/plite/src/core/editor-commands.ts:451-475'],
      owner: ['packages/plite/src/core/editor-commands.ts:670-703'],
      consumers: ['packages/plite/src/interfaces/editor.ts:3860-3970'],
      lifecycle: ['packages/plite/src/core/command-registry.ts:133-218'],
      proof: ['packages/plite/test/command-spec.test.ts:1009-1055'],
    },
    plate: {
      covers: ['packages/core/src/react/components/Plate.tsx:1-160'],
      proof: [
        'packages/core/src/react/components/EditorShortcutDispatcher.spec.tsx:71-220',
      ],
    },
  },
  'WG-CMD-003E2': {
    wordgard: {
      public: ['../wordgard/src/command/commands.ts:487-575'],
      owner: ['../wordgard/src/command/commands.ts:487-575'],
      consumers: ['../wordgard/src/editor/keymap.ts:240-330'],
      lifecycle: ['../wordgard/src/command/commands.ts:487-575'],
      proof: ['../wordgard/test/test-selection.ts:102-158'],
    },
    plite: {
      public: ['packages/plite/src/core/editor-commands.ts:451-453'],
      owner: ['packages/plite/src/core/editor-commands.ts:670-673'],
      consumers: ['packages/plite/src/interfaces/editor.ts:3850-3870'],
      lifecycle: ['packages/plite/src/transforms-selection/move.ts:13-58'],
      proof: ['packages/plite/test/word-boundary-proof.test.ts:29-93'],
    },
    plate: {
      covers: ['packages/plite-react/src/editable/caret-engine.ts:677-843'],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/navigation-bidi.test.ts:93-197',
      ],
    },
  },
  'WG-CMD-004A1': {
    wordgard: {
      public: ['../wordgard/src/editor/keymap.ts:44-118'],
      owner: ['../wordgard/src/editor/keymap.ts:168-223'],
      consumers: ['../wordgard/src/editor/keymap.ts:240-288'],
      lifecycle: ['../wordgard/src/editor/keymap.ts:289-330'],
      proof: ['../wordgard/src/editor/keymap.ts:44-118'],
    },
    plite: {
      covers: ['packages/plite/src/core/command-definition.ts:73-110'],
      proof: ['packages/plite/test/command-spec.test.ts:100-180'],
    },
    plate: {
      public: ['packages/core/src/lib/plugin/BasePlugin.ts:1697-1732'],
      owner: [
        'packages/core/src/internal/plugin/compilePlateShortcuts.ts:136-171',
      ],
      consumers: ['packages/core/src/react/utils/shortcuts.spec.tsx:58-218'],
      lifecycle: [
        'packages/core/src/internal/plugin/resolvePlugins.ts:1109-1248',
      ],
      proof: [
        'packages/core/src/react/components/EditorShortcutDispatcher.spec.tsx:71-220',
      ],
    },
  },
  'WG-CMD-004A2': {
    wordgard: {
      public: ['../wordgard/src/command/menu.ts:10-153'],
      owner: ['../wordgard/src/command/menu.ts:235-278'],
      consumers: ['../wordgard/src/command/menu.ts:311-358'],
      lifecycle: ['../wordgard/src/command/menu.ts:396-470'],
      proof: ['../wordgard/src/command/menu.ts:396-470'],
    },
    plate: {
      covers: [
        'apps/www/src/registry/components/editor/plugins/fixed-toolbar-kit.tsx:1-19',
      ],
      proof: ['apps/www/src/registry/ui/mark-toolbar-button.spec.tsx:1-120'],
    },
  },
  'WG-CMD-004B': {
    wordgard: {
      covers: [
        '../wordgard/src/editor/keymap.ts:99-118',
        '../wordgard/src/editor/keymap.ts:289-330',
      ],
    },
    plite: {
      covers: [
        'packages/plite/src/core/command-definition.ts:73-110',
        'packages/plite/src/core/command-registry.ts:47-56',
      ],
    },
    plate: {
      covers: ['packages/core/src/internal/plugin/resolvePlugins.ts:1109-1248'],
    },
  },

  'WG-PROOF-001A': {
    wordgard: {
      covers: [
        '../wordgard/test/test-node.ts:1-136',
        '../wordgard/test/test-pos.ts:1-77',
      ],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1320-1400',
      ],
    },
    plite: {
      public: [
        'packages/plite/src/interfaces/node.ts:1-120',
        'packages/plite/src/interfaces/path.ts:1-90',
      ],
      owner: ['packages/plite/test/document-state-contract.ts:1-90'],
      consumers: ['packages/plite/test/snapshot-contract.ts:109-220'],
      lifecycle: ['packages/plite/test/state-tx-public-api-contract.ts:24-180'],
      proof: ['packages/plite/test/document-state-contract.ts:91-203'],
    },
    plate: {
      covers: ['packages/core/src/lib/editor/withPlite.ts:194-253'],
      proof: ['packages/core/src/lib/editor/withPlite.slow.ts:382-405'],
    },
  },
  'WG-PROOF-001B': {
    wordgard: {
      covers: ['../wordgard/test/test-change.ts:1-180'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1320-1400',
      ],
    },
    plite: {
      public: ['packages/plite/src/core/change/document-change.ts:50-180'],
      owner: ['packages/plite/test/document-change-laws.test.ts:1-120'],
      consumers: ['packages/plite/test/document-change.test.ts:1-160'],
      lifecycle: ['packages/plite/test/support/document-change.ts:1-52'],
      proof: ['packages/plite/test/document-change-laws.test.ts:431-525'],
    },
    plate: {
      covers: ['packages/core/src/lib/editor/withPlite.ts:194-253'],
      proof: ['packages/core/src/lib/editor/withPlite.slow.ts:382-405'],
    },
  },
  'WG-PROOF-001C': {
    wordgard: {
      covers: ['../wordgard/test/test-schema.ts:1-76'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1320-1400',
      ],
    },
    plite: {
      public: ['packages/plite/src/interfaces/schema.ts:1-180'],
      owner: ['packages/plite/test/schema-definition.test.ts:1-160'],
      consumers: ['packages/plite/test/schema-contract.ts:1059-1235'],
      lifecycle: ['packages/plite/test/schema-identity-contract.test.ts:1-149'],
      proof: ['packages/plite/test/schema-contract.ts:1580-1787'],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:316-359',
      ],
      proof: [
        'packages/core/src/internal/plugin/compilePlateModel.spec.ts:711-721',
      ],
    },
  },
  'WG-PROOF-001D': {
    wordgard: {
      covers: ['../wordgard/test/generate.ts:1-160'],
      proof: ['../wordgard/test/test-change.ts:471-574'],
    },
    plite: {
      public: ['packages/plite/src/core/change/document-change.ts:180-320'],
      owner: ['packages/plite/test/document-change-laws.test.ts:431-525'],
      consumers: ['packages/plite/test/schema-laws.test.ts:111-216'],
      lifecycle: ['packages/plite/test/schema-compiler-laws.test.ts:105-248'],
      proof: ['packages/plite/test/document-change-laws.test.ts:568-800'],
    },
    plate: {
      covers: ['packages/core/src/internal/plugin/resolvePlugins.ts:1109-1248'],
      proof: ['packages/core/src/internal/plugin/resolvePlugins.spec.tsx:1-80'],
    },
  },
  'WG-PROOF-002A1': {
    wordgard: {
      covers: ['../wordgard/test/test-state.ts:1-126'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1320-1400',
      ],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:2850-3060'],
      owner: ['packages/plite/test/state-tx-public-api-contract.ts:24-180'],
      consumers: ['packages/plite/test/document-state-contract.ts:1-203'],
      lifecycle: ['packages/plite/test/snapshot-contract.ts:1180-1460'],
      proof: ['packages/plite/test/state-tx-public-api-contract.ts:186-443'],
    },
    plate: {
      covers: ['packages/core/src/lib/editor/withPlite.ts:194-253'],
      proof: ['packages/core/src/lib/editor/withPlite.slow.ts:382-405'],
    },
  },
  'WG-PROOF-002A2': {
    wordgard: {
      covers: ['../wordgard/test/test-selection.ts:1-180'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1320-1400',
      ],
    },
    plite: {
      public: ['packages/plite/src/interfaces/selection.ts:1-106'],
      owner: ['packages/plite/test/selection-protocol.test.ts:158-317'],
      consumers: ['packages/plite/test/selection-rebase-contract.ts:37-127'],
      lifecycle: ['packages/plite/test/selection-protocol.test.ts:364-480'],
      proof: ['packages/plite/test/selection-protocol.test.ts:480-559'],
    },
    plate: {
      covers: ['packages/core/src/react/components/Plate.tsx:1-160'],
      proof: [
        'packages/core/src/react/components/EditorShortcutDispatcher.spec.tsx:71-220',
      ],
    },
  },
  'WG-PROOF-002A3': {
    wordgard: {
      covers: ['../wordgard/test/test-commands.ts:1-180'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1320-1400',
      ],
    },
    plite: {
      public: ['packages/plite/src/core/command-definition.ts:1-110'],
      owner: ['packages/plite/test/command-spec.test.ts:100-395'],
      consumers: ['packages/plite/test/generic-command-contract.ts:1-131'],
      lifecycle: ['packages/plite/src/core/command-registry.ts:133-316'],
      proof: ['packages/plite/test/command-spec.test.ts:1064-1394'],
    },
    plate: {
      covers: ['packages/core/src/internal/plugin/resolvePlugins.ts:1109-1248'],
      proof: ['packages/core/src/internal/plugin/resolvePlugins.spec.tsx:1-80'],
    },
  },
  'WG-PROOF-002A4': {
    wordgard: {
      covers: ['../wordgard/test/test-correction.ts:1-85'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1320-1400',
      ],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:2360-2400'],
      owner: ['packages/plite/src/core/correction.ts:1-42'],
      consumers: ['packages/plite/test/normalization-contract.ts:141-278'],
      lifecycle: ['packages/plite/test/normalization-contract.ts:934-1099'],
      proof: ['packages/plite/test/normalization-contract.ts:1220-1381'],
    },
    plate: {
      covers: ['packages/core/src/internal/plugin/resolvePlugins.ts:1109-1248'],
      proof: ['packages/core/src/internal/plugin/resolvePlugins.spec.tsx:1-80'],
    },
  },
  'WG-PROOF-002B': {
    wordgard: {
      covers: ['../wordgard/test/test-history.ts:1-180'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1320-1400',
      ],
    },
    plite: {
      public: ['packages/plite-history/src/history-extension.ts:1-160'],
      owner: [
        'packages/plite-history/test/history-branch-contract.spec.ts:1-200',
      ],
      consumers: [
        'packages/plite-history/test/history-persistence-contract.spec.ts:1-180',
      ],
      lifecycle: [
        'packages/plite-history/test/history-persistence-contract.spec.ts:180-420',
      ],
      proof: [
        'packages/plite-history/test/history-persistence-contract.spec.ts:420-825',
      ],
    },
    plate: {
      covers: ['packages/core/src/lib/editor/withPlite.ts:194-253'],
      proof: ['packages/core/src/lib/editor/withPlite.slow.ts:382-405'],
    },
  },
  'WG-PROOF-002C': {
    wordgard: {
      covers: ['../wordgard/test/test-collab.ts:1-220'],
      proof: ['../wordgard/test/test-collab.ts:1-220'],
    },
    plite: {
      public: ['packages/yjs/src/core/extension.ts:17-80'],
      owner: ['packages/yjs/src/core/extension.ts:81-160'],
      consumers: ['packages/yjs/test/editor-adapter-contract.spec.ts:1-33'],
      lifecycle: ['packages/yjs/test/provider-contract.spec.ts:1-180'],
      proof: ['packages/yjs/test/schema-identity-contract.spec.ts:1-180'],
    },
    plate: {
      covers: ['packages/yjs/src/lib/BaseYjsPlugin.ts:1-18'],
      proof: ['packages/yjs/src/lib/BaseYjsPlugin.api.spec.ts:1-160'],
    },
  },
  'WG-PROOF-003': {
    wordgard: {
      covers: [
        '../wordgard/test/test-table-commands.ts:1-212',
        '../wordgard/test/test-table-correction.ts:1-41',
        '../wordgard/test/test-table-paste.ts:1-124',
      ],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1320-1400',
      ],
    },
    plite: {
      covers: ['packages/plite/src/interfaces/editor.ts:3428-3472'],
      proof: ['packages/plite/test/command-spec.test.ts:1431-1542'],
    },
    plate: {
      public: ['packages/table/src/lib/BaseTablePlugin.ts:1-180'],
      owner: ['packages/table/src/lib/BaseTablePlugin.ts:180-520'],
      consumers: [
        'packages/table/src/react/TablePlugin.navigation.spec.tsx:1-180',
      ],
      lifecycle: ['packages/table/src/lib/BaseTablePlugin.ts:520-900'],
      proof: [
        'packages/table/src/lib/BaseTablePlugin.grid.spec.tsx:1-180',
        'packages/table/src/lib/BaseTablePlugin.paste.spec.tsx:1-180',
        'packages/table/src/lib/BaseTablePlugin.selection.spec.tsx:1-180',
      ],
    },
  },
  'WG-PROOF-004A': {
    wordgard: {
      covers: ['../wordgard/test/webtest-content.ts:1-180'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1320-1400',
      ],
    },
    plite: {
      public: ['packages/plite-react/src/components/editable.tsx:105-260'],
      owner: ['packages/plite-react/src/editable/caret-engine.ts:677-843'],
      consumers: [
        'apps/plite/tests/plite-browser/donor/examples/visual-native-selection-smoke.test.ts:15-177',
      ],
      lifecycle: [
        'packages/plite-react/src/editable/selection-controller.ts:1-180',
      ],
      proof: ['packages/plite-react/test/caret-engine-contract.test.ts:1-58'],
    },
    plate: {
      public: ['packages/core/src/react/components/Plate.tsx:20-66'],
      owner: ['apps/www/src/registry/ui/editor.tsx:1-132'],
      consumers: [
        'apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:640-860',
      ],
      lifecycle: [
        'apps/www/src/registry/components/editor/editor-kit.tsx:1-103',
      ],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/visual-native-selection-smoke.test.ts:177-430',
      ],
    },
  },
  'WG-PROOF-004B': {
    wordgard: {
      covers: [
        '../wordgard/test/webtest-composition.ts:1-177',
        '../wordgard/test/webtest-dom-changes.ts:1-126',
      ],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1320-1400',
      ],
    },
    plite: {
      public: [
        'packages/plite-react/src/editable/runtime-before-input-events.ts:1-180',
      ],
      owner: [
        'packages/plite-react/src/editable/native-input-strategy.ts:1-165',
      ],
      consumers: [
        'packages/plite-react/src/editable/native-text-input-delta.ts:1-106',
      ],
      lifecycle: [
        'packages/plite-react/src/editable/dom-repair-queue.ts:54-240',
      ],
      proof: [
        'packages/plite-react/test/runtime-before-input-events-contract.test.ts:47-126',
        'packages/plite-react/test/composition-state-contract.test.ts:1-180',
      ],
    },
    plate: {
      public: ['packages/core/src/react/components/Plate.tsx:1-160'],
      owner: ['apps/www/src/registry/ui/editor.tsx:1-132'],
      consumers: [
        'apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:1406-1878',
      ],
      lifecycle: [
        'apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:1878-2396',
      ],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts:561-740',
      ],
    },
  },
  'WG-PROOF-004C': {
    plite: {
      covers: [
        'apps/plite/tests/plite-browser/mobile-lab.test.ts:4-54',
        'packages/browser/src/core/release-proof.ts:10-107',
      ],
      proof: [
        'packages/browser/test/core/mobile-device-proof-command.test.ts:15-39',
      ],
    },
    plate: {
      covers: [
        'packages/browser/src/core/mobile-transport-proof.ts:3-98',
        'packages/browser/src/core/release-proof.ts:149-187',
      ],
      proof: ['packages/browser/test/core/release-proof.test.ts:14-86'],
    },
  },
  'WG-PROOF-005A1A': {
    wordgard: {
      covers: [
        '../wordgard-website/src/build.ts:89-109',
        '../wordgard-website/site/examples/index.html:1-84',
      ],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-published-package-probe.json:1-18',
      ],
    },
    plite: {
      covers: ['apps/plite/src/app/page.tsx:1-20'],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/example-navigation.test.ts:16-62',
      ],
    },
    plate: {
      public: ['apps/www/package.json:28-36'],
      owner: ['apps/www/scripts/check-registry-source.mts:1-120'],
      consumers: ['apps/www/src/app/api/registry-source/[name]/route.ts:14-56'],
      lifecycle: ['apps/www/scripts/check-registry-source.mts:120-313'],
      proof: [
        'apps/www/src/app/api/registry-source/[name]/route.test.ts:34-53',
        'apps/www/src/registry/registry.test.ts:12-80',
      ],
    },
  },
  'WG-PROOF-005A1B': {
    wordgard: {
      covers: ['../wordgard/package.json:6-28'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-published-package-probe.json:142-187',
      ],
    },
    plite: {
      covers: ['tooling/scripts/check-plite-release-artifacts.mjs:297-345'],
      proof: ['tooling/scripts/check-package-build-artifacts.test.mjs:1-195'],
    },
    plate: {
      public: ['package.json:108-113'],
      owner: ['.github/workflows/registry.yml:87-108'],
      consumers: ['apps/www/scripts/check-registry-source.mts:137-228'],
      lifecycle: ['.github/workflows/registry.yml:95-119'],
      proof: ['.github/workflows/registry.yml:110-119'],
    },
  },
  'WG-PROOF-005A2': {
    wordgard: {
      covers: ['../wordgard-website/site/examples/index.html:1-84'],
    },
    plite: {
      covers: [
        'apps/plite/tests/plite-browser/donor/examples/example-navigation.test.ts:16-62',
      ],
    },
    plate: {
      covers: ['apps/www/src/registry/registry-examples.ts:1-160'],
    },
  },
  'WG-PROOF-005B1': {
    wordgard: {
      covers: [
        '../wordgard-website/src/build.ts:145-171',
        '../wordgard-website/src/build.ts:222-237',
      ],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1320-1390',
      ],
    },
    plite: {
      covers: ['tooling/scripts/check-plite-docs.mjs:1-180'],
      proof: ['tooling/scripts/check-plite-docs.test.mjs:1-220'],
    },
    plate: {
      covers: ['apps/www/scripts/check-docs-source-parity.mts:1-180'],
      proof: ['apps/www/src/lib/docs-page-tree.test.ts:37-51'],
    },
  },
  'WG-PROOF-005B2': {
    wordgard: {
      covers: ['../wordgard-website/src/build.ts:222-237'],
      proof: ['../wordgard-website/src/mapdir.ts:39-78'],
    },
    plate: {
      public: ['apps/www/scripts/check-docs-source-parity.mts:1-180'],
      owner: ['apps/www/scripts/check-docs-source-parity.mts:180-400'],
      consumers: ['apps/www/src/app/api/search/route.ts:93-195'],
      lifecycle: ['apps/www/src/components/command-menu-dialog.tsx:317-421'],
      proof: [
        'apps/www/src/lib/docs-page-tree.test.ts:37-51',
        'apps/www/src/app/api/search/route.test.ts:25-99',
      ],
    },
  },
  'WG-PROOF-005B3A': {
    wordgard: {
      public: ['../wordgard-website/src/build.ts:64-88'],
      owner: ['../wordgard-website/src/build.ts:89-109'],
      consumers: ['../wordgard-website/site/examples/index.html:1-84'],
      lifecycle: ['../wordgard-website/src/build.ts:194-210'],
      proof: ['../wordgard-website/src/build.ts:89-109'],
    },
    plate: {
      covers: ['apps/www/scripts/check-registry-source.mts:1-120'],
      proof: [
        'apps/www/src/app/api/registry-source/[name]/route.test.ts:34-53',
      ],
    },
  },
  'WG-PROOF-005B3B': {
    wordgard: {
      covers: ['../wordgard-website/src/build.ts:64-110'],
      proof: ['../wordgard-website/src/build.ts:194-210'],
    },
    plate: {
      covers: ['apps/www/scripts/check-registry-source.mts:1-120'],
      proof: [
        'apps/www/src/app/api/registry-source/[name]/route.test.ts:34-53',
      ],
    },
  },

  'LOCAL-PROOF-AFFECTED-CHECKS': {
    wordgard: {
      covers: ['../wordgard/package.json:20-26'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1399-1400',
      ],
    },
    plite: {
      public: ['package.json:42-47'],
      owner: ['tooling/scripts/check-plite.mjs:240-448'],
      consumers: ['tooling/scripts/check-plite.mjs:474-558'],
      lifecycle: ['tooling/scripts/check-plite.mjs:625-680'],
      proof: ['tooling/scripts/check-plite.test.mjs:43-123'],
    },
    plate: {
      public: ['package.json:42-47'],
      owner: ['tooling/scripts/check-plite.mjs:330-354'],
      consumers: ['tooling/scripts/check-plite.mjs:419-447'],
      lifecycle: ['tooling/scripts/check-plite.mjs:495-558'],
      proof: ['tooling/scripts/check-plite.test.mjs:521-584'],
    },
  },
  'LOCAL-PROOF-BROWSER-COVERAGE': {
    wordgard: {
      covers: ['../wordgard/package.json:21-25'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:1399-1400',
      ],
    },
    plite: {
      public: ['package.json:47-47', 'package.json:125-125'],
      owner: ['apps/plite/scripts/plite-proof-inputs.mjs:222-259'],
      consumers: ['apps/plite/scripts/plite-browser-runner.mjs:850-932'],
      lifecycle: ['apps/plite/scripts/plite-browser-runner.mjs:935-1035'],
      proof: ['apps/plite/scripts/plite-proof-inputs.test.mjs:1-180'],
    },
    plate: {
      public: ['.github/workflows/plite-ci.yml:294-345'],
      owner: ['apps/plite/scripts/plite-browser-runner.mjs:850-932'],
      consumers: [
        'apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:640-860',
      ],
      lifecycle: ['apps/plite/scripts/merge-plite-browser-summaries.mjs:1-29'],
      proof: ['.github/workflows/plite-ci.yml:337-345'],
    },
  },
  'LOCAL-PROOF-CI-MATRIX': {
    plite: {
      public: ['.github/workflows/plite-ci.yml:170-214'],
      owner: ['.github/workflows/plite-ci.yml:214-347'],
      consumers: ['.github/workflows/plite-ci.yml:347-426'],
      lifecycle: ['.github/workflows/plite-ci.yml:426-529'],
      proof: ['tooling/scripts/check-plite.test.mjs:500-519'],
    },
    plate: {
      public: ['.github/workflows/plite-ci.yml:191-214'],
      owner: ['.github/workflows/plite-ci.yml:214-347'],
      consumers: ['.github/workflows/plite-ci.yml:347-426'],
      lifecycle: ['.github/workflows/plite-ci.yml:426-529'],
      proof: ['tooling/scripts/check-plite.test.mjs:521-584'],
    },
  },
  'LOCAL-PROOF-TRACE-REDUCTION': {
    plite: {
      public: ['packages/browser/src/playwright/scenario-replay.ts:732-818'],
      owner: ['packages/browser/src/playwright/scenario-replay.ts:732-818'],
      consumers: [
        'apps/plite/tests/plite-browser/donor/stress/stress-utils.ts:141-216',
      ],
      lifecycle: [
        'packages/browser/src/playwright/scenario-replay.ts:1085-1113',
      ],
      proof: ['packages/browser/test/core/scenario.test.ts:39-78'],
    },
    plate: {
      covers: [
        'apps/plite/tests/plite-browser/donor/stress/replay.test.ts:1-57',
      ],
      proof: ['packages/browser/test/core/scenario.test.ts:431-470'],
    },
  },
  'LOCAL-PROOF-RELEASE-GATES': {
    wordgard: {
      covers: ['../wordgard/package.json:20-28'],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-published-package-probe.json:1-18',
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:183-365',
      ],
    },
    plite: {
      public: ['package.json:11-25', 'package.json:42-47'],
      owner: ['tooling/scripts/bench-targets.mjs:39-48'],
      consumers: ['tooling/scripts/bench-targets.mjs:219-260'],
      lifecycle: ['benchmarks/editor/benchmarks/benchmark-artifact.ts:1-20'],
      proof: [
        'tooling/scripts/bench-targets.test.mjs:1-120',
        'benchmarks/editor/benchmarks/benchmark-artifact.test.ts:1-19',
      ],
    },
    plate: {
      public: ['tooling/scripts/check-plite-release-artifacts.mjs:38-105'],
      owner: ['tooling/scripts/check-plite-release-artifacts.mjs:582-623'],
      consumers: ['tooling/scripts/check-plite-release-artifacts.mjs:629-680'],
      lifecycle: [
        'tooling/scripts/check-plite-release-artifacts.mjs:1036-1080',
      ],
      proof: [
        'tooling/scripts/check-plite-release-artifacts.test.mjs:217-239',
        'tooling/scripts/check-plite-release-artifacts.slow.test.mjs:15-99',
      ],
    },
  },
});

export const dimensionEvidenceKeys = Object.freeze({
  'WG-META-001': [
    ['wordgard.proof', 'plite.proof', 'plate.proof'],
    ['wordgard.public', 'plite.public', 'plate.public'],
    [],
    ['wordgard.owner', 'plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-META-002': [
    ['wordgard.proof', 'plite.proof'],
    ['plite.public', 'plate.public'],
    [],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-META-003': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    [],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-META-004A': [
    ['wordgard.proof', 'plite.proof', 'plate.proof'],
    ['wordgard.public', 'plite.public', 'plate.public'],
    [],
    ['wordgard.owner', 'plite.owner', 'plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-META-004B': [
    ['wordgard.proof'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-META-004C': [
    ['wordgard.proof'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-META-004D': [
    ['wordgard.proof'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-META-005A': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    [],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-META-005B': [
    ['wordgard.proof'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-META-002B': [
    ['plite.proof'],
    ['plite.covers'],
    [],
    ['plite.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-WEB-001': [[], ['wordgard.covers'], [], ['wordgard.covers'], [], []],
  'WG-WEB-002': [[], [], [], [], [], []],
  'WG-WEB-003': [
    ['plate.proof'],
    ['wordgard.covers', 'plate.public'],
    [],
    ['wordgard.covers', 'plate.owner'],
    [],
    ['plate.proof'],
  ],

  'WG-CMD-001A': [
    ['plite.proof'],
    ['plite.covers'],
    [],
    ['plite.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-CMD-001B': [
    ['plite.proof'],
    ['plite.public'],
    [],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-CMD-002A': [
    ['plite.proof'],
    ['plite.public'],
    [],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-CMD-002B': [
    ['wordgard.proof', 'plate.proof'],
    ['plite.covers', 'plate.public'],
    [],
    ['plite.covers', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-CMD-003A1': [
    ['wordgard.proof', 'plite.proof'],
    ['plite.public'],
    ['wordgard.public', 'plite.public'],
    ['plite.owner', 'plate.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-CMD-003A2': [
    ['wordgard.proof', 'plite.proof'],
    ['plite.public'],
    ['wordgard.public', 'plite.public'],
    ['plite.owner', 'plate.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-CMD-003A3': [
    ['wordgard.proof', 'plite.proof'],
    ['plite.public'],
    ['wordgard.public', 'plite.public'],
    ['plite.owner', 'plate.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-CMD-003B1A': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['wordgard.public', 'plite.public', 'plate.public'],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-CMD-003B1B': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['wordgard.public', 'plite.public', 'plate.public'],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-CMD-003B1C': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['wordgard.public', 'plite.public', 'plate.public'],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-CMD-003B2A': [
    ['wordgard.proof', 'plate.proof'],
    ['plate.public'],
    ['wordgard.public', 'plate.public'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-CMD-003B2B': [
    ['wordgard.proof'],
    ['wordgard.public'],
    ['wordgard.consumers'],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-CMD-003C1': [
    ['wordgard.proof', 'plate.proof'],
    ['plate.public'],
    ['wordgard.public', 'plate.public'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-CMD-003C2': [
    ['plate.proof'],
    ['plate.public'],
    ['wordgard.public', 'plate.public'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-CMD-003D1': [
    ['plite.proof', 'plate.proof'],
    ['plate.public'],
    ['plite.covers', 'plate.public'],
    ['plite.covers', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-CMD-003D2': [
    ['wordgard.owner'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-CMD-003E1': [
    ['plite.proof'],
    ['plite.public'],
    [],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-CMD-003E2': [
    ['plite.proof'],
    ['plite.public'],
    [],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-CMD-004A1': [
    ['wordgard.proof', 'plate.proof'],
    ['wordgard.public', 'plate.public'],
    [],
    ['wordgard.owner', 'plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-CMD-004A2': [
    ['wordgard.proof', 'plate.proof'],
    ['plate.covers'],
    [],
    ['wordgard.owner', 'plate.covers'],
    [],
    [],
  ],
  'WG-CMD-004B': [[], [], [], [], [], []],

  'WG-PROOF-001A': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-PROOF-001B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-PROOF-001C': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-PROOF-001D': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-PROOF-002A1': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-PROOF-002A2': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-PROOF-002A3': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-PROOF-002A4': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-PROOF-002B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-PROOF-002C': [
    ['wordgard.proof', 'plite.proof'],
    ['wordgard.covers', 'plite.public'],
    ['wordgard.covers', 'plite.consumers'],
    ['wordgard.covers', 'plite.owner'],
    [],
    [],
  ],
  'WG-PROOF-003': [
    ['plate.proof'],
    ['plate.public'],
    ['plate.consumers'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-PROOF-004A': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['plite.consumers', 'plate.consumers'],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-PROOF-004B': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['plite.consumers', 'plate.consumers'],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-PROOF-004C': [[], [], [], [], [], []],
  'WG-PROOF-005A1A': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-PROOF-005A1B': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-PROOF-005A2': [[], [], [], [], [], []],
  'WG-PROOF-005B1': [[], ['wordgard.covers'], [], ['wordgard.covers'], [], []],
  'WG-PROOF-005B2': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-PROOF-005B3A': [
    ['wordgard.proof'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-PROOF-005B3B': [[], [], [], [], [], []],

  'LOCAL-PROOF-AFFECTED-CHECKS': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    [],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'LOCAL-PROOF-BROWSER-COVERAGE': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    [],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'LOCAL-PROOF-CI-MATRIX': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    [],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'LOCAL-PROOF-TRACE-REDUCTION': [
    ['plite.proof'],
    ['plite.public'],
    [],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'LOCAL-PROOF-RELEASE-GATES': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    [],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
});

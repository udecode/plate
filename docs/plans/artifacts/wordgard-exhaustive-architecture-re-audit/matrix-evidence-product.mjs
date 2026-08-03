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

const partial = ({ covers, proof }) =>
  Object.freeze({
    covers: Array.isArray(covers) ? covers : [covers],
    proof: Array.isArray(proof) ? proof : [proof],
  });

const dimensionKeys = (contracts, { runtime = [] } = {}) => {
  const sides = Object.entries(contracts);
  const facet = (exactFacet, partialFacet = 'covers') =>
    sides.map(
      ([side, contract]) =>
        `${side}.${exactFacet in contract ? exactFacet : partialFacet}`
    );

  return Object.freeze([
    facet('proof', 'proof'),
    facet('public'),
    facet('owner'),
    facet('owner'),
    Object.freeze([...runtime]),
    facet('proof', 'proof'),
  ]);
};

const wordgardParagraph = exact({
  public: '../wordgard/src/types/schema.ts:7-16',
  owner: '../wordgard/src/schema/block.ts:29-58',
  consumers: '../wordgard/src/schema/bundle.ts:42-55',
  lifecycle: '../wordgard/src/schema/block.ts:36-58',
  proof: '../wordgard/test/test-commands.ts:513-555',
});

const plateParagraph = exact({
  public: 'packages/core/src/lib/plugins/paragraph/BaseParagraphPlugin.ts:5-24',
  owner: 'packages/core/src/lib/plugins/paragraph/BaseParagraphPlugin.ts:5-22',
  consumers:
    'apps/www/src/registry/components/editor/plugins/basic-blocks-base-kit.tsx:11-41',
  lifecycle:
    'packages/core/src/lib/plugins/paragraph/BaseParagraphPlugin.ts:5-22',
  proof:
    'packages/core/src/lib/plugins/paragraph/BaseParagraphPlugin.spec.ts:1-28',
});

const wordgardCodeBlock = exact({
  public: '../wordgard/src/types/schema.ts:40-57',
  owner: '../wordgard/src/schema/code.ts:9-56',
  consumers: '../wordgard/src/schema/bundle.ts:42-55',
  lifecycle: '../wordgard/src/schema/code.ts:17-56',
  proof: [
    '../wordgard/test/test-change.ts:415-416',
    '../wordgard/test/test-commands.ts:513-555',
  ],
});

const plateCodeBlock = exact({
  public: 'packages/code-block/src/lib/BaseCodeBlockPlugin.ts:64-157',
  owner: 'packages/code-block/src/lib/BaseCodeBlockPlugin.ts:238-492',
  consumers:
    'apps/www/src/registry/components/editor/plugins/code-block-kit.tsx:1-30',
  lifecycle: 'packages/code-block/src/lib/BaseCodeBlockPlugin.ts:493-730',
  proof: [
    'packages/code-block/src/lib/BaseCodeBlockPlugin.spec.tsx:31-166',
    'packages/code-block/src/lib/BaseCodeBlockPlugin.spec.tsx:966-1075',
  ],
});

const wordgardAlignment = exact({
  public: '../wordgard/src/types/schema.ts:284-296',
  owner: '../wordgard/src/schema/block.ts:120-183',
  consumers: '../wordgard/src/schema/bundle.ts:42-55',
  lifecycle: '../wordgard/src/schema/block.ts:129-183',
  proof: '../wordgard/src/schema/block.ts:120-183',
});

const plateAlignment = exact({
  public: 'packages/basic-styles/src/lib/BaseStylePlugins.ts:387-443',
  owner: 'packages/basic-styles/src/lib/BaseStylePlugins.ts:387-443',
  consumers:
    'apps/www/src/registry/components/editor/plugins/align-base-kit.tsx:1-7',
  lifecycle: 'packages/basic-styles/src/lib/BaseStylePlugins.ts:418-443',
  proof: 'packages/basic-styles/src/lib/BaseStylePlugins.spec.ts:458-568',
});

const wordgardDirectionIdentity = exact({
  public: '../wordgard/src/types/schema.ts:298-307',
  owner: '../wordgard/src/types/schema.ts:298-307',
  consumers: '../wordgard/src/schema/block.ts:184-258',
  lifecycle: '../wordgard/src/schema/block.ts:188-258',
  proof: 'docs/editor-issue-harvester/wordgard/full/classified-issues.tsv:3-3',
});

const wordgardDirectionBehavior = partial({
  covers: [
    '../wordgard/src/schema/block.ts:184-258',
    '../wordgard/src/types/schema.ts:298-307',
  ],
  proof: [
    'docs/editor-issue-harvester/wordgard/full/classified-issues.tsv:3-3',
    '../wordgard/test/test-selection.ts:102-158',
  ],
});

const wordgardBlockquote = exact({
  public: '../wordgard/src/types/schema.ts:58-68',
  owner: '../wordgard/src/schema/block.ts:261-301',
  consumers: '../wordgard/src/schema/bundle.ts:42-55',
  lifecycle: '../wordgard/src/schema/block.ts:269-301',
  proof: '../wordgard/test/test-commands.ts:557-654',
});

const plateBlockquote = exact({
  public: 'packages/basic-nodes/src/lib/BaseBlockPlugins.ts:9-40',
  owner: 'packages/basic-nodes/src/lib/BaseBlockPlugins.ts:69-199',
  consumers:
    'apps/www/src/registry/components/editor/plugins/basic-blocks-base-kit.tsx:1-41',
  lifecycle: 'packages/basic-nodes/src/lib/BaseBlockPlugins.ts:111-199',
  proof: 'packages/basic-nodes/src/lib/BaseBlockPlugins.spec.tsx:20-356',
});

const wordgardHorizontalRule = exact({
  public: '../wordgard/src/types/schema.ts:118-124',
  owner: '../wordgard/src/schema/block.ts:303-329',
  consumers: '../wordgard/src/schema/bundle.ts:42-55',
  lifecycle: '../wordgard/src/schema/block.ts:309-329',
  proof: '../wordgard/test/webtest-content.ts:598-611',
});

const plateHorizontalRule = exact({
  public: 'packages/basic-nodes/src/lib/BaseBlockPlugins.ts:42-66',
  owner: 'packages/basic-nodes/src/lib/BaseBlockPlugins.ts:201-232',
  consumers:
    'apps/www/src/registry/components/editor/plugins/basic-blocks-base-kit.tsx:1-41',
  lifecycle: 'packages/basic-nodes/src/lib/BaseBlockPlugins.ts:42-66',
  proof: 'packages/basic-nodes/src/lib/BaseBlockPlugins.spec.tsx:260-394',
});

const wordgardLineBreak = exact({
  public: '../wordgard/src/types/schema.ts:126-132',
  owner: '../wordgard/src/types/schema.ts:126-132',
  consumers: '../wordgard/src/schema/bundle.ts:42-55',
  lifecycle: '../wordgard/src/command/commands.ts:41-49',
  proof: '../wordgard/test/test-commands.ts:172-196',
});

const pliteLineBreak = exact({
  public: 'packages/plite/src/interfaces/editor.ts:3237-3244',
  owner: 'packages/plite/src/editor/insert-soft-break.ts:8-22',
  consumers: 'packages/plite-react/src/editable/mutation-controller.ts:105-120',
  lifecycle: 'packages/plite/src/core/public-state.ts:3514-3526',
  proof: 'packages/plite/test/snapshot-contract.ts:1751-1766',
});

const plateLineBreak = exact({
  public: 'packages/core/src/lib/editor/BaseEditor.ts:1-67',
  owner: 'packages/core/src/lib/editor/withPlite.ts:417-471',
  consumers: 'packages/core/src/lib/utils/hotkeys.ts:18-28',
  lifecycle: 'packages/core/src/lib/editor/withPlite.ts:670-715',
  proof: 'packages/plite/test/snapshot-contract.ts:1751-1766',
});

const wordgardMarks = exact({
  public: '../wordgard/src/types/schema.ts:309-395',
  owner: '../wordgard/src/schema/mark.ts:10-187',
  consumers: '../wordgard/src/schema/bundle.ts:42-55',
  lifecycle: '../wordgard/src/schema/mark.ts:14-187',
  proof: '../wordgard/test/test-commands.ts:807-863',
});

const plateMarks = exact({
  public: 'packages/basic-nodes/src/lib/BaseMarkPlugins.ts:9-108',
  owner: 'packages/basic-nodes/src/lib/BaseMarkPlugins.ts:110-433',
  consumers:
    'apps/www/src/registry/components/editor/plugins/basic-marks-base-kit.tsx:1-37',
  lifecycle: 'packages/basic-nodes/src/lib/BaseMarkPlugins.ts:110-433',
  proof: 'packages/basic-nodes/src/lib/BaseMarkPlugins.spec.tsx:74-257',
});

const wordgardColors = exact({
  public: '../wordgard/src/types/schema.ts:382-395',
  owner: '../wordgard/src/schema/color.ts:8-327',
  consumers: '../wordgard/src/schema/bundle.ts:42-55',
  lifecycle: '../wordgard/src/schema/color.ts:38-110',
  proof: '../wordgard/src/schema/color.ts:263-327',
});

const plateColors = exact({
  public: 'packages/basic-styles/src/lib/BaseStylePlugins.ts:54-168',
  owner: 'packages/basic-styles/src/lib/BaseStylePlugins.ts:54-168',
  consumers: 'apps/www/src/registry/ui/font-color-toolbar-button.tsx:86-256',
  lifecycle: 'apps/www/src/registry/ui/font-color-toolbar-button.tsx:134-232',
  proof: 'packages/basic-styles/src/lib/BaseStylePlugins.spec.ts:18-148',
});

const wordgardLists = exact({
  public: '../wordgard/src/types/schema.ts:70-117',
  owner: '../wordgard/src/schema/list.ts:8-69',
  consumers: '../wordgard/src/schema/bundle.ts:42-55',
  lifecycle: '../wordgard/src/schema/list.ts:20-69',
  proof: '../wordgard/test/test-commands.ts:680-790',
});

const plateLists = exact({
  public: 'packages/list/src/lib/BaseListPlugin.ts:37-174',
  owner: 'packages/list/src/lib/BaseListPlugin.ts:174-1183',
  consumers:
    'apps/www/src/registry/components/editor/plugins/list-base-kit.tsx:1-39',
  lifecycle: 'packages/list/src/lib/BaseListPlugin.ts:1183-1680',
  proof: [
    'packages/list/src/lib/BaseListPlugin.spec.tsx:1-1599',
    'packages/list/src/lib/BaseListPlugin.slow.tsx:1-2382',
  ],
});

const wordgardLinkCore = exact({
  public: '../wordgard/src/types/schema.ts:361-380',
  owner: '../wordgard/src/schema/link.ts:8-43',
  consumers: '../wordgard/src/schema/link.ts:100-137',
  lifecycle: '../wordgard/src/schema/link.ts:8-43',
  proof: '../wordgard/test/test-commands.ts:807-845',
});

const plateLinkCore = exact({
  public: 'packages/link/src/lib/BaseLinkPlugin.ts:25-100',
  owner: 'packages/link/src/lib/BaseLinkPlugin.ts:143-608',
  consumers:
    'apps/www/src/registry/components/editor/plugins/link-base-kit.tsx:1-7',
  lifecycle: 'packages/link/src/lib/BaseLinkPlugin.ts:302-608',
  proof: 'packages/link/src/lib/BaseLinkPlugin.spec.tsx:403-773',
});

const wordgardLinkDialog = exact({
  public: '../wordgard/src/schema/link.ts:100-137',
  owner: '../wordgard/src/schema/link.ts:8-43',
  consumers: '../wordgard/src/schema/link.ts:104-137',
  lifecycle: '../wordgard/src/schema/link.ts:8-43',
  proof: 'docs/editor-issue-harvester/wordgard/full/classified-issues.tsv:2-2',
});

const plateLinkDialog = exact({
  public: 'packages/link/src/react/FloatingLink.tsx:1-18',
  owner: 'packages/link/src/react/useFloatingLink.ts:42-218',
  consumers: 'apps/www/src/registry/ui/link-toolbar.tsx:1-150',
  lifecycle: 'packages/link/src/react/LinkPlugin.tsx:16-93',
  proof: 'packages/link/src/react/LinkPlugin.spec.ts:1-115',
});

const wordgardLinkTooltip = exact({
  public: '../wordgard/src/schema/link.ts:45-98',
  owner: '../wordgard/src/schema/link.ts:45-98',
  consumers: '../wordgard/src/schema/link.ts:104-137',
  lifecycle: '../wordgard/src/schema/link.ts:62-98',
  proof: '../wordgard/src/schema/link.ts:45-98',
});

const plateLinkTooltip = exact({
  public: 'packages/link/src/react/useFloatingLink.ts:287-416',
  owner: 'packages/link/src/react/useFloatingLink.ts:287-416',
  consumers: 'apps/www/src/registry/ui/link-toolbar.tsx:35-150',
  lifecycle: 'packages/link/src/react/useFloatingLink.ts:352-416',
  proof: 'packages/link/src/react/LinkPlugin.spec.ts:1-115',
});

const wordgardLinkPaste = exact({
  public: '../wordgard/src/schema/link.ts:154-171',
  owner: '../wordgard/src/schema/link.ts:154-171',
  consumers: '../wordgard/src/schema/link.ts:100-108',
  lifecycle: '../wordgard/src/schema/link.ts:154-171',
  proof: '../wordgard/src/schema/link.ts:154-171',
});

const plateLinkPaste = exact({
  public: 'packages/link/src/lib/BaseLinkPlugin.ts:636-706',
  owner: 'packages/link/src/lib/BaseLinkPlugin.ts:636-706',
  consumers: 'packages/link/src/lib/BaseLinkPlugin.ts:800-827',
  lifecycle: 'packages/link/src/lib/BaseLinkPlugin.ts:636-706',
  proof: 'packages/link/src/lib/BaseLinkPlugin.spec.tsx:798-896',
});

const wordgardImageSchema = exact({
  public: '../wordgard/src/types/schema.ts:222-282',
  owner: '../wordgard/src/schema/image.ts:9-37',
  consumers: '../wordgard/src/schema/bundle.ts:42-55',
  lifecycle: '../wordgard/src/schema/image.ts:175-229',
  proof: '../wordgard/test/webtest-serialize.ts:209-240',
});

const plateImageSchema = exact({
  public: 'packages/media/src/lib/image/BaseImagePlugin.ts:17-47',
  owner: 'packages/media/src/lib/image/BaseImagePlugin.ts:33-301',
  consumers:
    'apps/www/src/registry/components/editor/plugins/media-base-kit.tsx:1-24',
  lifecycle: 'packages/media/src/lib/image/BaseImagePlugin.ts:301-390',
  proof: 'packages/media/src/lib/image/BaseImagePlugin.spec.tsx:1-240',
});

const wordgardMediaEditing = exact({
  public: '../wordgard/src/schema/image.ts:14-37',
  owner: '../wordgard/src/schema/imagedialog.ts:116-204',
  consumers: '../wordgard/src/schema/image.ts:175-229',
  lifecycle: '../wordgard/src/schema/imagedialog.ts:78-204',
  proof: '../wordgard/src/schema/imagedialog.ts:116-204',
});

const plateMediaEditing = exact({
  public: 'packages/media/src/lib/BaseMediaPlugin.ts:51-142',
  owner: 'packages/media/src/lib/BaseMediaPlugin.ts:143-205',
  consumers: 'apps/www/src/registry/ui/media-toolbar.tsx:36-95',
  lifecycle: 'packages/media/src/react/media/useFloatingMedia.ts:23-91',
  proof: 'packages/media/src/react/media/useMediaToolbarButton.spec.ts:8-109',
});

const wordgardImageUpload = exact({
  public: '../wordgard/src/schema/imagedialog.ts:9-12',
  owner: '../wordgard/src/schema/image.ts:194-218',
  consumers: '../wordgard/src/schema/image.ts:175-229',
  lifecycle: '../wordgard/src/schema/imagedialog.ts:95-115',
  proof: '../wordgard/src/schema/image.ts:194-218',
});

const plateImageUpload = exact({
  public: 'packages/media/src/lib/image/BaseImagePlugin.ts:17-30',
  owner: 'packages/media/src/lib/image/BaseImagePlugin.ts:301-390',
  consumers: 'apps/www/src/registry/hooks/use-upload-file.ts:18-107',
  lifecycle: 'packages/media/src/lib/image/BaseImagePlugin.ts:338-386',
  proof: 'packages/media/src/lib/image/BaseImagePlugin.spec.tsx:243-300',
});

const wordgardImageDialog = exact({
  public: '../wordgard/src/schema/imagedialog.ts:13-21',
  owner: '../wordgard/src/schema/imagedialog.ts:78-204',
  consumers: '../wordgard/src/schema/image.ts:175-229',
  lifecycle: '../wordgard/src/schema/imagedialog.ts:116-204',
  proof: '../wordgard/src/schema/imagedialog.ts:116-204',
});

const plateImageDialog = exact({
  public: 'packages/media/src/lib/BaseMediaPlugin.ts:51-142',
  owner: 'apps/www/src/registry/ui/media-toolbar-button.tsx:86-254',
  consumers: 'apps/www/src/registry/ui/media-toolbar-button.tsx:109-254',
  lifecycle: 'apps/www/src/registry/ui/media-toolbar-button.tsx:118-254',
  proof: 'packages/media/src/react/media/useMediaToolbarButton.spec.ts:8-109',
});

const wordgardImageResize = partial({
  covers: [
    '../wordgard/src/types/schema.ts:274-282',
    '../wordgard/src/schema/image.ts:28-172',
  ],
  proof: '../wordgard/test/test-commands.ts:400-480',
});

const plateImageResize = exact({
  public: 'packages/media/src/lib/BaseMediaPlugin.ts:26-81',
  owner: 'packages/resizable/src/useResizable.ts:56-147',
  consumers: 'apps/www/src/registry/ui/media-image-node.tsx:20-80',
  lifecycle: 'packages/resizable/src/useResizable.ts:56-147',
  proof: [
    'packages/media/src/lib/BaseMediaPluginContracts.spec.ts:181-242',
    'packages/resizable/src/resizeLength.spec.ts:8-59',
  ],
});

const wordgardColorControl = exact({
  public: '../wordgard/src/schema/color.ts:112-241',
  owner: '../wordgard/src/schema/color.ts:38-110',
  consumers: '../wordgard/src/schema/color.ts:263-327',
  lifecycle: '../wordgard/src/schema/color.ts:38-110',
  proof: '../wordgard/src/schema/color.ts:38-110',
});

const plateColorControl = exact({
  public: 'apps/www/src/registry/ui/font-color-toolbar-button.tsx:106-132',
  owner: 'apps/www/src/registry/ui/font-color-toolbar-button.tsx:134-625',
  consumers:
    'apps/www/src/registry/components/editor/plugins/font-kit.tsx:1-28',
  lifecycle: 'apps/www/src/registry/ui/font-color-toolbar-button.tsx:134-232',
  proof: 'packages/basic-styles/src/lib/BaseStylePlugins.spec.ts:18-148',
});

const wordgardTable = exact({
  public: '../wordgard/src/types/schema.ts:134-219',
  owner: '../wordgard/src/types/schema.ts:134-219',
  consumers: '../wordgard/test/schema.ts:107-167',
  lifecycle: '../wordgard/src/types/schema.ts:134-219',
  proof: '../wordgard/test/test-table-commands.ts:1-213',
});

const plateTable = exact({
  public: 'packages/table/src/lib/BaseTablePlugin.ts:242-319',
  owner: 'packages/table/src/lib/BaseTablePlugin.ts:326-712',
  consumers:
    'apps/www/src/registry/components/editor/plugins/table-base-kit.tsx:1-26',
  lifecycle: 'packages/table/src/lib/BaseTablePlugin.ts:760-1603',
  proof: [
    'packages/table/src/lib/BaseTablePlugin.schema.spec.ts:1-207',
    'packages/table/src/lib/BaseTablePlugin.spec.ts:1-187',
  ],
});

const wordgardKit = partial({
  covers: '../wordgard/src/schema/bundle.ts:1-55',
  proof: '../wordgard/demo/demo.ts:1-15',
});

const pliteKit = partial({
  covers: [
    'packages/plite/src/core/editor-extension.ts:662-687',
    'packages/plite/src/core/editor-extension.ts:2099-2159',
  ],
  proof: 'packages/plite/test/extension-configuration.test.ts:1346-1448',
});

const plateKit = exact({
  public: 'packages/core/src/lib/plugin/BasePlugin.ts:168-260',
  owner: 'packages/core/src/internal/plugin/resolvePlugins.ts:1440-1536',
  consumers: 'apps/www/src/registry/components/editor/editor-kit.tsx:1-104',
  lifecycle: 'packages/core/src/internal/plugin/resolvePlugins.ts:1513-1595',
  proof: 'packages/core/src/internal/plugin/resolvePlugins.spec.tsx:1-160',
});

const copiedKitsPlate = exact({
  public:
    'apps/www/src/registry/components/editor/plugins/basic-blocks-base-kit.tsx:1-41',
  owner: 'apps/www/src/registry/components/editor/editor-kit.tsx:1-104',
  consumers: 'apps/www/src/registry/registry-examples.ts:1-160',
  lifecycle: 'packages/core/src/internal/plugin/resolvePlugins.ts:1513-1595',
  proof: 'apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:1-220',
});

const staticRenderingPlate = exact({
  public: 'packages/core/src/static/index.ts:1-8',
  owner: 'packages/core/src/static/renderStaticHtml.tsx:1-77',
  consumers: 'apps/www/src/registry/blocks/plate-to-html/page.tsx:69-84',
  lifecycle: 'packages/core/src/static/components/PlateStatic.tsx:1-180',
  proof: [
    'packages/core/src/static/components/PlateStatic.spec.tsx:1-220',
    'packages/core/src/static/pluginRenderElementStatic.spec.tsx:1-69',
  ],
});

const maxLengthPlite = partial({
  covers: [
    'packages/plite/src/core/insert-limit.ts:23-154',
    'packages/plite/src/core/public-state.ts:5020-5041',
    'packages/plite-react/src/components/editable-text-blocks.tsx:1127-1138',
  ],
  proof: 'packages/plite/test/max-length-contract.test.ts:22-101',
});

const maxLengthPlate = partial({
  covers: [
    'packages/core/src/react/editor/withPlate.ts:218-225',
    'packages/core/src/lib/editor/withPlite.ts:597-616',
  ],
  proof: 'packages/core/src/lib/editor/withPlite.slow.ts:898-915',
});

const runtimeWordgard = partial({
  covers: [
    '../wordgard/bin/build.ts:317-348',
    '../wordgard-website/site/docs/faq/index.md:51-65',
  ],
  proof: [
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-namespace-bundle-probe.json:1-93',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:106-180',
  ],
});

const runtimePlite = partial({
  covers: [
    'packages/plite/package.json:30-39',
    'packages/plite/src/core/public-state.ts:2350-2438',
  ],
  proof:
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/runtime-api-bundle-probe.json:1-38',
});

const runtimePlate = partial({
  covers: 'packages/core/src/lib/plugin/defineBasePlugin.ts:479-524',
  proof: 'packages/core/src/lib/plugin/defineBasePlugin.spec.ts:1-40',
});

const nativeWordgard = exact({
  public: '../wordgard/src/editor/input.ts:18-40',
  owner: '../wordgard/src/editor/input.ts:173-301',
  consumers: '../wordgard/test/webtest-dom-changes.ts:10-126',
  lifecycle: '../wordgard/src/editor/input.ts:710-857',
  proof: [
    '../wordgard/test/webtest-dom-changes.ts:10-126',
    '../wordgard/test/webtest-composition.ts:9-177',
  ],
});

const nativePlite = exact({
  public: 'packages/plite-react/src/editable/native-input-strategy.ts:12-165',
  owner: [
    'packages/plite-react/src/editable/dom-repair-text.ts:1-89',
    'packages/plite-react/src/editable/dom-repair-queue.ts:54-398',
  ],
  consumers:
    'packages/plite-react/src/editable/runtime-before-input-events.ts:1-180',
  lifecycle:
    'packages/plite-react/src/editable/native-text-input-delta.ts:1-106',
  proof: [
    'packages/plite-react/test/runtime-before-input-events-contract.test.ts:47-126',
    'packages/plite-react/test/native-text-input-delta-contract.test.ts:1-19',
    'packages/plite-react/test/dom-repair-policy-contract.test.ts:161-381',
  ],
});

const nativePlate = partial({
  covers:
    'packages/browser/test/core/playwright-native-event-trace.test.ts:47-219',
  proof:
    'packages/browser/test/core/playwright-native-event-trace.test.ts:47-219',
});

const mathPlate = partial({
  covers: [
    'packages/math/src/lib/BaseEquationPlugin.ts:1-12',
    'packages/math/package.json:20-29',
    'apps/www/src/registry/blocks/plate-to-html/page.tsx:69-84',
    'apps/www/src/registry/ui/export-toolbar-button.tsx:119-134',
  ],
  proof: 'packages/math/src/lib/BaseEquationPlugin.spec.tsx:160-172',
});

const mediaKeyboardWordgard = exact({
  public: '../wordgard/src/schema/image.ts:28-36',
  owner: '../wordgard/src/schema/image.ts:141-172',
  consumers: '../wordgard/src/schema/image.ts:28-37',
  lifecycle: '../wordgard/src/schema/image.ts:55-140',
  proof: '../wordgard/src/schema/image.ts:141-172',
});

const mediaKeyboardPlate = partial({
  covers: [
    'packages/media/src/lib/BaseMediaPlugin.ts:26-37',
    'packages/media/src/lib/BaseMediaPlugin.ts:101-205',
    'packages/resizable/src/useResizable.ts:56-147',
  ],
  proof: [
    'packages/media/src/lib/BaseMediaPluginContracts.spec.ts:181-242',
    'packages/resizable/src/resizeLength.spec.ts:8-59',
  ],
});

const contracts = {
  'WG-PRODUCT-001A2A': {
    wordgard: wordgardParagraph,
    plate: plateParagraph,
  },
  'WG-PRODUCT-003A2A': {
    wordgard: wordgardParagraph,
    plate: plateParagraph,
  },
  'WG-PRODUCT-001A2B': {
    wordgard: wordgardCodeBlock,
    plate: plateCodeBlock,
  },
  'WG-PRODUCT-003A2B': {
    wordgard: wordgardCodeBlock,
    plate: plateCodeBlock,
  },
  'WG-PRODUCT-001A2C': {
    wordgard: wordgardAlignment,
    plate: plateAlignment,
  },
  'WG-PRODUCT-003A2C': {
    wordgard: wordgardAlignment,
    plate: plateAlignment,
  },
  'WG-PRODUCT-001A2D': { wordgard: wordgardDirectionIdentity },
  'WG-PRODUCT-003A2D': { wordgard: wordgardDirectionBehavior },
  'WG-PRODUCT-001A2E': {
    wordgard: wordgardBlockquote,
    plate: plateBlockquote,
  },
  'WG-PRODUCT-003A2E': {
    wordgard: wordgardBlockquote,
    plate: plateBlockquote,
  },
  'WG-PRODUCT-001A2F': {
    wordgard: wordgardHorizontalRule,
    plate: plateHorizontalRule,
  },
  'WG-PRODUCT-003A2F': {
    wordgard: wordgardHorizontalRule,
    plate: plateHorizontalRule,
  },
  'WG-PRODUCT-001A2G': {
    wordgard: wordgardLineBreak,
    plite: pliteLineBreak,
    plate: plateLineBreak,
  },
  'WG-PRODUCT-003A2G': {
    wordgard: wordgardLineBreak,
    plite: pliteLineBreak,
    plate: plateLineBreak,
  },
  'WG-PRODUCT-001B': { wordgard: wordgardMarks, plate: plateMarks },
  'WG-PRODUCT-003B1': { wordgard: wordgardMarks, plate: plateMarks },
  'WG-PRODUCT-003B2': { wordgard: wordgardColors, plate: plateColors },
  'WG-PRODUCT-001C': {
    wordgard: wordgardImageSchema,
    plate: plateImageSchema,
  },
  'WG-PRODUCT-001D': { wordgard: wordgardTable, plate: plateTable },
  'WG-PRODUCT-002': {
    wordgard: wordgardKit,
    plite: pliteKit,
    plate: plateKit,
  },
  'WG-PRODUCT-003C': { wordgard: wordgardLists, plate: plateLists },
  'WG-PRODUCT-003D1A': {
    wordgard: wordgardLinkCore,
    plate: plateLinkCore,
  },
  'WG-PRODUCT-003D1B': {
    wordgard: wordgardLinkDialog,
    plate: plateLinkDialog,
  },
  'WG-PRODUCT-003D2': {
    wordgard: wordgardLinkTooltip,
    plate: plateLinkTooltip,
  },
  'WG-PRODUCT-003D3': {
    wordgard: wordgardLinkPaste,
    plate: plateLinkPaste,
  },
  'WG-PRODUCT-003E': {
    wordgard: wordgardMediaEditing,
    plate: plateMediaEditing,
  },
  'WG-PRODUCT-004A1': {
    wordgard: wordgardImageUpload,
    plate: plateImageUpload,
  },
  'WG-PRODUCT-004A2': {
    wordgard: wordgardImageDialog,
    plate: plateImageDialog,
  },
  'WG-PRODUCT-004B': {
    wordgard: wordgardImageResize,
    plate: plateImageResize,
  },
  'WG-PRODUCT-004C': {
    wordgard: wordgardColorControl,
    plate: plateColorControl,
  },
  'PLATE-COPIED-KITS': { plate: copiedKitsPlate },
  'PLATE-STATIC-RENDERING': { plate: staticRenderingPlate },
  'LOCAL-MAX-LENGTH-POLICY': {
    plite: maxLengthPlite,
    plate: maxLengthPlate,
  },
  'LOCAL-RUNTIME-API-TREESHAKING': {
    wordgard: runtimeWordgard,
    plite: runtimePlite,
    plate: runtimePlate,
  },
  'LOCAL-NATIVE-INPUT-RECONCILIATION': {
    wordgard: nativeWordgard,
    plite: nativePlite,
    plate: nativePlate,
  },
  'LOCAL-MATH-CSS-BOUNDARY': { plate: mathPlate },
  'LOCAL-MEDIA-KEYBOARD-RESIZE': {
    wordgard: mediaKeyboardWordgard,
    plate: mediaKeyboardPlate,
  },
};

export const contractEvidence = Object.freeze(contracts);

export const dimensionEvidenceKeys = Object.freeze(
  Object.fromEntries(
    Object.entries(contracts).map(([id, value]) => [
      id,
      dimensionKeys(value, {
        runtime:
          id === 'LOCAL-RUNTIME-API-TREESHAKING'
            ? ['wordgard.proof', 'plite.proof']
            : [],
      }),
    ])
  )
);

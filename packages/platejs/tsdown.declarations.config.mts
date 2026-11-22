import { createPlatePackageConfig } from '../../tooling/config/tsdown.config.ts';
import { plateAdditionalEntries } from './tsdown.config.mts';

export default createPlatePackageConfig({
  additionalEntries: [...plateAdditionalEntries],
  bundleDeclarationDependencies: [
    /^mdast-util-to-markdown(?:\/|$)/,
    /^plitejs(?:\/|$)/,
  ],
  declarationsOnly: true,
  knownImportCycles: [
    [
      'dist/features/board/lib/boardFrame.internal.js',
      'dist/features/board/lib/boardShape.internal.js',
    ],
    [
      'dist/internal/plugin/compilePlateFormats.js',
      'dist/lib/editor/withPlite.js',
      'dist/lib/plugins/getCorePlugins.internal.js',
      'dist/lib/plugins/html/HtmlPlugin.js',
    ],
    [
      'dist/markdown/lib/deserializer/convertChildrenDeserialize.js',
      'dist/markdown/lib/deserializer/convertNodesDeserialize.js',
      'dist/markdown/lib/internal/markdownIntrinsics.js',
      'dist/markdown/lib/internal/markdownLine.js',
      'dist/markdown/lib/internal/markdownMappings.js',
      'dist/markdown/lib/serializer/convertNodesSerialize.js',
      'dist/markdown/lib/serializer/convertPhrasingSerialize.js',
      'dist/markdown/lib/serializer/listToMdastTree.js',
    ],
    [
      'dist/react/features/board/boardGesture.internal.js',
      'dist/react/features/board/boardView.internal.js',
    ],
    [
      'dist/tabbable/react/TabbableEffects.internal.js',
      'dist/tabbable/react/TabbablePlugin.js',
    ],
  ],
});

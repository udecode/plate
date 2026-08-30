import platejsPackage from '../../../../packages/platejs/package.json';
import plitejsPackage from '../../../../packages/plitejs/package.json';

export const EDITOR_AI_PACKAGE_ENTRYPOINTS = [
  'platejs',
  'platejs/ai',
  'platejs/ai/react',
  'platejs/callout',
  'platejs/callout/react',
  'platejs/code-drawing',
  'platejs/combobox',
  'platejs/comment',
  'platejs/comment/react',
  'platejs/csv',
  'platejs/cursor/react',
  'platejs/date',
  'platejs/date/react',
  'platejs/details',
  'platejs/details/react',
  'platejs/dnd/react',
  'platejs/docx',
  'platejs/emoji',
  'platejs/emoji/react',
  'platejs/excalidraw',
  'platejs/floating/react',
  'platejs/footnote',
  'platejs/footnote/react',
  'platejs/layout',
  'platejs/layout/react',
  'platejs/markdown',
  'platejs/math',
  'platejs/math/react',
  'platejs/media',
  'platejs/media/react',
  'platejs/mention',
  'platejs/mention/react',
  'platejs/react',
  'platejs/resizable/react',
  'platejs/slash-command/react',
  'platejs/static',
  'platejs/suggestion',
  'platejs/suggestion/react',
  'platejs/table',
  'platejs/table/react',
  'platejs/toc',
  'platejs/toc/react',
] as const;

export const EDITOR_AI_OPTIONAL_PEER_NAMES = [
  '@ai-sdk/react',
  '@emoji-mart/data',
  '@excalidraw/excalidraw',
  '@floating-ui/core',
  '@floating-ui/react',
  '@tanstack/react-virtual',
  '@types/papaparse',
  'ai',
  'color-name',
  'diff-match-patch-ts',
  'fastest-levenshtein',
  'flowchart.js',
  'html-to-vdom',
  'jszip',
  'juice',
  'katex',
  'mammoth',
  'marked',
  'mermaid',
  'mime-types',
  'papaparse',
  'plantuml-encoder',
  'raf',
  'react-dnd',
  'react-dnd-html5-backend',
  'remark-mdx',
  'remark-parse',
  'remark-stringify',
  'unified',
  'validator',
  'virtual-dom',
  'viz.js',
  'xmlbuilder2',
] as const;

export const EDITOR_BASIC_PACKAGE_ENTRYPOINTS = [
  'platejs',
  'platejs/react',
] as const;

export const EDITOR_BASIC_OPTIONAL_PEER_NAMES = [
  '@tanstack/react-virtual',
] as const;

const optionalPeerVersions: Record<string, string> = {
  ...platejsPackage.peerDependencies,
  ...plitejsPackage.peerDependencies,
};

const getOptionalPeerDependencies = (packageNames: readonly string[]) =>
  packageNames.map((packageName) => {
    const version = optionalPeerVersions[packageName];

    if (!version) {
      throw new Error(
        `Editor optional peer ${packageName} has no package manifest version.`
      );
    }

    return `${packageName}@${version}`;
  });

export const EDITOR_AI_OPTIONAL_PEER_DEPENDENCIES = getOptionalPeerDependencies(
  EDITOR_AI_OPTIONAL_PEER_NAMES
);

export const EDITOR_BASIC_OPTIONAL_PEER_DEPENDENCIES =
  getOptionalPeerDependencies(EDITOR_BASIC_OPTIONAL_PEER_NAMES);

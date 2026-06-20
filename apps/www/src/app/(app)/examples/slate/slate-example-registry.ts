export type ExampleDefinition = readonly [name: string, path: string];

export const UPSTREAM_SLATE_EXAMPLE_PATHS = [
  'android-tests',
  'check-lists',
  'code-highlighting',
  'custom-placeholder',
  'editable-voids',
  'embeds',
  'forced-layout',
  'hovering-toolbar',
  'huge-document',
  'images',
  'inlines',
  'markdown-preview',
  'markdown-shortcuts',
  'mentions',
  'paste-html',
  'plaintext',
  'read-only',
  'iframe',
  'richtext',
  'search-highlighting',
  'shadow-dom',
  'styling',
  'tables',
] as const;

export const EXAMPLE_NAMES_AND_PATHS = [
  ['Android Tests', 'android-tests'],
  ['Async Decorations', 'decorations-async'],
  ['Checklists', 'check-lists'],
  ['Code Highlighting', 'code-highlighting'],
  ['Comment Mode', 'comment-mode'],
  ['Custom Placeholder', 'custom-placeholder'],
  ['Document State', 'document-state'],
  ['DOM Coverage Boundaries', 'dom-coverage-boundaries'],
  ['Editable Voids', 'editable-voids'],
  ['Embeds', 'embeds'],
  ['Forced Layout', 'forced-layout'],
  ['Hidden Content Blocks', 'hidden-content-blocks'],
  ['Hovering Toolbar', 'hovering-toolbar'],
  ['Huge Document', 'huge-document'],
  ['Images', 'images'],
  ['Inlines', 'inlines'],
  ['Linting', 'linting'],
  ['Markdown Preview', 'markdown-preview'],
  ['Markdown Shortcuts', 'markdown-shortcuts'],
  ['Mentions', 'mentions'],
  ['Multi-root Document', 'multi-root-document'],
  ['Persistent Annotation Anchors', 'persistent-annotation-anchors'],
  ['Pagination', 'pagination'],
  ['Paste HTML', 'paste-html'],
  ['Plain Text', 'plaintext'],
  ['Read-only', 'read-only'],
  ['Rendering in iframes', 'iframe'],
  ['Rich Text', 'richtext'],
  ['Search Highlighting', 'search-highlighting'],
  ['Shadow DOM', 'shadow-dom'],
  ['Styling', 'styling'],
  ['Synced Blocks', 'synced-blocks'],
  ['Tables', 'tables'],
  ['Yjs Collaboration', 'yjs-collaboration'],
  ['Yjs Hocuspocus', 'yjs-hocuspocus'],
] as const satisfies readonly ExampleDefinition[];

export const HIDDEN_EXAMPLES = [
  'android-tests',
  'decorations-async',
  'dom-coverage-boundaries',
  'persistent-annotation-anchors',
] as const;

const hiddenExamplePaths: readonly string[] = HIDDEN_EXAMPLES;
const upstreamSlateExamplePaths: readonly string[] =
  UPSTREAM_SLATE_EXAMPLE_PATHS;

export const isNewSlateExamplePath = (path: string): boolean =>
  !upstreamSlateExamplePaths.includes(path);

export const NON_HIDDEN_EXAMPLES = EXAMPLE_NAMES_AND_PATHS.filter(
  ([, path]) => !hiddenExamplePaths.includes(path)
);

const exampleDefinitionsByPath = new Map<string, ExampleDefinition>(
  EXAMPLE_NAMES_AND_PATHS.map((definition) => [definition[1], definition])
);

export const getExampleDefinition = (
  path: string
): ExampleDefinition | undefined => exampleDefinitionsByPath.get(path);

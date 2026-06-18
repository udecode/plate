export type ExampleBadge = 'alpha';

export type ExampleDefinition = readonly [
  name: string,
  path: string,
  metadata?: {
    badge?: ExampleBadge;
  },
];

export const EXAMPLE_NAMES_AND_PATHS = [
  ['Android Tests', 'android-tests'],
  ['Checklists', 'check-lists'],
  ['Code Highlighting', 'code-highlighting'],
  ['Custom Placeholder', 'custom-placeholder'],
  ['Async Decorations', 'decorations-async'],
  ['Document State', 'document-state'],
  ['DOM Coverage Boundaries', 'dom-coverage-boundaries'],
  ['Editable Voids', 'editable-voids'],
  ['Embeds', 'embeds'],
  ['Linting', 'linting'],
  ['Forced Layout', 'forced-layout'],
  ['Hovering Toolbar', 'hovering-toolbar'],
  ['Hidden Content Blocks', 'hidden-content-blocks'],
  ['Huge Document', 'huge-document'],
  ['Images', 'images'],
  ['Inlines', 'inlines'],
  ['Markdown Preview', 'markdown-preview'],
  ['Markdown Shortcuts', 'markdown-shortcuts'],
  ['Mentions', 'mentions'],
  ['Multi-root Document', 'multi-root-document'],
  ['Paste HTML', 'paste-html'],
  ['Persistent Annotation Anchors', 'persistent-annotation-anchors'],
  ['Pagination', 'pagination', { badge: 'alpha' }],
  ['Plain Text', 'plaintext'],
  ['Read-only', 'read-only'],
  ['Comment Mode', 'comment-mode'],
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

export const NON_HIDDEN_EXAMPLES = EXAMPLE_NAMES_AND_PATHS.filter(
  ([, path]) => !hiddenExamplePaths.includes(path)
);

/** First-party Plate capability names. Not a persisted AST identity catalog. */
export const PLUGINS = {
  affinity: 'affinity',
  ai: 'ai',
  aiChat: 'aiChat',
  audio: 'audio',
  backgroundColor: 'backgroundColor',
  blockMenu: 'blockMenu',
  blockPlaceholder: 'blockPlaceholder',
  blockSelection: 'blockSelection',
  blockquote: 'blockquote',
  bold: 'bold',
  bulletedList: 'bulletedList',
  callout: 'callout',
  code: 'code',
  codeBlock: 'codeBlock',
  codeDrawing: 'codeDrawing',
  codeLine: 'codeLine',
  codeSyntax: 'codeSyntax',
  color: 'color',
  column: 'column',
  columnGroup: 'columnGroup',
  comment: 'comment',
  copilot: 'copilot',
  csv: 'csv',
  cursorOverlay: 'cursorOverlay',
  date: 'date',
  debug: 'debug',
  dnd: 'dnd',
  dom: 'dom',
  docx: 'docx',
  docxIO: 'docxIO',
  elementState: 'elementState',
  emoji: 'emoji',
  emojiInput: 'emojiInput',
  equation: 'equation',
  eventEditor: 'eventEditor',
  excalidraw: 'excalidraw',
  exitBreak: 'exitBreak',
  file: 'file',
  fixedToolbar: 'fixedToolbar',
  floatingToolbar: 'floatingToolbar',
  fontFamily: 'fontFamily',
  fontSize: 'fontSize',
  fontWeight: 'fontWeight',
  footnote: 'footnote',
  footnoteDefinition: 'footnoteDefinition',
  footnoteInput: 'footnoteInput',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  highlight: 'highlight',
  history: 'history',
  horizontalRule: 'horizontalRule',
  html: 'html',
  image: 'image',
  indent: 'indent',
  inlineEquation: 'inlineEquation',
  inputRules: 'inputRules',
  italic: 'italic',
  juice: 'juice',
  kbd: 'kbd',
  lineHeight: 'lineHeight',
  link: 'link',
  list: 'list',
  listClassic: 'listClassic',
  listItem: 'listItem',
  listItemContent: 'listItemContent',
  markdown: 'markdown',
  mediaEmbed: 'mediaEmbed',
  mention: 'mention',
  mentionInput: 'mentionInput',
  navigationFeedback: 'navigationFeedback',
  nodeId: 'nodeId',
  normalizeTypes: 'normalizeTypes',
  numberedList: 'numberedList',
  override: 'override',
  paragraph: 'paragraph',
  placeholder: 'placeholder',
  script: 'script',
  searchHighlight: 'searchHighlight',
  singleBlock: 'singleBlock',
  singleLine: 'singleLine',
  slashCommand: 'slashCommand',
  slashInput: 'slashInput',
  strikethrough: 'strikethrough',
  suggestion: 'suggestion',
  tabbable: 'tabbable',
  table: 'table',
  tableCell: 'tableCell',
  tableRow: 'tableRow',
  tag: 'tag',
  taskList: 'taskList',
  textAlign: 'textAlign',
  textIndent: 'textIndent',
  toc: 'toc',
  todoList: 'todoList',
  toggle: 'toggle',
  trailingBlock: 'trailingBlock',
  underline: 'underline',
  video: 'video',
  yjs: 'yjs',
} as const;

export type PluginName = (typeof PLUGINS)[keyof typeof PLUGINS];

export type PlateAstIdentityMigration = Readonly<{
  properties?: Readonly<Record<string, string>>;
  types: Readonly<Record<string, string>>;
}>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Rewrite explicitly declared persisted Plate identities before editor creation.
 * Unknown identities and nested domain JSON are preserved.
 */
export const migratePlateAstIdentities = <T>(
  value: T,
  migration: PlateAstIdentityMigration
): T => {
  const migrateNode = (
    node: unknown,
    root: string,
    path: readonly number[]
  ): unknown => {
    if (!isRecord(node)) return node;

    const next: Record<string, unknown> = {};

    for (const [key, propertyValue] of Object.entries(node)) {
      const migratedKey = migration.properties?.[key] ?? key;

      if (migratedKey !== key && Object.hasOwn(node, migratedKey)) {
        throw new Error(
          `Plate AST identity migration collision at root "${root}" path [${path.join(', ')}]: properties "${key}" and "${migratedKey}" are both present.`
        );
      }

      if (key === 'children' && Array.isArray(propertyValue)) {
        next.children = propertyValue.map((child, index) =>
          migrateNode(child, root, [...path, index])
        );
      } else if (key === 'type' && typeof propertyValue === 'string') {
        next.type = migration.types[propertyValue] ?? propertyValue;
      } else {
        if (Object.hasOwn(next, migratedKey)) {
          throw new Error(
            `Plate AST identity migration collision at root "${root}" path [${path.join(', ')}]: multiple properties target "${migratedKey}".`
          );
        }

        next[migratedKey] = propertyValue;
      }
    }

    return next;
  };

  const migrateRoot = (rootValue: unknown, root: string): unknown => {
    if (!Array.isArray(rootValue)) {
      throw new Error(
        `Plate AST identity migration expected root "${root}" to be an array.`
      );
    }

    return rootValue.map((node, index) => migrateNode(node, root, [index]));
  };

  if (Array.isArray(value)) {
    return migrateRoot(value, 'main') as T;
  }

  if (!isRecord(value) || !Array.isArray(value.children)) {
    throw new Error(
      'Plate AST identity migration expected a value array or document object with children.'
    );
  }

  const roots = value.roots;
  const migratedRoots =
    roots === undefined
      ? undefined
      : isRecord(roots)
        ? Object.fromEntries(
            Object.entries(roots).map(([root, rootValue]) => [
              root,
              migrateRoot(rootValue, root),
            ])
          )
        : (() => {
            throw new Error(
              'Plate AST identity migration expected document roots to be an object.'
            );
          })();

  return {
    ...value,
    children: migrateRoot(value.children, 'main'),
    ...(migratedRoots === undefined ? {} : { roots: migratedRoots }),
  } as T;
};

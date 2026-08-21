import {
  defineExtension,
  defineEditorSchema,
  editorCommands,
  type Node,
  NodeApi,
  PathApi,
  PointApi,
  property,
  RangeApi,
  type EditorValueFromExtensions,
  schema,
  type SchemaDescendant,
  type SchemaElementFor,
  type SchemaElementTypes,
  type SchemaText,
  type SchemaTextPropertyKeys,
  target,
  type Element as PliteElement,
  type Text as PliteText,
  TextApi,
} from '@platejs/plite';
import {
  clipboardHandler,
  isHotkey,
  parseDOMClipboardHtml,
} from '@platejs/plite-dom';
import { history } from '@platejs/plite-history';
import {
  Editable,
  type ReactEditor,
  type RenderElementProps,
  type RenderLeafProps,
  Plite,
  useEditor,
  useEditorSelector,
  usePliteEditor,
} from '@platejs/plite-react';
import type React from 'react';
import type { MouseEvent, PointerEvent } from 'react';

import { Button, Icon, Toolbar } from './components';
import { deserialize, isPlainTextClipboardHtml } from './paste-html-import';

const TEXT_MARK_TYPES = ['bold', 'italic', 'underline', 'code'] as const;
type RichTextMark = (typeof TEXT_MARK_TYPES)[number];

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
} satisfies Record<string, RichTextMark>;

const LIST_TYPES = ['numbered-list', 'bulleted-list'] as const;
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'] as const;
const HEADING_TYPES = ['heading-one', 'heading-two'] as const;
const EXIT_ON_ENTER_TYPES = [...HEADING_TYPES, 'block-quote'] as const;

const RichTextSchema = defineEditorSchema('schema:derived', {
  elements: {
    'block-quote': {
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['alignable'],
      slice: { preserveContext: true },
    },
    'bulleted-list': {
      content: schema.content.type('list-item', {
        default: { type: 'list-item' },
        min: 1,
      }),
      groups: ['alignable'],
      slice: { preserveContext: true },
    },
    'heading-one': {
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['alignable'],
      slice: { preserveContext: true },
    },
    'heading-two': {
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['alignable'],
      slice: { preserveContext: true },
    },
    'list-item': {
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['alignable'],
    },
    'numbered-list': {
      content: schema.content.type('list-item', {
        default: { type: 'list-item' },
        min: 1,
      }),
      groups: ['alignable'],
      properties: { start: property.number() },
      slice: { preserveContext: true },
    },
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['alignable'],
    },
  },
  groups: {
    alignable: {},
  },
  properties: [
    schema.elementProperty('align', property.string(), {
      target: target.group('alignable'),
    }),
    ...TEXT_MARK_TYPES.map((mark) =>
      schema.textProperty(
        mark,
        property.boolean({ default: false, omitDefault: true }),
        { typeChange: 'preserve-if-allowed' }
      )
    ),
  ],
  root: schema.content.group('block', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
});

type RichTextValue = EditorValueFromExtensions<
  readonly [typeof RichTextExtension]
>;
type RichTextEditor = ReactEditor<RichTextValue>;
type RichTextElement = SchemaElementFor<typeof RichTextSchema>;
type RichTextElementType = SchemaElementTypes<typeof RichTextSchema>;
type RichTextDescendant = SchemaDescendant<typeof RichTextSchema>;
type RichTextText = SchemaText<typeof RichTextSchema>;
type RichTextTextKey = SchemaTextPropertyKeys<typeof RichTextSchema>;

const RICH_TEXT_HTML_BLOCK_TYPES = new Set<RichTextElementType>([
  'block-quote',
  'bulleted-list',
  'heading-one',
  'heading-two',
  'list-item',
  'numbered-list',
  'paragraph',
]);

type AlignType = (typeof TEXT_ALIGN_TYPES)[number];
type ExitOnEnterType = (typeof EXIT_ON_ENTER_TYPES)[number];
type ListType = (typeof LIST_TYPES)[number];
type RichTextElementFormat = RichTextElementType | AlignType | ListType;

const MARK_HOTKEYS = Object.entries(HOTKEYS);
const BLOCK_HOTKEYS: [string, RichTextElementFormat][] = [
  ['mod+alt+0', 'paragraph'],
  ['mod+alt+1', 'heading-one'],
  ['mod+alt+2', 'heading-two'],
  ['mod+shift+e', 'center'],
  ['mod+shift+j', 'justify'],
  ['mod+shift+l', 'left'],
  ['mod+shift+r', 'right'],
];
const CLEAR_FORMATTING_HOTKEY = 'mod+\\';

const RichTextExample = () => {
  const editor = usePliteEditor({
    extensions: [history(), RichTextExtension],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is editable ' },
          { text: 'rich', bold: true },
          { text: ' text, ' },
          { text: 'much', italic: true },
          { text: ' better than a ' },
          { text: '<textarea>', code: true },
          { text: '!' },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: "Since it's rich text, you can do things like turn a selection of text ",
          },
          { text: 'bold', bold: true },
          {
            text: ', or add a semantically rendered block quote in the middle of the page, like this:',
          },
        ],
      },
      {
        type: 'block-quote',
        children: [{ text: 'A wise quote.' }],
      },
      {
        type: 'paragraph',
        align: 'center',
        children: [{ text: 'Try it out for yourself!' }],
      },
    ],
  });

  return (
    <Plite editor={editor}>
      <Toolbar>
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        <MarkButton format="code" icon="code" />
        <BlockButton format="heading-one" icon="looks_one" />
        <BlockButton format="heading-two" icon="looks_two" />
        <BlockButton format="block-quote" icon="format_quote" />
        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
        <BlockButton format="left" icon="format_align_left" />
        <BlockButton format="center" icon="format_align_center" />
        <BlockButton format="right" icon="format_align_right" />
        <BlockButton format="justify" icon="format_align_justify" />
        <ClearFormattingButton />
      </Toolbar>
      <Editable
        autoFocus
        onKeyDown={(event) => handleRichTextKeyDown(editor, event)}
        placeholder="Enter some rich text…"
        renderElement={Element}
        renderLeaf={Leaf}
        spellCheck
      />
    </Plite>
  );
};

const toggleBlock = (editor: RichTextEditor, format: RichTextElementFormat) => {
  const isActive = isBlockActive(
    editor,
    format,
    isAlignType(format) ? 'align' : 'type'
  );
  const isList = isListType(format);
  const alignBlockPath = isAlignType(format)
    ? editor.read((state) => {
        const selection = state.selection();

        if (!selection || !RangeApi.isCollapsed(selection)) {
          return null;
        }

        return (
          state.nodes.above({
            at: selection,
            match: (n) => NodeApi.isElement(n) && state.nodes.isBlock(n),
          })?.[1] ?? null
        );
      })
    : null;

  editor.update((tx) => {
    if (isAlignType(format)) {
      if (alignBlockPath) {
        tx.nodes.set(
          { align: isActive ? undefined : format },
          {
            at: alignBlockPath,
            match: (n) => NodeApi.isElement(n) && tx.nodes.isBlock(n),
          }
        );
        return;
      }

      tx.nodes.set(
        { align: isActive ? undefined : format },
        { match: (n) => NodeApi.isElement(n) && tx.nodes.isBlock(n) }
      );
      return;
    }

    tx.nodes.unwrap({
      match: (n) =>
        NodeApi.isElement(n) &&
        isListType((n as PliteElement).type as RichTextElementFormat),
      split: true,
    });

    tx.nodes.set(
      { type: isActive ? 'paragraph' : isList ? 'list-item' : format },
      { match: (n) => NodeApi.isElement(n) && tx.nodes.isBlock(n) }
    );

    if (!isActive && isList) {
      tx.nodes.wrap({ type: format, children: [] });
    }
  });
};

const clearRichTextFormatting = (editor: RichTextEditor) => {
  editor.update((tx) => {
    for (const mark of TEXT_MARK_TYPES) {
      tx.marks.remove(mark);
    }

    tx.nodes.set(
      { align: undefined },
      { match: (n) => NodeApi.isElement(n) && tx.nodes.isBlock(n) }
    );
  });
};

const toRichTextLeaf = (node: PliteText): RichTextText => ({
  ...(node.bold ? { bold: true } : {}),
  ...(node.code ? { code: true } : {}),
  ...(node.italic ? { italic: true } : {}),
  ...(node.underline ? { underline: true } : {}),
  text: node.text,
});

const normalizeRichTextHtmlChildren = (
  children: readonly unknown[]
): RichTextDescendant[] => children.flatMap(normalizeRichTextHtmlNode);

const normalizeRichTextHtmlNode = (node: unknown): RichTextDescendant[] => {
  if (typeof node === 'string') {
    return [{ text: node }];
  }

  if (TextApi.isText(node)) {
    return [toRichTextLeaf(node)];
  }

  if (!node || typeof node !== 'object' || !NodeApi.isElement(node as Node)) {
    return [];
  }

  const pliteElement = node as PliteElement;
  const children = normalizeRichTextHtmlChildren(pliteElement.children);
  if (
    !RICH_TEXT_HTML_BLOCK_TYPES.has(pliteElement.type as RichTextElementType)
  ) {
    return children;
  }

  const element: RichTextElement = {
    type: pliteElement.type as RichTextElementType,
    children: children.length > 0 ? children : [{ text: '' }],
  } as RichTextElement;

  return typeof pliteElement.align === 'string'
    ? [{ ...element, align: pliteElement.align } as RichTextElement]
    : [element];
};

const normalizeRichTextHtmlFragment = (fragment: unknown): RichTextValue => {
  const nodes = Array.isArray(fragment)
    ? normalizeRichTextHtmlChildren(fragment)
    : normalizeRichTextHtmlNode(fragment);
  const value: RichTextElement[] = [];
  let inlineChildren: RichTextDescendant[] = [];
  const flushInlineChildren = () => {
    if (inlineChildren.length === 0) {
      return;
    }

    value.push({ type: 'paragraph', children: inlineChildren });
    inlineChildren = [];
  };

  for (const node of nodes) {
    if (TextApi.isText(node)) {
      inlineChildren.push(node);
      continue;
    }

    flushInlineChildren();
    value.push(node as RichTextElement);
  }

  flushInlineChildren();

  return value.length > 0
    ? value
    : [{ type: 'paragraph', children: [{ text: '' }] }];
};

const RichTextExtension = defineExtension('richtext', {
  contributions: [
    clipboardHandler({
      insertData(data, { next, tx }) {
        const html = data.getData('text/html');

        if (!html) {
          return next();
        }

        if (
          data.getData('application/x-plite-fragment') ||
          html.includes('data-plite-fragment=')
        ) {
          return next();
        }

        const hasPlainText = Array.from(data.types).includes('text/plain');
        const text = hasPlainText ? data.getData('text/plain') : '';

        if (isPlainTextClipboardHtml(html, text)) {
          return next();
        }

        const parsed = parseDOMClipboardHtml(html);
        const fragment = normalizeRichTextHtmlFragment(
          deserialize(parsed.body)
        );

        tx.fragment.replace(fragment);
        return true;
      },
    }),
  ],
  commands: ({ around }) => [
    around(editorCommands.insertBreak, ({ state, next }) => {
      const selection = state.selection();

      if (selection && RangeApi.isCollapsed(selection)) {
        const blockEntry = state.nodes.above({
          at: selection,
          match: (n) => NodeApi.isElement(n) && state.nodes.isBlock(n),
        });

        if (blockEntry) {
          const [block, blockPath] = blockEntry;

          if (
            NodeApi.isElement(block) &&
            isExitOnEnterType(block.type as RichTextElementType)
          ) {
            const blockText = NodeApi.string(block);
            const end = state.points.end(blockPath);

            if (
              blockText === '' ||
              (end && PointApi.equals(selection.anchor, end))
            ) {
              const paragraphPath = PathApi.next(blockPath);
              const result = next();

              if (result === false) return false;

              return state.transaction.extend(result, (tx) => {
                tx.nodes.set(
                  { type: 'paragraph' },
                  {
                    at: paragraphPath,
                    match: (n) => NodeApi.isElement(n) && tx.nodes.isBlock(n),
                  }
                );
              });
            }
          }
        }
      }

      return false;
    }),
  ],
  schema: RichTextSchema.schema,
});

const handleRichTextKeyDown = (
  editor: RichTextEditor,
  event: React.KeyboardEvent<HTMLDivElement>
) => {
  if (isHotkey(CLEAR_FORMATTING_HOTKEY, event)) {
    clearRichTextFormatting(editor);
    return true;
  }

  for (const [hotkey, format] of BLOCK_HOTKEYS) {
    if (isHotkey(hotkey, event)) {
      toggleBlock(editor, format);
      return true;
    }
  }

  for (const [hotkey, mark] of MARK_HOTKEYS) {
    if (isHotkey(hotkey, event)) {
      editor.update.marks.toggle(mark);
      return true;
    }
  }
};

const isBlockActive = (
  editor: RichTextEditor,
  format: RichTextElementFormat,
  blockType: 'type' | 'align' = 'type'
) => {
  const selection = editor.read.selection();
  if (!selection) return false;

  return editor.read((state) =>
    state.nodes.some({
      at: state.ranges.unhang(selection),
      match: (n) => {
        if (NodeApi.isElement(n)) {
          if (blockType === 'align' && typeof n.align === 'string') {
            return n.align === format;
          }
          return n.type === format;
        }
        return false;
      },
    })
  );
};

const Element = ({
  attributes,
  children,
  element,
}: RenderElementProps<RichTextElement>) => {
  const style: React.CSSProperties = {};
  if (element.align) {
    style.textAlign = element.align as AlignType;
  }
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({
  attributes,
  children,
  leaf,
}: RenderLeafProps<RichTextText>) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.code) {
    children = <code>{children}</code>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const handleToolbarButtonClick = (
  event: MouseEvent<HTMLButtonElement>,
  command: () => void
) => {
  if (event.detail === 0) {
    command();
  }
};

const handleToolbarButtonPointerDown = (
  event: PointerEvent<HTMLButtonElement>,
  command: () => void
) => {
  event.preventDefault();
  command();
};

interface BlockButtonProps {
  format: RichTextElementFormat;
  icon: string;
}

const BlockButton = ({ format, icon }: BlockButtonProps) => {
  const editor = useEditor();
  const active = useEditorSelector((editor) =>
    isBlockActive(editor, format, isAlignType(format) ? 'align' : 'type')
  );
  const runCommand = () => toggleBlock(editor, format);
  return (
    <Button
      active={active}
      data-test-id={`block-button-${format}`}
      onClick={(event) => handleToolbarButtonClick(event, runCommand)}
      onPointerDown={(event) =>
        handleToolbarButtonPointerDown(event, runCommand)
      }
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const ClearFormattingButton = () => {
  const editor = useEditor();
  const runCommand = () => clearRichTextFormatting(editor);

  return (
    <Button
      data-test-id="clear-formatting-button"
      onClick={(event) => handleToolbarButtonClick(event, runCommand)}
      onPointerDown={(event) =>
        handleToolbarButtonPointerDown(event, runCommand)
      }
    >
      <Icon>format_clear</Icon>
    </Button>
  );
};

interface MarkButtonProps {
  format: RichTextTextKey;
  icon: string;
}

const MarkButton = ({ format, icon }: MarkButtonProps) => {
  const editor = useEditor();
  const active = useEditorSelector(
    (editor) => editor.read.marks()?.[format] === true
  );
  const runCommand = () => editor.update.marks.toggle(format);
  return (
    <Button
      active={active}
      data-test-id={`mark-button-${format}`}
      onClick={(event) => handleToolbarButtonClick(event, runCommand)}
      onPointerDown={(event) =>
        handleToolbarButtonPointerDown(event, runCommand)
      }
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const isAlignType = (format: RichTextElementFormat): format is AlignType =>
  TEXT_ALIGN_TYPES.includes(format as AlignType);

const isListType = (format: RichTextElementFormat): format is ListType =>
  LIST_TYPES.includes(format as ListType);

const isExitOnEnterType = (
  format: RichTextElementFormat
): format is ExitOnEnterType =>
  EXIT_ON_ENTER_TYPES.includes(format as ExitOnEnterType);

export default RichTextExample;

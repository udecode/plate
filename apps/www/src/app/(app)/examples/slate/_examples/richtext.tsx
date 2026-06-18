import type React from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import {
  type Descendant,
  defineEditorExtension,
  type Node,
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
  type Element as SlateElement,
  type Text as SlateText,
  TextApi,
} from '@platejs/slate';
import { isHotkey } from '@platejs/slate-dom';
import {
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
  Slate,
  useEditor,
  useEditorSelector,
  useSlateEditor,
} from '@platejs/slate-react';
import { Button, Icon, Toolbar } from './components';
import type {
  CustomEditor,
  CustomElement,
  CustomElementType,
  CustomElementWithAlign,
  CustomText,
  CustomTextKey,
  CustomValue,
} from './custom-types.d';
import { isMarkActive, toggleMark } from './mark-utils';
import { deserialize, isPlainTextClipboardHtml } from './paste-html-import';

const HOTKEYS: Record<string, CustomTextKey> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};
const TEXT_MARK_TYPES = Object.values(HOTKEYS);

const LIST_TYPES = ['numbered-list', 'bulleted-list'] as const;
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'] as const;
const HEADING_TYPES = ['heading-one', 'heading-two'] as const;
const EXIT_ON_ENTER_TYPES = [...HEADING_TYPES, 'block-quote'] as const;
const RICH_TEXT_HTML_BLOCK_TYPES = new Set<CustomElementType>([
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
type CustomElementFormat = CustomElementType | AlignType | ListType;

const MARK_HOTKEYS = Object.entries(HOTKEYS);
const BLOCK_HOTKEYS: [string, CustomElementFormat][] = [
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
  const initialValue: CustomValue = [
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
  ];
  const editor = useSlateEditor({
    extensions: [richText()],
    initialValue,
  });

  return (
    <Slate editor={editor}>
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
    </Slate>
  );
};

const toggleBlock = (editor: CustomEditor, format: CustomElementFormat) => {
  const isActive = isBlockActive(
    editor,
    format,
    isAlignType(format) ? 'align' : 'type'
  );
  const isList = isListType(format);
  const alignBlockPath = isAlignType(format)
    ? editor.read((state) => {
        const selection = state.selection.get();

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
        isListType((n as SlateElement).type as CustomElementFormat),
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

const clearRichTextFormatting = (editor: CustomEditor) => {
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

const toRichTextLeaf = (node: SlateText) => {
  const leaf: CustomText = { text: node.text };

  for (const mark of TEXT_MARK_TYPES) {
    if (node[mark]) {
      leaf[mark] = true;
    }
  }

  return leaf;
};

const normalizeRichTextHtmlChildren = (children: unknown[]): Descendant[] =>
  children.flatMap(normalizeRichTextHtmlNode);

const normalizeRichTextHtmlNode = (node: unknown): Descendant[] => {
  if (typeof node === 'string') {
    return [{ text: node }];
  }

  if (TextApi.isText(node)) {
    return [toRichTextLeaf(node)];
  }

  if (!node || typeof node !== 'object' || !NodeApi.isElement(node as Node)) {
    return [];
  }

  const slateElement = node as SlateElement;
  const children = normalizeRichTextHtmlChildren(slateElement.children);
  if (!RICH_TEXT_HTML_BLOCK_TYPES.has(slateElement.type as CustomElementType)) {
    return children;
  }

  const element: CustomElement = {
    type: slateElement.type as CustomElementType,
    children: children.length > 0 ? children : [{ text: '' }],
  } as CustomElement;

  return isAlignElement(slateElement)
    ? [{ ...element, align: slateElement.align } as CustomElement]
    : [element];
};

const normalizeRichTextHtmlFragment = (fragment: unknown): CustomValue => {
  const nodes = Array.isArray(fragment)
    ? normalizeRichTextHtmlChildren(fragment)
    : normalizeRichTextHtmlNode(fragment);
  const value: CustomValue = [];
  let inlineChildren: Descendant[] = [];
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
    value.push(node as CustomElement);
  }

  flushInlineChildren();

  return value.length > 0
    ? value
    : [{ type: 'paragraph', children: [{ text: '' }] }];
};

const richText = () =>
  defineEditorExtension<CustomEditor>()({
    name: 'richtext',
    clipboard: {
      insertData(data, { editor, next }) {
        const html = data.getData('text/html');

        if (!html) {
          return next();
        }

        if (
          data.getData('application/x-slate-fragment') ||
          html.includes('data-slate-fragment=')
        ) {
          return next();
        }

        const hasPlainText = Array.from(data.types).includes('text/plain');
        const text = hasPlainText ? data.getData('text/plain') : '';

        if (isPlainTextClipboardHtml(html, text)) {
          return next();
        }

        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const fragment = normalizeRichTextHtmlFragment(
          deserialize(parsed.body)
        );

        editor.update((tx) => {
          tx.fragment.insert(fragment);
        });
        return true;
      },
    },
    transforms: {
      insertBreak({ next, tx }) {
        const selection = tx.selection.get();

        if (selection && RangeApi.isCollapsed(selection)) {
          const blockEntry = tx.nodes.above({
            at: selection,
            match: (n) => NodeApi.isElement(n) && tx.nodes.isBlock(n),
          });

          if (blockEntry) {
            const [block, blockPath] = blockEntry;

            if (
              NodeApi.isElement(block) &&
              isExitOnEnterType(block.type as CustomElementType)
            ) {
              const blockText = NodeApi.string(block);
              const end = tx.points.end(blockPath);

              if (blockText === '' || PointApi.equals(selection.anchor, end)) {
                const paragraphPath = PathApi.next(blockPath);
                const result = next();

                tx.nodes.set(
                  { type: 'paragraph' },
                  {
                    at: paragraphPath,
                    match: (n) => NodeApi.isElement(n) && tx.nodes.isBlock(n),
                  }
                );

                return result;
              }
            }
          }
        }

        return next();
      },
    },
  });

const handleRichTextKeyDown = (
  editor: CustomEditor,
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
      toggleMark(editor, mark);
      return true;
    }
  }
};

const isBlockActive = (
  editor: CustomEditor,
  format: CustomElementFormat,
  blockType: 'type' | 'align' = 'type'
) => {
  const selection = editor.read((state) => state.selection.get());
  if (!selection) return false;

  return editor.read((state) =>
    state.nodes.some({
      at: state.ranges.unhang(selection),
      match: (n) => {
        if (NodeApi.isElement(n)) {
          if (blockType === 'align' && isAlignElement(n)) {
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
}: RenderElementProps<CustomElement>) => {
  const style: React.CSSProperties = {};
  if (isAlignElement(element)) {
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

const Leaf = ({ attributes, children, leaf }: RenderLeafProps<CustomText>) => {
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
  format: CustomElementFormat;
  icon: string;
}

const BlockButton = ({ format, icon }: BlockButtonProps) => {
  const editor = useEditor<CustomEditor>();
  const active = useEditorSelector((editor: CustomEditor) =>
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
  const editor = useEditor<CustomEditor>();
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
  format: CustomTextKey;
  icon: string;
}

const MarkButton = ({ format, icon }: MarkButtonProps) => {
  const editor = useEditor<CustomEditor>();
  const active = useEditorSelector((editor: CustomEditor) =>
    isMarkActive(editor, format)
  );
  const runCommand = () => toggleMark(editor, format);
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

const isAlignType = (format: CustomElementFormat): format is AlignType =>
  TEXT_ALIGN_TYPES.includes(format as AlignType);

const isListType = (format: CustomElementFormat): format is ListType =>
  LIST_TYPES.includes(format as ListType);

const isExitOnEnterType = (
  format: CustomElementFormat
): format is ExitOnEnterType =>
  EXIT_ON_ENTER_TYPES.includes(format as ExitOnEnterType);

const isAlignElement = (
  element: SlateElement
): element is CustomElementWithAlign => 'align' in element;

export default RichTextExample;

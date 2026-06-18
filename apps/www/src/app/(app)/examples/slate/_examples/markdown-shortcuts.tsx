import {
  defineEditorExtension,
  type EditorUpdateTransaction,
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
  type Element as SlateElement,
} from '@platejs/slate';
import {
  Editable,
  type RenderElementProps,
  Slate,
  useSlateEditor,
} from '@platejs/slate-react';

import type {
  BulletedListElement,
  CustomEditor,
  CustomElement,
  CustomElementType,
  CustomValue,
  NumberedListItemElement,
} from './custom-types.d';

const SHORTCUTS: Record<string, CustomElementType> = {
  '+': 'list-item',
  '*': 'list-item',
  '-': 'list-item',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '####': 'heading-four',
  '#####': 'heading-five',
  '######': 'heading-six',
} as const;
const BULLETED_LIST_SHORTCUTS = new Set(['*', '-', '+']);
const HEADING_TYPES = new Set<CustomElementType>([
  'heading-one',
  'heading-two',
  'heading-three',
  'heading-four',
  'heading-five',
  'heading-six',
]);
const ORDERED_LIST_SHORTCUT = /^(\d+)\.$/;
const SHORTCUT_TRAILING_WHITESPACE = /\s$/u;

const MarkdownShortcutsExample = () => {
  const initialValue: CustomValue = [
    {
      type: 'paragraph',
      children: [
        {
          text: 'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
        },
      ],
    },
    {
      type: 'block-quote',
      children: [{ text: 'A wise quote.' }],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'Order when you start a line with "## " you get a level-two heading, like this:',
        },
      ],
    },
    {
      type: 'heading-two',
      children: [{ text: 'Try it out!' }],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
        },
      ],
    },
  ];
  const editor = useSlateEditor({
    extensions: [markdownShortcuts()],
    initialValue,
  });
  return (
    <Slate editor={editor}>
      <Editable
        autoFocus
        placeholder="Write some markdown..."
        renderElement={renderElement}
        spellCheck
      />
    </Slate>
  );
};

const markdownShortcuts = () =>
  defineEditorExtension<CustomEditor>()({
    name: 'markdown-shortcuts',
    transforms: {
      deleteBackward({ editor, next, tx, unit }) {
        const selection = tx.selection.get();

        if (
          unit === 'character' &&
          selection &&
          RangeApi.isCollapsed(selection)
        ) {
          const match = tx.nodes.above({
            match: (n) => NodeApi.isElement(n) && tx.nodes.isBlock(n),
          });

          if (match) {
            const [block, path] = match;
            const start = tx.points.start(path);

            if (
              NodeApi.isElement(block) &&
              block.type !== 'paragraph' &&
              PointApi.equals(selection.anchor, start)
            ) {
              tx.nodes.set({
                type: 'paragraph',
              } satisfies Partial<SlateElement>);

              if (block.type === 'list-item') {
                tx.nodes.unwrap({
                  match: (n) =>
                    NodeApi.isElement(n) &&
                    (n.type === 'bulleted-list' || n.type === 'numbered-list'),
                  split: true,
                });
              }

              selectCurrentBlockStart(tx);
              editor.api.dom.focus();
              return true;
            }
          }
        }

        return next({ unit });
      },
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
              HEADING_TYPES.has(block.type as CustomElementType)
            ) {
              const start = tx.points.start(blockPath);

              if (PointApi.equals(selection.anchor, start)) {
                const result = next();

                tx.nodes.set(
                  { type: 'paragraph' },
                  {
                    at: blockPath,
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
      insertText({ editor, next, text, tx }) {
        const selection = tx.selection.get();

        if (
          SHORTCUT_TRAILING_WHITESPACE.test(text) &&
          selection &&
          RangeApi.isCollapsed(selection)
        ) {
          const { anchor } = selection;
          const block = tx.nodes.above({
            match: (n) => NodeApi.isElement(n) && tx.nodes.isBlock(n),
          });
          const path = block ? block[1] : [];
          const currentBlock = block?.[0];
          const start = tx.points.start(path);
          const range = { anchor, focus: start };
          const beforeText =
            tx.text.string(range) +
            text.replace(SHORTCUT_TRAILING_WHITESPACE, '');
          const orderedListMatch = ORDERED_LIST_SHORTCUT.exec(beforeText);
          const type = orderedListMatch ? 'list-item' : SHORTCUTS[beforeText];

          if (type) {
            if (
              currentBlock &&
              NodeApi.isElement(currentBlock) &&
              currentBlock.type !== 'paragraph'
            ) {
              if (type === 'list-item' && currentBlock.type === 'list-item') {
                tx.selection.set(range);

                if (!RangeApi.isCollapsed(range)) {
                  tx.text.delete();
                }

                selectCurrentBlockStart(tx);
                editor.api.dom.focus();

                return true;
              }

              return next();
            }

            tx.selection.set(range);

            if (!RangeApi.isCollapsed(range)) {
              tx.text.delete();
            }

            tx.nodes.set(
              { type },
              {
                match: (n) => NodeApi.isElement(n) && tx.nodes.isBlock(n),
              }
            );

            if (type === 'list-item') {
              const list = createListElement(beforeText, orderedListMatch);

              tx.nodes.wrap(list, {
                match: (n) => NodeApi.isElement(n) && n.type === 'list-item',
              });

              if (list.type === 'bulleted-list') {
                mergeAdjacentBulletedLists(tx);
              }
            }

            selectCurrentBlockStart(tx);
            editor.api.dom.focus();

            return true;
          }
        }

        return next();
      },
    },
  });

const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps<CustomElement>) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>;
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>;
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return (
        <ol start={element.start} {...attributes}>
          {children}
        </ol>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const createListElement = (
  shortcut: string,
  orderedListMatch: RegExpExecArray | null
): BulletedListElement | NumberedListItemElement => {
  if (orderedListMatch) {
    return {
      type: 'numbered-list',
      start: Number(orderedListMatch[1]),
      children: [],
    };
  }

  if (!BULLETED_LIST_SHORTCUTS.has(shortcut)) {
    throw new Error(`Unsupported list shortcut: ${shortcut}`);
  }

  return {
    type: 'bulleted-list',
    children: [],
  };
};

const mergeAdjacentBulletedLists = (
  tx: EditorUpdateTransaction<CustomValue>
) => {
  const selection = tx.selection.get();

  if (!selection) {
    return;
  }

  const listEntry = tx.nodes.above({
    at: selection,
    match: (n) => NodeApi.isElement(n) && n.type === 'bulleted-list',
  });

  if (!listEntry) {
    return;
  }

  let [, listPath] = listEntry;

  if (PathApi.hasPrevious(listPath)) {
    const previousPath = PathApi.previous(listPath);
    const [previousNode] = tx.nodes.hasPath(previousPath)
      ? tx.nodes.get(previousPath)
      : [null, previousPath];

    if (
      previousNode &&
      NodeApi.isElement(previousNode) &&
      previousNode.type === 'bulleted-list'
    ) {
      tx.nodes.merge({ at: listPath });
      listPath = previousPath;
    }
  }

  const nextPath = PathApi.next(listPath);
  const [nextNode] = tx.nodes.hasPath(nextPath)
    ? tx.nodes.get(nextPath)
    : [null, nextPath];

  if (
    nextNode &&
    NodeApi.isElement(nextNode) &&
    nextNode.type === 'bulleted-list'
  ) {
    tx.nodes.merge({ at: nextPath });
  }
};

const selectCurrentBlockStart = (tx: EditorUpdateTransaction<CustomValue>) => {
  const block = tx.nodes.above({
    match: (n) => NodeApi.isElement(n) && tx.nodes.isBlock(n),
  });

  if (block) {
    tx.selection.set(tx.points.start(block[1]));
  }
};

export default MarkdownShortcutsExample;

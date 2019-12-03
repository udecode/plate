import React, { useCallback, useMemo } from 'react';
import { createEditor, Editor, Point, Range } from 'slate';
import { withHistory } from 'slate-history';
import { RenderElementProps, withReact } from 'slate-react';
import { Editable, Slate } from 'slate-react-next';
import { initialValue } from './config';

const SHORTCUTS: any = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '####': 'heading-four',
  '#####': 'heading-five',
  '######': 'heading-six',
};

const withShortcuts = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    const { selection } = editor;

    if (
      command.type === 'insert_text' &&
      command.text === ' ' &&
      selection &&
      Range.isCollapsed(selection)
    ) {
      const { anchor } = selection;
      const [block] = Editor.nodes(editor, { match: 'block' });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.text(editor, range);
      const type = SHORTCUTS[beforeText];

      if (type) {
        Editor.select(editor, range);
        Editor.delete(editor);
        Editor.setNodes(editor, { type }, { match: 'block' });

        if (type === 'list-item') {
          const list = { type: 'bulleted-list', children: [] };
          Editor.wrapNodes(editor, list, { match: { type: 'list-item' } });
        }

        return;
      }
    }

    if (
      command.type === 'delete_backward' &&
      selection &&
      Range.isCollapsed(selection)
    ) {
      const [match] = Editor.nodes(editor, { match: 'block' });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          Editor.setNodes(editor, { type: 'paragraph' });

          if (block.type === 'list-item') {
            Editor.unwrapNodes(editor, { match: { type: 'bulleted-list' } });
          }

          return;
        }
      }
    }

    exec(command);
  };

  return editor;
};

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>;
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>;
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>;
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const MarkdownShortcuts = () => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const editor = useMemo(
    () => withShortcuts(withReact(withHistory(createEditor()))),
    []
  );
  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Editable
        renderElement={renderElement}
        placeholder="Write some markdown..."
        spellCheck
        autoFocus
      />
    </Slate>
  );
};

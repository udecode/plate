import React, { useCallback, useMemo, useState } from 'react';
import { css } from 'emotion';
import { createEditor, Editor, Point, Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  Slate,
  useEditor,
  useReadOnly,
  withReact,
} from 'slate-react';
import { initialValue } from './config';

const withChecklists = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    const { selection } = editor;

    if (
      command.type === 'delete_backward' &&
      selection &&
      Range.isCollapsed(selection)
    ) {
      const [match] = Editor.nodes(editor, {
        match: { type: 'check-list-item' },
      });

      if (match) {
        const [, path] = match;
        const start = Editor.start(editor, path);

        if (Point.equals(selection.anchor, start)) {
          Editor.setNodes(
            editor,
            { type: 'paragraph' },
            { match: { type: 'check-list-item' } }
          );
          return;
        }
      }
    }

    exec(command);
  };

  return editor;
};

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case 'check-list-item':
      return <CheckListItemElement {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const CheckListItemElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const editor = useEditor();
  const readOnly = useReadOnly();
  const { checked } = element;
  return (
    <div
      {...attributes}
      className={css`
        display: flex;
        flex-direction: row;
        align-items: center;

        & + & {
          margin-top: 0;
        }
      `}
    >
      <span
        contentEditable={false}
        className={css`
          margin-right: 0.75em;
        `}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={event => {
            const path = ReactEditor.findPath(editor, element);
            Editor.setNodes(
              editor,
              { checked: event.target.checked },
              { at: path }
            );
          }}
        />
      </span>
      <span
        contentEditable={!readOnly}
        suppressContentEditableWarning
        className={css`
          flex: 1;
          opacity: ${checked ? 0.666 : 1};
          text-decoration: ${checked ? 'none' : 'line-through'};

          &:focus {
            outline: none;
          }
        `}
      >
        {children}
      </span>
    </div>
  );
};

export const CheckLists = () => {
  const [value, setValue] = useState(initialValue);
  const [selection, setSelection] = useState<Range | null>(null);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const editor = useMemo(
    () => withChecklists(withHistory(withReact(createEditor()))),
    []
  );
  return (
    <Slate
      editor={editor}
      value={value}
      selection={selection}
      onChange={(newValue, newSelection) => {
        setValue(newValue);
        setSelection(newSelection);
      }}
    >
      <Editable
        renderElement={renderElement}
        placeholder="Get to work…"
        spellCheck
        autoFocus
      />
    </Slate>
  );
};

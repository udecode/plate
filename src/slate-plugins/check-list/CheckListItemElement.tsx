import React from 'react';
import { css } from 'emotion';
import { Editor } from 'slate';
import {
  ReactEditor,
  RenderElementProps,
  useEditor,
  useReadOnly,
} from 'slate-react';

export const CheckListItemElement = ({
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

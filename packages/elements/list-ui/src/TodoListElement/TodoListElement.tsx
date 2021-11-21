import React from 'react';
import { setNodes, TElement } from '@udecode/plate-core';
import { TodoListItemNodeData } from '@udecode/plate-list';
import { getRootProps } from '@udecode/plate-styled-components';
import clsx from 'clsx';
import { ReactEditor, useReadOnly } from 'slate-react';
import { getTodoListElementStyles } from './TodoListElement.styles';
import { TodoListElementProps } from './TodoListElement.types';

export const TodoListElement = (props: TodoListElementProps) => {
  const { attributes, children, nodeProps, element, editor } = props;

  const rootProps = getRootProps(props);

  const readOnly = useReadOnly();

  const { checked } = element;

  const styles = getTodoListElementStyles({ ...props, checked });

  return (
    <div
      {...attributes}
      css={styles.root.css}
      {...rootProps}
      className={clsx(
        styles.root.className,
        styles.rootChecked?.className,
        rootProps?.className
      )}
    >
      <div
        contentEditable={false}
        css={styles.checkboxWrapper?.css}
        className={styles.checkboxWrapper?.className}
      >
        <input
          data-testid="TodoListElementCheckbox"
          css={styles.checkbox?.css}
          className={styles.checkbox?.className}
          type="checkbox"
          checked={!!checked}
          onChange={(e) => {
            const path = ReactEditor.findPath(editor, element);

            setNodes<TElement<TodoListItemNodeData>>(
              editor,
              { checked: e.target.checked },
              {
                at: path,
              }
            );
          }}
          {...nodeProps}
        />
      </div>
      <span
        css={styles.text?.css}
        className={styles.text?.className}
        contentEditable={!readOnly}
        suppressContentEditableWarning
      >
        {children}
      </span>
    </div>
  );
};

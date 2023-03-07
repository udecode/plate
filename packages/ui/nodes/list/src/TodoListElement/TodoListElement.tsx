import React from 'react';
import { findNodePath, setNodes, Value } from '@udecode/plate-common';
import { TTodoListItemElement } from '@udecode/plate-list';
import { getRootProps } from '@udecode/plate-styled-components';
import clsx from 'clsx';
import { useReadOnly } from 'slate-react';
import { getTodoListElementStyles } from './TodoListElement.styles';
import { TodoListElementProps } from './TodoListElement.types';

export const TodoListElement = <V extends Value>(
  props: TodoListElementProps<V>
) => {
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
            if (readOnly) return;
            const path = findNodePath(editor, element);
            if (!path) return;

            setNodes<TTodoListItemElement>(
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

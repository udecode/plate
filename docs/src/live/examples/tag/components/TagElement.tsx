import * as React from 'react';
import { useEditorRef } from '@udecode/slate-plugins';
import { Transforms } from 'slate';
import { useFocused, useSelected } from 'slate-react';
import { useHotkeys } from '../hooks/useHotkeys';
import { useOnMouseClick } from '../hooks/useOnMouseClick';
import { getTagElementStyles } from './TagElement.styles';
import { TagElementProps } from './TagElement.types';

export const TagElement = (props: TagElementProps) => {
  const { attributes, children, element } = props;

  const editor = useEditorRef();
  const selected = useSelected();
  const focused = useFocused();

  const onClickProps = useOnMouseClick(() => console.info('tag clicked'));

  useHotkeys(
    'backspace',
    () => {
      if (selected && focused && editor.selection) {
        Transforms.move(editor);
      }
    },
    [selected, focused]
  );
  useHotkeys(
    'delete',
    () => {
      if (selected && focused && editor.selection) {
        Transforms.move(editor, { reverse: true });
      }
    },
    [selected, focused]
  );

  const styles = getTagElementStyles(props);

  return (
    <div
      {...attributes}
      data-slate-value={element.value}
      css={styles.root.css}
      className={styles.root.className}
      contentEditable={false}
    >
      <div
        css={styles.link?.css}
        className={styles.link?.className}
        {...onClickProps}
      >
        #{element.value}
      </div>
      {children}
    </div>
  );
};

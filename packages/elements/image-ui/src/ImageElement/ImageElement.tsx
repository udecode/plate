import * as React from 'react';
import { setNodes } from '@udecode/plate-common';
import { useEditorRef } from '@udecode/plate-core';
import { Resizable } from 're-resizable';
import { ReactEditor, useFocused, useSelected } from 'slate-react';
import { getImageElementStyles } from './ImageElement.styles';
import { ImageElementProps } from './ImageElement.types';

const { useCallback } = React;

export const ImageElement = (props: ImageElementProps) => {
  const { attributes, children, element, nodeProps } = props;

  const { url, width, caption = { text: '' } } = element;
  const focused = useFocused();
  const selected = useSelected();
  const editor = useEditorRef();

  const styles = getImageElementStyles({ ...props, focused, selected });

  const onChangeImgWidth = useCallback(
    (_width: number) => {
      const path = ReactEditor.findPath(editor, element);
      setNodes(editor, { width: _width }, { at: path });
    },
    [editor, element]
  );

  const handleChangeCaption: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    const path = ReactEditor.findPath(editor, element);
    setNodes(
      editor,
      { caption: { ...caption, text: e.target.value } },
      { at: path }
    );
  };

  return (
    <div
      {...attributes}
      css={styles.root.css}
      className={styles.root.className}
    >
      <div contentEditable={false}>
        <Resizable
          maxWidth="100%"
          defaultSize={{ width, height: '100%' }}
          resizeRatio={1.5}
          lockAspectRatio
          onResizeStop={(e, e1, e2, e3) => onChangeImgWidth(e2.offsetWidth)}
        >
          <img
            data-testid="ImageElementImage"
            css={styles.img?.css}
            className={styles.img?.className}
            src={url}
            alt=""
            {...nodeProps}
          />
        </Resizable>
        <input
          value={caption.text}
          onChange={handleChangeCaption}
          css={styles.captionInput?.css}
          placeholder="Write a caption"
        />
      </div>
      {children}
    </div>
  );
};

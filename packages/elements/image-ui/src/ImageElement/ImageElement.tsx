import React, { useCallback, useEffect, useState } from 'react';
import { setNodes } from '@udecode/plate-common';
import { useEditorRef } from '@udecode/plate-core';
import { Resizable } from 're-resizable';
import { Transforms } from 'slate';
import { ReactEditor, useFocused, useSelected } from 'slate-react';
import { getImageElementStyles } from './ImageElement.styles';
import { ImageElementProps } from './ImageElement.types';
import { ImageHandle } from './ImageHandle';

export const ImageElement = (props: ImageElementProps) => {
  const {
    attributes,
    children,
    element,
    nodeProps,
    disableCaption,
    captionPlaceholder = 'Write a caption...',
    resizableProps = {
      minWidth: 92,
    },
  } = props;

  const { url, width: nodeWidth = '100%', caption = '' } = element;
  const focused = useFocused();
  const selected = useSelected();
  const editor = useEditorRef();

  const [width, setWidth] = useState(nodeWidth);

  useEffect(() => {
    setWidth(nodeWidth);
  }, [nodeWidth]);

  const styles = getImageElementStyles({ ...props, focused, selected });

  const setNodeWidth = useCallback(
    (w: number) => {
      const path = ReactEditor.findPath(editor, element);

      if (w === nodeWidth) {
        // Focus the node if not resized
        Transforms.select(editor, path);
      } else {
        setNodes(editor, { width: w }, { at: path });
      }
    },
    [editor, element, nodeWidth]
  );

  const onChangeCaption: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const path = ReactEditor.findPath(editor, element);
      setNodes(editor, { caption: e.target.value }, { at: path });
    },
    [editor, element]
  );

  return (
    <div
      {...attributes}
      css={styles.root.css}
      className={styles.root.className}
    >
      <div contentEditable={false}>
        <figure
          css={styles.figure?.css}
          className={`group ${styles.figure?.className}`}
        >
          <Resizable
            size={{ width, height: '100%' }}
            maxWidth="100%"
            lockAspectRatio
            enable={{ right: true }}
            handleComponent={{
              right: (
                <ImageHandle
                  css={styles.handle?.css}
                  className={styles.handle?.className}
                />
              ),
            }}
            handleStyles={{
              right: {
                right: 0,
              },
            }}
            onResize={(e, direction, ref) => {
              setWidth(ref.offsetWidth);
            }}
            onResizeStop={(e, direction, ref) => setNodeWidth(ref.offsetWidth)}
            {...resizableProps}
          >
            <img
              data-testid="ImageElementImage"
              css={styles.img?.css}
              className={styles.img?.className}
              src={url}
              alt={caption}
              {...nodeProps}
            />
          </Resizable>

          {!disableCaption && (caption.length || selected) && (
            <figcaption style={{ width }}>
              <input
                css={styles.captionInput?.css}
                className={styles.captionInput?.className}
                value={caption}
                placeholder={captionPlaceholder}
                onChange={onChangeCaption}
              />
            </figcaption>
          )}
        </figure>
      </div>
      {children}
    </div>
  );
};

import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { setNodes } from '@udecode/plate-common';
import { useEditorRef } from '@udecode/plate-core';
import { Resizable } from 're-resizable';
import { Node, Transforms } from 'slate';
import { ReactEditor, useFocused, useSelected } from 'slate-react';
import { getImageElementStyles } from './ImageElement.styles';
import { ImageElementProps } from './ImageElement.types';
import { ImageHandle } from './ImageHandle';

// const plugins = [
//   createHistoryPlugin(),
//   createReactPlugin(),
//   createSingleLinePlugin(),
// ];

export const ImageElement = (props: ImageElementProps) => {
  const {
    attributes,
    children,
    element,
    nodeProps,
    styles: _styles,
    classNames,
    prefixClassNames,
    caption = {},
    resizableProps = {
      minWidth: 92,
    },
    align = 'center',
    draggable,
    ...rootProps
  } = props;

  const { placeholder = 'Write a caption...' } = caption;

  const {
    url,
    width: nodeWidth = '100%',
    caption: nodeCaption = [{ children: [{ text: '' }] }],
  } = element;
  const focused = useFocused();
  const selected = useSelected();
  const editor = useEditorRef();
  const [width, setWidth] = useState(nodeWidth);

  // const [captionId] = useState(nanoid());

  useEffect(() => {
    setWidth(nodeWidth);
  }, [nodeWidth]);

  const styles = getImageElementStyles({ ...props, align, focused, selected });

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

  const onChangeCaption: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      const path = ReactEditor.findPath(editor as ReactEditor, element);
      setNodes(editor, { caption: [{ text: e.target.value }] }, { at: path });
    },
    [editor, element]
  );

  const captionString = useMemo(() => {
    return Node.string(nodeCaption[0]) || '';
  }, [nodeCaption]);

  return (
    <div
      {...attributes}
      css={styles.root.css}
      className={styles.root.className}
      {...rootProps}
      {...nodeProps}
    >
      <div contentEditable={false}>
        <figure
          css={styles.figure?.css}
          className={`group ${styles.figure?.className}`}
        >
          <Resizable
            // @ts-ignore
            css={styles.resizable?.css}
            className={styles.resizable?.className}
            size={{ width, height: '100%' }}
            maxWidth="100%"
            lockAspectRatio
            resizeRatio={align === 'center' ? 2 : 1}
            enable={{
              left: ['center', 'left'].includes(align),
              right: ['center', 'right'].includes(align),
            }}
            handleComponent={{
              left: (
                <ImageHandle
                  css={[styles.handleLeft?.css]}
                  className={styles.handleLeft?.className}
                />
              ),
              right: (
                <ImageHandle
                  css={styles.handleRight?.css}
                  className={styles.handleRight?.className}
                />
              ),
            }}
            handleStyles={{
              left: { left: 0 },
              right: { right: 0 },
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
              alt={captionString}
              draggable={draggable}
              {...nodeProps}
            />
          </Resizable>

          {!caption.disabled && (captionString.length || selected) && (
            <figcaption
              style={{ width }}
              css={styles.figcaption?.css}
              className={styles.figcaption?.className}
            >
              <TextareaAutosize
                css={styles.caption?.css}
                className={styles.caption?.className}
                value={nodeCaption[0].text}
                placeholder={placeholder}
                onChange={onChangeCaption}
              />

              {/* <div css={styles.caption?.css}> */}
              {/*  <Plate */}
              {/*    id={captionId} */}
              {/*    plugins={plugins} */}
              {/*    initialValue={nodeCaption} */}
              {/*    value={nodeCaption} */}
              {/*    editableProps={{ */}
              {/*      placeholder, */}
              {/*      className: styles.caption?.className, */}
              {/*    }} */}
              {/*    onChange={onChangeCaption} */}
              {/*  /> */}
              {/* </div> */}
            </figcaption>
          )}
        </figure>
      </div>
      {children}
    </div>
  );
};

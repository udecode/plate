import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {
  findNodePath,
  getNodeString,
  select,
  setNodes,
  TText,
  Value,
} from '@udecode/plate-core';
import { TImageElement } from '@udecode/plate-image';
import { getRootProps } from '@udecode/plate-styled-components';
import { Resizable, ResizableProps } from 're-resizable';
import { useFocused, useReadOnly, useSelected } from 'slate-react';
import { getImageElementStyles } from './ImageElement.styles';
import { ImageElementProps } from './ImageElement.types';
import { ImageHandle } from './ImageHandle';

export const ImageElement = <V extends Value>(props: ImageElementProps<V>) => {
  const {
    attributes,
    children,
    element,
    nodeProps,
    caption = {},
    resizableProps = {
      minWidth: 92,
    },
    align = 'center',
    draggable,
    editor,
    ignoreReadOnly = false,
  } = props;

  const rootProps = getRootProps(props);

  const { placeholder = 'Write a caption...' } = caption;

  const {
    url,
    width: nodeWidth = '100%',
    caption: nodeCaption = [{ children: [{ text: '' }] }],
  } = element;
  const focused = useFocused();
  const selected = useSelected();
  const readOnly = useReadOnly();
  const [width, setWidth] = useState(nodeWidth);

  const resizeProps: ResizableProps =
    !ignoreReadOnly && readOnly
      ? {
          ...resizableProps,
          enable: {
            left: false,
            right: false,
            top: false,
            bottom: false,
            topLeft: false,
            bottomLeft: false,
            topRight: false,
            bottomRight: false,
          },
        }
      : { ...resizableProps };

  // const [captionId] = useState(nanoid());

  useEffect(() => {
    setWidth(nodeWidth);
  }, [nodeWidth]);

  const styles = getImageElementStyles({ ...props, align, focused, selected });

  const setNodeWidth = useCallback(
    (w: number) => {
      const path = findNodePath(editor, element);
      if (!path) return;

      if (w === nodeWidth) {
        // Focus the node if not resized
        select(editor, path);
      } else {
        setNodes<TImageElement>(editor, { width: w }, { at: path });
      }
    },
    [editor, element, nodeWidth]
  );

  const onChangeCaption: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      const path = findNodePath(editor, element);
      path &&
        setNodes<TImageElement>(
          editor,
          { caption: [{ text: e.target.value }] },
          { at: path }
        );
    },
    [editor, element]
  );

  const captionString = useMemo(() => {
    return getNodeString(nodeCaption[0] as any) || '';
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
            data-testid="ImageElementResizable"
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
            {...resizeProps}
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
              data-testid="ImageElementCaption"
              style={{ width }}
              css={styles.figcaption?.css}
              className={styles.figcaption?.className}
            >
              <TextareaAutosize
                data-testid="ImageElementTextArea"
                css={styles.caption?.css}
                className={styles.caption?.className}
                value={(nodeCaption[0] as TText).text}
                placeholder={placeholder}
                onChange={onChangeCaption}
                readOnly={(!ignoreReadOnly && readOnly) || caption.readOnly}
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

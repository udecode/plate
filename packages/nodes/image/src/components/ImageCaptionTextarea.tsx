import React, { ChangeEventHandler, useCallback, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { TextareaAutosizeProps } from 'react-textarea-autosize/dist/declarations/src/index';
import {
  AsProps,
  createComponentAs,
  findNodePath,
  getNodeString,
  setNodes,
  TElement,
  useEditorRef,
} from '@udecode/plate-core';
import { useReadOnly } from 'slate-react';
import { useImageElement } from '../hooks/index';
import { TImageElement } from '../types';

export interface ImageCaptionTextareaProps
  extends TextareaAutosizeProps,
    AsProps<'textarea'> {}

export const useImageCaptionTextarea = (
  props: ImageCaptionTextareaProps
): TextareaAutosizeProps => {
  const element = useImageElement();

  const {
    caption: nodeCaption = [{ children: [{ text: '' }] }] as [TElement],
  } = element;

  const [captionValue, setCaptionValue] = useState(
    getNodeString(nodeCaption[0])
  );

  const editor = useEditorRef();
  const readOnly = useReadOnly();

  const onChangeCaption: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      const newValue = e.target.value;

      // local state
      setCaptionValue(newValue);

      const path = findNodePath(editor, element);

      // saved state
      if (path) {
        setNodes<TImageElement>(
          editor,
          { caption: [{ text: newValue }] },
          { at: path }
        );
      }
    },
    [editor, element]
  );

  return {
    value: captionValue,
    onChange: onChangeCaption,
    readOnly,
    ...props,
  };
};

export const ImageCaptionTextarea = createComponentAs<ImageCaptionTextareaProps>(
  ({ as, ...props }) => {
    const htmlProps = useImageCaptionTextarea({ as: as as any, ...props });

    return <TextareaAutosize {...htmlProps} />;
  }
);

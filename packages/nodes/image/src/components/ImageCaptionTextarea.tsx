import React, { ChangeEventHandler, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { TextareaAutosizeProps } from 'react-textarea-autosize/dist/declarations/src/index';
import {
  AsProps,
  createComponentAs,
  findNodePath,
  setNodes,
  TText,
  useEditorRef,
} from '@udecode/plate-core';
import { useReadOnly } from 'slate-react';
import { useImageElement } from '../hooks/useImageElement';
import { TImageElement } from '../types';

export interface ImageCaptionTextareaProps
  extends TextareaAutosizeProps,
    AsProps<'textarea'> {}

export const useImageCaptionTextarea = (
  props: ImageCaptionTextareaProps
): TextareaAutosizeProps => {
  const element = useImageElement();

  const { caption: nodeCaption = [{ children: [{ text: '' }] }] } = element;

  const editor = useEditorRef();
  const readOnly = useReadOnly();

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

  return {
    value: (nodeCaption[0] as TText).text,
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

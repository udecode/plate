import React, { ChangeEventHandler, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { TextareaAutosizeProps } from 'react-textarea-autosize/dist/declarations/src/index';
import {
  findNodePath,
  setNodes,
  TText,
  useEditorRef,
} from '@udecode/plate-core';
import { TImageElement } from '@udecode/plate-image';
import { useReadOnly } from 'slate-react';
import { createComponentAs } from '../utils/createComponentAs';
import { imageElementAtom, useImageAtomValue } from './imageAtoms';
import { ImageElementPropsCaption } from './ImageElement.types';

export interface ImageTextAreaProps extends TextareaAutosizeProps {
  caption: ImageElementPropsCaption;
  ignoreReadOnly?: boolean;
}

export const useImageTextArea = ({
  ignoreReadOnly,
  caption,
  ...props
}: ImageTextAreaProps): TextareaAutosizeProps => {
  const element = useImageAtomValue(imageElementAtom)!;
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
    readOnly: (!ignoreReadOnly && readOnly) || caption.readOnly,
    ...props,
  };
};

export const ImageTextArea = createComponentAs<ImageTextAreaProps>(
  ({ as, ...props }) => {
    const htmlProps = useImageTextArea({ as: as as any, ...props });

    return <TextareaAutosize {...htmlProps} />;
  }
);

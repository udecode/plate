import React, { useCallback, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { TextareaAutosizeProps } from 'react-textarea-autosize/dist/declarations/src/index';
import {
  AsProps,
  createComponentAs,
  findNodePath,
  focusEditor,
  getNodeString,
  getPointAfter,
  select,
  setNodes,
  TElement,
  useEditorRef,
} from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
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

  const [captionValue, setCaptionValue] = useState<
    TextareaAutosizeProps['value']
  >(getNodeString(nodeCaption[0]));

  const editor = useEditorRef();
  const readOnly = useReadOnly();

  const onChange: TextareaAutosizeProps['onChange'] = useCallback(
    (e) => {
      const newValue = e.target.value;

      // local state
      setCaptionValue(newValue);

      const path = findNodePath(editor, element);
      if (!path) return;

      // saved state
      setNodes<TImageElement>(
        editor,
        { caption: [{ text: newValue }] },
        { at: path }
      );
    },
    [editor, element]
  );

  const onKeyDown: TextareaAutosizeProps['onKeyDown'] = (e) => {
    if (isHotkey('up', e)) {
      const path = findNodePath(editor, element);
      if (!path) return;

      focusEditor(editor);
      select(editor, path);

      e.preventDefault();
      e.stopPropagation();
    }

    if (isHotkey('down', e)) {
      const path = findNodePath(editor, element);
      if (!path) return;

      const nextNodePath = getPointAfter(editor, path);
      if (!nextNodePath) return;

      focusEditor(editor);
      select(editor, nextNodePath);

      e.preventDefault();
    }
  };

  return {
    value: captionValue,
    readOnly,
    onChange,
    onKeyDown,
    ...props,
  };
};

export const ImageCaptionTextarea = createComponentAs<ImageCaptionTextareaProps>(
  ({ as, ...props }) => {
    const htmlProps = useImageCaptionTextarea({ as: as as any, ...props });

    return <TextareaAutosize {...htmlProps} />;
  }
);

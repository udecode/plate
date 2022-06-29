import React, {
  RefAttributes,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { TextareaAutosizeProps } from 'react-textarea-autosize/dist/declarations/src/index';
import {
  AsProps,
  createComponentAs,
  findNodePath,
  focusEditor,
  getNodeString,
  getPointAfter,
  setNodes,
  TElement,
  useComposedRef,
  useEditorRef,
} from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { Path } from 'slate';
import { useReadOnly } from 'slate-react';
import { useImageElement } from '../hooks/index';
import { TImageElement } from '../types';
import { imageGlobalStore } from './Image';

export interface ImageCaptionTextareaProps
  extends TextareaAutosizeProps,
    RefAttributes<HTMLTextAreaElement>,
    AsProps<'textarea'> {}

/**
 * Focus textareaRef when focusCaptionPath is set to the image path.
 */
export const useImageCaptionTextareaFocus = (
  textareaRef: RefObject<HTMLTextAreaElement>
) => {
  const editor = useEditorRef();
  const element = useImageElement();

  const focusCaptionPath = imageGlobalStore.use.focusEndCaptionPath();

  useEffect(() => {
    if (focusCaptionPath && textareaRef.current) {
      const path = findNodePath(editor, element);
      if (path && Path.equals(path, focusCaptionPath)) {
        textareaRef.current.focus();
        imageGlobalStore.set.focusEndCaptionPath(null);
      }
    }
  }, [editor, element, focusCaptionPath, textareaRef]);
};

export const useImageCaptionTextarea = (
  props: ImageCaptionTextareaProps
): TextareaAutosizeProps & RefAttributes<HTMLTextAreaElement> => {
  const element = useImageElement();

  const {
    caption: nodeCaption = [{ children: [{ text: '' }] }] as [TElement],
  } = element;

  const [captionValue, setCaptionValue] = useState<
    TextareaAutosizeProps['value']
  >(getNodeString(nodeCaption[0]));

  const editor = useEditorRef();
  const readOnly = useReadOnly();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ref = useComposedRef(textareaRef, props.ref);

  useImageCaptionTextareaFocus(textareaRef);

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
    // select image
    if (isHotkey('up', e)) {
      const path = findNodePath(editor, element);
      if (!path) return;

      e.preventDefault();

      focusEditor(editor, path);
    }

    // select next block
    if (isHotkey('down', e)) {
      const path = findNodePath(editor, element);
      if (!path) return;

      const nextNodePath = getPointAfter(editor, path);
      if (!nextNodePath) return;

      e.preventDefault();

      focusEditor(editor, nextNodePath);
    }
  };

  return {
    value: captionValue,
    readOnly,
    onChange,
    onKeyDown,
    ...props,
    ref,
  };
};

export const ImageCaptionTextarea = createComponentAs<ImageCaptionTextareaProps>(
  ({ as, ...props }) => {
    const htmlProps = useImageCaptionTextarea({ as: as as any, ...props });

    return <TextareaAutosize {...htmlProps} />;
  }
);

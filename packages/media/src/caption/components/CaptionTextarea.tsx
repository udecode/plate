import React, {
  RefAttributes,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { TextareaAutosizeProps } from 'react-textarea-autosize';
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
  useElement,
} from '@udecode/plate-common';
import isHotkey from 'is-hotkey';
import { Path } from 'slate';
import { useReadOnly } from 'slate-react';
import { captionGlobalStore } from '../captionGlobalStore';
import { TCaptionElement } from '../types/TCaptionElement';
import { TextareaAutosize } from './TextareaAutosize';

export interface CaptionTextareaProps
  extends TextareaAutosizeProps,
    RefAttributes<HTMLTextAreaElement>,
    AsProps<'textarea'> {}

/**
 * Focus textareaRef when focusCaptionPath is set to the image path.
 */
export const useCaptionTextareaFocus = (
  textareaRef: RefObject<HTMLTextAreaElement>
) => {
  const editor = useEditorRef();
  const element = useElement<TCaptionElement>();

  const focusCaptionPath = captionGlobalStore.use.focusEndCaptionPath();

  useEffect(() => {
    if (focusCaptionPath && textareaRef.current) {
      const path = findNodePath(editor, element);
      if (path && Path.equals(path, focusCaptionPath)) {
        textareaRef.current.focus();
        captionGlobalStore.set.focusEndCaptionPath(null);
      }
    }
  }, [editor, element, focusCaptionPath, textareaRef]);
};

export const useCaptionTextarea = (
  props: CaptionTextareaProps
): TextareaAutosizeProps & RefAttributes<HTMLTextAreaElement> => {
  const element = useElement<TCaptionElement>();

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

  useCaptionTextareaFocus(textareaRef);

  const onChange: TextareaAutosizeProps['onChange'] = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      // local state
      setCaptionValue(newValue);

      const path = findNodePath(editor, element);
      if (!path) return;

      // saved state
      setNodes<TCaptionElement>(
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

export const CaptionTextarea = createComponentAs<CaptionTextareaProps>(
  ({ as, ...props }) => {
    const htmlProps = useCaptionTextarea({ as: as as any, ...props });

    return <TextareaAutosize {...htmlProps} />;
  }
);

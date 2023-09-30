import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  createPrimitiveComponent,
  findNodePath,
  focusEditor,
  getNodeString,
  getPointAfter,
  isHotkey,
  setNodes,
  TElement,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';
import { TextareaAutosizeProps } from 'react-textarea-autosize';
import { Path } from 'slate';
import { useReadOnly } from 'slate-react';

import { captionGlobalStore } from '../captionGlobalStore';
import { TCaptionElement } from '../TCaptionElement';
import { TextareaAutosize } from './TextareaAutosize';

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

export const useCaptionTextareaState = () => {
  const element = useElement<TCaptionElement>();

  const {
    caption: nodeCaption = [{ children: [{ text: '' }] }] as [TElement],
  } = element;

  const [captionValue, setCaptionValue] = useState<
    TextareaAutosizeProps['value']
  >(getNodeString(nodeCaption[0]));

  const readOnly = useReadOnly();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useCaptionTextareaFocus(textareaRef);

  return {
    textareaRef,
    captionValue,
    setCaptionValue,
    element,
    readOnly,
  };
};

export const useCaptionTextarea = ({
  textareaRef,
  captionValue,
  setCaptionValue,
  element,
  readOnly,
}: ReturnType<typeof useCaptionTextareaState>) => {
  const editor = useEditorRef();

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
    [editor, element, setCaptionValue]
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
    ref: textareaRef,
    props: {
      value: captionValue,
      readOnly,
      onChange,
      onKeyDown,
    },
  };
};

export const CaptionTextarea = createPrimitiveComponent(TextareaAutosize)({
  stateHook: useCaptionTextareaState,
  propsHook: useCaptionTextarea,
});

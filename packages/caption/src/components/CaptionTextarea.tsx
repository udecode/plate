import React from 'react';

import type { TextareaAutosizeProps } from 'react-textarea-autosize';

import {
  createPrimitiveComponent,
  findNodePath,
  focusEditor,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';
import {
  type TElement,
  getNodeString,
  getPointAfter,
  isHotkey,
  setNodes,
} from '@udecode/plate-common/server';
import { Path } from 'slate';
import { useReadOnly } from 'slate-react';

import type { TCaptionElement } from '../TCaptionElement';

import { captionActions, captionGlobalStore } from '../captionGlobalStore';
import { TextareaAutosize } from './TextareaAutosize';

/** Focus textareaRef when focusCaptionPath is set to the image path. */
export const useCaptionTextareaFocus = (
  textareaRef: React.RefObject<HTMLTextAreaElement>
) => {
  const editor = useEditorRef();
  const element = useElement<TCaptionElement>();

  const focusCaptionPath = captionGlobalStore.use.focusEndCaptionPath();

  React.useEffect(() => {
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

  const [captionValue, setCaptionValue] = React.useState<
    TextareaAutosizeProps['value']
  >(getNodeString(nodeCaption[0]));

  const readOnly = useReadOnly();

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useCaptionTextareaFocus(textareaRef);

  return {
    captionValue,
    element,
    readOnly,
    setCaptionValue,
    textareaRef,
  };
};

export const useCaptionTextarea = ({
  captionValue,
  element,
  readOnly,
  setCaptionValue,
  textareaRef,
}: ReturnType<typeof useCaptionTextareaState>) => {
  const editor = useEditorRef();

  const onChange: TextareaAutosizeProps['onChange'] = React.useCallback(
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

  const onBlur: TextareaAutosizeProps['onBlur'] = (e) => {
    const currentValue = e.target.value;

    if (currentValue.length === 0) {
      captionActions.showCaptionId(null);
    }
  };

  return {
    props: {
      onBlur,
      onChange,
      onKeyDown,
      readOnly,
      value: captionValue,
    },
    ref: textareaRef,
  };
};

export const CaptionTextarea = createPrimitiveComponent(TextareaAutosize)({
  propsHook: useCaptionTextarea,
  stateHook: useCaptionTextareaState,
});

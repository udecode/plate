import React from 'react';

import type { TextareaAutosizeProps } from 'react-textarea-autosize';

import {
  type TElement,
  getNodeString,
  getPointAfter,
  isHotkey,
  setNodes,
} from '@udecode/plate-common';
import {
  createPrimitiveComponent,
  findNodePath,
  focusEditor,
  useEditorRef,
  useElement,
} from '@udecode/plate-common/react';
import { Path } from 'slate';
import { useReadOnly } from 'slate-react';

import type { TCaptionElement } from '../../lib';

import { CaptionPlugin } from '../CaptionPlugin';
import { TextareaAutosize } from './TextareaAutosize';

/** Focus textareaRef when focusCaptionPath is set to the image path. */
export const useCaptionTextareaFocus = (
  textareaRef: React.RefObject<HTMLTextAreaElement>
) => {
  const editor = useEditorRef();
  const element = useElement<TCaptionElement>();

  const focusCaptionPath = editor.useOption(
    CaptionPlugin,
    'focusEndCaptionPath'
  );

  React.useEffect(() => {
    if (focusCaptionPath && textareaRef.current) {
      const path = findNodePath(editor, element);

      if (path && Path.equals(path, focusCaptionPath)) {
        textareaRef.current.focus();
        editor.setOption(CaptionPlugin, 'focusEndCaptionPath', null);
      }
    }
  }, [editor, element, focusCaptionPath, textareaRef]);
};

export const useCaptionTextareaState = () => {
  const element = useElement<TCaptionElement>();
  const editor = useEditorRef();

  const {
    caption: nodeCaption = [{ children: [{ text: '' }] }] as [TElement],
  } = element;

  const captionValue: TextareaAutosizeProps['value'] = getNodeString(
    nodeCaption[0]
  );

  function setCaptionValue(newValue: TextareaAutosizeProps['value']) {
    const path = findNodePath(editor, element);

    if (!path) return;

    setNodes<TCaptionElement>(
      editor,
      { caption: [{ text: newValue }] },
      { at: path }
    );
  }

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

      setCaptionValue(newValue);
    },
    [setCaptionValue]
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
      editor.setOption(CaptionPlugin, 'showCaptionId', null);
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

import React, { useCallback, useState } from 'react';

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
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
) => {
  const editor = useEditorRef();
  const element = useElement<TCaptionElement>();

  const focusCaptionPath = editor.useOption(CaptionPlugin, 'focusEndPath');

  React.useEffect(() => {
    if (focusCaptionPath && textareaRef.current) {
      const path = findNodePath(editor, element);

      if (path && Path.equals(path, focusCaptionPath)) {
        textareaRef.current.focus();
        editor.setOption(CaptionPlugin, 'focusEndPath', null);
      }
    }
  }, [editor, element, focusCaptionPath, textareaRef]);
};

export const useCaptionTextareaState = () => {
  const element = useElement<TCaptionElement>();
  const editor = useEditorRef();

  const [isComposing, setIsComposing] = useState(false)

  const [captionValue, setCaptionValue] = useState<
    TextareaAutosizeProps['value']
  >(() => {
    const nodeCaption =
      element.caption ?? ([{ children: [{ text: '' }] }] as [TElement])
    return getNodeString(nodeCaption[0])
  })

  const updateEditorCaptionValue = useCallback(
    (newValue: string) => {
      const path = findNodePath(editor, element)
      if (!path) {
        return 
      }

      setNodes<TCaptionElement>(
        editor,
        { caption: [{ text: newValue }] },
        { at: path },
      )
    },
    [editor, element],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setCaptionValue(newValue) 

      if (!isComposing) {
        updateEditorCaptionValue(newValue)
      }
    },
    [isComposing, updateEditorCaptionValue],
  )

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true)
  }, [])

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      setIsComposing(false)
      const newValue = e.currentTarget.value
      setCaptionValue(newValue) 
      updateEditorCaptionValue(newValue) 
    },
    [updateEditorCaptionValue],
  )



  const readOnly = useReadOnly();

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useCaptionTextareaFocus(textareaRef);

  return {
    captionValue,
    element,
    readOnly,
    handleChange,
    handleCompositionStart,
    handleCompositionEnd,
    textareaRef,
  };
};

export const useCaptionTextarea = ({
  captionValue,
  element,
  readOnly,
  handleChange,
  handleCompositionStart,
  handleCompositionEnd,
  textareaRef,
}: ReturnType<typeof useCaptionTextareaState>) => {
  const editor = useEditorRef();

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
      editor.setOption(CaptionPlugin, 'visibleId', null);
    }
  };

  return {
    props: {
      readOnly,
      value: captionValue,
      onBlur,
      onKeyDown,
      onChange: handleChange,
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
    },
    ref: textareaRef,
  };
};

export const CaptionTextarea = createPrimitiveComponent(TextareaAutosize)({
  propsHook: useCaptionTextarea,
  stateHook: useCaptionTextareaState,
});

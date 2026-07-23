import React, { useCallback, useState } from 'react';

import type { TextareaAutosizeProps } from 'react-textarea-autosize';

import { isHotkey } from '@platejs/core';
import { NodeApi, PathApi } from '@platejs/plite';
import { useEditorReadOnly } from '@platejs/plite-react';
import type { TCaptionElement } from '@platejs/utils';
import { createPrimitiveComponent } from '@udecode/react-utils';
import { useEditor, useElement, usePluginOption } from '@platejs/core/react';

import { BaseCaptionPlugin } from '../../lib';
import { TextareaAutosize } from './TextareaAutosize';

const emptyCaption = { text: '' };

/** Focus textareaRef when focusCaptionPath is set to the image path. */
export const useCaptionTextareaFocus = (
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
) => {
  const editor = useEditor();
  const element = useElement<TCaptionElement>();

  const focusCaptionPath = usePluginOption(BaseCaptionPlugin, 'focusEndPath');

  React.useEffect(() => {
    if (!focusCaptionPath || !textareaRef.current) return;

    const path = editor.read.nodes.path(element);

    if (path && PathApi.equals(path, focusCaptionPath)) {
      textareaRef.current.focus();
      editor.plugin(BaseCaptionPlugin).setOption('focusEndPath', null);
    }
  }, [editor, element, focusCaptionPath, textareaRef]);
};

export const useCaptionTextareaState = () => {
  const element = useElement<TCaptionElement>();
  const editor = useEditor();

  const [isComposing, setIsComposing] = useState(false);

  const [captionValue, setCaptionValue] = useState<
    TextareaAutosizeProps['value']
  >(() => {
    const nodeCaption = element.caption ?? [emptyCaption];

    return NodeApi.string(nodeCaption[0] ?? emptyCaption);
  });

  const updateEditorCaptionValue = useCallback(
    (newValue: string) => {
      editor.update.nodes.set(
        { caption: [{ text: newValue }] },
        { at: element }
      );
    },
    [editor, element]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setCaptionValue(newValue);

      if (!isComposing) {
        updateEditorCaptionValue(newValue);
      }
    },
    [isComposing, updateEditorCaptionValue]
  );

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      setIsComposing(false);
      const newValue = e.currentTarget.value;
      setCaptionValue(newValue);
      updateEditorCaptionValue(newValue);
    },
    [updateEditorCaptionValue]
  );

  const readOnly = useEditorReadOnly();

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useCaptionTextareaFocus(textareaRef);

  return {
    captionValue,
    element,
    readOnly,
    textareaRef,
    handleChange,
    handleCompositionEnd,
    handleCompositionStart,
  };
};

export const useCaptionTextarea = ({
  captionValue,
  element,
  readOnly,
  textareaRef,
  handleChange,
  handleCompositionEnd,
  handleCompositionStart,
}: ReturnType<typeof useCaptionTextareaState>) => {
  const editor = useEditor();

  const onKeyDown: TextareaAutosizeProps['onKeyDown'] = (e) => {
    // select image
    if (isHotkey('up', e)) {
      const path = editor.read.nodes.path(element);

      if (!path) return;

      e.preventDefault();

      editor.update.selection.set(path);
      editor.api.dom.focus();
    }
    // select next block
    if (isHotkey('down', e)) {
      const nextPoint = editor.read.points.after(element);

      if (!nextPoint) return;

      e.preventDefault();

      editor.update.selection.set(nextPoint);
      editor.api.dom.focus();
    }
  };

  const onBlur: TextareaAutosizeProps['onBlur'] = (e) => {
    const currentValue = e.target.value;

    if (currentValue.length === 0) {
      editor.plugin(BaseCaptionPlugin).setOption('visibleId', null);
    }
  };

  return {
    props: {
      readOnly,
      value: captionValue,
      onBlur,
      onChange: handleChange,
      onCompositionEnd: handleCompositionEnd,
      onCompositionStart: handleCompositionStart,
      onKeyDown,
    },
    ref: textareaRef,
  };
};

export const CaptionTextarea = createPrimitiveComponent(TextareaAutosize)({
  propsHook: useCaptionTextarea,
  stateHook: useCaptionTextareaState,
});

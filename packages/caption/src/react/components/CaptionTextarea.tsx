import React, { useCallback, useState } from 'react';

import type { TextareaAutosizeProps } from 'react-textarea-autosize';

import { type TCaptionElement, isHotkey, NodeApi, PathApi } from 'platejs';
import {
  createPrimitiveComponent,
  useEditorRef,
  useElement,
  useNodePath,
  usePluginOption,
  useReadOnly,
} from 'platejs/react';

import { CaptionPlugin } from '../CaptionPlugin';
import { TextareaAutosize } from './TextareaAutosize';

/** Focus textareaRef when focusCaptionPath is set to the image path. */
export const useCaptionTextareaFocus = (
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
) => {
  const editor = useEditorRef();
  const element = useElement<TCaptionElement>();
  const path = useNodePath(element);

  const focusCaptionPath = usePluginOption(CaptionPlugin, 'focusEndPath');

  React.useEffect(() => {
    if (
      focusCaptionPath &&
      path &&
      textareaRef.current &&
      PathApi.equals(path, focusCaptionPath)
    ) {
      textareaRef.current.focus();
      editor.setOption(CaptionPlugin, 'focusEndPath', null);
    }
  }, [editor, focusCaptionPath, path, textareaRef]);
};

export const useCaptionTextareaState = () => {
  const element = useElement<TCaptionElement>();
  const editor = useEditorRef();
  const path = useNodePath(element);

  const [isComposing, setIsComposing] = useState(false);

  const [captionValue, setCaptionValue] = useState<
    TextareaAutosizeProps['value']
  >(() => {
    const nodeCaption =
      element.caption ??
      ([{ children: [{ text: '' }] }] as NonNullable<
        TCaptionElement['caption']
      >);

    return NodeApi.string(nodeCaption[0]);
  });

  const updateEditorCaptionValue = useCallback(
    (newValue: string) => {
      if (!path) return;

      editor.update((tx) => {
        tx.nodes.set<TCaptionElement>(
          { caption: [{ text: newValue }] },
          { at: path }
        );
      });
    },
    [editor, path]
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

  const readOnly = useReadOnly();

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useCaptionTextareaFocus(textareaRef);

  return {
    captionValue,
    element,
    path,
    readOnly,
    textareaRef,
    handleChange,
    handleCompositionEnd,
    handleCompositionStart,
  };
};

export const useCaptionTextarea = ({
  captionValue,
  path,
  readOnly,
  textareaRef,
  handleChange,
  handleCompositionEnd,
  handleCompositionStart,
}: ReturnType<typeof useCaptionTextareaState>) => {
  const editor = useEditorRef();

  const onKeyDown: TextareaAutosizeProps['onKeyDown'] = (e) => {
    // select image
    if (isHotkey('up', e)) {
      if (!path) return;

      e.preventDefault();

      editor.update((tx) => {
        tx.selection.set(path);
      });
      editor.api.dom.focus();
    }
    // select next block
    if (isHotkey('down', e)) {
      if (!path) return;

      const nextNodePath = editor.api.after(path);

      if (!nextNodePath) return;

      e.preventDefault();

      editor.update((tx) => {
        tx.selection.set(nextNodePath);
      });
      editor.api.dom.focus();
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

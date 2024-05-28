import { useEffect } from 'react';

import type { Value } from '@udecode/plate-common';

import type { PlateEditor } from '../../types';

import { BLUR_EDITOR_EVENT, FOCUS_EDITOR_EVENT } from './constants';

export const useFocusEditorEvents = ({
  editorRef,
  onEditorBlur,
  onEditorFocus,
}: {
  editorRef: PlateEditor<Value> | null;
  onEditorBlur?: () => void;
  onEditorFocus?: () => void;
}) => {
  useEffect(() => {
    const onFocusEditor = (event: Event) => {
      const id = (event as any).detail.id;

      if (!!onEditorFocus && editorRef && editorRef.id === id) {
        onEditorFocus();
      }
    };
    const onBlurEditor = (event: Event) => {
      const id = (event as any).detail.id;

      if (!!onEditorBlur && editorRef && editorRef.id === id) {
        onEditorBlur();
      }
    };

    document.addEventListener(FOCUS_EDITOR_EVENT, onFocusEditor);
    document.addEventListener(BLUR_EDITOR_EVENT, onBlurEditor);

    return () => {
      document.removeEventListener(FOCUS_EDITOR_EVENT, onFocusEditor);
      document.removeEventListener(BLUR_EDITOR_EVENT, onBlurEditor);
    };
  }, [editorRef, onEditorBlur, onEditorFocus]);
};

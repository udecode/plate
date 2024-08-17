import { useEffect } from 'react';

import type { PlateEditor } from '../../plugin/PlateEditor';

import {
  BLUR_EDITOR_EVENT,
  FOCUS_EDITOR_EVENT,
} from '../../../lib/plugins/event-editor/constants';

export const useFocusEditorEvents = ({
  editorRef,
  onEditorBlur,
  onEditorFocus,
}: {
  editorRef: PlateEditor | null;
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

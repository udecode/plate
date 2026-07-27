import { useEffect } from 'react';

import type { PlateEditor } from '../../editor/PlateEditor';
import { useEditorId } from '../../stores/plate/createPlateStore';
import {
  BLUR_EDITOR_EVENT,
  FOCUS_EDITOR_EVENT,
  useEventEditorValue,
} from './EventEditorStore';

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
      const id = (event as CustomEvent<{ id: string }>).detail.id;

      if (onEditorFocus && editorRef?.id === id) onEditorFocus();
    };
    const onBlurEditor = (event: Event) => {
      const id = (event as CustomEvent<{ id: string }>).detail.id;

      if (onEditorBlur && editorRef?.id === id) onEditorBlur();
    };

    document.addEventListener(FOCUS_EDITOR_EVENT, onFocusEditor);
    document.addEventListener(BLUR_EDITOR_EVENT, onBlurEditor);

    return () => {
      document.removeEventListener(FOCUS_EDITOR_EVENT, onFocusEditor);
      document.removeEventListener(BLUR_EDITOR_EVENT, onBlurEditor);
    };
  }, [editorRef, onEditorBlur, onEditorFocus]);
};

/** Whether the current editor is the last focused editor. */
export const useFocusedLast = (id?: string) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const editorId = id ?? useEditorId();
  const lastFocusedEditorId = useEventEditorValue('last');

  return editorId === lastFocusedEditorId;
};

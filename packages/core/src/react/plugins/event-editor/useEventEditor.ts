import { useEffect } from 'react';

import type { PlateEditor } from '../../editor/PlateEditor';
import {
  PLATE_SCOPE,
  useEditor,
  usePlateLocalValue,
} from '../../stores/plate/createPlateStore';
import {
  BLUR_EDITOR_EVENT,
  EventEditorStore,
  FOCUS_EDITOR_EVENT,
} from './EventEditorStore';

export const { useValue: useEventEditorValue } = EventEditorStore;

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
  const fallbackEditorId = usePlateLocalValue('editor', {
    warnIfNoStore: false,
  })?.id;
  const editorId = id ?? fallbackEditorId;
  const lastFocusedEditorId = useEventEditorValue('last');

  return editorId === lastFocusedEditorId;
};

/** Get last event editor id: focus, blur or last. */
export const useEventPlateId = (id?: string) => {
  const focus = useEventEditorValue('focus');
  const blur = useEventEditorValue('blur');
  const last = useEventEditorValue('last');
  const providerId = useEditor().id;

  if (id) return id;
  if (focus) return focus;
  if (blur) return blur;

  return last ?? providerId ?? PLATE_SCOPE;
};

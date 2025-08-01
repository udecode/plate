import { useEditorId } from '../../stores';
import { useEventEditorValue } from './EventEditorStore';

/** Whether the current editor is the last focused editor. */
export const useFocusedLast = (id?: string) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const editorId = id ?? useEditorId();
  const lastFocusedEditorId = useEventEditorValue('last');

  return editorId === lastFocusedEditorId;
};

import { EditorEvent } from '../../../types/EventEditorStore';
import { useEventEditorStore } from '../event-editor.store';

/**
 * Get the editor id by `event` key.
 */
export const useEventEditorId = (event: EditorEvent) =>
  useEventEditorStore((state) => {
    return state[event];
  });

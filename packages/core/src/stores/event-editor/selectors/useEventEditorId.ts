import { EditorEvent } from '../../../types/EventEditorStore';
import { useEventEditorStore } from '../event-editor.store';

/**
 * Get the editor id where the last event happened.
 */
export const useEventEditorId = (event: EditorEvent) =>
  useEventEditorStore((state) => state[event]);

import { EditorEvent } from '../../../types/EventEditorStore';
import { useEventEditorStore } from '../event-editor.store';
import { getEventEditorState } from './getEventEditorState';

export const getPlateEventId = (event: EditorEvent) =>
  getEventEditorState()[event];

/**
 * Get plate id by `event` key.
 */
export const usePlateEventId = (event: EditorEvent) =>
  useEventEditorStore(() => getPlateEventId(event));

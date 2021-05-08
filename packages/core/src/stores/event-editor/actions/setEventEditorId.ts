import { EventEditorActions } from '../../../types/EventEditorStore';
import { eventEditorStore } from '../event-editor.store';

const { setState: set } = eventEditorStore;

/**
 * Set an editor id by event key.
 */
export const setEventEditorId: EventEditorActions['setEventEditorId'] = (
  event,
  value
) =>
  set(() => ({
    [event]: value,
  }));

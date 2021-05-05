import { EventEditorActions } from '../../types/EventEditorStore';
import { eventEditorStore } from './event-editor.store';

const { setState: set } = eventEditorStore;

export const setEventEditorId: EventEditorActions['setEventEditorId'] = (
  event,
  value
) =>
  set(() => ({
    [event]: value,
  }));

// (eventEditorStore[event] = value);

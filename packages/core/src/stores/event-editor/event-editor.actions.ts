import { EventEditorActions } from '../../types/EventEditorStore';
import { eventEditorStore } from './event-editor.store';

const { setState: set } = eventEditorStore;

export const eventEditorActions: EventEditorActions = {
  setEventEditorId: (event, value) =>
    set((state) => {
      state[event] = value;
      return state;
    }),
};

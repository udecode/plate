import { eventEditorActions } from '../stores/event-editor/event-editor.store';
import { createPluginFactory } from '../utils/createPluginFactory';

export const KEY_EVENT_EDITOR = 'event-editor';

export const createEventEditorPlugin = createPluginFactory({
  key: KEY_EVENT_EDITOR,
  handlers: {
    onFocus: (editor) => () => {
      eventEditorActions.focus?.(editor.id);
    },
    onBlur: (editor) => () => {
      eventEditorActions.blur?.(editor.id);
    },
  },
});

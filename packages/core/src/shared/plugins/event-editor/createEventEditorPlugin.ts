import { createPluginFactory } from '../../utils/createPluginFactory';
import { eventEditorActions, eventEditorSelectors } from './eventEditorStore';

export const KEY_EVENT_EDITOR = 'event-editor';

export const createEventEditorPlugin = createPluginFactory({
  handlers: {
    onBlur: (editor) => () => {
      const focus = eventEditorSelectors.focus();

      if (focus === editor.id) {
        eventEditorActions.focus(null);
      }

      eventEditorActions.blur(editor.id);
    },
    onFocus: (editor) => () => {
      eventEditorActions.focus(editor.id);
    },
  },
  key: KEY_EVENT_EDITOR,
});

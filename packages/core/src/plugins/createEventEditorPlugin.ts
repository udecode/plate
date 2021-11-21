import { setEventEditorId } from '../stores/event-editor/actions/setEventEditorId';
import { createPluginFactory } from '../utils/createPluginFactory';

export const KEY_EVENT_EDITOR = 'event-editor';

export const createEventEditorPlugin = createPluginFactory({
  key: KEY_EVENT_EDITOR,
  handlers: {
    onFocus: (editor) => () => {
      setEventEditorId('focus', editor.id);
    },
    onBlur: (editor) => () => {
      setEventEditorId('blur', editor.id);
    },
  },
});

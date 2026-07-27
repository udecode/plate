import { createPlatePlugin } from '../../plugin';
import {
  BLUR_EDITOR_EVENT,
  EventEditorStore,
  FOCUS_EDITOR_EVENT,
} from './EventEditorStore';

export const EventEditorPlugin = createPlatePlugin({
  key: 'eventEditor',
  handlers: {
    onBlur: ({ editor }) => {
      const focus = EventEditorStore.get('focus');

      if (focus === editor.id) {
        EventEditorStore.set('focus', null);
      }

      EventEditorStore.set('blur', editor.id);

      document.dispatchEvent(
        new CustomEvent(BLUR_EDITOR_EVENT, {
          detail: { id: editor.id },
        })
      );
    },
    onFocus: ({ editor }) => {
      EventEditorStore.set('focus', editor.id);
      EventEditorStore.set('last', editor.id);

      document.dispatchEvent(
        new CustomEvent(FOCUS_EDITOR_EVENT, {
          detail: { id: editor.id },
        })
      );
    },
  },
});

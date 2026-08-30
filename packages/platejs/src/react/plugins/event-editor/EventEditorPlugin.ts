import { definePlatePlugin } from '../../plugin';
import {
  BLUR_EDITOR_EVENT,
  EventEditorStore,
  FOCUS_EDITOR_EVENT,
} from './EventEditorStore';

export const EventEditorPlugin = definePlatePlugin('eventEditor', {
  on: {
    blur: ({ editor }) => {
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
    focus: ({ editor }) => {
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

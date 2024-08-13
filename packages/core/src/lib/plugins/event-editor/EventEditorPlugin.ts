import { createPlugin } from '../../plugin';
import { BLUR_EDITOR_EVENT, FOCUS_EDITOR_EVENT } from './constants';
import { eventEditorActions, eventEditorSelectors } from './eventEditorStore';

export const EventEditorPlugin = createPlugin({
  handlers: {
    onBlur: ({ editor }) => {
      const focus = eventEditorSelectors.focus();

      if (focus === editor.id) {
        eventEditorActions.focus(null);
      }

      eventEditorActions.blur(editor.id);

      document.dispatchEvent(
        new CustomEvent(BLUR_EDITOR_EVENT, {
          detail: { id: editor.id },
        })
      );
    },
    onFocus: ({ editor }) => {
      eventEditorActions.focus(editor.id);

      document.dispatchEvent(
        new CustomEvent(FOCUS_EDITOR_EVENT, {
          detail: { id: editor.id },
        })
      );
    },
  },
  key: 'eventEditor',
});

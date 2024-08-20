import { SlateNextPlugin } from '../../lib';
import { toPlatePlugin } from '../plugin';

export const SlateReactNextPlugin = toPlatePlugin(SlateNextPlugin, {
  handlers: {
    onKeyDown: ({ editor, event }: any) => {
      // React 16.x needs this event to be persistented due to it's event pooling implementation.
      // https://reactjs.org/docs/legacy-event-pooling.html
      event.persist();
      editor.currentKeyboardEvent = event;
    },
  },
});

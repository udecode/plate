import { isDefined } from '@udecode/utils';

import { SlateExtensionPlugin } from '../../lib';
import { toPlatePlugin } from '../plugin';

export const SlateReactExtensionPlugin = toPlatePlugin(SlateExtensionPlugin, {
  handlers: {
    onKeyDown: ({ editor, event }: any) => {
      // React 16.x needs this event to be persistented due to it's event pooling implementation.
      // https://reactjs.org/docs/legacy-event-pooling.html
      event.persist();
      editor.currentKeyboardEvent = event;
    },
  },
})
  .extendEditorApi(({ editor }) => ({
    redecorate: () => {
      editor.api.debug.warn(
        `The method editor.api.redecorate() has not been overridden. ` +
          `This may cause unexpected behavior. Please ensure that all required editor methods are properly defined.`,
        'OVERRIDE_MISSING'
      );
    },
  }))
  .overrideEditor(({ editor, tf: { normalizeNode } }) => ({
    transforms: {
      normalizeNode(entry, options) {
        if (isDefined(entry[0]._memo)) {
          editor.tf.unsetNodes('_memo', { at: entry[1] });

          return;
        }

        normalizeNode(entry, options);
      },
    },
  }));

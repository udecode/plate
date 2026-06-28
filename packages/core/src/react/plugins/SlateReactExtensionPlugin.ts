import { isDefined } from '@udecode/utils';

import { Hotkeys, SlateExtensionPlugin } from '../../lib';
import { toPlatePlugin } from '../plugin';

export const SlateReactExtensionPlugin = toPlatePlugin(SlateExtensionPlugin, {
  handlers: {
    onKeyDown: ({ editor, event }: any) => {
      // React 16.x needs this event to be persistented due to it's event pooling implementation.
      // https://reactjs.org/docs/legacy-event-pooling.html
      event.persist();
      editor.dom.currentKeyboardEvent = event;

      if (Hotkeys.isMoveUpward(event)) {
        if (editor.tf.moveLine({ reverse: true })) {
          event.preventDefault();
          event.stopPropagation();
        }
      } else if (Hotkeys.isMoveDownward(event)) {
        if (editor.tf.moveLine({ reverse: false })) {
          event.preventDefault();
          event.stopPropagation();
        }
      } else if (
        Hotkeys.isTab(editor, event) ||
        Hotkeys.isUntab(editor, event)
      ) {
        if (editor.tf.tab({ reverse: Hotkeys.isUntab(editor, event) })) {
          event.preventDefault();
          event.stopPropagation();
        }
      } else if (Hotkeys.isSelectAll(event)) {
        if (editor.tf.selectAll()) {
          event.preventDefault();
          event.stopPropagation();
        }
      } else if (Hotkeys.isEscape(event) && editor.tf.escape()) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
  },
})
  .extendEditorApi(({ editor }) => ({
    redecorate: () => {
      editor.api.debug.warn(
        'The method editor.api.redecorate() has not been overridden. ' +
          'This may cause unexpected behavior. Please ensure that all required editor methods are properly defined.',
        'OVERRIDE_MISSING'
      );
    },
  }))
  .extendEditorTransforms(({ editor, tf: { reset } }) => ({
    reset(options) {
      const isFocused = editor.api.isFocused();

      reset(options);

      if (isFocused) {
        editor.tf.focus({ edge: 'startEditor' });
      }
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

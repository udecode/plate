import type { KeyboardEvent } from 'react';

import { getCurrentRuntimeTransforms } from '../../internal/currentRuntimeBridge';
import { Hotkeys, PliteExtensionPlugin } from '../../lib';
import { toPlatePlugin } from '../plugin';

type PliteReactKeyDownEditor = {
  dom: {
    currentKeyboardEvent: unknown | null;
  };
};

type PliteReactKeyDownContext = {
  editor: PliteReactKeyDownEditor;
  event: KeyboardEvent;
};

export const onPliteReactKeyDown = ({
  editor,
  event,
}: PliteReactKeyDownContext) => {
  // React 16.x needs this event to be persistented due to it's event pooling implementation.
  // https://reactjs.org/docs/legacy-event-pooling.html
  event.persist();
  editor.dom.currentKeyboardEvent = event;
  const tf = getCurrentRuntimeTransforms(editor);

  if (Hotkeys.isMoveUpward(event)) {
    if (tf.moveLine({ reverse: true })) {
      event.preventDefault();
      event.stopPropagation();
    }
  } else if (Hotkeys.isMoveDownward(event)) {
    if (tf.moveLine({ reverse: false })) {
      event.preventDefault();
      event.stopPropagation();
    }
  } else if (
    Hotkeys.isTab(editor as never, event) ||
    Hotkeys.isUntab(editor as never, event)
  ) {
    if (
      tf.tab({
        reverse: Hotkeys.isUntab(editor as never, event),
      })
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  } else if (Hotkeys.isSelectAll(event)) {
    if (tf.selectAll()) {
      event.preventDefault();
      event.stopPropagation();
    }
  } else if (Hotkeys.isEscape(event) && tf.escape()) {
    event.preventDefault();
    event.stopPropagation();
  }
};

const BasePliteReactExtensionPlugin = toPlatePlugin(PliteExtensionPlugin, {
  handlers: {
    onKeyDown: onPliteReactKeyDown as never,
  },
}).extendEditorApi(({ editor }) => ({
  redecorate: () => {
    editor.api.debug.warn(
      'The method editor.api.redecorate() has not been overridden. ' +
        'This may cause unexpected behavior. Please ensure that all required editor methods are properly defined.',
      'OVERRIDE_MISSING'
    );
  },
}));

export const PliteReactExtensionPlugin = Object.assign(
  BasePliteReactExtensionPlugin,
  {
    runtimeSlateReactOverride: true,
  }
);

import {
  type KeyboardHandlerReturnType,
  type PlateEditor,
  type Value,
  type WithPlatePlugin,
  isCollapsed,
  isHotkey,
  setElements,
  someNode,
} from '@udecode/plate-common/server';

import type { ResetNodePlugin } from './types';

export const SIMULATE_BACKSPACE: any = {
  key: '',
  which: 8,
};

export const onKeyDownResetNode =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    { options: { rules } }: WithPlatePlugin<ResetNodePlugin, V, E>
  ): KeyboardHandlerReturnType =>
  (event) => {
    if (event.defaultPrevented) return;

    let reset;

    if (!editor.selection) return;
    if (isCollapsed(editor.selection)) {
      rules!.forEach(({ defaultType, hotkey, onReset, predicate, types }) => {
        if (
          hotkey &&
          isHotkey(hotkey, event as any) &&
          predicate(editor as any) &&
          someNode(editor, { match: { type: types } })
        ) {
          event.preventDefault?.();

          setElements(editor, { type: defaultType });

          if (onReset) {
            onReset(editor as any);
          }

          reset = true;
        }
      });
    }

    return reset;
  };

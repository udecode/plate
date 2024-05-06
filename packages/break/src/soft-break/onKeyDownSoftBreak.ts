import {
  type KeyboardHandlerReturnType,
  type PlateEditor,
  type Value,
  type WithPlatePlugin,
  getBlockAbove,
  isHotkey,
  queryNode,
} from '@udecode/plate-common/server';

import type { SoftBreakPlugin } from './types';

export const onKeyDownSoftBreak =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    { options: { rules = [] } }: WithPlatePlugin<SoftBreakPlugin, V, E>
  ): KeyboardHandlerReturnType =>
  (event) => {
    if (event.defaultPrevented) return;

    const entry = getBlockAbove(editor);

    if (!entry) return;

    rules.forEach(({ hotkey, query }) => {
      if (isHotkey(hotkey, event as any) && queryNode(entry, query)) {
        event.preventDefault();
        event.stopPropagation();

        editor.insertText('\n');
      }
    });
  };

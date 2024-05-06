import {
  type KeyboardHandlerReturnType,
  type PlateEditor,
  type Value,
  type WithPlatePlugin,
  getBlockAbove,
  isHotkey,
  queryNode,
} from '@udecode/plate-common/server';

import type { ExitBreakPlugin } from './types';

import { exitBreak } from './transforms/exitBreak';

export const onKeyDownExitBreak =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    { options: { rules = [] } }: WithPlatePlugin<ExitBreakPlugin, V, E>
  ): KeyboardHandlerReturnType =>
  (event) => {
    if (event.defaultPrevented) return;

    const entry = getBlockAbove(editor);

    if (!entry) return;

    rules.forEach(({ hotkey, ...rule }) => {
      if (
        isHotkey(hotkey, event as any) &&
        queryNode(entry, rule.query) &&
        exitBreak(editor as any, rule)
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  };

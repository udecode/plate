import {
  getBlockAbove,
  KeyboardHandlerReturnType,
  PlateEditor,
  queryNode,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import isHotkey from 'is-hotkey';
import { exitBreak } from './transforms/exitBreak';
import { ExitBreakPlugin } from './types';

export const onKeyDownExitBreak = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { options: { rules = [] } }: WithPlatePlugin<ExitBreakPlugin, V, E>
): KeyboardHandlerReturnType => (event) => {
  const entry = getBlockAbove(editor);
  if (!entry) return;

  rules.forEach(({ hotkey, ...rule }) => {
    if (isHotkey(hotkey, event as any) && queryNode(entry, rule.query)) {
      if (exitBreak(editor as any, rule)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  });
};

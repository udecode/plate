import {
  getAboveNode,
  HotkeyPlugin,
  KeyboardHandlerReturnType,
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { moveListItems, toggleList } from './transforms';

export const onKeyDownList = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { type, options: { hotkey } }: WithPlatePlugin<HotkeyPlugin, V, E>
): KeyboardHandlerReturnType => (e) => {
  if (e.key === 'Tab' && editor.selection) {
    const listSelected = getAboveNode(editor, {
      at: editor.selection,
      match: { type },
    });

    if (listSelected) {
      e.preventDefault();
      moveListItems(editor, { increase: !e.shiftKey });
      return;
    }
  }

  if (!hotkey) return;

  const hotkeys = castArray(hotkey);

  for (const _hotkey of hotkeys) {
    if (isHotkey(_hotkey)(e as any)) {
      toggleList(editor, { type: type! });
    }
  }
};

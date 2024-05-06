import {
  type KeyboardHandlerReturnType,
  type PlateEditor,
  type TElement,
  type Value,
  type WithPlatePlugin,
  getBlockAbove,
  isBlockAboveEmpty,
  isHotkey,
} from '@udecode/plate-common/server';

import {
  type IndentListPlugin,
  KEY_LIST_STYLE_TYPE,
} from './createIndentListPlugin';
import { outdentList } from './transforms/index';

export const onKeyDownIndentList =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    _plugin: WithPlatePlugin<IndentListPlugin, V, E>
  ): KeyboardHandlerReturnType =>
  (e) => {
    if (e.defaultPrevented) return;
    if (!editor.selection) return;

    const entry = getBlockAbove(editor);

    if (!entry) return;

    const node = entry[0] as TElement;

    const listStyleType = node[KEY_LIST_STYLE_TYPE] as string | undefined;

    if (!listStyleType) return;
    if (isHotkey('Enter', e) && isBlockAboveEmpty(editor) && node.indent) {
      outdentList(editor);
      e.stopPropagation();
      e.preventDefault();
    }
  };

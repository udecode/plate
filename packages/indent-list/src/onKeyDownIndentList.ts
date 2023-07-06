import {
  KeyboardHandlerReturnType,
  PlateEditor,
  TElement,
  Value,
  WithPlatePlugin,
  getBlockAbove,
  isBlockAboveEmpty,
} from '@udecode/plate-common';
import isHotkey from 'is-hotkey';

import {
  IndentListPlugin,
  KEY_LIST_STYLE_TYPE,
} from './createIndentListPlugin';
import { outdentList } from './transforms/index';

export const onKeyDownIndentList =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    // eslint-disable-next-line unused-imports/no-unused-vars
    plugin: WithPlatePlugin<IndentListPlugin, V, E>
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

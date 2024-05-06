import type {
  KeyboardHandlerReturnType,
  PlateEditor,
  Value,
} from '@udecode/plate-common/server';

import { Hotkeys } from '@udecode/plate-common';

import { indent, outdent } from './transforms/index';

export const onKeyDownIndent =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E
  ): KeyboardHandlerReturnType =>
  (e) => {
    if (e.defaultPrevented) return;
    if (Hotkeys.isTab(editor, e)) {
      e.preventDefault();
      indent(editor);
    }
    if (Hotkeys.isUntab(editor, e)) {
      e.preventDefault();
      outdent(editor);
    }
  };

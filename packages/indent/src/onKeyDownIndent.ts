import type {
  KeyboardHandlerReturnType,
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common/server';

import { Hotkeys } from '@udecode/plate-common';

import type { IndentPlugin } from './types';

import { indent, outdent } from './transforms/index';

export const onKeyDownIndent =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    { options }: WithPlatePlugin<IndentPlugin, V, E>
  ): KeyboardHandlerReturnType =>
  (e) => {
    if (e.defaultPrevented || options.disableTab?.(editor)) return;
    if (Hotkeys.isTab(editor, e)) {
      e.preventDefault();
      indent(editor);
    }
    if (Hotkeys.isUntab(editor, e)) {
      e.preventDefault();
      outdent(editor);
    }
  };

import {
  getPluginOptions,
  Hotkeys,
  KeyboardHandlerReturnType,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import { KEY_INDENT } from './createIndentPlugin';
import { indent, outdent } from './transforms/index';
import { IndentPlugin } from './types';

export const onKeyDownIndent =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E
  ): KeyboardHandlerReturnType =>
  (e) => {
    if (e.defaultPrevented) return;

    const { afterKeydownIndent, afterKeydownOutdent } =
      getPluginOptions<IndentPlugin>(editor as PlateEditor, KEY_INDENT);

    if (Hotkeys.isTab(editor, e)) {
      e.preventDefault();
      indent(editor);
      afterKeydownIndent && afterKeydownIndent(editor);
    }

    if (Hotkeys.isUntab(editor, e)) {
      e.preventDefault();
      outdent(editor);
      afterKeydownOutdent && afterKeydownOutdent(editor);
    }
  };

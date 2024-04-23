import {
  getParentNode,
  isHotkey,
  KeyboardHandlerReturnType,
  PlateEditor,
  select,
  Value,
} from '@udecode/plate-common';

export const onKeyDownColumn =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E
  ): KeyboardHandlerReturnType =>
  (e) => {
    if (e.defaultPrevented) return;

    const at = editor.selection;

    if (isHotkey('mod+a', e) && at) {
      const selectionParent = getParentNode(editor, at);
      if (!selectionParent) return;
      const [, parentPath] = selectionParent;
      parentPath.pop();

      select(editor, parentPath);

      e.preventDefault();
      e.stopPropagation();
    }
  };

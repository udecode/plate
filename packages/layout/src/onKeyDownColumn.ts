import {
  type KeyboardHandlerReturnType,
  type PlateEditor,
  type Value,
  getParentNode,
  isHotkey,
  select,
} from '@udecode/plate-common/server';

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

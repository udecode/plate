import {
  ELEMENT_DEFAULT,
  getPluginType,
  insertNodes,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { Editor, Path } from 'slate';
import { exitBreakAtEdges } from '../queries/exitBreakAtEdges';
import { ExitBreakRule } from '../types';

export const exitBreak = <V extends Value>(
  editor: PlateEditor<V>,
  {
    level = 0,
    defaultType = getPluginType(editor, ELEMENT_DEFAULT),
    query = {},
    before,
  }: Omit<ExitBreakRule, 'hotkey'>
) => {
  if (!editor.selection) return;

  const { queryEdge, isEdge, isStart } = exitBreakAtEdges(editor, query);
  if (isStart) before = true;

  if (queryEdge && !isEdge) return;

  const selectionPath = Editor.path(editor, editor.selection);

  let insertPath;
  if (before) {
    insertPath = selectionPath.slice(0, level + 1);
  } else {
    insertPath = Path.next(selectionPath.slice(0, level + 1));
  }

  insertNodes(
    editor,
    { type: defaultType, children: [{ text: '' }] },
    {
      at: insertPath,
      select: !isStart,
    }
  );

  return true;
};

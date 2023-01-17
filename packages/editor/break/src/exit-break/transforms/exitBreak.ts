import {
  ELEMENT_DEFAULT,
  getPath,
  getPluginType,
  insertElements,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { exitBreakAtEdges } from '../queries/exitBreakAtEdges';
import { ExitBreakRule } from '../types';

export const exitBreak = <V extends Value>(
  editor: PlateEditor<V>,
  {
    level = 1,
    defaultType = getPluginType(editor, ELEMENT_DEFAULT),
    query = {},
    before,
  }: Omit<ExitBreakRule, 'hotkey'>
) => {
  if (!editor.selection) return;

  const { queryEdge, isEdge, isStart } = exitBreakAtEdges(editor, query);
  if (isStart) before = true;

  if (queryEdge && !isEdge) return;

  const selectionPath = getPath(editor, editor.selection);
  const slicedPath = selectionPath.slice(0, -level);

  let insertPath;
  if (before) {
    insertPath = slicedPath;
  } else {
    insertPath = Path.next(slicedPath);
  }

  insertElements(
    editor,
    { type: defaultType, children: [{ text: '' }] },
    {
      at: insertPath,
      select: !isStart,
    }
  );

  return true;
};

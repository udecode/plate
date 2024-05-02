import {
  ELEMENT_DEFAULT,
  getPath,
  getPluginType,
  insertElements,
  PlateEditor,
  Value,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import { exitBreakAtEdges } from '../queries/exitBreakAtEdges';
import { ExitBreakRule } from '../types';

export const exitBreak = <V extends Value>(
  editor: PlateEditor<V>,
  {
    level = 0,
    relative = false,
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

  const slicedPath = relative
    ? selectionPath.slice(0, -level)
    : selectionPath.slice(0, level + 1);

  const insertPath = before ? slicedPath : Path.next(slicedPath);

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

import {
  type SlateEditor,
  BaseParagraphPlugin,
  PathApi,
  insertElements,
} from '@udecode/plate-common';

import type { ExitBreakRule } from '../types';

import { exitBreakAtEdges } from '../queries/exitBreakAtEdges';

export const exitBreak = (
  editor: SlateEditor,
  {
    before,
    defaultType = editor.getType(BaseParagraphPlugin),
    level = 0,
    query = {},
    relative = false,
  }: Omit<ExitBreakRule, 'hotkey'>
) => {
  if (!editor.selection) return;

  const { isEdge, isStart, queryEdge } = exitBreakAtEdges(editor, query);

  if (isStart) before = true;
  if (queryEdge && !isEdge) return;

  const selectionPath = editor.api.path(editor.selection)!;

  const slicedPath = relative
    ? selectionPath.slice(0, -level)
    : selectionPath.slice(0, level + 1);

  const insertPath = before ? slicedPath : PathApi.next(slicedPath);

  insertElements(
    editor,
    editor.api.create.block({ children: [{ text: '' }], type: defaultType }),
    {
      at: insertPath,
      select: !isStart,
    }
  );

  return true;
};

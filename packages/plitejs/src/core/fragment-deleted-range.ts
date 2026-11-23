import type { AnyEditor } from '../interfaces/editor';
import { PathApi } from '../interfaces/path';
import type { Range } from '../interfaces/range';
import { RangeApi } from '../interfaces/range';
import { type NodeSelection, SelectionApi } from '../interfaces/selection';
import { getDefined } from '../internal/get-defined';
import { resolveDeletedRange } from '../transforms-text';
import { readWholeBlockDelete } from './editor-commands';

export const resolveFragmentDeletedRange = (
  editor: AnyEditor,
  range: Range
): NodeSelection | Range | null => {
  const wholeBlocks = editor.read((state) =>
    readWholeBlockDelete(state, range, undefined)
  );

  if (!wholeBlocks || wholeBlocks.endsInFirst) {
    return resolveDeletedRange(editor, range);
  }

  const [[first, firstPath], ...rest] = wholeBlocks.blocks;
  const [last] = getDefined(wholeBlocks.blocks.at(-1));

  if (!wholeBlocks.keepsFirst) {
    return firstPath.length === 1
      ? SelectionApi.nodes([firstPath, ...rest.map(([, path]) => path)], {
          mode: 'block',
        })
      : null;
  }
  if (!wholeBlocks.takesCaret) return null;

  const anchor = RangeApi.start(range);
  const focus = getDefined(
    editor.read((state) =>
      state.points.end(state.key(wholeBlocks.blocks.length > 1 ? last : first))
    )
  );

  const removed = { anchor, focus };

  if (wholeBlocks.blocks.length > 1 || RangeApi.isCollapsed(removed)) {
    return removed;
  }

  const acrossTextBlocks = editor.read((state) => {
    const start = state.nodes.block({ at: anchor, mode: 'lowest' });
    const end = state.nodes.block({ at: focus, mode: 'lowest' });

    return !!start && !!end && !PathApi.equals(start[1], end[1]);
  });

  return firstPath.length === 1 && acrossTextBlocks
    ? null
    : resolveDeletedRange(editor, removed);
};

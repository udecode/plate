import type { Editor } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import type { Range } from '../interfaces/range';
import { RangeApi } from '../interfaces/range';
import { getDefined } from '../internal/get-defined';
import { resolveDeletedRange } from '../transforms-text';
import { readWholeBlockDelete } from './editor-commands';

export const resolveFragmentDeletedRange = (
  editor: Editor,
  range: Range
): Range | null => {
  const wholeBlocks = editor.read((state) =>
    readWholeBlockDelete(state, range, undefined)
  );

  if (!wholeBlocks || wholeBlocks.endsInFirst) {
    return resolveDeletedRange(editor, range);
  }

  const [first] = getDefined(wholeBlocks.blocks[0]);
  const [last] = getDefined(wholeBlocks.blocks.at(-1));

  if (!wholeBlocks.takesCaret || !first.children.some(NodeApi.isText)) {
    return null;
  }

  const anchor = RangeApi.start(range);
  const focus = getDefined(
    editor.read((state) =>
      state.points.end(state.key(wholeBlocks.blocks.length > 1 ? last : first))
    )
  );

  return wholeBlocks.blocks.length > 1
    ? { anchor, focus }
    : resolveDeletedRange(editor, { anchor, focus });
};

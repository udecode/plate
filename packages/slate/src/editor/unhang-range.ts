import { NodeApi } from '../interfaces';
import { Editor, type EditorStaticApi } from '../interfaces/editor';
import { PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { nodes } from './nodes';

export const unhangRange: EditorStaticApi['unhangRange'] = (
  editor,
  range,
  options = {}
) => {
  const { voids = false } = options;
  let [start, end] = RangeApi.edges(range);

  // PERF: exit early if we can guarantee that the range isn't hanging.
  if (
    start.offset !== 0 ||
    end.offset !== 0 ||
    RangeApi.isCollapsed(range) ||
    PathApi.hasPrevious(end.path)
  ) {
    return range;
  }

  const endBlock = Editor.above(editor, {
    at: end,
    match: (n) => NodeApi.isElement(n) && Editor.isBlock(editor, n),
    voids,
  });
  const blockPath = endBlock ? endBlock[1] : [];
  const first = Editor.point(editor, start, { edge: 'start' });
  const before = { anchor: first, focus: end };
  let skip = true;

  for (const [node, path] of nodes(editor, {
    at: before,
    match: NodeApi.isText,
    reverse: true,
    voids,
  })) {
    if (skip) {
      skip = false;
      continue;
    }

    if (
      node.text === '' &&
      voids &&
      Editor.void(editor, { at: path, mode: 'highest' })
    ) {
      continue;
    }

    if (node.text !== '' || PathApi.isBefore(path, blockPath)) {
      end = { path, offset: node.text.length };
      break;
    }
  }

  return { anchor: start, focus: end };
};

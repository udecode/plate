import type {
  ContentSlice as ContentSliceValue,
  Editor,
  Value,
} from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import type { Point } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { ContentSlice, createContentSliceFromFragment } from './content-slice';

const getOpenDepth = (editor: Editor, point: Point) => {
  const ancestorPaths = point.path
    .slice(0, -1)
    .map((_part, index) => point.path.slice(0, index + 1));
  const barrierIndex = ancestorPaths.findIndex((path) => {
    const ancestor = NodeApi.get(editor, path);

    return (
      NodeApi.isElement(ancestor) &&
      (editor.read.schema.isIsolating(ancestor) ||
        editor.read.schema.isVoid(ancestor) ||
        editor.read.schema.getElementSlicePolicy(ancestor).preserveContext)
    );
  });
  return barrierIndex < 0 ? ancestorPaths.length : barrierIndex;
};

/** @internal Read one canonical slice without losing its structural edges. */
export const getContentSlice = <V extends Value>(
  editor: Editor<V>,
  selection: Range | null
): ContentSliceValue<V> => {
  if (!selection) {
    return ContentSlice.empty;
  }

  const [start, end] = RangeApi.edges(selection);

  return createContentSliceFromFragment<V>(
    NodeApi.fragment(editor, selection),
    getOpenDepth(editor, start),
    getOpenDepth(editor, end)
  );
};

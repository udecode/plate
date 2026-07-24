import type {
  ContentSlice as ContentSliceValue,
  Editor,
  Value,
} from '../interfaces/editor';
import { ElementApi } from '../interfaces/element';
import { type Descendant, NodeApi } from '../interfaces/node';
import type { Point } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
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

  const selectedNode = SelectionApi.isNode(selection)
    ? (NodeApi.getIf(editor, selection.path) ?? null)
    : null;
  const content = selectedNode
    ? ([selectedNode] as readonly Descendant[])
    : NodeApi.fragment(editor, selection);
  const document = editor.read((state) => state.value());
  const roots: Record<string, readonly Descendant[]> = {};
  const visitedRoots = new Set<string>();
  const collect = (children: readonly Descendant[]) => {
    children.forEach((node) => {
      if (!ElementApi.isElement(node)) return;

      for (const root of Object.values(
        editor.read.schema.getElementContentRoots(node)
      )) {
        if (visitedRoots.has(root)) continue;
        const rootContent = document.roots?.[root];

        if (!rootContent) continue;
        visitedRoots.add(root);
        roots[root] = rootContent;
        collect(rootContent);
      }

      collect(node.children);
    });
  };
  collect(content);

  if (selectedNode) {
    return createContentSliceFromFragment<V>(content, 0, 0, roots);
  }

  const [start, end] = RangeApi.edges(selection);

  return createContentSliceFromFragment<V>(
    content,
    getOpenDepth(editor, start),
    getOpenDepth(editor, end),
    roots
  );
};

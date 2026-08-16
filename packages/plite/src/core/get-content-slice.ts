import type {
  ContentSlice as ContentSliceValue,
  AnyEditor as Editor,
  EditorStateView,
  Value,
} from '../interfaces/editor';
import { ElementApi } from '../interfaces/element';
import { type Descendant, NodeApi } from '../interfaces/node';
import { type Point, PointApi } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { ContentSlice, createContentSliceFromFragment } from './content-slice';
import { getEditorRuntimeRoot, getEditorSchema } from './editor-runtime';

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

  const nodeSelection = SelectionApi.isNode(selection) ? selection : null;
  const selectedNode = nodeSelection
    ? (NodeApi.getIf(editor, nodeSelection.path) ?? null)
    : null;
  const fullRootContent = selectedNode
    ? null
    : editor.read((state: EditorStateView<V, any>) => {
        const [start, end] = RangeApi.edges(selection);
        const rootStart = state.points.start([]);
        const rootEnd = state.points.end([]);

        return rootStart &&
          rootEnd &&
          PointApi.equals(start, rootStart) &&
          PointApi.equals(end, rootEnd)
          ? state.children()
          : null;
      });
  const root = getEditorRuntimeRoot(editor);
  const schema = getEditorSchema(editor);
  const content =
    selectedNode && NodeApi.isDescendant(selectedNode)
      ? [schema.copyNodeAt(selectedNode, nodeSelection!.path, root)]
      : schema.copyChildren(
          fullRootContent ?? NodeApi.fragment(editor, selection),
          root
        );
  const document = editor.read((state: EditorStateView<V, any>) =>
    state.value()
  );
  const roots: Record<string, readonly Descendant[]> = {};
  const visitedRoots = new Set<string>();
  const collect = (children: readonly Descendant[]) => {
    children.forEach((node) => {
      if (!ElementApi.isElement(node)) return;

      for (const root of Object.values(
        editor.read.schema.getElementContentRoots(node)
      ) as string[]) {
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
  if (editor.read.schema.hasContentRoots()) {
    collect(content);
    for (const [name, children] of Object.entries(roots)) {
      roots[name] = schema.copyChildren(children, name);
    }
  }

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

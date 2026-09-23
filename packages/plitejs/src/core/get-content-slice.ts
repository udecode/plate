import type {
  ContentSlice as ContentSliceValue,
  AnyEditor as Editor,
  Value,
} from '../interfaces/editor';
import { ElementApi } from '../interfaces/element';
import { type Descendant, NodeApi } from '../interfaces/node';
import { type Point, PointApi } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { SelectionApi, type NodeSelection } from '../interfaces/selection';
import { ContentSlice, createContentSliceFromFragment } from './content-slice';
import { getEditorRuntimeRoot, getEditorSchema } from './editor-runtime';
import { getEditorDocumentRoots } from './public-state';

const getOpenDepth = (editor: Editor, point: Point) => {
  const ancestorPaths = point.path
    .slice(0, -1)
    .map((_part, index) => point.path.slice(0, index + 1));
  const barrierIndex = ancestorPaths.findIndex((path) => {
    const ancestor = NodeApi.get(editor, path);

    return (
      NodeApi.isElement(ancestor) &&
      (editor.read.schema.isVoid(ancestor) ||
        editor.read.schema.getElementSlicePolicy(ancestor).preserveContext)
    );
  });
  return barrierIndex === -1 ? ancestorPaths.length : barrierIndex;
};

const omitOpenBoundaryRoots = (
  editor: Editor,
  children: readonly Descendant[],
  depth: number,
  edge: 'start' | 'end'
): readonly Descendant[] => {
  if (depth === 0 || children.length === 0) return children;

  const index = edge === 'start' ? 0 : children.length - 1;
  const node = children[index];

  if (!ElementApi.isElement(node)) return children;

  const nested = omitOpenBoundaryRoots(editor, node.children, depth - 1, edge);
  let replacement: Descendant = node;

  if (editor.read.schema.isObject(node) && 'childRoots' in node) {
    const { childRoots: _childRoots, ...withoutRoots } = node;

    replacement = { ...withoutRoots, children: nested };
  } else if (nested !== node.children) {
    replacement = { ...node, children: nested };
  }

  if (replacement === node) return children;

  const result = [...children];

  result[index] = replacement;

  return result;
};

/**
 * Read one canonical slice without losing its structural edges.
 *
 * @internal
 */
export const getContentSlice = <V extends Value>(
  editor: Editor<V>,
  selection: NodeSelection | Range | null,
  sourceRoots?: ContentSliceValue['roots']
): ContentSliceValue<V> => {
  if (!selection) {
    return ContentSlice.empty;
  }

  const nodeSelection = SelectionApi.isNode(selection) ? selection : null;
  const rangeSelection = RangeApi.isRange(selection) ? selection : null;
  const selectedNodes = nodeSelection
    ? nodeSelection.paths.flatMap((path) => {
        const node = NodeApi.getIf(editor, path);

        return node && NodeApi.isDescendant(node)
          ? [[node, path] as const]
          : [];
      })
    : null;
  const fullRootContent = rangeSelection
    ? editor.read((state) => {
        const [start, end] = RangeApi.edges(rangeSelection);
        const rootStart = state.points.start([]);
        const rootEnd = state.points.end([]);

        return rootStart &&
          rootEnd &&
          PointApi.equals(start, rootStart) &&
          PointApi.equals(end, rootEnd)
          ? state.children()
          : null;
      })
    : null;
  const root = getEditorRuntimeRoot(editor);
  const schema = getEditorSchema(editor);
  let content: readonly Descendant[];

  if (selectedNodes) {
    content = selectedNodes.map(([node, path]) =>
      schema.copyNodeAt(node, path, root)
    );
  } else if (rangeSelection) {
    content = schema.copyChildren(
      fullRootContent ?? NodeApi.fragment(editor, rangeSelection),
      root
    );
  } else {
    return ContentSlice.empty;
  }
  const [start, end] = rangeSelection
    ? RangeApi.edges(rangeSelection)
    : [null, null];
  const openStart = start ? getOpenDepth(editor, start) : 0;
  const openEnd = end ? getOpenDepth(editor, end) : 0;

  content = omitOpenBoundaryRoots(editor, content, openStart, 'start');
  content = omitOpenBoundaryRoots(editor, content, openEnd, 'end');

  const roots: Record<string, readonly Descendant[]> = {};
  const visitedRoots = new Set<string>();
  const collect = (children: readonly Descendant[]) => {
    children.forEach((node) => {
      if (!ElementApi.isElement(node)) return;

      for (const innerRoot of Object.values(
        editor.read.schema.getElementContentRoots(node)
      )) {
        if (visitedRoots.has(innerRoot)) continue;
        const rootContent = (sourceRoots ?? getEditorDocumentRoots(editor))[
          innerRoot
        ];

        if (!rootContent) {
          if (sourceRoots !== undefined) {
            throw new Error(
              `Missing content slice source root "${innerRoot}".`
            );
          }
          continue;
        }
        visitedRoots.add(innerRoot);
        roots[innerRoot] = rootContent;
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

  if (selectedNodes) {
    return createContentSliceFromFragment<V>(content, 0, 0, roots);
  }

  if (!rangeSelection) return ContentSlice.empty;

  return createContentSliceFromFragment<V>(content, openStart, openEnd, roots);
};

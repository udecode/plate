import {
  above,
  after,
  before,
  edges,
  elementReadOnly,
  first,
  getVoid,
  hasBlocks,
  hasInlines,
  hasPath,
  hasTexts,
  isBlock,
  isEdge,
  isEmpty,
  isEnd,
  isNormalizing,
  isStart,
  last,
  leaf,
  levels,
  next,
  parent,
  path,
  point,
  positions,
  previous,
  projectRange,
  range,
  shouldMergeNodesRemovePrevNode,
  string,
  unhangRange,
} from '../editor';
import type {
  Ancestor,
  Descendant,
  DescendantIn,
  Editor,
  EditorAboveOptions,
  EditorLevelsOptions,
  EditorNextOptions,
  EditorPreviousOptions,
  Location,
  Node,
  NodeEntry,
  Point,
  Range,
  Span,
  Value,
} from '../interfaces';
import { RangeApi } from '../interfaces';
import { getCommonLocationRoot } from '../internal/root-location';
import type { InternalEditorQueryRuntime } from './editor-runtime';
import { getFragment } from './get-fragment';
import {
  getCurrentSelectionRoot,
  getEditorChildrenRoot,
  getLiveSelection,
  withEditorRootChildren,
  withEditorRootChildrenGenerator,
} from './public-state';
import { executeQueryMiddleware } from './query-middleware';

const getQueryRoot = (
  editor: Editor,
  locations: readonly (Location | Span | undefined)[],
  { selectionFallback = false }: { selectionFallback?: boolean } = {}
): string | undefined => {
  const root = getCommonLocationRoot(...locations);

  if (root === null) {
    throw new Error('Cannot read a Plite location across multiple roots.');
  }

  return (
    root ??
    getEditorChildrenRoot(editor) ??
    (selectionFallback && getLiveSelection(editor)
      ? getCurrentSelectionRoot(editor)
      : undefined)
  );
};

const withQueryRoot = <T>(
  editor: Editor,
  locations: readonly (Location | Span | undefined)[],
  fn: () => T,
  options?: { selectionFallback?: boolean }
): T => {
  const root = getQueryRoot(editor, locations, options);

  return root ? withEditorRootChildren(editor, root, fn) : fn();
};

const withOptionsQueryRoot = <T>(
  editor: Editor,
  options: { at?: Location | Span } | undefined,
  fn: () => T,
  queryOptions?: { selectionFallback?: boolean }
): T => withQueryRoot(editor, [options?.at], fn, queryOptions);

const usesImplicitSelectionLocation = (
  options: { at?: Location | Span } | undefined
) => options?.at === undefined;

const withQueryRootGenerator = <T>(
  editor: Editor,
  locations: readonly (Location | Span | undefined)[],
  create: () => Iterable<T>,
  options?: { selectionFallback?: boolean }
): Generator<T, void, undefined> =>
  (function* rootedQueryGenerator() {
    const root = getQueryRoot(editor, locations, options);

    if (root) {
      yield* withEditorRootChildrenGenerator(editor, root, create);
      return;
    }

    yield* create();
  })();

const withExplicitPointRoot = <TPoint extends Point | undefined>(
  point: TPoint,
  root: string | undefined
): TPoint =>
  root && point && point.root === undefined
    ? ({ ...point, root } as TPoint)
    : point;

const withExplicitRangeRoot = <TRange extends Range>(
  range: TRange,
  root: string | undefined
): TRange =>
  root
    ? ({
        anchor: withExplicitPointRoot(range.anchor, root),
        focus: withExplicitPointRoot(range.focus, root),
      } as TRange)
    : range;

export const createEditorQueryRuntime = <V extends Value>(
  editor: Editor<V>
): InternalEditorQueryRuntime => ({
  above: <T extends Ancestor>(options?: EditorAboveOptions<T>) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'above',
      { options },
      ({ options }) =>
        withOptionsQueryRoot(editor, options, () => above(editor, options), {
          selectionFallback: usesImplicitSelectionLocation(options),
        })
    ) as NodeEntry<T> | undefined,
  after: (at, options) =>
    executeQueryMiddleware(
      editor,
      'points',
      'after',
      { at, options },
      ({ at, options }) => {
        const root = getQueryRoot(editor, [at]);

        return withQueryRoot(editor, [at], () =>
          withExplicitPointRoot(after(editor, at, options), root)
        );
      }
    ),
  before: (at, options) =>
    executeQueryMiddleware(
      editor,
      'points',
      'before',
      { at, options },
      ({ at, options }) => {
        const root = getQueryRoot(editor, [at]);

        return withQueryRoot(editor, [at], () =>
          withExplicitPointRoot(before(editor, at, options), root)
        );
      }
    ),
  edges: (at) =>
    executeQueryMiddleware(editor, 'ranges', 'edges', { at }, ({ at }) => {
      const root = getQueryRoot(editor, [at]);

      return withQueryRoot(editor, [at], () => {
        const [start, end] = edges(editor, at);

        return [
          withExplicitPointRoot(start, root),
          withExplicitPointRoot(end, root),
        ] as [Point, Point];
      });
    }),
  elementReadOnly: (options) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'elementReadOnly',
      { options },
      ({ options }) =>
        withOptionsQueryRoot(
          editor,
          options,
          () => elementReadOnly(editor, options),
          { selectionFallback: usesImplicitSelectionLocation(options) }
        )
    ),
  first: (at) =>
    executeQueryMiddleware(editor, 'nodes', 'first', { at }, ({ at }) =>
      withQueryRoot(editor, [at], () => first(editor, at))
    ),
  fragment: (at) => {
    const root = getQueryRoot(editor, [at]);
    const fragmentRange = withQueryRoot(editor, [at], () =>
      withExplicitRangeRoot(range(editor, at), root)
    );

    return executeQueryMiddleware(
      editor,
      'fragment',
      'get',
      { options: { at: fragmentRange } },
      ({ options }) => {
        const location = options?.at;

        return withQueryRoot(editor, [location], () =>
          location && RangeApi.isCollapsed(location)
            ? []
            : (getFragment(editor, options) as DescendantIn<V>[])
        );
      }
    );
  },
  hasBlocks: (element) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'hasBlocks',
      { element },
      ({ element }) => hasBlocks(editor, element)
    ),
  hasInlines: (element) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'hasInlines',
      { element },
      ({ element }) => hasInlines(editor, element)
    ),
  hasPath: (path) =>
    executeQueryMiddleware(editor, 'nodes', 'hasPath', { path }, ({ path }) =>
      hasPath(editor, path)
    ),
  hasTexts: (element) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'hasTexts',
      { element },
      ({ element }) => hasTexts(editor, element)
    ),
  isBlock: (element) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'isBlock',
      { element },
      ({ element }) => isBlock(editor, element)
    ),
  isEdge: (point, at) =>
    executeQueryMiddleware(
      editor,
      'points',
      'isEdge',
      { at, point },
      ({ at, point }) =>
        withQueryRoot(editor, [point, at], () => isEdge(editor, point, at))
    ),
  isEmpty: (element) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'isEmpty',
      { element },
      ({ element }) => isEmpty(editor, element)
    ),
  isEnd: (point, at) =>
    executeQueryMiddleware(
      editor,
      'points',
      'isEnd',
      { at, point },
      ({ at, point }) =>
        withQueryRoot(editor, [point, at], () => isEnd(editor, point, at))
    ),
  isNormalizing: () => isNormalizing(editor),
  isStart: (point, at) =>
    executeQueryMiddleware(
      editor,
      'points',
      'isStart',
      { at, point },
      ({ at, point }) =>
        withQueryRoot(editor, [point, at], () => isStart(editor, point, at))
    ),
  last: (at) =>
    executeQueryMiddleware(editor, 'nodes', 'last', { at }, ({ at }) =>
      withQueryRoot(editor, [at], () => last(editor, at))
    ),
  leaf: (at, options) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'leaf',
      { at, options },
      ({ at, options }) =>
        withQueryRoot(editor, [at], () => leaf(editor, at, options))
    ),
  levels: <T extends Node>(options?: EditorLevelsOptions<T>) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'levels',
      { options: options as EditorLevelsOptions<Node> | undefined },
      ({ options }) =>
        withQueryRootGenerator(
          editor,
          [options?.at],
          () => levels(editor, options),
          { selectionFallback: usesImplicitSelectionLocation(options) }
        )
    ) as Generator<NodeEntry<T>, void, undefined>,
  next: <T extends Descendant>(options?: EditorNextOptions<T>) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'next',
      { options: options as EditorNextOptions<Descendant> | undefined },
      ({ options }) =>
        withOptionsQueryRoot(editor, options, () => next(editor, options), {
          selectionFallback: usesImplicitSelectionLocation(options),
        })
    ) as NodeEntry<T> | undefined,
  parent: (at, options) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'parent',
      { at, options },
      ({ at, options }) =>
        withQueryRoot(editor, [at], () => parent(editor, at, options))
    ),
  path: (at, options) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'path',
      { at, options },
      ({ at, options }) =>
        withQueryRoot(editor, [at], () => path(editor, at, options))
    ),
  point: (at, options) =>
    executeQueryMiddleware(
      editor,
      'points',
      'get',
      { at, options },
      ({ at, options }) => {
        const root = getQueryRoot(editor, [at]);

        return withQueryRoot(editor, [at], () =>
          withExplicitPointRoot(point(editor, at, options), root)
        );
      }
    ),
  positions: (options) =>
    executeQueryMiddleware(
      editor,
      'points',
      'positions',
      { options },
      ({ options }) => {
        const root = getQueryRoot(editor, [options?.at], {
          selectionFallback: usesImplicitSelectionLocation(options),
        });

        return withQueryRootGenerator(
          editor,
          [options?.at],
          function* () {
            for (const point of positions(editor, options)) {
              yield withExplicitPointRoot(point, root);
            }
          },
          { selectionFallback: usesImplicitSelectionLocation(options) }
        );
      }
    ),
  previous: <T extends Node>(options?: EditorPreviousOptions<T>) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'previous',
      { options: options as EditorPreviousOptions<Node> | undefined },
      ({ options }) =>
        withOptionsQueryRoot(editor, options, () => previous(editor, options), {
          selectionFallback: usesImplicitSelectionLocation(options),
        })
    ) as NodeEntry<T> | undefined,
  projectRange: (range) =>
    executeQueryMiddleware(
      editor,
      'ranges',
      'project',
      { range },
      ({ range }) =>
        withQueryRoot(editor, [range], () => projectRange(editor, range))
    ),
  range: (at, to) =>
    executeQueryMiddleware(
      editor,
      'ranges',
      'get',
      { at, to },
      ({ at, to }) => {
        const root = getQueryRoot(editor, [at, to]);

        return withQueryRoot(editor, [at, to], () =>
          withExplicitRangeRoot(range(editor, at, to), root)
        );
      }
    ),
  shouldMergeNodesRemovePrevNode: (previous, current) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'shouldMergeNodesRemovePrevNode',
      { current, previous },
      ({ current, previous }) =>
        shouldMergeNodesRemovePrevNode(editor, previous, current)
    ),
  string: (at, options) =>
    executeQueryMiddleware(
      editor,
      'text',
      'string',
      { at, options },
      ({ at, options }) =>
        withQueryRoot(editor, [at], () => string(editor, at, options))
    ),
  unhangRange: (range, options) =>
    executeQueryMiddleware(
      editor,
      'ranges',
      'unhang',
      { options, range },
      ({ options, range }) => {
        const root = getQueryRoot(editor, [range]);

        return withQueryRoot(editor, [range], () =>
          withExplicitRangeRoot(unhangRange(editor, range, options), root)
        );
      }
    ),
  void: (options) =>
    executeQueryMiddleware(
      editor,
      'nodes',
      'void',
      { options },
      ({ options }) =>
        withOptionsQueryRoot(editor, options, () => getVoid(editor, options), {
          selectionFallback: usesImplicitSelectionLocation(options),
        })
    ),
});

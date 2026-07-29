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
import { failInvariant } from '../internal/fail-invariant';
import { getCommonLocationRoot } from '../internal/root-location';
import type { InternalEditorReadRuntime } from './editor-runtime';
import { getFragment } from './get-fragment';
import {
  getCurrentSelectionRoot,
  getEditorChildrenRoot,
  getLiveSelection,
  withEditorRootChildren,
  withEditorRootChildrenGenerator,
} from './public-state';

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

export const createEditorReadRuntime = <V extends Value>(
  editor: Editor<V>
): InternalEditorReadRuntime => ({
  above: <T extends Ancestor>(options?: EditorAboveOptions<T>) =>
    (({ options }) =>
      withOptionsQueryRoot(editor, options, () => above(editor, options), {
        selectionFallback: usesImplicitSelectionLocation(options),
      }))({ options }) as NodeEntry<T> | undefined,
  after: (at, options) =>
    (({ at, options }) => {
      const root = getQueryRoot(editor, [at]);

      return withQueryRoot(editor, [at], () =>
        withExplicitPointRoot(after(editor, at, options), root)
      );
    })({ at, options }),
  before: (at, options) =>
    (({ at, options }) => {
      const root = getQueryRoot(editor, [at]);

      return withQueryRoot(editor, [at], () =>
        withExplicitPointRoot(before(editor, at, options), root)
      );
    })({ at, options }),
  edges: (at) =>
    (({ at }) => {
      const root = getQueryRoot(editor, [at]);

      return withQueryRoot(editor, [at], () => {
        const [start, end] = edges(editor, at);

        return [
          withExplicitPointRoot(start, root),
          withExplicitPointRoot(end, root),
        ] as [Point, Point];
      });
    })({ at }) ?? failInvariant('Static range read returned no result'),
  elementReadOnly: (options) =>
    (({ options }) =>
      withOptionsQueryRoot(
        editor,
        options,
        () => elementReadOnly(editor, options),
        { selectionFallback: usesImplicitSelectionLocation(options) }
      ))({ options }),
  first: (at) =>
    (({ at }) => withQueryRoot(editor, [at], () => first(editor, at)))({
      at,
    }) ?? failInvariant('Static first-node read returned no result'),
  fragment: (at) => {
    const root = getQueryRoot(editor, [at]);
    const fragmentRange = withQueryRoot(editor, [at], () =>
      withExplicitRangeRoot(range(editor, at), root)
    );

    return (({ options }) => {
      const location = options?.at;

      return withQueryRoot(editor, [location], () =>
        location && RangeApi.isCollapsed(location)
          ? []
          : (getFragment(editor, options) as DescendantIn<V>[])
      );
    })({ options: { at: fragmentRange } });
  },
  hasBlocks: (element) =>
    (({ element }) => hasBlocks(editor, element))({ element }),
  hasInlines: (element) =>
    (({ element }) => hasInlines(editor, element))({ element }),
  hasPath: (path) => (({ path }) => hasPath(editor, path))({ path }),
  hasTexts: (element) =>
    (({ element }) => hasTexts(editor, element))({ element }),
  isBlock: (element) =>
    (({ element }) => isBlock(editor, element))({ element }),
  isEdge: (point, at) =>
    (({ at, point }) =>
      withQueryRoot(editor, [point, at], () => isEdge(editor, point, at)))({
      at,
      point,
    }),
  isEmpty: (element) =>
    (({ element }) => isEmpty(editor, element))({ element }),
  isEnd: (point, at) =>
    (({ at, point }) =>
      withQueryRoot(editor, [point, at], () => isEnd(editor, point, at)))({
      at,
      point,
    }),
  isStart: (point, at) =>
    (({ at, point }) =>
      withQueryRoot(editor, [point, at], () => isStart(editor, point, at)))({
      at,
      point,
    }),
  last: (at, options) =>
    (({ at, options }) =>
      withQueryRoot(editor, [at], () => last(editor, at, options)))({
      at,
      options,
    }),
  leaf: (at, options) =>
    (({ at, options }) =>
      withQueryRoot(editor, [at], () => leaf(editor, at, options)))({
      at,
      options,
    }) ?? failInvariant('Static leaf read returned no result'),
  levels: <T extends Node>(options?: EditorLevelsOptions<T>) =>
    (({ options }) =>
      withQueryRootGenerator(
        editor,
        [options?.at],
        () => levels(editor, options),
        { selectionFallback: usesImplicitSelectionLocation(options) }
      ))({
      options: options as EditorLevelsOptions<Node> | undefined,
    }) as Generator<NodeEntry<T>, void, undefined>,
  next: <T extends Descendant>(options?: EditorNextOptions<T>) =>
    (({ options }) =>
      withOptionsQueryRoot(editor, options, () => next(editor, options), {
        selectionFallback: usesImplicitSelectionLocation(options),
      }))({ options: options as EditorNextOptions<Descendant> | undefined }) as
      | NodeEntry<T>
      | undefined,
  parent: (at, options) =>
    (({ at, options }) =>
      withQueryRoot(editor, [at], () => parent(editor, at, options)))({
      at,
      options,
    }) ?? failInvariant('Static parent read returned no result'),
  path: (at, options) =>
    (({ at, options }) =>
      withQueryRoot(editor, [at], () => path(editor, at, options)))({
      at,
      options,
    }) ?? failInvariant('Static path read returned no result'),
  point: (at, options) =>
    (({ at, options }) => {
      const root = getQueryRoot(editor, [at]);

      return withQueryRoot(editor, [at], () =>
        withExplicitPointRoot(point(editor, at, options), root)
      );
    })({ at, options }) ??
    failInvariant('Static point read returned no result'),
  positions: (options) =>
    (({ options }) => {
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
    })({ options }),
  previous: <T extends Node>(options?: EditorPreviousOptions<T>) =>
    (({ options }) =>
      withOptionsQueryRoot(editor, options, () => previous(editor, options), {
        selectionFallback: usesImplicitSelectionLocation(options),
      }))({ options: options as EditorPreviousOptions<Node> | undefined }) as
      | NodeEntry<T>
      | undefined,
  projectRange: (range) =>
    (({ range }) =>
      withQueryRoot(editor, [range], () => projectRange(editor, range)))({
      range,
    }),
  range: (at, to) =>
    (({ at, to }) => {
      const root = getQueryRoot(editor, [at, to]);

      return withQueryRoot(editor, [at, to], () =>
        withExplicitRangeRoot(range(editor, at, to), root)
      );
    })({ at, to }) ?? failInvariant('Static range read returned no result'),
  shouldMergeNodesRemovePrevNode: (previous, current) =>
    (({ current, previous }) =>
      shouldMergeNodesRemovePrevNode(editor, previous, current))({
      current,
      previous,
    }),
  string: (at, options) =>
    (({ at, options }) =>
      withQueryRoot(editor, [at], () => string(editor, at, options)))({
      at,
      options,
    }),
  unhangRange: (range, options) =>
    (({ options, range }) => {
      const root = getQueryRoot(editor, [range]);

      return withQueryRoot(editor, [range], () =>
        withExplicitRangeRoot(unhangRange(editor, range, options), root)
      );
    })({ options, range }),
  void: (options) =>
    (({ options }) =>
      withOptionsQueryRoot(editor, options, () => getVoid(editor, options), {
        selectionFallback: usesImplicitSelectionLocation(options),
      }))({ options }),
});

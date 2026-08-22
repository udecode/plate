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
  AnyEditor as Editor,
  EditorAboveOptions,
  EditorLevelsOptions,
  EditorNextOptions,
  EditorParentOptions,
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
  locations: ReadonlyArray<Location | Span | undefined>,
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
  locations: ReadonlyArray<Location | Span | undefined>,
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
  locations: ReadonlyArray<Location | Span | undefined>,
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
  innerPoint: TPoint,
  root: string | undefined
): TPoint =>
  root && innerPoint && innerPoint.root === undefined
    ? { ...innerPoint, root }
    : innerPoint;

const withExplicitRangeRoot = <TRange extends Range>(
  innerRange: TRange,
  root: string | undefined
): TRange =>
  root
    ? ({
        anchor: withExplicitPointRoot(innerRange.anchor, root),
        focus: withExplicitPointRoot(innerRange.focus, root),
      } as TRange)
    : innerRange;

export const createEditorReadRuntime = <V extends Value>(
  editor: Editor<V>
): InternalEditorReadRuntime => ({
  above: <T extends Ancestor>(options?: EditorAboveOptions<T>) =>
    (({ options: innerOptions }) =>
      withOptionsQueryRoot(
        editor,
        innerOptions,
        () => above(editor, innerOptions as never),
        {
          selectionFallback: usesImplicitSelectionLocation(innerOptions),
        }
      ))({ options }),
  after: (at, options) =>
    (({ at: innerAt, options: innerOptions2 }) => {
      const root = getQueryRoot(editor, [innerAt]);

      return withQueryRoot(editor, [innerAt], () =>
        withExplicitPointRoot(after(editor, innerAt, innerOptions2), root)
      );
    })({ at, options }),
  before: (at, options) =>
    (({ at: innerAt2, options: innerOptions3 }) => {
      const root = getQueryRoot(editor, [innerAt2]);

      return withQueryRoot(editor, [innerAt2], () =>
        withExplicitPointRoot(before(editor, innerAt2, innerOptions3), root)
      );
    })({ at, options }),
  edges: (at) =>
    (({ at: innerAt3 }) => {
      const root = getQueryRoot(editor, [innerAt3]);

      return withQueryRoot(editor, [innerAt3], () => {
        const [start, end] = edges(editor, innerAt3);

        return [
          withExplicitPointRoot(start, root),
          withExplicitPointRoot(end, root),
        ] as [Point, Point];
      });
    })({ at }) ?? failInvariant('Static range read returned no result'),
  elementReadOnly: (options) =>
    (({ options: innerOptions4 }) =>
      withOptionsQueryRoot(
        editor,
        innerOptions4,
        () => elementReadOnly(editor, innerOptions4),
        { selectionFallback: usesImplicitSelectionLocation(innerOptions4) }
      ))({ options }),
  first: (at) =>
    (({ at: innerAt4 }) =>
      withQueryRoot(editor, [innerAt4], () => first(editor, innerAt4)))({
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
          : (getFragment(editor, options) as Array<DescendantIn<V>>)
      );
    })({ options: { at: fragmentRange } });
  },
  hasBlocks: (element) =>
    (({ element: innerElement }) => hasBlocks(editor, innerElement))({
      element,
    }),
  hasInlines: (element) =>
    (({ element: innerElement2 }) => hasInlines(editor, innerElement2))({
      element,
    }),
  hasPath: (innerPath) =>
    (({ path: innerPath2 }) => hasPath(editor, innerPath2))({
      path: innerPath,
    }),
  hasTexts: (element) =>
    (({ element: innerElement3 }) => hasTexts(editor, innerElement3))({
      element,
    }),
  isBlock: (element) =>
    (({ element: innerElement4 }) => isBlock(editor, innerElement4))({
      element,
    }),
  isEdge: (innerPoint2, at) =>
    (({ at: innerAt5, point: innerPoint3 }) =>
      withQueryRoot(editor, [innerPoint3, innerAt5], () =>
        isEdge(editor, innerPoint3, innerAt5)
      ))({
      at,
      point: innerPoint2,
    }),
  isEmpty: (element) =>
    (({ element: innerElement5 }) => isEmpty(editor, innerElement5))({
      element,
    }),
  isEnd: (innerPoint4, at) =>
    (({ at: innerAt6, point: innerPoint5 }) =>
      withQueryRoot(editor, [innerPoint5, innerAt6], () =>
        isEnd(editor, innerPoint5, innerAt6)
      ))({
      at,
      point: innerPoint4,
    }),
  isStart: (innerPoint6, at) =>
    (({ at: innerAt7, point: innerPoint7 }) =>
      withQueryRoot(editor, [innerPoint7, innerAt7], () =>
        isStart(editor, innerPoint7, innerAt7)
      ))({
      at,
      point: innerPoint6,
    }),
  last: (at, options) =>
    (({ at: innerAt8, options: innerOptions5 }) =>
      withQueryRoot(editor, [innerAt8], () =>
        last(editor, innerAt8, innerOptions5)
      ))({
      at,
      options,
    }),
  leaf: (at, options) =>
    (({ at: innerAt9, options: innerOptions6 }) =>
      withQueryRoot(editor, [innerAt9], () =>
        leaf(editor, innerAt9, innerOptions6)
      ))({
      at,
      options,
    }) ?? failInvariant('Static leaf read returned no result'),
  levels: <T extends Node>(options?: EditorLevelsOptions<T>) =>
    (({ options: innerOptions7 }) =>
      withQueryRootGenerator(
        editor,
        [innerOptions7?.at],
        () => levels(editor, innerOptions7 as never),
        { selectionFallback: usesImplicitSelectionLocation(innerOptions7) }
      ))({
      options: options as EditorLevelsOptions<Node> | undefined,
    }),
  next: <T extends Descendant>(options?: EditorNextOptions<T>) =>
    (({ options: innerOptions8 }) =>
      withOptionsQueryRoot(
        editor,
        innerOptions8,
        () => next(editor, innerOptions8 as never),
        {
          selectionFallback: usesImplicitSelectionLocation(innerOptions8),
        }
      ))({ options: options as EditorNextOptions<Descendant> | undefined }) as
      | NodeEntry<T>
      | undefined,
  parent: ((at: Location, options?: EditorParentOptions) =>
    (({ at: innerAt10, options: innerOptions9 }) => {
      const filtered =
        innerOptions9?.type !== undefined || innerOptions9?.match !== undefined;
      const entry = withQueryRoot(editor, [innerAt10], () =>
        (
          parent as (
            editor: unknown,
            at: Location,
            options?: unknown
          ) => NodeEntry<Ancestor> | undefined
        )(editor, innerAt10, innerOptions9)
      );

      return filtered
        ? entry
        : (entry ?? failInvariant('Static parent read returned no result'));
    })({
      at,
      options,
    })) as InternalEditorReadRuntime['parent'],
  path: (at, options) =>
    (({ at: innerAt11, options: innerOptions10 }) =>
      withQueryRoot(editor, [innerAt11], () =>
        path(editor, innerAt11, innerOptions10)
      ))({
      at,
      options,
    }) ?? failInvariant('Static path read returned no result'),
  point: (at, options) =>
    (({ at: innerAt12, options: innerOptions11 }) => {
      const root = getQueryRoot(editor, [innerAt12]);

      return withQueryRoot(editor, [innerAt12], () =>
        withExplicitPointRoot(point(editor, innerAt12, innerOptions11), root)
      );
    })({ at, options }) ??
    failInvariant('Static point read returned no result'),
  positions: (options) =>
    (({ options: innerOptions12 }) => {
      const root = getQueryRoot(editor, [innerOptions12?.at], {
        selectionFallback: usesImplicitSelectionLocation(innerOptions12),
      });

      return withQueryRootGenerator(
        editor,
        [innerOptions12?.at],
        function* readPositions() {
          for (const innerPoint8 of positions(editor, innerOptions12)) {
            yield withExplicitPointRoot(innerPoint8, root);
          }
        },
        { selectionFallback: usesImplicitSelectionLocation(innerOptions12) }
      );
    })({ options }),
  previous: <T extends Node>(options?: EditorPreviousOptions<T>) =>
    (({ options: innerOptions13 }) =>
      withOptionsQueryRoot(
        editor,
        innerOptions13,
        () => previous(editor, innerOptions13 as never),
        {
          selectionFallback: usesImplicitSelectionLocation(innerOptions13),
        }
      ))({ options: options as EditorPreviousOptions<Node> | undefined }),
  projectRange: (innerRange2) =>
    (({ range: innerRange3 }) =>
      withQueryRoot(editor, [innerRange3], () =>
        projectRange(editor, innerRange3)
      ))({
      range: innerRange2,
    }),
  range: (at, to) =>
    (({ at: innerAt13, to: innerTo }) => {
      const root = getQueryRoot(editor, [innerAt13, innerTo]);

      return withQueryRoot(editor, [innerAt13, innerTo], () =>
        withExplicitRangeRoot(range(editor, innerAt13, innerTo), root)
      );
    })({ at, to }) ?? failInvariant('Static range read returned no result'),
  shouldMergeNodesRemovePrevNode: (innerPrevious, current) =>
    (({ current: innerCurrent, previous: innerPrevious2 }) =>
      shouldMergeNodesRemovePrevNode(editor, innerPrevious2, innerCurrent))({
      current,
      previous: innerPrevious,
    }),
  string: (at, options) =>
    (({ at: innerAt14, options: innerOptions14 }) =>
      withQueryRoot(editor, [innerAt14], () =>
        string(editor, innerAt14, innerOptions14)
      ))({
      at,
      options,
    }),
  unhangRange: (innerRange4, options) =>
    (({ options: innerOptions15, range: innerRange5 }) => {
      const root = getQueryRoot(editor, [innerRange5]);

      return withQueryRoot(editor, [innerRange5], () =>
        withExplicitRangeRoot(
          unhangRange(editor, innerRange5, innerOptions15),
          root
        )
      );
    })({ options, range: innerRange4 }),
  void: (options) =>
    (({ options: innerOptions16 }) =>
      withOptionsQueryRoot(
        editor,
        innerOptions16,
        () => getVoid(editor, innerOptions16),
        {
          selectionFallback: usesImplicitSelectionLocation(innerOptions16),
        }
      ))({ options }),
});

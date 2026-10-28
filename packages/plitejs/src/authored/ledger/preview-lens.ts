import type { DocumentIndex } from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import { getRangeEndpointAssociations } from '../../core/change/range-association';
import type { CommandProjectionMap } from '../../core/command-document';
import { toInternalRoot, toPublicRoot } from '../../core/public-root';
import {
  mapSelectionWithContext,
  rawNodeAt,
  type SelectionModeSchema,
  settleSelectionMode,
} from '../../core/selection-protocol';
import type {
  EditorSelectionMapContext,
  EditorSelectionTarget,
} from '../../interfaces/editor';
import { type Path, PathApi } from '../../interfaces/path';
import { type Point, PointApi } from '../../interfaces/point';
import { RangeApi } from '../../interfaces/range';
import {
  type NodeSelection,
  type Selection,
  SelectionApi,
  type SelectionAssociation,
  type TextSelection,
} from '../../interfaces/selection';
import { getDefined } from '../../internal/get-defined';
import { type AuthoredLocationMap, locationMapOver } from '../format';

export type PreviewLensInput = Readonly<{
  map: CommandProjectionMap;
  schema: SelectionModeSchema;
  shownIndex: (root: string) => DocumentIndex;
  storedIndex: (root: string) => DocumentIndex;
}>;

export type RootedSelection = Readonly<{ root: string; selection: Selection }>;

type Shown = RootedSelection & Readonly<{ view: Selection }>;

export type PreviewLens = Readonly<{
  /**
   * A target the preview shows, as the stored target that reads back where
   * it was shown, or the side core's selection mapping takes when none does.
   */
  fromView: (target: EditorSelectionTarget, root: string) => Lifted;
  /**
   * Where the preview showed `selection`, if it is the last selection the lens
   * mapped, whichever way the preview leant then.
   */
  lastView: (selection: Selection, root: string) => Selection | undefined;
  locations: (root: string) => AuthoredLocationMap;
  toView: (selection: Selection, root: string, leans?: boolean) => Selection;
}>;

export type Lifted =
  | Readonly<{
      kind: 'stored';
      shownInBuilt?: true;
      target: NodeSelection | TextSelection;
    }>
  | Readonly<{ kind: 'unmapped' }>;

const UNMAPPED: Lifted = Object.freeze({ kind: 'unmapped' });

const holds = (index: DocumentIndex, point: Point) => {
  const text = rawNodeAt(index, point.path)?.text;

  return (
    typeof text === 'string' &&
    Number.isInteger(point.offset) &&
    point.offset >= 0 &&
    point.offset <= text.length
  );
};

/**
 * Where a caret at `point` that leans forward shows: at the start of the last
 * line in the run of lines `isBuilt` names right after the end of its text,
 * or at `point` when none follows.
 */
const leanIntoBuilt = (
  index: DocumentIndex,
  point: Point,
  isBuilt: (line: Path) => boolean
): Point => {
  let at = point;

  for (;;) {
    const text = rawNodeAt(index, at.path)?.text;

    if (typeof text !== 'string' || at.offset !== text.length) return at;

    const next = index.pointAt(index.positionAt(at) + 1, 1);

    if (!next || next.offset !== 0) return at;

    const line = next.path.slice(0, -1);

    if (PathApi.equals(line, at.path.slice(0, -1)) || !isBuilt(line)) {
      return at;
    }
    at = point.root === undefined ? next : { ...next, root: point.root };
  }
};

const withAffinity = (
  selection: TextSelection,
  affinity: SelectionAssociation | undefined
): TextSelection => {
  const { affinity: _shown, ...rest } = selection;

  return affinity ? { ...rest, affinity } : rest;
};

export const createPreviewLens = ({
  map,
  schema,
  shownIndex,
  storedIndex,
}: PreviewLensInput): PreviewLens => {
  const ways = new Map<
    string,
    Readonly<{ toPreview: AuthoredLocationMap; toStored: AuthoredLocationMap }>
  >();
  const waysOf = (root: string) => {
    let known = ways.get(root);

    if (!known) {
      known = {
        toPreview: locationMapOver(
          storedIndex(root),
          shownIndex(root),
          (from, assoc) =>
            map.toProjected(root, from, assoc === 1 ? 'forward' : 'backward'),
          root
        ),
        toStored: locationMapOver(
          shownIndex(root),
          storedIndex(root),
          (from, assoc) => map.toStored(root, from, assoc),
          root
        ),
      };
      ways.set(root, known);
    }

    return known;
  };
  const rootOf = (named: string | undefined, root: string) =>
    named === undefined ? root : toInternalRoot(named);
  const unstored = (root: string) => (line: Path) =>
    waysOf(root).toStored.path(line) === null;
  const lean = (shown: Point, root: string) =>
    leanIntoBuilt(shownIndex(root), shown, unstored(root));
  const contextOf = (
    root: string,
    way: 'toPreview' | 'toStored',
    leans = false
  ): EditorSelectionMapContext => {
    const indexOf = way === 'toPreview' ? storedIndex : shownIndex;
    const mapPoint = (point: Point, assoc: -1 | 1) =>
      waysOf(rootOf(point.root, root))[way].point(point, assoc);

    return {
      mapPath: (path) =>
        way === 'toPreview'
          ? map.nodePath(root, path)
          : waysOf(root).toStored.path(path),
      mapPoint: (point, options) => {
        if (
          way === 'toPreview' &&
          leans &&
          options?.association === 'forward'
        ) {
          const shown = mapPoint(point, 1);

          return shown && lean(shown, rootOf(point.root, root));
        }

        return mapPoint(point, options?.association === 'backward' ? -1 : 1);
      },
      mapRange: (range, options) => {
        const index = indexOf(rootOf(range.anchor.root, root));
        const anchorAt = index.positionAt(range.anchor);
        const focusAt = index.positionAt(range.focus);
        const [anchorAssoc, focusAssoc] = getRangeEndpointAssociations(
          anchorAt === focusAt
            ? 'collapsed'
            : anchorAt < focusAt
              ? 'forward'
              : 'backward',
          options?.association
        );
        const anchor = mapPoint(range.anchor, anchorAssoc);
        const focus = mapPoint(range.focus, focusAssoc);

        return anchor && focus ? { anchor, focus } : null;
      },
      root: toPublicRoot(root),
    };
  };
  const mapToView = (
    selection: Selection,
    root: string,
    leans = false
  ): Selection => {
    if (!selection) return null;

    const at = rootOf(SelectionApi.root(selection), root);

    return settleSelectionMode(
      schema,
      mapSelectionWithContext(selection, contextOf(at, 'toPreview', leans)),
      shownIndex(at)
    );
  };
  const samePoint = (shown: Point, target: Point, root: string) =>
    PathApi.equals(shown.path, target.path) &&
    shown.offset === target.offset &&
    rootOf(shown.root, root) === rootOf(target.root, root);
  // One shown place can stand for stored places on either side of hidden
  // content, and a pending join can show one stored place at two places, so
  // each endpoint takes the stored side that reads back where it was shown.
  const liftText = (shown: TextSelection, root: string): Lifted => {
    const at = rootOf(SelectionApi.root(shown), root);
    const index = shownIndex(at);

    if (!holds(index, shown.anchor) || !holds(index, shown.focus)) {
      return UNMAPPED;
    }

    const lift = waysOf(at).toStored.point;
    const collapsed = RangeApi.isCollapsed(shown);
    const backward = RangeApi.isBackward(shown);
    const sides = (point: Point, first: -1 | 1) => {
      const near = lift(point, first);
      const far = lift(point, first === 1 ? -1 : 1);

      return far && near && PointApi.equals(far, near)
        ? [near]
        : [near, far].filter((side): side is Point => side !== null);
    };
    const focusSide: -1 | 1 = shown.affinity
      ? shown.affinity === 'forward'
        ? 1
        : -1
      : collapsed || backward
        ? 1
        : -1;
    const foci = sides(shown.focus, focusSide);
    const anchors = collapsed ? [null] : sides(shown.anchor, backward ? -1 : 1);
    const affinities = [
      ...new Set<SelectionAssociation | undefined>([
        shown.affinity,
        undefined,
        'forward',
        'backward',
      ]),
    ];
    let first: TextSelection | undefined;
    // A stored caret shows only in the last of several built lines, so a caret
    // in another one lifts to a stored place that shows in a built line.
    let leaning: TextSelection | undefined;
    const inBuilt = (point: Point) => unstored(at)(point.path.slice(0, -1));
    const shownInBuilt = inBuilt(shown.focus);

    for (const anchor of anchors) {
      for (const focus of foci) {
        for (const affinity of affinities) {
          const candidate = withAffinity(
            { ...shown, anchor: anchor ?? focus, focus },
            affinity
          );
          const view = mapToView(candidate, at, true);

          first ??= candidate;
          if (
            SelectionApi.isText(view) &&
            samePoint(view.anchor, shown.anchor, at) &&
            samePoint(view.focus, shown.focus, at)
          ) {
            return shownInBuilt
              ? { kind: 'stored', shownInBuilt, target: candidate }
              : { kind: 'stored', target: candidate };
          }
          if (
            shownInBuilt &&
            !leaning &&
            SelectionApi.isText(view) &&
            (collapsed || samePoint(view.anchor, shown.anchor, at)) &&
            inBuilt(view.focus)
          ) {
            leaning = candidate;
          }
        }
      }
    }

    const target = leaning ?? first;

    if (!target) return UNMAPPED;

    return leaning
      ? { kind: 'stored', shownInBuilt: true, target }
      : { kind: 'stored', target };
  };
  // A shown node maps to the stored node that shows whole at its path, and to
  // the stored siblings after it whose content a pending join shows inside it.
  const storedPathsOf = (path: Path, root: string) => {
    const stored = waysOf(root).toStored.path(path);
    const back = stored && map.nodePath(root, stored);

    if (!back || !PathApi.equals(back, path)) return null;

    const index = shownIndex(root);
    const { from, to } = index.nodeRange(path);
    const end = index.pointAt(to, -1);
    const last = end && waysOf(root).toStored.point(end, -1);
    const tail = last?.path.slice(0, stored.length);
    const paths: [Path, ...Path[]] = [stored];

    if (!tail || !PathApi.isSibling(stored, tail)) return paths;

    const storedAt = storedIndex(root);
    const showsInside = (sibling: Path) => {
      const start = storedAt.pointAt(storedAt.nodeRange(sibling).from, 1);
      const shown = start && waysOf(root).toPreview.point(start, 1);
      const at = shown ? index.positionAt(shown) : -1;

      return at >= from && at <= to;
    };

    for (
      let next = PathApi.next(stored);
      PathApi.compare(next, tail) <= 0;
      next = PathApi.next(next)
    ) {
      if (showsInside(next)) paths.push(next);
    }

    return paths;
  };
  const liftNodes = (shown: NodeSelection, root: string): Lifted => {
    const at = rootOf(shown.root, root);
    const index = shownIndex(at);
    const groups: Path[][] = [];

    for (const path of shown.paths) {
      const group = rawNodeAt(index, path) ? storedPathsOf(path, at) : null;

      if (!group) return UNMAPPED;
      groups.push(group);
    }

    const backward = PathApi.compare(shown.anchorPath, shown.focusPath) > 0;
    const endOf = (end: Path, last: boolean) => {
      const group = getDefined(
        groups[shown.paths.findIndex((path) => PathApi.equals(path, end))]
      );

      return getDefined(last ? group.at(-1) : group[0]);
    };
    const paths = groups.flat() as [Path, ...Path[]];
    const named = toPublicRoot(at);
    const lifted = settleSelectionMode(
      schema,
      SelectionApi.nodes(paths, {
        anchorPath: endOf(shown.anchorPath, backward),
        focusPath: endOf(shown.focusPath, !backward),
        mode: paths.length > 1 ? 'block' : shown.mode,
        ...(named === undefined ? {} : { root: named }),
      }),
      storedIndex(at)
    );

    return SelectionApi.isNode(lifted)
      ? { kind: 'stored', target: lifted }
      : UNMAPPED;
  };
  // A path selects its node's text, as a plain view's select does.
  const plainSelectionOf = (
    target: EditorSelectionTarget,
    root: string
  ): NodeSelection | TextSelection | null => {
    if (PathApi.isPath(target)) {
      const index = shownIndex(root);

      if (target.length > 0 && !rawNodeAt(index, target)) return null;

      const { from, to } =
        target.length === 0
          ? { from: 0, to: index.length }
          : index.nodeRange(target);
      const anchor = index.pointAt(from, 1);
      const focus = index.pointAt(to, -1);

      return anchor && focus ? SelectionApi.text({ anchor, focus }) : null;
    }
    if (PointApi.isPoint(target)) {
      return SelectionApi.text({ anchor: target, focus: target });
    }
    if (SelectionApi.isNode(target) || SelectionApi.isText(target)) {
      return target;
    }

    return SelectionApi.text(target);
  };
  let last: (Shown & Readonly<{ leans: boolean }>) | undefined;
  const keyOf = (selection: Selection, root: string) =>
    rootOf(SelectionApi.root(selection), root);
  const lastView = (selection: Selection, root: string) =>
    last?.root === keyOf(selection, root) &&
    jsonEqual(last.selection, selection)
      ? last.view
      : undefined;
  const toView = (
    selection: Selection,
    root: string,
    leans = false
  ): Selection => {
    if (!selection) return null;

    const known = last?.leans === leans ? lastView(selection, root) : undefined;

    if (known !== undefined) return known;

    const view = mapToView(selection, root, leans);

    last = { leans, root: keyOf(selection, root), selection, view };

    return view;
  };

  return Object.freeze({
    fromView: (target, root) => {
      const view = plainSelectionOf(target, root);

      if (!view) return UNMAPPED;

      return SelectionApi.isNode(view)
        ? liftNodes(view, root)
        : liftText(view, root);
    },
    lastView,
    locations: (root) => {
      const { toPreview } = waysOf(root);
      const index = storedIndex(root);

      return {
        path: (path) => (rawNodeAt(index, path) ? toPreview.path(path) : null),
        point: (point, assoc) =>
          holds(index, point) ? toPreview.point(point, assoc) : null,
        range: (range) =>
          holds(index, range.anchor) && holds(index, range.focus)
            ? toPreview.range(range)
            : null,
      };
    },
    toView,
  });
};

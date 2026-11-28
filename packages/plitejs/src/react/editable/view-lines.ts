import { createContext } from 'react';

import type { Path, Point } from '../..';
import type { SoftLineSide } from '../../dom/dom-soft-line-end';
import {
  getNearestPliteStringRect,
  getOwnedPliteTextStrings,
  getPliteStringPlacementAtX,
  PLITE_STRING_PRESS_REACH_PX,
  type PliteStringLetterPlacement,
  type PliteStringRectHit,
} from '../../dom/plugin/dom-geometry';
import { findMountedDOMNodeByPath } from '../../dom/plugin/dom-node-path';
import type { DOMPoint } from '../../dom/utils/dom';
import type { ReactRuntimeEditor } from '../plugin/react-editor';

export type NativeLineFlow = 'contiguous' | 'skips-placed-lines';

export type ViewLineDirection = 'down' | 'up';

export type ViewCaret = Readonly<{ point: Point; side: SoftLineSide | null }>;

export type ViewLineLanding = Readonly<{
  dom: DOMPoint | null;
  goalX?: number;
  point: Point;
}>;

export type PlacementReach = 'drag' | 'press';

export type ViewLines = Readonly<{
  interceptsLineMotion?: (nativeFlow: NativeLineFlow) => boolean;
  lineAfter: (
    query: Readonly<{
      direction: ViewLineDirection;
      from: ViewCaret;
      nativeFlow?: NativeLineFlow;
      readX: () => number | null;
    }>
  ) => ViewLineLanding | null;
  placementAt: (
    query: Readonly<{
      reach: PlacementReach;
      target: Element | null;
      x: number;
      y: number;
    }>
  ) => PliteStringLetterPlacement | null;
}>;

export const ViewLinesContext = createContext<ViewLines | null>(null);

export { getPliteStringDirectPlacement } from '../../dom/plugin/dom-geometry';

export const nearestViewText = ({
  editor,
  root,
  scopes,
  target,
  x,
  y,
}: Readonly<{
  editor: ReactRuntimeEditor;
  root: HTMLElement;
  scopes: ReadonlyArray<Readonly<{ path: Path; selector?: string }>>;
  target: Element | null;
  x: number;
  y: number;
}>): PliteStringRectHit | null => {
  const strings: HTMLElement[] = [];

  for (const { path, selector } of scopes) {
    const host = findMountedDOMNodeByPath(editor, path, root);
    const element = selector ? host?.querySelector(selector) : host;

    if (!element) continue;
    const pointerElement =
      target && element.contains(target)
        ? target.closest('[data-editor-node="element"]')
        : null;
    const pointerStrings =
      pointerElement &&
      pointerElement !== element &&
      element.contains(pointerElement)
        ? getOwnedPliteTextStrings(root, pointerElement)
        : [];

    if (pointerStrings.length > 0) {
      const hit = getNearestPliteStringRect({ strings: pointerStrings, x, y });

      return hit && { ...hit, horizontal: 0, vertical: 0 };
    }
    strings.push(...getOwnedPliteTextStrings(root, element));
  }

  return getNearestPliteStringRect({ strings, x, y });
};

export const placeOnViewText = (
  hit: PliteStringRectHit,
  { reach, x }: Readonly<{ reach: PlacementReach; x: number }>
) =>
  reach === 'press' && hit.vertical > PLITE_STRING_PRESS_REACH_PX
    ? null
    : getPliteStringPlacementAtX({ rect: hit.rect, string: hit.string, x });

import type { Locator } from '@playwright/test';

import { PLITE_BROWSER_HANDLE_KEY } from './constants';
import type {
  SelectionPoint,
  SelectionSnapshot,
  PliteBrowserDisplayedSelectionSnapshot,
} from './types';

/** Capture displayed selection overlays for one editor root. */
export const takeDisplayedSelectionSnapshotForRoot = async (
  root: Locator
): Promise<PliteBrowserDisplayedSelectionSnapshot> =>
  root.evaluate(
    (element: HTMLElement, { key }: { key: string }) => {
      const handle = (element as Record<string, any>)[key];
      const rootNode = element.getRootNode() as Document | ShadowRoot;
      const selection =
        'getSelection' in rootNode
          ? rootNode.getSelection()
          : element.ownerDocument.getSelection();
      const nativeText = (selection?.toString() ?? '').replace(/\uFEFF/g, '');
      const viewSelection = handle?.getViewSelection?.() ?? null;
      const markers = Array.from(
        element.querySelectorAll('[data-plite-view-selection="true"]')
      );
      const pointsEqual = (
        left: SelectionPoint | null | undefined,
        right: SelectionPoint | null | undefined
      ) =>
        !!left &&
        !!right &&
        left.offset === right.offset &&
        left.path.length === right.path.length &&
        left.path.every((part, index) => part === right.path[index]);
      const isExpanded = (range: SelectionSnapshot | null) =>
        !!range && !pointsEqual(range.anchor, range.focus);
      const getTextSegments = (owner: Element) =>
        Array.from(
          owner.querySelectorAll('[data-plite-string], [data-plite-zero-width]')
        ).map((segment) => {
          const leafNode = segment.firstChild;
          const domLength = leafNode?.textContent?.length ?? 0;
          const attr = segment.getAttribute('data-plite-length');
          const trueLength =
            attr == null ? domLength : Number.parseInt(attr, 10);

          return {
            segment,
            trueLength,
          };
        });
      const findZeroWidthMarker = (node: Node | null) => {
        const markerElement =
          node?.nodeType === 1 ? (node as Element) : node?.parentElement;

        return markerElement?.closest('[data-plite-zero-width]') ?? null;
      };
      const toEditorOffset = (node: Node | null, offset: number) => {
        const owner =
          node?.nodeType === 1
            ? (node as Element).closest('[data-plite-node="text"]')
            : node?.parentElement?.closest('[data-plite-node="text"]');
        const segment =
          node?.nodeType === 1
            ? (node as Element).closest(
                '[data-plite-string], [data-plite-zero-width]'
              )
            : node?.parentElement?.closest(
                '[data-plite-string], [data-plite-zero-width]'
              );

        const localOffset = findZeroWidthMarker(node) ? 0 : offset;

        if (!owner || !segment) {
          return localOffset;
        }

        const segments = getTextSegments(owner);
        const segmentIndex = segments.findIndex(
          (entry) => entry.segment === segment
        );

        if (segmentIndex <= 0) {
          return localOffset;
        }

        return (
          segments
            .slice(0, segmentIndex)
            .reduce((total, entry) => total + entry.trueLength, 0) + localOffset
        );
      };
      const getPath = (node: Node | null) => {
        const owner =
          node?.nodeType === 1
            ? (node as Element).closest('[data-plite-node="text"]')
            : node?.parentElement?.closest('[data-plite-node="text"]');

        if (!owner || !element.contains(owner)) {
          return null;
        }

        const path = owner
          .getAttribute('data-plite-path')
          ?.split(',')
          .map((part) => Number.parseInt(part, 10));

        return path?.every(Number.isInteger) ? path : null;
      };
      const takeNativeSelection = (): SelectionSnapshot | null => {
        if (
          !selection?.rangeCount ||
          !selection.anchorNode ||
          !selection.focusNode ||
          !element.contains(selection.anchorNode) ||
          !element.contains(selection.focusNode)
        ) {
          return null;
        }

        const anchorPath = getPath(selection.anchorNode);
        const focusPath = getPath(selection.focusNode);

        if (!anchorPath || !focusPath) {
          return null;
        }

        return {
          anchor: {
            offset: toEditorOffset(
              selection.anchorNode,
              selection.anchorOffset
            ),
            path: anchorPath,
          },
          focus: {
            offset: toEditorOffset(selection.focusNode, selection.focusOffset),
            path: focusPath,
          },
        };
      };
      const toViewPoint = (pointLike: any): SelectionPoint | null => {
        const point = pointLike?.point ?? pointLike;

        return Array.isArray(point?.path) && Number.isInteger(point?.offset)
          ? { offset: point.offset, path: [...point.path] }
          : null;
      };
      const nativeSelection = takeNativeSelection();
      const viewAnchor = toViewPoint(viewSelection?.anchor);
      const viewFocus = toViewPoint(viewSelection?.focus);
      const hasNativeEditorSelection =
        !!nativeSelection && nativeText.length > 0;
      const normalizedViewSelection =
        viewAnchor && viewFocus
          ? {
              anchor: viewAnchor,
              focus: viewFocus,
            }
          : null;
      const source =
        isExpanded(nativeSelection) ||
        (nativeSelection && !normalizedViewSelection)
          ? 'native'
          : normalizedViewSelection
            ? 'view'
            : nativeSelection
              ? 'native'
              : 'none';

      return {
        displayed:
          source === 'native'
            ? nativeSelection
            : source === 'view'
              ? normalizedViewSelection
              : null,
        doubleHighlighted: hasNativeEditorSelection && markers.length > 0,
        hasVisibleEditorSelection:
          hasNativeEditorSelection || markers.length > 0,
        hasVisibleSelection: nativeText.length > 0 || markers.length > 0,
        model: handle?.getSelection?.() ?? null,
        native: {
          collapsed: selection?.isCollapsed ?? null,
          rangeCount: selection?.rangeCount ?? 0,
          selection: nativeSelection,
          textLength: nativeText.length,
        },
        source,
        view: {
          active: !!normalizedViewSelection,
          anchor: viewAnchor,
          focus: viewFocus,
          markerCount: markers.length,
          markerPaths: markers.map(
            (marker) =>
              marker
                .closest('[data-plite-node="text"]')
                ?.getAttribute('data-plite-path') ?? null
          ),
          markerRects: markers.map((marker) => {
            const rect = marker.getBoundingClientRect();

            return {
              height: rect.height,
              width: rect.width,
              x: rect.x,
              y: rect.y,
            };
          }),
          selection: normalizedViewSelection,
          textLength: markers.reduce(
            (length, marker) =>
              length + (marker.textContent ?? '').replace(/\uFEFF/g, '').length,
            0
          ),
        },
      } satisfies PliteBrowserDisplayedSelectionSnapshot;
    },
    { key: PLITE_BROWSER_HANDLE_KEY }
  );

import type { Path, NodeKey } from '@platejs/plite';
import { DOMCoverage } from '@platejs/plite-dom/internal';
import React from 'react';

import { useEditor } from '../hooks/use-editor';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

export const DOMStrategyVirtualizedRangeBoundary = React.memo(
  ({
    anchorNodeKey,
    boundaryId,
    endIndex,
    focusNodeKey,
    startIndex,
  }: {
    anchorNodeKey: NodeKey | null;
    boundaryId: string;
    endIndex: number;
    focusNodeKey: NodeKey | null;
    startIndex: number;
  }) => {
    const editor = useEditor();
    const boundary = React.useMemo(
      () => ({
        anchor: { type: 'placeholder' as const },
        boundaryId,
        copyPolicy: 'model' as const,
        coveredPathRanges: [
          {
            anchor: [startIndex] as Path,
            focus: [endIndex] as Path,
          },
        ],
        coveredRuntimeRanges:
          anchorNodeKey && focusNodeKey
            ? [{ anchor: anchorNodeKey, focus: focusNodeKey }]
            : [],
        findPolicy: 'native' as const,
        ownerPath: [] as Path,
        ownerNodeKey: null,
        reason: 'viewport-virtualization' as const,
        selectionPolicy: 'materialize' as const,
        state: 'virtualized' as const,
        version: 1,
      }),
      [anchorNodeKey, boundaryId, endIndex, focusNodeKey, startIndex]
    );

    useIsomorphicLayoutEffect(
      () => DOMCoverage.registerBoundary(editor, boundary),
      [boundary, editor]
    );

    return (
      <div
        aria-hidden="true"
        contentEditable={false}
        data-plite-dom-coverage-boundary={boundaryId}
        data-plite-dom-coverage-edge="owner"
        data-plite-dom-strategy-virtualized-boundary="true"
        hidden
      />
    );
  }
);

DOMStrategyVirtualizedRangeBoundary.displayName =
  'DOMStrategyVirtualizedRangeBoundary';

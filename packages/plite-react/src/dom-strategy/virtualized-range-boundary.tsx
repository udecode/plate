import React from 'react';
import type { Path, RuntimeId } from '@platejs/plite';
import { DOMCoverage } from '@platejs/plite-dom/internal';

import { useEditor } from '../hooks/use-editor';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

export const DOMStrategyVirtualizedRangeBoundary = React.memo(
  ({
    anchorRuntimeId,
    boundaryId,
    endIndex,
    focusRuntimeId,
    startIndex,
  }: {
    anchorRuntimeId: RuntimeId | null;
    boundaryId: string;
    endIndex: number;
    focusRuntimeId: RuntimeId | null;
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
          anchorRuntimeId && focusRuntimeId
            ? [{ anchor: anchorRuntimeId, focus: focusRuntimeId }]
            : [],
        findPolicy: 'native' as const,
        ownerPath: [] as Path,
        ownerRuntimeId: null,
        reason: 'viewport-virtualization' as const,
        selectionPolicy: 'materialize' as const,
        state: 'virtualized' as const,
        version: 1,
      }),
      [anchorRuntimeId, boundaryId, endIndex, focusRuntimeId, startIndex]
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

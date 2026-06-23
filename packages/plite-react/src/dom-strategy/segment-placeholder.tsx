import type { CSSProperties } from 'react';
import React, { useCallback } from 'react';
import type {
  Descendant,
  EditorCommit,
  Operation,
  Path,
  RuntimeId,
  Editor as EditorType,
} from '@platejs/plite';
import type {
  DOMCoverageReason,
  DOMCoverageSelectionPolicy,
} from '@platejs/plite-dom/internal';
import { DOMCoverage, IS_COMPOSING } from '@platejs/plite-dom/internal';
import { Editor } from '../editable/runtime-editor-api';

import { readRuntimeNode } from '../editable/runtime-live-state';
import { useEditor } from '../hooks/use-editor';
import { useEditorSelector } from '../hooks/use-editor-selector';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import {
  classifySegmentKind,
  type DOMStrategySegmentKind,
} from './classify-segment-kind';

const isText = (
  value: Descendant
): value is Extract<Descendant, { text: string }> =>
  typeof (value as { text?: unknown }).text === 'string';

const getDescendantText = (node: Descendant): string => {
  if (isText(node)) {
    return node.text;
  }

  return node.children.map(getDescendantText).join('');
};

const truncate = (value: string, limit: number) =>
  value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;

const MAX_PREVIEW_LINES = 3;

type SegmentPreview = {
  kind: DOMStrategySegmentKind;
  lines: readonly string[];
};

const shellStyle = {
  borderLeft: '2px solid rgba(148, 163, 184, 0.35)',
  contain: 'layout style paint',
  contentVisibility: 'auto',
  paddingLeft: 12,
} satisfies CSSProperties;

const sameRuntimeIds = (
  left: readonly RuntimeId[],
  right: readonly RuntimeId[]
) => {
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }

  return true;
};

const sameSegmentPreview = (
  left: SegmentPreview | null,
  right: SegmentPreview
) =>
  left != null &&
  left.kind === right.kind &&
  left.lines.length === right.lines.length &&
  left.lines.every((line, index) => line === right.lines[index]);

const topLevelRangesOverlap = (
  ranges: readonly (readonly [number, number])[] | null | undefined,
  startIndex: number,
  endIndex: number
) =>
  ranges == null ||
  ranges.some(([start, end]) => start <= endIndex && end >= startIndex);

const shouldRefreshPreview = ({
  endIndex,
  startIndex,
}: {
  endIndex: number;
  startIndex: number;
}) => {
  const previewEndIndex = Math.min(
    endIndex,
    startIndex + MAX_PREVIEW_LINES - 1
  );

  return (_operations?: readonly Operation[], change?: EditorCommit) => {
    if (!change) {
      return true;
    }

    if (
      change.fullDocumentChanged ||
      change.rootRuntimeIdsChanged ||
      change.topLevelOrderChanged
    ) {
      return true;
    }

    return (
      (change.structureChanged || change.textChanged) &&
      topLevelRangesOverlap(
        change.dirtyTopLevelRanges,
        startIndex,
        previewEndIndex
      )
    );
  };
};

export const DOMStrategySegmentPlaceholder = React.memo(
  ({
    coverageReason = 'partial-dom-aggressive',
    boundaryId: explicitBoundaryId,
    dataSegment,
    endIndex,
    segmentIndex,
    onPromote,
    previewChars,
    runtimeIds,
    startIndex,
  }: {
    coverageReason?: Extract<
      DOMCoverageReason,
      'partial-dom-aggressive' | 'viewport-virtualization'
    >;
    boundaryId?: string;
    dataSegment?: string;
    endIndex: number;
    segmentIndex: number;
    onPromote?: (
      segmentIndex: number,
      options?: { select?: boolean; startIndex?: number }
    ) => void;
    previewChars: number;
    runtimeIds: readonly RuntimeId[];
    startIndex: number;
  }) => {
    const editor = useEditor();
    const previewRuntimeIds = React.useMemo(
      () => runtimeIds.slice(0, MAX_PREVIEW_LINES),
      [runtimeIds]
    );
    const boundaryId =
      explicitBoundaryId ?? `${coverageReason}:${segmentIndex}`;
    const anchorRuntimeId = runtimeIds[0] ?? null;
    const focusRuntimeId = runtimeIds.at(-1) ?? null;
    const selectionPolicy: DOMCoverageSelectionPolicy =
      coverageReason === 'viewport-virtualization' ? 'materialize' : 'model';
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
        reason: coverageReason,
        selectionPolicy,
        state: 'virtualized' as const,
        version: 1,
      }),
      [
        anchorRuntimeId,
        boundaryId,
        coverageReason,
        endIndex,
        focusRuntimeId,
        selectionPolicy,
        startIndex,
      ]
    );

    useIsomorphicLayoutEffect(
      () => DOMCoverage.registerBoundary(editor, boundary),
      [boundary, editor]
    );

    const selectPreview = React.useCallback(
      (editorValue: EditorType): SegmentPreview => {
        const lines: string[] = [];
        const nodes: Descendant[] = [];

        previewRuntimeIds.forEach((runtimeId) => {
          const snapshot = Editor.getSnapshot(editorValue);
          const path =
            Editor.getPathByRuntimeId(editorValue, runtimeId) ??
            snapshot.index.idToPath[runtimeId];

          if (!path || !Editor.hasPath(editorValue, path)) {
            return;
          }

          const node =
            (readRuntimeNode(editorValue, path) as Descendant | undefined) ??
            (editorValue.read(
              (state) => state.nodes.get(path)[0]
            ) as Descendant);

          if (!node) {
            return;
          }

          nodes.push(node);
          lines.push(
            truncate(
              getDescendantText(node).replace(/\uFEFF/g, ''),
              previewChars
            )
          );
        });

        return {
          kind: classifySegmentKind(nodes),
          lines,
        };
      },
      [previewChars, previewRuntimeIds]
    );
    const shouldUpdatePreview = React.useMemo(
      () => shouldRefreshPreview({ endIndex, startIndex }),
      [endIndex, startIndex]
    );
    const preview = useEditorSelector(selectPreview, sameSegmentPreview, {
      includeRootOrderChanges: true,
      profileId: 'dom-strategy-partial-dom-preview',
      runtimeIds: previewRuntimeIds,
      shouldUpdate: shouldUpdatePreview,
    });

    const handleMouseDown = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (IS_COMPOSING.get(editor)) {
          return;
        }

        const editorElement = event.currentTarget.closest(
          '[data-plite-editor="true"]'
        ) as HTMLElement | null;
        editorElement?.focus();
        onPromote?.(segmentIndex, { select: true, startIndex });
      },
      [editor, segmentIndex, onPromote, startIndex]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return;
        }

        event.preventDefault();

        if (IS_COMPOSING.get(editor)) {
          return;
        }

        const editorElement = event.currentTarget.closest(
          '[data-plite-editor="true"]'
        ) as HTMLElement | null;
        editorElement?.focus();
        onPromote?.(segmentIndex, { select: true, startIndex });
      },
      [editor, segmentIndex, onPromote, startIndex]
    );

    const firstLine = preview.lines[0];
    const label = firstLine
      ? `Open document section ${segmentIndex + 1}: ${firstLine}`
      : `Open document section ${segmentIndex + 1}`;

    return (
      <div
        aria-expanded={false}
        aria-label={label}
        contentEditable={false}
        data-plite-dom-coverage-boundary={boundaryId}
        data-plite-dom-coverage-edge="owner"
        data-plite-dom-strategy-kind={preview.kind}
        data-plite-dom-strategy-placeholder="true"
        data-plite-dom-strategy-segment={dataSegment ?? String(segmentIndex)}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        role="button"
        style={{
          ...shellStyle,
          containIntrinsicSize: `${Math.max(runtimeIds.length, 1) * 28}px`,
        }}
        tabIndex={0}
      >
        {preview.lines.map((line, index) => (
          <div
            data-plite-dom-strategy-line="true"
            key={`${previewRuntimeIds[index] ?? segmentIndex}-${index}`}
          >
            {line || '\u00A0'}
          </div>
        ))}
      </div>
    );
  },
  (prev, next) =>
    prev.segmentIndex === next.segmentIndex &&
    prev.boundaryId === next.boundaryId &&
    prev.dataSegment === next.dataSegment &&
    prev.startIndex === next.startIndex &&
    prev.endIndex === next.endIndex &&
    prev.coverageReason === next.coverageReason &&
    prev.onPromote === next.onPromote &&
    prev.previewChars === next.previewChars &&
    sameRuntimeIds(prev.runtimeIds, next.runtimeIds)
);

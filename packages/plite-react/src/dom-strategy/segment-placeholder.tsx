import type {
  Descendant,
  EditorCommit,
  Path,
  NodeKey,
  Editor as EditorType,
} from '@platejs/plite';
import { NodeApi } from '@platejs/plite';
import type {
  DOMCoverageReason,
  DOMCoverageSelectionPolicy,
} from '@platejs/plite-dom/internal';
import { DOMCoverage, IS_COMPOSING } from '@platejs/plite-dom/internal';
import type { CSSProperties } from 'react';
import React, { useCallback } from 'react';

import {
  getSnapshot as editorGetSnapshot,
  getPathByNodeKey as editorGetPathByNodeKey,
  hasPath as editorHasPath,
} from '../editable/runtime-editor-api';
import { readRuntimeNode } from '../editable/runtime-live-state';
import { useEditor } from '../hooks/use-editor';
import { useEditorSelector } from '../hooks/use-editor-selector';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

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
  lines: readonly string[];
};

const shellStyle = {
  borderLeft: '2px solid rgba(148, 163, 184, 0.35)',
  contain: 'layout style paint',
  contentVisibility: 'auto',
  paddingLeft: 12,
} satisfies CSSProperties;

const sameNodeKeys = (left: readonly NodeKey[], right: readonly NodeKey[]) => {
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
  left.lines.length === right.lines.length &&
  left.lines.every((line, index) => line === right.lines[index]);

const topLevelRangesOverlap = (
  ranges: ReadonlyArray<readonly [number, number]>,
  startIndex: number,
  endIndex: number
) => ranges.some(([start, end]) => start <= endIndex && end >= startIndex);

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

  return (change?: EditorCommit) => {
    if (!change) {
      return true;
    }

    if (change.changed.hasAny('root-order')) {
      return true;
    }

    return (
      (change.changed.hasAny('structure') || change.changed.hasAny('text')) &&
      topLevelRangesOverlap(
        change.changed.topLevelRanges(),
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
    nodeKeys,
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
    nodeKeys: readonly NodeKey[];
    startIndex: number;
  }) => {
    const editor = useEditor();
    const previewNodeKeys = React.useMemo(
      () => nodeKeys.slice(0, MAX_PREVIEW_LINES),
      [nodeKeys]
    );
    const boundaryId =
      explicitBoundaryId ?? `${coverageReason}:${segmentIndex}`;
    const anchorNodeKey = nodeKeys[0] ?? null;
    const focusNodeKey = nodeKeys.at(-1) ?? null;
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
          anchorNodeKey && focusNodeKey
            ? [{ anchor: anchorNodeKey, focus: focusNodeKey }]
            : [],
        findPolicy: 'native' as const,
        ownerPath: [] as Path,
        ownerNodeKey: null,
        reason: coverageReason,
        selectionPolicy,
        state: 'virtualized' as const,
        version: 1,
      }),
      [
        anchorNodeKey,
        boundaryId,
        coverageReason,
        endIndex,
        focusNodeKey,
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

        previewNodeKeys.forEach((nodeKey) => {
          const snapshot = editorGetSnapshot(editorValue);
          const path =
            editorGetPathByNodeKey(editorValue, nodeKey) ??
            snapshot.index.pathOf(nodeKey);

          if (!path || !editorHasPath(editorValue, path)) {
            return;
          }

          const node =
            (readRuntimeNode(editorValue, path) as Descendant | undefined) ??
            editorValue.read((state) => {
              const candidate = state.nodes.get(path)?.[0];

              return candidate && NodeApi.isDescendant(candidate)
                ? candidate
                : undefined;
            });

          if (!node) {
            return;
          }

          lines.push(
            truncate(
              getDescendantText(node).replace(/\uFEFF/g, ''),
              previewChars
            )
          );
        });

        return {
          lines,
        };
      },
      [previewChars, previewNodeKeys]
    );
    const shouldUpdatePreview = React.useMemo(
      () => shouldRefreshPreview({ endIndex, startIndex }),
      [endIndex, startIndex]
    );
    const preview = useEditorSelector(selectPreview, {
      equalityFn: sameSegmentPreview,
      includeRootOrderChanges: true,
      profileId: 'dom-strategy-partial-dom-preview',
      nodeKeys: previewNodeKeys,
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
        data-plite-dom-strategy-placeholder="true"
        data-plite-dom-strategy-segment={dataSegment ?? String(segmentIndex)}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        role="button"
        style={{
          ...shellStyle,
          containIntrinsicSize: `${Math.max(nodeKeys.length, 1) * 28}px`,
        }}
        tabIndex={0}
      >
        {preview.lines.map((line, index) => (
          <div
            data-plite-dom-strategy-line="true"
            key={`${previewNodeKeys[index] ?? segmentIndex}-${index}`}
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
    sameNodeKeys(prev.nodeKeys, next.nodeKeys)
);

DOMStrategySegmentPlaceholder.displayName = 'DOMStrategySegmentPlaceholder';

import * as React from 'react';

import type { Range as ModelRange } from '../..';
import type {
  DOMCoverageBoundary,
  DOMCoverageCopyPolicy,
  DOMCoverageMaterializeRangeRole,
  DOMCoverageMaterializeReason,
  DOMCoverageReason,
  DOMCoverageSelectionPolicy,
} from '../../dom/internal';
import { ElementContext } from '../context';
import {
  getNodeKey as editorGetNodeKey,
  failInvariant,
} from '../editable/runtime-editor-api';
import {
  useClaimEditableDOMCommit,
  useClaimEditableDOMInsertionCommit,
  useEditableDOMRuntime,
} from '../hooks/use-claim-editable-dom-commit';
import { useEditorContext } from '../hooks/use-editor-context';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { ImperativeTextFlowContext } from './editable-text-flow';

export type DOMCoverageBoundaryMaterializePayload = {
  boundary: DOMCoverageBoundary;
  range?: ModelRange;
  rangeRole?: DOMCoverageMaterializeRangeRole;
  reason: DOMCoverageMaterializeReason;
};

export const DOMCoverageBoundaryRange = ({
  boundaryId,
  children,
  content,
  copyPolicy = 'model',
  from,
  hidden = true,
  onMaterialize,
  reason = 'app-collapse',
  selectionPolicy = 'skip',
  to = from,
}: {
  boundaryId: string;
  children?: React.ReactNode;
  content?: React.ReactNode;
  copyPolicy?: DOMCoverageCopyPolicy;
  hidden?: boolean;
  onMaterialize?: (payload: DOMCoverageBoundaryMaterializePayload) => void;
  reason?: DOMCoverageReason;
  selectionPolicy?: DOMCoverageSelectionPolicy;
} & {
  from: number;
  to?: number;
}) => {
  const editor = useEditorContext();
  const coverage = useEditableDOMRuntime()?.domCoverage;
  const owner = React.useContext(ElementContext);
  const ownerPath = owner?.path ?? null;
  const ownerNodeKey = owner?.nodeKey ?? null;

  useClaimEditableDOMCommit();
  useClaimEditableDOMInsertionCommit();

  const anchorPath = ownerPath ? [...ownerPath, from] : null;
  const focusPath = ownerPath ? [...ownerPath, to] : null;
  const anchorNodeKey = anchorPath
    ? editorGetNodeKey(editor, anchorPath)
    : null;
  const focusNodeKey = focusPath ? editorGetNodeKey(editor, focusPath) : null;
  const boundary =
    ownerPath && ownerNodeKey
      ? {
          anchor: { type: 'placeholder' as const },
          boundaryId,
          copyPolicy,
          coveredPathRanges: [
            {
              anchor:
                anchorPath ?? failInvariant('Expected value to be defined'),
              focus: focusPath ?? failInvariant('Expected value to be defined'),
            },
          ],
          coveredRuntimeRanges:
            anchorNodeKey && focusNodeKey
              ? [{ anchor: anchorNodeKey, focus: focusNodeKey }]
              : [],
          ownerPath,
          ownerNodeKey,
          reason,
          selectionPolicy,
          state: 'intentionally-hidden' as const,
          version: 1,
        }
      : null;

  useIsomorphicLayoutEffect(() => {
    if (!hidden || !boundary) {
      return undefined;
    }

    return coverage?.registerBoundary(boundary);
  }, [boundary, coverage, hidden]);

  useIsomorphicLayoutEffect(() => {
    if (!hidden || !boundary || !onMaterialize) {
      return undefined;
    }

    return coverage?.registerMaterializeHandler(
      (targetBoundary, materializeReason, options) => {
        if (targetBoundary.boundaryId !== boundary.boundaryId) {
          return false;
        }

        onMaterialize({
          boundary: targetBoundary,
          range: options.range,
          rangeRole: options.rangeRole,
          reason: materializeReason,
        });

        return true;
      }
    );
  }, [boundary, coverage, hidden, onMaterialize]);

  if (!hidden) {
    return (
      <ImperativeTextFlowContext.Provider value={false}>
        {content}
      </ImperativeTextFlowContext.Provider>
    );
  }

  return (
    <span
      contentEditable={false}
      data-editor-dom-coverage-boundary={boundaryId}
      data-editor-dom-coverage-edge="anchor"
    >
      {children}
    </span>
  );
};

export const DOMCoverageSelfBoundary = ({
  boundaryId,
  children,
  content,
  copyPolicy = 'exclude',
  hidden = true,
  onMaterialize,
  reason = 'app-hidden',
  selectionPolicy = 'skip',
}: {
  boundaryId: string;
  children?: React.ReactNode;
  content?: React.ReactNode;
  copyPolicy?: DOMCoverageCopyPolicy;
  hidden?: boolean;
  onMaterialize?: (payload: DOMCoverageBoundaryMaterializePayload) => void;
  reason?: DOMCoverageReason;
  selectionPolicy?: DOMCoverageSelectionPolicy;
}) => {
  const coverage = useEditableDOMRuntime()?.domCoverage;
  const owner = React.useContext(ElementContext);
  const ownerPath = owner?.path ?? null;
  const ownerNodeKey = owner?.nodeKey ?? null;

  useClaimEditableDOMCommit();
  useClaimEditableDOMInsertionCommit();

  const boundary =
    ownerPath && ownerNodeKey
      ? {
          anchor: { type: 'placeholder' as const },
          boundaryId,
          copyPolicy,
          coveredPathRanges: [{ anchor: ownerPath, focus: ownerPath }],
          coveredRuntimeRanges: [{ anchor: ownerNodeKey, focus: ownerNodeKey }],
          ownerPath,
          ownerNodeKey,
          reason,
          selectionPolicy,
          state: 'intentionally-hidden' as const,
          version: 1,
        }
      : null;

  useIsomorphicLayoutEffect(() => {
    if (!hidden || !boundary) {
      return undefined;
    }

    return coverage?.registerBoundary(boundary);
  }, [boundary, coverage, hidden]);

  useIsomorphicLayoutEffect(() => {
    if (!hidden || !boundary || !onMaterialize) {
      return undefined;
    }

    return coverage?.registerMaterializeHandler(
      (targetBoundary, materializeReason, options) => {
        if (targetBoundary.boundaryId !== boundary.boundaryId) {
          return false;
        }

        onMaterialize({
          boundary: targetBoundary,
          range: options.range,
          rangeRole: options.rangeRole,
          reason: materializeReason,
        });

        return true;
      }
    );
  }, [boundary, coverage, hidden, onMaterialize]);

  if (!hidden) {
    return (
      <ImperativeTextFlowContext.Provider value={false}>
        {content}
      </ImperativeTextFlowContext.Provider>
    );
  }

  return (
    <span
      contentEditable={false}
      data-editor-dom-coverage-boundary={boundaryId}
      data-editor-dom-coverage-edge="owner"
    >
      {children}
    </span>
  );
};

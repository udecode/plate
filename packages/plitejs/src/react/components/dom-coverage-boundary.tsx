import * as React from 'react';

import type { Range as PliteRange } from '../..';
import type {
  DOMCoverageBoundary,
  DOMCoverageCopyPolicy,
  DOMCoverageFindPolicy,
  DOMCoverageMaterializeRangeRole,
  DOMCoverageMaterializeReason,
  DOMCoverageReason,
  DOMCoverageSelectionPolicy,
} from '../../dom/internal';
import { DOMCoverage } from '../../dom/internal';
import { ElementPathContext, NodeKeyContext } from '../context';
import {
  getNodeKey as editorGetNodeKey,
  failInvariant,
} from '../editable/runtime-editor-api';
import { useClaimEditableDOMCommit } from '../hooks/use-claim-editable-dom-commit';
import { useEditorContext } from '../hooks/use-editor-context';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

type DOMCoverageBoundaryBaseProps = {
  boundaryId: string;
  children?: React.ReactNode;
  content?: React.ReactNode;
  copyPolicy?: DOMCoverageCopyPolicy;
  findPolicy?: DOMCoverageFindPolicy;
  hidden?: boolean;
  onMaterialize?: (payload: DOMCoverageBoundaryMaterializePayload) => void;
  reason?: DOMCoverageReason;
  selectionPolicy?: DOMCoverageSelectionPolicy;
};

export type DOMCoverageBoundaryMaterializePayload = {
  boundary: DOMCoverageBoundary;
  range?: PliteRange;
  rangeRole?: DOMCoverageMaterializeRangeRole;
  reason: DOMCoverageMaterializeReason;
};

export type DOMCoverageBoundaryRangeProps = DOMCoverageBoundaryBaseProps & {
  from: number;
  to?: number;
};

export const DOMCoverageBoundaryRange = ({
  boundaryId,
  children,
  content,
  copyPolicy = 'model',
  findPolicy = 'native',
  from,
  hidden = true,
  onMaterialize,
  reason = 'app-collapse',
  selectionPolicy = 'skip',
  to = from,
}: DOMCoverageBoundaryRangeProps) => {
  const editor = useEditorContext();
  const ownerPath = React.useContext(ElementPathContext);
  const ownerNodeKey = React.useContext(NodeKeyContext);

  useClaimEditableDOMCommit();

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
          findPolicy,
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

    return DOMCoverage.registerBoundary(editor, boundary);
  }, [boundary, editor, hidden]);

  useIsomorphicLayoutEffect(() => {
    if (!hidden || !boundary || !onMaterialize) {
      return undefined;
    }

    return DOMCoverage.registerMaterializeHandler(
      editor,
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
  }, [boundary, editor, hidden, onMaterialize]);

  if (!hidden) {
    return <>{content}</>;
  }

  return (
    <span
      contentEditable={false}
      data-plite-dom-coverage-boundary={boundaryId}
      data-plite-dom-coverage-edge="anchor"
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
  findPolicy = 'native',
  hidden = true,
  onMaterialize,
  reason = 'app-hidden',
  selectionPolicy = 'skip',
}: DOMCoverageBoundaryBaseProps) => {
  const editor = useEditorContext();
  const ownerPath = React.useContext(ElementPathContext);
  const ownerNodeKey = React.useContext(NodeKeyContext);

  useClaimEditableDOMCommit();

  const boundary =
    ownerPath && ownerNodeKey
      ? {
          anchor: { type: 'placeholder' as const },
          boundaryId,
          copyPolicy,
          coveredPathRanges: [{ anchor: ownerPath, focus: ownerPath }],
          coveredRuntimeRanges: [{ anchor: ownerNodeKey, focus: ownerNodeKey }],
          findPolicy,
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

    return DOMCoverage.registerBoundary(editor, boundary);
  }, [boundary, editor, hidden]);

  useIsomorphicLayoutEffect(() => {
    if (!hidden || !boundary || !onMaterialize) {
      return undefined;
    }

    return DOMCoverage.registerMaterializeHandler(
      editor,
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
  }, [boundary, editor, hidden, onMaterialize]);

  if (!hidden) {
    return <>{content}</>;
  }

  return (
    <span
      contentEditable={false}
      data-plite-dom-coverage-boundary={boundaryId}
      data-plite-dom-coverage-edge="owner"
    >
      {children}
    </span>
  );
};

import type { ReactNode } from 'react';
import { useContext } from 'react';
import type { Range as PliteRange } from '@platejs/plite';
import type {
  DOMCoverageBoundary,
  DOMCoverageCopyPolicy,
  DOMCoverageFindPolicy,
  DOMCoverageMaterializeRangeRole,
  DOMCoverageMaterializeReason,
  DOMCoverageReason,
  DOMCoverageSelectionPolicy,
} from '@platejs/plite-dom/internal';
import { DOMCoverage } from '@platejs/plite-dom/internal';

import { ElementPathContext, NodeRuntimeIdContext } from '../context';
import { getRuntimeId as editorGetRuntimeId } from '../editable/runtime-editor-api';
import { useEditor } from '../hooks/use-editor';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

type DOMCoverageBoundaryBaseProps = {
  boundaryId: string;
  children?: ReactNode;
  content?: ReactNode;
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
  const editor = useEditor();
  const ownerPath = useContext(ElementPathContext);
  const ownerRuntimeId = useContext(NodeRuntimeIdContext);
  const anchorPath = ownerPath ? [...ownerPath, from] : null;
  const focusPath = ownerPath ? [...ownerPath, to] : null;
  const anchorRuntimeId = anchorPath
    ? editorGetRuntimeId(editor, anchorPath)
    : null;
  const focusRuntimeId = focusPath
    ? editorGetRuntimeId(editor, focusPath)
    : null;
  const boundary =
    ownerPath && ownerRuntimeId
      ? {
          anchor: { type: 'placeholder' as const },
          boundaryId,
          copyPolicy,
          coveredPathRanges: [
            {
              anchor: anchorPath!,
              focus: focusPath!,
            },
          ],
          coveredRuntimeRanges:
            anchorRuntimeId && focusRuntimeId
              ? [{ anchor: anchorRuntimeId, focus: focusRuntimeId }]
              : [],
          findPolicy,
          ownerPath,
          ownerRuntimeId,
          reason,
          selectionPolicy,
          state: 'intentionally-hidden' as const,
          version: 1,
        }
      : null;

  useIsomorphicLayoutEffect(() => {
    if (!hidden || !boundary) {
      return;
    }

    return DOMCoverage.registerBoundary(editor, boundary);
  }, [boundary, editor, hidden]);

  useIsomorphicLayoutEffect(() => {
    if (!hidden || !boundary || !onMaterialize) {
      return;
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
  const editor = useEditor();
  const ownerPath = useContext(ElementPathContext);
  const ownerRuntimeId = useContext(NodeRuntimeIdContext);
  const boundary =
    ownerPath && ownerRuntimeId
      ? {
          anchor: { type: 'placeholder' as const },
          boundaryId,
          copyPolicy,
          coveredPathRanges: [{ anchor: ownerPath, focus: ownerPath }],
          coveredRuntimeRanges: [
            { anchor: ownerRuntimeId, focus: ownerRuntimeId },
          ],
          findPolicy,
          ownerPath,
          ownerRuntimeId,
          reason,
          selectionPolicy,
          state: 'intentionally-hidden' as const,
          version: 1,
        }
      : null;

  useIsomorphicLayoutEffect(() => {
    if (!hidden || !boundary) {
      return;
    }

    return DOMCoverage.registerBoundary(editor, boundary);
  }, [boundary, editor, hidden]);

  useIsomorphicLayoutEffect(() => {
    if (!hidden || !boundary || !onMaterialize) {
      return;
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

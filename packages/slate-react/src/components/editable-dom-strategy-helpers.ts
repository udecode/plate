import type { EditorSnapshot, Path, RuntimeId } from '@platejs/slate';

import type { DOMStrategyOptions } from '../dom-strategy/create-segment-plan';
import type { DOMStrategyVirtualizedConfig } from '../dom-strategy/use-virtualized-root-plan';
import type { DOMStrategyRootConfig } from '../editable/root-selector-sources';
import type {
  SlateProjectionRuntimeScope,
  SlateSourceDirtinessContext,
} from '../projection-store';
import type { EditableDOMStrategyCohort } from './editable';

export const ROOT_GROUP_THRESHOLD = 1000;
export const INTERNAL_PARTIAL_DOM_SEGMENT_SIZE = 32;
export const INTERNAL_PARTIAL_DOM_PROMOTION_WINDOW_SIZE = 8;

export const getSnapshotPathKey = (path: Path) => path.join('.');

export const resolveProjectionRuntimeScope = (
  runtimeScope: SlateProjectionRuntimeScope | undefined,
  context: SlateSourceDirtinessContext
) => {
  if (!runtimeScope) {
    return null;
  }

  return typeof runtimeScope === 'function'
    ? runtimeScope(context)
    : runtimeScope;
};

export const mergeMountedRuntimeScope = (
  snapshot: EditorSnapshot,
  explicitRuntimeScope: readonly RuntimeId[] | null,
  mountedRuntimeScope: readonly RuntimeId[] | null
) => {
  if (!mountedRuntimeScope) {
    return explicitRuntimeScope;
  }

  if (!explicitRuntimeScope) {
    return mountedRuntimeScope;
  }

  const mountedTopLevelRuntimeIds = new Set(mountedRuntimeScope);

  return explicitRuntimeScope.filter((runtimeId) => {
    const path = snapshot.index.idToPath[runtimeId];
    const topLevelPath = path ? [path[0]] : null;
    const topLevelRuntimeId =
      topLevelPath && typeof topLevelPath[0] === 'number'
        ? snapshot.index.pathToId[getSnapshotPathKey(topLevelPath)]
        : null;

    return topLevelRuntimeId
      ? mountedTopLevelRuntimeIds.has(topLevelRuntimeId)
      : mountedTopLevelRuntimeIds.has(runtimeId);
  });
};

type InternalPartialDOMStrategyOptions = {
  overscan?: number;
  previewChars?: number;
  segmentSize?: number;
  threshold?: number;
  type: 'partial-dom';
};

type InternalDOMStrategyOptions =
  | DOMStrategyOptions
  | InternalPartialDOMStrategyOptions;

export const getDOMStrategyType = (
  domStrategyOptions: InternalDOMStrategyOptions | null | undefined
) =>
  typeof domStrategyOptions === 'string'
    ? domStrategyOptions
    : (domStrategyOptions?.type ?? 'auto');

export const getInternalPartialDOMStrategyOptions = (
  domStrategyOptions: InternalDOMStrategyOptions | null | undefined
) =>
  typeof domStrategyOptions === 'object' && domStrategyOptions != null
    ? domStrategyOptions.type === 'partial-dom'
      ? domStrategyOptions
      : null
    : null;

export const getVirtualizedDOMStrategyOptions = (
  domStrategyOptions: DOMStrategyOptions | null | undefined
) =>
  typeof domStrategyOptions === 'object' && domStrategyOptions != null
    ? domStrategyOptions.type === 'virtualized'
      ? domStrategyOptions
      : null
    : null;

export const isInternalSegmentDOMStrategy = (
  type: ReturnType<typeof getDOMStrategyType>
) => type === 'partial-dom';

export const getInternalSegmentDOMStrategyConfig = ({
  domStrategyType,
  overscan,
  previewChars,
  segmentSize,
  threshold,
}: {
  domStrategyType: ReturnType<typeof getDOMStrategyType>;
  overscan: number;
  previewChars: number;
  segmentSize: number;
  threshold: number;
}): DOMStrategyRootConfig | null =>
  isInternalSegmentDOMStrategy(domStrategyType) || domStrategyType === 'auto'
    ? {
        overscan: Math.max(0, overscan),
        previewChars: Math.max(16, previewChars),
        promotionWindowSize: Math.min(
          Math.max(1, INTERNAL_PARTIAL_DOM_PROMOTION_WINDOW_SIZE),
          Math.max(1, segmentSize)
        ),
        segmentSize: Math.max(1, segmentSize),
        threshold:
          domStrategyType === 'auto'
            ? ROOT_GROUP_THRESHOLD
            : Math.max(1, threshold),
      }
    : null;

export const getVirtualizedDOMStrategyConfig = ({
  domStrategyType,
  estimatedBlockSize,
  overscan,
  threshold,
}: {
  domStrategyType: ReturnType<typeof getDOMStrategyType>;
  estimatedBlockSize: number;
  overscan: number;
  threshold: number;
}): DOMStrategyVirtualizedConfig | null =>
  domStrategyType === 'virtualized'
    ? {
        estimatedBlockSize: Math.max(1, estimatedBlockSize),
        overscan: Math.max(0, overscan),
        threshold: Math.max(1, threshold),
      }
    : null;

export const getDOMStrategyCohort = (
  documentSize: number
): EditableDOMStrategyCohort => {
  if (documentSize >= 25_000) return 'pathological';
  if (documentSize >= 10_000) return 'stress';
  if (documentSize >= 5000) return 'large';
  if (documentSize >= 1000) return 'medium';

  return 'normal';
};

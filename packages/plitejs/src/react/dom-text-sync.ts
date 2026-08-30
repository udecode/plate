import type { Text } from '..';
import type { PliteProjectionSlice } from './projection-store';

export type DOMTextSyncOptOutReason =
  | 'empty-text'
  | 'projection'
  | 'custom-leaf'
  | 'custom-segment'
  | 'custom-text';

export type DOMTextSyncCapability =
  | {
      enabled: true;
      reason: null;
    }
  | {
      enabled: false;
      reason: DOMTextSyncOptOutReason;
    };

/** Context used to claim native DOM text-sync capability for a renderer. */
export type DOMTextSyncRendererCapabilityContext = Readonly<{
  marks: Omit<Text, 'text'>;
  projections: readonly PliteProjectionSlice[];
}>;

const DOM_TEXT_SYNC_RENDERER_CAPABILITY = Symbol.for(
  'plitejs/react/dom-text-sync-renderer-capability'
);

/**
 * Publish renderer-owned DOM text-sync capability.
 *
 * @internal
 */
export const setDOMTextSyncRendererCapability = <TRenderer extends object>(
  renderer: TRenderer,
  resolve: (context: DOMTextSyncRendererCapabilityContext) => boolean
): TRenderer => {
  Object.defineProperty(renderer, DOM_TEXT_SYNC_RENDERER_CAPABILITY, {
    configurable: false,
    enumerable: false,
    value: resolve,
    writable: false,
  });

  return renderer;
};

const hasDOMTextSyncRendererCapability = (
  renderer: unknown,
  context: DOMTextSyncRendererCapabilityContext
) =>
  typeof renderer === 'function' &&
  ((
    Reflect.get(renderer, DOM_TEXT_SYNC_RENDERER_CAPABILITY) as
      | ((value: DOMTextSyncRendererCapabilityContext) => boolean)
      | undefined
  )?.(context) ??
    false);

export const getDOMTextSyncCapability = ({
  hasText,
  marks = {},
  projections,
  renderLeaf,
  renderSegment,
  renderText,
}: {
  hasText: boolean;
  marks?: Omit<Text, 'text'>;
  projections: readonly PliteProjectionSlice[];
  renderLeaf?: unknown;
  renderSegment?: unknown;
  renderText?: unknown;
}): DOMTextSyncCapability => {
  if (!hasText) {
    return { enabled: false, reason: 'empty-text' };
  }

  if (renderSegment) {
    return { enabled: false, reason: 'custom-segment' };
  }

  if (
    renderLeaf &&
    !hasDOMTextSyncRendererCapability(renderLeaf, { marks, projections })
  ) {
    return { enabled: false, reason: 'custom-leaf' };
  }

  if (
    renderText &&
    !hasDOMTextSyncRendererCapability(renderText, { marks, projections })
  ) {
    return { enabled: false, reason: 'custom-text' };
  }

  if (projections.length > 0) {
    return { enabled: false, reason: 'projection' };
  }

  return { enabled: true, reason: null };
};

export const canUseProjectedDOMTextSync = ({
  hasText,
  marks = {},
  projections,
  renderLeaf,
  renderSegment,
  renderText,
}: {
  hasText: boolean;
  marks?: Omit<Text, 'text'>;
  projections: readonly PliteProjectionSlice[];
  renderLeaf?: unknown;
  renderSegment?: unknown;
  renderText?: unknown;
}) =>
  hasText &&
  projections.length > 0 &&
  !renderSegment &&
  (!renderLeaf ||
    hasDOMTextSyncRendererCapability(renderLeaf, { marks, projections })) &&
  (!renderText ||
    hasDOMTextSyncRendererCapability(renderText, { marks, projections }));

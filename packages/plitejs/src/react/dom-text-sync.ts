import type { Text } from '..';
import type { PliteDecorationSlice } from './decoration-source';

export type DOMTextSyncOptOutReason =
  | 'empty-text'
  | 'decoration'
  | 'custom-leaf'
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
}>;

const DOM_TEXT_SYNC_RENDERER_CAPABILITY = Symbol.for(
  'plitejs/react/dom-text-sync-renderer-capability'
);
const RETAINED_TEXT_FLOW_RENDERER_CAPABILITY = Symbol.for(
  'plitejs/react/retained-text-flow-renderer-capability'
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

export const canSkipRendererForRetainedTextFlow = (
  renderer: unknown,
  context: DOMTextSyncRendererCapabilityContext
) =>
  renderer == null ||
  (typeof renderer === 'function' &&
    ((
      Reflect.get(renderer, RETAINED_TEXT_FLOW_RENDERER_CAPABILITY) as
        | ((value: DOMTextSyncRendererCapabilityContext) => boolean)
        | undefined
    )?.(context) ??
      false));

export const getDOMTextSyncCapability = ({
  hasText,
  marks = {},
  decorations,
  renderLeaf,
  renderText,
}: {
  decorations: readonly PliteDecorationSlice[];
  hasText: boolean;
  marks?: Omit<Text, 'text'>;
  renderLeaf?: unknown;
  renderText?: unknown;
}): DOMTextSyncCapability => {
  if (!hasText) {
    return { enabled: false, reason: 'empty-text' };
  }

  if (renderLeaf && !hasDOMTextSyncRendererCapability(renderLeaf, { marks })) {
    return { enabled: false, reason: 'custom-leaf' };
  }

  if (renderText && !hasDOMTextSyncRendererCapability(renderText, { marks })) {
    return { enabled: false, reason: 'custom-text' };
  }

  if (decorations.length > 0) {
    return { enabled: false, reason: 'decoration' };
  }

  return { enabled: true, reason: null };
};

import type { Text } from '..';
import type { DecorationSlice } from './decoration-source';

export type DOMTextSyncOptOutReason =
  | 'retained-content'
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

/** Marks of the text a renderer capability resolver is asked about. */
export type DOMTextSyncRendererCapabilityContext = Readonly<{
  marks: Omit<Text, 'text'>;
}>;

const DOM_TEXT_SYNC_RENDERER_CAPABILITY = Symbol.for(
  'plitejs/react/dom-text-sync-renderer-capability'
);
const RETAINED_TEXT_FLOW_RENDERER_CAPABILITY = Symbol.for(
  'plitejs/react/retained-text-flow-renderer-capability'
);

const defineRendererCapability =
  (key: symbol) =>
  <TRenderer extends object>(
    renderer: TRenderer,
    resolve: (context: DOMTextSyncRendererCapabilityContext) => boolean
  ): TRenderer =>
    Object.defineProperty(renderer, key, {
      configurable: false,
      enumerable: false,
      value: resolve,
      writable: false,
    });

/**
 * Mark a custom `renderLeaf` or `renderText` as safe for native DOM text sync
 * for the marks `resolve` accepts, so typing updates text in place without
 * re-rendering the renderer. Call it once per renderer object; a second call
 * with a different `resolve` throws.
 */
export const setDOMTextSyncRendererCapability = defineRendererCapability(
  DOM_TEXT_SYNC_RENDERER_CAPABILITY
);

/**
 * Mark a custom `renderLeaf` or `renderText` as safe to skip during retained
 * text flow for the marks `resolve` accepts. Call it once per renderer
 * object; a second call with a different `resolve` throws.
 */
export const setRetainedTextFlowRendererCapability = defineRendererCapability(
  RETAINED_TEXT_FLOW_RENDERER_CAPABILITY
);

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
  decorations: readonly DecorationSlice[];
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

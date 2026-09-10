const RETAINED_TEXT_FLOW_RENDERER_CAPABILITY = Symbol.for(
  'plitejs/react/retained-text-flow-renderer-capability'
);

type RetainedTextFlowRendererContext = Readonly<{
  marks: Readonly<Record<string, unknown>>;
}>;

export const setRetainedTextFlowRendererCapability = <TRenderer extends object>(
  renderer: TRenderer,
  resolve: (context: RetainedTextFlowRendererContext) => boolean
): TRenderer => {
  Object.defineProperty(renderer, RETAINED_TEXT_FLOW_RENDERER_CAPABILITY, {
    configurable: false,
    enumerable: false,
    value: resolve,
    writable: false,
  });

  return renderer;
};

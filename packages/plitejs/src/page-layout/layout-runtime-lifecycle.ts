const DEFERRED_LAYOUT_OPTIONS = new WeakSet<object>();

type LayoutRuntimeLifecycle = {
  connect: () => () => void;
};

const LAYOUT_RUNTIME_LIFECYCLES = new WeakMap<object, LayoutRuntimeLifecycle>();

export const deferLayoutRuntimeConnection = <TOptions extends object>(
  options: TOptions
): TOptions => {
  const deferredOptions = { ...options };

  DEFERRED_LAYOUT_OPTIONS.add(deferredOptions);

  return deferredOptions;
};

export const isLayoutRuntimeConnectionDeferred = (options: object): boolean =>
  DEFERRED_LAYOUT_OPTIONS.has(options);

export const registerLayoutRuntimeLifecycle = (
  runtime: object,
  lifecycle: LayoutRuntimeLifecycle
) => {
  LAYOUT_RUNTIME_LIFECYCLES.set(runtime, lifecycle);
};

export const connectLayoutRuntime = (runtime: object): (() => void) =>
  LAYOUT_RUNTIME_LIFECYCLES.get(runtime)?.connect() ?? (() => {});

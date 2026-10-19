export type RequiredPluginState<T> = {
  [K in keyof T]-?: T[K] & ({} | null);
};

export type PluginInitialStateInput<T> = T extends (
  ...args: infer TArgs
) => infer TState
  ? (...args: TArgs) => RequiredPluginState<Extract<TState, object>>
  : RequiredPluginState<T>;

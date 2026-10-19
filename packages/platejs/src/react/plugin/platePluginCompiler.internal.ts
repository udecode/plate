import type { NormalizeBasePluginInput } from '../../lib/plugin/basePluginCompiler.internal';

export type NormalizePluginAuthorInput<TInput> = Omit<TInput, 'component'> &
  ('component' extends keyof TInput ? Readonly<{ render: true }> : {});

export type NormalizePluginInput<
  TInput,
  TFallbackName extends string = string,
> = NormalizeBasePluginInput<NormalizePluginAuthorInput<TInput>, TFallbackName>;

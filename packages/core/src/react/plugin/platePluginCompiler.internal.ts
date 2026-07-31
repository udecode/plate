import type { NormalizeBasePluginInput } from '../../lib/plugin/basePluginCompiler.internal';

export type NormalizePlatePluginAuthorInput<TInput> = Omit<
  TInput,
  'component'
> &
  ('component' extends keyof TInput ? Readonly<{ render: true }> : {});

export type NormalizePlatePluginInput<
  TInput,
  TFallbackName extends string = string,
> = NormalizeBasePluginInput<
  NormalizePlatePluginAuthorInput<TInput>,
  TFallbackName
>;

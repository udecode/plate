import type { PluginConfig } from './PlatePlugin';

export type InferOptions<P> = P extends PluginConfig ? P['options'] : never;

export type InferApi<P> = P extends PluginConfig ? P['api'] : never;

export type InferTransforms<P> = P extends PluginConfig
  ? P['transforms']
  : never;

import type { AnyPluginConfig } from '../../lib';
import type { PlatePluginContext } from './PlatePlugin';

export const omitPluginContext = <
  T extends PlatePluginContext<AnyPluginConfig>,
>(
  ctx: T
) => {
  const { api, editor, plugin, store, type, update, ...rest } = ctx;

  void update;

  return rest;
};

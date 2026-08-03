import type { AnyBasePluginDefinition } from '../../lib';
import type { PlatePluginContext } from './PlatePlugin';

export const omitPluginContext = <
  T extends PlatePluginContext<AnyBasePluginDefinition>,
>(
  ctx: T
) => {
  const {
    api,
    defineCodecs,
    editor,
    installed,
    name,
    plugin,
    read,
    store,
    update,
    ...rest
  } = ctx;

  return rest;
};

import type { PlatePluginContext } from './PlatePlugin';

export type PlatePluginUseHooks<O = {}, A = {}, T = {}, S = {}> = (
  ctx: PlatePluginContext<string, O, A, T, S>
) => void;

import { createTEditor } from '@udecode/slate';

import type { PlatePlugin } from '../types/plugin/PlatePlugin';

import { createPlugin } from './createPlugin';
import { resolvePlugin } from './resolvePlugin';

export const mockPlugin = <O = {}, T = {}, Q = {}, S = {}>(
  plugin?: Partial<PlatePlugin<O, T, Q, S>>
): PlatePlugin<O, T, Q, S> => {
  return resolvePlugin(
    createTEditor() as any,
    createPlugin({
      key: 'mock',
      ...plugin,
    })
  );
};

import type { TText } from '@udecode/slate';
import type { TRenderLeafProps } from '@udecode/slate-react';

import type { AnyPluginConfig, PluginConfig } from '../../lib';
import type { PlateRenderNodeProps } from './PlateRenderNodeProps';

/** Leaf props passed by Plate */
export type PlateRenderLeafProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
> = PlateRenderNodeProps<C> & TRenderLeafProps<N>;

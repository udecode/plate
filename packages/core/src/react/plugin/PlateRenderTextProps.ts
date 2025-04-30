import type { TText } from '@udecode/slate';

import type { AnyPluginConfig, PluginConfig, RenderTextProps } from '../../lib';
import type { PlateRenderNodeProps } from './PlateRenderNodeProps';

/** Text props passed by Plate */
export type PlateRenderTextProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
> = PlateRenderNodeProps<C> & RenderTextProps<N>;

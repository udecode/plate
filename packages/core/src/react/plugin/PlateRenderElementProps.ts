import type { Path, TElement } from '@udecode/slate';

import type {
  AnyPluginConfig,
  PluginConfig,
  RenderElementProps,
} from '../../lib';
import type { PlateRenderNodeProps } from './PlateRenderNodeProps';

/** Element props passed by Plate */
export type PlateRenderElementProps<
  N extends TElement = TElement,
  C extends AnyPluginConfig = PluginConfig,
> = PlateRenderNodeProps<C> &
  RenderElementProps<N> & {
    path: Path;
  };

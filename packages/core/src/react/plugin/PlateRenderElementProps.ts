import type { TElement } from '@udecode/slate';
import type { Path } from 'slate';

import type {
  AnyPluginConfig,
  PluginConfig,
  TRenderElementProps,
} from '../../lib';
import type { PlateRenderNodeProps } from './PlateRenderNodeProps';

/** Element props passed by Plate */
export type PlateRenderElementProps<
  N extends TElement = TElement,
  C extends AnyPluginConfig = PluginConfig,
> = PlateRenderNodeProps<C> &
  TRenderElementProps<N> & {
    path: Path;
  };

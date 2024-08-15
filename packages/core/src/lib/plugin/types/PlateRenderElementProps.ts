import type { TElement } from '@udecode/slate';
import type { TRenderElementProps } from '@udecode/slate-react';

import type { AnyPluginConfig } from './PlatePlugin';
import type { PlateRenderNodeProps } from './PlateRenderNodeProps';

/** Element props passed by Plate */
export type PlateRenderElementProps<
  N extends TElement = TElement,
  C extends AnyPluginConfig = AnyPluginConfig,
> = PlateRenderNodeProps<C> & TRenderElementProps<N>;

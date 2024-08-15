import type { TElement } from '@udecode/slate';
import type { TRenderElementProps } from '@udecode/slate-react';

import type { AnyPluginContext } from './PlatePlugin';
import type { PlateRenderNodeProps } from './PlateRenderNodeProps';

/** Element props passed by Plate */
export type PlateRenderElementProps<
  N extends TElement = TElement,
  C extends AnyPluginContext = AnyPluginContext,
> = PlateRenderNodeProps<C> & TRenderElementProps<N>;

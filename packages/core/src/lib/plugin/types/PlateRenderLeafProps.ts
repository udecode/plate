import type { TText } from '@udecode/slate';
import type { TRenderLeafProps } from '@udecode/slate-react';

import type { AnyPluginContext } from './PlatePlugin';
import type { PlateRenderNodeProps } from './PlateRenderNodeProps';

/** Leaf props passed by Plate */
export type PlateRenderLeafProps<
  N extends TText = TText,
  C extends AnyPluginContext = AnyPluginContext,
> = PlateRenderNodeProps<C> & TRenderLeafProps<N>;

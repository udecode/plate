import { EText, TText, Value } from '@udecode/slate';
import { TRenderLeafProps } from '@udecode/slate-react';

import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Leaf props passed by Plate
 */
export type PlateRenderLeafProps<
  V extends Value = Value,
  N extends TText = EText<V>,
> = PlateRenderNodeProps<V> & TRenderLeafProps<V, N>;

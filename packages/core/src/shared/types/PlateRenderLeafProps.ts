import type { EText, TText, Value } from '@udecode/slate';
import type { TRenderLeafProps } from '@udecode/slate-react';

import type { PlateRenderNodeProps } from './PlateRenderNodeProps';

/** Leaf props passed by Plate */
export type PlateRenderLeafProps<
  V extends Value = Value,
  N extends TText = EText<V>,
> = PlateRenderNodeProps<V> & TRenderLeafProps<V, N>;

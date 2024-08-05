import type { TRenderLeafProps } from '@udecode/slate-react';

import type { PlateRenderNodeProps } from './PlateRenderNodeProps';

/** Leaf props passed by Plate */
export type PlateRenderLeafProps<
  O = {},
  A = {},
  T = {},
  S = {},
> = PlateRenderNodeProps<O, A, T, S> & TRenderLeafProps;

import { EElement, TElement, Value } from '@udecode/slate';

import { PlateRenderNodeProps } from './PlateRenderNodeProps';
import { TRenderElementProps } from './slate-react/TRenderElementProps';

/**
 * Element props passed by Plate
 */
export type PlateRenderElementProps<
  V extends Value = Value,
  N extends TElement = EElement<V>
> = PlateRenderNodeProps<V> & TRenderElementProps<V, N>;

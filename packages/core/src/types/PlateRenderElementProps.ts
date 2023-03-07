import { EElement, TElement, Value } from '@udecode/slate';
import { TRenderElementProps } from './slate-react/TRenderElementProps';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Element props passed by Plate
 */
export type PlateRenderElementProps<
  V extends Value = Value,
  N extends TElement = EElement<V>
> = PlateRenderNodeProps<V> & TRenderElementProps<V, N>;

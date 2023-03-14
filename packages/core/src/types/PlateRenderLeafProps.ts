import { EText, TRenderLeafProps, TText, Value } from '@udecode/slate';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Leaf props passed by Plate
 */
export type PlateRenderLeafProps<
  V extends Value = Value,
  N extends TText = EText<V>
> = PlateRenderNodeProps<V> & TRenderLeafProps<V, N>;

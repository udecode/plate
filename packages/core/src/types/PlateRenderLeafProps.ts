import { Value } from '../slate/editor/TEditor';
import { EText } from '../slate/text/TText';
import { TRenderLeafProps } from '../slate/types/TRenderLeafProps';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Leaf props passed by Plate
 */
export type PlateRenderLeafProps<
  V extends Value,
  N extends EText<V> = EText<V>
> = PlateRenderNodeProps<V> & TRenderLeafProps<V, N>;

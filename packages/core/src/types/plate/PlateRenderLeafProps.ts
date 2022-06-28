import { Value } from '../../slate/editor/TEditor';
import { EText, TText } from '../../slate/text/TText';
import { TRenderLeafProps } from '../../slate/types/TRenderLeafProps';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Leaf props passed by Plate
 */
export type PlateRenderLeafProps<
  V extends Value = Value,
  N extends TText = EText<V>
> = PlateRenderNodeProps<V> & TRenderLeafProps<V, N>;

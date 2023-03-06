import { Value } from '@udecode/slate-utils/src';
import { EText, TText } from '../../../../slate/src/interfaces/text/TText';
import { TRenderLeafProps } from '../../../../slate/src/types/TRenderLeafProps';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Leaf props passed by Plate
 */
export type PlateRenderLeafProps<
  V extends Value = Value,
  N extends TText = EText<V>
> = PlateRenderNodeProps<V> & TRenderLeafProps<V, N>;

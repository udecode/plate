import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { EText, TText } from '../../../../slate-utils/src/slate/text/TText';
import { TRenderLeafProps } from '../../../../slate-utils/src/slate/types/TRenderLeafProps';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Leaf props passed by Plate
 */
export type PlateRenderLeafProps<
  V extends Value = Value,
  N extends TText = EText<V>
> = PlateRenderNodeProps<V> & TRenderLeafProps<V, N>;

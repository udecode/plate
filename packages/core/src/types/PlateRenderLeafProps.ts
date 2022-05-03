import { Value } from '../slate/types/TEditor';
import { TRenderLeafProps } from '../slate/types/TRenderLeafProps';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Leaf props passed by Plate
 */
export type PlateRenderLeafProps<V extends Value> = PlateRenderNodeProps<V> &
  TRenderLeafProps<V>;

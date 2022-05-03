import { Value } from '../slate/types/TEditor';
import { TRenderElementProps } from '../slate/types/TRenderElementProps';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Element props passed by Plate
 */
export type PlateRenderElementProps<V extends Value> = PlateRenderNodeProps<V> &
  TRenderElementProps<V>;

import { Value } from '../slate/editor/TEditor';
import { EElement } from '../slate/element/TElement';
import { TRenderElementProps } from '../slate/types/TRenderElementProps';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Element props passed by Plate
 */
export type PlateRenderElementProps<
  V extends Value,
  N extends EElement<V> = EElement<V>
> = PlateRenderNodeProps<V> & TRenderElementProps<V, N>;

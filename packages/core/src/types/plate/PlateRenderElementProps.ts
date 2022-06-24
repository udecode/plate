import { Value } from '../../slate/editor/TEditor';
import { EElement, TElement } from '../../slate/element/TElement';
import { TRenderElementProps } from '../../slate/types/TRenderElementProps';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Element props passed by Plate
 */
export type PlateRenderElementProps<
  V extends Value = Value,
  N extends TElement = EElement<V>
> = PlateRenderNodeProps<V> & TRenderElementProps<V, N>;

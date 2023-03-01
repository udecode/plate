import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import {
  EElement,
  TElement,
} from '../../../../slate-utils/src/slate/element/TElement';
import { TRenderElementProps } from '../TRenderElementProps';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Element props passed by Plate
 */
export type PlateRenderElementProps<
  V extends Value = Value,
  N extends TElement = EElement<V>
> = PlateRenderNodeProps<V> & TRenderElementProps<V, N>;

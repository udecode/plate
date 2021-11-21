import { TRenderElementProps } from './slate/TRenderElementProps';
import { AnyObject } from './utility/AnyObject';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Element props passed by Plate
 */
export type PlateRenderElementProps<
  EElement = AnyObject
> = PlateRenderNodeProps & TRenderElementProps<EElement>;

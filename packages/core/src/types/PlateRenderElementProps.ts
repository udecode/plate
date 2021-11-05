import { AnyObject } from './utility/AnyObject';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';
import { TRenderElementProps } from './TRenderElementProps';

/**
 * Element props passed by Plate
 */
export type PlateRenderElementProps<
  EElement = AnyObject
> = PlateRenderNodeProps & TRenderElementProps<EElement>;

import { TRenderLeafProps } from './slate/TRenderLeafProps';
import { AnyObject } from './utility/AnyObject';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';

/**
 * Leaf props passed by Plate
 */
export type PlateRenderLeafProps<EText = AnyObject> = PlateRenderNodeProps &
  TRenderLeafProps<EText>;

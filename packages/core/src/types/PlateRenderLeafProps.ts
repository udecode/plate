import { AnyObject } from './utility/AnyObject';
import { PlateRenderNodeProps } from './PlateRenderNodeProps';
import { TRenderLeafProps } from './TRenderLeafProps';

/**
 * Leaf props passed by Plate
 */
export type PlateRenderLeafProps<EText = AnyObject> = PlateRenderNodeProps &
  TRenderLeafProps<EText>;

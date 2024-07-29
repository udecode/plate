import type { PlateRenderNodeProps } from './PlateRenderNodeProps';
import type { TRenderElementProps } from './slate-react/TRenderElementProps';

/** Element props passed by Plate */
export type PlateRenderElementProps = PlateRenderNodeProps &
  TRenderElementProps;

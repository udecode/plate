import { PlateRenderElementProps } from '../PlateRenderElementProps';
import { AnyObject } from '../utility/AnyObject';
import { RenderFunction } from '../utility/RenderFunction';

export type InjectComponent = <T = AnyObject>(
  props: PlateRenderElementProps & T
) => RenderFunction<PlateRenderElementProps> | undefined;

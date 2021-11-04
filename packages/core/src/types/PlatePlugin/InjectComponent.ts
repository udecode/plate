import { SPRenderElementProps } from '../SPRenderElementProps';
import { AnyObject } from '../utility/AnyObject';
import { RenderFunction } from '../utility/RenderFunction';

export type InjectComponent = <T = AnyObject>(
  props: SPRenderElementProps & T
) => RenderFunction<SPRenderElementProps> | undefined;

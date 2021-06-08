import { AnyObject } from './utility/AnyObject';
import { SPRenderNodeProps } from './SPRenderNodeProps';
import { TRenderElementProps } from './TRenderElementProps';

export type SPRenderElementProps<EElement = AnyObject> = SPRenderNodeProps &
  TRenderElementProps<EElement>;

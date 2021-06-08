import { AnyObject } from './utility/AnyObject';
import { SPRenderNodeProps } from './SPRenderNodeProps';
import { TRenderLeafProps } from './TRenderLeafProps';

export type SPRenderLeafProps<EText = AnyObject> = SPRenderNodeProps &
  TRenderLeafProps<EText>;

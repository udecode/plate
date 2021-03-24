import { SPRenderNodeProps } from './SPRenderNodeProps';
import { TRenderLeafProps } from './TRenderLeafProps';

export type SPRenderLeafProps<EText = {}> = SPRenderNodeProps &
  TRenderLeafProps<EText>;

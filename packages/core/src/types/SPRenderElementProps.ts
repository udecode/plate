import { SPRenderNodeProps } from './SPRenderNodeProps';
import { TRenderElementProps } from './TRenderElementProps';

export type SPRenderElementProps<EElement = {}> = SPRenderNodeProps &
  TRenderElementProps<EElement>;

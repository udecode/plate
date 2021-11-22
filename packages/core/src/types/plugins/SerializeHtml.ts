import { PlateRenderElementProps } from '../PlateRenderElementProps';
import { PlateRenderLeafProps } from '../PlateRenderLeafProps';
import { RenderFunction } from '../utility/RenderFunction';

export type SerializeHtml = RenderFunction<
  PlateRenderElementProps | PlateRenderLeafProps
>;

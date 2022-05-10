import { RenderFunction } from '../../common/types/utility/RenderFunction';
import { Value } from '../../slate/editor/TEditor';
import { PlateRenderElementProps } from '../PlateRenderElementProps';
import { PlateRenderLeafProps } from '../PlateRenderLeafProps';

export type SerializeHtml<V extends Value> = RenderFunction<
  PlateRenderElementProps<V> & PlateRenderLeafProps<V>
>;

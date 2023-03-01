import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { PlateRenderElementProps } from '../plate/PlateRenderElementProps';
import { PlateRenderLeafProps } from '../plate/PlateRenderLeafProps';
import { RenderFunction } from '../react/RenderFunction';

export type SerializeHtml<V extends Value = Value> = RenderFunction<
  PlateRenderElementProps<V> & PlateRenderLeafProps<V>
>;

import { Value } from '@udecode/slate-utils/src';
import { PlateRenderElementProps } from '../plate/PlateRenderElementProps';
import { PlateRenderLeafProps } from '../plate/PlateRenderLeafProps';
import { RenderFunction } from '../react/RenderFunction';

export type SerializeHtml<V extends Value = Value> = RenderFunction<
  PlateRenderElementProps<V> & PlateRenderLeafProps<V>
>;

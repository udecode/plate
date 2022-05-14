import { RenderFunction } from '../../common/types/utility/RenderFunction';
import { Value } from '../../slate/editor/TEditor';
import { PlateRenderElementProps } from '../PlateRenderElementProps';

export interface InjectComponentProps<V extends Value = Value>
  extends PlateRenderElementProps<V> {
  key: string;
}

export type InjectComponentReturnType<V extends Value = Value> =
  | RenderFunction<PlateRenderElementProps<V>>
  | undefined;

export type InjectComponent<V extends Value = Value> = (
  props: InjectComponentProps<V>
) => InjectComponentReturnType;

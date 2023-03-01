import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { PlateRenderElementProps } from '../plate/PlateRenderElementProps';
import { RenderFunction } from '../react/RenderFunction';

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

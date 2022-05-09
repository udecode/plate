import { AnyObject } from '../../common/types/utility/AnyObject';
import { RenderFunction } from '../../common/types/utility/RenderFunction';
import { Value } from '../../slate/editor/TEditor';
import { PlateRenderElementProps } from '../PlateRenderElementProps';

export type InjectComponent = <V extends Value, T = AnyObject>(
  props: PlateRenderElementProps<V> & { key: string } & T
) => RenderFunction<PlateRenderElementProps<V>> | undefined;

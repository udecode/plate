import { AnyObject, Value } from '@udecode/slate-utils/src';
import { PlateRenderElementProps } from '../plate/PlateRenderElementProps';
import { PlateRenderLeafProps } from '../plate/PlateRenderLeafProps';

/**
 * Props object or function returning props object.
 */
export type PlatePluginProps<V extends Value = Value> =
  | AnyObject
  | ((
      props: PlateRenderElementProps<V> & PlateRenderLeafProps<V>
    ) => AnyObject | undefined);

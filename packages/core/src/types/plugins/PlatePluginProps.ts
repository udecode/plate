import { AnyObject } from '../../common/types/utility/AnyObject';
import { Value } from '../../slate/editor/TEditor';
import { PlateRenderElementProps } from '../PlateRenderElementProps';
import { PlateRenderLeafProps } from '../PlateRenderLeafProps';

/**
 * Props object or function returning props object.
 */
export type PlatePluginProps<V extends Value> =
  | AnyObject
  | ((
      props: PlateRenderElementProps<V> & PlateRenderLeafProps<V>
    ) => AnyObject | undefined);

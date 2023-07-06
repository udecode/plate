import { Value } from '@udecode/slate';
import { AnyObject } from '@udecode/utils';

import { PlateRenderElementProps } from '../PlateRenderElementProps';
import { PlateRenderLeafProps } from '../PlateRenderLeafProps';

/**
 * Props object or function returning props object.
 */
export type PlatePluginProps<V extends Value = Value> =
  | AnyObject
  | ((
      props: PlateRenderElementProps<V> & PlateRenderLeafProps<V>
    ) => AnyObject | undefined);

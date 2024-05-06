import type { Value } from '@udecode/slate';
import type { AnyObject } from '@udecode/utils';

import type { PlateRenderElementProps } from '../PlateRenderElementProps';
import type { PlateRenderLeafProps } from '../PlateRenderLeafProps';

/** Props object or function returning props object. */
export type PlatePluginProps<V extends Value = Value> =
  | ((
      props: PlateRenderElementProps<V> & PlateRenderLeafProps<V>
    ) => AnyObject | undefined)
  | AnyObject;

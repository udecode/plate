import type { AnyObject } from '@udecode/utils';

import type { PlateRenderElementProps } from '../PlateRenderElementProps';
import type { PlateRenderLeafProps } from '../PlateRenderLeafProps';

/** Props object or function returning props object. */
export type PlatePluginProps<O = {}, A = {}, T = {}, S = {}> =
  | ((
      props: PlateRenderElementProps<O, A, T, S> &
        PlateRenderLeafProps<O, A, T, S>
    ) => AnyObject | undefined)
  | AnyObject;

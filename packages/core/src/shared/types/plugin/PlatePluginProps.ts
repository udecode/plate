import type { AnyObject } from '@udecode/utils';

import type { PlateRenderElementProps } from '../PlateRenderElementProps';
import type { PlateRenderLeafProps } from '../PlateRenderLeafProps';

/** Props object or function returning props object. */
export type PlatePluginProps =
  | ((
      props: PlateRenderElementProps & PlateRenderLeafProps
    ) => AnyObject | undefined)
  | AnyObject;

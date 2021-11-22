import { PlateRenderElementProps } from '../PlateRenderElementProps';
import { PlateRenderLeafProps } from '../PlateRenderLeafProps';
import { AnyObject } from '../utility/AnyObject';

/**
 * Props object or function returning props object.
 */
export type PlatePluginProps =
  | AnyObject
  | ((
      props: PlateRenderElementProps | PlateRenderLeafProps
    ) => AnyObject | undefined);

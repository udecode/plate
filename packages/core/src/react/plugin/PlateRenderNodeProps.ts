import type { AnyObject } from '@udecode/utils';

import type { AnyPluginConfig, PluginConfig } from '../../lib';
import type { PlatePluginContext } from './PlatePlugin';

/** Node props passed by Plate */
export type PlateRenderNodeProps<C extends AnyPluginConfig = PluginConfig> = {
  className?: string;

  /** @see {@link NodeProps} */
  nodeProps?: AnyObject;
} & PlatePluginContext<C>;

import { UseEditablePropsOptions } from './UseEditablePropsOptions';
import { UseSlatePluginsEffectsOptions } from './UseSlatePluginsEffectsOptions';
import { UseSlatePropsOptions } from './UseSlatePropsOptions';

/**
 * `useSlatePlugins` options
 */
export type UseSlatePluginsOptions = UseSlatePropsOptions &
  UseEditablePropsOptions &
  UseSlatePluginsEffectsOptions;

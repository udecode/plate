import { SPEditor } from './SPEditor';
import { UseEditablePropsOptions } from './UseEditablePropsOptions';
import { UseSlatePluginsEffectsOptions } from './UseSlatePluginsEffectsOptions';
import { UseSlatePropsOptions } from './UseSlatePropsOptions';

/**
 * `useSlatePlugins` options
 */
export type UseSlatePluginsOptions<
  T extends SPEditor = SPEditor
> = UseSlatePropsOptions &
  UseEditablePropsOptions &
  UseSlatePluginsEffectsOptions<T>;

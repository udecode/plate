import { UseEditablePropsOptions } from './UseEditablePropsOptions';
import { UsePlateEffectsOptions } from './UsePlateEffectsOptions';
import { UseSlatePropsOptions } from './UseSlatePropsOptions';

/**
 * `usePlate` options
 */
export type UsePlateOptions<T = {}> = UseSlatePropsOptions &
  UseEditablePropsOptions &
  UsePlateEffectsOptions<T>;

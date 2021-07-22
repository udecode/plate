import { SPEditor } from './SPEditor';
import { UseEditablePropsOptions } from './UseEditablePropsOptions';
import { UsePlateEffectsOptions } from './UsePlateEffectsOptions';
import { UseSlatePropsOptions } from './UseSlatePropsOptions';

/**
 * `usePlate` options
 */
export type UsePlateOptions<
  T extends SPEditor = SPEditor
> = UseSlatePropsOptions & UseEditablePropsOptions & UsePlateEffectsOptions<T>;

import { PlateEditor, TPlateEditor } from './SPEditor';
import { UseEditablePropsOptions } from './UseEditablePropsOptions';
import { UsePlateEffectsOptions } from './UsePlateEffectsOptions';
import { UseSlatePropsOptions } from './UseSlatePropsOptions';

/**
 * `usePlate` options
 */
export type UsePlateOptions<T = TPlateEditor> = UseSlatePropsOptions &
  UseEditablePropsOptions &
  UsePlateEffectsOptions<T>;

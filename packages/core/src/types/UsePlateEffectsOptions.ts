import { WithPlateOptions } from '../plugins/withPlate';
import { PlateState } from './PlateStore';

/**
 * `usePlateEffects` options
 */
export interface UsePlateEffectsOptions<T = {}>
  extends WithPlateOptions<T>,
    Partial<Pick<PlateState<T>, 'editor' | 'value' | 'enabled'>> {
  /**
   * Initial value of the editor.
   * @default [{ children: [{ text: '' }]}]
   */
  initialValue?: PlateState['value'];

  /**
   * When `true`, it will normalize the initial value passed to the `editor` once it gets created.
   * This is useful when adding normalization rules on already existing content.
   * @default false
   */
  normalizeInitialValue?: boolean;
}

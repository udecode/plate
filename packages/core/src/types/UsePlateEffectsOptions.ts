import { PlatePlugin } from './plugins/PlatePlugin/PlatePlugin';
import { EditorId, PlateState } from './PlateStore';

/**
 * `usePlateEffects` options
 */
export interface UsePlateEffectsOptions<T = {}>
  extends Partial<Pick<PlateState<T>, 'editor' | 'value' | 'enabled'>> {
  id?: EditorId;

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

  plugins?: PlatePlugin<T>[];
}

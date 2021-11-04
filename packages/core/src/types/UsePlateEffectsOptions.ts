import {
  PlateOptions,
  PlatePluginComponent,
} from './PlatePluginOptions/PlateOptions';
import { EditorId, PlateState } from './PlateStore';
import { PlateEditor, TPlateEditor } from './SPEditor';

/**
 * `usePlateEffects` options
 */
export interface UsePlateEffectsOptions<T = TPlateEditor>
  extends Partial<
    Pick<PlateState<T>, 'editor' | 'value' | 'enabled' | 'plugins'>
  > {
  id?: EditorId;

  /**
   * Initial value of the editor.
   * @default [{ children: [{ text: '' }]}]
   */
  initialValue?: PlateState['value'];

  options?: PlateOptions;

  /**
   * Components stored by plugin key.
   * These will be merged into `options`.
   * @see {@link EditorId}
   */
  components?: Record<string, PlatePluginComponent>;

  /**
   * When `true`, it will normalize the initial value passed to the `editor` once it gets created.
   * This is useful when adding normalization rules on already existing content.
   * @default false
   */
  normalizeInitialValue?: boolean;
}

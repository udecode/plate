import { SlatePluginsOptions } from './SlatePluginOptions/SlatePluginsOptions';
import { State } from './SlatePluginsStore';
import { SPEditor } from './SPEditor';

/**
 * `useSlatePluginsEffects` options
 */
export interface UseSlatePluginsEffectsOptions<T extends SPEditor = SPEditor>
  extends Partial<Pick<State<T>, 'editor' | 'value' | 'enabled' | 'plugins'>> {
  /**
   * Unique id to store multiple editor states. Default is 'main'.
   */
  id?: string;

  /**
   * Initial value of the editor.
   * Default is `[{children: [{text: ''}]}]`.
   */
  initialValue?: State['value'];

  options?: SlatePluginsOptions;

  components?: Record<string, any>;
}

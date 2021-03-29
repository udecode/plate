import { SlatePluginsOptions } from './SlatePluginOptions/SlatePluginsOptions';
import { State } from './SlatePluginsStore';
import { TEditor } from './TEditor';

/**
 * `useSlatePluginsEffects` options
 */
export interface UseSlatePluginsEffectsOptions
  extends Partial<Pick<State, 'value' | 'enabled' | 'plugins'>> {
  /**
   * Unique id to store multiple editor states. Default is 'main'.
   */
  id?: string;

  /**
   * Controlled editor.
   */
  editor?: TEditor;

  /**
   * Initial value of the editor.
   * Default is `[{children: [{text: ''}]}]`.
   */
  initialValue?: State['value'];

  options?: SlatePluginsOptions;

  components?: Record<string, any>;
}

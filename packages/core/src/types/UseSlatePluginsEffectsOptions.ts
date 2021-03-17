import { Node } from 'slate';
import { SlatePlugin } from './SlatePlugin';
import { SlatePluginsOptions, State } from './SlatePluginsStore';

/**
 * `useSlatePluginsEffects` options
 */
export interface UseSlatePluginsEffectsOptions
  extends Partial<Pick<State, 'editor' | 'value'>> {
  /**
   * Unique id to store multiple editor states. Default is 'main'.
   */
  id?: string;

  /**
   * Initial value of the editor.
   * Default is `[{children: [{text: ''}]}]`.
   */
  initialValue?: Node[];

  /**
   * Apply the overrides to the editor singleton.
   * Default is `[withReact, withHistory, withRandomKey]`.
   */
  withOverrides?: any;

  /**
   * The plugins are applied in the order they are specified.
   */
  plugins?: SlatePlugin[];

  options?: SlatePluginsOptions;

  components?: Record<string, any>;
}

import { Node } from 'slate';
import { SlatePlugin } from './SlatePlugin';
import { State } from './SlatePluginsStore';

/**
 * `useSlatePluginsEffects` options
 */
export interface UseSlatePluginsEffectsOptions
  extends Partial<Pick<State, 'editor' | 'options' | 'value'>> {
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
   * Apply the plugins to the editor singleton.
   * Default is `[withReact, withHistory, withRandomKey]`.
   */
  withPlugins?: any;

  /**
   * The plugins are applied in the order they are specified.
   */
  plugins?: SlatePlugin[];
}

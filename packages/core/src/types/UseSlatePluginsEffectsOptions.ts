import { Node } from 'slate';
import { SlatePlugin } from './SlatePlugin/SlatePlugin';
import { SlatePluginsOptions } from './SlatePluginOptions/SlatePluginsOptions';
import { State } from './SlatePluginsStore';

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
   * The plugins are applied in the order they are specified.
   */
  plugins?: SlatePlugin[];

  options?: SlatePluginsOptions;

  components?: Record<string, any>;
}

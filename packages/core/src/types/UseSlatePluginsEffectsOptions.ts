import {
  SlatePluginComponent,
  SlatePluginsOptions,
} from './SlatePluginOptions/SlatePluginsOptions';
import { EditorId, State } from './SlatePluginsStore';
import { TEditor } from './TEditor';

/**
 * `useSlatePluginsEffects` options
 */
export interface UseSlatePluginsEffectsOptions
  extends Partial<Pick<State, 'value' | 'enabled' | 'plugins'>> {
  id?: EditorId;

  /**
   * Controlled editor without `withSlatePlugins`.
   * @default pipe(createEditor(), withSlatePlugins({ id, plugins, options, components }))
   */
  editor?: TEditor;

  /**
   * Initial value of the editor.
   * @default [{ children: [{ text: '' }]}].
   */
  initialValue?: State['value'];

  options?: SlatePluginsOptions;

  /**
   * Components stored by plugin key.
   * These will be merged into `options`.
   * @see {@link EditorId}
   */
  components?: Record<string, SlatePluginComponent>;
}

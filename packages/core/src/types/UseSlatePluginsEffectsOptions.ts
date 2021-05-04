import {
  SlatePluginComponent,
  SlatePluginsOptions,
} from './SlatePluginOptions/SlatePluginsOptions';
import { EditorId, SlatePluginsState } from './SlatePluginsStore';
import { SPEditor } from './SPEditor';

/**
 * `useSlatePluginsEffects` options
 */
export interface UseSlatePluginsEffectsOptions<T extends SPEditor = SPEditor>
  extends Partial<
    Pick<SlatePluginsState<T>, 'editorRef' | 'value' | 'enabled' | 'plugins'>
  > {
  id?: EditorId;

  editor?: SlatePluginsState['editorRef'];

  /**
   * Initial value of the editor.
   * @default [{ children: [{ text: '' }]}]
   */
  initialValue?: SlatePluginsState['value'];

  options?: SlatePluginsOptions;

  /**
   * Components stored by plugin key.
   * These will be merged into `options`.
   * @see {@link EditorId}
   */
  components?: Record<string, SlatePluginComponent>;
}

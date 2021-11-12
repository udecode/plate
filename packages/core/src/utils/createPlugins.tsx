import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { PlatePluginComponent } from '../types/plugins/PlatePlugin/PlatePluginComponent';

export const createPlugins = (
  plugins: PlatePlugin[],
  {
    components,
  }: {
    /**
     * Components stored by plugin key.
     * These will be merged into `options`.
     * @see {@link EditorId}
     */
    components?: Record<string, PlatePluginComponent>;
  }
) => {};

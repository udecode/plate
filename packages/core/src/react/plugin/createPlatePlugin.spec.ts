import type { PlatePluginComponent } from './PlatePlugin';

import { resolvePluginTest } from '../../lib';
import { createPlatePlugin } from './createPlatePlugin';

describe('withComponent method', () => {
  it('should set the component for the plugin', () => {
    const MockComponent: PlatePluginComponent = () => null;
    const basePlugin = createPlatePlugin({ key: 'testPlugin' });

    const pluginWithComponent = basePlugin.withComponent(MockComponent);
    const resolvedPlugin = resolvePluginTest(pluginWithComponent);

    expect(resolvedPlugin.component).toBe(MockComponent);
  });

  it('should override an existing component', () => {
    const OriginalComponent: PlatePluginComponent = () => null;
    const NewComponent: PlatePluginComponent = () => null;

    const basePlugin = createPlatePlugin({
      component: OriginalComponent,
      key: 'testPlugin',
    });

    const pluginWithNewComponent = basePlugin.withComponent(NewComponent);
    const resolvedPlugin = resolvePluginTest(pluginWithNewComponent);

    expect(resolvedPlugin.component).not.toBe(OriginalComponent);
    expect(resolvedPlugin.component).toBe(NewComponent);
  });
});

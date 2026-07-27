import { omitPluginContext } from './omitPluginContext';

describe('omitPluginContext (base)', () => {
  it('removes the plugin context keys and keeps the rest', () => {
    const ctx = {
      api: { remove: true },
      editor: { id: 'editor' },
      extra: 'kept',
      nested: { value: 2 },
      plugin: { key: 'plugin' },
      store: { get: () => ({ value: 1 }) },
      type: 'plugin',
      update: () => {},
    };

    expect(omitPluginContext(ctx as any)).toEqual({
      extra: 'kept',
      nested: { value: 2 },
    });
    expect(ctx).toHaveProperty('api');
    expect(ctx).toHaveProperty('plugin');
  });
});

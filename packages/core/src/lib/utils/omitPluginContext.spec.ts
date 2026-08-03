import { omitPluginContext } from './omitPluginContext';

describe('omitPluginContext (base)', () => {
  it('removes the plugin context keys and keeps the rest', () => {
    const ctx = {
      api: { remove: true },
      defineCodecs: { remove: true },
      editor: { id: 'editor' },
      extra: 'kept',
      installed: true,
      name: 'plugin',
      nested: { value: 2 },
      plugin: { name: 'plugin' },
      read: { remove: true },
      store: { get: () => ({ value: 1 }) },
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

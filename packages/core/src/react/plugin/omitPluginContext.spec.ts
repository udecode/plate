import { omitPluginContext } from './omitPluginContext';

describe('omitPluginContext (plate)', () => {
  it('removes the plugin context keys and keeps the rest', () => {
    const ctx = {
      api: { remove: true },
      editor: { id: 'editor' },
      extra: 'kept',
      getOption: () => 'option',
      getOptions: () => ({ value: 1 }),
      nested: { value: 2 },
      plugin: { key: 'plugin' },
      setOption: () => {},
      setOptions: () => {},
      tf: { insert: true },
      type: 'plugin',
    };

    expect(omitPluginContext(ctx as any)).toEqual({
      extra: 'kept',
      nested: { value: 2 },
    });
    expect(ctx).toHaveProperty('api');
    expect(ctx).toHaveProperty('plugin');
  });
});

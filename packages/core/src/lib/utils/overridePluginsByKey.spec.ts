import { overridePluginsByKey } from './overridePluginsByKey';

describe('overridePluginsByKey', () => {
  it('deep merges root overrides and appends extensions', () => {
    const firstExtension = () => ({ key: 'first' });
    const secondExtension = () => ({ key: 'second' });

    const plugin: any = {
      __extensions: [firstExtension],
      key: 'root',
      node: { type: 'root' },
      options: {
        enabled: true,
        nested: { a: 1 },
      },
      plugins: [{ key: 'child', options: { child: true } }],
    };

    const result = overridePluginsByKey(plugin, {
      root: {
        __extensions: [secondExtension],
        node: { component: 'custom' },
        options: {
          nested: { b: 2 },
        },
      },
    } as any);

    expect(result.__extensions).toEqual([firstExtension, secondExtension]);
    expect(result.node).toEqual({ component: 'custom', type: 'root' });
    expect(result.options).toEqual({
      enabled: true,
      nested: { a: 1, b: 2 },
    });
  });

  it('appends missing top-level nested plugins but not nested override plugin lists', () => {
    const plugin: any = {
      key: 'root',
      plugins: [
        {
          key: 'child',
          plugins: [{ key: 'grandchild' }],
        },
      ],
    };

    const result = overridePluginsByKey(plugin, {
      child: {
        plugins: [{ key: 'should-not-be-added' }],
      },
      root: {
        plugins: [{ key: 'added' }],
      },
    } as any);

    expect(result.plugins.map((child: any) => child.key)).toEqual([
      'child',
      'added',
    ]);
    expect(result.plugins[0].plugins.map((child: any) => child.key)).toEqual([
      'grandchild',
    ]);
  });

  it('recursively overrides existing nested plugins by key', () => {
    const plugin: any = {
      key: 'root',
      plugins: [
        {
          key: 'child',
          options: { a: 1 },
        },
      ],
    };

    const result = overridePluginsByKey(plugin, {
      child: {
        options: { b: 2 },
      },
    } as any);

    expect(result.plugins[0].options).toEqual({ a: 1, b: 2 });
  });
});

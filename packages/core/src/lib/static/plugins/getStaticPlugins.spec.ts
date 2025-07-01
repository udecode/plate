import { CopyPlugin } from './CopyPlugin';
import { getStaticPlugins } from './getStaticPlugins';

describe('getStaticPlugins', () => {
  it('should return CopyPlugin enabled by default', () => {
    const plugins = getStaticPlugins({});

    expect(plugins).toHaveLength(1);
    expect(plugins[0].key).toBe(CopyPlugin.key);
    // enabled is set at the plugin level, not in options
    expect(plugins[0].enabled).toBe(true);
  });

  it('should return CopyPlugin enabled when copyPlugin is true', () => {
    const plugins = getStaticPlugins({ copyPlugin: true });

    expect(plugins).toHaveLength(1);
    expect(plugins[0].key).toBe(CopyPlugin.key);
    expect(plugins[0].enabled).toBe(true);
  });

  it('should return CopyPlugin disabled when copyPlugin is false', () => {
    const plugins = getStaticPlugins({ copyPlugin: false });

    expect(plugins).toHaveLength(1);
    expect(plugins[0].key).toBe(CopyPlugin.key);
    expect(plugins[0].enabled).toBe(false);
  });

  it('should return array of plugins', () => {
    const plugins = getStaticPlugins({});

    expect(Array.isArray(plugins)).toBe(true);
    expect(plugins.every(p => typeof p === 'object')).toBe(true);
  });

  it('should maintain plugin configuration', () => {
    const plugins = getStaticPlugins({});
    const copyPlugin = plugins[0];

    // Check that plugin has expected structure
    expect(copyPlugin).toHaveProperty('key');
    expect(copyPlugin).toHaveProperty('options');
    expect(copyPlugin).toHaveProperty('configure');
  });
});
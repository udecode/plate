import { getPluginNodeClass } from './pluginNodeClass';

describe('getPluginNodeClass', () => {
  it('omits the class when no plugin owns the node', () => {
    expect(getPluginNodeClass()).toBeUndefined();
  });

  it('returns the owning plugin class', () => {
    expect(getPluginNodeClass('paragraph')).toBe('plite-paragraph');
  });
});

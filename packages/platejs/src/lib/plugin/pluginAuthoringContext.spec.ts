import { definePlugin } from './definePlugin';
import { createDefinePluginFormats } from './pluginAuthoringContext';

describe('createDefinePluginFormats', () => {
  it('preserves a combined self-format map', () => {
    const defineFormats = createDefinePluginFormats();
    const html = { decode: () => ({}) };
    const markdown = { kind: 'node' };
    const declaration = Reflect.apply(defineFormats, undefined, [
      {
        html,
        markdown,
      },
    ]);

    expect(declaration.html).toBe(html);
    expect(declaration.markdown).toBe(markdown);
  });

  it('binds every node declaration in a foreign-target tuple', () => {
    const TargetPlugin = definePlugin('target', {});
    const defineFormats = createDefinePluginFormats();
    const first = { kind: 'node' };
    const second = { kind: 'node' };
    const declaration = Reflect.apply(defineFormats, undefined, [
      TargetPlugin,
      { 'application/x-node': [first, second] },
    ]);

    expect(declaration['application/x-node']).toEqual([
      { ...first, target: TargetPlugin },
      { ...second, target: TargetPlugin },
    ]);
  });
});

import { definePlugin } from './definePlugin';
import { createDefinePluginFormats } from './pluginAuthoringContext';

describe('createDefinePluginFormats', () => {
  it('preserves a combined self-format map', () => {
    const defineFormats = createDefinePluginFormats();
    const html = { decode: () => ({}) };
    const markdown = { priority: 1 };
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
    const first = { priority: 1 };
    const second = { priority: 2 };
    const declaration = Reflect.apply(defineFormats, undefined, [
      TargetPlugin,
      { markdown: [first, second] },
    ]);

    expect(declaration.markdown).toEqual([
      { ...first, target: TargetPlugin },
      { ...second, target: TargetPlugin },
    ]);
  });
});

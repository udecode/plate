import { createBasePlugin } from './createBasePlugin';
import { createDefinePluginCodecs } from './pluginAuthoringContext';

describe('createDefinePluginCodecs', () => {
  it('preserves a combined self-codec map', () => {
    const defineCodecs = createDefinePluginCodecs();
    const html = { decode: () => ({}) };
    const markdown = { kind: 'node' };
    const declaration = Reflect.apply(defineCodecs, undefined, [
      {
        'text/html': html,
        'text/markdown': markdown,
      },
    ]);

    expect(declaration['text/html']).toBe(html);
    expect(declaration['text/markdown']).toBe(markdown);
  });

  it('binds every node declaration in a foreign-target tuple', () => {
    const TargetPlugin = createBasePlugin({ name: 'target' });
    const defineCodecs = createDefinePluginCodecs();
    const first = { kind: 'node' };
    const second = { kind: 'node' };
    const declaration = Reflect.apply(defineCodecs, undefined, [
      TargetPlugin,
      { 'application/x-node': [first, second] },
    ]);

    expect(declaration['application/x-node']).toEqual([
      { ...first, target: TargetPlugin },
      { ...second, target: TargetPlugin },
    ]);
  });
});

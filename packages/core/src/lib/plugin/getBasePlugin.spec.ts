import type { BaseEditor } from '../editor';
import type { PluginConfig } from './PluginBase';
import type { AnyBasePlugin, BasePluginContext } from './BasePlugin';

import { createBaseEditor } from '../editor';
import { createBasePlugin } from './createBasePlugin';
import { getBasePlugin } from './getBasePlugin';

describe('getBasePlugin', () => {
  let editor: BaseEditor;
  let testPlugin: AnyBasePlugin;

  beforeEach(() => {
    testPlugin = createBasePlugin({
      key: 'test',
      node: { type: 'test-type' },
      options: {
        testOption: 'testValue',
      },
    });

    editor = createBaseEditor({
      plugins: [testPlugin],
    });
  });

  it('get plugin context by plugin object', () => {
    const context = getBasePlugin(
      editor,
      testPlugin.configure({ options: { testOption: 't' } })
    );

    expect(context).toMatchObject({
      api: editor.api,
      editor,
      plugin: expect.objectContaining({
        key: 'test',
        node: { type: 'test-type' },
      }),
      type: 'test-type',
    });
    expect('tf' in context).toBe(false);
  });

  it('work extendEditor', () => {
    type Config = PluginConfig<
      'test',
      {
        testOption: string;
      }
    >;
    const plugin = createBasePlugin<Config>({
      key: 'test',
      node: { type: 'test-type' },
      options: {
        testOption: 'testValue',
      },
    });

    let a: BasePluginContext<Config> = {} as any;

    const b = getBasePlugin(editor, plugin);
    a = b;

    expect(a).toBeDefined();
  });

  it('get plugin context by plugin key', () => {
    const context = getBasePlugin(editor, { key: 'test' });

    expect(context).toMatchObject({
      api: editor.api,
      editor,
      plugin: expect.objectContaining({
        key: 'test',
        node: { type: 'test-type' },
      }),
      type: 'test-type',
    });
    expect('tf' in context).toBe(false);
  });

  it('resolve unresolved plugin', () => {
    const unresolvedPlugin = createBasePlugin({
      key: 'unresolved',
      node: { type: 'unresolved-type' },
      options: {
        unresolvedOption: 'unresolvedValue',
      },
    });

    const context = getBasePlugin(editor, unresolvedPlugin);

    expect(context).toMatchObject({
      api: editor.api,
      editor,
      plugin: expect.objectContaining({
        key: 'unresolved',
        node: { type: 'unresolved-type' },
      }),
      type: 'unresolved-type',
    });
    expect('tf' in context).toBe(false);
  });
});

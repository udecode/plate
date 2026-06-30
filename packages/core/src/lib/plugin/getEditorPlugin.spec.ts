import type { BaseEditor } from '../editor';
import type { PluginConfig } from './SlatePlugin';
import type { BasePlugin } from './BasePlugin';

import { createBaseEditor } from '../editor';
import { createBasePlugin } from './createBasePlugin';
import { getEditorPlugin } from './getEditorPlugin';

describe('getEditorPlugin', () => {
  type TestConfig = PluginConfig<
    'test',
    {
      testOption: string;
    }
  >;

  let editor: BaseEditor;
  let testPlugin: BasePlugin<TestConfig>;

  beforeEach(() => {
    testPlugin = createBasePlugin<TestConfig>({
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
    const context = getEditorPlugin(
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
  });

  it('works with extension context typing', () => {
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

    const typedEditor = createBaseEditor({
      plugins: [plugin],
    });
    const context = getEditorPlugin(typedEditor, plugin);
    const option = context.getOption('testOption');
    const options = context.getOptions();

    expect(option satisfies string).toBe('testValue');
    expect(options.testOption satisfies string).toBe('testValue');

    const assertTypedContext = () => {
      // @ts-expect-error invalid option keys should stay rejected.
      context.getOption('missingOption');
    };
    void assertTypedContext;
  });

  it('get plugin context by plugin key', () => {
    const context = getEditorPlugin(editor, { key: 'test' });

    expect(context).toMatchObject({
      api: editor.api,
      editor,
      plugin: expect.objectContaining({
        key: 'test',
        node: { type: 'test-type' },
      }),
      type: 'test-type',
    });
  });

  it('resolve unresolved plugin', () => {
    const unresolvedPlugin = createBasePlugin({
      key: 'unresolved',
      node: { type: 'unresolved-type' },
      options: {
        unresolvedOption: 'unresolvedValue',
      },
    });

    const context = getEditorPlugin(editor, unresolvedPlugin);

    expect(context).toMatchObject({
      api: editor.api,
      editor,
      plugin: expect.objectContaining({
        key: 'unresolved',
        node: { type: 'unresolved-type' },
      }),
      type: 'unresolved-type',
    });
  });
});

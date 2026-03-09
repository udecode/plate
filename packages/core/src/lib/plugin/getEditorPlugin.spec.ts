import type { SlateEditor } from '../editor';
import type { PluginConfig } from './BasePlugin';
import type { AnySlatePlugin, SlatePluginContext } from './SlatePlugin';

import { createSlateEditor } from '../editor';
import { createSlatePlugin, createTSlatePlugin } from './createSlatePlugin';
import { getEditorPlugin } from './getEditorPlugin';

describe('getEditorPlugin', () => {
  let editor: SlateEditor;
  let testPlugin: AnySlatePlugin;

  beforeEach(() => {
    testPlugin = createSlatePlugin({
      key: 'test',
      node: { type: 'test-type' },
      options: {
        testOption: 'testValue',
      },
    });

    editor = createSlateEditor({
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
      tf: editor.transforms,
      type: 'test-type',
    });
  });

  it('work extendEditor', () => {
    type Config = PluginConfig<
      'test',
      {
        testOption: string;
      }
    >;
    const plugin = createTSlatePlugin<Config>({
      key: 'test',
      node: { type: 'test-type' },
      options: {
        testOption: 'testValue',
      },
    });

    let a: SlatePluginContext<Config> = {} as any;

    const b = getEditorPlugin(editor, plugin);
    a = b;

    expect(a).toBeDefined();
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
      tf: editor.transforms,
      type: 'test-type',
    });
  });

  it('resolve unresolved plugin', () => {
    const unresolvedPlugin = createSlatePlugin({
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
      tf: editor.transforms,
      type: 'unresolved-type',
    });
  });
});

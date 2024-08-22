import type { SlateEditor } from '../editor';
import type { PluginConfig } from './BasePlugin';
import type { AnySlatePlugin, SlatePluginContext } from './SlatePlugin';

import { createPlateEditor } from '../../react';
import { createSlatePlugin, createTSlatePlugin } from './createSlatePlugin';
import { getPluginContext } from './getPluginContext';

describe('getPluginContext', () => {
  let editor: SlateEditor;
  let testPlugin: AnySlatePlugin;

  beforeEach(() => {
    testPlugin = createSlatePlugin({
      key: 'test',
      options: {
        testOption: 'testValue',
      },
      type: 'test-type',
    });

    editor = createPlateEditor({
      plugins: [testPlugin],
    });
  });

  it('should get plugin context by plugin object', () => {
    const context = getPluginContext(
      editor,
      testPlugin.configure({ options: { testOption: 't' } })
    );

    expect(context).toEqual({
      api: editor.api,
      editor,
      options: { testOption: 't' },
      plugin: expect.objectContaining({ key: 'test', type: 'test-type' }),
      tf: editor.transforms,
      type: 'test-type',
    });
  });

  it('should work withOverride', () => {
    type Config = PluginConfig<
      'test',
      {
        testOption: string;
      }
    >;
    const plugin = createTSlatePlugin<Config>({
      key: 'test',
      options: {
        testOption: 'testValue',
      },
      type: 'test-type',
    });

    let a: SlatePluginContext<Config> = {} as any;

    const b = getPluginContext(editor, plugin);
    a = b;

    expect(a).toBeDefined();
  });

  it('should get plugin context by plugin key', () => {
    const context = getPluginContext(editor, { key: 'test' });

    expect(context).toEqual({
      api: editor.api,
      editor,
      options: testPlugin.options,
      plugin: expect.objectContaining({ key: 'test', type: 'test-type' }),
      tf: editor.transforms,
      type: 'test-type',
    });
  });

  it('should resolve unresolved plugin', () => {
    const unresolvedPlugin = createSlatePlugin({
      key: 'unresolved',
      options: {
        unresolvedOption: 'unresolvedValue',
      },
      type: 'unresolved-type',
    });

    const context = getPluginContext(editor, unresolvedPlugin);

    expect(context).toEqual({
      api: editor.api,
      editor,
      options: unresolvedPlugin.options,
      plugin: expect.objectContaining({
        key: 'unresolved',
        type: 'unresolved-type',
      }),
      tf: editor.transforms,
      type: 'unresolved-type',
    });
  });
});

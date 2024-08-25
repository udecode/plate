import type { SlateEditor } from '../editor';
import type { PluginConfig } from './BasePlugin';
import type { AnySlatePlugin, SlatePluginContext } from './SlatePlugin';

import { createPlateEditor } from '../../react';
import { createSlatePlugin, createTSlatePlugin } from './createSlatePlugin';
import { getEditorPlugin } from './getEditorPlugin';

describe('getEditorPlugin', () => {
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
    const context = getEditorPlugin(
      editor,
      testPlugin.configure({ options: { testOption: 't' } })
    );

    expect(context).toMatchObject({
      api: editor.api,
      editor,
      plugin: expect.objectContaining({ key: 'test', type: 'test-type' }),
      tf: editor.transforms,
      type: 'test-type',
    });
  });

  it('should work extendEditor', () => {
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

    const b = getEditorPlugin(editor, plugin);
    a = b;

    expect(a).toBeDefined();
  });

  it('should get plugin context by plugin key', () => {
    const context = getEditorPlugin(editor, { key: 'test' });

    expect(context).toMatchObject({
      api: editor.api,
      editor,
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

    const context = getEditorPlugin(editor, unresolvedPlugin);

    expect(context).toMatchObject({
      api: editor.api,
      editor,
      plugin: expect.objectContaining({
        key: 'unresolved',
        type: 'unresolved-type',
      }),
      tf: editor.transforms,
      type: 'unresolved-type',
    });
  });
});

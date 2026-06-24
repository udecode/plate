import type { BasePlateEditor } from '../editor';
import type { PluginConfig } from './BasePlugin';
import type { AnyEditorPlugin, EditorPluginContext } from './EditorPlugin';

import { createBasePlateEditor } from '../editor';
import { createEditorPlugin } from './createEditorPlugin';
import { getEditorPlugin } from './getEditorPlugin';

describe('getEditorPlugin', () => {
  let editor: BasePlateEditor;
  let testPlugin: AnyEditorPlugin;

  beforeEach(() => {
    testPlugin = createEditorPlugin({
      key: 'test',
      node: { type: 'test-type' },
      options: {
        testOption: 'testValue',
      },
    });

    editor = createBasePlateEditor({
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
    expect('tf' in context).toBe(false);
  });

  it('work extendEditor', () => {
    type Config = PluginConfig<
      'test',
      {
        testOption: string;
      }
    >;
    const plugin = createEditorPlugin<Config>({
      key: 'test',
      node: { type: 'test-type' },
      options: {
        testOption: 'testValue',
      },
    });

    let a: EditorPluginContext<Config> = {} as any;

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
      type: 'test-type',
    });
    expect('tf' in context).toBe(false);
  });

  it('resolve unresolved plugin', () => {
    const unresolvedPlugin = createEditorPlugin({
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
    expect('tf' in context).toBe(false);
  });
});

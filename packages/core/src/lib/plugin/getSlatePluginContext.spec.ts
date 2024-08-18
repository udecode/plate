import type { SlateEditor } from '../editor';
import type { AnySlatePlugin } from './SlatePlugin';

import { createPlateEditor } from '../../react';
import { createSlatePlugin } from './createSlatePlugin';
import { getSlatePluginContext } from './getSlatePluginContext';

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
    const context = getSlatePluginContext(
      editor,
      testPlugin.configure({ options: { testOption: 't' } })
    );

    expect(context).toEqual({
      api: editor.api,
      editor,
      options: { testOption: 't' },
      plugin: expect.objectContaining({ key: 'test', type: 'test-type' }),
      transforms: editor.transforms,
      type: 'test-type',
    });
  });

  it('should get plugin context by plugin key', () => {
    const context = getSlatePluginContext(editor, { key: 'test' });

    expect(context).toEqual({
      api: editor.api,
      editor,
      options: testPlugin.options,
      plugin: expect.objectContaining({ key: 'test', type: 'test-type' }),
      transforms: editor.transforms,
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

    const context = getSlatePluginContext(editor, unresolvedPlugin);

    expect(context).toEqual({
      api: editor.api,
      editor,
      options: unresolvedPlugin.options,
      plugin: expect.objectContaining({
        key: 'unresolved',
        type: 'unresolved-type',
      }),
      transforms: editor.transforms,
      type: 'unresolved-type',
    });
  });
});

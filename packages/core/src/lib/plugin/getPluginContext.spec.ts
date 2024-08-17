import type { SlateEditor } from '../editor';
import type { AnySlatePlugin } from './SlatePlugin';

import { createPlateEditor } from '../../react';
import { createPlugin } from './createPlugin';
import { getPluginContext } from './getPluginContext';

describe('getPluginContext', () => {
  let editor: SlateEditor;
  let testPlugin: AnySlatePlugin;

  beforeEach(() => {
    testPlugin = createPlugin({
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
      transforms: editor.transforms,
      type: 'test-type',
    });
  });

  it('should get plugin context by plugin key', () => {
    const context = getPluginContext(editor, 'test');

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
    const unresolvedPlugin = createPlugin({
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
      transforms: editor.transforms,
      type: 'unresolved-type',
    });
  });
});

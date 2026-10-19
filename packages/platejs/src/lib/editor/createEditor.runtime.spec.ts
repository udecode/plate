import { expect, mock, test } from 'bun:test';

import { defineRuntimePlugin } from '../../facade';

let reactPluginCreated = false;

mock.module('plitejs/react', () => ({
  react: () => {
    reactPluginCreated = true;

    return defineRuntimePlugin('react-runtime-sentinel', {});
  },
}));

test('createEditor does not construct the React plugin', async () => {
  const { createEditor } = await import('../../index');
  const editor = createEditor();

  expect(editor.api.dom.focus).toBeInstanceOf(Function);
  expect(reactPluginCreated).toBeFalse();
});

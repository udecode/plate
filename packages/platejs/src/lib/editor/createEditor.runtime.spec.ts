import { expect, mock, test } from 'bun:test';

import { defineExtension } from 'plitejs';

let reactExtensionCreated = false;

mock.module('plitejs/react', () => ({
  react: () => {
    reactExtensionCreated = true;

    return defineExtension('react-runtime-sentinel', {});
  },
}));

test('createEditor does not construct the React extension', async () => {
  const { createEditor } = await import('../../index');
  const editor = createEditor();

  expect(editor.api.dom.focus).toBeInstanceOf(Function);
  expect(reactExtensionCreated).toBeFalse();
});

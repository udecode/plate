import { expect, mock, test } from 'bun:test';

import { defineExtension } from '@platejs/plite';

let reactExtensionCreated = false;

mock.module('@platejs/plite-react', () => ({
  react: () => {
    reactExtensionCreated = true;

    return defineExtension('react-runtime-sentinel', {});
  },
}));

test('createBaseEditor does not construct the React extension', async () => {
  const { createBaseEditor } = await import('../../index');
  const editor = createBaseEditor();

  expect(editor.api.dom.focus).toBeInstanceOf(Function);
  expect(reactExtensionCreated).toBeFalse();
});

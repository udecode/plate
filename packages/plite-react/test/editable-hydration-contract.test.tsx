import { act } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';

import { createReactEditor, Editable, Plite } from '../src';

const createFixture = () => {
  const editor = createReactEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
  });

  return (
    <Plite editor={editor}>
      <Editable autoCapitalize="sentences" autoCorrect="on" spellCheck />
    </Plite>
  );
};

test('Editable hydrates replacement-input attributes before applying mounted-root facts', async () => {
  const recoverableErrors: unknown[] = [];
  const consoleErrors: unknown[][] = [];
  const consoleError = vi
    .spyOn(console, 'error')
    .mockImplementation((...args) => {
      consoleErrors.push(args);
    });
  const fixture = createFixture();
  const container = document.createElement('div');
  let root: Root | undefined;

  try {
    container.innerHTML = renderToString(fixture);
    document.body.appendChild(container);

    const serverEditable = container.querySelector('[data-plite-editor]');

    expect(serverEditable).toHaveAttribute('autocapitalize', 'sentences');
    expect(serverEditable).toHaveAttribute('autocorrect', 'on');
    expect(serverEditable).toHaveAttribute('spellcheck', 'true');

    await act(async () => {
      root = hydrateRoot(container, fixture, {
        onRecoverableError(error) {
          recoverableErrors.push(error);
        },
      });
      await Promise.resolve();
    });

    const hydratedEditable = container.querySelector('[data-plite-editor]');

    expect(recoverableErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(hydratedEditable).toHaveAttribute('autocapitalize', 'false');
    expect(hydratedEditable).toHaveAttribute('autocorrect', 'false');
    expect(hydratedEditable).toHaveAttribute('spellcheck', 'false');
  } finally {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
    }
    container.remove();
    consoleError.mockRestore();
  }
});

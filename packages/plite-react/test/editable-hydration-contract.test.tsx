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
  const renderFixture = () => (
    <Plite editor={editor}>
      <Editable autoCapitalize="sentences" autoCorrect="on" spellCheck />
    </Plite>
  );

  return { editor, fixture: renderFixture(), renderFixture };
};

test('Editable hydrates replacement-input attributes before applying mounted-root facts', async () => {
  const recoverableErrors: unknown[] = [];
  const consoleErrors: unknown[][] = [];
  const consoleError = vi
    .spyOn(console, 'error')
    .mockImplementation((...args) => {
      consoleErrors.push(args);
    });
  const { fixture } = createFixture();
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

test('Editable hydrates separate editor runtimes without exposing their key scopes', async () => {
  const recoverableErrors: unknown[] = [];
  const consoleErrors: unknown[][] = [];
  const consoleError = vi
    .spyOn(console, 'error')
    .mockImplementation((...args) => {
      consoleErrors.push(args);
    });
  const server = createFixture();
  const client = createFixture();
  const container = document.createElement('div');
  let root: Root | undefined;

  try {
    container.innerHTML = renderToString(server.fixture);
    document.body.appendChild(container);

    const serverElement = container.querySelector(
      '[data-plite-node="element"]'
    );

    expect(serverElement).toHaveAttribute('data-plite-node-key', 'n0');

    await act(async () => {
      root = hydrateRoot(container, client.fixture, {
        onRecoverableError(error) {
          recoverableErrors.push(error);
        },
      });
      await Promise.resolve();
    });

    const clientElement = container.querySelector(
      '[data-plite-node="element"]'
    );

    expect(recoverableErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(clientElement).toHaveAttribute(
      'data-plite-node-key',
      client.editor.key([0])
    );

    await act(async () => {
      root?.render(client.renderFixture());
      await Promise.resolve();
    });

    expect(
      container.querySelector('[data-plite-node="element"]')
    ).toHaveAttribute('data-plite-node-key', client.editor.key([0]));
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

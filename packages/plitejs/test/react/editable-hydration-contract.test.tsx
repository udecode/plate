import { act } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';

import { createEditor, Editable, EditorRoot } from '../../src/react';

const createFixture = () => {
  const editor = createEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
  });
  const renderFixture = () => (
    <EditorRoot editor={editor}>
      <Editable autoCapitalize="sentences" autoCorrect="on" spellCheck />
    </EditorRoot>
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

    const serverEditable = container.querySelector('[data-editor]');

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

    const hydratedEditable = container.querySelector('[data-editor]');

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
      '[data-editor-node="element"]'
    );

    expect(serverElement).toHaveAttribute('data-editor-node-key', 'n0');

    await act(async () => {
      root = hydrateRoot(container, client.fixture, {
        onRecoverableError(error) {
          recoverableErrors.push(error);
        },
      });
      await Promise.resolve();
    });

    const clientElement = container.querySelector(
      '[data-editor-node="element"]'
    );

    expect(recoverableErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(clientElement).toHaveAttribute(
      'data-editor-node-key',
      client.editor.key([0])
    );

    await act(async () => {
      root?.render(client.renderFixture());
      await Promise.resolve();
    });

    expect(
      container.querySelector('[data-editor-node="element"]')
    ).toHaveAttribute('data-editor-node-key', client.editor.key([0]));
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

test('content boundaries hydrate without exposing server runtime key scopes', async () => {
  const recoverableErrors: unknown[] = [];
  const consoleErrors: unknown[][] = [];
  const consoleError = vi
    .spyOn(console, 'error')
    .mockImplementation((...args) => {
      consoleErrors.push(args);
    });
  const createBoundaryFixture = () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
      ],
    });
    const renderElement = ({
      attributes,
      slots,
    }: Parameters<
      NonNullable<React.ComponentProps<typeof Editable>['renderElement']>
    >[0]) => (
      <div {...attributes}>
        {slots.contentBoundary({
          mounted: false,
          scope: { from: 0, type: 'children' },
        })}
      </div>
    );
    const renderFixture = () => (
      <EditorRoot editor={editor}>
        <Editable renderElement={renderElement} />
      </EditorRoot>
    );

    return { editor, fixture: renderFixture(), renderFixture };
  };
  const server = createBoundaryFixture();
  const client = createBoundaryFixture();
  const container = document.createElement('div');
  let root: Root | undefined;

  try {
    container.innerHTML = renderToString(server.fixture);
    document.body.appendChild(container);

    const serverBoundary = container.querySelector(
      '[data-editor-dom-coverage-boundary]'
    );

    expect(serverBoundary).toHaveAttribute(
      'data-editor-dom-coverage-boundary',
      'content-boundary:n0:children:0:0'
    );

    await act(async () => {
      root = hydrateRoot(container, client.fixture, {
        onRecoverableError(error) {
          recoverableErrors.push(error);
        },
      });
      await Promise.resolve();
    });

    expect(recoverableErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(
      container.querySelector('[data-editor-dom-coverage-boundary]')
    ).toHaveAttribute(
      'data-editor-dom-coverage-boundary',
      `content-boundary:${client.editor.key([0])}:children:0:0`
    );

    await act(async () => {
      root?.render(client.renderFixture());
      await Promise.resolve();
    });

    expect(recoverableErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
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

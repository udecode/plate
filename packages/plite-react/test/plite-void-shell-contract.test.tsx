import { act } from '@testing-library/react';
import React from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { PliteInlineVoidShell } from '../src/components/plite-void-shell';

const MAC_OS_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15';

const InlineVoidFixture = () => (
  <PliteInlineVoidShell content={<span data-testid="void-content">void</span>}>
    <span data-testid="void-anchor">anchor</span>
  </PliteInlineVoidShell>
);

const setNavigator = (value: { userAgent: string } | undefined) => {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value,
  });
};

const restoreNavigator = (descriptor: PropertyDescriptor | undefined) => {
  if (descriptor) {
    Object.defineProperty(globalThis, 'navigator', descriptor);
    return;
  }

  Reflect.deleteProperty(globalThis, 'navigator');
};

test('PliteInlineVoidShell hydrates with the same initial order on Mac clients', async () => {
  const originalNavigator = Object.getOwnPropertyDescriptor(
    globalThis,
    'navigator'
  );
  const recoverableErrors: unknown[] = [];
  let container: HTMLDivElement | undefined;
  let root: Root | undefined;

  try {
    setNavigator(undefined);

    container = document.createElement('div');
    container.innerHTML = renderToString(<InlineVoidFixture />);
    document.body.appendChild(container);

    setNavigator({ userAgent: MAC_OS_USER_AGENT });

    await act(async () => {
      root = hydrateRoot(container, <InlineVoidFixture />, {
        onRecoverableError(error) {
          recoverableErrors.push(error);
        },
      });
      await Promise.resolve();
    });

    expect(recoverableErrors).toEqual([]);
  } finally {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
    }
    container?.remove();
    restoreNavigator(originalNavigator);
  }
});

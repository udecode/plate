import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '../../src/playwright/native-event-trace';

const rootLocator = (root: HTMLElement) =>
  ({
    evaluate: async <Result, Arg>(
      callback: (element: HTMLElement, arg: Arg) => Result,
      arg: Arg
    ) => callback(root, arg),
  }) as Parameters<typeof startBrowserNativeEventTrace>[0];

it('tells trusted keys from synthetic ones and keeps counting past the entry cap', async () => {
  document.body.innerHTML = '<div contenteditable="true"></div>';
  const root = document.querySelector<HTMLElement>('[contenteditable]')!;
  const locator = rootLocator(root);

  await startBrowserNativeEventTrace(locator, {
    events: ['keydown'],
    maxEntries: 3,
  });
  root.focus();
  root.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'x' }));
  await userEvent.keyboard('abc');
  root.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'y' }));

  const { entries } = await takeBrowserNativeEventTrace(locator);

  expect(
    entries.map(({ isTrusted, key, seq, type }) => ({
      isTrusted,
      key,
      seq,
      type,
    }))
  ).toEqual([
    { isTrusted: true, key: 'b', seq: 3, type: 'keydown' },
    { isTrusted: true, key: 'c', seq: 4, type: 'keydown' },
    { isTrusted: false, key: 'y', seq: 5, type: 'keydown' },
  ]);
});

import type { Locator } from '@playwright/test';
import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  dispatchSyntheticKey,
  parsePlainSyntheticKey,
  parseSyntheticShortcut,
} from '../../src/playwright/keyboard';

const NAMED_KEYS = [
  'Enter',
  'Escape',
  'Tab',
  'Backspace',
  'Delete',
  'ArrowLeft',
  'ArrowUp',
  'ArrowRight',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
];

it('gives synthetic named keys the key, code and keyCode of a native press', async () => {
  document.body.innerHTML = '<div contenteditable="true"></div>';
  const root = document.querySelector<HTMLElement>('[contenteditable]')!;
  const locator = {
    evaluate: async <Result, Arg>(
      callback: (element: HTMLElement, arg: Arg) => Result,
      arg: Arg
    ) => callback(root, arg),
    page: () => ({ waitForTimeout: async () => {} }),
  } as unknown as Locator;
  const seen: object[] = [];

  root.addEventListener('keydown', (event) => {
    event.preventDefault();
    seen.push({
      code: event.code,
      key: event.key,
      keyCode: event.keyCode,
      which: event.which,
    });
  });
  root.focus();

  for (const key of NAMED_KEYS) await userEvent.keyboard(`{${key}}`);
  const native = seen.splice(0);

  for (const key of NAMED_KEYS) {
    await dispatchSyntheticKey(locator, parsePlainSyntheticKey(key)!);
  }
  const plain = seen.splice(0);

  for (const key of NAMED_KEYS) {
    await dispatchSyntheticKey(
      locator,
      parseSyntheticShortcut(`ControlOrMeta+${key}`, 'darwin')!
    );
  }
  const shortcut = seen.splice(0);

  expect({ plain, shortcut }).toEqual({ plain: native, shortcut: native });
});

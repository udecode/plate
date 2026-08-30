import { describe, expect, test } from 'bun:test';

import { recordPliteBrowserRuntimeErrors } from '../../src/playwright/runtime-errors';

type PageEvent = 'console' | 'pageerror';

const createPage = () => {
  const listeners = new Map<PageEvent, (value: unknown) => void>();

  return {
    emit: (event: PageEvent, value: unknown) => listeners.get(event)?.(value),
    page: {
      off: () => {},
      on: (event: PageEvent, listener: (value: unknown) => void) => {
        listeners.set(event, listener);
      },
    } as unknown as Parameters<typeof recordPliteBrowserRuntimeErrors>[0],
  };
};

describe('Playwright runtime errors', () => {
  test('ignores Vimeo cookie access denied by its sandbox', () => {
    const { emit, page } = createPage();
    const recorder = recordPliteBrowserRuntimeErrors(page);

    emit(
      'pageerror',
      new Error(
        "SecurityError: Document.cookie getter: Forbidden in a sandboxed document without the 'allow-same-origin' flag.\n" +
          'at https://player.vimeo.com/video/26689853'
      )
    );

    recorder.assertNone();
  });

  test('keeps the same cookie error from first-party pages', () => {
    const { emit, page } = createPage();
    const recorder = recordPliteBrowserRuntimeErrors(page);

    emit(
      'pageerror',
      new Error(
        "SecurityError: Document.cookie getter: Forbidden in a sandboxed document without the 'allow-same-origin' flag."
      )
    );

    expect(recorder.errors).toHaveLength(1);
  });
});

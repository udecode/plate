import { describe, expect, test } from 'bun:test';

import { recordBrowserRuntimeErrors } from '../../src/playwright/runtime-errors';

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
    } as unknown as Parameters<typeof recordBrowserRuntimeErrors>[0],
  };
};

describe('Playwright runtime errors', () => {
  test.each([
    'DOMResolutionError: Cannot resolve a DOM node from Plite node: {"children":[{"text":"One canonical text."}]}',
    'DOMResolutionError: Cannot resolve a DOM point from Plite point: {"path":[0,0],"offset":0}',
    'DOMResolutionError: Cannot resolve a DOM range from Plite range',
  ])(
    'rejects a caught DOM resolution error logged to the console: %s',
    (text) => {
      const { emit, page } = createPage();
      const recorder = recordBrowserRuntimeErrors(page);

      emit('console', { text: () => text, type: () => 'error' });

      expect(recorder.errors).toEqual([text]);
      expect(() => recorder.assertNone()).toThrow();
    }
  );

  test('uses custom console patterns instead of the defaults', () => {
    const { emit, page } = createPage();
    const recorder = recordBrowserRuntimeErrors(page, {
      patterns: ['Custom application failure'],
    });

    emit('console', {
      text: () => 'Cannot resolve a DOM node from Plite node',
      type: () => 'error',
    });
    recorder.assertNone();

    emit('console', {
      text: () => 'Custom application failure',
      type: () => 'error',
    });

    expect(recorder.errors).toEqual(['Custom application failure']);
    expect(() => recorder.assertNone()).toThrow();
  });

  test('ignores unrelated console errors and non-error DOM messages', () => {
    const { emit, page } = createPage();
    const recorder = recordBrowserRuntimeErrors(page);

    emit('console', {
      text: () => 'An unrelated console error',
      type: () => 'error',
    });
    emit('console', {
      text: () => 'Cannot resolve a DOM node from Plite node',
      type: () => 'warning',
    });

    recorder.assertNone();
  });

  test('ignores Vimeo cookie access denied by its sandbox', () => {
    const { emit, page } = createPage();
    const recorder = recordBrowserRuntimeErrors(page);

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
    const recorder = recordBrowserRuntimeErrors(page);

    emit(
      'pageerror',
      new Error(
        "SecurityError: Document.cookie getter: Forbidden in a sandboxed document without the 'allow-same-origin' flag."
      )
    );

    expect(recorder.errors).toHaveLength(1);
  });
});

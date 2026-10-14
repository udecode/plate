import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { DOMResolutionError } from 'platejs/dom';
import { createEditor } from 'platejs/react';

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
  beforeAll(() => {
    if (!GlobalRegistrator.isRegistered) {
      GlobalRegistrator.register();
    }
  });

  afterAll(async () => {
    if (GlobalRegistrator.isRegistered) {
      await GlobalRegistrator.unregister();
    }
  });

  test('records the editor DOM resolution errors logged to the console', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });
    const detached = { children: [{ text: 'detached' }], type: 'paragraph' };
    const logged = [
      () => editor.api.dom.assertPath(detached),
      () => editor.api.dom.assertDOMNode(detached),
      () => editor.api.dom.assertNode(document.createElement('span')),
    ].map((resolve) => {
      try {
        resolve();
      } catch (error) {
        if (!(error instanceof DOMResolutionError)) throw error;

        return String(error);
      }

      throw new Error('Expected the editor to refuse a detached node');
    });
    const { emit, page } = createPage();
    const recorder = recordBrowserRuntimeErrors(page);

    for (const text of [...logged, 'An unrelated console error']) {
      emit('console', { text: () => text, type: () => 'error' });
    }

    expect(recorder.errors).toEqual(logged);
  });

  test('uses custom console patterns instead of the defaults', () => {
    const { emit, page } = createPage();
    const recorder = recordBrowserRuntimeErrors(page, {
      patterns: ['Custom application failure'],
    });

    emit('console', {
      text: () => 'Cannot resolve a DOM node from an editor node',
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

  test('ignores DOM resolution messages logged below error level', () => {
    const { emit, page } = createPage();
    const recorder = recordBrowserRuntimeErrors(page);

    emit('console', {
      text: () => 'Cannot resolve a DOM node from an editor node',
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

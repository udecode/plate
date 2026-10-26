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
      url: () => 'http://127.0.0.1:3102/examples/plite/embeds',
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

  test('names the resource a failed load could not fetch', () => {
    const { emit, page } = createPage();
    const recorder = recordBrowserRuntimeErrors(page, { strict: true });

    emit('console', {
      location: () => ({ url: 'http://localhost:3000/site.webmanifest' }),
      text: () => 'Failed to load resource: Could not connect to the server.',
      type: () => 'error',
    });

    expect(recorder.errors).toEqual([
      'Failed to load resource: Could not connect to the server. (http://localhost:3000/site.webmanifest)',
    ]);
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

  test('ignores errors thrown only by third-party frames', () => {
    const { emit, page } = createPage();
    const recorder = recordBrowserRuntimeErrors(page);
    const turnstile =
      'TypeError: W[bk(...)] is not a function\n' +
      '    at https://challenges.cloudflare.com/cdn-cgi/challenge-platform/h/b/turnstile/f/av0/rch/1y0ou/0x4AAAAAAAbaszMygKLnGbeo/auto/fbE/new/normal?lang=auto:1:48468\n' +
      '    at https://challenges.cloudflare.com/cdn-cgi/challenge-platform/h/b/turnstile/f/av0/rch/1y0ou/0x4AAAAAAAbaszMygKLnGbeo/auto/fbE/new/normal?lang=auto:1:149140';

    emit(
      'pageerror',
      Object.assign(new Error('W[bk(...)] is not a function'), {
        stack: turnstile,
      })
    );
    emit(
      'pageerror',
      new Error(
        "SecurityError: Document.cookie getter: Forbidden in a sandboxed document without the 'allow-same-origin' flag.\n" +
          'at https://player.vimeo.com/video/26689853'
      )
    );

    recorder.assertNone();
  });

  test('ignores the loads WebKit blocks for access control', () => {
    const { emit, page } = createPage();
    const recorder = recordBrowserRuntimeErrors(page);

    emit(
      'pageerror',
      Object.assign(
        new Error(
          '/player.vimeo.com/cdn-cgi/challenge-platform/h/b/precursor/d2d3316b729e/a50c70d0eb7caa7c due to access control checks.'
        ),
        { name: 'XMLHttpRequest cannot load https', stack: '' }
      )
    );

    recorder.assertNone();
  });

  test('keeps errors thrown by the page itself', () => {
    const { emit, page } = createPage();
    const recorder = recordBrowserRuntimeErrors(page);

    emit(
      'pageerror',
      new Error(
        "SecurityError: Document.cookie getter: Forbidden in a sandboxed document without the 'allow-same-origin' flag."
      )
    );
    emit(
      'pageerror',
      Object.assign(new Error('getFlatTreeParentElement is not defined'), {
        stack:
          'ReferenceError: getFlatTreeParentElement is not defined\n' +
          '    at http://127.0.0.1:3102/_next/static/chunks/07ny7dx4ixl0f.js:1:691007\n' +
          '    at onMouseMoveCapture (http://127.0.0.1:3102/_next/static/chunks/2geglbgjevq3q.js:1:237084)',
      })
    );
    emit(
      'pageerror',
      Object.assign(
        new Error(
          'Error: Could not load embed https://player.vimeo.com/video/26689853'
        ),
        { name: 'Unhandled Promise Rejection', stack: '' }
      )
    );

    expect(recorder.errors).toHaveLength(3);
    expect(recorder.errors[2]).toBe(
      'Unhandled Promise Rejection: Error: Could not load embed https://player.vimeo.com/video/26689853'
    );
  });
});

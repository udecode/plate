/* eslint-disable unicorn/prefer-event-target -- Playwright Page uses EventEmitter on/off semantics. */
import { describe, expect, test } from 'bun:test';
import { EventEmitter } from 'node:events';

import type { Page } from '@playwright/test';

import { recordPliteBrowserRuntimeErrors } from '../../src/playwright/runtime-errors';

describe('browser runtime error capture', () => {
  test('strict capture retains every error, supports reset, and detaches listeners', () => {
    const page = new EventEmitter();
    const recorder = recordPliteBrowserRuntimeErrors(page as unknown as Page, {
      strict: true,
    });
    const ignoredByDefault =
      "Permission policy 'Fullscreen' check failed https://player.vimeo.com";
    page.emit('console', {
      type: () => 'error',
      text: () => 'unclassified error',
    });
    page.emit('console', { type: () => 'warning', text: () => 'warning' });
    page.emit('pageerror', new Error(ignoredByDefault));
    expect(recorder.errors).toHaveLength(2);
    expect(recorder.errors[0]).toBe('unclassified error');
    expect(recorder.errors[1]).toContain(ignoredByDefault);
    expect(() => recorder.assertNone()).toThrow();
    recorder.reset();
    recorder.assertNone();
    recorder.stop();
    expect(page.listenerCount('console')).toBe(0);
    expect(page.listenerCount('pageerror')).toBe(0);
    page.emit('console', { type: () => 'error', text: () => 'after cleanup' });
    expect(recorder.errors).toEqual([]);
  });

  test('default and custom policies keep their console filters and approved ignores', () => {
    for (const patterns of [undefined, ['custom failure']]) {
      const page = new EventEmitter();
      const recorder = recordPliteBrowserRuntimeErrors(
        page as unknown as Page,
        { patterns }
      );
      const matched = patterns ? 'custom failure' : 'Cannot resolve a DOM node';
      for (const text of ['unclassified error', matched]) {
        page.emit('console', { type: () => 'error', text: () => text });
      }
      page.emit(
        'pageerror',
        new Error(
          "Permission policy 'Fullscreen' check failed https://player.vimeo.com"
        )
      );
      page.emit('pageerror', new Error('runtime failure'));
      expect(recorder.errors).toHaveLength(2);
      expect(recorder.errors[0]).toBe(matched);
      expect(recorder.errors[1]).toContain('runtime failure');
      recorder.stop();
    }
  });
});

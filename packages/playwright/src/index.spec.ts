import { describe, expect, it } from 'bun:test';

import {
  clickAtPath,
  getDOMNodeByPath,
  getEditable,
  getEditorHandle,
  getNodeByPath,
  getSelection,
  getTypeAtPath,
  PlaywrightPlugin,
  setSelection,
  usePlaywrightAdapter,
} from '.';

describe('@platejs/playwright exports', () => {
  it('exports the first-party Playwright harness helpers', () => {
    expect(typeof clickAtPath).toBe('function');
    expect(typeof getDOMNodeByPath).toBe('function');
    expect(typeof getEditable).toBe('function');
    expect(typeof getEditorHandle).toBe('function');
    expect(typeof getNodeByPath).toBe('function');
    expect(typeof getSelection).toBe('function');
    expect(typeof getTypeAtPath).toBe('function');
    expect(typeof PlaywrightPlugin).toBe('object');
    expect(typeof setSelection).toBe('function');
    expect(typeof usePlaywrightAdapter).toBe('function');
  });
});

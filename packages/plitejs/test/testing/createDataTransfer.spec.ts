import { describe, expect, it } from 'bun:test';

import { createDataTransfer } from '../../src/testing/createDataTransfer';

describe('createDataTransfer', () => {
  it('reads and writes string clipboard data', () => {
    const dataMap = new Map([['text/plain', 'before']]);
    const dataTransfer = createDataTransfer(dataMap);

    expect(dataTransfer.getData('text/plain')).toBe('before');
    expect(dataTransfer.getData('text/html')).toBe('');
    expect(dataTransfer.setData('text/plain', 'after')).toBeUndefined();
    expect(dataMap.get('text/plain')).toBe('after');
  });
});

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

  it('lists the types it holds and no files', () => {
    const dataTransfer = createDataTransfer(
      new Map([['text/plain', 'before']])
    );

    dataTransfer.setData('text/html', '<p>after</p>');

    expect([dataTransfer.types, dataTransfer.files.length]).toEqual([
      ['text/plain', 'text/html'],
      0,
    ]);
  });
});

import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { setDebugValueScrubber } from '../src';
import { formatDebugValue } from '../src/internal';

describe('formatDebugValue', () => {
  afterEach(() => {
    setDebugValueScrubber(undefined);
  });

  it('formats circular values without leaking text content', () => {
    const value: { child?: unknown; text: string } = { text: 'alpha' };
    value.child = value;

    assert.equal(
      formatDebugValue(value),
      '{"text":"[text length 5]","child":"[Circular]"}'
    );
  });

  it('falls back when JSON serialization throws', () => {
    assert.equal(formatDebugValue(1n), '[object BigInt]');
  });

  it('applies the configured scrubber before default text redaction', () => {
    const value: { child?: unknown; text: string } = { text: 'secret' };
    value.child = value;

    setDebugValueScrubber((key, item) =>
      key === 'text' ? '[redacted]' : item
    );

    assert.equal(
      formatDebugValue(value),
      '{"text":"[redacted]","child":"[Circular]"}'
    );
  });

  it('keeps user text out of structural error messages by default', () => {
    const value = {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'private customer sentence' }],
        },
      ],
    };

    const message = formatDebugValue(value);

    assert.equal(message.includes('private customer sentence'), false);
    assert.match(message, /\[text length 25\]/);
  });
});

import { BaseDatePlugin } from '../../../date/src/lib';

import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

describe('markdown date element', () => {
  it('round-trips inline date elements through the markdown package surfaces', () => {
    const editor = createTestEditor([BaseDatePlugin]);
    const input = 'Date: <date>2024-01-01</date>';
    const expected = 'Date: <date value="2024-01-01" />\n';

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject([
      {
        children: [
          { text: 'Date: ' },
          {
            children: [{ text: '' }],
            date: '2024-01-01',
            type: 'date',
          },
        ],
        type: 'p',
      },
    ]);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });

  it('reads attribute-bearing date elements into the canonical node value', () => {
    const editor = createTestEditor([BaseDatePlugin]);
    const input = 'Date: <date value="2024-01-01" />';

    const value = deserializeMd(editor, input);
    const markdown = serializeMd(editor, { value: value as any });

    expect(value).toMatchObject([
      {
        children: [
          { text: 'Date: ' },
          {
            children: [{ text: '' }],
            date: '2024-01-01',
            type: 'date',
          },
        ],
        type: 'p',
      },
    ]);
    expect(markdown).toBe('Date: <date value="2024-01-01" />\n');
  });

  it('keeps non-normalizable legacy child text on the raw fallback path', () => {
    const editor = createTestEditor([BaseDatePlugin]);
    const input = 'Date: <date>sometime next week</date>';

    const value = deserializeMd(editor, input);
    const markdown = serializeMd(editor, { value: value as any });

    expect(value).toMatchObject([
      {
        children: [
          { text: 'Date: ' },
          {
            children: [{ text: '' }],
            rawDate: 'sometime next week',
            type: 'date',
          },
        ],
        type: 'p',
      },
    ]);
    expect(markdown).toBe('Date: <date>sometime next week</date>\n');
  });

  it('upgrades safe legacy child-text dates onto the canonical attribute writer', () => {
    const editor = createTestEditor([BaseDatePlugin]);
    const input = 'Date: <date>Mon Mar 23 2026</date>';

    const value = deserializeMd(editor, input);
    const markdown = serializeMd(editor, { value: value as any });

    expect(value).toMatchObject([
      {
        children: [
          { text: 'Date: ' },
          {
            children: [{ text: '' }],
            date: '2026-03-23',
            type: 'date',
          },
        ],
        type: 'p',
      },
    ]);
    expect(markdown).toBe('Date: <date value="2026-03-23" />\n');
  });
});

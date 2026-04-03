import { BaseDatePlugin } from '../../../date/src/lib';

import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

describe('markdown date element', () => {
  it('round-trips inline date elements through the markdown package surfaces', () => {
    const editor = createTestEditor([BaseDatePlugin]);
    const input = 'Date: <date>2024-01-01</date>';
    const expected = 'Date: <date>2024-01-01</date>\n';

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
});

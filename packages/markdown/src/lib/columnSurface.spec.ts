import {
  BaseColumnItemPlugin,
  BaseColumnPlugin,
} from '../../../layout/src/lib';

import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

describe('column package surfaces', () => {
  const createColumnEditor = () =>
    createTestEditor([BaseColumnPlugin, BaseColumnItemPlugin]);

  it('round-trips a column group through the markdown package surfaces', () => {
    const editor = createColumnEditor();
    const input = `<column_group layout="[50,50]">
  <column width="50%">
    Left column
  </column>

  <column width="50%">
    Right column
  </column>
</column_group>
`;

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [{ text: 'Left column' }],
                type: 'p',
              },
            ],
            type: 'column',
            width: '50%',
          },
          {
            children: [
              {
                children: [{ text: 'Right column' }],
                type: 'p',
              },
            ],
            type: 'column',
            width: '50%',
          },
        ],
        layout: [50, 50],
        type: 'column_group',
      },
    ]);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(input);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });
});

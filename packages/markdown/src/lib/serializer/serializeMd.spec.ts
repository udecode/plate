import { createTestEditor } from './__tests__/createTestEditor';
import { testValue } from './__tests__/testValue';
import { serializeMd } from './serializeMd';

describe('serializeMd', () => {
  it('should serialize a simple paragraph', () => {
    const editor = createTestEditor();
    const result = serializeMd(editor as any, { value: testValue });
    expect(result).toMatchSnapshot();
  });

  // https://github.com/inokawa/remark-slate-transformer/issues/44
  it('should serialize marks with trailing whitespace', () => {
    const editor = createTestEditor();

    const slateNodes = [
      {
        children: [
          {
            text: 'Make text ',
          },
          {
            bold: true,
            text: 'bold',
          },
          {
            text: ', ',
          },
          {
            italic: true,
            text: 'italic',
          },
          {
            text: ', ',
          },
          {
            text: 'underlined',
            underline: true,
          },
          {
            text: ', or apply a ',
          },
          {
            bold: true,
            italic: true,
            text: 'combination',
            underline: true,
          },
          {
            text: ' of these styles for a visually striking effect.',
          },
        ],
        type: 'p',
      },
    ];
    const result = serializeMd(editor as any, { value: slateNodes });
    expect(result).toMatchSnapshot();
  });
});

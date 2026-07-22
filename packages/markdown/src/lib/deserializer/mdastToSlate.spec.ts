import {
  createTestEditor,
  getTestDeserializeOptions,
} from '../__tests__/createTestEditor';
import { mdastToSlate } from './mdastToSlate';

describe('mdastToSlate', () => {
  it('keeps children without positions when splitLineBreaks is enabled', () => {
    const editor = createTestEditor();

    expect(
      mdastToSlate(
        {
          children: [
            {
              children: [{ type: 'text', value: 'first' }],
              position: {
                end: { column: 1, line: 1 },
                start: { column: 1, line: 1 },
              },
              type: 'paragraph',
            },
            {
              children: [{ type: 'text', value: 'second' }],
              type: 'paragraph',
            },
          ],
          position: {
            end: { column: 1, line: 2 },
            start: { column: 1, line: 1 },
          },
          type: 'root',
        },
        getTestDeserializeOptions(editor, { splitLineBreaks: true })
      )
    ).toEqual([
      {
        children: [{ text: 'first' }],
        type: 'p',
      },
      {
        children: [{ text: 'second' }],
        type: 'p',
      },
    ]);
  });
});

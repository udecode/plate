import { createTestEditor } from '../__tests__/createTestEditor';
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
                end: { line: 1 },
                start: { line: 1 },
              },
              type: 'paragraph',
            },
            {
              children: [{ type: 'text', value: 'second' }],
              type: 'paragraph',
            },
          ],
          position: {
            end: { line: 2 },
            start: { line: 1 },
          },
          type: 'root',
        } as any,
        {
          editor,
          splitLineBreaks: true,
        } as any
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

import { createTestEditor } from '../../__tests__/createTestEditor';
import { markdownToSlateNodesSafely } from './markdownToSlateNodesSafely';

describe('markdownToSlateNodesSafely', () => {
  it('deserializes normal markdown when there is no incomplete MDX tail', () => {
    const editor = createTestEditor();

    expect(markdownToSlateNodesSafely(editor, 'plain **bold**')).toEqual([
      {
        children: [{ text: 'plain ' }, { bold: true, text: 'bold' }],
        type: 'p',
      },
    ]);
  });

  it('appends incomplete inline MDX text to the last non-void block', () => {
    const editor = createTestEditor();

    expect(
      markdownToSlateNodesSafely(editor, '<callout>ok</callout><callout>')
    ).toEqual([
      {
        children: [
          {
            children: [{ text: 'ok' }],
            type: 'callout',
          },
          { text: '<callout>' },
        ],
        type: 'p',
      },
    ]);
  });

  it('keeps incomplete inline MDX text out of the previous marked text leaf', () => {
    const editor = createTestEditor();

    expect(markdownToSlateNodesSafely(editor, '**bold**<u>')).toEqual([
      {
        children: [
          { bold: true, text: 'bold' },
          {
            text: '<u>',
          },
        ],
        type: 'p',
      },
    ]);
  });

  it('preserves marked leaves in the incomplete inline MDX fallback tail', () => {
    const editor = createTestEditor();

    expect(markdownToSlateNodesSafely(editor, 'plain <u> **bold**')).toEqual([
      {
        children: [
          { text: 'plain' },
          { text: '<u>' },
          { text: ' ' },
          { bold: true, text: 'bold' },
        ],
        type: 'p',
      },
    ]);
  });

  it('wraps incomplete inline MDX in a new paragraph when there are no complete blocks', () => {
    const editor = createTestEditor();

    expect(markdownToSlateNodesSafely(editor, '<u>')).toEqual([
      {
        children: [{ text: '<u>' }],
        type: 'p',
      },
    ]);
  });

  it('falls back to editable text for malformed html-like mdx', () => {
    const editor = createTestEditor();

    expect(markdownToSlateNodesSafely(editor, String.raw`</ph\><`)).toEqual([
      {
        children: [{ text: '</ph><' }],
        type: 'p',
      },
    ]);
  });

  it('preserves completed MDX member tags before an incomplete tail', () => {
    const editor = createTestEditor();

    expect(
      markdownToSlateNodesSafely(editor, '<Foo.Bar>ok</Foo.Bar><u>', {
        rules: {
          'Foo.Bar': {
            deserialize: () => ({
              children: [{ text: 'member' }],
              type: 'member',
            }),
          },
        },
      })
    ).toEqual([
      {
        children: [
          {
            children: [{ text: 'member' }],
            type: 'member',
          },
          { text: '<u>' },
        ],
        type: 'p',
      },
    ]);
  });

  it('preserves complete void blocks before appending the fallback paragraph', () => {
    const editor = createTestEditor();

    expect(markdownToSlateNodesSafely(editor, '<hr /><u>')).toEqual([
      {
        children: [{ text: '' }],
        type: 'hr',
      },
      {
        children: [{ text: '<u>' }],
        type: 'p',
      },
    ]);
  });
});

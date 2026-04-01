import { NodeApi } from 'platejs';

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

  it('wraps incomplete inline MDX in a new paragraph when there are no complete blocks', () => {
    const editor = createTestEditor();

    expect(markdownToSlateNodesSafely(editor, '<u>')).toEqual([
      {
        children: [{ text: '<u>' }],
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

  it('keeps the full multiline incomplete MDX tail visible after a complete prefix', () => {
    const editor = createTestEditor();

    const result = markdownToSlateNodesSafely(
      editor,
      'before\n\n<column_group layout="[60,40]">\n<column width="60%">\n\n- Keep the editor aliv'
    );

    expect(result.map((node: any) => NodeApi.string(node))).toEqual([
      'before',
      '<column_group layout="[60,40]">\n<column width="60%">\n\n- Keep the editor aliv',
    ]);
  });
});

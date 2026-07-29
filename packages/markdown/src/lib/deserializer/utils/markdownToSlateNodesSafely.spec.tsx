import { createTestEditor } from '../../__tests__/createTestEditor';
import { MarkdownPlugin } from '../../MarkdownPlugin';
import type { DeserializeMdOptions } from '../../types';

import {
  markdownToSlateNodesSafelyWithRuntime,
  withMarkdownRuntime,
} from '../../internal/markdownConversion';

const parseSafely = (
  editor: ReturnType<typeof createTestEditor>,
  data: string,
  options?: DeserializeMdOptions
) =>
  withMarkdownRuntime(
    editor,
    editor.plugin(MarkdownPlugin).store.get(),
    (runtime) => markdownToSlateNodesSafelyWithRuntime(runtime, data, options)
  );

describe('markdownToSlateNodesSafely', () => {
  it('deserializes normal markdown when there is no incomplete MDX tail', () => {
    const editor = createTestEditor();

    expect(parseSafely(editor, 'plain **bold**')).toEqual([
      {
        children: [{ text: 'plain ' }, { bold: true, text: 'bold' }],
        type: 'p',
      },
    ]);
  });

  it('appends incomplete inline MDX text to the last non-void block', () => {
    const editor = createTestEditor();

    expect(parseSafely(editor, '<callout>ok</callout><callout>')).toEqual([
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

    expect(parseSafely(editor, '**bold**<u>')).toEqual([
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

    expect(parseSafely(editor, 'plain <u> **bold**')).toEqual([
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

    expect(parseSafely(editor, '<u>')).toEqual([
      {
        children: [{ text: '<u>' }],
        type: 'p',
      },
    ]);
  });

  it('falls back to editable text for malformed html-like mdx', () => {
    const editor = createTestEditor();

    expect(parseSafely(editor, String.raw`</ph\><`)).toEqual([
      {
        children: [{ text: '</ph><' }],
        type: 'p',
      },
    ]);
  });

  it('preserves completed MDX member tags before an incomplete tail', () => {
    const editor = createTestEditor();

    expect(
      parseSafely(editor, '<Foo.Bar>ok</Foo.Bar><u>', {
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

    expect(parseSafely(editor, '<hr /><u>')).toEqual([
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

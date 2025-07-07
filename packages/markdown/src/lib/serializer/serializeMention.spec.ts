import { createPlateEditor } from '@platejs/core/react';
import { BaseMentionPlugin } from '@platejs/mention';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { remarkMention } from '../plugins/remarkMention';
import { serializeMd } from './serializeMd';

describe('serializeMd - mention', () => {
  it('should serialize mentions to @username format', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseMentionPlugin,
        MarkdownPlugin.configure({
          options: {
            remarkPlugins: [remarkMention],
          },
        }),
      ],
      value: [
        {
          children: [
            { text: 'Hello ' },
            {
              children: [{ text: '' }],
              type: 'mention',
              value: 'alice',
            },
            { text: ' how are you?' },
          ],
          type: 'p',
        },
      ],
    });

    const markdown = serializeMd(editor);
    expect(markdown).toBe('Hello @alice how are you?\n');
  });

  it('should serialize multiple mentions', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseMentionPlugin,
        MarkdownPlugin.configure({
          options: {
            remarkPlugins: [remarkMention],
          },
        }),
      ],
      value: [
        {
          children: [
            {
              children: [{ text: '' }],
              type: 'mention',
              value: 'bob',
            },
            { text: ' mentioned ' },
            {
              children: [{ text: '' }],
              type: 'mention',
              value: 'charlie',
            },
            { text: ' in the discussion' },
          ],
          type: 'p',
        },
      ],
    });

    const markdown = serializeMd(editor);
    expect(markdown).toBe('@bob mentioned @charlie in the discussion\n');
  });

  it('should serialize mentions with spaces using link format', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseMentionPlugin,
        MarkdownPlugin.configure({
          options: {
            remarkPlugins: [remarkMention],
          },
        }),
      ],
      value: [
        {
          children: [
            { text: 'Hey ' },
            {
              children: [{ text: '' }],
              type: 'mention',
              value: 'John Doe',
            },
            { text: ' check this out' },
          ],
          type: 'p',
        },
      ],
    });

    const markdown = serializeMd(editor);
    expect(markdown).toBe(
      'Hey [John Doe](mention:John%20Doe) check this out\n'
    );
  });

  it('should round-trip mentions correctly', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseMentionPlugin,
        MarkdownPlugin.configure({
          options: {
            remarkPlugins: [remarkMention],
          },
        }),
      ],
    });

    const originalMarkdown =
      'Hello [Jane Smith](mention:Jane%20Smith) and @bob!';
    const value = editor.api.markdown.deserialize(originalMarkdown);
    editor.children = value;
    const serializedMarkdown = serializeMd(editor);

    expect(serializedMarkdown).toBe(
      'Hello [Jane Smith](mention:Jane%20Smith) and @bob!\n'
    );
  });

  it('should serialize complex mentions with special characters', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseMentionPlugin,
        MarkdownPlugin.configure({
          options: {
            remarkPlugins: [remarkMention],
          },
        }),
      ],
      value: [
        {
          children: [
            { text: 'Assigned to ' },
            {
              children: [{ text: '' }],
              type: 'mention',
              value: 'QA Team (US)',
            },
            { text: ' and ' },
            {
              children: [{ text: '' }],
              type: 'mention',
              value: 'dev-team',
            },
          ],
          type: 'p',
        },
      ],
    });

    const markdown = serializeMd(editor);
    expect(markdown).toBe(
      'Assigned to [QA Team (US)](mention:QA%20Team%20%28US%29) and @dev-team\n'
    );
  });
});

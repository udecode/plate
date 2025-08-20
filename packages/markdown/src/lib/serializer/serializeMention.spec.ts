import { BaseMentionPlugin } from '@platejs/mention';

import { createTestEditor } from '../__tests__/createTestEditor';
import { serializeMd } from './serializeMd';

describe('serializeMd - mention', () => {
  it('should serialize mentions to link format', () => {
    const editor = createTestEditor([BaseMentionPlugin]);
    editor.children = [
      {
        children: [
          { text: 'Hello ' },
          {
            key: 'alice',
            children: [{ text: '' }],
            type: 'mention',
            value: 'alice',
          },
          { text: ' how are you?' },
        ],
        type: 'p',
      },
    ];

    const markdown = serializeMd(editor);
    expect(markdown).toBe('Hello [alice](mention:alice) how are you?\n');
  });

  it('should serialize multiple mentions', () => {
    const editor = createTestEditor([BaseMentionPlugin]);
    editor.children = [
      {
        children: [
          {
            key: 'bob',
            children: [{ text: '' }],
            type: 'mention',
            value: 'bob',
          },
          { text: ' mentioned ' },
          {
            key: 'charlie',
            children: [{ text: '' }],
            type: 'mention',
            value: 'charlie',
          },
          { text: ' in the discussion' },
        ],
        type: 'p',
      },
    ];

    const markdown = serializeMd(editor);
    expect(markdown).toBe(
      '[bob](mention:bob) mentioned [charlie](mention:charlie) in the discussion\n'
    );
  });

  it('should serialize mentions with spaces using link format', () => {
    const editor = createTestEditor([BaseMentionPlugin]);
    editor.children = [
      {
        children: [
          { text: 'Hey ' },
          {
            key: 'john_doe',
            children: [{ text: '' }],
            type: 'mention',
            value: 'John Doe',
          },
          { text: ' check this out' },
        ],
        type: 'p',
      },
    ];

    const markdown = serializeMd(editor);
    expect(markdown).toBe('Hey [John Doe](mention:john_doe) check this out\n');
  });

  it('should use key for URL when both key and value are present', () => {
    const editor = createTestEditor([BaseMentionPlugin]);
    editor.children = [
      {
        children: [
          { text: 'Hey ' },
          {
            key: 'john_doe',
            children: [{ text: '' }],
            type: 'mention',
            value: 'John Doe',
          },
          { text: ' check this out' },
        ],
        type: 'p',
      },
    ];

    const markdown = serializeMd(editor);
    expect(markdown).toBe('Hey [John Doe](mention:john_doe) check this out\n');
  });

  it('should round-trip mentions correctly', () => {
    const editor = createTestEditor([BaseMentionPlugin]);

    const originalMarkdown = 'Hello [Jane Smith](mention:jane_smith) and @bob!';
    const value = editor.api.markdown.deserialize(originalMarkdown);
    editor.children = value;
    const serializedMarkdown = serializeMd(editor);

    expect(serializedMarkdown).toBe(
      'Hello [Jane Smith](mention:jane_smith) and [bob](mention:bob)!\n'
    );
  });

  it('should serialize complex mentions with special characters', () => {
    const editor = createTestEditor([BaseMentionPlugin]);
    editor.children = [
      {
        children: [
          { text: 'Assigned to ' },
          {
            key: 'qa_team_us',
            children: [{ text: '' }],
            type: 'mention',
            value: 'QA Team (US)',
          },
          { text: ' and ' },
          {
            key: 'dev-team',
            children: [{ text: '' }],
            type: 'mention',
            value: 'dev-team',
          },
        ],
        type: 'p',
      },
    ];

    const markdown = serializeMd(editor);
    expect(markdown).toBe(
      'Assigned to [QA Team (US)](mention:qa_team_us) and [dev-team](mention:dev-team)\n'
    );
  });
});

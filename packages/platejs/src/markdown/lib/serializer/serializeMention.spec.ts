import { createTestEditor } from '../__tests__/createTestEditor';

describe('editor.api.markdown.serialize - mention', () => {
  it('serialize mentions to link format', () => {
    const editor = createTestEditor();
    editor.update.value.replace({
      children: [
        {
          children: [
            { text: 'Hello ' },
            {
              ref: 'alice',
              children: [{ text: '' }],
              type: 'mention',
              label: 'alice',
            },
            { text: ' how are you?' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const markdown = editor.api.markdown.serialize();
    expect(markdown).toBe('Hello [alice](mention:alice) how are you?\n');
  });

  it('serialize multiple mentions', () => {
    const editor = createTestEditor();
    editor.update.value.replace({
      children: [
        {
          children: [
            {
              ref: 'bob',
              children: [{ text: '' }],
              type: 'mention',
              label: 'bob',
            },
            { text: ' mentioned ' },
            {
              ref: 'charlie',
              children: [{ text: '' }],
              type: 'mention',
              label: 'charlie',
            },
            { text: ' in the discussion' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const markdown = editor.api.markdown.serialize();
    expect(markdown).toBe(
      '[bob](mention:bob) mentioned [charlie](mention:charlie) in the discussion\n'
    );
  });

  it('serialize mentions with spaces using link format', () => {
    const editor = createTestEditor();
    editor.update.value.replace({
      children: [
        {
          children: [
            { text: 'Hey ' },
            {
              ref: 'john_doe',
              children: [{ text: '' }],
              type: 'mention',
              label: 'John Doe',
            },
            { text: ' check this out' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const markdown = editor.api.markdown.serialize();
    expect(markdown).toBe('Hey [John Doe](mention:john_doe) check this out\n');
  });

  it('use key for URL when both key and value are present', () => {
    const editor = createTestEditor();
    editor.update.value.replace({
      children: [
        {
          children: [
            { text: 'Hey ' },
            {
              ref: 'john_doe',
              children: [{ text: '' }],
              type: 'mention',
              label: 'John Doe',
            },
            { text: ' check this out' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const markdown = editor.api.markdown.serialize();
    expect(markdown).toBe('Hey [John Doe](mention:john_doe) check this out\n');
  });

  it('round-trip mentions correctly', () => {
    const editor = createTestEditor();

    const originalMarkdown = 'Hello [Jane Smith](mention:jane_smith) and @bob!';
    const value = editor.api.markdown.deserialize(originalMarkdown);
    editor.update.value.replace(value);
    const serializedMarkdown = editor.api.markdown.serialize();

    expect(serializedMarkdown).toBe(
      'Hello [Jane Smith](mention:jane_smith) and [bob](mention:bob)!\n'
    );
  });

  it('serialize complex mentions with special characters', () => {
    const editor = createTestEditor();
    editor.update.value.replace({
      children: [
        {
          children: [
            { text: 'Assigned to ' },
            {
              ref: 'qa_team_us',
              children: [{ text: '' }],
              type: 'mention',
              label: 'QA Team (US)',
            },
            { text: ' and ' },
            {
              ref: 'dev-team',
              children: [{ text: '' }],
              type: 'mention',
              label: 'dev-team',
            },
          ],
          type: 'paragraph',
        },
      ],
    });

    const markdown = editor.api.markdown.serialize();
    expect(markdown).toBe(
      'Assigned to [QA Team (US)](mention:qa_team_us) and [dev-team](mention:dev-team)\n'
    );
  });
});

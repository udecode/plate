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
              key: 'alice',
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
              key: 'john_doe',
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
              key: 'john_doe',
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
      ],
    });

    const markdown = editor.api.markdown.serialize();
    expect(markdown).toBe(
      'Assigned to [QA Team (US)](mention:qa_team_us) and [dev-team](mention:dev-team)\n'
    );
  });
});

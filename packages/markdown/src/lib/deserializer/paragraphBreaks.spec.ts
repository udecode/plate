import { createTestEditor } from '../__tests__/createTestEditor';

describe('paragraph breaks preservation', () => {
  const editor = createTestEditor();

  it('preserve empty paragraphs during serialization and deserialization', () => {
    const originalValue = [
      {
        children: [
          {
            text: 'line 1',
          },
        ],
        type: 'p',
      },
      {
        children: [
          {
            text: '',
          },
        ],
        type: 'p',
      },
      {
        children: [
          {
            text: 'line 2',
          },
        ],
        type: 'p',
      },
      {
        children: [
          {
            text: 'line 3',
          },
        ],
        type: 'p',
      },
    ];

    // Serialize to markdown
    const serialized = editor.api.markdown.serialize({
      value: { children: originalValue },
    });

    // Check that zero-width space is used in serialization
    expect(serialized).toContain('\u200B');
    expect(serialized).toMatch(/line 1\n\n\u200B\n\nline 2\n\nline 3/);

    // Deserialize back to Plate AST
    const deserialized = editor.api.markdown.deserialize(serialized);

    // Check that the empty paragraph is preserved
    expect(deserialized.children).toHaveLength(4);
    expect(deserialized.children[1]).toMatchObject({
      children: [{ text: '' }],
      type: 'p',
    });

    // The structure should match the original
    expect(deserialized.children).toEqual(originalValue);
  });

  it('preserve multiple consecutive empty paragraphs', () => {
    const originalValue = [
      {
        children: [{ text: 'line 1' }],
        type: 'p',
      },
      {
        children: [{ text: '' }],
        type: 'p',
      },
      {
        children: [{ text: '' }],
        type: 'p',
      },
      {
        children: [{ text: 'line 2' }],
        type: 'p',
      },
    ];

    const serialized = editor.api.markdown.serialize({
      value: { children: originalValue },
    });
    const deserialized = editor.api.markdown.deserialize(serialized);

    expect(deserialized.children).toHaveLength(4);
    expect(deserialized.children[1].children[0].text).toBe('');
    expect(deserialized.children[2].children[0].text).toBe('');
  });

  it('handle mixed empty and non-empty paragraphs', () => {
    const originalValue = [
      {
        children: [{ text: '' }],
        type: 'p',
      },
      {
        children: [{ text: 'line 1' }],
        type: 'p',
      },
      {
        children: [{ text: '' }],
        type: 'p',
      },
      {
        children: [{ text: '' }],
        type: 'p',
      },
      {
        children: [{ text: 'line 2' }],
        type: 'p',
      },
      {
        children: [{ text: '' }],
        type: 'p',
      },
    ];

    const serialized = editor.api.markdown.serialize({
      value: { children: originalValue },
    });
    const deserialized = editor.api.markdown.deserialize(serialized);

    expect(deserialized.children).toHaveLength(6);
    expect(deserialized.children[0].children[0].text).toBe('');
    expect(deserialized.children[2].children[0].text).toBe('');
    expect(deserialized.children[3].children[0].text).toBe('');
    expect(deserialized.children[5].children[0].text).toBe('');
  });

  it('does not affect paragraphs with actual content', () => {
    const originalValue = [
      {
        children: [
          { text: 'This is ' },
          { bold: true, text: 'bold' },
          { text: ' text' },
        ],
        type: 'p',
      },
      {
        children: [{ text: '' }],
        type: 'p',
      },
      {
        children: [
          { text: 'This is ' },
          { italic: true, text: 'italic' },
          { text: ' text' },
        ],
        type: 'p',
      },
    ];

    const serialized = editor.api.markdown.serialize({
      value: { children: originalValue },
    });
    const deserialized = editor.api.markdown.deserialize(serialized);

    expect(deserialized.children).toHaveLength(3);
    expect(deserialized.children[0].children).toHaveLength(3);
    expect(deserialized.children[0].children[1]).toMatchObject({
      bold: true,
      text: 'bold',
    });
    expect(deserialized.children[2].children[1]).toMatchObject({
      italic: true,
      text: 'italic',
    });
  });

  it('handle zero-width space in regular text content', () => {
    const originalValue = [
      {
        children: [{ text: 'text with \u200B zero-width space' }],
        type: 'p',
      },
    ];

    const serialized = editor.api.markdown.serialize({
      value: { children: originalValue },
    });
    const deserialized = editor.api.markdown.deserialize(serialized);

    // The zero-width space in actual text content should be preserved
    expect(deserialized.children[0].children[0].text).toBe(
      'text with \u200B zero-width space'
    );
  });
});

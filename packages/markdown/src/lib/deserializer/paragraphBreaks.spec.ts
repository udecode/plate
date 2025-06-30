import { createTestEditor } from '../__tests__/createTestEditor';
import { serializeMd } from '../serializer/serializeMd';
import { deserializeMd } from './deserializeMd';

describe('paragraph breaks preservation', () => {
  const editor = createTestEditor();

  it('should preserve empty paragraphs during serialization and deserialization', () => {
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
    const serialized = serializeMd(editor as any, { value: originalValue });

    // Check that zero-width space is used in serialization
    expect(serialized).toContain('\u200B');
    expect(serialized).toMatch(/line 1\n\n\u200B\n\nline 2\n\nline 3/);

    // Deserialize back to Plate AST
    const deserialized = deserializeMd(editor, serialized);

    // Check that the empty paragraph is preserved
    expect(deserialized).toHaveLength(4);
    expect(deserialized[1]).toMatchObject({
      children: [{ text: '' }],
      type: 'p',
    });

    // The structure should match the original
    expect(deserialized).toEqual(originalValue);
  });

  it('should preserve multiple consecutive empty paragraphs', () => {
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

    const serialized = serializeMd(editor as any, { value: originalValue });
    const deserialized = deserializeMd(editor, serialized);

    expect(deserialized).toHaveLength(4);
    expect(deserialized[1].children[0].text).toBe('');
    expect(deserialized[2].children[0].text).toBe('');
  });

  it('should handle mixed empty and non-empty paragraphs', () => {
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

    const serialized = serializeMd(editor as any, { value: originalValue });
    const deserialized = deserializeMd(editor, serialized);

    expect(deserialized).toHaveLength(6);
    expect(deserialized[0].children[0].text).toBe('');
    expect(deserialized[2].children[0].text).toBe('');
    expect(deserialized[3].children[0].text).toBe('');
    expect(deserialized[5].children[0].text).toBe('');
  });

  it('should not affect paragraphs with actual content', () => {
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

    const serialized = serializeMd(editor as any, { value: originalValue });
    const deserialized = deserializeMd(editor, serialized);

    expect(deserialized).toHaveLength(3);
    expect(deserialized[0].children).toHaveLength(3);
    expect(deserialized[0].children[1]).toMatchObject({
      bold: true,
      text: 'bold',
    });
    expect(deserialized[2].children[1]).toMatchObject({
      italic: true,
      text: 'italic',
    });
  });

  it('should handle zero-width space in regular text content', () => {
    const originalValue = [
      {
        children: [{ text: 'text with \u200B zero-width space' }],
        type: 'p',
      },
    ];

    const serialized = serializeMd(editor as any, { value: originalValue });
    const deserialized = deserializeMd(editor, serialized);

    // The zero-width space in actual text content should be preserved
    expect(deserialized[0].children[0].text).toBe(
      'text with \u200B zero-width space'
    );
  });
});

import { createTestEditor } from '../__tests__/createTestEditor';
import { serializeInlineMd } from './serializeInlineMd';

describe('serializeInlineMd', () => {
  const editor = createTestEditor();

  it('should serialize plain text correctly', () => {
    const nodes = [{ text: 'Hello world' }];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('Hello world\n');
  });

  it('should preserve leading spaces', () => {
    const nodes = [{ text: '   Hello world' }];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('   Hello world\n');
  });

  it('should serialize bold text correctly', () => {
    const nodes = [{ bold: true, text: 'Hello ' }];
    const result = serializeInlineMd(editor, { value: nodes });

    expect(result).toBe('**Hello** \n');
  });

  it('should serialize italic text correctly', () => {
    const nodes = [{ italic: true, text: 'Hello' }];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('_Hello_\n');
  });

  it('should serialize strikethrough text correctly', () => {
    const nodes = [{ strikethrough: true, text: 'Hello' }];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('~~Hello~~\n');
  });

  it('should serialize code text correctly', () => {
    const nodes = [{ code: true, text: 'Hello' }];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('`Hello`\n');
  });

  it('should serialize nested formatting for inlineCode blocks correctly', () => {
    const nodes = [
      { code: true, text: 'Code ' },
      { bold: true, code: true, text: 'bold Code' },
      { code: true, text: ' Code' },
    ];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('`Code `**`bold Code`**` Code`\n');
  });

  it('should serialize mixed formatting correctly', () => {
    const nodes = [
      { text: 'Hello ' },
      { bold: true, text: 'bold' },
      { text: ' and ' },
      { italic: true, text: 'italic' },
      { text: ' text' },
    ];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('Hello **bold** and _italic_ text\n');
  });

  it('should serialize nested formatting correctly', () => {
    const nodes = [
      { text: 'Hello ' },
      { bold: true, italic: true, text: 'bold and italic' },
      { text: ' text' },
    ];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('Hello _**bold and italic**_ text\n');
  });

  it('should serialize overlapping formatting correctly', () => {
    const nodes = [
      { text: 'Regular ' },
      { bold: true, text: 'Bold' },
      { bold: true, italic: true, text: ' Bold&Italic ' },
      { italic: true, text: 'Italic' },
      { text: ' Regular' },
    ];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe(
      'Regular **Bol&#x64;_&#x20;Bold&Italic&#x20;_**_Italic_ Regular\n'
    );
  });

  it('should serialize overlapping formatting correctly without spaces', () => {
    const nodes = [
      { text: 'Regular' },
      { bold: true, text: 'Bold' },
      { bold: true, italic: true, text: 'Bold&Italic' },
      { italic: true, text: 'Italic' },
      { text: 'Regular' },
    ];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe(
      'Regular**Bol&#x64;_&#x42;old&Italic_**_Itali&#x63;_&#x52;egular\n'
    );
  });

  it('should serialize overlapping formatting correctly without spaces', () => {
    const nodes = [
      { text: 'Regular' },
      { italic: true, text: 'Italic' },
      { bold: true, italic: true, text: 'Bold&Italic' },
      { bold: true, text: 'Bold' },
      { text: 'Regular' },
    ];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe(
      'Regula&#x72;_&#x49;talic**Bold&Italic**_**Bold**Regular\n'
    );
  });

  it('should serialize overlapping formatting correctly without spaces', () => {
    const nodes = [
      { text: 'Regular' },
      { bold: true, italic: true, text: 'Bold&Italic' },
      { bold: true, text: 'Bold' },
      { text: 'Regular' },
    ];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('Regula&#x72;_**Bold&Italic**_**Bold**Regular\n');
  });

  it('should handle empty nodes array', () => {
    const nodes: any[] = [];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('');
  });

  it('should handle code with other formatting', () => {
    const nodes = [
      { text: 'This is ' },
      { bold: true, code: true, text: 'code and bold' },
      { text: ' text' },
    ];
    const result = serializeInlineMd(editor, { value: nodes });

    // Code formatting should take precedence
    expect(result).toBe('This is **`code and bold`** text\n');
  });

  it('should serialize bold empty paragraph as empty paragraph', () => {
    const nodes = [{ bold: true, text: '' }];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('');
  });
});

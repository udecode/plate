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
    expect(result).toBe('*Hello*\n');
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

  it('should serialize mixed formatting correctly', () => {
    const nodes = [
      { text: 'Hello ' },
      { bold: true, text: 'bold' },
      { text: ' and ' },
      { italic: true, text: 'italic' },
      { text: ' text' },
    ];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('Hello **bold** and *italic* text\n');
  });

  it('should serialize nested formatting correctly', () => {
    const nodes = [
      { text: 'Hello ' },
      { bold: true, italic: true, text: 'bold and italic' },
      { text: ' text' },
    ];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('Hello ***bold and italic*** text\n');
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
    expect(result).toBe('Regular *Italic* ***Bold&Italic*** **Bold** Regular\n');
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
    expect(result).toBe('Regular*Italic****Bold&Italic*****Bold**Regular\n');
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
    expect(result).toBe('Regular**Bold*****Bold&Italic****Italic*Regular\n');
  });

  
  it('should serialize overlapping formatting correctly without spaces', () => {
    const nodes = [
      { text: 'Regular' },
      { bold: true, italic: true, text: 'Bold&Italic' },
      { bold: true, text: 'Bold' },
      { text: 'Regular' },
    ];
    const result = serializeInlineMd(editor, { value: nodes });
    expect(result).toBe('Regular***Bold&Italic****Italic*Regular\n');
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
});

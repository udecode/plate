import { createTestEditor } from './__tests__/createTestEditor';
import { streamDeserializeMd } from './streamDeserializeMd';
import { streamSerializeMd } from './streamSerializeMd';

const { editor } = createTestEditor() as any;

describe('streamSerializeMd', () => {
  it('should without tailing line break', () => {
    const chunk = 'chunk1';
    const input = streamDeserializeMd(editor, chunk);

    const output = streamSerializeMd(editor, { value: input }, chunk);

    expect(output).toBe('chunk1');
  });

  it('should with tailing space', () => {
    const chunk = 'chunk1\n ';
    const input = streamDeserializeMd(editor, chunk);

    const output = streamSerializeMd(editor, { value: input }, chunk);

    expect(output).toBe('chunk1\n ');
  });

  it('should with tailing line break', () => {
    const chunk = 'chunk1\n';
    const input = streamDeserializeMd(editor, chunk);

    const output = streamSerializeMd(editor, { value: input }, chunk);

    expect(output).toBe('chunk1\n');
  });

  it('should without tailing line break', () => {
    const chunk = 'chunk1\n\n';

    const lastBlock = streamDeserializeMd(editor, chunk).at(-1);

    const output = streamSerializeMd(editor, { value: [lastBlock] }, chunk);

    expect(output).toBe('');
  });

  it('should serialize heading with tailing line break', () => {
    const chunk = '## Heading 1\n';
    const input = streamDeserializeMd(editor, chunk);

    const output = streamSerializeMd(editor, { value: input }, chunk);

    expect(output).toBe('## Heading 1\n');
  });

  describe('should handle complete/incomplete stable blocks', () => {
    it('should correctly handle complete code block', async () => {
      const chunk = '```ts\nconst a = 123\n```';

      const result = streamDeserializeMd(editor, chunk);

      const output = streamSerializeMd(editor, { value: result }, chunk);

      expect(output).toBe(chunk);
    });

    it('should correctly handle incomplete code block', async () => {
      const chunk = '```ts\nconst a = 123';

      const result = streamDeserializeMd(editor, chunk);

      const output = streamSerializeMd(editor, { value: result }, chunk);

      expect(output).toBe(chunk);
    });

    it('should correctly handle complete math block', async () => {
      const chunk = '$$\nE = mc^2\n$$';

      const result = streamDeserializeMd(editor, chunk);

      const output = streamSerializeMd(editor, { value: result }, chunk);

      expect(output).toBe(chunk);
    });

    it('should correctly handle incomplete math block', async () => {
      const chunk = '$$E = mc^2';

      const result = streamDeserializeMd(editor, chunk);

      const output = streamSerializeMd(editor, { value: result }, chunk);
    });
  });
});

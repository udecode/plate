import { createTestEditor } from './__tests__/createTestEditor';
import { streamDeserializeMd } from '../../../../../../packages/ai/src/react/ai-chat/streaming/streamDeserializeMd';
import { streamSerializeMd } from '../../../../../../packages/ai/src/react/ai-chat/streaming/streamSerializeMd';

const { editor } = createTestEditor() as any;

describe('streamSerializeMd', () => {
  it('keeps content without a trailing line break', () => {
    const chunk = 'chunk1';
    const input = streamDeserializeMd(editor, chunk);

    const output = streamSerializeMd(editor, { value: input }, chunk);

    expect(output).toBe('chunk1');
  });

  it('preserves trailing spaces', () => {
    const chunk = 'chunk1\n ';
    const input = streamDeserializeMd(editor, chunk);

    const output = streamSerializeMd(editor, { value: input }, chunk);

    expect(output).toBe('chunk1\n ');
  });

  it('preserves a trailing line break', () => {
    const chunk = 'chunk1\n';
    const input = streamDeserializeMd(editor, chunk);

    const output = streamSerializeMd(editor, { value: input }, chunk);

    expect(output).toBe('chunk1\n');
  });

  it('drops an incomplete trailing block without a line break', () => {
    const chunk = 'chunk1\n\n';

    const lastBlock = streamDeserializeMd(editor, chunk).at(-1) as any;

    const output = streamSerializeMd(editor, { value: [lastBlock] }, chunk);

    expect(output).toBe('');
  });

  it('serializes headings with a trailing line break', () => {
    const chunk = '## Heading 1\n';
    const input = streamDeserializeMd(editor, chunk);

    const output = streamSerializeMd(editor, { value: input }, chunk);

    expect(output).toBe('## Heading 1\n');
  });

  describe('complete and incomplete stable blocks', () => {
    it('preserves complete code blocks', async () => {
      const chunk = '```ts\nconst a = 123\n```';

      const result = streamDeserializeMd(editor, chunk);

      const output = streamSerializeMd(editor, { value: result }, chunk);

      expect(output).toBe(chunk);
    });

    it('preserves incomplete code blocks', async () => {
      const chunk = '```ts\nconst a = 123';

      const result = streamDeserializeMd(editor, chunk);

      const output = streamSerializeMd(editor, { value: result }, chunk);

      expect(output).toBe(chunk);
    });

    it('preserves complete math blocks', async () => {
      const chunk = '$$\nE = mc^2\n$$';

      const result = streamDeserializeMd(editor, chunk);

      const output = streamSerializeMd(editor, { value: result }, chunk);

      expect(output).toBe(chunk);
    });

    it('preserves incomplete math blocks', async () => {
      const chunk = '$$E = mc^2';

      const result = streamDeserializeMd(editor, chunk);

      const output = streamSerializeMd(editor, { value: result }, chunk);

      expect(output).toBe(chunk);
    });
  });
});

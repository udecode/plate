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
});

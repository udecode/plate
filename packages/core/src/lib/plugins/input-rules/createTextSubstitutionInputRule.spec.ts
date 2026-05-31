import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin';
import { createTextSubstitutionInputRule } from './createInputRules';

const createEditor = (
  rule: ReturnType<typeof createTextSubstitutionInputRule>
) =>
  createSlateEditor({
    plugins: [createSlatePlugin({ key: 'shortcuts', inputRules: [rule] })],
    selection: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    value: [{ children: [{ text: '' }], type: 'p' }],
  } as any);

describe('createTextSubstitutionInputRule', () => {
  it('substitutes a flat match on its final character', () => {
    const rule = createTextSubstitutionInputRule({
      patterns: [{ format: 'arrow', match: '->' }],
    });
    const editor = createEditor(rule);

    editor.tf.insertText('-');
    editor.tf.insertText('>');

    expect(editor.children).toEqual([
      { children: [{ text: 'arrow' }], type: 'p' },
    ]);
  });

  it('keeps the literal text when only the leading character is typed', () => {
    const rule = createTextSubstitutionInputRule({
      patterns: [{ format: 'arrow', match: '->' }],
    });
    const editor = createEditor(rule);

    editor.tf.insertText('-');

    expect(editor.children).toEqual([{ children: [{ text: '-' }], type: 'p' }]);
  });

  it('substitutes multi-character flat matches (`(c)` -> `copyright`)', () => {
    const rule = createTextSubstitutionInputRule({
      patterns: [{ format: 'copyright', match: '(c)' }],
    });
    const editor = createEditor(rule);

    editor.tf.insertText('(');
    editor.tf.insertText('c');
    editor.tf.insertText(')');

    expect(editor.children).toEqual([
      { children: [{ text: 'copyright' }], type: 'p' },
    ]);
  });

  it('wraps paired delimiters on the closing character', () => {
    const rule = createTextSubstitutionInputRule({
      patterns: [{ format: ['open-', '-close'], match: '"' }],
    });
    const editor = createEditor(rule);

    editor.tf.insertText('"');
    editor.tf.insertText('h');
    editor.tf.insertText('i');
    editor.tf.insertText('"');

    expect(editor.children).toEqual([
      { children: [{ text: 'open-hi-close' }], type: 'p' },
    ]);
  });

  it('fires on the explicit trigger when provided', () => {
    const rule = createTextSubstitutionInputRule({
      patterns: [{ format: 'FOO', match: 'foo', trigger: ' ' }],
    });
    const editor = createEditor(rule);

    editor.tf.insertText('f');
    editor.tf.insertText('o');
    editor.tf.insertText('o');
    editor.tf.insertText(' ');

    expect(editor.children).toEqual([
      { children: [{ text: 'FOO' }], type: 'p' },
    ]);
  });
});

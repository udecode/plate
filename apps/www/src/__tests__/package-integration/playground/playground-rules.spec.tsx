import {
  BaseIndentPlugin,
  BaseListPlugin,
  BaseParagraphPlugin,
  BulletedListRules,
  OrderedListRules,
  TaskListRules,
  TrailingBlockPlugin,
  createEditor,
} from 'platejs';

const createListsEditor = (text: string) =>
  createEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseIndentPlugin,
      BaseListPlugin.configure({
        inputRules: [
          BulletedListRules.markdown({ variant: '-' }),
          BulletedListRules.markdown({ variant: '*' }),
          OrderedListRules.markdown({ variant: '.' }),
          OrderedListRules.markdown({ variant: ')' }),
          TaskListRules.markdown({ checked: false }),
          TaskListRules.markdown({ checked: true }),
        ],
      }),
      TrailingBlockPlugin,
    ],
    selection: {
      kind: 'text',
      anchor: { offset: text.length, path: [0, 0] },
      focus: { offset: text.length, path: [0, 0] },
    },
    initialValue: [{ children: [{ text }], type: 'paragraph' }],
  } as any);

describe('playground rules current contract', () => {
  describe('list rules', () => {
    it.each([
      ['*', { indent: 1, listType: 'bulleted', type: 'paragraph' }],
      [
        '3)',
        {
          indent: 1,
          listStart: 3,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
      [
        '[]',
        { checked: false, indent: 1, listType: 'task', type: 'paragraph' },
      ],
    ])('promotes list shorthand `%s`', (prefix, expectedNode) => {
      const editor = createListsEditor(prefix);

      editor.update.text.insert(' ');

      expect(editor.read.children()[0]).toMatchObject(expectedNode);
      expect(editor.read.children()[0]).toMatchObject({
        children: [{ text: '' }],
      });
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    });
  });
});

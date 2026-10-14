import { createEditor } from '../../../core';
import { BaseCodeBlockPlugin } from '../../code-block/lib/BaseCodeBlockPlugin';
import { BaseDetailsPlugin } from './BaseDetailsPlugin';

const section = (title: string) => [
  {
    children: [
      { children: [{ text: title }], type: 'summary' },
      { children: [{ text: 'Body' }], type: 'paragraph' },
    ],
    type: 'details',
  },
  { children: [{ text: 'After' }], type: 'paragraph' },
];

const setup = (title: string, { open = false } = {}) => {
  const editor = createEditor({
    plugins: [BaseDetailsPlugin, BaseCodeBlockPlugin],
    initialValue: section(title),
  });
  const details = editor.key([0])!;

  if (open) editor.plugin(BaseDetailsPlugin).api.setOpen(details, true);
  editor.update.selection.set({ offset: title.length, path: [0, 0, 0] });

  return { editor, summary: editor.key([0, 0])! };
};

const shape = (editor: ReturnType<typeof setup>['editor']) =>
  editor.read.children().map((node) =>
    node.type === 'details'
      ? {
          children: node.children.map((child) => child.type),
          type: node.type,
        }
      : node.type
  );

describe('inserting from a Details title', () => {
  it('lands after a closed Details [EDIT-DETAILS-INSERT-CLOSED-001]', () => {
    const { editor, summary } = setup('Title');

    editor.plugin(BaseCodeBlockPlugin).update.insert();

    expect(shape(editor)).toEqual([
      { children: ['summary', 'paragraph'], type: 'details' },
      'codeBlock',
      'paragraph',
    ]);
    expect(editor.read.nodes.get(summary)?.[1]).toEqual([0, 0]);
  });

  it('lands in the body of an open Details', () => {
    const { editor } = setup('Title', { open: true });

    editor.plugin(BaseCodeBlockPlugin).update.insert();

    expect(shape(editor)).toEqual([
      { children: ['summary', 'codeBlock', 'paragraph'], type: 'details' },
      'paragraph',
    ]);
  });

  it.each([
    ['closed', {}, false],
    ['open', {}, true],
    ['closed', { replaceEmpty: true }, false],
    ['open', { replaceEmpty: true }, true],
  ])(
    'keeps an empty %s title and its key with options %j',
    (_, options, open) => {
      const { editor, summary } = setup('', { open });

      editor.plugin(BaseCodeBlockPlugin).update.insert({}, options);

      expect({
        path: editor.read.nodes.get(summary)?.[1],
        type: editor.read.children()[0].children[0].type,
      }).toEqual({ path: [0, 0], type: 'summary' });
    }
  );

  it('keeps an explicit after literal, even past a closed title', () => {
    const { editor, summary } = setup('Title');

    editor.plugin(BaseCodeBlockPlugin).update.insert({}, { after: summary });

    expect(shape(editor)).toEqual([
      { children: ['summary', 'codeBlock', 'paragraph'], type: 'details' },
      'paragraph',
    ]);
  });
});

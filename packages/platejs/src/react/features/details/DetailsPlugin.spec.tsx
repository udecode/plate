import { BaseDetailsPlugin } from '../../../features/details/lib';
import { createEditor } from '../../core';
import { DetailsPlugin } from './DetailsPlugin';

const value = [
  {
    children: [
      { children: [{ text: 'Title' }], type: 'summary' },
      { children: [{ text: 'Body' }], type: 'paragraph' },
    ],
    type: 'details',
  },
  { children: [{ text: 'After' }], type: 'paragraph' },
] as const;

describe('DetailsPlugin', () => {
  it('moves Enter at the end of an open Summary into the first body block', () => {
    const editor = createEditor({
      plugins: [DetailsPlugin],
      selection: {
        anchor: { offset: 5, path: [0, 0, 0] },
        focus: { offset: 5, path: [0, 0, 0] },
        kind: 'text',
      },
      initialValue: value,
    });

    editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, true);
    editor.update.break.insert();

    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });
});

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

  it('moves Enter in a closed Summary after the whole Details', () => {
    const editor = createEditor({
      plugins: [DetailsPlugin],
      selection: {
        anchor: { offset: 5, path: [0, 0, 0] },
        focus: { offset: 5, path: [0, 0, 0] },
        kind: 'text',
      },
      initialValue: value,
    });

    editor.update.break.insert();

    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
    expect(editor.read.children()[0]).toMatchObject(value[0]);
  });

  it('moves trailing Summary text into a new first body paragraph', () => {
    const editor = createEditor({
      plugins: [DetailsPlugin],
      selection: {
        anchor: { offset: 2, path: [0, 0, 0] },
        focus: { offset: 2, path: [0, 0, 0] },
        kind: 'text',
      },
      initialValue: value,
    });

    editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, true);
    editor.update.break.insert();

    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { children: [{ text: 'Ti' }], type: 'summary' },
        { children: [{ text: 'tle' }], type: 'paragraph' },
        { children: [{ text: 'Body' }], type: 'paragraph' },
      ],
      type: 'details',
    });
  });

  it('exits from the final empty body without deleting it', () => {
    const editor = createEditor({
      plugins: [DetailsPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 0, path: [0, 1, 0] },
        kind: 'text',
      },
      initialValue: [
        {
          children: [
            { children: [{ text: 'Title' }], type: 'summary' },
            { children: [{ text: '' }], type: 'paragraph' },
          ],
          type: 'details',
        },
      ],
    });

    editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, true);
    editor.update.break.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { children: [{ text: 'Title' }], type: 'summary' },
          { children: [{ text: '' }], type: 'paragraph' },
        ],
        type: 'details',
      },
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
    expect(editor.read.selection()).toMatchObject({
      anchor: { path: [1, 0] },
      focus: { path: [1, 0] },
    });
  });

  it('unwraps Details on Backspace at Summary start', () => {
    const editor = createEditor({
      plugins: [DetailsPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
        kind: 'text',
      },
      initialValue: value,
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'Title' }], type: 'paragraph' },
      { children: [{ text: 'Body' }], type: 'paragraph' },
      { children: [{ text: 'After' }], type: 'paragraph' },
    ]);
  });

  it('moves Backspace at first body start to the end of Summary', () => {
    const editor = createEditor({
      plugins: [DetailsPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 0, path: [0, 1, 0] },
        kind: 'text',
      },
      initialValue: value,
    });

    editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, true);
    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 5, path: [0, 0, 0] },
      focus: { offset: 5, path: [0, 0, 0] },
    });
    expect(editor.read.children()).toMatchObject(value);
  });

  it('skips a closed body on forward Delete at Summary end', () => {
    const editor = createEditor({
      plugins: [DetailsPlugin],
      selection: {
        anchor: { offset: 5, path: [0, 0, 0] },
        focus: { offset: 5, path: [0, 0, 0] },
        kind: 'text',
      },
      initialValue: value,
    });

    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
    expect(editor.read.children()).toMatchObject(value);
  });
});

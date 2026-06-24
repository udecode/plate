import { getCurrentRuntimeTransforms } from '../../../core/src/internal/currentRuntimeBridge';
import { createPlateRuntimeEditor } from '../../../core/src/react/editor/createPlateRuntimeEditor';
import { BaseLinkPlugin } from './BaseLinkPlugin';

describe('BaseLinkPlugin Plite runtime', () => {
  it('creates and selects a text leaf after a link when the cursor reaches the link end', () => {
    const editor = createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: 4, path: [0, 1, 0] },
        focus: { offset: 4, path: [0, 1, 0] },
      },
      initialValue: [
        {
          children: [
            { text: 'Before ' },
            {
              children: [{ text: 'link' }],
              type: 'a',
              url: 'https://example.com',
            },
          ],
          type: 'p',
        },
      ],
      plugins: [BaseLinkPlugin],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'link' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: '' },
        ],
        type: 'p',
      },
    ]);
    getCurrentRuntimeTransforms(editor).insertText('x');

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'link' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: 'x' },
        ],
        type: 'p',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 1, path: [0, 2] },
      focus: { offset: 1, path: [0, 2] },
    });
  });

  it('selects the existing text leaf after a link instead of inserting another one', () => {
    const editor = createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: 4, path: [0, 1, 0] },
        focus: { offset: 4, path: [0, 1, 0] },
      },
      initialValue: [
        {
          children: [
            { text: 'Before ' },
            {
              children: [{ text: 'link' }],
              type: 'a',
              url: 'https://example.com',
            },
            { text: ' after' },
          ],
          type: 'p',
        },
      ],
      plugins: [BaseLinkPlugin],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'link' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: ' after' },
        ],
        type: 'p',
      },
    ]);
    getCurrentRuntimeTransforms(editor).insertText('x');

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'link' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: 'x after' },
        ],
        type: 'p',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 1, path: [0, 2] },
      focus: { offset: 1, path: [0, 2] },
    });
  });
});

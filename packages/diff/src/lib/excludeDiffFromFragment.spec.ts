import { type Value, createEditor } from '@platejs/plite';

import {
  createExcludeDiffFragmentExtension,
  excludeDiffFromFragment,
} from './excludeDiffFromFragment';

describe('excludeDiffFromFragment', () => {
  it('returns a deep-cloned fragment without diff metadata', () => {
    const original = [
      {
        children: [
          {
            diff: { insert: true },
            diffIntent: 'insert',
            text: 'child',
          },
        ],
        diff: { remove: true },
        diffIntent: 'remove',
        type: 'p',
      },
    ] as any;

    const fragment = excludeDiffFromFragment(original);

    expect(fragment).toEqual([
      {
        children: [
          {
            text: 'child',
          },
        ],
        type: 'p',
      },
    ]);
    expect(JSON.parse(JSON.stringify(fragment))).toEqual(fragment);
    expect(original[0].diff).toEqual({ remove: true });
    expect(original[0].children[0].diffIntent).toBe('insert');
  });

  it('removes diff metadata through the fragment query extension', () => {
    const editor = createEditor<Value>({
      initialSelection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      initialValue: [
        {
          children: [
            {
              diff: { insert: true },
              diffIntent: 'insert',
              text: 'child',
            },
          ],
          type: 'p',
        },
      ],
    });

    editor.extend(createExcludeDiffFragmentExtension());

    expect(editor.read.fragment()).toEqual([
      {
        children: [
          {
            text: 'child',
          },
        ],
        type: 'p',
      },
    ]);
  });
});

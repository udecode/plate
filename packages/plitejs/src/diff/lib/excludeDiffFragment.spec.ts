import { type Value, createEditor } from '../..';
import {
  excludeDiffFragment,
  excludeDiffFromFragment,
} from './excludeDiffFragment';

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
        type: 'paragraph',
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
        type: 'paragraph',
      },
    ]);
    expect(JSON.parse(JSON.stringify(fragment))).toEqual(fragment);
    expect(original[0].diff).toEqual({ remove: true });
    expect(original[0].children[0].diffIntent).toBe('insert');
  });

  it('removes diff metadata from exported slices', () => {
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
          type: 'paragraph',
        },
      ],
    });

    editor.install(excludeDiffFragment());

    expect(editor.read.slice.export().content).toEqual([
      {
        children: [
          {
            text: 'child',
          },
        ],
        type: 'paragraph',
      },
    ]);
  });
});

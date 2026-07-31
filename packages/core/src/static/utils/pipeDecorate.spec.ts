import type { Element, NodeEntry, Range } from '@platejs/plite';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { pipeDecorate } from './pipeDecorate';

describe('pipeDecorate', () => {
  it('returns undefined when there are no decorate hooks', () => {
    const editor = createBaseEditor();

    expect(pipeDecorate(editor)).toBeUndefined();
  });

  it('merges plugin decorations with the decorate prop', () => {
    const rangeFromPlugin = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
      highlight: true,
    } satisfies Range & { highlight: true };
    const rangeFromProp = {
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
      comment: true,
    } satisfies Range & { comment: true };
    const HighlightPlugin = createBasePlugin({
      name: 'highlight',
      decorate: () => [rangeFromPlugin],
    });
    const editor = createBaseEditor({
      plugins: [HighlightPlugin],
    });
    const decorate = pipeDecorate(editor, () => [rangeFromProp])!;
    const entry = [
      { children: [{ text: 'alpha' }], type: 'p' },
      [0],
    ] satisfies NodeEntry<Element>;

    expect(decorate(entry)).toEqual([rangeFromPlugin, rangeFromProp]);
  });
});

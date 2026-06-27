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
    };
    const rangeFromProp = {
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
      comment: true,
    };
    const HighlightPlugin = createBasePlugin({
      key: 'highlight',
      decorate: () => [rangeFromPlugin as any],
    });
    const editor = createBaseEditor({
      plugins: [HighlightPlugin],
    });
    const decorate = pipeDecorate(editor, () => [rangeFromProp as any])!;

    expect(
      decorate([
        { children: [{ text: 'alpha' }], type: 'p' } as any,
        [0],
      ] as any)
    ).toEqual([rangeFromPlugin, rangeFromProp]);
  });
});

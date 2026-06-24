import { createBasePlateEditor } from '../../lib/editor';
import { createEditorPlugin } from '../../lib/plugin';
import { pipeDecorate } from './pipeDecorate';

describe('pipeDecorate', () => {
  it('returns undefined when there are no decorate hooks', () => {
    const editor = createBasePlateEditor();

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
    const HighlightPlugin = createEditorPlugin({
      key: 'highlight',
      decorate: () => [rangeFromPlugin as any],
    });
    const editor = createBasePlateEditor({
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

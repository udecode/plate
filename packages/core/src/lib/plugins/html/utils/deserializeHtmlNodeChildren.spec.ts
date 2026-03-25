import { createSlateEditor } from '../../../editor';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';

describe('deserializeHtmlNodeChildren', () => {
  it('flattens non-slate wrapper elements when the parent is already a slate node', () => {
    const editor = createSlateEditor({ plugins: [] });
    const root = new DOMParser().parseFromString(
      '<div data-slate-node="element"><span>one</span><div><span>two</span></div></div>',
      'text/html'
    ).body.firstElementChild!;

    expect(deserializeHtmlNodeChildren(editor, root, true)).toEqual([
      'one',
      'two',
    ]);
  });

  it('keeps direct slate children intact instead of flattening them', () => {
    const editor = createSlateEditor({ plugins: [] });
    const root = new DOMParser().parseFromString(
      '<div data-slate-node="element"><p data-slate-node="element">keep</p></div>',
      'text/html'
    ).body.firstElementChild!;

    expect(deserializeHtmlNodeChildren(editor, root, true)).toEqual([
      {
        text: 'keep',
      },
    ]);
  });
});

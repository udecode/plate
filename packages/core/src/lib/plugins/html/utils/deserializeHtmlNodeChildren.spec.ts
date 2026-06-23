import { createBasePlateEditor } from '../../../editor';
import { createEditorPlugin } from '../../../plugin';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';

const ParagraphPlugin = createEditorPlugin({
  key: 'p',
  node: { isElement: true, type: 'p' },
});

describe('deserializeHtmlNodeChildren', () => {
  it('flattens non-Plite wrapper elements when the parent is already a Plite node', () => {
    const editor = createBasePlateEditor({ plugins: [] });
    const root = new DOMParser().parseFromString(
      '<div data-plite-node="element"><span>one</span><div><span>two</span></div></div>',
      'text/html'
    ).body.firstElementChild!;

    expect(deserializeHtmlNodeChildren(editor, root, true)).toEqual([
      'one',
      'two',
    ]);
  });

  it('keeps direct Plite children as text leaves instead of raw strings', () => {
    const editor = createBasePlateEditor({ plugins: [ParagraphPlugin] });
    const root = new DOMParser().parseFromString(
      '<div data-plite-node="element"><p data-plite-node="element">keep</p></div>',
      'text/html'
    ).body.firstElementChild!;

    expect(deserializeHtmlNodeChildren(editor, root, true)).toEqual([
      {
        text: 'keep',
      },
    ]);
  });
});

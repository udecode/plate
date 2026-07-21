import { schema } from '@platejs/plite';

import { createBaseEditor } from '../../../editor';
import { createBasePlugin } from '../../../plugin';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';

const ParagraphPlugin = createBasePlugin({
  key: 'p',
  node: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['block'],
    },
    type: 'p',
  },
});

describe('deserializeHtmlNodeChildren', () => {
  it('flattens non-Plite wrapper elements when the parent is already a Plite node', () => {
    const editor = createBaseEditor({ plugins: [] });
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
    const editor = createBaseEditor({ plugins: [ParagraphPlugin] });
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

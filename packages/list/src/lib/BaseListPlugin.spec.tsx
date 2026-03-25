import ReactDOMServer from 'react-dom/server';

import { createSlateEditor, KEYS } from 'platejs';

import { BaseListPlugin } from './BaseListPlugin';

describe('BaseListPlugin', () => {
  it('flattens nested lists, block children, and derives indent metadata from html', () => {
    const transformData = (BaseListPlugin as any).inject.plugins[KEYS.html]
      .parser.transformData;
    const body = new DOMParser().parseFromString(
      transformData({
        data: '<ul><li><p>Parent</p><ul><li>Child</li></ul></li></ul>',
      }),
      'text/html'
    ).body;
    const parentItem = body.querySelector('ul > li') as HTMLElement;
    const childItem = body.querySelector('ul > ul > li') as HTMLElement;

    expect(parentItem.innerHTML).toBe('Parent');
    expect(parentItem.querySelector('p')).toBeNull();
    expect(parentItem.dataset.indent).toBe('1');
    expect(parentItem.dataset.listStyleType).toBe('disc');
    expect(childItem.dataset.indent).toBe('2');
    expect(childItem.dataset.listStyleType).toBe('disc');
  });

  it('prefers aria-level and inline list styles over derived defaults', () => {
    const transformData = (BaseListPlugin as any).inject.plugins[KEYS.html]
      .parser.transformData;
    const item = new DOMParser()
      .parseFromString(
        transformData({
          data: '<ol style="list-style-type: upper-alpha"><li aria-level="3" style="list-style-type: square"><span>Item</span></li></ol>',
        }),
        'text/html'
      )
      .body.querySelector('li') as HTMLElement;

    expect(item.dataset.indent).toBe('3');
    expect(item.dataset.listStyleType).toBe('square');
  });

  it('parses list metadata and renders ordered wrappers only for list items', () => {
    const editor = createSlateEditor({
      plugins: [
        BaseListPlugin.configure({
          options: {
            getListStyleType: () => 'circle' as any,
          },
        }),
      ],
    });
    const plugin = editor.getPlugin(BaseListPlugin);
    const parse = plugin.parsers.html!.deserializer!.parse! as any;
    const renderBelow = plugin.render.belowNodes as any;
    const element = document.createElement('li');
    const orderedElement = {
      children: [{ text: 'Item' }],
      listStart: 4,
      listStyleType: 'decimal',
      type: editor.getType(KEYS.p),
    } as any;
    const wrapper = renderBelow({
      children: 'Item',
      element: orderedElement,
    } as any)!;
    const markup = ReactDOMServer.renderToStaticMarkup(
      wrapper({
        children: 'Item',
        element: orderedElement,
      } as any)
    );

    element.setAttribute('aria-level', '2');

    expect(
      parse({
        editor,
        element,
        getOptions: () => plugin.options,
      } as any)
    ).toEqual({
      indent: 2,
      listStyleType: 'circle',
      type: editor.getType(KEYS.p),
    });
    expect(markup).toContain('<ol');
    expect(markup).toContain('start="4"');
    expect(markup).toContain('<li>Item</li>');
    expect(
      renderBelow({
        children: 'Item',
        element: { children: [{ text: 'Item' }], type: editor.getType(KEYS.p) },
      } as any)
    ).toBeUndefined();
  });
});

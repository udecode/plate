import ReactDOMServer from 'react-dom/server';

import { KEYS } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { ListPlugin } from './ListPlugin';

describe('ListPlugin', () => {
  it('renders list wrappers for list items', () => {
    const editor = createPlateEditor({ plugins: [ListPlugin] });
    const renderBelow = editor.getPlugin(ListPlugin).render.belowNodes as any;
    const orderedElement = {
      children: [{ text: 'Item' }],
      listStart: 4,
      listStyleType: 'decimal',
      type: editor.getType(KEYS.p),
    } as any;
    const unorderedElement = {
      children: [{ text: 'Bullet' }],
      listStyleType: 'disc',
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
    const unorderedWrapper = renderBelow({
      children: 'Bullet',
      element: unorderedElement,
    } as any)!;
    const unorderedMarkup = ReactDOMServer.renderToStaticMarkup(
      unorderedWrapper({
        children: 'Bullet',
        element: unorderedElement,
      } as any)
    );

    expect(markup).toContain('<ol');
    expect(markup).toContain('start="4"');
    expect(markup).toContain('<li>Item</li>');
    expect(unorderedMarkup).toContain('<ul');
    expect(unorderedMarkup).toContain('<li>Bullet</li>');
    expect(
      renderBelow({
        children: 'Item',
        element: { children: [{ text: 'Item' }], type: editor.getType(KEYS.p) },
      } as any)
    ).toBeUndefined();
  });
});

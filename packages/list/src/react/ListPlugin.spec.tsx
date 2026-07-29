import {
  type InferConfig,
  type RenderStaticNodeWrapperProps,
} from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import type { Element } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import ReactDOMServer from 'react-dom/server';

import { ListPlugin } from './ListPlugin';

describe('ListPlugin rendering', () => {
  it('renders ordered and unordered list wrappers', () => {
    const editor = createPlateEditor({ plugins: [ListPlugin] });
    const renderBelow = editor.getPlugin(ListPlugin).render.belowNodes;

    if (!renderBelow) throw new Error('Missing list wrapper renderer');

    const context = editor.plugin(ListPlugin);
    const props = (element: Element, children: string) =>
      ({
        ...context,
        attributes: { 'data-plite-node': 'element' as const },
        children,
        element,
        key: KEYS.list,
        slots: {
          children: () => null,
          contentBoundary: ({ children }) => children,
          contentRoot: () => null,
        },
      }) satisfies RenderStaticNodeWrapperProps<InferConfig<typeof ListPlugin>>;
    const orderedProps = props(
      {
        children: [{ text: 'Item' }],
        listStart: 4,
        listStyleType: 'decimal',
        type: KEYS.p,
      },
      'Item'
    );
    const orderedWrapper = renderBelow(orderedProps);

    if (!orderedWrapper) throw new Error('Missing ordered list wrapper');

    const unorderedProps = props(
      {
        children: [{ text: 'Bullet' }],
        listStyleType: 'disc',
        type: KEYS.p,
      },
      'Bullet'
    );
    const unorderedWrapper = renderBelow(unorderedProps);

    if (!unorderedWrapper) throw new Error('Missing unordered list wrapper');

    const orderedMarkup = ReactDOMServer.renderToStaticMarkup(
      orderedWrapper(orderedProps)
    );
    const unorderedMarkup = ReactDOMServer.renderToStaticMarkup(
      unorderedWrapper(unorderedProps)
    );

    expect(orderedMarkup).toContain('<ol');
    expect(orderedMarkup).toContain('start="4"');
    expect(orderedMarkup).toContain('<li>Item</li>');
    expect(unorderedMarkup).toContain('<ul');
    expect(unorderedMarkup).toContain('<li>Bullet</li>');
    expect(
      renderBelow(
        props(
          {
            children: [{ text: 'Plain' }],
            type: KEYS.p,
          },
          'Plain'
        )
      )
    ).toBeUndefined();
  });
});

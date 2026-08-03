import { createPlateEditor, Plate, PlateContent } from '@platejs/core/react';
import { createEditor, type Element, type Value } from '@platejs/plite';
import { render } from '@testing-library/react';
import React from 'react';

import { ListPlugin } from './ListPlugin';

describe('ListPlugin rendering', () => {
  it('renders ordered and unordered list wrappers', () => {
    const initialValue: Element[] = [
      {
        children: [{ text: 'Item' }],
        listStart: 4,
        listStyleType: 'decimal',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Bullet' }],
        listStyleType: 'disc',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Plain' }],
        type: 'paragraph',
      },
    ];
    const editor = createPlateEditor({
      editor: createEditor<Value>(),
      initialValue,
      plugins: [ListPlugin],
    });
    const { container } = render(
      <Plate editor={editor} suppressInstanceWarning>
        <PlateContent readOnly />
      </Plate>
    );

    expect(container.querySelector('ol')?.getAttribute('start')).toBe('4');
    expect(container.querySelector('ol > li')?.textContent).toBe('Item');
    expect(container.querySelector('ul > li')?.textContent).toBe('Bullet');
    expect(container.querySelectorAll('ol, ul')).toHaveLength(2);
    expect(container.textContent).toContain('Plain');
  });
});

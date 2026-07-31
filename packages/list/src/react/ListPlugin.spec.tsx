import { createPlateEditor, Plate, PlateContent } from '@platejs/core/react';
import type { Element } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
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
        type: KEYS.p,
      },
      {
        children: [{ text: 'Bullet' }],
        listStyleType: 'disc',
        type: KEYS.p,
      },
      {
        children: [{ text: 'Plain' }],
        type: KEYS.p,
      },
    ];
    const editor = createPlateEditor({
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

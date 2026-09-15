import { render } from '@testing-library/react';
import React from 'react';

import type { Element } from '../../../core';
import { createEditor, EditorRoot, EditorContent } from '../../core';
import { ListPlugin } from './ListPlugin';

describe('ListPlugin rendering', () => {
  it('renders ordered and unordered list wrappers', () => {
    const initialValue: Element[] = [
      {
        children: [{ text: 'Item' }],
        listStart: 4,
        listStyle: 'decimal',
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Bullet' }],
        listStyle: 'disc',
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Plain' }],
        type: 'paragraph',
      },
    ];
    const editor = createEditor({
      initialValue,
      plugins: [ListPlugin],
    });
    const { container } = render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent readOnly />
      </EditorRoot>
    );

    expect(container.querySelector('ol')?.getAttribute('start')).toBe('4');
    expect(container.querySelector('ol > li')?.textContent).toBe('Item');
    expect(container.querySelector('ul > li')?.textContent).toBe('Bullet');
    expect(container.querySelectorAll('ol, ul')).toHaveLength(2);
    expect(container.textContent).toContain('Plain');
  });
});

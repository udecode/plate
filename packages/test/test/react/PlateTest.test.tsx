/// <reference types="@testing-library/jest-dom" />

import { act, render } from '@testing-library/react';
import { createEditor } from 'platejs/react';
import React from 'react';

import { PlateTest } from '../../src/react';

describe('PlateTest', () => {
  it('renders a provided Plate editor', async () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'one' }], type: 'paragraph' },
      ] as const,
    });

    let rendered!: ReturnType<typeof render>;

    await act(async () => {
      rendered = render(<PlateTest editor={editor} suppressInstanceWarning />);
    });

    expect(rendered.getByTestId('plite-content-editable')).toHaveTextContent(
      'one'
    );
  });
});

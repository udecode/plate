import { fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { Command } from './cmdk';

describe('Command', () => {
  it('keeps aria-activedescendant aligned with the selected item', async () => {
    const { getByRole } = render(
      <Command label="Commands">
        <Command.Input />
        <Command.List>
          <Command.Item value="alpha">Alpha</Command.Item>
          <Command.Item value={'beta "value"'}>Beta</Command.Item>
        </Command.List>
      </Command>
    );
    const input = getByRole('combobox');
    const beta = getByRole('option', { name: 'Beta' });

    fireEvent.click(beta);

    await waitFor(() => {
      expect(input.getAttribute('aria-activedescendant')).toBe(beta.id);
    });
  });
});

import { expect, it, mock } from 'bun:test';

import { fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { Command, useCommandActions } from './select-command';

function ExternalInput({ onQuery }: { onQuery: (query: string) => void }) {
  const actions = useCommandActions();
  return (
    <input
      aria-label="Tag query"
      onFocus={actions.selectFirstItem}
      onChange={(event) => {
        actions.setSearch(event.target.value);
        onQuery(event.target.value);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
          event.preventDefault();
          actions.selectCurrentItem();
        }
      }}
    />
  );
}

it('keeps externally filtered item identity and the three editor controls', async () => {
  const selected = mock();
  function Scene() {
    const [query, setQuery] = React.useState('');
    return (
      <Command loop>
        <ExternalInput onQuery={setQuery} />
        <Command.List>
          <Command.Group>
            {['Alpha', 'Beta', 'Gamma']
              .filter((value) => value.toLowerCase().includes(query))
              .map((value) => (
                <Command.Item key={value} onSelect={selected}>
                  {value}
                </Command.Item>
              ))}
          </Command.Group>
        </Command.List>
      </Command>
    );
  }
  const view = render(<Scene />);
  const input = view.getByRole('textbox', {
    name: 'Tag query',
  }) as HTMLInputElement;
  try {
    await waitFor(() =>
      expect(
        view
          .getByRole('option', { name: 'Alpha' })
          .getAttribute('aria-selected')
      ).toBe('true')
    );
    fireEvent.pointerMove(view.getByRole('option', { name: 'Beta' }));
    fireEvent.change(input, { target: { value: 'a' } });
    await waitFor(() =>
      expect(
        view
          .getByRole('option', { name: 'Alpha' })
          .getAttribute('aria-selected')
      ).toBe('true')
    );
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(selected).toHaveBeenLastCalledWith('Beta');
    fireEvent.change(input, { target: { value: 'gam' } });
    await waitFor(() => expect(view.getAllByRole('option')).toHaveLength(1));
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(selected).toHaveBeenLastCalledWith('Gamma');
    expect(input.value).toBe('gam');
  } finally {
    view.unmount();
  }
});

it('keeps root keyboard composition guards and skips disabled items', async () => {
  const selected = mock();
  const view = render(
    <Command loop data-testid="menu">
      <Command.List>
        <Command.Item onSelect={selected}>Alpha</Command.Item>
        <Command.Item disabled>Disabled</Command.Item>
        <Command.Item onSelect={selected}>Beta</Command.Item>
      </Command.List>
    </Command>
  );
  const root = view.getByTestId('menu');
  try {
    await waitFor(() =>
      expect(
        view
          .getByRole('option', { name: 'Alpha' })
          .getAttribute('aria-selected')
      ).toBe('true')
    );
    fireEvent.keyDown(root, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(root, { key: 'Enter', keyCode: 229 });
    expect(selected).not.toHaveBeenCalled();
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    fireEvent.keyDown(root, { key: 'Enter', keyCode: 13 });
    expect(selected).toHaveBeenLastCalledWith('Beta');
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    expect(
      view.getByRole('option', { name: 'Alpha' }).getAttribute('aria-selected')
    ).toBe('true');
  } finally {
    view.unmount();
  }
});

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { setEditorReadOnly } from 'platejs';
import { createEditor, Plate, PlateContent } from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';
import * as React from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Toolbar } from '@/registry/components/editor/toolbar';

import { ModeToolbarButton } from './mode-toolbar-button';

it('shows Viewing while readonly even when the suggestion preference is retained', async () => {
  const editor = createEditor({
    plugins: [SuggestionPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: 'Keep' }] }],
  });
  editor.plugin(SuggestionPlugin).store.set({ isSuggesting: true });
  const view = render(
    <TooltipProvider>
      <Plate editor={editor}>
        <Toolbar>
          <ModeToolbarButton />
        </Toolbar>
        <PlateContent />
      </Plate>
    </TooltipProvider>
  );
  await waitFor(() =>
    expect(view.getByRole('button', { name: 'Suggestion' })).toBeTruthy()
  );
  act(() => setEditorReadOnly(editor, true));
  await waitFor(() =>
    expect(view.getByRole('button', { name: 'Viewing' })).toBeTruthy()
  );
  expect(editor.plugin(SuggestionPlugin).store.get('isSuggesting')).toBe(true);
  fireEvent.keyDown(view.getByRole('button', { name: 'Viewing' }), {
    key: 'Enter',
  });
  await waitFor(() =>
    expect(
      view
        .getByRole('menuitemradio', { name: 'Viewing' })
        .getAttribute('aria-checked')
    ).toBe('true')
  );
  act(() => setEditorReadOnly(editor, false));
  await waitFor(() =>
    expect(view.getByRole('button', { name: 'Suggestion' })).toBeTruthy()
  );
  view.unmount();
});

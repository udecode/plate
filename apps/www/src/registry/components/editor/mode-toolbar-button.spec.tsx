import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { setEditorReadOnly } from 'platejs';
import { DefaultAuthoredPlugin } from 'platejs/authored';
import {
  createEditor,
  type Editor,
  EditorRoot,
  EditorContent,
  useEditor,
} from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';
import * as React from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Toolbar } from '@/registry/components/editor/toolbar';

import { ModeToolbarButton } from './mode-toolbar-button';
import { SuggestionKit } from './suggestion';

const CaptureEditor = ({
  onEditor,
}: {
  onEditor: (editor: Editor) => void;
}) => {
  onEditor(useEditor());

  return null;
};

it('shows Viewing while readonly even when the suggestion preference is retained', async () => {
  const editor = createEditor({
    plugins: SuggestionKit,
    userId: 'alice',
    initialValue: [{ type: 'paragraph', children: [{ text: 'Keep' }] }],
  });
  let mountedEditor: Editor | undefined;
  const view = render(
    <TooltipProvider>
      <EditorRoot editor={editor}>
        <CaptureEditor onEditor={(current) => (mountedEditor = current)} />
        <Toolbar>
          <ModeToolbarButton />
        </Toolbar>
        <EditorContent />
      </EditorRoot>
    </TooltipProvider>
  );
  fireEvent.keyDown(view.getByRole('button', { name: 'Editing' }), {
    key: 'Enter',
  });
  fireEvent.click(
    await view.findByRole('menuitemradio', { name: 'Suggestion' })
  );
  await waitFor(() =>
    expect(view.getByRole('button', { name: 'Suggestion' })).toBeTruthy()
  );
  expect(mountedEditor).toBeDefined();
  expect(mountedEditor!.plugin(SuggestionPlugin).read.mode()).toBe(
    'suggesting'
  );
  act(() => setEditorReadOnly(mountedEditor!, true));
  await waitFor(() =>
    expect(view.getByRole('button', { name: 'Viewing' })).toBeTruthy()
  );
  expect(mountedEditor!.plugin(DefaultAuthoredPlugin).read.view().intent).toBe(
    'propose'
  );
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
  act(() => setEditorReadOnly(mountedEditor!, false));
  await waitFor(() =>
    expect(view.getByRole('button', { name: 'Suggestion' })).toBeTruthy()
  );
  view.unmount();
});

it('tracks authored view policy changes without a document commit', async () => {
  const editor = createEditor({
    plugins: SuggestionKit,
    userId: 'alice',
    initialValue: [{ type: 'paragraph', children: [{ text: 'Keep' }] }],
  });
  let mountedEditor: Editor | undefined;
  const view = render(
    <TooltipProvider>
      <EditorRoot editor={editor}>
        <CaptureEditor onEditor={(current) => (mountedEditor = current)} />
        <Toolbar>
          <ModeToolbarButton />
        </Toolbar>
        <EditorContent />
      </EditorRoot>
    </TooltipProvider>
  );

  expect(mountedEditor).toBeDefined();
  act(() => mountedEditor!.plugin(SuggestionPlugin).api.setMode('suggesting'));

  await waitFor(() =>
    expect(view.getByRole('button', { name: 'Suggestion' })).toBeTruthy()
  );
  view.unmount();
});

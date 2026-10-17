import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { NodeApi, setEditorReadOnly } from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';
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
  fireEvent.keyDown(
    view.getByRole('button', { name: 'Editing mode: Editing' }),
    {
      key: 'Enter',
    }
  );
  fireEvent.click(
    await view.findByRole('menuitemradio', { name: 'Suggestion' })
  );
  await waitFor(() =>
    expect(
      view.getByRole('button', { name: 'Editing mode: Suggestion' })
    ).toBeTruthy()
  );
  expect(mountedEditor).toBeDefined();
  expect(mountedEditor!.plugin(SuggestionPlugin).read.mode()).toBe(
    'suggesting'
  );
  act(() => setEditorReadOnly(mountedEditor!, true));
  await waitFor(() =>
    expect(
      view.getByRole('button', { name: 'Editing mode: Viewing' })
    ).toBeTruthy()
  );
  expect(mountedEditor!.plugin(AuthoredPlugin).read.view()).toEqual({
    intent: 'propose',
  });
  fireEvent.keyDown(
    view.getByRole('button', { name: 'Editing mode: Viewing' }),
    {
      key: 'Enter',
    }
  );
  await waitFor(() =>
    expect(
      view
        .getByRole('menuitemradio', { name: 'Viewing' })
        .getAttribute('aria-checked')
    ).toBe('true')
  );
  act(() => setEditorReadOnly(mountedEditor!, false));
  await waitFor(() =>
    expect(
      view.getByRole('button', { name: 'Editing mode: Suggestion' })
    ).toBeTruthy()
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
  editor.plugin(SuggestionPlugin).api.setMode('suggesting');
  editor.update.text.insert(' draft', { at: { path: [0, 0], offset: 4 } });
  const before = JSON.stringify(editor.read.value());
  const pending = editor.read.authored.changes().items.map((change) => ({
    authorId: change.authorId,
    id: change.id,
  }));
  const documentCommits: boolean[] = [];
  const stop = editor.subscribeCommit((commit) =>
    documentCommits.push(commit.changed.has('document'))
  );
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
  await waitFor(() =>
    expect(
      view.getByRole('button', { name: 'Editing mode: Suggestion' })
    ).toBeTruthy()
  );
  expect(view.getByRole('textbox')).toHaveTextContent('Keep draft');
  documentCommits.length = 0;
  fireEvent.keyDown(
    view.getByRole('button', { name: 'Editing mode: Suggestion' }),
    {
      key: 'Enter',
    }
  );
  fireEvent.click(await view.findByRole('menuitemradio', { name: 'Editing' }));
  await waitFor(() =>
    expect(
      view.getByRole('button', { name: 'Editing mode: Editing' })
    ).toBeTruthy()
  );
  expect(mountedEditor!.plugin(AuthoredPlugin).read.view()).toEqual({
    intent: 'edit',
  });
  expect(view.getByRole('textbox')).toHaveTextContent('Keep draft');
  expect(JSON.stringify(editor.read.value())).toBe(before);
  expect(
    editor.read.authored.changes().items.map((change) => ({
      authorId: change.authorId,
      id: change.id,
    }))
  ).toEqual(pending);
  expect(documentCommits).not.toContain(true);
  stop();
  view.unmount();
});

it.each([
  ['Accept all suggestions', ['Keep new text', 'this']],
  ['Reject all suggestions', ['Keep text', 'Drop this']],
])('%s decides the suggestions of every author', async (label, text) => {
  const bob = createEditor({
    plugins: SuggestionKit,
    userId: 'bob',
    initialValue: [
      { type: 'paragraph', children: [{ text: 'Keep text' }] },
      { type: 'paragraph', children: [{ text: 'Drop this' }] },
    ],
  });
  bob.update((tx) => {
    tx.authored.propose();
    tx.text.insert('new ', { at: { path: [0, 0], offset: 5 } });
  });
  const editor = createEditor({
    plugins: SuggestionKit,
    userId: 'carol',
    initialValue: bob.read.value(),
  });
  editor.update((tx) => {
    tx.authored.propose();
    tx.text.delete({
      at: {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 5 },
      },
    });
  });
  const view = render(
    <TooltipProvider>
      <EditorRoot editor={editor}>
        <Toolbar>
          <ModeToolbarButton />
        </Toolbar>
        <EditorContent />
      </EditorRoot>
    </TooltipProvider>
  );

  fireEvent.keyDown(
    view.getByRole('button', { name: 'Editing mode: Editing' }),
    { key: 'Enter' }
  );
  const item = await view.findByRole('menuitem', { name: label });

  await act(async () => {
    fireEvent.click(item);
  });
  expect({
    pending: editor.read.authored.changes().items,
    text: editor.read.value().children.map((block) => NodeApi.string(block)),
  }).toEqual({ pending: [], text });
  view.unmount();
});

it('offers Suggestion mode in an editor with no user', async () => {
  const editor = createEditor({
    plugins: SuggestionKit,
    initialValue: [{ type: 'paragraph', children: [{ text: 'Keep' }] }],
  });
  const view = render(
    <TooltipProvider>
      <EditorRoot editor={editor}>
        <Toolbar>
          <ModeToolbarButton />
        </Toolbar>
        <EditorContent />
      </EditorRoot>
    </TooltipProvider>
  );

  fireEvent.keyDown(
    view.getByRole('button', { name: 'Editing mode: Editing' }),
    {
      key: 'Enter',
    }
  );
  expect(
    view.queryByRole('menuitemradio', { name: 'Suggestion' })
  ).not.toBeNull();
  view.unmount();
});

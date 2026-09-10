import { expect, test } from 'bun:test';

import { act, render, waitFor } from '@testing-library/react';
import React from 'react';

import {
  createEditor,
  ParagraphPlugin,
  Plate,
  PlateContent,
  useEditor,
} from '../../react/core';
import { AIChatPlugin } from './AIChatPlugin';

function setup() {
  const editor = createEditor({
    plugins: [ParagraphPlugin, AIChatPlugin],
    initialValue: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'aiChat', children: [{ text: '' }] },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  const commands: Array<ReturnType<typeof useEditor>> = [];
  function Probe({ index }: { index: number }) {
    const commandEditor = useEditor();

    React.useLayoutEffect(() => {
      commands[index] = commandEditor;
    }, [commandEditor, index]);

    return null;
  }
  function View({ index }: { index: number }) {
    return (
      <Plate editor={editor}>
        <PlateContent data-testid={`editor-${index}`} />
        <Probe index={index} />
      </Plate>
    );
  }
  function App({ first = true }: { first?: boolean }) {
    return (
      <React.StrictMode>
        <input aria-label="AI prompt" />
        {first && <View index={0} />}
        <View index={1} />
      </React.StrictMode>
    );
  }
  const mounted = render(<App />);

  return {
    commands,
    editor,
    mounted,
    retireFirst: () => mounted.rerender(<App first={false} />),
  };
}

test.each([0, 1])(
  'hide focuses its invoking mounted view %s',
  async (index) => {
    const { commands, editor, mounted } = setup();
    const selection = editor.read.selection();
    const value = [editor.read.children()[0]];
    const undos = editor.read.history.undos();

    await act(async () => {
      editor.plugin(AIChatPlugin).store.set({ open: true });
      mounted.getByRole('textbox', { name: 'AI prompt' }).focus();

      commands[index].plugin(AIChatPlugin).api.hide({ undo: false });
    });

    await waitFor(() => {
      expect(
        document.activeElement === mounted.getByTestId(`editor-${index}`)
      ).toBe(true);
    });
    expect(editor.plugin(AIChatPlugin).store.get('open')).toBe(false);
    expect(editor.read.children()).toEqual(value);
    expect(editor.read.selection()).toEqual(selection);
    expect(editor.read.history.undos()).toEqual(undos);
  }
);

test('hide can leave focus on the external control', async () => {
  const { commands, editor, mounted } = setup();
  const input = mounted.getByRole('textbox', { name: 'AI prompt' });

  await act(async () => {
    editor.plugin(AIChatPlugin).store.set({ open: true });
    input.focus();
    commands[1].plugin(AIChatPlugin).api.hide({ focus: false, undo: false });
  });

  expect(document.activeElement).toBe(input);
  expect(editor.plugin(AIChatPlugin).store.get('open')).toBe(false);
});

test('a model close cannot choose one of its mounted views', async () => {
  const { editor, mounted } = setup();
  const input = mounted.getByRole('textbox', { name: 'AI prompt' });

  await act(async () => {
    input.focus();
    editor.plugin(AIChatPlugin).api.hide({ undo: false });
  });

  expect(document.activeElement).toBe(input);
});

test('a retired AI close does not borrow the remaining mounted view', async () => {
  const { commands, editor, mounted, retireFirst } = setup();
  const closing = commands[0].plugin(AIChatPlugin).api;
  const input = mounted.getByRole('textbox', { name: 'AI prompt' });

  retireFirst();

  await act(async () => {
    input.focus();
    expect(() => closing.hide({ undo: false })).toThrow(
      'Cannot update a read-only editor view.'
    );
  });

  expect(document.activeElement).toBe(input);
  expect(editor.plugin(AIChatPlugin).store.get('open')).toBe(false);
});

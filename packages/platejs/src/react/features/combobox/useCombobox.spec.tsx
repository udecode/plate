/// <reference types="@testing-library/jest-dom" />

import { act, render, waitFor } from '@testing-library/react';
import React from 'react';

import { EditorRoot } from '../../components/Plate';
import { EditorContent } from '../../components/PlateContent';
import { createEditor } from '../../editor';
import { ParagraphPlugin } from '../../plugins/paragraph/ParagraphPlugin';
import { BoldPlugin } from '../basic-nodes/BasicNodesPlugins';
import { MentionPlugin } from '../mention/MentionPlugin';
import { SlashPlugin } from '../slash-command/SlashPlugin';
import { type UseComboboxReturn, useCombobox } from './useCombobox';

let box: UseComboboxReturn | null = null;
let slashBox: UseComboboxReturn | null = null;
let popupOpen = true;
let popupKeys: string[] = [];

const MentionProbe = ({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) => {
  box = useCombobox({
    editableRef,
    open: popupOpen,
    plugin: MentionPlugin,
    onKeyDown: (event) => {
      popupKeys.push(event.key);

      return true;
    },
  });

  return null;
};

const viewBoxes = new Map<HTMLElement, UseComboboxReturn>();

const ViewProbe = ({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const viewBox = useCombobox({ editableRef, plugin: MentionPlugin });

  React.useLayoutEffect(() => {
    if (editableRef.current) viewBoxes.set(editableRef.current, viewBox);
  });

  return null;
};

const SlashProbe = ({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) => {
  slashBox = useCombobox({ editableRef, plugin: SlashPlugin });

  return null;
};

const setup = (
  text = 'Hi ',
  {
    beforeMount,
    caret = { offset: text.length, path: [0, 0] },
    children = [{ text }],
    previous = /^\s?$/,
    shortcuts,
    slash = false,
    trigger = '@',
  }: {
    beforeMount?: (editor: ReturnType<typeof createEditor>) => void;
    caret?: { offset: number; path: number[] };
    children?: Array<{ bold?: true; text: string }>;
    previous?: RegExp | null;
    shortcuts?: Parameters<typeof createEditor>[0]['shortcuts'];
    slash?: boolean;
    trigger?: string;
  } = {}
) => {
  const editor = createEditor({
    plugins: [
      ParagraphPlugin,
      BoldPlugin,
      MentionPlugin.configure({
        initialState: { trigger, triggerPreviousCharPattern: previous },
        slots: { afterEditable: MentionProbe },
      }),
      ...(slash
        ? [SlashPlugin.configure({ slots: { afterEditable: SlashProbe } })]
        : []),
    ],
    selection: { anchor: caret, focus: caret, kind: 'text' },
    shortcuts,
    initialValue: [{ children, type: 'paragraph' }],
  });

  beforeMount?.(editor);

  const rendered = render(
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );
  const editable = rendered.container.querySelector<HTMLElement>(
    '[contenteditable="true"]'
  )!;

  return { editable, editor };
};

const insert = async (editable: HTMLElement, data: string) => {
  await act(async () => {
    editable.focus();
    editable.dispatchEvent(
      new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        data,
        inputType: 'insertText',
      })
    );
  });
};

const type = async (editable: HTMLElement, text: string) => {
  for (const data of text) {
    await act(async () => {
      editable.focus();
      editable.dispatchEvent(
        new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          data,
          inputType: 'insertText',
        })
      );
    });
  }
};

const text = (editor: ReturnType<typeof setup>['editor']) =>
  editor.read.text.string([0]);

describe('useCombobox', () => {
  beforeEach(() => {
    box = null;
    slashBox = null;
    viewBoxes.clear();
    popupOpen = true;
    popupKeys = [];
  });

  it('opens on a typed trigger and completes the query as one undo step', async () => {
    const { editable, editor } = setup();

    await type(editable, '@jo');
    await waitFor(() => expect(box?.match?.query).toBe('jo'));

    const offered = box!.match!;
    let applied = false;

    act(() => {
      applied = box!.complete(offered, (tx) => {
        tx.plugin(MentionPlugin).insert({ label: 'Joan', ref: 'joan' });
      });
    });

    expect(applied).toBe(true);
    expect(box!.match).toBeNull();
    expect(editor.read.children()[0]).toMatchObject({
      children: [{ text: 'Hi ' }, { label: 'Joan', ref: 'joan' }, { text: '' }],
    });

    await act(async () => {
      editor.api.history.undo();
    });

    expect(text(editor)).toBe('Hi @jo');
    expect(editor.read.selection()?.focus).toEqual({ offset: 6, path: [0, 0] });
    expect(box!.match).toBeNull();

    await act(async () => {
      editor.api.history.redo();
    });

    expect(editor.read.children()[0]).toMatchObject({
      children: [{ text: 'Hi ' }, { label: 'Joan', ref: 'joan' }, { text: '' }],
    });
  });

  it('opens on a trigger inside one longer insertion, as an IME commit lands', async () => {
    const { editable } = setup();

    await insert(editable, '@jo');

    await waitFor(() => expect(box?.match?.query).toBe('jo'));
  });

  it('opens the most recently typed trigger when one insertion holds two', async () => {
    const { editable } = setup('Hi ', { slash: true });

    await insert(editable, '@x /');

    await waitFor(() => expect(slashBox?.match?.query).toBe(''));
    expect(box!.match).toBeNull();
  });

  it('matches a trigger typed across formatted leaves', async () => {
    const { editable } = setup('a[', {
      caret: { offset: 0, path: [0, 1] },
      children: [{ bold: true, text: 'a[' }, { text: 'x' }],
      previous: null,
      trigger: '[^',
    });

    await type(editable, '^');

    await waitFor(() =>
      expect(box?.match).toMatchObject({ query: '', trigger: '[^' })
    );
  });

  it('finds a trigger split across leaves when the scan stops short of the run start', async () => {
    const { editable } = setup('p1', {
      caret: { offset: 0, path: [0, 4] },
      children: [
        { text: 'p1' },
        { bold: true, text: 'p2' },
        { text: 'zzzzz' },
        { bold: true, text: 'a[' },
        { text: 'x' },
      ],
      previous: null,
      trigger: '[^',
    });

    await type(editable, '^');

    await waitFor(() =>
      expect(box?.match).toMatchObject({ query: '', trigger: '[^' })
    );
  });

  it('ends when the caret moves past the typed text', async () => {
    const { editable, editor } = setup('Hi there', {
      caret: { offset: 3, path: [0, 0] },
    });

    await type(editable, '@');
    await waitFor(() => expect(box?.match?.query).toBe(''));

    act(() => {
      editor.update((tx) => {
        tx.selection.set({ offset: 9, path: [0, 0] });
      });
    });

    expect(box!.match).toBeNull();
  });

  it('keeps the occurrence through a remote edit before the trigger', async () => {
    const { editable, editor } = setup();

    await type(editable, '@jo');
    await waitFor(() => expect(box?.match?.query).toBe('jo'));

    act(() => {
      editor.update({ tags: 'collaboration' }, (tx) => {
        tx.text.insert('Oh ', { at: { offset: 0, path: [0, 0] } });
      });
    });

    expect(text(editor)).toBe('Oh Hi @jo');
    expect(box!.match?.query).toBe('jo');
  });

  it('makes the editor root a combobox for the occurrence and restores it after', async () => {
    const { editable } = setup();
    const aria = () => ({
      expanded: editable.getAttribute('aria-expanded'),
      haspopup: editable.getAttribute('aria-haspopup'),
      multiline: editable.getAttribute('aria-multiline'),
      role: editable.getAttribute('role'),
    });

    await type(editable, '@jo');
    await waitFor(() => expect(box?.match?.query).toBe('jo'));

    expect(aria()).toEqual({
      expanded: 'true',
      haspopup: 'listbox',
      multiline: null,
      role: 'combobox',
    });

    act(() => box!.dismiss());

    expect(aria()).toEqual({
      expanded: null,
      haspopup: null,
      multiline: 'true',
      role: 'textbox',
    });
  });

  it('restores an attribute the app changed during the occurrence to the app value', async () => {
    const { editable } = setup();

    await type(editable, '@jo');
    await waitFor(() => expect(box?.match?.query).toBe('jo'));

    act(() => editable.setAttribute('role', 'application'));
    await type(editable, 'a');
    await waitFor(() => expect(box?.match?.query).toBe('joa'));

    expect(editable.getAttribute('role')).toBe('combobox');

    act(() => box!.dismiss());

    expect(editable.getAttribute('role')).toBe('application');
  });

  it('leaves keys to the editor while the popup is hidden', async () => {
    popupOpen = false;
    const { editable } = setup();

    await type(editable, '@');
    await waitFor(() => expect(box?.match?.query).toBe(''));

    act(() => {
      editable.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' })
      );
    });

    expect(popupKeys).toEqual([]);
    expect(editable).not.toHaveAttribute('aria-controls');
  });

  it('gives the open popup its keys before the shortcut table, but not Shift chords', async () => {
    const shortcut = mock();
    const { editable } = setup('Hi ', {
      shortcuts: { indent: { handler: shortcut, keys: 'tab' } },
    });

    await type(editable, '@');
    await waitFor(() => expect(box?.match?.query).toBe(''));

    act(() => {
      editable.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' })
      );
      editable.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          key: 'Enter',
          shiftKey: true,
        })
      );
    });

    expect(popupKeys).toEqual(['Tab']);
    expect(shortcut).not.toHaveBeenCalled();
  });

  it('keeps an occurrence in the view where the trigger was typed', async () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'Hi ' }], type: 'paragraph' }],
      plugins: [
        ParagraphPlugin,
        MentionPlugin.configure({ slots: { afterEditable: ViewProbe } }),
      ],
      selection: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
        kind: 'text',
      },
    });
    const { container } = render(
      <>
        <EditorRoot editor={editor}>
          <EditorContent />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <EditorContent />
        </EditorRoot>
      </>
    );
    const [first, second] = container.querySelectorAll<HTMLElement>(
      '[contenteditable="true"]'
    );

    await type(first, '@jo');
    await waitFor(() => expect(viewBoxes.get(first)?.match?.query).toBe('jo'));
    expect(viewBoxes.get(second)?.match).toBeNull();
    expect(second).not.toHaveAttribute('aria-controls');

    await act(async () => {
      second.focus();
    });

    await waitFor(() => expect(viewBoxes.get(first)?.match).toBeNull());
    expect(viewBoxes.get(second)?.match).toBeNull();
  });

  it('ends when another editor takes focus', async () => {
    const { editable } = setup();
    const other = render(
      <EditorRoot editor={createEditor({ plugins: [ParagraphPlugin] })}>
        <EditorContent />
      </EditorRoot>
    ).container.querySelector<HTMLElement>('[contenteditable="true"]')!;

    await type(editable, '@jo');
    await waitFor(() => expect(box?.match?.query).toBe('jo'));

    await act(async () => {
      other.focus();
    });

    await waitFor(() => expect(box!.match).toBeNull());
  });

  it('does not open for typing reported while another element has focus', async () => {
    const { editable } = setup('Hi ');
    const button = document.createElement('button');

    document.body.append(button);
    try {
      await act(async () => {
        editable.focus();
      });
      await act(async () => {
        button.focus();
      });
      await act(async () => {
        editable.dispatchEvent(
          new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            data: '@',
            inputType: 'insertText',
          })
        );
      });

      expect(box?.match).toBeNull();
      expect(editable.getAttribute('role')).toBe('textbox');
    } finally {
      button.remove();
    }
  });

  it('does not open on a trigger a commit listener writes over typed text', async () => {
    let rewritten = false;
    const { editable, editor } = setup('Hi ', {
      beforeMount: (target) => {
        // Subscribed before the popup's owner, so it rewrites the typed x first.
        target.subscribeCommit(() => {
          if (rewritten || target.read.text.string([0]) !== 'Hi x') return;
          rewritten = true;
          target.update((tx) => {
            tx.selection.set({
              anchor: { offset: 3, path: [0, 0] },
              focus: { offset: 4, path: [0, 0] },
            });
            tx.text.insert('@');
          });
        });
      },
    });

    await insert(editable, 'x');

    expect(text(editor)).toBe('Hi @');
    expect(box?.match).toBeNull();
  });

  it('does not open on an untyped trigger a commit listener leaves in the typed range', async () => {
    let removed = false;
    const { editable, editor } = setup('Hi @', {
      beforeMount: (target) => {
        target.subscribeCommit(() => {
          if (removed || target.read.text.string([0]) !== 'Hi @@') return;
          removed = true;
          target.update((tx) => {
            tx.selection.set({
              anchor: { offset: 3, path: [0, 0] },
              focus: { offset: 4, path: [0, 0] },
            });
            tx.text.delete();
            tx.selection.set({
              anchor: { offset: 4, path: [0, 0] },
              focus: { offset: 4, path: [0, 0] },
            });
          });
        });
      },
      caret: { offset: 3, path: [0, 0] },
    });

    await insert(editable, '@');

    expect(text(editor)).toBe('Hi @');
    expect(box?.match).toBeNull();
  });

  it('keeps the root a combobox when one insertion ends a query and types a new trigger', async () => {
    const { editable } = setup('Hi ');
    const roles: Array<string | null> = [];

    await type(editable, `@${'j'.repeat(75)}`);
    expect(editable.getAttribute('role')).toBe('combobox');

    const collect = (records: MutationRecord[]) => {
      for (const record of records) roles.push(record.oldValue);
    };
    const observer = new MutationObserver(collect);

    observer.observe(editable, {
      attributeFilter: ['role'],
      attributeOldValue: true,
    });
    await insert(editable, ' @');
    collect(observer.takeRecords());
    observer.disconnect();
    roles.push(editable.getAttribute('role'));

    expect(box?.match?.trigger).toBe('@');
    expect(roles).not.toContain('textbox');
  });

  it('opens only for typed triggers, never for a caret placed after one', async () => {
    const { editable, editor } = setup('Hi @jo');

    await type(editable, 'h');

    expect(text(editor)).toBe('Hi @joh');
    expect(box!.match).toBeNull();
  });

  it('treats a trigger followed by whitespace as prose', async () => {
    const { editable } = setup();

    await type(editable, '@');
    await waitFor(() => expect(box?.match?.query).toBe(''));
    await type(editable, ' 2');

    expect(box!.match).toBeNull();
  });

  it('keeps the literal query when dismissed and does not reopen', async () => {
    const { editable, editor } = setup();

    await type(editable, '@jo');
    await waitFor(() => expect(box?.match).not.toBeNull());

    act(() => box!.dismiss());
    await type(editable, 'an');

    expect(text(editor)).toBe('Hi @joan');
    expect(box!.match).toBeNull();
  });

  it('stays closed after Escape through a remote edit and a caret return', async () => {
    const { editable, editor } = setup();

    await type(editable, '@jo');
    await waitFor(() => expect(box?.match).not.toBeNull());

    act(() => box!.dismiss());
    act(() => {
      editor.update({ tags: 'collaboration' }, (tx) => {
        tx.text.insert('Oh ', { at: { offset: 0, path: [0, 0] } });
      });
    });

    expect(box!.match).toBeNull();

    act(() => {
      editor.update((tx) => {
        tx.selection.set({ offset: 0, path: [0, 0] });
      });
      editor.update((tx) => {
        tx.selection.set({ offset: 9, path: [0, 0] });
      });
    });

    expect(text(editor)).toBe('Oh Hi @jo');
    expect(box!.match).toBeNull();
  });

  it('refuses without edits when the callback returns false or the match is stale', async () => {
    const { editable, editor } = setup();

    await type(editable, '@jo');
    await waitFor(() => expect(box?.match?.query).toBe('jo'));

    const stale = box!.match!;

    act(() => {
      expect(box!.complete(stale, () => false)).toBe(false);
    });
    expect(text(editor)).toBe('Hi @jo');

    await type(editable, 'a');
    await waitFor(() => expect(box?.match?.query).toBe('joa'));

    act(() => {
      expect(
        box!.complete(stale, (tx) => {
          tx.text.insert('!');
        })
      ).toBe(false);
    });
    expect(text(editor)).toBe('Hi @joa');
  });

  it('refuses a match from a dismissed occurrence on a newer one with equal text', async () => {
    const { editable, editor } = setup();

    await type(editable, '@jo');
    await waitFor(() => expect(box?.match?.query).toBe('jo'));

    const dismissed = box!.match!;

    act(() => box!.dismiss());
    await type(editable, ' @jo');
    await waitFor(() => expect(box?.match?.query).toBe('jo'));

    act(() => {
      expect(
        box!.complete(dismissed, (tx) => {
          tx.text.insert('!');
        })
      ).toBe(false);
    });
    expect(text(editor)).toBe('Hi @jo @jo');
  });

  it('rolls back the deletion when the callback throws or returns a promise', async () => {
    const { editable, editor } = setup();

    await type(editable, '@jo');
    await waitFor(() => expect(box?.match).not.toBeNull());

    const offered = box!.match!;

    expect(() =>
      box!.complete(offered, () => {
        throw new Error('boom');
      })
    ).toThrow('boom');
    expect(text(editor)).toBe('Hi @jo');
    expect(() =>
      box!.complete(
        offered,
        // @ts-expect-error A completion must be synchronous.
        async () => {}
      )
    ).toThrow('synchronous');
    expect(text(editor)).toBe('Hi @jo');
  });

  it('ends the occurrence when the trigger is replaced in one change', async () => {
    const { editable, editor } = setup();

    await type(editable, '@jo');
    await waitFor(() => expect(box?.match).not.toBeNull());

    act(() => {
      editor.update((tx) => {
        tx.text.delete({
          at: {
            anchor: { offset: 3, path: [0, 0] },
            focus: { offset: 4, path: [0, 0] },
          },
        });
        tx.text.insert('@', { at: { offset: 3, path: [0, 0] } });
      });
    });

    expect(text(editor)).toBe('Hi @jo');
    expect(box!.match).toBeNull();
  });
});

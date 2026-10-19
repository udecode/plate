import { afterEach, describe, expect, it, mock } from 'bun:test';

import { act, fireEvent, render } from '@testing-library/react';
import { createEditor } from 'platejs/react';
import * as React from 'react';

import {
  SelectEditor,
  type SelectItem,
  SelectTagPlugin,
} from './select-editor';

const tag = (value: string, url?: string) => ({
  children: [{ text: '' }],
  type: 'tag',
  value,
  ...(url === undefined ? {} : { url }),
});

const caret = (path: number[], offset: number) => ({
  anchor: { offset, path },
  focus: { offset, path },
  kind: 'text' as const,
});

describe('SelectTagPlugin', () => {
  it('picks a chip at the caret, clears the search and moves the caret to the end', () => {
    const editor = createEditor({
      plugins: [SelectTagPlugin],
      selection: caret([0, 2], 3),
      initialValue: [
        {
          children: [{ text: '' }, tag('Editor'), { text: 'sel' }],
          type: 'paragraph',
        },
      ],
    });

    editor
      .plugin(SelectTagPlugin)
      .update.pick({ url: '/docs/select', value: 'Select Editor' });

    expect({
      items: editor.plugin(SelectTagPlugin).read.items(),
      search: editor.read.text.string([]),
      selection: editor.read.selection(),
    }).toEqual({
      items: [
        { value: 'Editor' },
        { url: '/docs/select', value: 'Select Editor' },
      ],
      search: '',
      selection: {
        anchor: { offset: 0, path: [0, 4] },
        focus: { offset: 0, path: [0, 4] },
      },
    });
  });

  it('keeps the first chip when two labels differ only in case', () => {
    const editor = createEditor({
      plugins: [SelectTagPlugin],
      initialValue: [
        {
          children: [
            { text: '' },
            tag('React'),
            { text: '' },
            tag('react'),
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.value.repair();

    expect(editor.plugin(SelectTagPlugin).read.items()).toEqual([
      { value: 'React' },
    ]);
  });

  it('trims leading whitespace from the search', () => {
    const editor = createEditor({
      plugins: [SelectTagPlugin],
      selection: caret([0, 0], 7),
      initialValue: [{ children: [{ text: '  query' }], type: 'paragraph' }],
    });

    editor.update.text.insert('!');

    expect(editor.read.text.string([])).toBe('query!');
  });

  it('deletes the previous chip before moving past the remaining chip', () => {
    const editor = createEditor({
      plugins: [SelectTagPlugin],
      selection: caret([0, 3], 0),
      initialValue: [
        {
          children: [tag('alpha'), { text: '' }, tag('beta'), { text: '' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect({
      items: editor.plugin(SelectTagPlugin).read.items(),
      selection: editor.read.selection(),
    }).toEqual({
      items: [{ value: 'alpha' }],
      selection: {
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      },
    });
  });

  it('removes the old search when one commit moves the caret and types', () => {
    const editor = createEditor({
      plugins: [SelectTagPlugin],
      selection: caret([0, 0], 2),
      initialValue: [
        {
          children: [{ text: 'ab' }, tag('alpha'), { text: '' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update((tx) => {
      tx.selection.set(caret([0, 2], 0));
      tx.text.insert('c');
    });

    expect(editor.read.text.string([])).toBe('c');
  });

  it('removes the search a caret move leaves behind', () => {
    const editor = createEditor({
      plugins: [SelectTagPlugin],
      selection: caret([0, 0], 2),
      initialValue: [
        {
          children: [{ text: 'ab' }, tag('alpha'), { text: '' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update((tx) => {
      tx.selection.set(caret([0, 2], 0));
    });

    expect(editor.read.text.string([])).toBe('');
  });
});

const LABELS: SelectItem[] = [
  { value: 'React' },
  { url: '/docs/typescript', value: 'TypeScript' },
  { url: '/docs/rust', value: 'Rust' },
];

const editableOf = (view: ReturnType<typeof render>) =>
  view.getByRole('combobox', { name: 'Labels' });

const chipsOf = (view: ReturnType<typeof render>) =>
  [...view.container.querySelectorAll('[data-editor-void]')].map((chip) =>
    chip.textContent?.replaceAll('﻿', '')
  );

const typeAtTextEnd = async (
  editable: HTMLElement,
  text: string,
  path?: string
) => {
  await act(async () => {
    editable.focus();
  });
  await act(async () => {
    const range = document.createRange();
    const texts = editable.querySelectorAll('[data-editor-node="text"]');

    range.selectNodeContents(
      path
        ? editable.querySelector(`[data-editor-path="${path}"]`)!
        : [...texts].at(-1)!
    );
    range.collapse(false);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });
  act(() => {
    fireEvent(
      editable,
      new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        data: text,
        inputType: 'insertText',
      })
    );
  });
};

// typeAtTextEnd leaves a DOM range in an unmounted editor, which the next
// editor's focus would read.
afterEach(() => {
  window.getSelection()?.removeAllRanges();
});

const press = (editable: HTMLElement, init: KeyboardEventInit) => {
  act(() => {
    fireEvent.keyDown(editable, init);
  });
};

describe('SelectEditor', () => {
  it('reports a pick once under Strict Mode and writes nothing back', async () => {
    const onEmit = mock();
    function Form() {
      const [value, setValue] = React.useState<SelectItem[]>([LABELS[0]]);

      return (
        <SelectEditor
          aria-label="Labels"
          items={LABELS}
          value={value}
          onValueChange={(items) => {
            onEmit(items);
            setValue(items);
          }}
        />
      );
    }
    const view = render(
      <React.StrictMode>
        <Form />
      </React.StrictMode>
    );
    const editable = editableOf(view);

    await typeAtTextEnd(editable, 'Rus');
    press(editable, { key: 'Enter', keyCode: 13 });

    expect(onEmit.mock.calls).toEqual([
      [[{ value: 'React' }, { url: '/docs/rust', value: 'Rust' }]],
    ]);
  });

  it('keeps the caret when the parent passes back an equal value', async () => {
    const value = [LABELS[0], LABELS[2]];
    const view = render(
      <SelectEditor aria-label="Labels" items={LABELS} value={value} />
    );
    const editable = editableOf(view);

    await typeAtTextEnd(editable, '', '0,2');
    view.rerender(
      <SelectEditor aria-label="Labels" items={LABELS} value={[...value]} />
    );
    await typeAtTextEnd(editable, 'x', '0,2');

    expect(editable.textContent?.replaceAll('\uFEFF', '')).toBe('ReactxRust');
  });

  it('puts the form value back when the parent refuses a pick, without reporting it again', async () => {
    const onEmit = mock();
    const view = render(
      <SelectEditor
        aria-label="Labels"
        items={LABELS}
        value={[LABELS[0]]}
        onValueChange={onEmit}
      />
    );
    const editable = editableOf(view);

    await typeAtTextEnd(editable, 'Rus');
    press(editable, { key: 'Enter', keyCode: 13 });

    expect({ calls: onEmit.mock.calls.length, chips: chipsOf(view) }).toEqual({
      calls: 1,
      chips: ['React'],
    });
  });

  it('writes a transformed echo without reporting it', async () => {
    const onEmit = mock();
    function Form() {
      const [value, setValue] = React.useState<SelectItem[]>([LABELS[0]]);

      return (
        <SelectEditor
          aria-label="Labels"
          items={LABELS}
          value={value}
          onValueChange={(items) => {
            onEmit(items);
            setValue(
              items.map((item) => ({
                ...item,
                value: item.value.toUpperCase(),
              }))
            );
          }}
        />
      );
    }
    const view = render(<Form />);
    const editable = editableOf(view);

    await typeAtTextEnd(editable, 'Rus');
    press(editable, { key: 'Enter', keyCode: 13 });

    expect({ calls: onEmit.mock.calls.length, chips: chipsOf(view) }).toEqual({
      calls: 1,
      chips: ['REACT', 'RUST'],
    });
  });

  it('shows a repeated label once and writes nothing more, whether the parent keeps the array or a copy', async () => {
    const onEmit = mock();
    const repeated = [{ value: 'React' }, { value: 'react' }, LABELS[2]];
    const view = render(
      <SelectEditor
        aria-label="Labels"
        items={LABELS}
        value={repeated}
        onValueChange={onEmit}
      />
    );
    const editable = editableOf(view);

    await typeAtTextEnd(editable, '', '0,2');
    view.rerender(
      <SelectEditor
        aria-label="Labels"
        items={LABELS}
        value={repeated}
        onValueChange={onEmit}
      />
    );
    view.rerender(
      <SelectEditor
        aria-label="Labels"
        items={LABELS}
        value={[...repeated]}
        onValueChange={onEmit}
      />
    );
    await typeAtTextEnd(editable, 'x', '0,2');

    expect({
      calls: onEmit.mock.calls.length,
      text: editable.textContent?.replaceAll('\uFEFF', ''),
    }).toEqual({ calls: 0, text: 'ReactxRust' });
  });

  it('keeps chip links from the starting value and from a pick', async () => {
    const onEmit = mock();
    const view = render(
      <SelectEditor
        aria-label="Labels"
        defaultValue={[LABELS[1]]}
        items={LABELS}
        onValueChange={onEmit}
      />
    );
    const editable = editableOf(view);

    await typeAtTextEnd(editable, 'Rus');
    press(editable, { key: 'Enter', keyCode: 13 });

    expect(onEmit.mock.calls).toEqual([
      [
        [
          { url: '/docs/typescript', value: 'TypeScript' },
          { url: '/docs/rust', value: 'Rust' },
        ],
      ],
    ]);
  });

  it('starts a reopened menu at the first option', async () => {
    const view = render(<SelectEditor aria-label="Labels" items={LABELS} />);
    const editable = editableOf(view);

    await act(async () => {
      editable.focus();
    });
    press(editable, { key: 'ArrowDown', keyCode: 40 });
    press(editable, { key: 'ArrowDown', keyCode: 40 });
    await act(async () => {
      editable.blur();
    });
    await act(async () => {
      editable.focus();
    });
    press(editable, { key: 'Enter', keyCode: 13 });

    expect(chipsOf(view)).toEqual(['React']);
  });

  it('links each read-only chip to its url', () => {
    const view = render(
      <SelectEditor
        aria-label="Labels"
        defaultValue={[
          { url: 'https://example.com/docs', value: 'Web' },
          { url: 'mailto:team@example.com', value: 'Mail' },
          { url: 'tel:+15550100', value: 'Phone' },
          { url: '/docs/rust', value: 'Rust' },
          { url: '/docs?q=rust#top', value: 'Search' },
          { url: ' https://example.com/padded ', value: 'Padded' },
          { url: '?q=rust', value: 'Query' },
          { url: '#top', value: 'Top' },
          { url: 'docs/rust', value: 'Relative' },
          { url: ' mailto:help@example.com ', value: 'Padded mail' },
          { url: ' /docs/padded ', value: 'Padded path' },
          { url: '/docs/[id]?q=x#top', value: 'Bracket path' },
          {
            url: 'https://github.com/udecode/plate/tree/main/app/[slug]',
            value: 'Bracket web',
          },
        ]}
        readOnly
      />
    );

    expect(
      [...view.container.querySelectorAll('a')].map((link) => [
        link.textContent,
        link.getAttribute('href'),
      ])
    ).toEqual([
      ['Web', 'https://example.com/docs'],
      ['Mail', 'mailto:team@example.com'],
      ['Phone', 'tel:+15550100'],
      ['Rust', '/docs/rust'],
      ['Search', '/docs?q=rust#top'],
      ['Padded', 'https://example.com/padded'],
      ['Query', '?q=rust'],
      ['Top', '#top'],
      ['Relative', 'docs/rust'],
      ['Padded mail', 'mailto:help@example.com'],
      ['Padded path', '/docs/padded'],
      ['Bracket path', '/docs/%5Bid%5D?q=x#top'],
      [
        'Bracket web',
        'https://github.com/udecode/plate/tree/main/app/%5Bslug%5D',
      ],
    ]);
  });

  it.each(['https://', ' data:text/html,x', '\tjavascript:alert(1)'])(
    'shows a read-only chip without a link when Plate refuses its url %p',
    (url) => {
      const view = render(
        <SelectEditor
          aria-label="Labels"
          defaultValue={[{ url, value: 'Refused' }]}
          readOnly
        />
      );

      expect({
        chips: chipsOf(view),
        links: view.container.querySelectorAll('a').length,
      }).toEqual({ chips: ['Refused'], links: 0 });
    }
  );

  it('hands the form ref and blur to the editable', async () => {
    const ref = React.createRef<HTMLDivElement>();
    const onBlur = mock();
    const view = render(
      <SelectEditor
        ref={ref}
        aria-label="Labels"
        items={LABELS}
        onBlur={onBlur}
      />
    );

    await act(async () => {
      ref.current?.focus();
    });
    await act(async () => {
      ref.current?.blur();
    });

    expect({
      blurred: onBlur.mock.calls.length,
      ref: ref.current === editableOf(view),
    }).toEqual({ blurred: 1, ref: true });
  });

  it('keeps Enter and the undo keys from a passed-in onKeyDown', async () => {
    const onKeyDown = mock(() => false);
    const mod = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
      ? { metaKey: true }
      : { ctrlKey: true };
    const view = render(
      <SelectEditor aria-label="Labels" items={LABELS} onKeyDown={onKeyDown} />
    );
    const editable = editableOf(view);

    await typeAtTextEnd(editable, 'Ru');
    press(editable, { ...mod, key: 'z', keyCode: 90 });
    press(editable, { key: 'Enter', keyCode: 13 });

    expect({
      calls: onKeyDown.mock.calls.length,
      chips: chipsOf(view),
    }).toEqual({ calls: 0, chips: ['Rust'] });
  });
});

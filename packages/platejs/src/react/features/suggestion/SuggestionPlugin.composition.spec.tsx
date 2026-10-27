import { act, fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { definePlugin } from '../../../lib/plugin';
import { createTextSubstitutionInputRule } from '../../../lib/plugins/input-rules/createInputRules';
import { defineInputRule } from '../../../lib/plugins/input-rules/defineInputRule';
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  MathRules,
} from '../../../math/lib/BaseEquationPlugin';
import { createEditor, EditorContent, EditorRoot, useEditor } from '../../core';
import { SuggestionPlugin } from './SuggestionPlugin';

// Desktop browsers dispatch `beforeinput`; without it React's polyfill turns
// compositionend into a second insert.
Object.defineProperty(InputEvent.prototype, 'getTargetRanges', {
  configurable: true,
  value: () => [],
});

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const mountSuggesting = async () => {
  const editor = createEditor({
    initialValue: [
      { children: [{ text: 'Base' }], type: 'paragraph' },
      { children: [{ text: 'next' }], type: 'paragraph' },
    ],
    plugins: [SuggestionPlugin],
    userId: 'alice',
  });
  let view: ReturnType<typeof useEditor> | undefined;
  const Capture = () => {
    view = useEditor();
    return null;
  };

  editor.plugin(SuggestionPlugin).api.setMode('suggesting');
  editor.update.text.insert(' 한', { at: { offset: 4, path: [0, 0] } });
  const mounted = render(
    <EditorRoot editor={editor} suppressInstanceWarning>
      <EditorContent data-testid="content" />
      <Capture />
    </EditorRoot>
  );
  const root = mounted.container.querySelector<HTMLElement>('[data-editor]')!;

  Object.defineProperty(root, 'isContentEditable', { value: true });
  await act(async () => {
    root.focus();
    const text = view!.read.children()[0] as {
      children: ReadonlyArray<{ text: string }>;
    };
    const last = text.children.length - 1;
    const point = { offset: text.children[last].text.length, path: [0, last] };

    view!.update((tx) => tx.selection.set({ anchor: point, focus: point }));
    await wait(60);
  });

  return { mounted, root, view: view! };
};

// Happy DOM reports a WebKit host, so each syllable commits through WebKit's
// final `insertFromComposition`, and the next composition starts in the task
// that ends the previous one.
const composeKoreanChain = async (
  root: HTMLElement,
  syllables: readonly string[]
) => {
  const selection = document.getSelection()!;
  const start = (syllable: string) => {
    fireEvent.compositionStart(root);
    const node = selection.focusNode;

    if (!(node instanceof Text)) throw new Error('The caret is not in text');
    const offset = selection.focusOffset;

    fireEvent.compositionUpdate(root, { data: syllable });
    root.dispatchEvent(
      new InputEvent('beforeinput', {
        bubbles: true,
        data: syllable,
        inputType: 'insertCompositionText',
        isComposing: true,
      })
    );
    node.insertData(offset, syllable);
    selection.setBaseAndExtent(
      node,
      offset + syllable.length,
      node,
      offset + syllable.length
    );
    fireEvent.input(root, {
      data: syllable,
      inputType: 'insertCompositionText',
      isComposing: true,
    });
  };
  const end = (syllable: string) => {
    root.dispatchEvent(
      new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        data: syllable,
        inputType: 'insertFromComposition',
        isComposing: true,
      })
    );
    fireEvent.compositionEnd(root, { data: syllable });
  };

  for (const [index, syllable] of syllables.entries()) {
    await act(async () => {
      if (index > 0) end(syllables[index - 1]);
      start(syllable);
      await wait(20);
    });
  }
  await act(async () => {
    end(syllables.at(-1)!);
    await wait(80);
  });
};

const bobDeletes = [{ at: 1, author: 'bob', change: 'bob:1', kind: 'delete' }];
const alice = (kind: 'delete' | 'insert') => [
  { at: expect.any(Number), author: 'alice', change: expect.any(String), kind },
];

it.each([
  {
    mode: 'editing' as const,
    text: '©gone',
    value: [{ text: '©' }, { authored: bobDeletes, text: 'gone' }],
  },
  {
    mode: 'suggesting' as const,
    text: '(c©gone',
    value: [
      { authored: alice('delete'), text: '(c' },
      { authored: alice('insert'), text: '©' },
      { authored: bobDeletes, text: 'gone' },
    ],
  },
])(
  'runs input rules on a word composed inside another author’s pending deletion while $mode',
  async ({ mode, text, value }) => {
    const caret = { offset: 2, path: [0, 1] };
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: '(c' }, { authored: bobDeletes, text: 'gone' }],
          type: 'paragraph',
        },
      ],
      plugins: [
        SuggestionPlugin,
        definePlugin('shortcuts', {
          inputRules: [
            createTextSubstitutionInputRule({
              patterns: [{ format: '©', match: '(c)' }],
            }),
          ],
        }),
      ],
      userId: 'alice',
    });

    editor.plugin(SuggestionPlugin).api.setMode(mode);
    const mounted = render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent />
      </EditorRoot>
    );
    const root = mounted.container.querySelector<HTMLElement>('[data-editor]')!;

    Object.defineProperty(root, 'isContentEditable', { value: true });
    try {
      await act(async () => {
        root.focus();
        editor.update((tx) =>
          tx.selection.set({ anchor: caret, focus: caret })
        );
        await wait(60);
      });
      await composeKoreanChain(root, [')']);

      expect({
        text: root.querySelector('[data-editor-node="element"]')?.textContent,
        value: editor.read.children(),
      }).toEqual({ text, value: [{ children: value, type: 'paragraph' }] });
    } finally {
      mounted.unmount();
    }
  }
);

it.each([
  { mode: 'editing' as const, word: { text: 'カ' } },
  {
    mode: 'suggesting' as const,
    word: { authored: alice('insert'), text: 'カ' },
  },
])(
  'keeps the composed landing when an input rule only rewrites the composed text while $mode',
  async ({ mode, word }) => {
    const caret = { offset: 2, path: [0, 1] };
    const editor = createEditor({
      initialValue: [
        {
          children: [
            { text: 'a ' },
            { authored: bobDeletes, text: 'gone' },
            { text: ' b' },
          ],
          type: 'paragraph',
        },
      ],
      plugins: [
        SuggestionPlugin,
        definePlugin('katakana', {
          inputRules: [
            defineInputRule({
              apply: ({ next }) => next('カ'),
              target: 'insertText',
              trigger: 'か',
            }),
          ],
        }),
      ],
      userId: 'alice',
    });
    editor.plugin(SuggestionPlugin).api.setMode(mode);
    const mounted = render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent />
      </EditorRoot>
    );
    const root = mounted.container.querySelector<HTMLElement>('[data-editor]')!;

    Object.defineProperty(root, 'isContentEditable', { value: true });
    try {
      await act(async () => {
        root.focus();
        editor.update((tx) =>
          tx.selection.set({ anchor: caret, focus: caret })
        );
        await wait(60);
      });
      await composeKoreanChain(root, ['か']);

      expect(editor.read.children()).toEqual([
        {
          children: [
            { text: 'a ' },
            { authored: bobDeletes, text: 'go' },
            word,
            { authored: bobDeletes, text: 'ne' },
            { text: ' b' },
          ],
          type: 'paragraph',
        },
      ]);
    } finally {
      mounted.unmount();
    }
  }
);

it('closes an inline equation on a dollar composed inside another author’s pending deletion', async () => {
  const caret = { offset: 2, path: [0, 1] };
  const editor = createEditor({
    initialValue: [
      {
        children: [
          { text: '$a' },
          {
            authored: [
              { at: 1, author: 'bob', change: 'bob:1', kind: 'delete' },
            ],
            text: 'junk',
          },
        ],
        type: 'paragraph',
      },
    ],
    plugins: [
      SuggestionPlugin,
      BaseInlineEquationPlugin.configure({
        inputRules: [MathRules.markdown({ variant: '$' })],
      }),
      BaseEquationPlugin,
    ],
    userId: 'alice',
  });
  const mounted = render(
    <EditorRoot editor={editor} suppressInstanceWarning>
      <EditorContent />
    </EditorRoot>
  );
  const root = mounted.container.querySelector<HTMLElement>('[data-editor]')!;

  Object.defineProperty(root, 'isContentEditable', { value: true });
  try {
    await act(async () => {
      root.focus();
      editor.update((tx) => tx.selection.set({ anchor: caret, focus: caret }));
      await wait(60);
    });
    await composeKoreanChain(root, ['$']);

    const { children } = editor.read.children()[0] as {
      children: ReadonlyArray<{
        authored?: unknown;
        latex?: string;
        text?: string;
      }>;
    };

    expect({
      equations: children.flatMap((child) =>
        child.latex === undefined ? [] : [child.latex]
      ),
      struck: children
        .filter((child) => child.authored)
        .map((child) => child.text)
        .join(''),
      text: children.map((child) => child.text ?? '').join(''),
    }).toEqual({ equations: ['a'], struck: 'junk', text: 'junk' });
  } finally {
    mounted.unmount();
  }
});

it('composes a Korean chain on suggestion leaves without rebuilding the line', async () => {
  const { mounted, root, view } = await mountSuggesting();
  const line = root.querySelector('[data-editor-node="element"]');

  try {
    await composeKoreanChain(root, ['글', '이']);

    expect({
      line: root.querySelector('[data-editor-node="element"]') === line,
      text: line?.textContent,
      model: (
        view.read.children()[0] as { children: ReadonlyArray<{ text: string }> }
      ).children
        .map(({ text }) => text)
        .join(''),
    }).toEqual({
      line: true,
      model: 'Base 한글이',
      text: 'Base 한글이',
    });
  } finally {
    mounted.unmount();
  }
});

import { expect, it } from 'bun:test';

import { act, render } from '@testing-library/react';
import { AIChatPlugin } from 'platejs/ai/react';
import { EditorRoot, ParagraphPlugin, createEditor } from 'platejs/react';
import * as React from 'react';

import { AIChatEditor } from './ai-menu';

// Registry components rely on the automatic JSX runtime; Bun compiles these
// specs with the classic one.
Object.assign(globalThis, { React });

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

it('renders the draft document, keeping block hosts and marking its end', () => {
  const editor = createEditor({
    plugins: [ParagraphPlugin, AIChatPlugin],
    initialValue: [paragraph('')],
  });
  const view = render(
    <EditorRoot editor={editor}>
      <AIChatEditor />
    </EditorRoot>
  );
  const blocks = () => [
    ...view.container.querySelectorAll(
      '[data-editor-ai-draft] [data-editor-path]:not([data-editor-path*=","])'
    ),
  ];
  const texts = () => blocks().map((block) => block.textContent);
  const ends = () =>
    [...view.container.querySelectorAll('[data-editor-ai-end]')].map(
      (end) => end.textContent
    );
  const show = (previewValue: Array<ReturnType<typeof paragraph>>) =>
    act(() => {
      editor.plugin(AIChatPlugin).store.set({ previewValue });
    });
  const kept = paragraph('A');

  show([kept, paragraph('B')]);
  const first = blocks()[0];
  expect(texts()).toEqual(['A', 'B']);

  show([kept, paragraph('B2'), paragraph('CD')]);
  expect(texts()).toEqual(['A', 'B2', 'CD']);
  expect(blocks()[0]).toBe(first);
  // Decorations read the rendered draft, not the preview editor's own value,
  // and one marker covers only its last character.
  expect(ends()).toEqual(['D']);

  show([kept, paragraph('E😀')]);
  expect(ends()).toEqual(['😀']);

  show([kept]);
  expect(texts()).toEqual(['A']);
  expect(blocks()[0]).toBe(first);

  show([paragraph('X')]);
  expect(texts()).toEqual(['X']);
  view.unmount();
});

it('keeps the draft end marker mounted while the draft changes', () => {
  const editor = createEditor({
    plugins: [ParagraphPlugin, AIChatPlugin],
    initialValue: [paragraph('')],
  });
  const view = render(
    <EditorRoot editor={editor}>
      <AIChatEditor />
    </EditorRoot>
  );
  const draft = () => view.container.querySelector('[data-editor-ai-draft]');
  const show = (previewValue: Array<ReturnType<typeof paragraph>>) =>
    act(() => {
      editor.plugin(AIChatPlugin).store.set({ previewValue, streaming: true });
    });

  show([paragraph('')]);
  const tail = draft()?.lastElementChild;
  expect(tail?.hasAttribute('data-editor-ai-end')).toBe(true);

  show([paragraph('A')]);
  // Adding or removing a sibling after the preview restyles all of it.
  expect(draft()?.lastElementChild).toBe(tail);
  expect(tail?.hasAttribute('data-editor-ai-end')).toBe(false);
  view.unmount();
});

'use client';

import { BaseParagraphPlugin } from 'platejs';
import {
  BlockPlaceholderPlugin,
  createEditor,
  EditorRoot,
  EditorContent,
  EditorElement,
  type EditorElementProps,
  useEditor,
  useEditorFocused,
} from 'platejs/react';
import { StrictMode, useState } from 'react';

function ParagraphElement(
  props: EditorElementProps<typeof BaseParagraphPlugin>
) {
  return <EditorElement {...props} as="section" />;
}

function FocusControls() {
  const editor = useEditor();
  const [blurCount, setBlurCount] = useState(0);

  return (
    <div>
      <button onClick={() => editor.api.dom.focus()} type="button">
        Focus
      </button>
      <button
        data-blur-count={blurCount}
        onClick={() => {
          editor.api.dom.focus();
          editor.api.dom.blur();
          setBlurCount((count) => count + 1);
        }}
        type="button"
      >
        Focus then blur
      </button>
    </div>
  );
}

function FocusFixture({
  variant,
}: {
  variant: 'default' | 'intrinsic' | 'custom';
}) {
  const [editor] = useState(() =>
    createEditor({
      initialValue: [
        { children: [{ text: 'one' }], type: 'paragraph' },
        { children: [{ text: '' }], type: 'paragraph' },
      ],
      plugins: [
        variant === 'default'
          ? BaseParagraphPlugin
          : BaseParagraphPlugin.configure({
              component: variant === 'intrinsic' ? 'p' : ParagraphElement,
            }),
        BlockPlaceholderPlugin.configure({
          initialState: {
            className: 'block-placeholder',
            placeholders: { paragraph: 'Type here' },
          },
        }),
      ],
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
        kind: 'text',
      },
    })
  );

  return (
    <section aria-label={variant}>
      <h2>{variant}</h2>
      <EditorRoot editor={editor}>
        <EditorContent aria-label={`${variant} editor`} />
        <FocusControls />
      </EditorRoot>
    </section>
  );
}

function DraftField() {
  const editor = useEditor();
  const focused = useEditorFocused();
  const [blurCount, setBlurCount] = useState(0);

  return (
    <>
      <EditorContent
        aria-label="draft editor"
        onBlur={() => {
          setBlurCount((count) => count + 1);
          editor.update((tx) => {
            const draft = tx.ranges.get([0]);

            if (draft) tx.text.delete({ at: draft });
          });
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return false;

          event.preventDefault();
          editor.api.dom.blur();
          return { kind: 'none' };
        }}
      />
      <output
        aria-label="Draft focus"
        data-blur-count={blurCount}
        data-focused={focused}
      />
      <input aria-label="Outside field" />
    </>
  );
}

function DraftFixture() {
  const [editor] = useState(() =>
    createEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
      plugins: [BaseParagraphPlugin],
    })
  );

  return (
    <section aria-label="draft">
      <h2>draft</h2>
      <EditorRoot editor={editor}>
        <DraftField />
      </EditorRoot>
    </section>
  );
}

export default function FocusBlurPage() {
  return (
    <StrictMode>
      <main>
        <h1>Explicit editor blur</h1>
        <FocusFixture variant="default" />
        <FocusFixture variant="intrinsic" />
        <FocusFixture variant="custom" />
        <DraftFixture />
      </main>
    </StrictMode>
  );
}

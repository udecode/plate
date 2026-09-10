'use client';

import { BaseParagraphPlugin } from 'platejs';
import {
  BlockPlaceholderPlugin,
  createEditor,
  Plate,
  PlateContent,
  PlateElement,
  type PlateElementProps,
  useEditor,
} from 'platejs/react';
import { StrictMode, useState } from 'react';

function ParagraphElement(
  props: PlateElementProps<typeof BaseParagraphPlugin>
) {
  return <PlateElement {...props} as="section" />;
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
      <Plate editor={editor}>
        <PlateContent aria-label={`${variant} editor`} />
        <FocusControls />
      </Plate>
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
      </main>
    </StrictMode>
  );
}

'use client';

import { schema, TextApi } from 'platejs';
import { definePlugin, EditorPreview, useStaticEditor } from 'platejs/react';
import * as React from 'react';
import { createPortal } from 'react-dom';

const PaintPlugin = definePlugin('clipboardStaticPaint', {
  decorate: {
    read: ({ entry: [node, path] }) =>
      TextApi.isText(node) && path[0] === 0
        ? [
            {
              attributes: { 'data-clipboard-static-paint': true },
              key: 'clipboard-static-paint',
              range: {
                anchor: { offset: 2, path },
                focus: { offset: 4, path },
              },
            },
          ]
        : [],
  },
});

const FigurePlugin = definePlugin('clipboardStaticFigure', {
  component: ({ attributes, children, slots }) => (
    <figure {...attributes}>
      {children}
      <figcaption>{slots.contentRoot('caption')}</figcaption>
    </figure>
  ),
  schema: {
    element: {
      blockContent: true,
      contentRoots: {
        caption: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
      void: 'block',
    },
  },
});

const proofValue = {
  children: [
    { children: [{ text: 'abcdef' }], type: 'paragraph' },
    { children: [{ text: '' }], type: 'paragraph' },
    {
      childRoots: { caption: 'clipboard-static-caption' },
      children: [{ text: '' }],
      type: 'clipboardStaticFigure',
    },
  ],
  roots: {
    'clipboard-static-caption': [
      { children: [{ text: 'Root caption' }], type: 'paragraph' },
    ],
  },
} as const;

const plugins = [PaintPlugin, FigurePlugin] as const;

function FramedPreview() {
  const editor = useStaticEditor({ plugins, initialValue: proofValue });
  const [body, setBody] = React.useState<HTMLElement | null>(null);
  const frameRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    const frame = frameRef.current;

    if (!frame) return undefined;
    const syncBody = () => setBody(frame.contentDocument?.body ?? null);

    syncBody();
    frame.addEventListener('load', syncBody);

    return () => frame.removeEventListener('load', syncBody);
  }, []);

  return (
    <>
      <iframe
        ref={frameRef}
        sandbox="allow-same-origin"
        srcDoc="<!doctype html><html><body></body></html>"
        title="Static clipboard frame"
      />
      {body &&
        createPortal(
          <EditorPreview data-testid="static-preview-frame" editor={editor} />,
          body
        )}
    </>
  );
}

export default function ClipboardStaticProofPage() {
  const first = useStaticEditor({ plugins, initialValue: proofValue });
  const second = useStaticEditor({ plugins, initialValue: proofValue });

  return (
    <main>
      <EditorPreview data-testid="static-preview-first" editor={first} />
      <EditorPreview data-testid="static-preview-second" editor={second} />
      <FramedPreview />
    </main>
  );
}

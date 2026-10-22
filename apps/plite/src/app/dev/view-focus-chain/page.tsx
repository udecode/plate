'use client';

import { defineEditorSchema, ElementApi, schema } from 'plitejs';
import { createEditor, Editable, EditorRoot } from 'plitejs/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const embedSchema = defineEditorSchema('schema:view-focus-chain-embed', {
  elements: { frame: { void: 'block' } },
  id: 'view-focus-chain-embed',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

const createProbeEditor = () => {
  const editor = createEditor({
    initialValue: {
      children: [
        paragraph('page text'),
        { type: 'frame', children: [{ text: '' }] },
      ],
      roots: { note: [paragraph('note text')] },
    },
  });

  editor.install(embedSchema);

  return editor;
};

declare global {
  interface Window {
    viewFocusChain?: {
      clearCaret: () => void;
      dropAt: (x: number, y: number) => string | null | undefined;
      noteBlockCenter: () => { x: number; y: number } | null;
      reachedView: () => string | null;
    };
  }
}

function FrameHost({ children }: { children: ReactNode }) {
  const [body, setBody] = useState<HTMLElement | null>(null);
  const ready = (iframe: HTMLIFrameElement | null) => {
    const document = iframe?.contentDocument;

    if (
      document?.location.href === 'about:srcdoc' &&
      document.readyState === 'complete'
    ) {
      setBody(document.body);
    }
  };

  return (
    <iframe
      onLoad={(event) => ready(event.currentTarget)}
      ref={ready}
      sandbox="allow-same-origin"
      srcDoc="<!DOCTYPE html><body></body>"
      style={{ border: '1px solid #ccc', height: 80, width: 320 }}
      title="Frame host"
    >
      {body && createPortal(children, body)}
    </iframe>
  );
}

function ClosedShadowHost({ children }: { children: ReactNode }) {
  const shadowRoot = useRef<ShadowRoot | null>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);

  return (
    <div
      ref={(host) => {
        if (!host || shadowRoot.current) return;
        shadowRoot.current = host.attachShadow({ mode: 'closed' });
        setRoot(shadowRoot.current);
      }}
    >
      {root && createPortal(children, root)}
    </div>
  );
}

export default function ViewFocusChainPage() {
  const [editor] = useState(createProbeEditor);

  useEffect(() => {
    window.viewFocusChain = {
      clearCaret: () => editor.update((tx) => tx.selection.set(null)),
      dropAt: (x, y) => {
        const block = editor.read.nodes.get([0])?.[0];
        const key = ElementApi.isElement(block) && editor.key(block);
        const target =
          key &&
          editor.api.dom.resolveDropTarget(
            { clientX: x, clientY: y },
            { copy: true, nodes: [key] }
          );

        return target && 'key' in target
          ? editor.api.dom.resolveDOMNode(target.key)?.textContent
          : null;
      },
      noteBlockCenter: () => {
        const box = editor.api.dom
          .editable('note')
          ?.firstElementChild?.getBoundingClientRect();

        return box
          ? { x: box.left + box.width / 2, y: box.top + box.height / 2 }
          : null;
      },
      reachedView: () =>
        editor.api.dom.resolveDOMNode(editor)?.getAttribute('aria-label') ??
        null,
    };

    return () => {
      delete window.viewFocusChain;
    };
  }, [editor]);

  return (
    <main>
      <h1>View focus chain</h1>
      <EditorRoot editor={editor}>
        <Editable
          aria-label="page view"
          renderVoid={() => (
            <FrameHost>
              <EditorRoot editor={editor}>
                <Editable aria-label="frame view" renderVoid={() => <span />} />
              </EditorRoot>
            </FrameHost>
          )}
        />
      </EditorRoot>
      <ClosedShadowHost>
        <EditorRoot editor={editor}>
          <Editable aria-label="note view" root="note" />
        </EditorRoot>
      </ClosedShadowHost>
    </main>
  );
}

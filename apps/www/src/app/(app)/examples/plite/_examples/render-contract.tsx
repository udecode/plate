'use client';

import type { Element as ElementNode } from 'plitejs';
import {
  Editable,
  EditorElement,
  EditorRoot,
  type RenderElementProps,
  useEditor,
} from 'plitejs/react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const LatePortal = ({ children }: { children: React.ReactNode }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      setTarget(hostRef.current);
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div data-late-portal="true" ref={hostRef}>
      {target ? createPortal(children, target) : null}
    </div>
  );
};

const renderElement = ({ children, element }: RenderElementProps) => {
  if (element.type === 'late-portal') {
    return (
      <EditorElement className="rounded border border-dashed p-2">
        <LatePortal>{children}</LatePortal>
      </EditorElement>
    );
  }

  if (element.type === 'shell') {
    return (
      <EditorElement className="rounded border p-2" contentEditable={false}>
        Shell without its children
      </EditorElement>
    );
  }

  return <EditorElement as="p">{children}</EditorElement>;
};

const paragraph = (text: string): ElementNode => ({
  type: 'paragraph',
  children: [{ text }],
});

const RenderContractExample = () => {
  const editor = useEditor({
    initialValue: [paragraph('Intro')],
  });
  const insertAndSelect = (type: 'late-portal' | 'shell', text: string) => {
    const at = [editor.read.children().length];

    editor.update((tx) => {
      tx.nodes.insert({ type, children: [paragraph(text)] }, { at });
      tx.selection.set({ offset: 1, path: [...at, 0, 0] });
    });
  };

  return (
    <EditorRoot editor={editor}>
      <div className="mb-2 flex gap-2">
        <button
          onClick={() => {
            insertAndSelect('late-portal', 'Portaled child');
          }}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          type="button"
        >
          Insert late portal
        </button>
        <button
          onClick={() => {
            insertAndSelect('shell', 'Omitted child');
          }}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          type="button"
        >
          Insert omitted child
        </button>
      </div>
      <Editable
        aria-label="Render contract editor"
        className="rounded border p-3 outline-none"
        renderElement={renderElement}
      />
    </EditorRoot>
  );
};

export default RenderContractExample;

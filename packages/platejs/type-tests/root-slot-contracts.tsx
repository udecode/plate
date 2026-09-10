import { createEditor, definePlatePlugin } from 'platejs/react';
import * as React from 'react';

const RootPlugin = definePlatePlugin('typedRoot', {
  slots: {
    wrapRoot: ({ children, editableRef }) => {
      const viewRef: React.RefObject<HTMLDivElement | null> = editableRef;
      // @ts-expect-error The view ref cannot widen to an untyped slot bag.
      const canvasRef: React.RefObject<HTMLCanvasElement | null> = editableRef;
      void canvasRef;
      void viewRef;
      return <section>{children}</section>;
    },
  },
}).configure({
  slots: {
    wrapRoot: ({ children, editableRef }) => {
      editableRef.current?.focus();
      // @ts-expect-error Configuration retains the HTMLDivElement ref contract.
      editableRef.current?.getContext('2d');
      return children;
    },
  },
});

createEditor({ plugins: [RootPlugin] });

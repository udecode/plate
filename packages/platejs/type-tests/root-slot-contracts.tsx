import {
  createEditor,
  definePlugin,
  type WrapContentProps,
  type WrapRootProps,
} from 'platejs/react';
import * as React from 'react';

const ContentIntegration = ({ children }: WrapContentProps) => children;

const RootIntegration = ({ children, editableRef }: WrapRootProps) => {
  const viewRef: React.RefObject<HTMLDivElement | null> = editableRef;
  // @ts-expect-error The view ref cannot widen to an untyped slot bag.
  const canvasRef: React.RefObject<HTMLCanvasElement | null> = editableRef;
  void canvasRef;
  void viewRef;

  return <section>{children}</section>;
};

const RootPlugin = definePlugin('typedRoot', {
  slots: {
    wrapContent: ContentIntegration,
    wrapRoot: RootIntegration,
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

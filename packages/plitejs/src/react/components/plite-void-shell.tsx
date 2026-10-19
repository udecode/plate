import React, { type ReactNode } from 'react';

import { useEditableDOMHostFact } from '../hooks/use-claim-editable-dom-commit';
import { recordPliteReactRender } from '../render-profiler';
import { EditorElement } from './plite-element';
import { EditorSpacer } from './plite-spacer';

const useApplePlatformAfterHydration = () =>
  useEditableDOMHostFact((runtime) => runtime.isAppleHost, false);

export const VoidShell = ({
  children,
  content,
}: {
  children: ReactNode;
  content: ReactNode;
}) => {
  recordPliteReactRender({ kind: 'void' });

  return (
    <EditorElement draggable isVoid style={{ position: 'relative' }}>
      <div contentEditable={false}>{content}</div>
      <EditorSpacer>{children}</EditorSpacer>
    </EditorElement>
  );
};

export const InlineVoidShell = ({
  children,
  content,
}: {
  children: ReactNode;
  content: ReactNode;
}) => {
  const anchorBeforeContent = useApplePlatformAfterHydration();

  recordPliteReactRender({ kind: 'void' });

  return (
    <EditorElement as="span" contentEditable={false} isInline isVoid>
      {anchorBeforeContent ? children : null}
      <span contentEditable={false}>{content}</span>
      {anchorBeforeContent ? null : children}
    </EditorElement>
  );
};

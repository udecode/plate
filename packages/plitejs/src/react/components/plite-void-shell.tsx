import React, { type ReactNode, useRef } from 'react';

import { isDOMElement } from '../../dom';
import { isTextFieldTarget } from '../editable/input-controller';
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
  const contentRef = useRef<HTMLDivElement>(null);

  recordPliteReactRender({ kind: 'void' });

  return (
    <EditorElement
      draggable
      isVoid
      style={{ position: 'relative' }}
      onPointerDownCapture={(event) => {
        const { target } = event;
        const pressInEditable =
          isDOMElement(target) &&
          contentRef.current?.contains(target) &&
          (isTextFieldTarget(target) ||
            (target as HTMLElement).isContentEditable);

        // Blink starts a long-press drag from the nearest ancestor whose
        // computed -webkit-user-drag is element unless the press lands on
        // editable text, so a press on a blank line end or an empty input in
        // the content would drag the whole void.
        event.currentTarget.style.setProperty(
          '-webkit-user-drag',
          pressInEditable ? 'none' : ''
        );
      }}
    >
      <div ref={contentRef} contentEditable={false}>
        {content}
      </div>
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

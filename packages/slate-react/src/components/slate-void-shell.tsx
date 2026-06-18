import { type ReactNode, useEffect, useState } from 'react';

import { recordSlateReactRender } from '../render-profiler';
import { SlateElement } from './slate-element';
import { SlateSpacer } from './slate-spacer';

const MAC_OS_USER_AGENT_RE = /Mac OS X/;

const isApplePlatform = () =>
  typeof navigator !== 'undefined' &&
  MAC_OS_USER_AGENT_RE.test(navigator.userAgent);

const useApplePlatformAfterHydration = () => {
  const [isApple, setIsApple] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsApple(isApplePlatform());
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return isApple;
};

export const SlateVoidShell = ({
  children,
  content,
}: {
  children: ReactNode;
  content: ReactNode;
}) => {
  recordSlateReactRender({ kind: 'void' });

  return (
    <SlateElement draggable isVoid style={{ position: 'relative' }}>
      <div contentEditable={false}>{content}</div>
      <SlateSpacer>{children}</SlateSpacer>
    </SlateElement>
  );
};

export const SlateInlineVoidShell = ({
  children,
  content,
}: {
  children: ReactNode;
  content: ReactNode;
}) => {
  const anchorBeforeContent = useApplePlatformAfterHydration();

  recordSlateReactRender({ kind: 'void' });

  return (
    <SlateElement as="span" contentEditable={false} isInline isVoid>
      {anchorBeforeContent ? children : null}
      <span contentEditable={false}>{content}</span>
      {anchorBeforeContent ? null : children}
    </SlateElement>
  );
};

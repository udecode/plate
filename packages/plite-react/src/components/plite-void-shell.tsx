import { type ReactNode, useEffect, useState } from 'react';

import { recordPliteReactRender } from '../render-profiler';
import { PliteElement } from './plite-element';
import { PliteSpacer } from './plite-spacer';

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

export const PliteVoidShell = ({
  children,
  content,
}: {
  children: ReactNode;
  content: ReactNode;
}) => {
  recordPliteReactRender({ kind: 'void' });

  return (
    <PliteElement draggable isVoid style={{ position: 'relative' }}>
      <div contentEditable={false}>{content}</div>
      <PliteSpacer>{children}</PliteSpacer>
    </PliteElement>
  );
};

export const PliteInlineVoidShell = ({
  children,
  content,
}: {
  children: ReactNode;
  content: ReactNode;
}) => {
  const anchorBeforeContent = useApplePlatformAfterHydration();

  recordPliteReactRender({ kind: 'void' });

  return (
    <PliteElement as="span" contentEditable={false} isInline isVoid>
      {anchorBeforeContent ? children : null}
      <span contentEditable={false}>{content}</span>
      {anchorBeforeContent ? null : children}
    </PliteElement>
  );
};

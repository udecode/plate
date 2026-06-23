import type { ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import { useCallback, useContext } from 'react';

import {
  ElementContext,
  ElementPathContext,
  NodeRuntimeIdContext,
} from '../context';
import { usePliteNodeRef } from '../hooks/use-plite-node-ref';
import { recordPliteReactRender } from '../render-profiler';
import { getPliteElementShellAttributes } from '../shell-runtime';

type IntrinsicTag = keyof HTMLElementTagNameMap;

type PliteElementComponentProps = HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
};

type PliteElementProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  as?: IntrinsicTag;
  children?: ReactNode;
  isInline?: boolean;
  isVoid?: boolean;
  ref?: Ref<HTMLElement>;
};

const assignRef = (
  ref: Ref<HTMLElement> | undefined,
  node: HTMLElement | null
) => {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }

  if (ref) {
    ref.current = node;
  }
};

/**
 * Render a Plite element DOM shell bound to the current element runtime.
 *
 * Use this primitive when building custom element shells that still need Plite
 * DOM attributes, path/runtime metadata, and node-ref binding.
 */
export const PliteElement = ({
  as = 'div',
  children,
  className,
  id,
  isInline = false,
  isVoid = false,
  ref,
  style,
  ...domProps
}: PliteElementProps) => {
  const Component = as as ElementType<PliteElementComponentProps>;
  const path = useContext(ElementPathContext);
  const pliteNode = useContext(ElementContext);
  const runtimeId = useContext(NodeRuntimeIdContext);
  const boundRef = usePliteNodeRef(runtimeId, { path, pliteNode });

  recordPliteReactRender({ id, kind: 'element', runtimeId });

  const combinedRef = useCallback(
    (node: HTMLElement | null) => {
      boundRef(node);
      assignRef(ref, node);
    },
    [boundRef, ref]
  );

  return (
    <Component
      {...domProps}
      className={className}
      data-plite-path={path ? path.join(',') : undefined}
      data-plite-runtime-id={runtimeId ?? undefined}
      {...getPliteElementShellAttributes({ isInline, isVoid })}
      id={id}
      ref={combinedRef}
      style={style}
    >
      {children}
    </Component>
  );
};

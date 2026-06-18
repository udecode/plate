import type { ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import { useCallback, useContext } from 'react';

import {
  ElementContext,
  ElementPathContext,
  NodeRuntimeIdContext,
} from '../context';
import { useSlateNodeRef } from '../hooks/use-slate-node-ref';
import { recordSlateReactRender } from '../render-profiler';
import { getSlateElementShellAttributes } from '../shell-runtime';

type IntrinsicTag = keyof HTMLElementTagNameMap;

type SlateElementComponentProps = HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
};

type SlateElementProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
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
 * Render a Slate element DOM shell bound to the current element runtime.
 *
 * Use this primitive when building custom element shells that still need Slate
 * DOM attributes, path/runtime metadata, and node-ref binding.
 */
export const SlateElement = ({
  as = 'div',
  children,
  className,
  id,
  isInline = false,
  isVoid = false,
  ref,
  style,
  ...domProps
}: SlateElementProps) => {
  const Component = as as ElementType<SlateElementComponentProps>;
  const path = useContext(ElementPathContext);
  const slateNode = useContext(ElementContext);
  const runtimeId = useContext(NodeRuntimeIdContext);
  const boundRef = useSlateNodeRef(runtimeId, { path, slateNode });

  recordSlateReactRender({ id, kind: 'element', runtimeId });

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
      data-slate-path={path ? path.join(',') : undefined}
      data-slate-runtime-id={runtimeId ?? undefined}
      {...getSlateElementShellAttributes({ isInline, isVoid })}
      id={id}
      ref={combinedRef}
      style={style}
    >
      {children}
    </Component>
  );
};

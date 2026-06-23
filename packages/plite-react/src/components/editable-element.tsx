import type { CSSProperties, ReactNode } from 'react';

import { PliteElement } from './plite-element';

type IntrinsicTag = keyof HTMLElementTagNameMap;

/**
 * Render the default editable element shell around custom element content.
 *
 * The shell binds Plite element metadata, forwards DOM props, and keeps the
 * element positioned for placeholders, decorations, and DOM coverage.
 */
export const EditableElement = ({
  as,
  children,
  className,
  id,
  isInline = false,
  style,
}: {
  as?: IntrinsicTag;
  children: ReactNode;
  className?: string;
  id?: string;
  isInline?: boolean;
  style?: CSSProperties;
}) => (
  <PliteElement
    as={as}
    className={className}
    id={id}
    isInline={isInline}
    style={{ position: 'relative', ...style }}
  >
    {children}
  </PliteElement>
);

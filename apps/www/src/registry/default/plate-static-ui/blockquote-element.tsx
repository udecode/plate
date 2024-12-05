import type { StaticElementProps } from '@udecode/plate-core';

export const BlockquoteStaticElement = ({
  attributes,
  children,
}: StaticElementProps) => {
  return (
    <blockquote className="my-1 border-l-2 pl-6 italic" {...attributes}>
      {children}
    </blockquote>
  );
};

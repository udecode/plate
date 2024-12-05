import type { StaticLeafProps } from '@udecode/plate-core';

export function CodeSyntaxStaticLeaf({ children, ...props }: StaticLeafProps) {
  return <div {...props}>{children}</div>;
}

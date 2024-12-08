import type { StaticLeafProps } from '@udecode/plate-common';

export function CodeSyntaxStaticLeaf({ children, ...props }: StaticLeafProps) {
  return <div {...props}>{children}</div>;
}

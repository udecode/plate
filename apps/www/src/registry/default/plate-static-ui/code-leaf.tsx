import type { StaticLeafProps } from '@udecode/plate-common';

export const CodeStaticLeaf = ({ attributes, children }: StaticLeafProps) => {
  return (
    <span {...attributes}>
      <code className="whitespace-pre-wrap rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm">
        {children}
      </code>
    </span>
  );
};

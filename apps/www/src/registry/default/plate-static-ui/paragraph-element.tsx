import type {
  StaticElementProps,
  StaticLeafProps,
} from '@udecode/plate-common';

export const ParagraphStaticElement = ({
  attributes,
  children,
}: StaticElementProps) => {
  return (
    <div className="m-0 px-0 py-1" {...attributes}>
      {children}
    </div>
  );
};

export function PlateStaticLeaf({ as, attributes, children }: StaticLeafProps) {
  const Leaf = (as ?? 'span') as any;

  return <Leaf {...attributes}>{children}</Leaf>;
}

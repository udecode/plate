import type { StaticElementProps } from '@udecode/plate-common';

export const CodeLineStaticElement = (props: StaticElementProps) => {
  const { children } = props;

  return <div>{children}</div>;
};

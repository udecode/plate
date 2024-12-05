import type { StaticElementProps } from '@udecode/plate-core';

export const CodeLineStaticElement = (props: StaticElementProps) => {
  const { children } = props;

  return <div>{children}</div>;
};

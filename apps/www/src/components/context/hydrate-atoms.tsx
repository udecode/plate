import { useHydrateAtoms } from 'jotai/utils';
import type { ReactNode } from 'react';

export const HydrateAtoms = ({
  children,
  initialValues,
}: {
  children: ReactNode;
  initialValues: any;
}) => {
  // initialising on state with prop on render here
  useHydrateAtoms(initialValues);

  return <>{children}</>;
};

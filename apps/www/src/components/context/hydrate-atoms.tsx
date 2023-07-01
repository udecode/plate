import { ReactNode } from 'react';
import { useHydrateAtoms } from 'jotai/utils';

export const HydrateAtoms = ({
  initialValues,
  children,
}: {
  initialValues: any;
  children: ReactNode;
}) => {
  // initialising on state with prop on render here
  useHydrateAtoms(initialValues);
  return <>{children}</>;
};

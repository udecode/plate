import type { ReactNode } from 'react';

import { useHydrateAtoms } from 'jotai/utils';

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

import React, { FC } from 'react';
import { plateIdAtom, SCOPE_PLATE } from '../../atoms/plateIdAtom';
import { usePlatesStoreEffect } from '../../hooks/plate/usePlatesStoreEffect';
import { usePlatesSelectors } from '../../stores/plate/platesStore';
import { JotaiProvider, Scope } from '../../utils/misc/jotai';
import { withHOC } from '../../utils/react/withHOC';

export const PlateProvider = ({
  id = 'main',
  children,
  scope = SCOPE_PLATE,
}: {
  id?: string;
  children: any;
  scope?: Scope;
}) => {
  const hasId = usePlatesSelectors.has(id);

  usePlatesStoreEffect(id);

  if (!hasId) return null;

  return (
    <JotaiProvider key={id} initialValues={[[plateIdAtom, id]]} scope={scope}>
      {children}
    </JotaiProvider>
  );
};

export const withPlateProvider = <T,>(Component: FC<T>, hocProps?: T) =>
  withHOC<T>(PlateProvider, Component, hocProps);

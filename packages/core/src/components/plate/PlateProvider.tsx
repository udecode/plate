import React, { FC } from 'react';
import { plateIdAtom } from '../../atoms/plateIdAtom';
import { usePlatesStoreEffect } from '../../hooks/plate/usePlatesStoreEffect';
import { usePlatesSelectors } from '../../stores/plate/platesStore';
import { JotaiProvider } from '../../utils/misc/jotai';
import { withHOC } from '../../utils/react/withHOC';

export const PlateProvider = ({
  id = 'main',
  children,
}: {
  id?: string;
  children: any;
}) => {
  const hasId = usePlatesSelectors.has(id);

  usePlatesStoreEffect(id);

  if (!hasId) return null;

  return (
    <JotaiProvider key={id} initialValues={[[plateIdAtom, id]]} scope={id}>
      {children}
    </JotaiProvider>
  );
};

export const withPlateProvider = <T,>(Component: FC<T>, hocProps?: T) =>
  withHOC<T>(PlateProvider, Component, hocProps);

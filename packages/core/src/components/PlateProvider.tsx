import React, { FC } from 'react';
import { Provider } from 'jotai';
import { withHOC } from '../common/hoc/withHOC';
import { usePlatesStoreEffect } from '../hooks/usePlatesStoreEffect';
import { usePlatesSelectors } from '../stores/plate/platesStore';
import { plateIdAtom } from '../stores/plateIdAtom';

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
    <Provider key={id} initialValues={[[plateIdAtom, id]]}>
      {children}
    </Provider>
  );
};

export const withPlateProvider = <T,>(Component: FC<T>, hocProps?: T) =>
  withHOC<T>(PlateProvider, Component, hocProps);

import React, { FC } from 'react';
import { withHOC } from '../common/hoc/withHOC';
import { usePlatesStoreEffect } from '../hooks/usePlatesStoreEffect';
import { usePlatesSelectors } from '../stores/plate/platesStore';

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

  return <React.Fragment key={id}>{children}</React.Fragment>;
};

export const withPlateProvider = <T,>(Component: FC<T>, hocProps?: T) =>
  withHOC<T>(PlateProvider, Component, hocProps);

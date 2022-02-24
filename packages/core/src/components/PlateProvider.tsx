import React, { FC } from 'react';
import { castArray } from 'lodash';
import { withHOC } from '../common/hoc/withHOC';
import { usePlatesStoreEffect } from '../hooks/usePlatesStoreEffect';
import { usePlatesSelectors } from '../stores/plate/platesStore';

export const PlateProvider = ({
  id: _ids = 'main',
  children,
}: {
  id?: string | string[];
  children: any;
}) => {
  const ids = castArray<string>(_ids) ?? ['main'];
  const id = ids[0];

  const hasId = usePlatesSelectors.has(ids);

  usePlatesStoreEffect(_ids);

  if (!hasId) return null;

  return <React.Fragment key={id}>{children}</React.Fragment>;
};

export const withPlateProvider = <T,>(Component: FC<T>) =>
  withHOC<T>(PlateProvider, Component);

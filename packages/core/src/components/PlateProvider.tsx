import React, { FC } from 'react';
import { castArray } from 'lodash';
import { withHOC } from '../common/hoc/withHOC';
import { usePlatesStoreEffect } from '../hooks/usePlatesStoreEffect';
import { usePlatesSelectors } from '../stores/plate/platesStore';
import { usePlateId } from '../stores/plate/selectors/getPlateId';
import { PlateProps } from './Plate';

export const PlateProvider = ({
  id: _ids,
  children,
  ...props
}: {
  id?: string | string[];
  children: any;
} & PlateProps) => {
  const ids = castArray<string>(_ids);
  const id = usePlateId(ids[0]);
  if (ids[0] === undefined) {
    ids[0] = id;
  }

  const hasId = usePlatesSelectors.has(ids);
  usePlatesStoreEffect(_ids, props);

  if (!hasId) return null;

  return <React.Fragment key={id}>{children}</React.Fragment>;
};

export const withPlateProvider = <T,>(Component: FC<T>) =>
  withHOC<T>(PlateProvider, Component);

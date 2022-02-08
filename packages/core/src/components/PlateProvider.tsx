import React, { FC } from 'react';
import { castArray } from 'lodash';
import { withHOC } from '../common/hoc/withHOC';
import { useCreatePlateStore } from '../hooks/useCreatePlateStore';
import { usePlatesSelectors } from '../stores/plate/platesStore';
import { usePlateId } from '../stores/plate/selectors/getPlateId';

export const PlateProvider = ({
  id: _ids,
  children,
}: {
  id?: string | string[];
  children: any;
}) => {
  const ids = castArray<string>(_ids);
  const id = usePlateId(ids[0]);
  if (ids[0] === undefined) {
    ids[0] = id;
  }

  const hasId = usePlatesSelectors.has(ids);
  useCreatePlateStore(_ids);

  if (!hasId) return null;

  return <React.Fragment key={id}>{children}</React.Fragment>;
};

export const withPlateProvider = <T,>(Component: FC<T>) =>
  withHOC<T>(PlateProvider, Component);

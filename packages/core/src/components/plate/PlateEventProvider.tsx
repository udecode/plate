import React, { FC } from 'react';
import { useEventPlateId } from '../../stores/event-editor/selectors/useEventPlateId';
import { withHOC } from '../../utils/react/withHOC';
import { PlateProvider } from './PlateProvider';

export const PlateEventProvider = ({
  id,
  children,
}: {
  id?: string;
  children: any;
}) => {
  id = useEventPlateId(id);

  return <PlateProvider id={id}>{children}</PlateProvider>;
};

export const withPlateEventProvider = <T,>(Component: FC<T>, hocProps?: T) =>
  withHOC<T>(PlateEventProvider, Component, hocProps);

import React, { FC } from 'react';
import { useEventPlateId } from '../../stores/event-editor/selectors/useEventPlateId';
import { Scope } from '../../utils/misc/jotai';
import { withHOC } from '../../utils/react/withHOC';
import { PlateProvider } from './PlateProvider';

export const PlateEventProvider = ({
  id,
  children,
  scope,
}: {
  id?: string;
  children: any;
  scope?: Scope;
}) => {
  id = useEventPlateId(id, scope);

  return (
    <PlateProvider id={id} scope={scope}>
      {children}
    </PlateProvider>
  );
};

export const withPlateEventProvider = <T,>(Component: FC<T>, hocProps?: T) =>
  withHOC<T>(PlateEventProvider, Component, hocProps);

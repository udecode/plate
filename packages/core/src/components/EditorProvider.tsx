import React, { FC } from 'react';
import { withHOC } from '../common/hoc/withHOC';
import { usePlateId } from '../stores/plate/selectors/getPlateId';

export const EditorProvider = ({
  id,
  children,
}: {
  id?: string;
  children: any;
}) => {
  id = usePlateId(id);

  return <React.Fragment key={id}>{children}</React.Fragment>;
};

export const withEditor = <T,>(Component: FC<T>) =>
  withHOC<T>(EditorProvider, Component);

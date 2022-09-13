import React, { ReactNode } from 'react';
import { Slate } from 'slate-react';
import { useSlateProps } from '../../hooks/index';
import { PlateId } from '../../stores/index';

export const PlateSlate = ({
  id,
  children,
}: {
  id?: PlateId;
  children: ReactNode;
}) => {
  const slateProps = useSlateProps({ id });

  return <Slate {...(slateProps as any)}>{children}</Slate>;
};

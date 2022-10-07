import React, { ReactNode } from 'react';
import { Slate } from 'slate-react';
import { useSlateProps } from '../../hooks/index';
import { PlateId, usePlateSelectors } from '../../stores/index';

export const PlateSlate = ({
  id,
  children,
}: {
  id?: PlateId;
  children: ReactNode;
}) => {
  const slateProps = useSlateProps({ id });

  const { plugins } = usePlateSelectors(id).editor();

  let aboveSlate: JSX.Element | null = (
    <Slate {...(slateProps as any)}>{children}</Slate>
  );

  plugins?.forEach((plugin) => {
    const { renderAboveSlate } = plugin;

    if (renderAboveSlate)
      aboveSlate = renderAboveSlate({
        children: aboveSlate,
      });
  });

  return aboveSlate;
};

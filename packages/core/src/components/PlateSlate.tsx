import React, { ReactNode } from 'react';
import { Slate } from 'slate-react';

import { useSlateProps } from '../hooks';
import { PlateId, usePlateSelectors } from '../stores';

export function PlateSlate({
  id,
  children,
}: {
  id?: PlateId;
  children: ReactNode;
}) {
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
      }) as any;
  });

  return aboveSlate;
}

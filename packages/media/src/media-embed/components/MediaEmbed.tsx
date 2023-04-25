import React from 'react';
import { HTMLPropsAs } from '@udecode/plate-common';
import { useMediaStore } from '../../media/mediaStore';

export const MediaEmbed = (props: HTMLPropsAs<'iframe'>) => {
  const { component: Component, ...embedData } = useMediaStore().get.urlData();

  if (!Component) return null;

  return <Component {...embedData} {...props} />;
};

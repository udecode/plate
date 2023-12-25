import React from 'react';
import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  useMediaToolbarButton,
} from '@udecode/plate-media';

import { extendProps } from '@/lib/utils';
import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

export const MediaToolbarButton = extendProps(ToolbarButton)<{
  nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
}>(({ nodeType, ...rest }, ref) => {
  const { props } = useMediaToolbarButton({ nodeType });

  return (
    <ToolbarButton ref={ref} {...props} {...rest}>
      <Icons.image />
    </ToolbarButton>
  );
});

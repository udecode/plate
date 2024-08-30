import React from 'react';
import { withRef } from '@udecode/cn';
import { useMediaToolbarButton } from '@udecode/plate-media/react';

import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

import type { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: typeof ImagePlugin.key | typeof MediaEmbedPlugin.key;
  }
>(({ nodeType, ...rest }, ref) => {
  const { props } = useMediaToolbarButton({ nodeType });

  return (
    <ToolbarButton ref={ref} {...props} {...rest}>
      <Icons.image />
    </ToolbarButton>
  );
});

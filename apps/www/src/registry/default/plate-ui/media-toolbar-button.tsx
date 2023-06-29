import React from 'react';
import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  useMediaToolbarButton,
} from '@udecode/plate-media';
import { ToolbarButton } from './toolbar';

import { Icons } from '@/components/icons';

export function MediaToolbarButton({
  nodeType,
}: {
  nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
}) {
  const { props } = useMediaToolbarButton({ nodeType });

  return (
    <ToolbarButton {...props}>
      <Icons.image />
    </ToolbarButton>
  );
}

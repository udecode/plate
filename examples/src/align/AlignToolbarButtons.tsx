import React from 'react';
import { AlignToolbarButton } from '@udecode/plate';
import { Icons } from '../common/icons';

const tooltip = (content: string) => ({
  content,
});

export function AlignToolbarButtons() {
  return (
    <>
      <AlignToolbarButton
        tooltip={tooltip('Align Left')}
        value="left"
        icon={<Icons.alignLeft />}
      />
      <AlignToolbarButton
        tooltip={tooltip('Align Center')}
        value="center"
        icon={<Icons.alignCenter />}
      />
      <AlignToolbarButton
        tooltip={tooltip('Align Right')}
        value="right"
        icon={<Icons.alignRight />}
      />
      <AlignToolbarButton
        tooltip={tooltip('Align Justify')}
        value="justify"
        icon={<Icons.alignJustify />}
      />
    </>
  );
}

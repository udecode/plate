import React from 'react';
import { FormatAlignCenter } from '@styled-icons/material/FormatAlignCenter';
import { FormatAlignJustify } from '@styled-icons/material/FormatAlignJustify';
import { FormatAlignLeft } from '@styled-icons/material/FormatAlignLeft';
import { FormatAlignRight } from '@styled-icons/material/FormatAlignRight';
import { AlignToolbarButton } from '@udecode/plate';

const tooltip = (content: string) => ({
  content,
});

export const AlignToolbarButtons = () => {
  return (
    <>
      <AlignToolbarButton
        tooltip={tooltip('Align Left')}
        value="left"
        icon={<FormatAlignLeft />}
      />
      <AlignToolbarButton
        tooltip={tooltip('Align Center')}
        value="center"
        icon={<FormatAlignCenter />}
      />
      <AlignToolbarButton
        tooltip={tooltip('Align Right')}
        value="right"
        icon={<FormatAlignRight />}
      />
      <AlignToolbarButton
        tooltip={tooltip('Align Justify')}
        value="justify"
        icon={<FormatAlignJustify />}
      />
    </>
  );
};

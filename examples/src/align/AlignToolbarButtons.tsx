import React from 'react';
import { FormatAlignCenter } from '@styled-icons/material/FormatAlignCenter';
import { FormatAlignJustify } from '@styled-icons/material/FormatAlignJustify';
import { FormatAlignLeft } from '@styled-icons/material/FormatAlignLeft';
import { FormatAlignRight } from '@styled-icons/material/FormatAlignRight';
import { AlignToolbarButton } from '@udecode/plate';

export const AlignToolbarButtons = () => {
  return (
    <>
      <AlignToolbarButton
        tooltip={{ content: 'Align left' }}
        value="left"
        icon={<FormatAlignLeft />}
      />
      <AlignToolbarButton
        tooltip={{ content: 'Align Center' }}
        value="center"
        icon={<FormatAlignCenter />}
      />
      <AlignToolbarButton
        tooltip={{ content: 'Align Right' }}
        value="right"
        icon={<FormatAlignRight />}
      />
      <AlignToolbarButton
        tooltip={{ content: 'Align Justify' }}
        value="justify"
        icon={<FormatAlignJustify />}
      />
    </>
  );
};

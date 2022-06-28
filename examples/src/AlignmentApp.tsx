import React from 'react';
import { FormatAlignCenter } from '@styled-icons/material/FormatAlignCenter';
import { FormatAlignJustify } from '@styled-icons/material/FormatAlignJustify';
import { FormatAlignLeft } from '@styled-icons/material/FormatAlignLeft';
import { FormatAlignRight } from '@styled-icons/material/FormatAlignRight';
import {
  AlignToolbarButton,
  createAlignPlugin,
  createPlateUI,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_PARAGRAPH,
  HeadingToolbar,
  Plate,
  withPlateEventProvider,
} from '@udecode/plate';
import { alignValue } from './align/alignValue';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const AlignToolbarButtons = withPlateEventProvider(() => (
  <>
    <AlignToolbarButton value="left" icon={<FormatAlignLeft />} />
    <AlignToolbarButton value="center" icon={<FormatAlignCenter />} />
    <AlignToolbarButton value="right" icon={<FormatAlignRight />} />
    <AlignToolbarButton value="justify" icon={<FormatAlignJustify />} />
  </>
));

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createAlignPlugin({
      inject: {
        props: {
          validTypes: [
            ELEMENT_PARAGRAPH,
            ELEMENT_H1,
            ELEMENT_H2,
            ELEMENT_H3,
            ELEMENT_H4,
            ELEMENT_H5,
            ELEMENT_H6,
          ],
        },
      },
    }),
  ],
  {
    components: createPlateUI(),
  }
);

export default () => (
  <>
    <HeadingToolbar>
      <AlignToolbarButtons />
    </HeadingToolbar>
    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={alignValue}
      plugins={plugins}
    />
  </>
);

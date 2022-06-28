import React from 'react';
import { LineWeight } from '@styled-icons/material/LineWeight';
import { createPlateUI, HeadingToolbar, Plate } from '@udecode/plate';
import { createLineHeightPlugin } from '@udecode/plate-line-height/src/index';
import { LineHeightToolbarDropdown } from '@udecode/plate-ui-line-height/src/index';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { lineHeightPlugin } from './line-height/lineHeightPlugin';
import { lineHeightValue } from './line-height/lineHeightValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createLineHeightPlugin(lineHeightPlugin)],
  {
    components: createPlateUI(),
  }
);

export default () => (
  <>
    <HeadingToolbar>
      <LineHeightToolbarDropdown icon={<LineWeight />} />
    </HeadingToolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={lineHeightValue}
    />
  </>
);

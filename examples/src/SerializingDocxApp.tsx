import React from 'react';
import {
  createImagePlugin,
  createPlateUI,
  createTablePlugin,
  Plate,
} from '@udecode/plate';
import { createAlignPlugin } from '@udecode/plate-alignment/src/index';
import {
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontFamilyPlugin,
  createFontSizePlugin,
  createFontWeightPlugin,
} from '@udecode/plate-font/src/index';
import { createHorizontalRulePlugin } from '@udecode/plate-horizontal-rule/src/index';
import {
  createIndentPlugin,
  createTextIndentPlugin,
} from '@udecode/plate-indent/src/index';
import { createIndentListPlugin } from '@udecode/plate-indent-list/src/index';
import { createJuicePlugin } from '@udecode/plate-juice';
import { createLineHeightPlugin } from '@udecode/plate-line-height/src/index';
import { createDeserializeDocxPlugin } from '@udecode/plate-serializer-docx/src/index';
import { alignPlugin } from './align/alignPlugin';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { indentPlugin } from './indent/indentPlugin';
import { lineHeightPlugin } from './line-height/lineHeightPlugin';
import { deserializeDocxValue } from './serializing-docx/deserializeDocxValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createImagePlugin(),
    createHorizontalRulePlugin(),
    createLineHeightPlugin(lineHeightPlugin),
    // createLinkPlugin(),
    createTablePlugin(),
    createAlignPlugin(alignPlugin),
    createFontBackgroundColorPlugin(),
    createFontFamilyPlugin(),
    createFontColorPlugin(),
    createFontSizePlugin(),
    createFontWeightPlugin(),
    createIndentListPlugin(),
    createIndentPlugin(indentPlugin),
    createTextIndentPlugin(),
    createDeserializeDocxPlugin(),
    createJuicePlugin(),
  ],
  {
    components: createPlateUI(),
  }
);

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={deserializeDocxValue}
  />
);

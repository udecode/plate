import React from 'react';
import {
  createAlignPlugin,
  createDeserializeDocxPlugin,
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontFamilyPlugin,
  createFontSizePlugin,
  createFontWeightPlugin,
  createHorizontalRulePlugin,
  createImagePlugin,
  createIndentListPlugin,
  createIndentPlugin,
  createLineHeightPlugin,
  createTablePlugin,
  createTextIndentPlugin,
  Plate,
} from '@udecode/plate';
import { createJuicePlugin } from '@udecode/plate-juice';

import { alignPlugin } from '@/plate/align/alignPlugin';
import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { indentPlugin } from '@/plate/indent/indentPlugin';
import { lineHeightPlugin } from '@/plate/line-height/lineHeightPlugin';
import { deserializeDocxValue } from '@/plate/serializing-docx/deserializeDocxValue';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

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
    components: plateUI,
  }
);

export default function SerializingDocxApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={deserializeDocxValue}
    />
  );
}

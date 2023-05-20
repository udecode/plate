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
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { alignPlugin } from './align/alignPlugin';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { indentPlugin } from './indent/indentPlugin';
import { lineHeightPlugin } from './line-height/lineHeightPlugin';
import { deserializeDocxValue } from './serializing-docx/deserializeDocxValue';

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

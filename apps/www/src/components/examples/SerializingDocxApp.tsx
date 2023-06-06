import React from 'react';
import { createAlignPlugin } from '@udecode/plate-alignment';
import { Plate } from '@udecode/plate-common';
import {
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontFamilyPlugin,
  createFontSizePlugin,
  createFontWeightPlugin,
} from '@udecode/plate-font';
import { createHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import {
  createIndentPlugin,
  createTextIndentPlugin,
} from '@udecode/plate-indent';
import { createIndentListPlugin } from '@udecode/plate-indent-list';
import { createJuicePlugin } from '@udecode/plate-juice';
import { createLineHeightPlugin } from '@udecode/plate-line-height';
import { createImagePlugin } from '@udecode/plate-media';
import { createDeserializeDocxPlugin } from '@udecode/plate-serializer-docx';
import { createTablePlugin } from '@udecode/plate-table';

import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { alignPlugin } from '@/plate/demo/plugins/alignPlugin';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { indentPlugin } from '@/plate/demo/plugins/indentPlugin';
import { lineHeightPlugin } from '@/plate/demo/plugins/lineHeightPlugin';
import { deserializeDocxValue } from '@/plate/demo/values/deserializeDocxValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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

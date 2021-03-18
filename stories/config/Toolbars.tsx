import React from 'react';
import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
import {
  FormatQuote,
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
} from '@styled-icons/material';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  useEditorPluginType,
} from '@udecode/slate-plugins';
import {
  HeadingToolbar,
  ToolbarCodeBlock,
  ToolbarElement,
} from '@udecode/slate-plugins-components';

export const ToolbarBasicElements = () => (
  <HeadingToolbar>
    <ToolbarElement
      type={useEditorPluginType(ELEMENT_H1)}
      icon={<LooksOne />}
    />
    <ToolbarElement
      type={useEditorPluginType(ELEMENT_H2)}
      icon={<LooksTwo />}
    />
    <ToolbarElement type={useEditorPluginType(ELEMENT_H3)} icon={<Looks3 />} />
    <ToolbarElement type={useEditorPluginType(ELEMENT_H4)} icon={<Looks4 />} />
    <ToolbarElement type={useEditorPluginType(ELEMENT_H5)} icon={<Looks5 />} />
    <ToolbarElement type={useEditorPluginType(ELEMENT_H6)} icon={<Looks6 />} />
    <ToolbarElement
      type={useEditorPluginType(ELEMENT_BLOCKQUOTE)}
      icon={<FormatQuote />}
    />
    <ToolbarCodeBlock
      type={useEditorPluginType(ELEMENT_CODE_BLOCK)}
      icon={<CodeBlock />}
    />
  </HeadingToolbar>
);

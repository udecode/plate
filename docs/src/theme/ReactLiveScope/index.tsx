/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { FormatQuote } from '@styled-icons/material/FormatQuote';
import { Looks3 } from '@styled-icons/material/Looks3';
import { Looks4 } from '@styled-icons/material/Looks4';
import { Looks5 } from '@styled-icons/material/Looks5';
import { Looks6 } from '@styled-icons/material/Looks6';
import { LooksOne } from '@styled-icons/material/LooksOne';
import { LooksTwo } from '@styled-icons/material/LooksTwo';
import {
  CodeBlockElement,
  createBasicElementPlugins,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createHeadingPlugin,
  createHistoryPlugin,
  createImagePlugin,
  createItalicPlugin,
  createParagraphPlugin,
  createReactPlugin,
  createSelectOnBackspacePlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  createStrikethroughPlugin,
  createUnderlinePlugin,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_IMAGE,
  ELEMENT_LI,
  ELEMENT_LINK,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TODO_LI,
  ELEMENT_TR,
  ELEMENT_UL,
  getSlatePluginType,
  HeadingToolbar,
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_KBD,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  SlatePlugins,
  ToolbarElement,
  useFocusedEditorState,
  withProps,
} from '@udecode/slate-plugins';
import {
  initialValueBasicElements,
  initialValueBasicMarks,
  initialValueImages,
  initialValuePlainText,
} from '../../../../stories/config/initialValues';

const editableProps = {
  placeholder: 'Type…',
  style: {
    padding: '15px',
  },
};

const components = createSlatePluginsComponents({
  code_block: withProps(CodeBlockElement, {
    styles: {
      root: {
        backgroundColor: '#111827',
        selectors: {
          code: {
            color: 'white',
          },
        },
      },
    },
  }),
});
const options = createSlatePluginsOptions();

const pluginsCore = [createReactPlugin(), createHistoryPlugin()];

const pluginsBasicElements = [
  createParagraphPlugin(), // paragraph element
  createBlockquotePlugin(), // blockquote element
  createCodeBlockPlugin(), // code block element
  createHeadingPlugin(), // heading elements
];

const pluginsBasicMarks = [
  createBoldPlugin(), // bold mark
  createItalicPlugin(), // italic mark
  createUnderlinePlugin(), // underline mark
  createStrikethroughPlugin(), // strikethrough mark
  createCodePlugin(), // code mark
];

const pluginsBasic = [
  ...pluginsCore,
  ...pluginsBasicElements,
  ...pluginsBasicMarks,
];

export const pluginsImage = [
  ...pluginsCore,
  ...createBasicElementPlugins(),
  createImagePlugin(),
  createSelectOnBackspacePlugin({ allow: [options[ELEMENT_IMAGE].type] }),
];

const initialValueBasic = [
  ...initialValueBasicElements,
  ...initialValueBasicMarks,
];

const ToolbarButtonsBasicElements = () => {
  const editor = useFocusedEditorState();
  console.log(editor);

  return (
    <>
      <ToolbarElement
        type={editor && getSlatePluginType(editor, ELEMENT_H1)}
        icon={<LooksOne />}
      />
      <ToolbarElement
        type={editor && getSlatePluginType(editor, ELEMENT_H2)}
        icon={<LooksTwo />}
      />
      <ToolbarElement
        type={editor && getSlatePluginType(editor, ELEMENT_H3)}
        icon={<Looks3 />}
      />
      <ToolbarElement
        type={editor && getSlatePluginType(editor, ELEMENT_H4)}
        icon={<Looks4 />}
      />
      <ToolbarElement
        type={editor && getSlatePluginType(editor, ELEMENT_H5)}
        icon={<Looks5 />}
      />
      <ToolbarElement
        type={editor && getSlatePluginType(editor, ELEMENT_H6)}
        icon={<Looks6 />}
      />
      <ToolbarElement
        type={editor && getSlatePluginType(editor, ELEMENT_BLOCKQUOTE)}
        icon={<FormatQuote />}
      />
      {/* <ToolbarCodeBlock */}
      {/*  type={useSlatePluginType(ELEMENT_CODE_BLOCK)} */}
      {/*  icon={<CodeBlock />} */}
      {/* /> */}
    </>
  );
};

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_LI,
  ELEMENT_LINK,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TODO_LI,
  ELEMENT_TR,
  ELEMENT_UL,
  ToolbarButtonsBasicElements,
  HeadingToolbar,
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_KBD,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  SlatePlugins,
  components,
  corePlugins: pluginsCore,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createHeadingPlugin,
  createHistoryPlugin,
  createItalicPlugin,
  createParagraphPlugin,
  createReactPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
  editableProps,
  initialValueBasic,
  initialValueImages,
  initialValuePlainText,
  options,
  pluginsCore,
  pluginsBasic,
  pluginsImage,
};

export default ReactLiveScope;

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createHeadingPlugin,
  createHistoryPlugin,
  createItalicPlugin,
  createParagraphPlugin,
  createReactPlugin,
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
} from '@udecode/slate-plugins';
import {
  initialValueBasicElements,
  initialValueBasicMarks,
  initialValuePlainText,
} from '../../../../stories/config/initialValues';

const editableProps = {
  placeholder: 'Type…',
  style: {
    padding: '15px',
  },
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();

const pluginsBasic = [
  // elements
  createReactPlugin(), // withReact
  createHistoryPlugin(), // withHistory
  createParagraphPlugin(), // paragraph element
  createBlockquotePlugin(), // blockquote element
  createCodeBlockPlugin(), // code block element
  createHeadingPlugin(), // heading elements

  // marks
  createBoldPlugin(), // bold mark
  createItalicPlugin(), // italic mark
  createUnderlinePlugin(), // underline mark
  createStrikethroughPlugin(), // strikethrough mark
  createCodePlugin(), // code mark
];

const initialValueBasic = [
  ...initialValueBasicElements,
  ...initialValueBasicMarks,
];

const A = () => {
  const [debugValue, setDebugValue] = useState(null);

  return (
    <SlatePlugins
      id="3"
      editableProps={editableProps}
      initialValue={initialValuePlainText}
      onChange={(value) => {
        setDebugValue(debugValue);
      }}
    >
      {debugValue}
    </SlatePlugins>
  );
};

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  SlatePlugins,
  editableProps,
  initialValuePlainText,
  initialValueBasic,
  createReactPlugin,
  createHistoryPlugin,
  createParagraphPlugin,
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createHeadingPlugin,
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
  createStrikethroughPlugin,
  createCodePlugin,
  pluginsBasic,
  components,
  options,
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
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_KBD,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
};

export default ReactLiveScope;

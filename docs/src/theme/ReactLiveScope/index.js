/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createHeadingPlugin,
  createHistoryPlugin,
  createParagraphPlugin,
  createReactPlugin,
  SlatePlugins,
} from '@udecode/slate-plugins';
import {
  initialValueBasicElements,
  initialValuePlainText,
} from '../../../../stories/config/initialValues';

const editableProps = {
  placeholder: 'Type…',
  style: {
    padding: '15px',
  },
};

const pluginsBasicElements = [
  createReactPlugin(), // withReact
  createHistoryPlugin(), // withHistory
  createParagraphPlugin(), // paragraph element
  createBlockquotePlugin(), // blockquote element
  createCodeBlockPlugin(), // code block element
  createHeadingPlugin(), // heading elements
];

const a = () => {
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
  initialValueBasicElements,
  pluginsBasicElements,
};

export default ReactLiveScope;

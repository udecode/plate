import 'prismjs/themes/prism.css';
import React from 'react';
import {
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createExitBreakPlugin,
  createHeadingPlugin,
  createHistoryPlugin,
  createParagraphPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  createSoftBreakPlugin,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_PARAGRAPH,
  getPlaceholderElement,
  HeadingToolbar,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueBasicElements } from '../config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { ToolbarButtonsBasicElements } from '../config/Toolbars';

const id = 'Elements/Block Placeholder';

export default {
  title: id,
};

const components = createSlatePluginsComponents();

const placeholders = {
  [ELEMENT_PARAGRAPH]: {
    label: "Type '/' to open weapons",
    styles: {
      placeholder: {},
    },
    hideOnBlur: true,
  },
  [ELEMENT_H1]: {
    label: 'Heading 1',
    styles: {
      placeholder: {
        fontSize: '30px',
      },
    },
    hideOnBlur: false,
  },
};
Object.keys(components).forEach((key) => {
  if (Object.keys(placeholders).includes(key)) {
    components[key] = getPlaceholderElement({
      component: components[key],
      placeholder: placeholders[key].label,
      styles: placeholders[key].styles,
      hideOnBlur: placeholders[key].hideOnBlur,
    });
  }
});
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  createParagraphPlugin(),
  createBlockquotePlugin(),
  createCodeBlockPlugin(),
  createHeadingPlugin(),
  createResetNodePlugin(optionsResetBlockTypePlugin),
  createSoftBreakPlugin(optionsSoftBreakPlugin),
  createExitBreakPlugin(optionsExitBreakPlugin),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueBasicElements}
  >
    <HeadingToolbar>
      <ToolbarButtonsBasicElements />
    </HeadingToolbar>
  </SlatePlugins>
);

import React, { useState } from 'react';
import {
  Code,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatUnderlined,
  LooksOne,
  LooksTwo,
} from '@material-ui/icons';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  BlockButton,
  BoldPlugin,
  EditablePlugins,
  FormatPlugin,
  InlineCodePlugin,
  ItalicPlugin,
  MarkButton,
  onDOMBeforeInputFormat,
  onKeyDownFormat,
  renderElementFormat,
  renderLeafFormat,
  UnderlinePlugin,
  useCreateEditor,
} from 'slate-plugins';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
import { Slate, withReact } from 'slate-react';
import { initialValueRichText } from '../config/initialValues';

export default {
  title: 'Plugins|FormatPlugin',
};

export const RichText = () => {
  const plugins = [];
  const renderElement = [];
  const renderLeaf = [];
  const onKeyDown = [];
  const onDOMBeforeInput = [];
  if (boolean('BoldPlugin', true, 'plugins')) plugins.push(BoldPlugin());
  if (boolean('InlineCodePlugin', true, 'plugins'))
    plugins.push(InlineCodePlugin());
  if (boolean('ItalicPlugin', true, 'plugins')) plugins.push(ItalicPlugin());
  if (boolean('UnderlinePlugin', true, 'plugins'))
    plugins.push(UnderlinePlugin());
  else {
    if (boolean('renderElementFormat', false, 'renderElement'))
      renderElement.push(renderElementFormat);
    if (boolean('renderLeafFormat', false, 'renderLeaf'))
      renderLeaf.push(renderLeafFormat);
    if (boolean('onKeyDownFormat', false, 'onKeyDown'))
      onKeyDown.push(onKeyDownFormat);
    if (boolean('onDOMBeforeInputFormat', false, 'onDOMBeforeInput'))
      onDOMBeforeInput.push(onDOMBeforeInputFormat);
  }

  const [value, setValue] = useState(initialValueRichText);

  const editor = useCreateEditor([withReact, withHistory], plugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <StyledToolbar height={18}>
        <MarkButton format="bold" icon={<FormatBold />} />
        <MarkButton format="italic" icon={<FormatItalic />} />
        <MarkButton format="underline" icon={<FormatUnderlined />} />
        <MarkButton format="code" icon={<Code />} />
        <BlockButton format="heading-one" icon={<LooksOne />} />
        <BlockButton format="heading-two" icon={<LooksTwo />} />
        <BlockButton format="block-quote" icon={<FormatQuote />} />
        <BlockButton format="numbered-list" icon={<FormatListNumbered />} />
        <BlockButton format="bulleted-list" icon={<FormatListBulleted />} />
      </StyledToolbar>
      <EditablePlugins
        plugins={plugins}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={onKeyDown}
        onDOMBeforeInput={onDOMBeforeInput}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
      />
    </Slate>
  );
};

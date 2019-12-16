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
  CheckListPlugin,
  EditablePlugins,
  ForcedLayoutPlugin,
  FormatPlugin,
  HoveringToolbar,
  ImagePlugin,
  InsertImageButton,
  LinkButton,
  LinkPlugin,
  MarkButton,
  MarkdownPreviewPlugin,
  MarkdownShortcutsPlugin,
  MentionPlugin,
  PasteHtmlPlugin,
  StyledToolbar,
  TablePlugin,
  useCreateEditor,
  VideoPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import {
  initialValueCheckLists,
  initialValueEmbeds,
  initialValueImages,
  initialValueMentions,
  initialValueRichText,
} from './stories/config/initialValues';

export default {
  title: 'Plugins|Playground',
};

export const AllPlugins = () => {
  const plugins = [];
  const renderElement: any = [];
  const renderLeaf: any = [];
  const onKeyDown: any = [];
  const onDOMBeforeInput: any = [];
  if (boolean('CheckListPlugin', true, 'plugins'))
    plugins.push(CheckListPlugin());
  if (boolean('VideoPlugin', true, 'plugins')) plugins.push(VideoPlugin());
  if (boolean('FormatPlugin', true, 'plugins')) plugins.push(FormatPlugin());
  if (boolean('MentionPlugin', true, 'plugins')) plugins.push(MentionPlugin());
  if (boolean('ForcedLayoutPlugin', true, 'plugins'))
    plugins.push(ForcedLayoutPlugin());
  if (boolean('ImagePlugin', true, 'plugins')) plugins.push(ImagePlugin());
  if (boolean('LinkPlugin', true, 'plugins')) plugins.push(LinkPlugin());
  if (boolean('MarkdownPreviewPlugin', true, 'plugins'))
    plugins.push(MarkdownPreviewPlugin());
  if (boolean('MarkdownShortcutsPlugin', true, 'plugins'))
    plugins.push(MarkdownShortcutsPlugin());
  if (boolean('PasteHtmlPlugin', true, 'plugins'))
    plugins.push(PasteHtmlPlugin());
  if (boolean('TablePlugin', true, 'plugins')) plugins.push(TablePlugin());

  // if (boolean('renderElementFormat', false, 'renderElement'))
  //   renderElement.push(renderElementFormat);
  // if (boolean('renderLeafFormat', false, 'renderLeaf'))
  //   renderLeaf.push(renderLeafFormat);
  // if (boolean('onKeyDownFormat', false, 'onKeyDown'))
  //   onKeyDown.push(onKeyDownFormat);
  // if (boolean('onDOMBeforeInputFormat', false, 'onDOMBeforeInput'))
  //   onDOMBeforeInput.push(onDOMBeforeInputFormat);

  const [value, setValue] = useState([
    ...initialValueRichText,
    ...initialValueCheckLists,
    ...initialValueEmbeds,
    ...initialValueMentions,
    ...initialValueImages,
  ]);

  const editor = useCreateEditor([withReact, withHistory]);

  return (
    <>
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
          <InsertImageButton />
          <LinkButton />
        </StyledToolbar>
        <HoveringToolbar />
        <EditablePlugins
          plugins={plugins}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          onDOMBeforeInput={onDOMBeforeInput}
          placeholder="Enter some plain text..."
        />
      </Slate>
    </>
  );
};

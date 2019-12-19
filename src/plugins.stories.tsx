import React, { useMemo, useState } from 'react';
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
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  BlockButton,
  BlockquotePlugin,
  BoldPlugin,
  CheckListPlugin,
  decorateSearchHighlight,
  EditablePlugins,
  HeadingPlugin,
  HoveringToolbar,
  ImagePlugin,
  InlineCodePlugin,
  InsertImageButton,
  ItalicPlugin,
  LinkButton,
  LinkPlugin,
  ListButton,
  ListPlugin,
  MarkButton,
  MarkdownPreviewPlugin,
  MentionPlugin,
  onChangeMention,
  onKeyDownMention,
  StyledToolbar,
  TablePlugin,
  ToolbarSearchHighlight,
  UnderlinePlugin,
  useMention,
  VideoPlugin,
  withChecklist,
  withImage,
  withLink,
  withList,
  withMention,
  withPasteHtml,
  withTable,
  withVideo,
} from 'slate-plugins';
import { BlockPlugin } from 'slate-plugins/elements/BlockPlugin';
import { SearchHighlightPlugin } from 'slate-plugins/search-highlight/SearchHighlightPlugin';
import { Slate, SlatePlugin, withReact } from 'slate-react';
import { CHARACTERS } from 'stories/config/data';
import {
  initialValueCheckLists,
  initialValueEmbeds,
  initialValueImages,
  initialValueMentions,
  initialValueRichText,
} from './stories/config/initialValues';

export default {
  title: 'Plugins/Playground',
};

const initialValue = [
  ...initialValueRichText,
  ...initialValueCheckLists,
  ...initialValueEmbeds,
  ...initialValueMentions,
  ...initialValueImages,
];

export const AllPlugins = () => {
  const plugins: any[] = [];

  if (boolean('BlockPlugin', true)) plugins.push(BlockPlugin());
  if (boolean('BlockquotePlugin', true)) plugins.push(BlockquotePlugin());
  if (boolean('BoldPlugin', true)) plugins.push(BoldPlugin());
  if (boolean('CheckListPlugin', true)) plugins.push(CheckListPlugin());
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin());
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin());
  if (boolean('InlineCodePlugin', true)) plugins.push(InlineCodePlugin());
  if (boolean('ItalicPlugin', true)) plugins.push(ItalicPlugin());
  if (boolean('LinkPlugin', true)) plugins.push(LinkPlugin());
  if (boolean('ListPlugin', true)) plugins.push(ListPlugin());
  if (boolean('MentionPlugin', true)) plugins.push(MentionPlugin());
  if (boolean('SearchHighlightPlugin', true))
    plugins.push(SearchHighlightPlugin());
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin());
  if (boolean('UnderlinePlugin', true)) plugins.push(UnderlinePlugin());
  if (boolean('VideoPlugin', true)) plugins.push(VideoPlugin());

  const createReactEditor = () => () => {
    const decorate: any = [];
    const renderElement: any = [];
    const renderLeaf: any = [];
    const onKeyDown: any = [];

    const [value, setValue] = useState(initialValue);

    const editor = useMemo(
      () =>
        withVideo(
          withChecklist(
            withMention(
              withImage(
                withList(
                  withPasteHtml(
                    withLink(withTable(withHistory(withReact(createEditor()))))
                  )
                )
              )
            )
          )
        ),
      []
    );

    const [search, setSearchHighlight] = useState('');

    if (boolean('decorateSearchHighlight', true))
      decorate.push(decorateSearchHighlight({ search }));

    const { target, setTarget, index, setIndex, setSearch, chars } = useMention(
      {
        characters: CHARACTERS,
        maxSuggestions: 10,
      }
    );

    if (boolean('onKeyDownMentions', true))
      onKeyDown.push(
        onKeyDownMention({
          chars,
          index,
          target,
          setIndex,
          setTarget,
        })
      );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => {
          setValue(newValue);
          onChangeMention({
            editor,
            setTarget,
            setSearch,
            setIndex,
          });
        }}
      >
        <ToolbarSearchHighlight setSearch={setSearchHighlight} />
        <StyledToolbar height={18}>
          <MarkButton format="bold" icon={<FormatBold />} />
          <MarkButton format="italic" icon={<FormatItalic />} />
          <MarkButton format="underline" icon={<FormatUnderlined />} />
          <MarkButton format="code" icon={<Code />} />
          <BlockButton format="heading-one" icon={<LooksOne />} />
          <BlockButton format="heading-two" icon={<LooksTwo />} />
          <BlockButton format="block-quote" icon={<FormatQuote />} />
          <ListButton format="numbered-list" icon={<FormatListNumbered />} />
          <ListButton format="bulleted-list" icon={<FormatListBulleted />} />
          <InsertImageButton />
          <LinkButton />
        </StyledToolbar>
        <HoveringToolbar />
        <EditablePlugins
          plugins={plugins}
          decorate={decorate}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          placeholder="Enter some plain text..."
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};

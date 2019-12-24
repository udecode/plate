import React, { useMemo, useState } from 'react';
import {
  Code,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatStrikethrough,
  FormatUnderlined,
  LooksOne,
  LooksTwo,
} from '@material-ui/icons';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  ActionItemPlugin,
  BlockButton,
  BLOCKQUOTE,
  BlockquotePlugin,
  BoldPlugin,
  decorateSearchHighlight,
  EditablePlugins,
  HeadingPlugin,
  HeadingType,
  HoveringToolbar,
  ImagePlugin,
  InlineCodePlugin,
  InsertImageButton,
  ItalicPlugin,
  LinkButton,
  LinkPlugin,
  ListButton,
  ListPlugin,
  ListType,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  MarkButton,
  MentionPlugin,
  MentionSelect,
  onChangeMention,
  onKeyDownMention,
  ParagraphPlugin,
  SearchHighlightPlugin,
  TablePlugin,
  ToolbarHeader,
  ToolbarSearchHighlight,
  UnderlinePlugin,
  useMention,
  VideoPlugin,
  withActionItem,
  withImage,
  withLink,
  withList,
  withMention,
  withPasteHtml,
  withTable,
  withVideo,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { CHARACTERS } from 'stories/config/data';
import {
  initialValueActionItem,
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
  ...initialValueActionItem,
  ...initialValueEmbeds,
  ...initialValueMentions,
  ...initialValueImages,
];

export const AllPlugins = () => {
  const plugins: any[] = [];

  if (boolean('BlockquotePlugin', true)) plugins.push(BlockquotePlugin());
  if (boolean('BoldPlugin', true)) plugins.push(BoldPlugin());
  if (boolean('ActionItemPlugin', true)) plugins.push(ActionItemPlugin());
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin());
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin());
  if (boolean('InlineCodePlugin', true)) plugins.push(InlineCodePlugin());
  if (boolean('ItalicPlugin', true)) plugins.push(ItalicPlugin());
  if (boolean('LinkPlugin', true)) plugins.push(LinkPlugin());
  if (boolean('ListPlugin', true)) plugins.push(ListPlugin());
  if (boolean('MentionPlugin', true)) plugins.push(MentionPlugin());
  if (boolean('ParagraphPlugin', true)) plugins.push(ParagraphPlugin());
  if (boolean('SearchHighlightPlugin', true))
    plugins.push(SearchHighlightPlugin());
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin());
  if (boolean('UnderlinePlugin', true)) plugins.push(UnderlinePlugin());
  if (boolean('VideoPlugin', true)) plugins.push(VideoPlugin());

  const createReactEditor = () => () => {
    const decorate: any = [];
    const onKeyDown: any = [];

    const [value, setValue] = useState(initialValue);

    const editor = useMemo(
      () =>
        withVideo(
          withActionItem(
            withMention(
              withImage(
                withList(
                  withPasteHtml(plugins)(
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
        <ToolbarHeader height={18}>
          <BlockButton format={HeadingType.H1} icon={<LooksOne />} />
          <BlockButton format={HeadingType.H2} icon={<LooksTwo />} />
          <MarkButton format={MARK_BOLD} icon={<FormatBold />} />
          <MarkButton format={MARK_ITALIC} icon={<FormatItalic />} />
          <MarkButton format={MARK_UNDERLINE} icon={<FormatUnderlined />} />
          <MarkButton
            format={MARK_STRIKETHROUGH}
            icon={<FormatStrikethrough />}
          />
          <MarkButton format={MARK_CODE} icon={<Code />} />
          <ListButton format={ListType.UL_LIST} icon={<FormatListBulleted />} />
          <ListButton format={ListType.OL_LIST} icon={<FormatListNumbered />} />
          <LinkButton />
          <InsertImageButton />
          <BlockButton format={BLOCKQUOTE} icon={<FormatQuote />} />
        </ToolbarHeader>
        <HoveringToolbar />
        {target && chars.length > 0 && (
          <MentionSelect target={target} index={index} chars={chars} />
        )}
        <EditablePlugins
          plugins={plugins}
          decorate={decorate}
          onKeyDown={onKeyDown}
          placeholder="Enter some plain text..."
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};

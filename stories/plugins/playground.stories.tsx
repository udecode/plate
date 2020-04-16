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
  Image,
  Link,
  LooksOne,
  LooksTwo,
  Search,
} from '@material-ui/icons';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  ACTION_ITEM,
  ActionItemPlugin,
  BLOCKQUOTE,
  BlockquotePlugin,
  BoldPlugin,
  decorateSearchHighlight,
  EditablePlugins,
  HeadingPlugin,
  HeadingToolbar,
  HeadingType,
  HoveringToolbar,
  ImagePlugin,
  InlineCodePlugin,
  ItalicPlugin,
  LinkPlugin,
  ListPlugin,
  ListType,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  MentionPlugin,
  MentionSelect,
  onChangeMention,
  onKeyDownMention,
  ParagraphPlugin,
  SearchHighlightPlugin,
  SoftBreakPlugin,
  TablePlugin,
  ToolbarBlock,
  ToolbarImage,
  ToolbarLink,
  ToolbarList,
  ToolbarMark,
  ToolbarSearchHighlight,
  UnderlinePlugin,
  useMention,
  VideoPlugin,
  withBlock,
  withBreakEmptyReset,
  withDeleteStartReset,
  withImage,
  withLink,
  withList,
  withMention,
  withPasteHtml,
  withShortcuts,
  withTable,
  withVideo,
} from '../../packages/slate-plugins/src';
import { CHARACTERS } from '../config/data';
import {
  initialValueActionItem,
  initialValueEmbeds,
  initialValueImages,
  initialValueMentions,
  initialValueRichText,
} from '../config/initialValues';

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

const resetOptions = {
  types: [ACTION_ITEM, BLOCKQUOTE],
};

export const Plugins = () => {
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
  if (boolean('SoftBreakPlugin', true)) plugins.push(SoftBreakPlugin());

  const createReactEditor = () => () => {
    const decorate: any = [];
    const onKeyDown: any = [];

    const [value, setValue] = useState(initialValue);

    const editor = useMemo(
      () =>
        withShortcuts(
          withVideo(
            withList(
              withBreakEmptyReset(resetOptions)(
                withDeleteStartReset(resetOptions)(
                  withBlock(
                    withMention(
                      withImage(
                        withPasteHtml(plugins)(
                          withLink(
                            withTable(withHistory(withReact(createEditor())))
                          )
                        )
                      )
                    )
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
        <ToolbarSearchHighlight icon={Search} setSearch={setSearchHighlight} />
        <HeadingToolbar>
          <ToolbarBlock format={HeadingType.H1} icon={<LooksOne />} />
          <ToolbarBlock format={HeadingType.H2} icon={<LooksTwo />} />
          <ToolbarMark format={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarMark format={MARK_ITALIC} icon={<FormatItalic />} />
          <ToolbarMark format={MARK_UNDERLINE} icon={<FormatUnderlined />} />
          <ToolbarMark
            format={MARK_STRIKETHROUGH}
            icon={<FormatStrikethrough />}
          />
          <ToolbarMark format={MARK_CODE} icon={<Code />} />
          <ToolbarList
            format={ListType.UL_LIST}
            icon={<FormatListBulleted />}
          />
          <ToolbarList
            format={ListType.OL_LIST}
            icon={<FormatListNumbered />}
          />
          <ToolbarLink icon={<Link />} />
          <ToolbarImage icon={<Image />} />
          <ToolbarBlock format={BLOCKQUOTE} icon={<FormatQuote />} />
        </HeadingToolbar>
        <HoveringToolbar>
          <ToolbarMark reversed format={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarMark reversed format={MARK_ITALIC} icon={<FormatItalic />} />
          <ToolbarMark
            reversed
            format={MARK_UNDERLINE}
            icon={<FormatUnderlined />}
          />
        </HoveringToolbar>
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

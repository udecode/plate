import React, { useCallback, useMemo, useState } from 'react';
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
  BlockquotePlugin,
  BoldPlugin,
  CheckListPlugin,
  EditablePlugins,
  ForcedLayoutPlugin,
  HeadingPlugin,
  HoveringToolbar,
  ImagePlugin,
  InlineCodePlugin,
  InsertImageButton,
  ItalicPlugin,
  LinkButton,
  LinkPlugin,
  ListPlugin,
  MarkButton,
  MarkdownPreviewPlugin,
  MarkdownShortcutsPlugin,
  MarkPlugin,
  MentionPlugin,
  onChangeMention,
  onKeyDownMention,
  PasteHtmlPlugin,
  StyledToolbar,
  TablePlugin,
  ToolbarSearchHighlight,
  UnderlinePlugin,
  useCreateEditor,
  useMention,
  VideoPlugin,
} from 'slate-plugins';
import { BlockPlugin } from 'slate-plugins/elements/BlockPlugin';
import { ListButton } from 'slate-plugins/elements/list/ListButton';
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
  const [search, setSearchHighlight] = useState('');

  const plugins: SlatePlugin[] = [];
  const renderElement: any = [];
  const renderLeaf: any = [];
  const onKeyDown: any = [];
  if (boolean('BlockPlugin', true)) plugins.push(BlockPlugin());
  if (boolean('BlockquotePlugin', true)) plugins.push(BlockquotePlugin());
  if (boolean('BoldPlugin', true)) plugins.push(BoldPlugin());
  if (boolean('CheckListPlugin', true)) plugins.push(CheckListPlugin());
  // if (boolean('ForcedLayoutPlugin', true)) plugins.push(ForcedLayoutPlugin());
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin());
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin());
  if (boolean('InlineCodePlugin', true)) plugins.push(InlineCodePlugin());
  if (boolean('ItalicPlugin', true)) plugins.push(ItalicPlugin());
  if (boolean('LinkPlugin', true)) plugins.push(LinkPlugin());
  if (boolean('ListPlugin', true)) plugins.push(ListPlugin());
  if (boolean('MarkPlugin', true)) plugins.push(MarkPlugin());
  if (boolean('MarkdownShortcutsPlugin', true))
    plugins.push(MarkdownShortcutsPlugin());
  if (boolean('MentionPlugin', true)) plugins.push(MentionPlugin());
  if (boolean('PasteHtmlPlugin', true)) plugins.push(PasteHtmlPlugin());
  if (boolean('SearchHighlightPlugin', true))
    plugins.push(SearchHighlightPlugin({ search }));
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin());
  if (boolean('UnderlinePlugin', true)) plugins.push(UnderlinePlugin());
  if (boolean('VideoPlugin', true)) plugins.push(VideoPlugin());

  const createReactEditor = useCallback(() => {
    console.log(plugins.length);
    return useCallback(() => {
      console.log('whuu');
      const [value, setValue] = useState(initialValue);
      const editor = useCreateEditor([withReact, withHistory], plugins);
      const {
        target,
        setTarget,
        index,
        setIndex,
        setSearch,
        chars,
      } = useMention({
        characters: CHARACTERS,
        maxSuggestions: 10,
      });
      if (boolean('onKeyDownMentions', true))
        onKeyDown.push((e: any) =>
          onKeyDownMention(e, editor, {
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
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={onKeyDown}
            placeholder="Enter some plain text..."
          />
        </Slate>
      );
    }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Editor = createReactEditor();

  return <Editor />;
};

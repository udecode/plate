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
import { Editor, Range } from 'slate';
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
  MentionPlugin,
  onKeyDownMention,
  PasteHtmlPlugin,
  StyledToolbar,
  TablePlugin,
  UnderlinePlugin,
  useCreateEditor,
  VideoPlugin,
} from 'slate-plugins';
import { BlockPlugin } from 'slate-plugins/elements/BlockPlugin';
import { ListButton } from 'slate-plugins/elements/list/ListButton';
import { Slate, withReact } from 'slate-react';
import { CHARACTERS } from 'stories/config/data';
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
  if (boolean('MarkdownShortcutsPlugin', true))
    plugins.push(MarkdownShortcutsPlugin());
  if (boolean('MentionPlugin', true)) plugins.push(MentionPlugin());
  if (boolean('PasteHtmlPlugin', true)) plugins.push(PasteHtmlPlugin());
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin());
  if (boolean('UnderlinePlugin', true)) plugins.push(UnderlinePlugin());
  if (boolean('VideoPlugin', true)) plugins.push(VideoPlugin());

  // if (boolean('renderElementFormat', false))
  //   renderElement.push(renderElementFormat);
  // if (boolean('renderLeafFormat', false))
  //   renderLeaf.push(renderLeafFormat);

  // if (boolean('onDOMBeforeInputFormat', false, 'onDOMBeforeInput'))
  //   onDOMBeforeInput.push(onDOMBeforeInputFormat);

  const [value, setValue] = useState([
    ...initialValueRichText,
    ...initialValueCheckLists,
    ...initialValueEmbeds,
    ...initialValueMentions,
    ...initialValueImages,
  ]);

  const [target, setTarget] = useState<Range | null>();
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');

  const chars = CHARACTERS.filter(c =>
    c.toLowerCase().startsWith(search.toLowerCase())
  ).slice(0, 10);

  const editor = useCreateEditor([withReact, withHistory], plugins);

  if (boolean('onKeyDownMentions', false, 'onKeyDown'))
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
    <>
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => {
          setValue(newValue);

          const { selection } = editor;

          // mentions
          if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection);
            const wordBefore = Editor.before(editor, start, { unit: 'word' });
            const before = wordBefore && Editor.before(editor, wordBefore);
            const beforeRange = before && Editor.range(editor, before, start);
            const beforeText = beforeRange && Editor.text(editor, beforeRange);
            const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);
            const after = Editor.after(editor, start);
            const afterRange = Editor.range(editor, start, after);
            const afterText = Editor.text(editor, afterRange);
            const afterMatch = afterText.match(/^(\s|$)/);

            if (beforeMatch && afterMatch) {
              setTarget(beforeRange);
              setSearch(beforeMatch[1]);
              setIndex(0);
              return;
            }
          }

          setTarget(null);
        }}
      >
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
          onDOMBeforeInput={onDOMBeforeInput}
          placeholder="Enter some plain text..."
        />
      </Slate>
    </>
  );
};

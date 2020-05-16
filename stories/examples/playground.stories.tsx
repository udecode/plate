import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
import { Subscript, Superscript } from '@styled-icons/foundation';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatStrikethrough,
  FormatUnderlined,
  Image,
  Link,
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
  Search,
} from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  ActionItemPlugin,
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  decorateSearchHighlight,
  EditablePlugins,
  HeadingPlugin,
  HeadingToolbar,
  HighlightPlugin,
  HoveringToolbar,
  ImagePlugin,
  InlineCodePlugin,
  ItalicPlugin,
  LinkPlugin,
  ListPlugin,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  MentionPlugin,
  ParagraphPlugin,
  SearchHighlightPlugin,
  SoftBreakPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  TablePlugin,
  ToolbarBlock,
  ToolbarCode,
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
  withDeserializeHtml,
  withImage,
  withLink,
  withList,
  withMention,
  withShortcuts,
  withTable,
  withVoid,
} from '../../packages/slate-plugins/src';
import { CHARACTERS } from '../config/data';
import {
  initialValueActionItem,
  initialValueElements,
  initialValueEmbeds,
  initialValueImages,
  initialValueMarks,
  initialValueMentions,
  initialValueVoids,
  nodeTypes,
} from '../config/initialValues';
import { EditableVoidPlugin } from '../element/block-void/editable-voids/EditableVoidPlugin';
import { EDITABLE_VOID } from '../element/block-void/editable-voids/types';

export default {
  title: 'Examples/Playground',
};

const initialValue = [
  ...initialValueMarks,
  ...initialValueElements,
  ...initialValueActionItem,
  ...initialValueEmbeds,
  ...initialValueMentions,
  ...initialValueImages,
  ...initialValueVoids,
];

const resetOptions = {
  ...nodeTypes,
  types: [nodeTypes.typeActionItem, nodeTypes.typeBlockquote],
};

export const Plugins = () => {
  const plugins: any[] = [];

  if (boolean('ParagraphPlugin', true))
    plugins.push(ParagraphPlugin(nodeTypes));
  if (boolean('BlockquotePlugin', true))
    plugins.push(BlockquotePlugin(nodeTypes));
  if (boolean('ActionItemPlugin', true))
    plugins.push(ActionItemPlugin(nodeTypes));
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin(nodeTypes));
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin(nodeTypes));
  if (boolean('LinkPlugin', true)) plugins.push(LinkPlugin(nodeTypes));
  if (boolean('ListPlugin', true)) plugins.push(ListPlugin(nodeTypes));
  if (boolean('MentionPlugin', true)) plugins.push(MentionPlugin(nodeTypes));
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin(nodeTypes));
  if (boolean('VideoPlugin', true)) plugins.push(VideoPlugin(nodeTypes));
  if (boolean('CodePlugin', true)) plugins.push(CodePlugin(nodeTypes));
  if (boolean('BoldPlugin', true)) plugins.push(BoldPlugin(nodeTypes));
  if (boolean('InlineCodePlugin', true))
    plugins.push(InlineCodePlugin(nodeTypes));
  if (boolean('ItalicPlugin', true)) plugins.push(ItalicPlugin(nodeTypes));
  if (boolean('HighlightPlugin', true))
    plugins.push(HighlightPlugin(nodeTypes));
  if (boolean('SearchHighlightPlugin', true))
    plugins.push(SearchHighlightPlugin(nodeTypes));
  if (boolean('UnderlinePlugin', true))
    plugins.push(UnderlinePlugin(nodeTypes));
  if (boolean('StrikethroughPlugin', true))
    plugins.push(StrikethroughPlugin(nodeTypes));
  if (boolean('SubscriptPlugin', true))
    plugins.push(SubscriptPlugin(nodeTypes));
  if (boolean('SuperscriptPlugin', true))
    plugins.push(SuperscriptPlugin(nodeTypes));
  if (boolean('EditableVoidPlugin', true))
    plugins.push(EditableVoidPlugin(nodeTypes));
  if (boolean('SoftBreakPlugin', true)) plugins.push(SoftBreakPlugin());

  const createReactEditor = () => () => {
    const decorate: any = [];
    const onKeyDown: any = [];

    const [value, setValue] = useState(initialValue);

    const editor = useMemo(
      () =>
        withVoid([EDITABLE_VOID, nodeTypes.typeVideo])(
          withShortcuts(nodeTypes)(
            withList(nodeTypes)(
              withBreakEmptyReset(resetOptions)(
                withDeleteStartReset(resetOptions)(
                  withBlock(nodeTypes)(
                    withMention(nodeTypes)(
                      withImage(nodeTypes)(
                        withDeserializeHtml(plugins)(
                          withLink(nodeTypes)(
                            withTable(nodeTypes)(
                              withHistory(withReact(createEditor()))
                            )
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

    const {
      MentionSelectComponent,
      onChangeMention,
      onKeyDownMention,
    } = useMention({
      characters: CHARACTERS,
      maxSuggestions: 10,
    });

    if (boolean('onKeyDownMentions', true)) onKeyDown.push(onKeyDownMention);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);

          onChangeMention({ editor });
        }}
      >
        <ToolbarSearchHighlight icon={Search} setSearch={setSearchHighlight} />
        <HeadingToolbar>
          <ToolbarBlock type={nodeTypes.typeH1} icon={<LooksOne />} />
          <ToolbarBlock type={nodeTypes.typeH2} icon={<LooksTwo />} />
          <ToolbarBlock type={nodeTypes.typeH3} icon={<Looks3 />} />
          <ToolbarBlock type={nodeTypes.typeH4} icon={<Looks4 />} />
          <ToolbarBlock type={nodeTypes.typeH5} icon={<Looks5 />} />
          <ToolbarBlock type={nodeTypes.typeH6} icon={<Looks6 />} />
          <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarMark type={MARK_ITALIC} icon={<FormatItalic />} />
          <ToolbarMark type={MARK_UNDERLINE} icon={<FormatUnderlined />} />
          <ToolbarMark
            type={MARK_STRIKETHROUGH}
            icon={<FormatStrikethrough />}
          />
          <ToolbarMark type={MARK_CODE} icon={<CodeAlt />} />
          <ToolbarMark
            type={MARK_SUPERSCRIPT}
            clear={MARK_SUBSCRIPT}
            icon={<Superscript />}
          />
          <ToolbarMark
            type={MARK_SUBSCRIPT}
            clear={MARK_SUPERSCRIPT}
            icon={<Subscript />}
          />
          <ToolbarLink {...nodeTypes} icon={<Link />} />
          <ToolbarList
            {...nodeTypes}
            typeList={nodeTypes.typeUl}
            icon={<FormatListBulleted />}
          />
          <ToolbarList
            {...nodeTypes}
            typeList={nodeTypes.typeOl}
            icon={<FormatListNumbered />}
          />
          <ToolbarBlock
            type={nodeTypes.typeBlockquote}
            icon={<FormatQuote />}
          />
          <ToolbarCode {...nodeTypes} icon={<CodeBlock />} />
          <ToolbarImage {...nodeTypes} icon={<Image />} />
        </HeadingToolbar>
        <HoveringToolbar>
          <ToolbarMark reversed type={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarMark reversed type={MARK_ITALIC} icon={<FormatItalic />} />
          <ToolbarMark
            reversed
            type={MARK_UNDERLINE}
            icon={<FormatUnderlined />}
          />
        </HoveringToolbar>
        <MentionSelectComponent />
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
